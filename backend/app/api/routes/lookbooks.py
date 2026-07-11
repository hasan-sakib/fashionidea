"""Public curated lookbooks (published collections across designers)."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.crud import lookbook as crud
from app.schemas.common import Page
from app.schemas.discovery import Lookbook
from app.schemas.marketplace import DesignerRef

router = APIRouter(prefix="/lookbooks", tags=["lookbooks"])


@router.get("/", response_model=Page[Lookbook])
def list_lookbooks(
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    rows = crud.list_lookbooks(session, skip, limit)
    return Page(
        data=[
            Lookbook(
                id=coll.id,
                title=coll.title,
                season=coll.season,
                designer=DesignerRef(slug=tenant.slug, name=tenant.name),
                preview_images=crud.preview_images(session, coll.id),
            )
            for coll, tenant in rows
        ],
        count=crud.count_lookbooks(session),
    )
