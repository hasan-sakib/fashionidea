"""Database engine and session dependency.

A single module-level engine is shared process-wide; ``get_db`` yields a
short-lived session per request and is the injection point for all routes/CRUD.
"""

from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_pre_ping=True)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
