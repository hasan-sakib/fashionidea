import { expect, request, test } from "@playwright/test"

const DESIGNER_SLUG = "alice"
const DESIGNER_EMAIL = "a@studio.com"
const DESIGNER_PASSWORD = "password123"

// Unique marker so we can find *this* run's inquiry in the designer inbox.
const MARKER = `E2E inquiry ${Date.now()}`

// Ensure the designer workspace exists so the test is self-contained on a fresh DB.
test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: "http://api.localhost" })
  await api.post("/api/v1/auth/register/designer", {
    data: {
      email: DESIGNER_EMAIL,
      password: DESIGNER_PASSWORD,
      full_name: "Alice",
      tenant_name: "Alice Studio",
      tenant_slug: DESIGNER_SLUG,
    },
  }) // 201 on first run, 400 (slug_taken) if already seeded — both fine.
  await api.dispose()
})

test("visitor submits an inquiry on a designer's subdomain and it reaches that designer", async ({
  page,
}) => {
  // 1) Visit the designer's public storefront (subdomain routing).
  await page.goto(`http://${DESIGNER_SLUG}.localhost/`)
  await expect(page.getByRole("heading", { name: "Alice Studio" })).toBeVisible()

  // 2) Fill and submit the public inquiry form.
  await page.getByTestId("inquiry-name").fill("E2E Buyer")
  await page.getByTestId("inquiry-email").fill("e2e-buyer@example.com")
  await page.getByTestId("inquiry-message").fill(MARKER)
  await page.getByTestId("inquiry-submit").click()

  // 3) The storefront confirms the submission.
  await expect(page.getByTestId("inquiry-success")).toBeVisible()

  // 4) It landed in *this* designer's inbox (routed to the correct tenant).
  const api = await request.newContext({ baseURL: "http://api.localhost" })
  const login = await api.post("/api/v1/auth/login", {
    form: { username: DESIGNER_EMAIL, password: DESIGNER_PASSWORD },
    headers: { "X-Tenant-ID": DESIGNER_SLUG },
  })
  expect(login.ok()).toBeTruthy()
  const token = (await login.json()).access_token

  const inbox = await api.get("/api/v1/inquiries/?limit=200", {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(inbox.ok()).toBeTruthy()
  const messages: string[] = (await inbox.json()).data.map((i: { message: string }) => i.message)
  expect(messages).toContain(MARKER)

  await api.dispose()
})

test("an inactive/unknown storefront shows a not-found state", async ({ page }) => {
  await page.goto("http://nosuch.localhost/")
  await expect(page.getByRole("heading", { name: "Storefront not found" })).toBeVisible()
})
