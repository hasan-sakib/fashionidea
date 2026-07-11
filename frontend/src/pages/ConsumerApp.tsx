import { useState } from "react"

import { AuthModal } from "@/components/AuthModal"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/Navbar"
import { PublicBackground } from "@/components/PublicBackground"
import { DesignersView } from "@/features/designers/DesignersView"
import { DiscoverFeed } from "@/features/discover/DiscoverFeed"
import { CollectionsView } from "@/features/lookbooks/CollectionsView"
import { LookDetail } from "@/features/looks/LookDetail"
import { MoodboardsView } from "@/features/moodboards/MoodboardsView"
import { OccasionsView } from "@/features/occasions/OccasionsView"
import { ProfileView } from "@/features/profile/ProfileView"
import { SaveToMoodboardDialog } from "@/features/marketplace/SaveToMoodboardDialog"
import { SearchResultsView } from "@/features/search/SearchResultsView"
import { useAuth } from "@/lib/auth"
import { navigate, useLocation } from "@/lib/router"
import type { DiscoverLook } from "@/lib/types"

/** The public site: animated background + navbar + client-routed discovery views. */
export function ConsumerApp() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [saveTarget, setSaveTarget] = useState<DiscoverLook | null>(null)

  function handleSave(look: DiscoverLook) {
    if (!user) setAuthOpen(true)
    else setSaveTarget(look)
  }

  return (
    <div className="min-h-screen">
      <PublicBackground />
      <Navbar onSignIn={() => setAuthOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-12">
        <Routes pathname={pathname} onSave={handleSave} isAuthed={!!user} onRequireAuth={() => setAuthOpen(true)} />
      </main>

      <SaveToMoodboardDialog look={saveTarget} onClose={() => setSaveTarget(null)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

function Routes({
  pathname,
  onSave,
  isAuthed,
  onRequireAuth,
}: {
  pathname: string
  onSave: (look: DiscoverLook) => void
  isAuthed: boolean
  onRequireAuth: () => void
}) {
  if (pathname === "/") return <DiscoverFeed onSave={onSave} />
  if (pathname === "/designers") return <DesignersView />
  if (pathname === "/collections") return <CollectionsView />
  if (pathname === "/occasions") return <OccasionsView />
  if (pathname.startsWith("/occasions/"))
    return <DiscoverFeed onSave={onSave} lockedOccasion={decodeURIComponent(pathname.split("/occasions/")[1])} />
  if (pathname.startsWith("/look/")) return <LookDetail lookId={pathname.split("/look/")[1]} onSave={onSave} />
  if (pathname === "/search") return <SearchResultsView onSave={onSave} />
  if (pathname === "/moodboards")
    return isAuthed ? <MoodboardsView /> : <SignInPrompt what="moodboards" onRequireAuth={onRequireAuth} />
  if (pathname === "/profile")
    return isAuthed ? <ProfileView /> : <SignInPrompt what="your profile" onRequireAuth={onRequireAuth} />

  return (
    <div className="text-center">
      <p className="text-[var(--muted-foreground)]">Page not found.</p>
      <Button className="mt-3" variant="outline" onClick={() => navigate("/")}>Back to Discover</Button>
    </div>
  )
}

function SignInPrompt({ what, onRequireAuth }: { what: string; onRequireAuth: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
      <p className="text-[var(--muted-foreground)]">Sign in to access {what}.</p>
      <Button className="mt-3" onClick={onRequireAuth}>Sign in</Button>
    </div>
  )
}
