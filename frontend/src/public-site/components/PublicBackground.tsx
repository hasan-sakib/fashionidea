// Fixed, non-interactive animated background for the public site: slowly drawing
// SVG line paths (framer-motion), themed via the app's CSS variables so it adapts
// to light/dark mode automatically. Respects prefers-reduced-motion.

import { motion, useReducedMotion } from "framer-motion"

function FloatingPaths({ position }: { position: number }) {
  const reduceMotion = useReducedMotion()

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${
      189 + i * 6
    } -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${
      343 - i * 6
    }C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <svg
      className="h-full w-full text-[var(--foreground)]"
      viewBox="0 0 696 316"
      fill="none"
      aria-hidden
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeOpacity={0.1 + path.id * 0.03}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={
            reduceMotion
              ? { pathLength: 0.3, opacity: 0.4 }
              : { pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }
          }
          transition={{
            duration: 20 + (path.id % 10),
            repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  )
}

export function PublicBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      {/* Soft veil so foreground content stays legible in both themes. */}
      <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-[2px]" />
    </div>
  )
}
