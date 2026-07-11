import { useEffect, useMemo, useState } from "react"

import { LookCard } from "@/components/LookCard"
import { api } from "@/lib/api"
import { navigate } from "@/lib/router"
import type { DiscoverLook, Page } from "@/lib/types"
import { CATEGORIES, OCCASIONS } from "@/lib/vocab"

interface Props {
  onSave: (look: DiscoverLook) => void
  /** When set (occasion route), the feed is locked to this occasion and hides the hero. */
  lockedOccasion?: string
}

export function DiscoverFeed({ onSave, lockedOccasion }: Props) {
  const [looks, setLooks] = useState<DiscoverLook[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>("")
  const occasion = lockedOccasion ?? ""

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: "100" })
    if (occasion) params.set("occasion", occasion)
    if (category) params.set("category", category)
    api
      .get<Page<DiscoverLook>>(`/discover/looks/?${params}`)
      .then((p) => setLooks(p.data))
      .finally(() => setLoading(false))
  }, [occasion, category])

  const title = lockedOccasion ? `${lockedOccasion} looks` : "Discover"
  const subtitle = lockedOccasion
    ? `Design ideas for ${lockedOccasion.toLowerCase()} occasions.`
    : "Fashion ideas and design talent from creators everywhere."

  const heroOccasions = useMemo(() => OCCASIONS.slice(0, 8), [])

  return (
    <div>
      {!lockedOccasion && (
        <section className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What will you wear?
          </h1>
          <p className="mt-2 max-w-prose text-[var(--muted-foreground)]">
            Get outfit ideas by occasion, explore designers' talent, and save looks you love.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {heroOccasions.map((o) => (
              <button
                key={o.name}
                onClick={() => navigate(`/occasions/${encodeURIComponent(o.name)}`)}
                className={`flex flex-col items-center gap-1 rounded-xl bg-gradient-to-br ${o.gradient} p-3 text-center text-white shadow-sm transition-transform hover:scale-[1.03]`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <span className="text-xs font-medium">{o.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{lockedOccasion ? title : "Latest designs"}</h2>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={category === ""} onClick={() => setCategory("")}>All types</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? "" : c)}>{c}</Chip>
          ))}
        </div>
      </div>
      {!lockedOccasion && <p className="sr-only">{subtitle}</p>}

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : looks.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No designs match yet. Try another filter.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {looks.map((look) => (
            <LookCard key={look.id} look={look} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
      }
    >
      {children}
    </button>
  )
}
