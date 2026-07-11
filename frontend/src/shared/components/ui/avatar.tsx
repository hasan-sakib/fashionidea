import { cn } from "@/shared/lib/utils"

// Deterministic gradient per name/email so the same person always gets the same color.
const GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-fuchsia-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-teal-400",
  "from-indigo-400 to-violet-500",
  "from-lime-400 to-emerald-500",
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
}

/** A user's profile image — a real photo if `src` is set, else a colored initials badge. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", SIZES[size], className)}
      />
    )
  }
  const gradient = GRADIENTS[hashString(name || "?") % GRADIENTS.length]
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        gradient,
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}
