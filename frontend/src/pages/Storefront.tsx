import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { InquiryForm } from "@/features/storefront/InquiryForm"
import { api, ApiError } from "@/lib/api"
import type { Collection, Look } from "@/lib/types"

interface StorefrontData {
  tenant: { slug: string; name: string }
  collections: Collection[]
  looks: Look[]
}

interface InquiryTarget {
  lookId?: string
  lookTitle?: string
}

export function Storefront() {
  const [data, setData] = useState<StorefrontData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading")
  const [inquiry, setInquiry] = useState<InquiryTarget | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setData(await api.get<StorefrontData>("/storefront/"))
        setStatus("ready")
      } catch (err) {
        setStatus(err instanceof ApiError && err.status === 400 ? "notfound" : "notfound")
      }
    })()
  }, [])

  // Group published looks under their published collections, plus a catch-all.
  const sections = useMemo(() => {
    if (!data) return []
    const groups = data.collections.map((c) => ({
      collection: c,
      looks: data.looks.filter((l) => l.collection_id === c.id),
    }))
    const other = data.looks.filter(
      (l) => !data.collections.some((c) => c.id === l.collection_id),
    )
    if (other.length) {
      groups.push({
        collection: { id: "__other__", title: "Other pieces", season: null } as Collection,
        looks: other,
      })
    }
    return groups.filter((g) => g.looks.length > 0)
  }, [data])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Loading storefront…</p>
      </div>
    )
  }

  if (status === "notfound" || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">Fashion Idea</p>
        <h1 className="text-2xl font-semibold tracking-tight">Storefront not found</h1>
        <p className="text-sm text-[var(--muted-foreground)]">This designer workspace doesn’t exist or isn’t active.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Fashion Idea
            </p>
            <h1 className="text-xl font-semibold tracking-tight">{data.tenant.name}</h1>
          </div>
          <Button variant="outline" onClick={() => setInquiry({})}>Contact</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight">The collection</h2>
          <p className="mt-2 max-w-prose text-[var(--muted-foreground)]">
            Explore published looks from {data.tenant.name}. See something you love? Send an inquiry.
          </p>
        </section>

        {sections.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No looks have been published yet. Check back soon.</p>
        ) : (
          sections.map((group) => (
            <section key={group.collection.id} className="mb-12">
              <div className="mb-4 flex items-baseline gap-3">
                <h3 className="text-lg font-semibold tracking-tight">{group.collection.title}</h3>
                {group.collection.season && (
                  <span className="text-sm text-[var(--muted-foreground)]">{group.collection.season}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {group.looks.map((look) => (
                  <article key={look.id} className="group">
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-[var(--muted)]">
                      <img
                        src={look.image_url}
                        alt={look.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium leading-tight">{look.title}</p>
                        {look.price && (
                          <p className="text-sm text-[var(--muted-foreground)]">${look.price}</p>
                        )}
                      </div>
                    </div>
                    {look.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">{look.description}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setInquiry({ lookId: look.id, lookTitle: look.title })}
                    >
                      Inquire
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        <section className="mt-16 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Get in touch</h3>
            <Badge variant="muted">{data.tenant.name}</Badge>
          </div>
          <InquiryForm />
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted-foreground)]">
        {data.tenant.name} · Powered by Fashion Idea
      </footer>

      <Dialog
        open={inquiry !== null}
        onClose={() => setInquiry(null)}
        title={inquiry?.lookTitle ? `Inquire: ${inquiry.lookTitle}` : "Contact the designer"}
        description="Send a message and the designer will get back to you."
      >
        {inquiry && (
          <InquiryForm
            lookId={inquiry.lookId}
            lookTitle={inquiry.lookTitle}
            onSent={() => setTimeout(() => setInquiry(null), 1500)}
          />
        )}
      </Dialog>
    </div>
  )
}
