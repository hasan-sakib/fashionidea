// Thin fetch wrapper around the Fashion Idea API.
// Same-origin by default: Traefik routes /api to the backend on every host.

const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api/v1"

const TOKEN_KEY = "fi.token"

export class ApiError extends Error {
  status: number
  detail: string
  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function parseError(res: Response): Promise<never> {
  let detail = res.statusText
  try {
    const body = await res.json()
    if (typeof body?.detail === "string") detail = body.detail
    else if (Array.isArray(body?.detail)) detail = body.detail.map((e: any) => e.msg).join(", ")
  } catch {
    /* non-JSON error body */
  }
  throw new ApiError(res.status, detail)
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = opts
  const h: Record<string, string> = { ...headers }
  const token = getToken()
  if (auth && token) h["Authorization"] = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // browser sets multipart boundary
  } else if (body !== undefined) {
    h["Content-Type"] = "application/json"
    payload = JSON.stringify(body)
  }

  const res = await fetch(BASE + path, { method, headers: h, body: payload })
  if (!res.ok) await parseError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: (path: string) => request<void>(path, { method: "DELETE" }),

  /** OAuth2 password login (form-encoded). Optional tenant slug for designers. */
  async login(email: string, password: string, tenantSlug?: string): Promise<string> {
    const form = new URLSearchParams({ username: email, password })
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    }
    if (tenantSlug) headers["X-Tenant-ID"] = tenantSlug
    const res = await fetch(`${BASE}/auth/login`, { method: "POST", headers, body: form })
    if (!res.ok) await parseError(res)
    const data = (await res.json()) as { access_token: string }
    return data.access_token
  },

  /** Upload an image file, returning its served URL. */
  async uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append("file", file)
    const data = await request<{ url: string }>("/looks/upload-image", {
      method: "POST",
      body: form,
    })
    return data.url
  },
}
