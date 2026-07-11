"""Designer dashboard: tenant-isolated CRUD for Looks, plus image upload."""

import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.api.deps import DesignerTenant, SessionDep
from app.core.config import settings
from app.crud import collection as collection_crud
from app.crud import look as crud
from app.schemas.catalog import LookCreate, LookPublic, LookUpdate, UploadResult
from app.schemas.common import Page

router = APIRouter(prefix="/looks", tags=["looks"])

# Map allowed image content types to file extensions.
_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
}


def _assert_collection_in_tenant(session, tenant, collection_id: uuid.UUID | None) -> None:
    if collection_id is not None and collection_crud.get(session, tenant, collection_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="collection_not_found")


@router.post("/upload-image", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload_image(tenant: DesignerTenant, file: Annotated[UploadFile, File()]):
    """Store an uploaded image and return the URL to use as a Look's image_url.

    Files are namespaced per tenant and served read-only via /api/v1/media.
    """
    ext = _ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if ext is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="unsupported_image_type")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="file_too_large")

    dest_dir = Path(settings.UPLOAD_DIR) / str(tenant.id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    (dest_dir / filename).write_bytes(contents)

    return UploadResult(url=f"{settings.API_V1_STR}/media/{tenant.id}/{filename}")


@router.post("/", response_model=LookPublic, status_code=status.HTTP_201_CREATED)
def create_look(body: LookCreate, tenant: DesignerTenant, session: SessionDep):
    _assert_collection_in_tenant(session, tenant, body.collection_id)
    return crud.create(session, tenant, body)


@router.get("/", response_model=Page[LookPublic])
def list_looks(
    tenant: DesignerTenant,
    session: SessionDep,
    collection_id: Annotated[uuid.UUID | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
):
    return Page(
        data=crud.list_(session, tenant, skip, limit, collection_id),
        count=crud.count(session, tenant, collection_id),
    )


@router.get("/{look_id}", response_model=LookPublic)
def get_look(look_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, look_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="look_not_found")
    return obj


@router.patch("/{look_id}", response_model=LookPublic)
def update_look(
    look_id: uuid.UUID, body: LookUpdate, tenant: DesignerTenant, session: SessionDep
):
    obj = crud.get(session, tenant, look_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="look_not_found")
    if "collection_id" in body.model_dump(exclude_unset=True):
        _assert_collection_in_tenant(session, tenant, body.collection_id)
    return crud.update(session, obj, body)


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_look(look_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, look_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="look_not_found")
    crud.delete(session, obj)
