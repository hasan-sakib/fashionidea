import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/shared/lib/theme"
import { cn } from "@/shared/lib/utils"

/** Sliding pill switch that toggles the app between light and dark mode. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        isDark ? "bg-[var(--primary)]" : "bg-[var(--muted)]",
        className,
      )}
    >
      <motion.span
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--background)] text-[var(--foreground)] shadow-sm"
        initial={false}
        animate={{ x: isDark ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      </motion.span>
    </button>
  )
}
