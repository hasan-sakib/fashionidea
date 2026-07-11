import { motion, useMotionTemplate, useSpring } from "framer-motion"
import { useRef, type PointerEvent } from "react"

import { navigate } from "@/public-site/lib/router"
import type { Occasion } from "@/shared/lib/vocab"

interface Props {
  occasion: Occasion
  size?: "featured" | "compact"
}

/** An occasion tile with a real lucide icon, gradient backdrop, and a cursor-tracked 3D tilt. */
export function OccasionTile({ occasion, size = "compact" }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 })
  const scale = useSpring(1, { stiffness: 300, damping: 25 })
  const transform = useMotionTemplate`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(py * -10)
    rotateY.set(px * 10)
  }

  function handlePointerEnter() {
    scale.set(1.03)
  }

  function handlePointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
  }

  const Icon = occasion.icon
  const isFeatured = size === "featured"

  return (
    <motion.button
      ref={ref}
      onClick={() => navigate(`/occasions/${encodeURIComponent(occasion.name)}`)}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ transform }}
      className={`group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl text-left text-white shadow-sm ${
        occasion.image ? "bg-neutral-900" : `bg-gradient-to-br ${occasion.gradient}`
      } ${isFeatured ? "aspect-auto p-6" : "aspect-square p-3"}`}
    >
      {occasion.image ? (
        <>
          <img
            src={occasion.image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        </>
      ) : (
        <Icon
          aria-hidden
          className={
            isFeatured
              ? "pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              : "pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          }
          strokeWidth={1.5}
        />
      )}
      <Icon
        aria-hidden
        className={isFeatured ? "relative mb-3 h-8 w-8" : "relative mb-1.5 h-5 w-5"}
        strokeWidth={1.75}
      />
      <span className={isFeatured ? "relative text-2xl font-semibold" : "relative text-sm font-semibold"}>
        {occasion.name}
      </span>
    </motion.button>
  )
}
