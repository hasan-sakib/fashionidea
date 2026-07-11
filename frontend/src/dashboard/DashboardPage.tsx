import { Menu } from "lucide-react"
import { useState } from "react"

import { Sidebar, type DashboardTab } from "@/dashboard/components/Sidebar"
import { CollectionsPanel } from "@/dashboard/features/collections/CollectionsPanel"
import { InquiriesPanel } from "@/dashboard/features/inquiries/InquiriesPanel"
import { LooksPanel } from "@/dashboard/features/looks/LooksPanel"
import { ProfilePanel } from "@/dashboard/features/profile/ProfilePanel"

const TITLES: Record<DashboardTab, string> = {
  looks: "Designs",
  collections: "Collections",
  inquiries: "Messages",
  profile: "Profile",
}

export function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("looks")
  const [mobileOpen, setMobileOpen] = useState(false)

  function selectTab(next: DashboardTab) {
    setTab(next)
    setMobileOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar tab={tab} onTabChange={selectTab} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-[var(--foreground)] hover:bg-[var(--accent)]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">{TITLES[tab]}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
            {tab === "collections" && <CollectionsPanel />}
            {tab === "looks" && <LooksPanel />}
            {tab === "inquiries" && <InquiriesPanel />}
            {tab === "profile" && <ProfilePanel />}
          </div>
        </main>
      </div>
    </div>
  )
}
