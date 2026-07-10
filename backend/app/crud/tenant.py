"""CRUD helpers for tenants."""

import uuid

from sqlmodel import Session, select

from app.models.tenant import Tenant


def get_by_slug(session: Session, slug: str) -> Tenant | None:
    return session.exec(select(Tenant).where(Tenant.slug == slug)).first()


def get_by_id(session: Session, tenant_id: uuid.UUID) -> Tenant | None:
    return session.get(Tenant, tenant_id)


def get_by_id_str(session: Session, value: str) -> Tenant | None:
    """Look up by a stringified UUID; returns None if it isn't a valid UUID."""
    try:
        return get_by_id(session, uuid.UUID(value))
    except (ValueError, AttributeError):
        return None


def create(session: Session, *, slug: str, name: str) -> Tenant:
    tenant = Tenant(slug=slug, name=name)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant
