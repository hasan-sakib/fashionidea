# Fashion Idea — Testing

Two suites cover the platform: **Pytest** (backend units, focused on multi-tenant
data-leak protection) and **Playwright** (browser E2E of the public inquiry flow).

## Backend — Pytest

Tests run against a **separate** database (`fashionidea_test`) created automatically
on the same Postgres server, so your dev data is never touched. The app's `get_db`
dependency is overridden to use the test session; tables are truncated between tests.

Run inside the backend container (`uv run` installs the dev deps on first use):

```bash
docker compose up -d            # stack must be running (Postgres)
docker compose exec backend uv run pytest -q
```

Coverage (`backend/tests/`):
- `test_auth.py` — registration (designer/consumer), login + tenant context, reserved/duplicate slug, role guards (401/403), profile update.
- `test_tenant_isolation.py` — the core data-leak suite:
  - a designer can't list/read/modify/delete another tenant's collections or looks (cross-tenant → **404**, never a leak);
  - a look can't reference another tenant's collection (**400**);
  - a client-supplied `tenant_id` is ignored (server sets it from the token);
  - inquiry inboxes, storefronts (published-only), and the marketplace are tenant-isolated;
  - moodboards are isolated between consumers.

## Browser — Playwright (E2E)

Drives the real running stack with the **system Google Chrome** (`channel: "chrome"`),
so no Playwright browser download is needed.

Prerequisites: the Docker stack is up (`docker compose up -d`). The spec self-provisions
the `alice` designer workspace, so it works on a fresh database.

```bash
cd e2e
npm install                     # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install to skip bundled browsers
npx playwright test
```

Specs (`e2e/tests/`):
- `inquiry.spec.ts`
  - a visitor opens a designer's **subdomain storefront** (`alice.localhost`), submits the
    public inquiry form, sees the confirmation, and the message is verified — via the API —
    to have landed in **that designer's** inbox (correct tenant routing);
  - an unknown subdomain shows the "Storefront not found" state.

## Frontend — type check

```bash
docker compose exec frontend npx tsc -b --noEmit
```
