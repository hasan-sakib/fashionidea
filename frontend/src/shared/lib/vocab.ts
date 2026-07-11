// Occasion + category vocabularies (mirror backend app/core/vocab.py).
// Each occasion gets an emoji + gradient for the discovery tiles.

export interface Occasion {
  name: string
  emoji: string
  gradient: string // tailwind gradient classes
}

export const OCCASIONS: Occasion[] = [
  { name: "Wedding", emoji: "💍", gradient: "from-rose-400/70 to-pink-500/70" },
  { name: "Party", emoji: "🎉", gradient: "from-fuchsia-400/70 to-purple-500/70" },
  { name: "Formal", emoji: "🎩", gradient: "from-slate-500/70 to-slate-700/70" },
  { name: "Office", emoji: "💼", gradient: "from-sky-400/70 to-blue-500/70" },
  { name: "Casual", emoji: "👕", gradient: "from-emerald-400/70 to-teal-500/70" },
  { name: "Festival", emoji: "🎪", gradient: "from-amber-400/70 to-orange-500/70" },
  { name: "Vacation", emoji: "🏖️", gradient: "from-cyan-400/70 to-teal-400/70" },
  { name: "Everyday", emoji: "☀️", gradient: "from-yellow-300/70 to-amber-400/70" },
]

export const CATEGORIES: string[] = [
  "Gown",
  "Dress",
  "Suit",
  "Saree",
  "Streetwear",
  "Outerwear",
  "Ethnic",
  "Accessories",
]

export function occasionMeta(name: string): Occasion {
  return (
    OCCASIONS.find((o) => o.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      emoji: "✨",
      gradient: "from-neutral-400/70 to-neutral-600/70",
    }
  )
}
