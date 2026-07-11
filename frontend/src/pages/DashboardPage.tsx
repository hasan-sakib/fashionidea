import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CollectionsPanel } from "@/features/collections/CollectionsPanel"
import { InquiriesPanel } from "@/features/inquiries/InquiriesPanel"
import { LooksPanel } from "@/features/looks/LooksPanel"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

type Tab = "collections" | "looks" | "inquiries"

const TABS: { key: Tab; label: string }[] = [
  { key: "collections", label: "Collections" },
  { key: "looks", label: "Looks" },
  { key: "inquiries", label: "Inquiries" },
]

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>("looks")

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              Fashion Idea
            </span>
            <span className="text-[var(--muted-foreground)]">/</span>
            <span className="text-sm font-medium">Designer dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">
              {user?.full_name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-[var(--primary)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {tab === "collections" && <CollectionsPanel />}
        {tab === "looks" && <LooksPanel />}
        {tab === "inquiries" && <InquiriesPanel />}
      </main>
    </div>
  )
}
