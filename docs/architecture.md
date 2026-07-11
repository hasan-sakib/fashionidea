# Fashion Idea — Architecture

> **Status:** Phases 1–7 implemented. This document reflects the current system.

## 1. Overview

Fashion Idea is a **multi-tenant SaaS platform for fashion inspiration and designer showcase** —
not e-commerce. People come to **get fashion ideas** (notably "what should I wear for which
occasion") and **discover designer talent**; designers **showcase and categorize** their designs by
occasion and dress type; visitors save ideas to moodboards and can reach designers to discuss
(consultations, not purchases).

### 1.1 The three surfaces

| Surface | Host | Audience | What it is |
|---|---|---|---|
| **Public discovery site** | apex, e.g. `localhost` | Consumers | Navbar + Discover feed, Occasions, Designers directory, Collections, Search, Moodboards, Profile. Clean, professional, animated motion background. |
| **Designer dashboard** | apex `/studio` | Designers | Manage Collections, Designs (with occasion/category/tag categorization + image upload), and Messages (inbound contact). |
| **Designer portfolio** | tenant subdomain, e.g. `alice.localhost` | Public | A single designer's own public showcase: published designs grouped by collection, with a "Get in touch" contact form. |

### Component map

```
                            ┌────────────────────────────┐
   *.localhost  ──────────▶ │           Traefik          │  (reverse proxy, subdomain routing)
                            └──────────────┬─────────────┘
                       PathPrefix(/api)    │    everything else
                            ┌──────────────┴──────────────┐
                            ▼                              ▼
                  ┌──────────────────┐          ┌────────────────────┐
                  │   FastAPI (API)  │          │  React SPA (Vite)  │
                  │  SQLModel/Pydantic│         │  Tailwind + shadcn │
                  └────────┬─────────┘          └────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   PostgreSQL     │  (shared DB, logical tenant isolation via tenant_id)
                  └──────────────────┘
```

The frontend picks the surface at runtime (`App.tsx`): a tenant subdomain renders the **Portfolio**;
the apex renders the **public discovery site**, except `/studio*` which renders the **designer
dashboard** behind a login gate.

## 2. Multi-Tenancy Strategy

**Model: logical (shared-database, shared-schema) isolation.** One PostgreSQL database; every
tenant-scoped table carries a non-null `tenant_id` foreign key to `tenant.id`. This lets the public
discovery surfaces (Discover feed, Designers directory, Collections/Lookbooks, Search) query across
tenants trivially, while designer-dashboard routes stay strictly scoped to one tenant.

### 2.1 Tenant resolution (`app/api/deps.py`)

Every tenant-scoped request must resolve a tenant. Resolution order:

1. **Subdomain (primary).** Parse the request `Host`. The left-most label is the tenant `slug`
   (e.g. `alice.localhost` → slug `alice`). Reserved labels (`api`, `www`, `traefik`, `app`, the
   bare apex) are **not** tenants.
2. **`X-Tenant-ID` header (fallback).** For local dev, direct API calls, and Playwright E2E where
   driving real subdomains is awkward, an explicit `X-Tenant-ID: <uuid-or-slug>` header selects the
   tenant.
3. If neither yields an **active** tenant, `get_current_tenant` raises **HTTP 400**
   (`tenant_required`). Public discovery routes (`/discover`, `/designers`, `/lookbooks`,
   `/search`) and auth routes do not use this dependency — they read across all active tenants.

For the designer **dashboard**, writes are scoped via `get_designer_tenant`, which derives the
tenant from the **authenticated user's JWT** — not the host — so a designer can never be tricked
into writing to another tenant via a spoofed subdomain/header.

### 2.2 Isolation enforcement

Resolving the tenant is not enough — **every query against a tenant-scoped table must filter by
`tenant_id`**. All dashboard CRUD goes through a mandatory helper:

```python
# app/crud/base.py
def tenant_query(model, tenant: Tenant):
    """Return a select() already scoped to the tenant. Routes MUST start here."""
    return select(model).where(model.tenant_id == tenant.id)
```

Writes set `tenant_id = tenant.id` server-side from the resolved tenant — never from client input.
`backend/tests/test_tenant_isolation.py` asserts tenant A can never read/write tenant B's rows, and
that public discovery only ever surfaces **published** designs from **active** designers.

## 3. Data Model

### 3.1 Entities

| Entity        | Purpose                                                        | Tenant-scoped? |
|---------------|-----------------------------------------------------------------|----------------|
| **Tenant**    | A designer's workspace/portfolio. The isolation key.            | — (is the key) |
| **User**      | Auth principal: designer, consumer, or admin.                    | designers: yes; consumers/admins: no (`tenant_id` null) |
| **Collection**| A themed grouping of designs (e.g. "SS26", a lookbook).          | yes            |
| **Look**      | A single **design** (garment/outfit) with imagery and categorization. | yes       |
| **Inquiry**   | A message from a visitor reaching out about a design/designer.  | yes            |
| **Moodboard** / **MoodboardItem** | A consumer's saved-designs board.            | no — scoped to the owning **user**, spans tenants |

### 3.2 Fields

**Tenant** — `id`, `slug` (unique, subdomain label), `name`, `is_active`, timestamps.

**User** — `id`, `tenant_id` (null for consumers/admins), `email` (unique within tenant),
`hashed_password`, `role` (`designer`|`consumer`|`admin`), `full_name`, `is_active`,
`measurements: JSONB | null` (a free-form **measurement profile** — height, bust, waist, hips,
shoe size, notes — set by the consumer in their Profile).

**Collection** — `id`, `tenant_id`, `title`, `description`, `season`, `is_published`, timestamps.

**Look** (design) — `id`, `tenant_id`, `collection_id`, `title`, `description`, `image_url`,
`category: str | null` (dress type — Gown, Dress, Suit, Saree, Streetwear, Outerwear, Ethnic,
Accessories), `occasions: text[]` (Wedding, Party, Formal, Office, Casual, Festival, Vacation,
Everyday — a design can suit several), `tags: text[]` (free-form style keywords for search),
`is_published`, timestamps. **No price** — this is a showcase, not a listing.

**Inquiry** — `id`, `tenant_id`, `look_id: null`, `sender_name`, `sender_email`, `message`,
`status` (`new`|`read`|`archived`), `created_at`.

**Moodboard** — `id`, `user_id`, `name`, timestamps. **MoodboardItem** — `id`, `moodboard_id`,
`look_id`, `created_at` (unique per board+look — saving twice is idempotent).

### 3.3 ER diagram

```mermaid
erDiagram
    TENANT ||--o{ USER : "employs (designers)"
    TENANT ||--o{ COLLECTION : owns
    TENANT ||--o{ LOOK : owns
    TENANT ||--o{ INQUIRY : receives
    COLLECTION ||--o{ LOOK : groups
    LOOK ||--o{ INQUIRY : "about (optional)"
    USER ||--o{ MOODBOARD : owns
    MOODBOARD ||--o{ MOODBOARD_ITEM : contains
    LOOK ||--o{ MOODBOARD_ITEM : "saved as"

    TENANT { uuid id PK; string slug UK; string name; bool is_active }
    USER { uuid id PK; uuid tenant_id FK "nullable"; string email; enum role; jsonb measurements }
    COLLECTION { uuid id PK; uuid tenant_id FK; string title; string season; bool is_published }
    LOOK {
        uuid id PK
        uuid tenant_id FK
        uuid collection_id FK "nullable"
        string title
        string image_url
        string category "nullable"
        text_array occasions
        text_array tags
        bool is_published
    }
    INQUIRY { uuid id PK; uuid tenant_id FK; uuid look_id FK "nullable"; string sender_name; enum status }
    MOODBOARD { uuid id PK; uuid user_id FK; string name }
    MOODBOARD_ITEM { uuid id PK; uuid moodboard_id FK; uuid look_id FK }
```

### 3.4 Index recommendations

- `tenant.slug` — unique, resolved on every subdomain request.
- Composite `(tenant_id, is_published)` on `collection` and `look` — the portfolio and public
  discovery filter published rows per tenant.
- `look.category` — indexed for the category filter chips.
- `(tenant_id, status)` on `inquiry` — the dashboard lists a tenant's inbox by status.
- `(moodboard_id, look_id)` unique on `moodboard_item` — idempotent saves.

## 4. Public discovery endpoints (`app/api/routes/`)

| Endpoint | Purpose |
|---|---|
| `GET /discover/looks/?occasion=&category=&q=` | Cross-tenant published designs, filterable — the Discover feed and Occasion pages. |
| `GET /discover/looks/{id}` | Full design detail (public detail page). |
| `GET /designers/?q=` | Active designers with ≥1 published design — the Designers directory. |
| `GET /lookbooks/` | Curated published collections across designers — the Collections page. |
| `GET /search/?q=` | Rich navbar search: designers + designs + matching occasions/categories. |
| `GET /vocab` | Shared occasion/category vocabulary (mirrors `app/core/vocab.py` / `frontend/src/lib/vocab.ts`). |
| `GET /storefront/` | A single tenant's published portfolio (resolved from host) — powers the Portfolio site. |
| `POST /inquiries/` | Public "get in touch" submission, routed to the tenant resolved from the host. |
| `GET/POST /moodboards/`, `.../{id}/items` | Consumer moodboards (auth required). |

## 5. Backend layout

```
backend/app/
├── main.py            # app factory + middleware + router mount + /media static files
├── core/
│   ├── config.py       # Settings (env)
│   ├── db.py           # engine + get_db session
│   ├── security.py     # password hashing + JWT
│   └── vocab.py         # OCCASIONS / CATEGORIES vocabulary
├── models/             # SQLModel table models (tenant, user, collection, look, inquiry, moodboard)
├── schemas/            # Pydantic request/response DTOs
├── crud/               # tenant_query + per-entity + discovery (designer, lookbook, marketplace)
├── api/
│   ├── main.py         # api_router aggregator
│   ├── deps.py          # get_db, get_current_tenant, get_current_user, get_designer_tenant
│   └── routes/          # auth, collections, looks, inquiries, storefront, discover, designers,
│                        # lookbooks, search, moodboards, utils
└── alembic/             # migrations
```

## 6. Roadmap & phase history

| Phase | Delivered |
|-------|----------|
| **1** | Skeleton, docs, Docker Compose (Postgres + backend/frontend + Traefik subdomain routing). |
| **2** | SQLModel models + Alembic migrations, tenant/user auth dependencies, JWT auth & registration. |
| **3** | Collections/Looks CRUD (tenant-isolated) + Designer Dashboard UI + image upload. |
| **4** | Public per-subdomain portfolios + public "get in touch" inquiry form. |
| **5** | Global discovery feed + consumer moodboards/profile. |
| **6** | Pytest tenant-leak tests + Playwright E2E inquiry flow. |
| **7** | **Repositioning** from e-commerce to inspiration/showcase: dropped `price`; added occasion/category/tag categorization, a measurement profile, and the public site's navbar + Discover/Designers/Collections/Occasions/Search pages with a motion background. |

### Deferred (next module)

Two-way **Consultations Inbox** (consumer↔designer messaging) and **consultation booking**
flow/states. The navbar's Inbox icon ships as a labeled "coming soon" placeholder.
