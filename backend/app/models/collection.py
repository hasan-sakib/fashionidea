"""Collection: a tenant-scoped themed grouping of looks (e.g. a season)."""

import uuid

from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase


class Collection(UUIDBase, TimestampBase, table=True):
    __tablename__ = "collections"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True, nullable=False)
    title: str = Field(max_length=255)
    description: str | None = Field(default=None)
    season: str | None = Field(default=None, max_length=100)
    is_published: bool = Field(default=False, index=True)
