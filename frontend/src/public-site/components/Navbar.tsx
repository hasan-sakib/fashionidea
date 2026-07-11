import { Heart, Home, LogOut, Menu, MessageCircle, Ruler, Search, Sparkles, User, X } from "lucide-react"
import { useState } from "react"

import { SearchBox } from "@/public-site/components/SearchBox"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/shared/lib/auth"
import { navigate, useLocation } from "@/public-site/lib/router"
import { cn } from "@/shared/lib/utils"

const NAV_LINKS = [
  { label: "Discover", path: "/" },
  { label: "Designers", path: "/designers" },
  { label: "Collections", path: "/collections" },
  { label: "Occasions", path: "/occasions" },
]

export function Navbar({ onSignIn }: { onSignIn: () => void }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path))
  const guarded = (path: string) => (user ? navigate(path) : onSignIn())

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Left: logo + primary nav */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
          <span className="text-lg font-semibold tracking-tight">Fashion Idea</span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(l.path)
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Center: search (desktop) */}
        <div className="mx-2 hidden max-w-md flex-1 md:block">
          <SearchBox />
        </div>

        {/* Right: tools */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <IconButton label="Search" onClick={() => setMobileSearch((v) => !v)} className="md:hidden">
            <Search className="h-5 w-5" />
          </IconButton>
          <IconButton label="Moodboards" onClick={() => guarded("/moodboards")} className="hidden sm:inline-flex">
            <Heart className="h-5 w-5" />
          </IconButton>
          <div className="relative hidden sm:inline-flex">
            <IconButton label="Inbox (coming soon)" onClick={() => {}} disabled>
              <MessageCircle className="h-5 w-5" />
            </IconButton>
            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[var(--muted)] px-1 text-[8px] font-semibold text-[var(--muted-foreground)]">
              soon
            </span>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]"
                aria-label="Account"
              >
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg" onMouseLeave={() => setProfileOpen(false)}>
                  <div className="border-b border-[var(--border)] px-3 py-2 text-sm">
                    <p className="font-medium">{user.full_name || "Your account"}</p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
                  </div>
                  <MenuItem onClick={() => { setProfileOpen(false); navigate("/profile") }}><Ruler className="h-4 w-4" /> Measurement profile</MenuItem>
                  <MenuItem onClick={() => { setProfileOpen(false); guarded("/moodboards") }}><Heart className="h-4 w-4" /> Moodboards</MenuItem>
                  <MenuItem onClick={() => { setProfileOpen(false); logout() }}><LogOut className="h-4 w-4" /> Sign out</MenuItem>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={onSignIn} className="hidden sm:inline-flex">Sign in</Button>
          )}

          <a href="/studio" className="hidden md:inline-flex">
            <Button size="sm" variant="outline" className="border-[var(--primary)]/40">For Designers</Button>
          </a>

          <IconButton label="Menu" onClick={() => setMenuOpen((v) => !v)} className="lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </IconButton>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearch && (
        <div className="border-t border-[var(--border)] px-4 py-2 md:hidden">
          <SearchBox autoFocus />
        </div>
      )}

      {/* Mobile hamburger menu */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] px-4 py-2 lg:hidden">
          {NAV_LINKS.map((l) => (
            <button key={l.path} onClick={() => { setMenuOpen(false); navigate(l.path) }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--accent)]">
              {l.label}
            </button>
          ))}
          {!user && (
            <button onClick={() => { setMenuOpen(false); onSignIn() }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--accent)]">Sign in</button>
          )}
          <a href="/studio" className="block rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--primary)] hover:bg-[var(--accent)]">For Designers →</a>
        </div>
      )}

      {/* Mobile sticky bottom nav */}
      <BottomNav onSignIn={onSignIn} onSearch={() => setMobileSearch(true)} />
    </header>
  )
}

function BottomNav({ onSignIn, onSearch }: { onSignIn: () => void; onSearch: () => void }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const item = (active: boolean) =>
    cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]", active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md sm:hidden">
      <button className={item(pathname === "/")} onClick={() => navigate("/")}><Home className="h-5 w-5" /> Home</button>
      <button className={item(false)} onClick={onSearch}><Search className="h-5 w-5" /> Search</button>
      <button className={item(false)} disabled><MessageCircle className="h-5 w-5" /> Messages</button>
      <button className={item(pathname.startsWith("/profile"))} onClick={() => (user ? navigate("/profile") : onSignIn())}><User className="h-5 w-5" /> Profile</button>
    </nav>
  )
}

function IconButton({ label, onClick, children, className, disabled }: { label: string; onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--accent)] disabled:opacity-40", className)}
    >
      {children}
    </button>
  )
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--accent)]">
      {children}
    </button>
  )
}
