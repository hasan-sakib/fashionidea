"""User-owned moodboard CRUD. Every query is scoped to the owning user."""

import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.look import Look
from app.models.moodboard import Moodboard, MoodboardItem
from app.models.tenant import Tenant
from app.models.user import User


def create(session: Session, user: User, name: str) -> Moodboard:
    mb = Moodboard(user_id=user.id, name=name)
    session.add(mb)
    session.commit()
    session.refresh(mb)
    return mb


def get(session: Session, user: User, moodboard_id: uuid.UUID) -> Moodboard | None:
    stmt = select(Moodboard).where(
        Moodboard.id == moodboard_id, Moodboard.user_id == user.id
    )
    return session.exec(stmt).first()


def list_with_counts(session: Session, user: User) -> list[tuple[Moodboard, int]]:
    stmt = (
        select(Moodboard, func.count(MoodboardItem.id))
        .outerjoin(MoodboardItem, MoodboardItem.moodboard_id == Moodboard.id)
        .where(Moodboard.user_id == user.id)
        .group_by(Moodboard.id)
        .order_by(Moodboard.created_at.desc())
    )
    return list(session.exec(stmt).all())


def rename(session: Session, mb: Moodboard, name: str) -> Moodboard:
    mb.name = name
    session.add(mb)
    session.commit()
    session.refresh(mb)
    return mb


def delete(session: Session, mb: Moodboard) -> None:
    session.delete(mb)
    session.commit()


def list_looks(session: Session, mb: Moodboard) -> list[tuple[Look, Tenant]]:
    """Saved looks in a board, newest first, with their designer tenant."""
    stmt = (
        select(Look, Tenant)
        .join(Tenant, Look.tenant_id == Tenant.id)
        .join(MoodboardItem, MoodboardItem.look_id == Look.id)
        .where(MoodboardItem.moodboard_id == mb.id)
        .order_by(MoodboardItem.created_at.desc())
    )
    return list(session.exec(stmt).all())


def get_item(session: Session, mb: Moodboard, look_id: uuid.UUID) -> MoodboardItem | None:
    stmt = select(MoodboardItem).where(
        MoodboardItem.moodboard_id == mb.id, MoodboardItem.look_id == look_id
    )
    return session.exec(stmt).first()


def add_item(session: Session, mb: Moodboard, look_id: uuid.UUID) -> MoodboardItem:
    item = MoodboardItem(moodboard_id=mb.id, look_id=look_id)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def remove_item(session: Session, item: MoodboardItem) -> None:
    session.delete(item)
    session.commit()
