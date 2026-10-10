function trimSlash(value: string): string {
  return value.replace(/\/$/, "")
}

/**
 * API prefix for browser calls.
 * The Hostinger production app serves both the Vite client and Express API
 * on skylent.live, so the apex and www hosts must use same-origin requests.
 * Same-origin deployments and local Vite also use /api/v1 by default.
 */
export function apiV1(): string {
  // VITE_API_BASE is the deployed name; VITE_API_BASE_URL is accepted as an alias.
  const configured = import.meta.env?.VITE_API_BASE ?? import.meta.env?.VITE_API_BASE_URL
  if (typeof configured === "string" && configured.trim()) {
    return trimSlash(configured.trim())
  }
  return "/api/v1"
}
