"""Public storefront DTOs (published catalog for a single tenant)."""

from pydantic import BaseModel

from app.schemas.catalog import CollectionPublic, LookPublic


class StorefrontTenant(BaseModel):
    slug: str
    name: str


class Storefront(BaseModel):
    tenant: StorefrontTenant
    collections: list[CollectionPublic]
    looks: list[LookPublic]
