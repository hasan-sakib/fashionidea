import { useState, type FormEvent } from "react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { api, ApiError } from "@/shared/lib/api"
import { useAuth } from "@/shared/lib/auth"

const MEASUREMENT_FIELDS = [
  { key: "height", label: "Height (cm)" },
  { key: "bust", label: "Bust (cm)" },
  { key: "waist", label: "Waist (cm)" },
  { key: "hips", label: "Hips (cm)" },
  { key: "shoe", label: "Shoe size" },
  { key: "notes", label: "Notes" },
]

export function ProfileView() {
  const { user, refresh } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [measurements, setMeasurements] = useState<Record<string, string>>(() => {
    const m = (user?.measurements ?? {}) as Record<string, unknown>
    return Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, m[f.key] != null ? String(m[f.key]) : ""]))
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    setError(null)
    try {
      const cleaned = Object.fromEntries(
        Object.entries(measurements).filter(([, v]) => v.trim() !== ""),
      )
      const body: Record<string, unknown> = { full_name: fullName, measurements: cleaned }
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
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Profile</h1>
      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurement profile</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">Optional — helps designers tailor ideas and (soon) consultations to you.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {MEASUREMENT_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  <Input
                    value={measurements[f.key]}
                    onChange={(e) => setMeasurements({ ...measurements, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {status && <p className="text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
      </form>
    </div>
  )
}
