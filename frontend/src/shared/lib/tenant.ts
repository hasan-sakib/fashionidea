// Tenant resolution from the browser host, mirroring the backend's rules.

const RESERVED = ["localhost", "www", "api", "traefik", "app", "127", "0"]

/** Left-most host label as a tenant slug, or "" on the apex / reserved hosts. */
export function getSubdomainSlug(): string {
  const [label] = window.location.hostname.split(".")
  return RESERVED.includes(label) ? "" : label
}
