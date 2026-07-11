import { navigate } from "@/lib/router"
import { OCCASIONS } from "@/lib/vocab"

export function OccasionsView() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Browse by occasion</h1>
      <p className="mt-2 max-w-prose text-[var(--muted-foreground)]">
        Not sure what to wear? Pick the moment — we'll show design ideas for it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {OCCASIONS.map((o) => (
          <button
            key={o.name}
            onClick={() => navigate(`/occasions/${encodeURIComponent(o.name)}`)}
            className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${o.gradient} text-white shadow-sm transition-transform hover:scale-[1.02]`}
          >
            <span className="text-4xl">{o.emoji}</span>
            <span className="text-lg font-semibold">{o.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
