"""Pytest fixtures.

Tests run against a **separate** database (``<POSTGRES_DB>_test``) created on the
same Postgres server, so the dev database (and its seeded data) is never touched.
Each test gets a clean schema via a TRUNCATE between tests, and the app's ``get_db``
dependency is overridden to use the test session.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings
from app.core.db import get_db

# Import models (without shadowing the FastAPI ``app`` name) so SQLModel.metadata
# is fully populated for create_all.
from app import models as _models  # noqa: F401
from app.main import app

_TEST_DB = f"{settings.POSTGRES_DB}_test"
_BASE_URI = str(settings.SQLALCHEMY_DATABASE_URI)
_ADMIN_URI = _BASE_URI.replace(f"/{settings.POSTGRES_DB}", "/postgres")
_TEST_URI = _BASE_URI.replace(f"/{settings.POSTGRES_DB}", f"/{_TEST_DB}")

_TABLES = "moodboard_items, moodboards, inquiries, looks, collections, users, tenants"


@pytest.fixture(scope="session")
def engine():
    # Create the test database if it doesn't exist (autocommit — no txn for CREATE DATABASE).
    admin = create_engine(_ADMIN_URI, isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": _TEST_DB}
        ).first()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{_TEST_DB}"'))
    admin.dispose()

    eng = create_engine(_TEST_URI)
    # Drop + recreate so schema changes (new columns, etc.) always take effect —
    # create_all alone won't add columns to a table that already exists.
    SQLModel.metadata.drop_all(eng)
    SQLModel.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture
def session(engine):
    with Session(engine) as s:
        yield s
    # Clean slate for the next test.
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {_TABLES} RESTART IDENTITY CASCADE"))


@pytest.fixture
def client(session):
    def _override_get_db():
        yield session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
