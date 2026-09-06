export type OAuthEnrollTarget = {
  kind: "course" | "program"
  slug: string
}

export function sanitizeReturnTo(returnTo: unknown): string | null {
  if (typeof returnTo !== "string") return null
  const trimmed = returnTo.trim()
  if (!trimmed.startsWith("/")) return null
  if (trimmed.startsWith("//")) return null
  if (trimmed.includes("://")) return null
  if (trimmed.includes("\\")) return null
  return trimmed
}

export function parseEnrollTarget(
  kind: unknown,
  slug: unknown,
): OAuthEnrollTarget | null {
  if (kind !== "course" && kind !== "program") return null
  if (typeof slug !== "string") return null
  const normalized = slug.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(normalized)) return null
  return { kind, slug: normalized }
}

export function frontendOrigin(): string {
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  return "http://localhost:5173"
}

export function oauthErrorRedirect(message = "oauth"): string {
  const origin = frontendOrigin()
  const params = new URLSearchParams({ error: message })
  return `${origin}/login?${params.toString()}`
}

export function oauthSuccessRedirect(options: {
  returnTo?: string | null
  enrollTarget?: OAuthEnrollTarget | null
}): string {
  const origin = frontendOrigin()
  const params = new URLSearchParams({ oauth: "success" })
  if (options.returnTo) params.set("returnTo", options.returnTo)
  if (options.enrollTarget) {
    params.set("enrollKind", options.enrollTarget.kind)
    params.set("enrollSlug", options.enrollTarget.slug)
  }
  return `${origin}/login?${params.toString()}`
}
