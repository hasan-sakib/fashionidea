"""Request/response DTOs for Collections and Looks (designs)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

# --- Collections -------------------------------------------------------------


class CollectionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    season: str | None = Field(default=None, max_length=100)
    is_published: bool = False


class CollectionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    season: str | None = Field(default=None, max_length=100)
    is_published: bool | None = None


class CollectionPublic(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    season: str | None
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Looks (designs) ---------------------------------------------------------


class LookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    image_url: str = Field(min_length=1, max_length=1024)
    category: str | None = Field(default=None, max_length=100)
    occasions: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    collection_id: uuid.UUID | None = None
    is_published: bool = False


class LookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    image_url: str | None = Field(default=None, min_length=1, max_length=1024)
    category: str | None = Field(default=None, max_length=100)
    occasions: list[str] | None = None
    tags: list[str] | None = None
    collection_id: uuid.UUID | None = None
    is_published: bool | None = None


class LookPublic(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    image_url: str
    category: str | None
    occasions: list[str]
    tags: list[str]
    collection_id: uuid.UUID | None
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UploadResult(BaseModel):
    url: str
