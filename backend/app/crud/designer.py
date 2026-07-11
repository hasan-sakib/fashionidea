"""Public designer-directory queries: active designers with published work."""

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.look import Look
from app.models.tenant import Tenant


def list_designers(
    session: Session, skip: int, limit: int, q: str | None = None
) -> list[tuple[Tenant, int, str | None]]:
    """Active designers that have at least one published design.

    Returns (tenant, published_look_count, cover_image_url).
    """
    count_col = func.count(Look.id).label("look_count")
    # A representative cover image (any published look's image for the tenant).
    cover_col = func.max(Look.image_url).label("cover")
    stmt = (
        select(Tenant, count_col, cover_col)
        .join(Look, (Look.tenant_id == Tenant.id) & (Look.is_published == True))  # noqa: E712
        .where(Tenant.is_active == True)  # noqa: E712
        .group_by(Tenant.id)
        .having(count_col > 0)
        .order_by(Tenant.name)
    )
    if q:
        like = f"%{q}%"
        stmt = stmt.where(Tenant.name.ilike(like) | Tenant.slug.ilike(like))  # type: ignore[union-attr]
    stmt = stmt.offset(skip).limit(limit)
    return [(t, c, cover) for t, c, cover in session.exec(stmt).all()]


def count_designers(session: Session, q: str | None = None) -> int:
    inner = (
        select(Tenant.id)
        .join(Look, (Look.tenant_id == Tenant.id) & (Look.is_published == True))  # noqa: E712
        .where(Tenant.is_active == True)  # noqa: E712
        .group_by(Tenant.id)
    )
    if q:
        like = f"%{q}%"
        inner = inner.where(Tenant.name.ilike(like) | Tenant.slug.ilike(like))  # type: ignore[union-attr]
    return session.exec(select(func.count()).select_from(inner.subquery())).one()


def search_names(session: Session, q: str, limit: int) -> list[Tenant]:
    like = f"%{q}%"
    stmt = (
        select(Tenant)
        .where(
            Tenant.is_active == True,  # noqa: E712
            Tenant.name.ilike(like) | Tenant.slug.ilike(like),  # type: ignore[union-attr]
        )
        .order_by(Tenant.name)
        .limit(limit)
    )
    return list(session.exec(stmt).all())
