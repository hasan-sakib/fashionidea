import { AuthProvider, useAuth } from "@/shared/lib/auth"
import { getSubdomainSlug } from "@/shared/lib/tenant"
import { AuthPage } from "@/dashboard/AuthPage"
import { ConsumerApp } from "@/public-site/ConsumerApp"
import { DashboardPage } from "@/dashboard/DashboardPage"
import { Storefront } from "@/designer-site/Storefront"

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
    </div>
  )
}

/** Designer area (apex /studio): auth → dashboard. */
function StudioGate() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user && user.role !== "consumer" ? <DashboardPage /> : <AuthPage />
}

export default function App() {
  // 1) Tenant subdomain (alice.localhost) → that designer's own portfolio site.
  if (getSubdomainSlug()) {
    return <Storefront />
  }
  // 2) Apex /studio → designer dashboard; everything else → the public discovery site.
  const isStudio = window.location.pathname.startsWith("/studio")
  return (
    <AuthProvider>{isStudio ? <StudioGate /> : <ConsumerApp />}</AuthProvider>
  )
}
