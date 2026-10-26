export type DatabaseTargetClass =
  | "local"
  | "session-pooler"
  | "transaction-pooler"
  | "direct-supabase"
  | "unparsed"
  | "other"

export type DatabaseTarget = {
  class: DatabaseTargetClass
  host: string
  port: string
  database: string
  /** Supabase session pooler on port 5432. The only target accepted by `db:preflight --production`. */
  sessionPooler: boolean
}

export function classifyDatabaseTarget(raw: string): DatabaseTarget {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { class: "unparsed", host: "unknown", port: "unknown", database: "unknown", sessionPooler: false }
  }
  const hostname = parsed.hostname
  const port = parsed.port || "5432"
  const database = parsed.pathname.replace(/^\//, "") || "unknown"
  const host = parsed.host || hostname
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
  const pooler = hostname.endsWith(".pooler.supabase.com")
  const directSupabase = /^db\.[^.]+\.supabase\.co$/i.test(hostname)
  let kind: DatabaseTargetClass = "other"
  if (local) kind = "local"
  else if (directSupabase) kind = "direct-supabase"
  else if (pooler && port === "6543") kind = "transaction-pooler"
  else if (pooler && port === "5432") kind = "session-pooler"
  return {
    class: kind,
    host,
    port,
    database,
    sessionPooler: kind === "session-pooler",
  }
}

/** Remove a URL, its userinfo, and both the encoded and decoded password. */
export function redactConnectionSecrets(text: string, rawUrl: string): string {
  let redacted = text
  if (rawUrl) redacted = redacted.split(rawUrl).join("<DATABASE_URL>")
  const userinfo = rawUrl.match(/^[a-z][a-z0-9+.-]*:\/\/([^@/\s]+)@/i)?.[1]
  if (!userinfo) return redacted
  redacted = redacted.split(userinfo).join("<userinfo>")
  const encodedPassword = userinfo.includes(":") ? userinfo.slice(userinfo.indexOf(":") + 1) : ""
  if (encodedPassword) redacted = redacted.split(encodedPassword).join("<password>")
  let decoded = userinfo
  try {
    decoded = decodeURIComponent(userinfo)
  } catch {
    decoded = userinfo
  }
  if (decoded !== userinfo) redacted = redacted.split(decoded).join("<userinfo>")
  const password = decoded.includes(":") ? decoded.slice(decoded.indexOf(":") + 1) : ""
  if (password && password !== encodedPassword) redacted = redacted.split(password).join("<password>")
  return redacted
}
