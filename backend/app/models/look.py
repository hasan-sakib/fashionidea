"""Look: a tenant-scoped catalog item (garment/outfit) with imagery."""

import uuid
from decimal import Decimal

from sqlalchemy import Column, Numeric
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
    price: Decimal | None = Field(
        default=None, sa_column=Column(Numeric(10, 2), nullable=True)
    )
    is_published: bool = Field(default=False, index=True)
