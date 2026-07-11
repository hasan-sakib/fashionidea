"""FastAPI application factory for Fashion Idea.

Kept deliberately thin: build the app, attach cross-cutting middleware (CORS), and mount the
versioned API router. Feature wiring lives in ``app.api.main``; configuration in ``app.core.config``.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.main import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
    )

    # CORS: the SPA is served from tenant subdomains, so allow the configured origins
    # plus any *.localhost host during local development via a regex.
    if settings.BACKEND_CORS_ORIGINS or settings.ENVIRONMENT == "local":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.BACKEND_CORS_ORIGINS,
            allow_origin_regex=r"^http://([a-z0-9-]+\.)*localhost(:\d+)?$",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Serve uploaded look images read-only. Mounted under the API prefix so the
    # existing Traefik /api rule routes /media to the backend on every host.
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount(
        f"{settings.API_V1_STR}/media",
        StaticFiles(directory=upload_dir),
        name="media",
    )

    @app.get("/", tags=["root"])
    def root() -> dict[str, str]:
        return {"service": settings.PROJECT_NAME, "docs": f"{settings.API_V1_STR}/docs"}

    return app


app = create_app()
