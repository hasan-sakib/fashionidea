"""Public discovery DTOs (published designs across all designers)."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class DesignerRef(BaseModel):
    slug: str
    name: str


class MarketplaceLook(BaseModel):
    """A published design in the public feed, with its designer and categorization."""

    id: uuid.UUID
    title: str
    description: str | None
    image_url: str
    category: str | None
    occasions: list[str]
    tags: list[str]
    created_at: datetime
    designer: DesignerRef
