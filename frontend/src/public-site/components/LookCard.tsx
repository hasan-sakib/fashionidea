import { Heart } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { navigate } from "@/public-site/lib/router"
import type { DiscoverLook } from "@/shared/lib/types"

interface Props {
  look: DiscoverLook
  onSave?: (look: DiscoverLook) => void
  showDesigner?: boolean
}

/** A published design tile used across Discover, Occasions, Search and moodboards. */
export function LookCard({ look, onSave, showDesigner = true }: Props) {
  return (
    <article className="group">
      <button
        onClick={() => navigate(`/look/${look.id}`)}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#171717]"
      >
        {/* Rotating gradient glow — invisible until hover, clipped by the button's overflow-hidden */}
        <span
          aria-hidden
          className="fi-card-glow pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[42%] animate-[fi-card-glow-spin_8s_linear_infinite] bg-gradient-to-b from-[#ff2288] to-[#387ef0] opacity-0 [animation-play-state:paused] group-hover:opacity-100 group-hover:[animation-play-state:running]"
        />
        {/* Frosted layer diffusing the glow into a soft halo (always present, like the source design) */}
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[#17171733] backdrop-blur-xl" />
        {/* Small blurred highlight streak */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 bg-white opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        />
        {/* Image sits inset a few px so the glow reads as a thin border ring, and always on top */}
        <img
          src={look.image_url}
          alt={look.title}
          loading="lazy"
          className="absolute inset-[3px] z-10 h-[calc(100%-6px)] w-[calc(100%-6px)] rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button onClick={() => navigate(`/look/${look.id}`)} className="block truncate text-left font-medium leading-tight">
            {look.title}
          </button>
          {showDesigner && (
            <a href={designerUrl(look.designer.slug)} className="text-sm text-[var(--muted-foreground)] hover:underline">
              {look.designer.name}
            </a>
          )}
        </div>
        {onSave && (
          <button
            onClick={() => onSave(look)}
            aria-label="Save to moodboard"
            className="shrink-0 rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          >
            <Heart className="h-4 w-4" />
          </button>
        )}
      </div>
      {(look.category || look.occasions.length > 0) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {look.category && <Badge variant="muted">{look.category}</Badge>}
          {look.occasions.slice(0, 2).map((o) => (
            <Badge key={o} variant="outline">{o}</Badge>
          ))}
        </div>
      )}
    </article>
  )
}

function designerUrl(slug: string) {
  return `${window.location.protocol}//${slug}.${window.location.host}`
}
