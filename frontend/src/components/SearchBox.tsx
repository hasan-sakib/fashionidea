import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { api } from "@/lib/api"
import { navigate } from "@/lib/router"
import type { SearchResults } from "@/lib/types"

/** Global search with a debounced instant-results dropdown. */
export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setResults(null)
      return
    }
    const t = setTimeout(() => {
      api
        .get<SearchResults>(`/search/?q=${encodeURIComponent(term)}`)
        .then((r) => {
          setResults(r)
          setOpen(true)
        })
        .catch(() => setResults(null))
    }, 220)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function go(path: string) {
    setOpen(false)
    setQ("")
    navigate(path)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    if (term) go(`/search?q=${encodeURIComponent(term)}`)
  }

  const hasResults =
    results &&
    (results.designers.length || results.looks.length || results.occasions.length || results.categories.length)

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results && setOpen(true)}
            placeholder="Search styles, designers, or occasions…"
            className="h-10 w-full rounded-full border border-[var(--input)] bg-[var(--background)]/80 pl-9 pr-4 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
      </form>

      {open && hasResults && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
          {results!.designers.length > 0 && (
            <Section label="Designers">
              {results!.designers.map((d) => (
                <a key={d.slug} href={designerUrl(d.slug)} className="block px-3 py-2 text-sm hover:bg-[var(--accent)]">
                  {d.name} <span className="text-[var(--muted-foreground)]">· {d.slug}</span>
                </a>
              ))}
            </Section>
          )}
          {results!.occasions.length > 0 && (
            <Section label="Occasions">
              {results!.occasions.map((o) => (
                <button key={o} onClick={() => go(`/occasions/${encodeURIComponent(o)}`)} className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)]">
                  {o}
                </button>
              ))}
            </Section>
          )}
          {results!.looks.length > 0 && (
            <Section label="Designs">
              {results!.looks.map((l) => (
                <button key={l.id} onClick={() => go(`/look/${l.id}`)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--accent)]">
                  <img src={l.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                  <span>{l.title}</span>
                  <span className="text-[var(--muted-foreground)]">· {l.designer.name}</span>
                </button>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</p>
      <div className="pb-1">{children}</div>
    </div>
  )
}

function designerUrl(slug: string) {
  return `${window.location.protocol}//${slug}.${window.location.host}`
}
