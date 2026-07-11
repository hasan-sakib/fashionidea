import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { SaveToMoodboardDialog } from "@/features/marketplace/SaveToMoodboardDialog"
import { api } from "@/lib/api"
import type { MarketplaceLook, Page } from "@/lib/types"

interface Props {
  isAuthed: boolean
  onRequireAuth: () => void
}

/** Public global feed of published looks from every designer. */
export function MarketplaceFeed({ isAuthed, onRequireAuth }: Props) {
  const [looks, setLooks] = useState<MarketplaceLook[]>([])
  const [loading, setLoading] = useState(true)
  const [saveTarget, setSaveTarget] = useState<MarketplaceLook | null>(null)

  useEffect(() => {
    api
      .get<Page<MarketplaceLook>>("/marketplace/looks/?limit=100")
      .then((p) => setLooks(p.data))
      .finally(() => setLoading(false))
  }, [])

  function onSave(look: MarketplaceLook) {
    if (!isAuthed) onRequireAuth()
    else setSaveTarget(look)
  }

  const storefrontUrl = (slug: string) =>
    `${window.location.protocol}//${slug}.${window.location.host}`

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Discover</h2>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Published looks from every designer on Fashion Idea.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : looks.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No looks published yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {looks.map((look) => (
            <article key={look.id} className="group">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-[var(--muted)]">
                <img
                  src={look.image_url}
                  alt={look.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-2">
                <p className="font-medium leading-tight">{look.title}</p>
                <a
                  href={storefrontUrl(look.designer.slug)}
                  className="text-sm text-[var(--muted-foreground)] underline-offset-2 hover:underline"
                >
                  {look.designer.name}
                </a>
                {look.price && <p className="text-sm text-[var(--muted-foreground)]">${look.price}</p>}
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onSave(look)}>
                Save
              </Button>
            </article>
          ))}
        </div>
      )}

      <SaveToMoodboardDialog look={saveTarget} onClose={() => setSaveTarget(null)} />
    </div>
  )
}
