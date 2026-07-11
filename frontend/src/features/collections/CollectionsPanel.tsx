import { useCallback, useEffect, useState, type FormEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"
import type { Collection, Page } from "@/lib/types"

interface FormState {
  title: string
  season: string
  description: string
  is_published: boolean
}

const empty: FormState = { title: "", season: "", description: "", is_published: false }

export function CollectionsPanel({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const page = await api.get<Page<Collection>>("/collections/?limit=200")
    setItems(page.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(c: Collection) {
    setEditing(c)
    setForm({
      title: c.title,
      season: c.season ?? "",
      description: c.description ?? "",
      is_published: c.is_published,
    })
    setError(null)
    setDialogOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const payload = {
      title: form.title,
      season: form.season || null,
      description: form.description || null,
      is_published: form.is_published,
    }
    try {
      if (editing) await api.patch(`/collections/${editing.id}`, payload)
      else await api.post("/collections/", payload)
      setDialogOpen(false)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to save")
    } finally {
      setBusy(false)
    }
  }

  async function remove(c: Collection) {
    if (!confirm(`Delete collection "${c.title}"? Looks in it are kept but unlinked.`)) return
    await api.del(`/collections/${c.id}`)
    await load()
    onChanged?.()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Group your looks by season or theme.</p>
        </div>
        <Button onClick={openCreate}>New collection</Button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Season</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-2 font-medium">{c.title}</td>
                  <td className="px-4 py-2 text-[var(--muted-foreground)]">{c.season || "—"}</td>
                  <td className="px-4 py-2">
                    <Badge variant={c.is_published ? "success" : "muted"}>
                      {c.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit collection" : "New collection"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Season</Label>
            <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="Spring / Summer 2026" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published (visible on your portfolio)
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
      <p className="text-sm text-[var(--muted-foreground)]">No collections yet.</p>
      <Button className="mt-3" onClick={onCreate}>Create your first collection</Button>
    </div>
  )
}
