const PRODUCTION_API = "https://api.skylent.live/api/v1"

function trimSlash(value: string): string {
  return value.replace(/\/$/, "")
}

/**
 * API prefix for browser calls.
 * skylent.live serves the site but its colocated database is not the production API.
 * Same-origin deployments (including api.skylent.live and local Vite) stay on /api/v1.
 */
export function apiV1(): string {
  const configured = import.meta.env?.VITE_API_BASE
  if (typeof configured === "string" && configured.trim()) {
    return trimSlash(configured.trim())
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host === "skylent.live" || host === "www.skylent.live") {
      return PRODUCTION_API
    }
  }
  return "/api/v1"
}
