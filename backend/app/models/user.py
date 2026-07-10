"""User: an auth principal — a designer (belongs to a tenant), consumer, or admin."""

import uuid

from sqlalchemy import UniqueConstraint
from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase
from app.models.enums import UserRole


class User(UUIDBase, TimestampBase, table=True):
    __tablename__ = "users"
    # Email is unique *within* a tenant; consumers/admins (tenant_id NULL) are
    # kept unique by an application-level check plus this constraint.
    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),)

    # NULL for consumers/admins; set for designers.
    tenant_id: uuid.UUID | None = Field(
        default=None, foreign_key="tenants.id", index=True, nullable=True
    )
    email: str = Field(index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.consumer, index=True)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
