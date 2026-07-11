"""Look: a tenant-scoped design (garment/outfit) with imagery and categorization."""

import uuid

from sqlalchemy import ARRAY, Column, String
from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase


class Look(UUIDBase, TimestampBase, table=True):
    __tablename__ = "looks"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True, nullable=False)
    collection_id: uuid.UUID | None = Field(
        default=None, foreign_key="collections.id", index=True, nullable=True
    )
    title: str = Field(max_length=255)
    description: str | None = Field(default=None)
    image_url: str = Field(max_length=1024)

    # Categorization powering occasion-first discovery.
    category: str | None = Field(default=None, max_length=100, index=True)  # dress type
    occasions: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), nullable=False, server_default="{}")
    )
    tags: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), nullable=False, server_default="{}")
    )

    is_published: bool = Field(default=False, index=True)
