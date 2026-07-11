# Fashion Idea — Testing

Two suites cover the platform: **Pytest** (backend units, focused on multi-tenant
data-leak protection and the public discovery surfaces) and **Playwright** (browser
E2E of the inquiry flow and the public discovery site).

## Backend — Pytest

Tests run against a **separate** database (`fashionidea_test`) created automatically
on the same Postgres server (schema is dropped + recreated each session so model
changes always take effect), so your dev data is never touched. The app's `get_db`
dependency is overridden to use the test session; tables are truncated between tests.

Run inside the backend container (`uv run` installs the dev deps on first use):

```bash
docker compose up -d            # stack must be running (Postgres)
docker compose exec backend uv run pytest -q
```

Coverage (`backend/tests/`):
- `test_auth.py` — registration (designer/consumer), login + tenant context, reserved/duplicate slug, role guards (401/403), profile update.
- `test_tenant_isolation.py` — the core data-leak suite:
  - a designer can't list/read/modify/delete another tenant's collections or designs (cross-tenant → **404**, never a leak);
  - a design can't reference another tenant's collection (**400**);
  - a client-supplied `tenant_id` is ignored (server sets it from the token);
  - inquiry inboxes, portfolios (published-only), and the discovery feed are tenant-isolated;
  - moodboards are isolated between consumers.
- `test_discovery.py` — the public discovery surfaces:
  - occasion/category/text filters on the discovery feed;
  - design detail is 404 for unpublished/missing designs;
  - the designers directory only lists **active** designers with **published** work, and supports search;
  - lookbooks only surface published collections that contain published designs;
  - global search returns matching designers, designs, and occasions;
  - the consumer measurement-profile round-trips through `PATCH /auth/me`.

## Browser — Playwright (E2E)

Drives the real running stack with the **system Google Chrome** (`channel: "chrome"`),
so no Playwright browser download is needed.

Prerequisites: the Docker stack is up (`docker compose up -d`). Specs self-provision
their own designer workspace, so they work on a fresh database.

```bash
cd e2e
npm install                     # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install to skip bundled browsers
npx playwright test
```

Specs (`e2e/tests/`):
- `inquiry.spec.ts`
  - a visitor opens a designer's **subdomain portfolio** (`alice.localhost`), submits the
    public "get in touch" form, sees the confirmation, and the message is verified — via the API —
    to have landed in **that designer's** inbox (correct tenant routing);
  - an unknown subdomain shows the "Portfolio not found" state.
- `discovery.spec.ts`
  - the public **Discover** feed renders the navbar and a published design;
  - the **occasion** filter page narrows the feed to that occasion;
  - the **Designers** directory lists a newly registered designer;
  - global **search** finds a designer by name.

## Frontend — type check

```bash
docker compose exec frontend npx tsc -b --noEmit
```
