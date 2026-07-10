"""Shared model mixins: UUID primary key and created/updated timestamps.

These are non-table SQLModel base classes; concrete tables inherit them with
``table=True`` and add their own columns.
"""

import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    """Timezone-aware UTC now (used for created_at / updated_at defaults)."""
    return datetime.now(timezone.utc)


class UUIDBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class TimestampBase(SQLModel):
    created_at: datetime = Field(default_factory=utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": utcnow},
    )
