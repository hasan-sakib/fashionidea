import { useEffect, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** Lightweight modal: overlay + centered panel, Escape and click-outside to close. */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "my-8 w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg",
          className,
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
