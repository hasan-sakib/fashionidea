"""Aggregates all versioned API routers into a single ``api_router``.

New feature routers (auth in Phase 2, collections/looks in Phase 3, …) are included here — this is
the single place the app wires up route modules, keeping ``app.main`` free of per-feature imports.
"""

from fastapi import APIRouter

from app.api.routes import utils

api_router = APIRouter()
api_router.include_router(utils.router)
