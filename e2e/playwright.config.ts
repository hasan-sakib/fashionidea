import { defineConfig } from "@playwright/test"

// Runs against the already-running Docker stack (docker compose up).
// Uses the system Google Chrome (channel: "chrome") so no browser download
// is needed — handy on slow networks.
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    channel: "chrome",
    headless: true,
    baseURL: "http://localhost",
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
  },
})
