import { useState, type FormEvent } from "react"

import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ApiError } from "@/shared/lib/api"
import { useAuth } from "@/shared/lib/auth"

/** Consumer auth as a modal. Designers sign in at /studio. */
export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, registerConsumer } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "login") await login(email, password)
      else await registerConsumer({ email, password, full_name: name || undefined })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Sign in" : "Create your account"}
      description="Save looks to moodboards and manage your profile."
    >
      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jamie Rivera" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-[var(--foreground)] underline underline-offset-4"
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null) }}
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
        Are you a designer?{" "}
        <a href="/studio" className="underline underline-offset-4">Showcase your talent</a>
      </p>
    </Dialog>
  )
}
