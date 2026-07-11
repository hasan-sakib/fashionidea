"""Tenant-scoped CRUD for Looks."""

import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.crud.base import tenant_query
from app.models.look import Look
from app.models.tenant import Tenant
from app.schemas.catalog import LookCreate, LookUpdate


def create(session: Session, tenant: Tenant, data: LookCreate) -> Look:
    obj = Look(tenant_id=tenant.id, **data.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def get(session: Session, tenant: Tenant, look_id: uuid.UUID) -> Look | None:
    stmt = tenant_query(Look, tenant).where(Look.id == look_id)
    return session.exec(stmt).first()


def list_(
    session: Session,
    tenant: Tenant,
    skip: int,
    limit: int,
    collection_id: uuid.UUID | None = None,
) -> list[Look]:
    stmt = tenant_query(Look, tenant)
    if collection_id is not None:
        stmt = stmt.where(Look.collection_id == collection_id)
    stmt = stmt.order_by(Look.created_at.desc()).offset(skip).limit(limit)
    return list(session.exec(stmt).all())


def list_published(session: Session, tenant: Tenant) -> list[Look]:
    """Published looks for the public storefront."""
    stmt = (
        tenant_query(Look, tenant)
        .where(Look.is_published == True)  # noqa: E712
        .order_by(Look.created_at.desc())
    )
    return list(session.exec(stmt).all())


def count(session: Session, tenant: Tenant, collection_id: uuid.UUID | None = None) -> int:
    stmt = select(func.count()).select_from(Look).where(Look.tenant_id == tenant.id)
    if collection_id is not None:
        stmt = stmt.where(Look.collection_id == collection_id)
    return session.exec(stmt).one()


def update(session: Session, obj: Look, data: LookUpdate) -> Look:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def delete(session: Session, obj: Look) -> None:
    session.delete(obj)
    session.commit()
