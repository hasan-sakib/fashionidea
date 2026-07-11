import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth"

export function ProfileView() {
  const { user, refresh } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    setError(null)
    try {
      const body: Record<string, string> = {}
      body.full_name = fullName
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
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Profile</h2>
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
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" minLength={8} />
            </div>
            {status && <p className="text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
