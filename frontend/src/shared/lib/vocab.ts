// Occasion + category vocabularies (mirror backend app/core/vocab.py).
// Each occasion gets a real lucide-react icon + gradient for the discovery tiles.

import { Briefcase, Gem, Martini, Music2, PartyPopper, Shirt, Sparkles, Sun, TreePalm, type LucideIcon } from "lucide-react"

export interface Occasion {
  name: string
  icon: LucideIcon
  gradient: string // tailwind gradient classes
  image?: string // optional photo backing the tile, overrides the flat gradient
}

export const OCCASIONS: Occasion[] = [
  { name: "Wedding", icon: Gem, gradient: "from-rose-400/70 to-pink-500/70", image: "/occasions/wedding.jpg" },
  { name: "Party", icon: PartyPopper, gradient: "from-fuchsia-400/70 to-purple-500/70" },
  { name: "Formal", icon: Martini, gradient: "from-slate-500/70 to-slate-700/70", image: "/occasions/formal.jpg" },
  { name: "Office", icon: Briefcase, gradient: "from-sky-400/70 to-blue-500/70" },
  { name: "Casual", icon: Shirt, gradient: "from-emerald-400/70 to-teal-500/70" },
  { name: "Festival", icon: Music2, gradient: "from-amber-400/70 to-orange-500/70", image: "/occasions/festival.jpg" },
  { name: "Vacation", icon: TreePalm, gradient: "from-cyan-400/70 to-teal-400/70" },
  { name: "Everyday", icon: Sun, gradient: "from-yellow-300/70 to-amber-400/70" },
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
      icon: Sparkles,
      gradient: "from-neutral-400/70 to-neutral-600/70",
    }
  )
}
