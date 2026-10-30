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

function urlPort(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try {
    return new URL(value).port || "5432"
  } catch {
    return null
  }
}

/** Replace known secret values and inline URI passwords before a message is logged. Never returns the original URL. */
export function redactSecrets(message: string, env: NodeJS.ProcessEnv = process.env): string {
  let redacted = message
  for (const key of [
    "DATABASE_URL",
    "DIRECT_URL",
    "SKYLENT_AI_API_KEY",
    "SESSION_SECRET",
    "GOOGLE_CLIENT_SECRET",
    "MAILGUN_API_KEY",
    "SENDGRID_API_KEY",
  ] as const) {
    const value = env[key]?.trim()
    if (value && value.length >= 8) redacted = redacted.split(value).join(`<${key}>`)
  }
  redacted = redacted.replace(/(postgres(?:ql)?:\/\/[^:/@\s]+:)([^@\s]+)(@)/gi, "$1<REDACTED>$3")
  return redacted
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
  if (urlPort(env.DIRECT_URL) === "6543") {
    warnings.push("DIRECT_URL uses port 6543, the transaction pooler. Migrations need the session pooler on port 5432.")
  }
  if (env.SKYLENT_SEPTEMBER_COMPAT !== undefined && env.SKYLENT_SEPTEMBER_COMPAT !== "" && env.SKYLENT_SEPTEMBER_COMPAT !== "1") {
    warnings.push("SKYLENT_SEPTEMBER_COMPAT is set to a value other than 1. Only the exact string 1 enables September compatibility mode.")
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
