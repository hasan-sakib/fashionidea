import { AuthProvider, useAuth } from "@/lib/auth"
import { getSubdomainSlug } from "@/lib/tenant"
import { AuthPage } from "@/pages/AuthPage"
import { ConsumerApp } from "@/pages/ConsumerApp"
import { DashboardPage } from "@/pages/DashboardPage"
import { Storefront } from "@/pages/Storefront"

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
  // 1) Tenant subdomain (alice.localhost) → that designer's public storefront.
  if (getSubdomainSlug()) {
    return <Storefront />
  }
  // 2) Apex /studio → designer app; everything else → consumer marketplace.
  const isStudio = window.location.pathname.startsWith("/studio")
  return (
    <AuthProvider>{isStudio ? <StudioGate /> : <ConsumerApp />}</AuthProvider>
  )
}
