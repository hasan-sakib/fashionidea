"""Cross-tenant marketplace queries: published looks from active tenants."""

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.look import Look
from app.models.tenant import Tenant


def list_looks(session: Session, skip: int, limit: int) -> list[tuple[Look, Tenant]]:
    stmt = (
        select(Look, Tenant)
        .join(Tenant, Look.tenant_id == Tenant.id)
        .where(Look.is_published == True, Tenant.is_active == True)  # noqa: E712
        .order_by(Look.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(stmt).all())


def count_looks(session: Session) -> int:
    stmt = (
        select(func.count())
        .select_from(Look)
        .join(Tenant, Look.tenant_id == Tenant.id)
        .where(Look.is_published == True, Tenant.is_active == True)  # noqa: E712
    )
    return session.exec(stmt).one()
