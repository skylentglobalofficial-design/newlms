export const GOOGLE_CALLBACK_PATH = "/api/v1/auth/google/callback"

export type OAuthRequestOrigin = {
  protocol?: string
  hostname?: string
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])

export function isLocalHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "")
  return LOCAL_HOSTS.has(host)
}

export function isPublicHttpsUrl(value: string | undefined | null): boolean {
  if (!value?.trim()) return false
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return false
  }
  return url.protocol === "https:" && !isLocalHostname(url.hostname)
}

/** Public https origin of the request, when the browser is already on the production host. */
export function requestPublicOrigin(req: OAuthRequestOrigin | undefined): string | null {
  const protocol = req?.protocol?.split(",")[0]?.trim().toLowerCase()
  const hostname = req?.hostname?.trim()
  if (protocol !== "https" || !hostname || isLocalHostname(hostname)) return null
  return `https://${hostname}`
}

function publicFrontendOrigin(env: NodeJS.ProcessEnv): string | null {
  const configured = env.FRONTEND_URL?.trim().replace(/\/$/, "") ?? ""
  if (!configured || !isPublicHttpsUrl(configured)) return null
  return configured
}

/**
 * Callback Google will redirect to.
 * In production a localhost or non-https GOOGLE_REDIRECT_URI is ignored.
 * Localhost remains valid only when NODE_ENV is not production.
 */
export function resolveGoogleRedirectUri(env: NodeJS.ProcessEnv, req?: OAuthRequestOrigin): string | null {
  const configured = env.GOOGLE_REDIRECT_URI?.trim()
  const production = env.NODE_ENV === "production"
  if (configured && (!production || isPublicHttpsUrl(configured))) return configured
  if (!production) return null

  const fromFrontend = publicFrontendOrigin(env)
  if (fromFrontend) return `${fromFrontend}${GOOGLE_CALLBACK_PATH}`
  const fromRequest = requestPublicOrigin(req)
  if (fromRequest) return `${fromRequest}${GOOGLE_CALLBACK_PATH}`
  return null
}

/**
 * Where the browser goes after Google returns.
 * Production never falls back to localhost. Development still does when no origin is configured.
 */
export function resolveBrowserReturnOrigin(env: NodeJS.ProcessEnv, req?: OAuthRequestOrigin): string {
  if (env.NODE_ENV === "production") {
    const fromFrontend = publicFrontendOrigin(env)
    if (fromFrontend) return fromFrontend
    const fromRequest = requestPublicOrigin(req)
    if (fromRequest) return fromRequest
    throw new Error("FRONTEND_URL must be a public https origin in production")
  }

  const configured = env.FRONTEND_URL?.trim().replace(/\/$/, "")
  if (configured) return configured
  return "http://localhost:5173"
}
