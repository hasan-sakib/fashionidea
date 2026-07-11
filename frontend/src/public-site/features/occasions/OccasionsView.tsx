import { OccasionTile } from "@/public-site/components/OccasionTile"
import { OCCASIONS } from "@/shared/lib/vocab"

export function OccasionsView() {
  const [featured, ...rest] = OCCASIONS

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Browse by occasion</h1>
      <p className="mt-2 max-w-prose text-[var(--muted-foreground)]">
        Not sure what to wear? Pick the moment — we'll show design ideas for it.
      </p>
      <div className="mt-6 grid auto-rows-[minmax(9rem,1fr)] grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-flow-dense">
        <div className="col-span-2 row-span-2">
          <OccasionTile occasion={featured} size="featured" />
        </div>
        {rest.map((o) => (
          <OccasionTile key={o.name} occasion={o} size="compact" />
        ))}
      </div>
    </div>
  )
}
