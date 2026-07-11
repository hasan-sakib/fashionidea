"""Public lookbook queries: published collections across designers, with previews."""

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.collection import Collection
from app.models.look import Look
from app.models.tenant import Tenant


def list_lookbooks(
    session: Session, skip: int, limit: int
) -> list[tuple[Collection, Tenant]]:
    """Published collections (from active designers) that contain published looks."""
    published_look = (Look.collection_id == Collection.id) & (Look.is_published == True)  # noqa: E712
    stmt = (
        select(Collection, Tenant)
        .join(Tenant, Collection.tenant_id == Tenant.id)
        .join(Look, published_look)
        .where(Collection.is_published == True, Tenant.is_active == True)  # noqa: E712
        .group_by(Collection.id, Tenant.id)
        .order_by(Collection.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(stmt).all())


def preview_images(session: Session, collection_id, limit: int = 4) -> list[str]:
    stmt = (
        select(Look.image_url)
        .where(
            Look.collection_id == collection_id,
            Look.is_published == True,  # noqa: E712
        )
        .order_by(Look.created_at.desc())
        .limit(limit)
    )
    return list(session.exec(stmt).all())


def count_lookbooks(session: Session) -> int:
    published_look = (Look.collection_id == Collection.id) & (Look.is_published == True)  # noqa: E712
    inner = (
        select(Collection.id)
        .join(Tenant, Collection.tenant_id == Tenant.id)
        .join(Look, published_look)
        .where(Collection.is_published == True, Tenant.is_active == True)  # noqa: E712
        .group_by(Collection.id)
    )
    return session.exec(select(func.count()).select_from(inner.subquery())).one()
