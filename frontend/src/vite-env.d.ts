/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the API. Empty string = same-origin (routed via Traefik PathPrefix(/api)). */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
