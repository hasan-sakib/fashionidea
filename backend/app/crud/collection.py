"""Tenant-scoped CRUD for Collections. Every query starts from ``tenant_query``."""

import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.crud.base import tenant_query
from app.models.collection import Collection
from app.models.tenant import Tenant
from app.schemas.catalog import CollectionCreate, CollectionUpdate


def create(session: Session, tenant: Tenant, data: CollectionCreate) -> Collection:
    # tenant_id is taken from the resolved tenant, never from client input.
    obj = Collection(tenant_id=tenant.id, **data.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def get(session: Session, tenant: Tenant, collection_id: uuid.UUID) -> Collection | None:
    stmt = tenant_query(Collection, tenant).where(Collection.id == collection_id)
    return session.exec(stmt).first()


def list_(session: Session, tenant: Tenant, skip: int, limit: int) -> list[Collection]:
    stmt = (
        tenant_query(Collection, tenant)
        .order_by(Collection.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(stmt).all())


def list_published(session: Session, tenant: Tenant) -> list[Collection]:
    """Published collections for the public storefront."""
    stmt = (
        tenant_query(Collection, tenant)
        .where(Collection.is_published == True)  # noqa: E712
        .order_by(Collection.created_at.desc())
    )
    return list(session.exec(stmt).all())


def count(session: Session, tenant: Tenant) -> int:
    stmt = select(func.count()).select_from(Collection).where(Collection.tenant_id == tenant.id)
    return session.exec(stmt).one()


def update(
    session: Session, obj: Collection, data: CollectionUpdate
) -> Collection:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def delete(session: Session, obj: Collection) -> None:
    session.delete(obj)
    session.commit()
