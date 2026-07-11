import { AuthProvider, useAuth } from "@/lib/auth"
import { getSubdomainSlug } from "@/lib/tenant"
import { AuthPage } from "@/pages/AuthPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { Storefront } from "@/pages/Storefront"

function AppGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      </div>
    )
  }
  // Only designers/admins use the dashboard; consumers land on the auth screen
  // (consumer-facing features arrive in Phase 5).
  return user && user.role !== "consumer" ? <DashboardPage /> : <AuthPage />
}

export default function App() {
  // A tenant subdomain (e.g. alice.localhost) renders that designer's public
  // storefront; the apex (localhost) is the designer app (auth + dashboard).
  if (getSubdomainSlug()) {
    return <Storefront />
  }
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}
