import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api, ApiError } from "@/lib/api"
import type { MarketplaceLook, Moodboard } from "@/lib/types"

interface Props {
  look: MarketplaceLook | null
  onClose: () => void
}

export function SaveToMoodboardDialog({ look, onClose }: Props) {
  const [boards, setBoards] = useState<Moodboard[]>([])
  const [newName, setNewName] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!look) return
    setStatus(null)
    setNewName("")
    api.get<Moodboard[]>("/moodboards/").then(setBoards).catch(() => setBoards([]))
  }, [look])

  async function saveTo(boardId: string) {
    if (!look) return
    setBusy(true)
    setStatus(null)
    try {
      await api.post(`/moodboards/${boardId}/items`, { look_id: look.id })
      setStatus("Saved!")
      setTimeout(onClose, 800)
    } catch (err) {
      setStatus(err instanceof ApiError ? err.detail : "Could not save")
    } finally {
      setBusy(false)
    }
  }

  async function createAndSave() {
    if (!newName.trim()) return
    setBusy(true)
    try {
      const mb = await api.post<Moodboard>("/moodboards/", { name: newName.trim() })
      await saveTo(mb.id)
    } catch (err) {
      setStatus(err instanceof ApiError ? err.detail : "Could not create board")
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={look !== null}
      onClose={onClose}
      title="Save to moodboard"
      description={look ? `“${look.title}” by ${look.designer.name}` : ""}
    >
      <div className="space-y-4">
        {boards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Your moodboards</p>
            <div className="flex flex-col gap-2">
              {boards.map((b) => (
                <button
                  key={b.id}
                  disabled={busy}
                  onClick={() => saveTo(b.id)}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--accent)]"
                >
                  <span>{b.name}</span>
                  <span className="text-[var(--muted-foreground)]">{b.item_count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">New moodboard</p>
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Evening wear" />
            <Button onClick={createAndSave} disabled={busy || !newName.trim()}>Create & save</Button>
          </div>
        </div>
        {status && <p className="text-sm text-[var(--muted-foreground)]">{status}</p>}
      </div>
    </Dialog>
  )
}
