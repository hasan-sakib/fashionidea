"""Shared FastAPI dependencies: DB session, tenant resolution, current user.

These are the injection seams that keep features decoupled — routes declare what
they need (a tenant, an authenticated user, a specific role) and get it here.
"""

import uuid
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.security import decode_access_token
from app.crud import tenant as tenant_crud
from app.models.enums import UserRole
from app.models.tenant import Tenant
from app.models.user import User

# Reserved subdomain labels that never map to a tenant.
RESERVED_SUBDOMAINS = {"api", "www", "traefik", "app", "localhost", "admin", "static", "assets"}

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=True
)

SessionDep = Annotated[Session, Depends(get_db)]


def extract_subdomain(host: str, domain: str) -> str | None:
    """Return the tenant slug from a Host header, or None.

    ``designer1.localhost`` -> ``designer1``; ``localhost`` / ``api.localhost`` -> None.
    """
    host = (host or "").split(":")[0].strip().lower()
    if not host or not host.endswith(domain):
        return None
    prefix = host[: -len(domain)].rstrip(".")
    if not prefix:
        return None
    label = prefix.split(".")[0]
    if not label or label in RESERVED_SUBDOMAINS:
        return None
    return label


def resolve_tenant(
    request: Request, session: Session, x_tenant_id: str | None
) -> Tenant | None:
    """Resolve the active tenant: subdomain first, then X-Tenant-ID header.

    Returns None when no active tenant can be resolved (used by endpoints where a
    tenant is optional, e.g. login). Header value may be a slug or a UUID.
    """
    slug = extract_subdomain(request.headers.get("host", ""), settings.DOMAIN)
    tenant: Tenant | None = None
    if slug:
        tenant = tenant_crud.get_by_slug(session, slug)
    if tenant is None and x_tenant_id:
        tenant = tenant_crud.get_by_slug(session, x_tenant_id) or tenant_crud.get_by_id_str(
            session, x_tenant_id
        )
    if tenant is not None and tenant.is_active:
        return tenant
    return None


def get_current_tenant(
    request: Request,
    session: SessionDep,
    x_tenant_id: Annotated[str | None, Header()] = None,
) -> Tenant:
    """Strict tenant dependency for tenant-scoped routes; 400 if unresolved."""
    tenant = resolve_tenant(request, session, x_tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tenant_required")
    return tenant


TenantDep = Annotated[Tenant, Depends(get_current_tenant)]


def get_current_user(
    session: SessionDep, token: Annotated[str, Depends(reusable_oauth2)]
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exc
        user_id = uuid.UUID(subject)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exc

    user = session.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_exc
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: UserRole):
    """Dependency factory enforcing that the current user has one of ``roles``."""

    def checker(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="insufficient_role"
            )
        return current_user

    return checker


# Designer-or-admin guard for the dashboard routes added in Phase 3.
CurrentDesigner = Annotated[User, Depends(require_roles(UserRole.designer, UserRole.admin))]
