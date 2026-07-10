"""CRUD helpers for users, including tenant-aware lookup and authentication."""

import uuid

from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User


def get_by_email(
    session: Session, email: str, tenant_id: uuid.UUID | None
) -> User | None:
    """Find a user by email within a tenant scope.

    ``tenant_id=None`` scopes to tenant-less accounts (consumers/admins).
    """
    stmt = select(User).where(User.email == email)
    if tenant_id is None:
        stmt = stmt.where(User.tenant_id.is_(None))  # type: ignore[union-attr]
    else:
        stmt = stmt.where(User.tenant_id == tenant_id)
    return session.exec(stmt).first()


def create(
    session: Session,
    *,
    email: str,
    password: str,
    role: UserRole,
    full_name: str | None = None,
    tenant_id: uuid.UUID | None = None,
) -> User:
    user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role,
        full_name=full_name,
        tenant_id=tenant_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate(
    session: Session, *, email: str, password: str, tenant_id: uuid.UUID | None
) -> User | None:
    user = get_by_email(session, email, tenant_id)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
