"""Consumer moodboards: a saved-looks board and its items.

Moodboards are owned by a user (typically a consumer) and may contain looks from
*any* tenant — this is a consumer-facing, cross-tenant feature, so items are NOT
tenant-scoped; they are scoped to the owning user.
"""

import uuid
from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase, utcnow


class Moodboard(UUIDBase, TimestampBase, table=True):
    __tablename__ = "moodboards"

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    name: str = Field(max_length=255)


class MoodboardItem(UUIDBase, table=True):
    __tablename__ = "moodboard_items"
    # A look can only be saved to a given board once.
    __table_args__ = (UniqueConstraint("moodboard_id", "look_id", name="uq_moodboard_look"),)

    moodboard_id: uuid.UUID = Field(
        foreign_key="moodboards.id", index=True, ondelete="CASCADE"
    )
    # If the underlying look is deleted, drop it from the board too.
    look_id: uuid.UUID = Field(foreign_key="looks.id", index=True, ondelete="CASCADE")
    created_at: datetime = Field(default_factory=utcnow, nullable=False)
