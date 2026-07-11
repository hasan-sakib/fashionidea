"""Public marketplace DTOs (published looks across all tenants)."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class DesignerRef(BaseModel):
    slug: str
    name: str


class MarketplaceLook(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    image_url: str
    price: Decimal | None
    created_at: datetime
    designer: DesignerRef
