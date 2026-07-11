import { useEffect, useState } from "react"

// Minimal history-based routing for the public site — no router dependency.

export function navigate(path: string) {
  if (path !== window.location.pathname + window.location.search) {
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
}

/** Current path + search, re-rendering on navigation (push/pop). */
export function useLocation(): { pathname: string; search: string } {
  const [loc, setLoc] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))
  useEffect(() => {
    const onPop = () =>
      setLoc({ pathname: window.location.pathname, search: window.location.search })
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])
  return loc
}

export function useQueryParam(key: string): string {
  const { search } = useLocation()
  return new URLSearchParams(search).get(key) ?? ""
}
