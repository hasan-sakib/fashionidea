# Fashion Idea — API Design

> **Status:** Phases 1–7 implemented. This document reflects the current API.

## 1. Conventions

- **Base path:** all endpoints live under `/api/v1`. Version bumps to `/api/v2` when breaking.
- **Transport:** JSON over HTTP. `Content-Type: application/json` for request/response bodies.
- **Resource naming:** plural nouns (`/collections`, `/looks`, `/inquiries`, `/designers`,
  `/moodboards`). IDs are UUIDs.
- **Trailing slash:** collection routes end with `/` (FastAPI default), matching the health-check.
- **Routing through Traefik:** the API is reachable via `api.localhost` **and** via `PathPrefix(/api)`
  on any host, so `alice.localhost/api/v1/...` also hits the backend (used by the portfolio site).

## 2. Tenant resolution contract

Tenant-scoped endpoints resolve the tenant via the `get_current_tenant` dependency:

1. **Subdomain (primary)** — left-most `Host` label is the tenant `slug`
   (`alice.localhost` → `alice`). Reserved: `api`, `www`, `traefik`, `app`, apex.
2. **`X-Tenant-ID` header (fallback)** — explicit slug or UUID; used by dev tooling and Playwright.
3. Unresolved/inactive → **400** `{"detail": "tenant_required"}`.

**Not** tenant-scoped (read across all active tenants): auth (`/auth/*`), the public discovery
surfaces (`/discover/*`, `/designers/*`, `/lookbooks/*`, `/search/*`, `/vocab`), consumer
moodboards, and `/utils/*`.

Designer **dashboard** writes (`/collections`, `/looks`, `/inquiries` management) use
`get_designer_tenant` instead — the tenant comes from the **authenticated user's JWT**, not the
host, so a designer can never write to another tenant. `tenant_id` is never accepted from the
client body.

## 3. Authentication

- **Scheme:** OAuth2 password flow issuing JWT access tokens.
- **Header:** `Authorization: Bearer <token>`.
- **Token claims:** `sub` (user id), `role`, `tenant_id` (null for consumers/admins), `exp`.
- **Endpoints:**
  - `POST /auth/register/designer` — creates a Tenant + designer User atomically.
  - `POST /auth/register/consumer` — creates a tenant-less consumer User.
  - `POST /auth/login` — OAuth2 form (`username`=email, `password`) → `{access_token, token_type}`.
  - `GET  /auth/me` — current principal from the bearer token (includes `measurements`).
  - `PATCH /auth/me` — update `full_name` / `password` / `measurements` (the consumer measurement profile).

## 4. Resource endpoints

### Designer dashboard (auth: designer/admin, tenant from JWT)

| Method & path | Notes |
|---|---|
| `GET/POST /collections/` | list/create collections |
| `GET/PATCH/DELETE /collections/{id}` | manage one collection |
| `GET/POST /looks/` | list/create designs. Body: `title, description, image_url, category, occasions[], tags[], collection_id, is_published` — **no price** |
| `GET/PATCH/DELETE /looks/{id}` | manage one design |
| `POST /looks/upload-image` | multipart upload → `{url}` under `/media/{tenant_id}/...` |
| `GET /inquiries/` | designer inbox (filter by `?status=`) |
| `PATCH /inquiries/{id}` | update status (`new`/`read`/`archived`) |

### Designer portfolio (public, tenant from host)

| Method & path | Notes |
|---|---|
| `GET /storefront/` | `{tenant, collections[], looks[]}` — published only |
| `POST /inquiries/` | public "get in touch" submission, routed to the resolved tenant |

### Public discovery site (public, cross-tenant)

| Method & path | Notes |
|---|---|
| `GET /discover/looks/?occasion=&category=&q=&skip=&limit=` | published designs across all active designers, filterable |
| `GET /discover/looks/{id}` | one published design + its designer (404 if unpublished/missing) |
| `GET /designers/?q=&skip=&limit=` | active designers with ≥1 published design: `{slug, name, look_count, cover_image}` |
| `GET /lookbooks/?skip=&limit=` | published collections (with published designs) across designers, with `preview_images[]` |
| `GET /search/?q=&limit=` | `{designers[], looks[], occasions[], categories[]}` — powers the navbar search dropdown |
| `GET /vocab` | `{occasions[], categories[]}` — the shared categorization vocabulary |

### Consumer (auth: any authenticated user)

| Method & path | Notes |
|---|---|
| `GET/POST /moodboards/` | list/create the user's boards |
| `GET/PATCH/DELETE /moodboards/{id}` | one board + its saved designs |
| `POST /moodboards/{id}/items` | save a design (idempotent); `{look_id}` |
| `DELETE /moodboards/{id}/items/{look_id}` | remove a saved design |

## 5. Pagination

List endpoints accept `?skip=<int>&limit=<int>` and return:

```json
{ "data": [ /* items */ ], "count": 42 }
```

`count` is the total matching rows (for building pagers), independent of `skip`/`limit`.

## 6. Errors

FastAPI's default error envelope is used consistently:

```json
{ "detail": "human_or_machine_readable_message" }
```

- `400` — bad request / unresolved tenant (`tenant_required`) / cross-tenant reference (e.g.
  `collection_not_found` when a design references another tenant's collection).
- `401` — missing/invalid token.
- `403` — authenticated but not permitted (e.g. wrong role, or a non-designer hitting dashboard routes).
- `404` — resource not found *within the resolved scope* (cross-tenant rows, or unpublished designs
  on public routes, read as 404 — never leaked).
- `422` — Pydantic validation error (FastAPI standard, includes field locations).
