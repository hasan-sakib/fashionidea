"""Tenant-scoping primitive.

Every read/write against a tenant-scoped table MUST start from ``tenant_query`` so
no route can accidentally forget the ``tenant_id`` filter (the classic cross-tenant
data leak). Phase 3 CRUD builds on this; Phase 6 tests assert the isolation holds.
"""

from typing import TypeVar

from sqlmodel import SQLModel, select
from sqlmodel.sql.expression import SelectOfScalar

from app.models.tenant import Tenant

ModelT = TypeVar("ModelT", bound=SQLModel)


def tenant_query(model: type[ModelT], tenant: Tenant) -> SelectOfScalar[ModelT]:
    """Return a ``select(model)`` already filtered to the given tenant."""
    return select(model).where(model.tenant_id == tenant.id)
