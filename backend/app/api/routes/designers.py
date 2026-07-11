"""Public designer directory."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.crud import designer as crud
from app.schemas.common import Page
from app.schemas.discovery import DesignerCard

router = APIRouter(prefix="/designers", tags=["designers"])


@router.get("/", response_model=Page[DesignerCard])
def list_designers(
    session: SessionDep,
    q: Annotated[str | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    rows = crud.list_designers(session, skip, limit, q)
    return Page(
        data=[
            DesignerCard(slug=t.slug, name=t.name, look_count=count, cover_image=cover)
            for t, count, cover in rows
        ],
        count=crud.count_designers(session, q),
    )
