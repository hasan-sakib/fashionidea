import { useCallback, useEffect, useState } from "react"

export type Theme = "light" | "dark"

const STORAGE_KEY = "fi.theme"

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return systemPrefersDark() ? "dark" : "light"
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

/** Current theme + a setter that applies the `.dark` class and persists the choice. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  return [theme, setTheme]
}
