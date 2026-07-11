"""Consumer moodboard DTOs."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.marketplace import MarketplaceLook


class MoodboardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class MoodboardUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class MoodboardPublic(BaseModel):
    id: uuid.UUID
    name: str
    item_count: int
    created_at: datetime
    updated_at: datetime


class MoodboardDetail(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime
    looks: list[MarketplaceLook]


class MoodboardItemCreate(BaseModel):
    look_id: uuid.UUID
