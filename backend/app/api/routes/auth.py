"""Authentication & registration routes for designers and consumers."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep, resolve_tenant
from app.core.security import create_access_token
from app.crud import tenant as tenant_crud
from app.crud import user as user_crud
from app.models.enums import UserRole
from app.schemas.auth import (
    RESERVED_SLUGS,
    ConsumerRegister,
    DesignerRegister,
    Token,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_for(user) -> Token:
    return Token(
        access_token=create_access_token(
            subject=user.id, role=user.role, tenant_id=user.tenant_id
        )
    )


@router.post("/register/designer", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_designer(body: DesignerRegister, session: SessionDep) -> Token:
    """Create a tenant + its designer account atomically, then return a token."""
    if body.tenant_slug in RESERVED_SLUGS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="slug_reserved")
    if tenant_crud.get_by_slug(session, body.tenant_slug) is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="slug_taken")

    tenant = tenant_crud.create(session, slug=body.tenant_slug, name=body.tenant_name)

    if user_crud.get_by_email(session, body.email, tenant.id) is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="email_taken")

    user = user_crud.create(
        session,
        email=body.email,
        password=body.password,
        role=UserRole.designer,
        full_name=body.full_name,
        tenant_id=tenant.id,
    )
    return _token_for(user)


@router.post("/register/consumer", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_consumer(body: ConsumerRegister, session: SessionDep) -> Token:
    """Create a tenant-less consumer account and return a token."""
    if user_crud.get_by_email(session, body.email, None) is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="email_taken")

    user = user_crud.create(
        session,
        email=body.email,
        password=body.password,
        role=UserRole.consumer,
        full_name=body.full_name,
        tenant_id=None,
    )
    return _token_for(user)


@router.post("/login", response_model=Token)
def login(
    request: Request,
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    x_tenant_id: Annotated[str | None, Header()] = None,
) -> Token:
    """OAuth2 password login.

    Tenant context (from subdomain or X-Tenant-ID) selects a designer account;
    with no tenant, a tenant-less consumer/admin is authenticated.
    """
    tenant = resolve_tenant(request, session, x_tenant_id)
    user = user_crud.authenticate(
        session,
        email=form_data.username,
        password=form_data.password,
        tenant_id=tenant.id if tenant else None,
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect_email_or_password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _token_for(user)


@router.get("/me", response_model=UserPublic)
def read_me(current_user: CurrentUser) -> UserPublic:
    return current_user  # type: ignore[return-value]
