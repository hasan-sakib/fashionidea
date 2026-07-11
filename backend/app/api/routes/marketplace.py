"""Public global marketplace: published looks aggregated across all tenants."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.crud import marketplace as crud
from app.models.look import Look
from app.models.tenant import Tenant
from app.schemas.common import Page
from app.schemas.marketplace import DesignerRef, MarketplaceLook

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


def to_marketplace_look(look: Look, tenant: Tenant) -> MarketplaceLook:
    return MarketplaceLook(
        id=look.id,
        title=look.title,
        description=look.description,
        image_url=look.image_url,
        price=look.price,
        created_at=look.created_at,
        designer=DesignerRef(slug=tenant.slug, name=tenant.name),
    )


@router.get("/looks/", response_model=Page[MarketplaceLook])
def list_marketplace_looks(
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    rows = crud.list_looks(session, skip, limit)
    return Page(
        data=[to_marketplace_look(look, tenant) for look, tenant in rows],
        count=crud.count_looks(session),
    )
