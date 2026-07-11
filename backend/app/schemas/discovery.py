"""DTOs for the public discovery surfaces: designers, lookbooks, search, vocab."""

import uuid

from pydantic import BaseModel

from app.schemas.marketplace import DesignerRef, MarketplaceLook


class DesignerCard(BaseModel):
    slug: str
    name: str
    look_count: int
    cover_image: str | None


class Lookbook(BaseModel):
    id: uuid.UUID
    title: str
    season: str | None
    designer: DesignerRef
    preview_images: list[str]


class SearchResults(BaseModel):
    designers: list[DesignerCard]
    looks: list[MarketplaceLook]
    occasions: list[str]
    categories: list[str]


class Vocab(BaseModel):
    occasions: list[str]
    categories: list[str]
