const SESSION_SECRET_MIN_LENGTH = 32

export function isProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "production"
}

export function applyDirectUrlFallback(env: NodeJS.ProcessEnv = process.env): void {
  if (!env.DIRECT_URL?.trim() && env.DATABASE_URL?.trim()) {
    env.DIRECT_URL = env.DATABASE_URL
  }
}

export function missingProductionEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  const missing: string[] = []
  if (!env.DATABASE_URL?.trim()) missing.push("DATABASE_URL")
  const secret = env.SESSION_SECRET?.trim() ?? ""
  if (secret.length < SESSION_SECRET_MIN_LENGTH) missing.push("SESSION_SECRET")
  if (!env.FRONTEND_URL?.trim()) missing.push("FRONTEND_URL")
  return missing
}

function urlHost(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

/** Settings that start fine but are unsafe or unreachable on the public HTTPS host. Values are never echoed. */
export function productionEnvWarnings(env: NodeJS.ProcessEnv = process.env): string[] {
  if (!isProduction(env)) return []
  const warnings: string[] = []
  if (env.COOKIE_SECURE === "false") {
    warnings.push("COOKIE_SECURE=false sends session cookies without Secure. Unset it or set true on HTTPS.")
  }
  const frontend = env.FRONTEND_URL?.trim()
  if (frontend && frontend.startsWith("http://") && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(frontend)) {
    warnings.push("FRONTEND_URL is not https. OAuth redirects and CORS will use an insecure origin.")
  }
  for (const key of ["DIRECT_URL", "DATABASE_URL"] as const) {
    const host = urlHost(env[key])
    if (host && /^db\.[^.]+\.supabase\.co$/i.test(host)) {
      warnings.push(`${key} uses the Supabase direct host, which is IPv6-only. Hosts without IPv6 (Hostinger) need the session pooler.`)
    }
  }
  return warnings
}

export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProduction(env)) return
  applyDirectUrlFallback(env)
  for (const warning of productionEnvWarnings(env)) console.warn(`Production config warning: ${warning}`)
  const missing = missingProductionEnv(env)
  if (missing.length === 0) return
  console.error(`Production startup blocked. Set: ${missing.join(", ")}`)
  process.exit(1)
}
