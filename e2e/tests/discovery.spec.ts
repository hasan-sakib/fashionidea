import { expect, request, test } from "@playwright/test"

// Self-contained: registers a designer + a published, categorized design so the
// public discovery pages have something to show on a fresh database.
const SLUG = `disco-${Date.now()}`
const EMAIL = `${SLUG}@studio.com`
const PASSWORD = "password123"
const DESIGN_TITLE = `E2E Wedding Gown ${Date.now()}`

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: "http://api.localhost" })
  const reg = await api.post("/api/v1/auth/register/designer", {
    data: {
      email: EMAIL,
      password: PASSWORD,
      full_name: "Disco Designer",
      tenant_name: "Disco Studio",
      tenant_slug: SLUG,
    },
  })
  expect(reg.ok()).toBeTruthy()
  const token = (await reg.json()).access_token

  const look = await api.post("/api/v1/looks/", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: DESIGN_TITLE,
      image_url: "http://example.com/gown.png",
      category: "Gown",
      occasions: ["Wedding"],
      tags: ["silk"],
      is_published: true,
    },
  })
  expect(look.ok()).toBeTruthy()
  await api.dispose()
})

test("public Discover feed shows the navbar and a published design", async ({ page }) => {
  await page.goto("http://localhost/")
  await expect(page.getByRole("button", { name: "Fashion Idea" })).toBeVisible()
  await expect(page.getByText(DESIGN_TITLE)).toBeVisible()
})

test("occasion filter narrows the feed to that occasion", async ({ page }) => {
  await page.goto(`http://localhost/occasions/Wedding`)
  await expect(page.getByText(DESIGN_TITLE)).toBeVisible()
})

test("Designers directory lists the new designer", async ({ page }) => {
  await page.goto("http://localhost/designers")
  // Filter by the unique slug (not the shared "Disco Studio" name) so this is
  // resilient to other runs' designers accumulating in a persistent dev database.
  await page.getByPlaceholder("Search designers…").fill(SLUG)
  await expect(page.getByText(`${SLUG}.localhost`)).toBeVisible()
})

test("search finds the designer by name", async ({ page }) => {
  await page.goto("http://localhost/")
  await page.getByPlaceholder("Search styles, designers, or occasions…").fill("Disco Studio")
  await expect(page.getByText("Disco Studio").first()).toBeVisible()
})
