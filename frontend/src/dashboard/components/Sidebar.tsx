import { FolderKanban, LogOut, MessageSquare, Shirt, Sparkles, User, X } from "lucide-react"

import { Avatar } from "@/shared/components/ui/avatar"
import { ThemeToggle } from "@/shared/components/ui/theme-toggle"
import { useAuth } from "@/shared/lib/auth"
import { cn } from "@/shared/lib/utils"

export type DashboardTab = "collections" | "looks" | "inquiries" | "profile"

const NAV: { key: DashboardTab; label: string; icon: typeof Shirt }[] = [
  { key: "looks", label: "Designs", icon: Shirt },
  { key: "collections", label: "Collections", icon: FolderKanban },
  { key: "inquiries", label: "Messages", icon: MessageSquare },
]

interface SidebarProps {
  tab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

/** Persistent left navigation: docked on desktop, an overlay drawer on mobile. */
export function Sidebar({ tab, onTabChange, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth()
  const displayName = user?.full_name || user?.email || "Designer"

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCloseMobile} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <p className="text-sm font-semibold leading-tight">Fashion Idea</p>
              <p className="text-xs text-[var(--muted-foreground)]">Studio</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                tab === key
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <button
            onClick={() => onTabChange("profile")}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors",
              tab === "profile" ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]",
            )}
          >
            <Avatar name={displayName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user?.email}</p>
            </div>
            <User className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          </button>

          <div className="mt-1 flex items-center justify-between px-1">
            <ThemeToggle />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
