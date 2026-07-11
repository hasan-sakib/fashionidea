import { ArrowLeft, Heart } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { api, ApiError } from "@/shared/lib/api"
import { navigate } from "@/public-site/lib/router"
import type { DiscoverLook } from "@/shared/lib/types"

interface Props {
  lookId: string
  onSave: (look: DiscoverLook) => void
}

export function LookDetail({ lookId, onSave }: Props) {
  const [look, setLook] = useState<DiscoverLook | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading")

  useEffect(() => {
    setStatus("loading")
    api
      .get<DiscoverLook>(`/discover/looks/${lookId}`)
      .then((l) => {
        setLook(l)
        setStatus("ready")
      })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? "missing" : "missing"))
  }, [lookId])

  if (status === "loading") return <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
  if (status === "missing" || !look)
    return (
      <div className="text-center">
        <p className="text-[var(--muted-foreground)]">This design isn't available.</p>
        <Button className="mt-3" variant="outline" onClick={() => navigate("/")}>Back to Discover</Button>
      </div>
    )

  const portfolio = `${window.location.protocol}//${look.designer.slug}.${window.location.host}`

  return (
    <div>
      <button onClick={() => history.back()} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-[var(--muted)]">
          <img src={look.image_url} alt={look.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{look.title}</h1>
          <a href={portfolio} className="mt-1 inline-block text-[var(--muted-foreground)] hover:underline">
            by {look.designer.name}
          </a>

          {look.description && <p className="mt-4 text-[var(--foreground)]">{look.description}</p>}

          {(look.category || look.occasions.length > 0) && (
            <div className="mt-5 space-y-3">
              {look.category && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Type</p>
                  <Badge className="mt-1" variant="muted">{look.category}</Badge>
                </div>
              )}
              {look.occasions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Great for</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {look.occasions.map((o) => (
                      <button key={o} onClick={() => navigate(`/occasions/${encodeURIComponent(o)}`)}>
                        <Badge variant="outline">{o}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {look.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Style</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {look.tags.map((t) => (
                      <Badge key={t} variant="muted">#{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button onClick={() => onSave(look)}><Heart className="h-4 w-4" /> Save to moodboard</Button>
            <a href={portfolio}><Button variant="outline">Get in touch</Button></a>
          </div>
        </div>
      </div>
    </div>
  )
}
