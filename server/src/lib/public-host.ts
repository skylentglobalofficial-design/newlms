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

const EXEMPLAR_META: Record<string, { title: string; desc: string }> = {
  "SKL-2026-DA-EXEMPLAR": {
    title: "Verified Certificate · Aarav Sharma (96/100) — Data Analytics | Skylent",
    desc: "Cryptographically verified Skylent Proof-of-Work Dossier: Retail Revenue & Discount Leakage Audit built in the Northwind SQL Lab.",
  },
  "SKL-2026-PM-EXEMPLAR": {
    title: "Verified Certificate · Meera Krishnan (95/100) — Product Management | Skylent",
    desc: "Cryptographically verified Skylent Proof-of-Work Dossier: 12-Store Exception Triage PRD built in the Harbor Desk Studio.",
  },
  "SKL-2026-AI-EXEMPLAR": {
    title: "Verified Certificate · Rohan Verma (97/100) — Generative AI | Skylent",
    desc: "Cryptographically verified Skylent Proof-of-Work Dossier: Citation-Grounded Policy Assistant built in the Grounded RAG Lab.",
  },
}

/** Injects route-aware OpenGraph & Twitter card meta tags for social & recruiter sharing. */
export function injectOpenGraphMeta(html: string, pathname: string): string {
  if (!html.includes("</head>")) return html
  const cleanUrl = canonicalUrlForPath(pathname)
  let ogTitle = "Skylent — Learn. Practise. Build. Prove it."
  let ogDesc =
    "Go from beginner to job-ready by writing real SQL queries, Python pipelines, Product PRDs, and AI systems right in your browser."

  if (pathname.startsWith("/verify/")) {
    const code = decodeURIComponent(pathname.slice("/verify/".length)).trim().toUpperCase()
    const ex = EXEMPLAR_META[code]
    if (ex) {
      ogTitle = ex.title
      ogDesc = ex.desc
    } else if (code) {
      ogTitle = `Verified Credential ${code} — Skylent Proof-of-Work Registry`
      ogDesc = `Inspect the verified project dossier, rubric score breakdown, and credential authenticity for ${code} on Skylent.`
    }
  } else if (pathname === "/events" || pathname === "/workshops") {
    ogTitle = "₹99 Live Weekend Workshops (100% Coin Back) — Skylent"
    ogDesc =
      "Join a 2-hour hands-on weekend workshop in SQL, Product Management, or GenAI RAG for ₹99 and get 100% back as 99 Elixir Coins."
  } else if (pathname.startsWith("/programmes")) {
    ogTitle = "Job-Ready Career Programmes & Browser Labs — Skylent"
    ogDesc =
      "Explore 6 execution-first career tracks with built-in SQL, Python, PRD, and RAG browser sandboxes and verified capstones."
  } else if (pathname.startsWith("/career-os")) {
    ogTitle = "Skylent Career OS — Verified Portfolio & Role Skill-Gap Matcher"
    ogDesc =
      "Unite your graded projects, verifiable certificates, and role skill-gap match in one recruiter-ready profile."
  }

  const metaBlock = [
    `<meta property="og:site_name" content="Skylent">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${ogTitle.replace(/"/g, "&quot;")}">`,
    `<meta property="og:description" content="${ogDesc.replace(/"/g, "&quot;")}">`,
    `<meta property="og:url" content="${cleanUrl}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${ogTitle.replace(/"/g, "&quot;")}">`,
    `<meta name="twitter:description" content="${ogDesc.replace(/"/g, "&quot;")}">`,
  ].join("\n    ")

  return html.replace("</head>", `    ${metaBlock}\n  </head>`)
}
