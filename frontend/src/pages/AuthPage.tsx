import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { getSubdomainSlug } from "@/lib/tenant"

export function AuthPage() {
  const { login, registerDesigner } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [slug, setSlug] = useState(getSubdomainSlug())
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [studio, setStudio] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "login") {
        await login(email, password, slug || undefined)
      } else {
        await registerDesigner({
          email,
          password,
          full_name: fullName || undefined,
          tenant_name: studio,
          tenant_slug: slug,
        })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Something went wrong")
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
            Fashion Idea
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Designer sign in" : "Create your studio"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {mode === "login"
              ? "Access your collections, looks and inquiries."
              : "Register a workspace to start publishing looks."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <Field label="Your name">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ada Couture" />
                </Field>
                <Field label="Studio name">
                  <Input value={studio} onChange={(e) => setStudio(e.target.value)} required placeholder="Ada Couture Studio" />
                </Field>
              </>
            )}

            <Field
              label="Workspace slug"
              hint={mode === "register" ? "Lowercase letters, numbers, hyphens. Your subdomain." : "Your studio's workspace."}
            >
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required={mode === "register"}
                pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
                placeholder="ada-couture"
              />
            </Field>

            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@studio.com" />
            </Field>
            <Field label="Password" hint={mode === "register" ? "At least 8 characters." : undefined}>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••" />
            </Field>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create studio"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            {mode === "login" ? "New designer?" : "Already have a studio?"}{" "}
            <button
              type="button"
              className="font-medium text-[var(--foreground)] underline underline-offset-4"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login")
                setError(null)
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  )
}
