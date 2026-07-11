"""Tenant-scoped CRUD for Inquiries (designer inbox + public creation)."""

import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.crud.base import tenant_query
from app.models.enums import InquiryStatus
from app.models.inquiry import Inquiry
from app.models.tenant import Tenant
from app.schemas.inquiry import InquiryCreate


def create(session: Session, tenant: Tenant, data: InquiryCreate) -> Inquiry:
    obj = Inquiry(tenant_id=tenant.id, **data.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def get(session: Session, tenant: Tenant, inquiry_id: uuid.UUID) -> Inquiry | None:
    stmt = tenant_query(Inquiry, tenant).where(Inquiry.id == inquiry_id)
    return session.exec(stmt).first()


def list_(
    session: Session,
    tenant: Tenant,
    skip: int,
    limit: int,
    status: InquiryStatus | None = None,
) -> list[Inquiry]:
    stmt = tenant_query(Inquiry, tenant)
    if status is not None:
        stmt = stmt.where(Inquiry.status == status)
    stmt = stmt.order_by(Inquiry.created_at.desc()).offset(skip).limit(limit)
    return list(session.exec(stmt).all())


def count(session: Session, tenant: Tenant, status: InquiryStatus | None = None) -> int:
    stmt = select(func.count()).select_from(Inquiry).where(Inquiry.tenant_id == tenant.id)
    if status is not None:
        stmt = stmt.where(Inquiry.status == status)
    return session.exec(stmt).one()


def set_status(session: Session, obj: Inquiry, status: InquiryStatus) -> Inquiry:
    obj.status = status
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def delete(session: Session, obj: Inquiry) -> None:
    session.delete(obj)
    session.commit()
