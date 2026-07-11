"""Consumer moodboards: save/organize looks from across the marketplace.

All routes require an authenticated user and are scoped to that user's boards.
"""

import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.marketplace import to_marketplace_look
from app.crud import look as look_crud
from app.crud import moodboard as crud
from app.schemas.moodboard import (
    MoodboardCreate,
    MoodboardDetail,
    MoodboardItemCreate,
    MoodboardPublic,
    MoodboardUpdate,
)

router = APIRouter(prefix="/moodboards", tags=["moodboards"])


def _public(mb, item_count: int) -> MoodboardPublic:
    return MoodboardPublic(
        id=mb.id,
        name=mb.name,
        item_count=item_count,
        created_at=mb.created_at,
        updated_at=mb.updated_at,
    )


def _require(session, user, moodboard_id: uuid.UUID):
    mb = crud.get(session, user, moodboard_id)
    if mb is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="moodboard_not_found")
    return mb


@router.post("/", response_model=MoodboardPublic, status_code=status.HTTP_201_CREATED)
def create_moodboard(body: MoodboardCreate, user: CurrentUser, session: SessionDep):
    return _public(crud.create(session, user, body.name), 0)


@router.get("/", response_model=list[MoodboardPublic])
def list_moodboards(user: CurrentUser, session: SessionDep):
    return [_public(mb, count) for mb, count in crud.list_with_counts(session, user)]


@router.get("/{moodboard_id}", response_model=MoodboardDetail)
def get_moodboard(moodboard_id: uuid.UUID, user: CurrentUser, session: SessionDep):
    mb = _require(session, user, moodboard_id)
    looks = [to_marketplace_look(look, tenant) for look, tenant in crud.list_looks(session, mb)]
    return MoodboardDetail(
        id=mb.id, name=mb.name, created_at=mb.created_at, updated_at=mb.updated_at, looks=looks
    )


@router.patch("/{moodboard_id}", response_model=MoodboardPublic)
def rename_moodboard(
    moodboard_id: uuid.UUID, body: MoodboardUpdate, user: CurrentUser, session: SessionDep
):
    mb = _require(session, user, moodboard_id)
    crud.rename(session, mb, body.name)
    _, count = next(
        ((m, c) for m, c in crud.list_with_counts(session, user) if m.id == mb.id), (mb, 0)
    )
    return _public(mb, count)


@router.delete("/{moodboard_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_moodboard(moodboard_id: uuid.UUID, user: CurrentUser, session: SessionDep):
    crud.delete(session, _require(session, user, moodboard_id))


@router.post("/{moodboard_id}/items", response_model=MoodboardDetail, status_code=status.HTTP_201_CREATED)
def add_item(
    moodboard_id: uuid.UUID, body: MoodboardItemCreate, user: CurrentUser, session: SessionDep
):
    mb = _require(session, user, moodboard_id)
    if look_crud.get_public(session, body.look_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="look_not_available")
    if crud.get_item(session, mb, body.look_id) is None:
        crud.add_item(session, mb, body.look_id)
    looks = [to_marketplace_look(look, tenant) for look, tenant in crud.list_looks(session, mb)]
    return MoodboardDetail(
        id=mb.id, name=mb.name, created_at=mb.created_at, updated_at=mb.updated_at, looks=looks
    )


@router.delete("/{moodboard_id}/items/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item(
    moodboard_id: uuid.UUID, look_id: uuid.UUID, user: CurrentUser, session: SessionDep
):
    mb = _require(session, user, moodboard_id)
    item = crud.get_item(session, mb, look_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="item_not_found")
    crud.remove_item(session, item)
