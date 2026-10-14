/** Public site origin. www is an alias; pages and redirects use the apex. */
export const CANONICAL_ORIGIN = "https://skylent.live"
const WWW_HOST = "www.skylent.live"

function normalizeHost(hostname: string | undefined): string {
  return (hostname ?? "").trim().toLowerCase().replace(/:\d+$/, "").replace(/^\[|\]$/g, "")
}

/**
 * A path on https://skylent.live. Protocol-relative paths, backslashes and other origins
 * become the homepage so a request URL cannot choose the host.
 */
export function publicUrl(value: string, dropSearch = false): string {
  const fallback = `${CANONICAL_ORIGIN}/`
  const raw = value.trim()
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || raw.includes("\0")) return fallback
  let url: URL
  try {
    url = new URL(raw, CANONICAL_ORIGIN)
  } catch {
    return fallback
  }
  if (url.origin !== CANONICAL_ORIGIN) return fallback
  if (dropSearch) return `${CANONICAL_ORIGIN}${url.pathname}`
  return `${CANONICAL_ORIGIN}${url.pathname}${url.search}${url.hash}`
}

export function canonicalUrlForPath(pathname: string): string {
  return publicUrl(pathname, true)
}

/** 301/308 target when the browser asked for www. Null on the apex and on local hosts. */
export function apexRedirectLocation(hostname: string | undefined, originalUrl: string): string | null {
  if (normalizeHost(hostname) !== WWW_HOST) return null
  return publicUrl(originalUrl)
}

/** Puts one canonical link in the document head. Replaces an existing one. */
export function injectCanonicalLink(html: string, pathname: string): string {
  const tag = `<link rel="canonical" href="${canonicalUrlForPath(pathname)}">`
  if (html.includes('rel="canonical"')) {
    return html.replace(/<link rel="canonical" href="[^"]*">/, tag)
  }
  if (!html.includes("</head>")) return html
  return html.replace("</head>", `    ${tag}\n  </head>`)
}
