import { useState, type FormEvent } from "react"

import { Avatar } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { api, ApiError } from "@/shared/lib/api"
import { useAuth } from "@/shared/lib/auth"

export function ProfilePanel() {
  const { user, refresh } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const displayName = user?.full_name || user?.email || "Designer"

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    setError(null)
    try {
      const body: Record<string, string> = { full_name: fullName }
      if (password) body.password = password
      await api.patch("/auth/me", body)
      await refresh()
      setPassword("")
      setStatus("Profile updated.")
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Could not update")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Your account details.</p>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-sm text-[var(--muted-foreground)]">{user?.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  minLength={8}
                />
              </div>
              {status && <p className="text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
