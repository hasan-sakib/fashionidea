import { useEffect, useState } from "react"

import { api } from "@/shared/lib/api"
import type { Lookbook, Page } from "@/shared/lib/types"

export function CollectionsView() {
  const [items, setItems] = useState<Lookbook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Page<Lookbook>>("/lookbooks/?limit=100")
      .then((p) => setItems(p.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
      <p className="mt-1 text-[var(--muted-foreground)]">Curated lookbooks from designers on Fashion Idea.</p>

      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-[var(--muted-foreground)]">No published collections yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((lb) => (
            <a
              key={lb.id}
              href={designerUrl(lb.designer.slug)}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            >
              <div className="grid grid-cols-2 gap-0.5 bg-[var(--muted)]">
                {lb.preview_images.slice(0, 4).map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden">
                    <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                ))}
              </div>
              <div className="p-4">
                <p className="font-semibold">{lb.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {lb.designer.name}{lb.season ? ` · ${lb.season}` : ""}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function designerUrl(slug: string) {
  return `${window.location.protocol}//${slug}.${window.location.host}`
}
