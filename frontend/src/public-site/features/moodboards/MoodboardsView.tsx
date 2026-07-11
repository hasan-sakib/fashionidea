import { useCallback, useEffect, useState } from "react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { api } from "@/shared/lib/api"
import type { Moodboard, MoodboardDetail } from "@/shared/lib/types"

export function MoodboardsView() {
  const [boards, setBoards] = useState<Moodboard[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setBoards(await api.get<Moodboard[]>("/moodboards/"))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function create() {
    if (!newName.trim()) return
    await api.post("/moodboards/", { name: newName.trim() })
    setNewName("")
    await load()
  }

  async function remove(id: string) {
    if (!confirm("Delete this moodboard?")) return
    await api.del(`/moodboards/${id}`)
    if (openId === id) setOpenId(null)
    await load()
  }

  if (openId) {
    return <MoodboardDetailView id={openId} onBack={() => { setOpenId(null); load() }} />
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Moodboards</h2>
          <p className="mt-1 text-[var(--muted-foreground)]">Looks you’ve saved, organized your way.</p>
        </div>
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New moodboard name" className="w-56" />
          <Button onClick={create} disabled={!newName.trim()}>Create</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : boards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No moodboards yet. Create one, then save looks from Discover.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <div key={b.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{b.item_count} look{b.item_count === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpenId(b.id)}>Open</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(b.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MoodboardDetailView({ id, onBack }: { id: string; onBack: () => void }) {
  const [board, setBoard] = useState<MoodboardDetail | null>(null)

  const load = useCallback(async () => {
    setBoard(await api.get<MoodboardDetail>(`/moodboards/${id}`))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function removeLook(lookId: string) {
    await api.del(`/moodboards/${id}/items/${lookId}`)
    await load()
  }

  if (!board) return <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-[var(--muted-foreground)] hover:underline">
        ← All moodboards
      </button>
      <h2 className="text-2xl font-semibold tracking-tight">{board.name}</h2>
      <p className="mt-1 text-[var(--muted-foreground)]">{board.looks.length} saved look{board.looks.length === 1 ? "" : "s"}</p>

      {board.looks.length === 0 ? (
        <p className="mt-6 text-[var(--muted-foreground)]">Nothing saved here yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {board.looks.map((look) => (
            <article key={look.id}>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-[var(--muted)]">
                <img src={look.image_url} alt={look.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 font-medium leading-tight">{look.title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{look.designer.name}</p>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => removeLook(look.id)}>Remove</Button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
