import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/shared/lib/theme"
import { cn } from "@/shared/lib/utils"

/** Sun/moon toggle that switches the app between light and dark mode. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--accent)]",
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
