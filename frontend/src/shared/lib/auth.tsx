import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api, setToken } from "@/shared/lib/api"
import type { User } from "@/shared/lib/types"

interface DesignerRegisterInput {
  email: string
  password: string
  full_name?: string
  tenant_name: string
  tenant_slug: string
}

interface ConsumerRegisterInput {
  email: string
  password: string
  full_name?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string, tenantSlug?: string) => Promise<void>
  registerDesigner: (input: DesignerRegisterInput) => Promise<void>
  registerConsumer: (input: ConsumerRegisterInput) => Promise<void>
  refresh: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    try {
      setUser(await api.get<User>("/auth/me"))
    } catch {
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadMe()
      setLoading(false)
    })()
  }, [loadMe])

  const login = useCallback(
    async (email: string, password: string, tenantSlug?: string) => {
      const token = await api.login(email, password, tenantSlug)
      setToken(token)
      await loadMe()
    },
    [loadMe],
  )

  const registerDesigner = useCallback(
    async (input: DesignerRegisterInput) => {
      const { access_token } = await api.post<{ access_token: string }>(
        "/auth/register/designer",
        input,
      )
      setToken(access_token)
      await loadMe()
    },
    [loadMe],
  )

  const registerConsumer = useCallback(
    async (input: ConsumerRegisterInput) => {
      const { access_token } = await api.post<{ access_token: string }>(
        "/auth/register/consumer",
        input,
      )
      setToken(access_token)
      await loadMe()
    },
    [loadMe],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, registerDesigner, registerConsumer, refresh: loadMe, logout }),
    [user, loading, login, registerDesigner, registerConsumer, loadMe, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
