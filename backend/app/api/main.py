"""Aggregates all versioned API routers into a single ``api_router``.

New feature routers are included here — this is the single place the app wires up
route modules, keeping ``app.main`` free of per-feature imports.
"""

from fastapi import APIRouter

from app.api.routes import (
    auth,
    collections,
    designers,
    inquiries,
    lookbooks,
    looks,
    marketplace,
    moodboards,
    search,
    storefront,
    utils,
)

api_router = APIRouter()
api_router.include_router(utils.router)
api_router.include_router(auth.router)
api_router.include_router(collections.router)
api_router.include_router(looks.router)
api_router.include_router(inquiries.router)
api_router.include_router(storefront.router)
# Public discovery surfaces.
api_router.include_router(marketplace.router)  # /discover
api_router.include_router(designers.router)
api_router.include_router(lookbooks.router)
api_router.include_router(search.router)  # /search, /vocab
api_router.include_router(moodboards.router)
