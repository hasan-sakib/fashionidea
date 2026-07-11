"""Designer dashboard: tenant-isolated CRUD for Collections."""

import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import DesignerTenant, SessionDep
from app.crud import collection as crud
from app.schemas.catalog import CollectionCreate, CollectionPublic, CollectionUpdate
from app.schemas.common import Page

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post("/", response_model=CollectionPublic, status_code=status.HTTP_201_CREATED)
def create_collection(body: CollectionCreate, tenant: DesignerTenant, session: SessionDep):
    return crud.create(session, tenant, body)


@router.get("/", response_model=Page[CollectionPublic])
def list_collections(
    tenant: DesignerTenant,
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
):
    return Page(
        data=crud.list_(session, tenant, skip, limit),
        count=crud.count(session, tenant),
    )


@router.get("/{collection_id}", response_model=CollectionPublic)
def get_collection(collection_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, collection_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="collection_not_found")
    return obj


@router.patch("/{collection_id}", response_model=CollectionPublic)
def update_collection(
    collection_id: uuid.UUID,
    body: CollectionUpdate,
    tenant: DesignerTenant,
    session: SessionDep,
):
    obj = crud.get(session, tenant, collection_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="collection_not_found")
    return crud.update(session, obj, body)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(collection_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, collection_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="collection_not_found")
    crud.delete(session, obj)
