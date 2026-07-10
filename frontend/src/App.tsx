import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

// Same-origin by default: Traefik routes PathPrefix(/api) to the backend on any host,
// so a tenant subdomain and the apex both reach the API without CORS or a hardcoded host.
const API_URL = import.meta.env.VITE_API_URL ?? ""

type HealthState = "idle" | "loading" | "ok" | "error"

function currentTenant(): string {
  // Left-most label of the host; treated as the tenant slug on storefront subdomains.
  const [label] = window.location.hostname.split(".")
  const reserved = ["localhost", "www", "api", "traefik", "app", "127"]
  return reserved.includes(label) ? "— (apex / no tenant)" : label
}

export default function App() {
  const [health, setHealth] = useState<HealthState>("idle")

  const checkHealth = useCallback(async () => {
    setHealth("loading")
    try {
      const res = await fetch(`${API_URL}/api/v1/utils/health-check/`)
      const data = (await res.json()) as { status?: string }
      setHealth(data.status === "ok" ? "ok" : "error")
    } catch {
      setHealth("error")
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  const badge = {
    idle: { text: "idle", cls: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
    loading: { text: "checking…", cls: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
    ok: { text: "ok", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    error: { text: "unreachable", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
  }[health]

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
          Fashion Idea
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Multi-tenant SaaS skeleton
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Phase 1 is live. This page is served through Traefik and talks to the FastAPI backend.
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted-foreground)]">Tenant (from subdomain)</dt>
            <dd className="font-mono">{currentTenant()}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted-foreground)]">Backend health</dt>
            <dd>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.text}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <Button onClick={checkHealth} disabled={health === "loading"}>
            Re-check backend
          </Button>
        </div>
      </div>
    </main>
  )
}
