import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { DesignerCard, Page } from "@/lib/types"

export function DesignersView() {
  const [designers, setDesigners] = useState<DesignerCard[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const params = new URLSearchParams({ limit: "100" })
      if (q.trim()) params.set("q", q.trim())
      api
        .get<Page<DesignerCard>>(`/designers/?${params}`)
        .then((p) => setDesigners(p.data))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Designers</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Discover the talent behind the designs.</p>
        </div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search designers…" className="w-64" />
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : designers.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No designers found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {designers.map((d) => (
            <a
              key={d.slug}
              href={designerUrl(d.slug)}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]">
                {d.cover_image && (
                  <img src={d.cover_image} alt={d.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{d.look_count} design{d.look_count === 1 ? "" : "s"} · {d.slug}.localhost</p>
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
