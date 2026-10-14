/**
 * Same rules as server/src/lib/safe-redirect.ts. A return path must stay on this site.
 * Query strings and hashes are allowed. Protocols, protocol-relative URLs, and
 * backslashes are not.
 */
export function sanitizeReturnTo(returnTo: unknown): string | null {
  if (typeof returnTo !== "string") return null
  const trimmed = returnTo.trim()
  if (!trimmed.startsWith("/")) return null
  if (trimmed.startsWith("//")) return null
  if (trimmed.includes("://")) return null
  if (trimmed.includes("\\")) return null
  return trimmed
}
