"""Public discovery feed: published designs aggregated across all designers.

Supports occasion-first browsing via ``?occasion=`` / ``?category=`` / ``?q=`` filters.
``to_marketplace_look`` is the shared (Look, Tenant) -> DTO builder reused by
moodboards and search.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import SessionDep
from app.crud import marketplace as crud
from app.models.look import Look
from app.models.tenant import Tenant
from app.schemas.common import Page
from app.schemas.marketplace import DesignerRef, MarketplaceLook

router = APIRouter(prefix="/discover", tags=["discover"])


def to_marketplace_look(look: Look, tenant: Tenant) -> MarketplaceLook:
    return MarketplaceLook(
        id=look.id,
        title=look.title,
        description=look.description,
        image_url=look.image_url,
        category=look.category,
        occasions=look.occasions,
        tags=look.tags,
        created_at=look.created_at,
        designer=DesignerRef(slug=tenant.slug, name=tenant.name),
    )


@router.get("/looks/", response_model=Page[MarketplaceLook])
def list_discover_looks(
    session: SessionDep,
    occasion: Annotated[str | None, Query()] = None,
    category: Annotated[str | None, Query()] = None,
    q: Annotated[str | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    rows = crud.list_looks(session, skip, limit, occasion=occasion, category=category, q=q)
    return Page(
        data=[to_marketplace_look(look, tenant) for look, tenant in rows],
        count=crud.count_looks(session, occasion=occasion, category=category, q=q),
    )


@router.get("/looks/{look_id}", response_model=MarketplaceLook)
def get_discover_look(look_id: uuid.UUID, session: SessionDep):
    """Public design detail for the discovery detail view."""
    row = crud.get_look(session, look_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="design_not_found")
    return to_marketplace_look(*row)
