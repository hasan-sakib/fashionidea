"""Cross-tenant discovery queries: published designs from active designers."""

import uuid

from sqlalchemy import String, cast, func
from sqlmodel import Session, select

from app.models.look import Look
from app.models.tenant import Tenant


def get_look(session: Session, look_id: uuid.UUID) -> tuple[Look, Tenant] | None:
    """A single published design (from an active designer) with its designer."""
    stmt = (
        select(Look, Tenant)
        .join(Tenant, Look.tenant_id == Tenant.id)
        .where(
            Look.id == look_id,
            Look.is_published == True,  # noqa: E712
            Tenant.is_active == True,  # noqa: E712
        )
    )
    return session.exec(stmt).first()


def _base(occasion: str | None, category: str | None, q: str | None):
    stmt = (
        select(Look, Tenant)
        .join(Tenant, Look.tenant_id == Tenant.id)
        .where(Look.is_published == True, Tenant.is_active == True)  # noqa: E712
    )
    if occasion:
        stmt = stmt.where(Look.occasions.any(occasion))  # type: ignore[attr-defined]
    if category:
        stmt = stmt.where(Look.category == category)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            Look.title.ilike(like)  # type: ignore[union-attr]
            | Look.description.ilike(like)  # type: ignore[union-attr]
            | cast(Look.tags, String).ilike(like)
            | Tenant.name.ilike(like)  # type: ignore[union-attr]
        )
    return stmt


def list_looks(
    session: Session,
    skip: int,
    limit: int,
    *,
    occasion: str | None = None,
    category: str | None = None,
    q: str | None = None,
) -> list[tuple[Look, Tenant]]:
    stmt = _base(occasion, category, q).order_by(Look.created_at.desc()).offset(skip).limit(limit)
    return list(session.exec(stmt).all())


def count_looks(
    session: Session,
    *,
    occasion: str | None = None,
    category: str | None = None,
    q: str | None = None,
) -> int:
    sub = _base(occasion, category, q).subquery()
    return session.exec(select(func.count()).select_from(sub)).one()
