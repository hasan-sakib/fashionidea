# Fashion Hub — API Design

> **Status:** Phase 1 defines conventions. Only `GET /api/v1/utils/health-check/` exists so far;
> the rest are the contract that later phases implement.

## 1. Conventions

- **Base path:** all endpoints live under `/api/v1`. Version bumps to `/api/v2` when breaking.
- **Transport:** JSON over HTTP. `Content-Type: application/json` for request/response bodies.
- **Resource naming:** plural nouns (`/collections`, `/looks`, `/inquiries`). IDs are UUIDs.
- **Trailing slash:** collection routes end with `/` (FastAPI default), matching the health-check.
- **Routing through Traefik:** the API is reachable via `api.localhost` **and** via `PathPrefix(/api)`
  on any storefront host, so `designer1.localhost/api/v1/...` also hits the backend.

## 2. Tenant resolution contract

Tenant-scoped endpoints resolve the tenant via the `get_current_tenant` dependency (Phase 2):

1. **Subdomain (primary)** — left-most `Host` label is the tenant `slug`
   (`designer1.localhost` → `designer1`). Reserved: `api`, `www`, `traefik`, `app`, apex.
2. **`X-Tenant-ID` header (fallback)** — explicit slug or UUID; used by dev tooling and Playwright.
3. Unresolved/inactive → **400** `{"detail": "tenant_required"}`.

Endpoints that are **not** tenant-scoped: auth (`/auth/*`), the global marketplace feed
(`/marketplace/*`), consumer profile/moodboards, and `/utils/*`.

`tenant_id` is **never** accepted from the client body — it is always taken from the resolved tenant.

## 3. Authentication (Phase 2)

- **Scheme:** OAuth2 password flow issuing JWT access tokens.
- **Header:** `Authorization: Bearer <token>`.
- **Token claims:** `sub` (user id), `role`, `tenant_id` (null for consumers/admins), `exp`.
- **Endpoints:**
  - `POST /api/v1/auth/register/designer` — creates a Tenant + designer User atomically.
  - `POST /api/v1/auth/register/consumer` — creates a tenant-less consumer User.
  - `POST /api/v1/auth/login` — OAuth2 form (`username`=email, `password`) → `{access_token, token_type}`.
  - `GET  /api/v1/auth/me` — current principal from the bearer token.

## 4. Planned resource endpoints (later phases)

| Method & path | Phase | Scope | Notes |
|---|---|---|---|
| `GET /api/v1/utils/health-check/` | 1 | none | `{"status":"ok"}` — liveness probe |
| `GET/POST /api/v1/collections/` | 3 | tenant | list/create designer collections |
| `GET/PATCH/DELETE /api/v1/collections/{id}` | 3 | tenant | manage one collection |
| `GET/POST /api/v1/looks/` | 3 | tenant | list/create looks |
| `GET/PATCH/DELETE /api/v1/looks/{id}` | 3 | tenant | manage one look |
| `GET /api/v1/inquiries/` | 3 | tenant | designer inbox (filter by `status`) |
| `PATCH /api/v1/inquiries/{id}` | 3 | tenant | update inquiry status |
| `GET /api/v1/storefront/` | 4 | tenant | public published collections+looks for a subdomain |
| `POST /api/v1/inquiries/` | 4 | tenant | public inquiry submission |
| `GET /api/v1/marketplace/looks/` | 5 | global | published looks across all tenants |
| `GET/POST /api/v1/moodboards/` | 5 | consumer | consumer saved-look boards |

## 5. Pagination

List endpoints accept `?skip=<int>&limit=<int>` (default `skip=0`, `limit=100`, max `limit=200`)
and return:

```json
{ "data": [ /* items */ ], "count": 42 }
```

`count` is the total matching rows (for building pagers), independent of `skip`/`limit`.

## 6. Errors

FastAPI's default error envelope is used consistently:

```json
{ "detail": "human_or_machine_readable_message" }
```

- `400` — bad request / unresolved tenant (`tenant_required`).
- `401` — missing/invalid token.
- `403` — authenticated but not permitted (e.g. wrong role or cross-tenant access).
- `404` — resource not found *within the resolved tenant* (cross-tenant rows read as 404, never leaked).
- `422` — Pydantic validation error (FastAPI standard, includes field locations).
