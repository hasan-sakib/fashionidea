import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"

interface Props {
  lookId?: string
  lookTitle?: string
  onSent?: () => void
}

/** Public inquiry form. Posts to /inquiries/ — the tenant is resolved from the host. */
export function InquiryForm({ lookId, lookTitle, onSent }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState(lookTitle ? `I'm interested in "${lookTitle}".` : "")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.post("/inquiries/", {
        sender_name: name,
        sender_email: email,
        message,
        look_id: lookId ?? null,
      })
      setSent(true)
      onSent?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Could not send. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
        <p className="font-medium">Thank you — your message was sent.</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">The designer will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Message</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send inquiry"}</Button>
    </form>
  )
}
