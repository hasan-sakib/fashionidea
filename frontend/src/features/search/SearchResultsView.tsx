import { useEffect, useState } from "react"

import { LookCard } from "@/components/LookCard"
import { api } from "@/lib/api"
import { useQueryParam } from "@/lib/router"
import type { DiscoverLook, SearchResults } from "@/lib/types"

export function SearchResultsView({ onSave }: { onSave: (look: DiscoverLook) => void }) {
  const q = useQueryParam("q")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    api
      .get<SearchResults>(`/search/?q=${encodeURIComponent(q)}&limit=20`)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Results for “{q}”
      </h1>

      {loading || !results ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Searching…</p>
      ) : (
        <div className="mt-6 space-y-10">
          {results.designers.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Designers</h2>
              <div className="flex flex-wrap gap-3">
                {results.designers.map((d) => (
                  <a key={d.slug} href={designerUrl(d.slug)} className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm hover:bg-[var(--accent)]">
                    {d.name}
                  </a>
                ))}
              </div>
            </section>
          )}
          {results.looks.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Designs</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {results.looks.map((l) => (
                  <LookCard key={l.id} look={l} onSave={onSave} />
                ))}
              </div>
            </section>
          )}
          {results.designers.length === 0 && results.looks.length === 0 && (
            <p className="text-[var(--muted-foreground)]">Nothing found. Try another search.</p>
          )}
        </div>
      )}
    </div>
  )
}

function designerUrl(slug: string) {
  return `${window.location.protocol}//${slug}.${window.location.host}`
}
