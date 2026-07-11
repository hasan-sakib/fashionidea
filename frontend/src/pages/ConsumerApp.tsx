import { useState } from "react"

import { AuthModal } from "@/components/AuthModal"
import { Button } from "@/components/ui/button"
import { MarketplaceFeed } from "@/features/marketplace/MarketplaceFeed"
import { MoodboardsView } from "@/features/moodboards/MoodboardsView"
import { ProfileView } from "@/features/profile/ProfileView"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

type Tab = "discover" | "moodboards" | "profile"

/** Apex consumer experience: public marketplace + (when signed in) moodboards & profile. */
export function ConsumerApp() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>("discover")
  const [authOpen, setAuthOpen] = useState(false)
  const isDesigner = user?.role === "designer" || user?.role === "admin"

  const tabs: { key: Tab; label: string; authed?: boolean }[] = [
    { key: "discover", label: "Discover" },
    { key: "moodboards", label: "Moodboards", authed: true },
    { key: "profile", label: "Profile", authed: true },
  ]
  const visibleTabs = tabs.filter((t) => !t.authed || user)

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Fashion Idea</span>
            <span className="text-[var(--muted-foreground)]">/</span>
            <span className="text-sm font-medium">Marketplace</span>
          </div>
          <div className="flex items-center gap-3">
            {isDesigner && (
              <a href="/studio" className="text-sm text-[var(--muted-foreground)] hover:underline">Your studio</a>
            )}
            {user ? (
              <>
                <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">{user.full_name || user.email}</span>
                <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}>Sign in</Button>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4">
          {visibleTabs.map((t) => (
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
        {tab === "discover" && (
          <MarketplaceFeed isAuthed={!!user} onRequireAuth={() => setAuthOpen(true)} />
        )}
        {tab === "moodboards" && user && <MoodboardsView />}
        {tab === "profile" && user && <ProfileView />}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
