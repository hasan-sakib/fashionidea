import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"
import type { Collection, Look, Page } from "@/lib/types"
import { CATEGORIES, OCCASIONS } from "@/lib/vocab"

interface FormState {
  title: string
  description: string
  image_url: string
  category: string
  occasions: string[]
  tags: string
  collection_id: string
  is_published: boolean
}

const empty: FormState = {
  title: "",
  description: "",
  image_url: "",
  category: "",
  occasions: [],
  tags: "",
  collection_id: "",
  is_published: false,
}

export function LooksPanel() {
  const [looks, setLooks] = useState<Look[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Look | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const q = filter ? `?collection_id=${filter}&limit=200` : "?limit=200"
    const [looksPage, colsPage] = await Promise.all([
      api.get<Page<Look>>(`/looks/${q}`),
      api.get<Page<Collection>>("/collections/?limit=200"),
    ])
    setLooks(looksPage.data)
    setCollections(colsPage.data)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const collectionName = (id: string | null) => collections.find((c) => c.id === id)?.title ?? null

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(l: Look) {
    setEditing(l)
    setForm({
      title: l.title,
      description: l.description ?? "",
      image_url: l.image_url,
      category: l.category ?? "",
      occasions: l.occasions ?? [],
      tags: (l.tags ?? []).join(", "),
      collection_id: l.collection_id ?? "",
      is_published: l.is_published,
    })
    setError(null)
    setDialogOpen(true)
  }

  function toggleOccasion(name: string) {
    setForm((f) => ({
      ...f,
      occasions: f.occasions.includes(name)
        ? f.occasions.filter((o) => o !== name)
        : [...f.occasions, name],
    }))
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await api.uploadImage(file)
      setForm((f) => ({ ...f, image_url: url }))
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.image_url) {
      setError("Please upload or provide an image.")
      return
    }
    setBusy(true)
    setError(null)
    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url,
      category: form.category || null,
      occasions: form.occasions,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      collection_id: form.collection_id || null,
      is_published: form.is_published,
    }
    try {
      if (editing) await api.patch(`/looks/${editing.id}`, payload)
      else await api.post("/looks/", payload)
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to save")
    } finally {
      setBusy(false)
    }
  }

  async function remove(l: Look) {
    if (!confirm(`Delete design "${l.title}"?`)) return
    await api.del(`/looks/${l.id}`)
    await load()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Designs</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Showcase your work — categorize each design by occasion & type.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
            <option value="">All collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>
          <Button onClick={openCreate}>New design</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : looks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No designs yet.</p>
          <Button className="mt-3" onClick={openCreate}>Add your first design</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {looks.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <div className="aspect-[3/4] w-full bg-[var(--muted)]">
                <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-tight">{l.title}</p>
                  <Badge variant={l.is_published ? "success" : "muted"}>{l.is_published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{collectionName(l.collection_id) ?? "No collection"}</p>
                {(l.category || l.occasions?.length > 0) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {l.category && <Badge variant="muted">{l.category}</Badge>}
                    {(l.occasions ?? []).slice(0, 2).map((o) => (
                      <Badge key={o} variant="outline">{o}</Badge>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(l)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(l)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit design" : "New design"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]">
                {form.image_url && <img src={form.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="space-y-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="text-sm" />
                {uploading && <p className="text-xs text-[var(--muted-foreground)]">Uploading…</p>}
              </div>
            </div>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="…or paste an image URL" />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dress type</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Uncategorized</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Collection</Label>
              <Select value={form.collection_id} onChange={(e) => setForm({ ...form, collection_id: e.target.value })}>
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Occasions</Label>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <button
                  key={o.name}
                  type="button"
                  onClick={() => toggleOccasion(o.name)}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-medium " +
                    (form.occasions.includes(o.name)
                      ? "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)]")
                  }
                >
                  {o.emoji} {o.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Style tags</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="silk, evening, minimalist (comma-separated)" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published (visible on your portfolio & the public site)
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy || uploading}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
