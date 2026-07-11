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
        className="block aspect-[3/4] w-full overflow-hidden rounded-xl bg-[var(--muted)]"
      >
        <img
          src={look.image_url}
          alt={look.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
