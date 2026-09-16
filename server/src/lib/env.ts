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

export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProduction(env)) return
  applyDirectUrlFallback(env)
  const missing = missingProductionEnv(env)
  if (missing.length === 0) return
  console.error(`Production startup blocked. Set: ${missing.join(", ")}`)
  process.exit(1)
}
