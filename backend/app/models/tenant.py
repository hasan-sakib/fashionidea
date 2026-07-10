"""Tenant: a designer's account/storefront and the multi-tenancy isolation key."""

from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase


class Tenant(UUIDBase, TimestampBase, table=True):
    __tablename__ = "tenants"

    # The subdomain label (designer1 -> designer1.localhost). Unique + indexed:
    # resolved on every storefront request.
    slug: str = Field(index=True, unique=True, max_length=63)
    name: str = Field(max_length=255)
    is_active: bool = Field(default=True)
