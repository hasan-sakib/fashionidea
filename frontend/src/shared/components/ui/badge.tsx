import * as React from "react"

import { cn } from "@/shared/lib/utils"

type Variant = "default" | "outline" | "success" | "muted" | "warning"

const variants: Record<Variant, string> = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  outline: "border border-[var(--border)] text-[var(--foreground)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
