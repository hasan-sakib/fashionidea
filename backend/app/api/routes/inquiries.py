"""Inquiries: public submission (storefront) + designer inbox management.

- ``POST /inquiries/`` is public and resolves the target tenant from the request
  (subdomain / X-Tenant-ID) — this is what the Phase 4 storefront form posts to.
- The rest require an authenticated designer and are scoped to their own tenant.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import DesignerTenant, SessionDep, TenantDep
from app.crud import inquiry as crud
from app.crud import look as look_crud
from app.models.enums import InquiryStatus
from app.schemas.common import Page
from app.schemas.inquiry import InquiryCreate, InquiryPublic, InquiryUpdate

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.post("/", response_model=InquiryPublic, status_code=status.HTTP_201_CREATED)
def create_inquiry(body: InquiryCreate, tenant: TenantDep, session: SessionDep):
    """Public: submit an inquiry to the tenant resolved from the request host."""
    # If a look is referenced, it must belong to the resolved tenant.
    if body.look_id is not None and look_crud.get(session, tenant, body.look_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="look_not_found")
    return crud.create(session, tenant, body)


@router.get("/", response_model=Page[InquiryPublic])
def list_inquiries(
    tenant: DesignerTenant,
    session: SessionDep,
    status_filter: Annotated[InquiryStatus | None, Query(alias="status")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
):
    return Page(
        data=crud.list_(session, tenant, skip, limit, status_filter),
        count=crud.count(session, tenant, status_filter),
    )


@router.get("/{inquiry_id}", response_model=InquiryPublic)
def get_inquiry(inquiry_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, inquiry_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="inquiry_not_found")
    return obj


@router.patch("/{inquiry_id}", response_model=InquiryPublic)
def update_inquiry(
    inquiry_id: uuid.UUID, body: InquiryUpdate, tenant: DesignerTenant, session: SessionDep
):
    obj = crud.get(session, tenant, inquiry_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="inquiry_not_found")
    return crud.set_status(session, obj, body.status)


@router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inquiry(inquiry_id: uuid.UUID, tenant: DesignerTenant, session: SessionDep):
    obj = crud.get(session, tenant, inquiry_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="inquiry_not_found")
    crud.delete(session, obj)
