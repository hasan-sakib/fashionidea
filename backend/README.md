# Fashion Hub — Backend

FastAPI + SQLModel service for the Fashion Hub multi-tenant SaaS platform.

## Phase 1 (current)

A minimal, bootable app: settings, CORS, and a health-check route. No DB connection, models, or
auth yet — those arrive in Phase 2.

- `app/main.py` — application factory + CORS + router mount.
- `app/core/config.py` — environment-driven `Settings`.
- `app/api/main.py` — router aggregator (`api_router`).
- `app/api/routes/utils.py` — `GET /api/v1/utils/health-check/`.

## Running

Via the root `docker compose up` (recommended), or locally:

```bash
uv sync
uv run uvicorn app.main:app --reload
```

Then: `curl http://localhost:8000/api/v1/utils/health-check/` → `{"status":"ok"}`.
Interactive docs at `/api/v1/docs`.

## Layout (fills in over later phases)

See [`../docs/architecture.md`](../docs/architecture.md) §4 for the target backend layout and the
multi-tenancy contract this service implements.
