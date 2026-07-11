import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import type { Inquiry, InquiryStatus, Page } from "@/lib/types"

const STATUS_VARIANT: Record<InquiryStatus, "warning" | "muted" | "success"> = {
  new: "warning",
  read: "muted",
  archived: "success",
}

export function InquiriesPanel() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const q = status ? `?status=${status}&limit=200` : "?limit=200"
    const page = await api.get<Page<Inquiry>>(`/inquiries/${q}`)
    setItems(page.data)
    setLoading(false)
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  async function setInquiryStatus(inq: Inquiry, next: InquiryStatus) {
    await api.patch(`/inquiries/${inq.id}`, { status: next })
    await load()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
          <p className="text-sm text-[var(--muted-foreground)]">People who reached out from your portfolio.</p>
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((inq) => (
            <div key={inq.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{inq.sender_name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{inq.sender_email}</p>
                </div>
                <Badge variant={STATUS_VARIANT[inq.status]}>{inq.status}</Badge>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{inq.message}</p>
              <div className="mt-3 flex items-center gap-2">
                {inq.status !== "read" && (
                  <Button variant="outline" size="sm" onClick={() => setInquiryStatus(inq, "read")}>
                    Mark read
                  </Button>
                )}
                {inq.status !== "archived" && (
                  <Button variant="ghost" size="sm" onClick={() => setInquiryStatus(inq, "archived")}>
                    Archive
                  </Button>
                )}
                {inq.status === "archived" && (
                  <Button variant="ghost" size="sm" onClick={() => setInquiryStatus(inq, "new")}>
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
