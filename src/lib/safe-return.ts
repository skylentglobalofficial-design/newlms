const ALLOWED_PREFIXES = [
  '/learn',
  '/courses',
  '/programs',
  '/labs',
  '/dashboard',
  '/career-os',
  '/education',
  '/skills',
  '/certificates',
  '/exams',
  '/junior',
  '/degrees',
  '/institutions',
  '/os',
  '/contact',
  '/about',
  '/workshops',
  '/stories',
  '/blog',
]

export function labBackLabel(from: string | null): string {
  if (!from) return '← All labs'
  if (from.startsWith('/learn/')) return '← Back to lesson'
  if (from.startsWith('/courses/')) return '← Back to course'
  if (from.startsWith('/programs/')) return '← Back to programme'
  if (from.startsWith('/dashboard')) return '← Back to dashboard'
  if (from.startsWith('/labs')) return '← All labs'
  return '← Back'
}

/** Allow only same-origin product paths. Reject protocol-relative and off-site URLs. */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null
  let path = value.trim()
  try {
    path = decodeURIComponent(path)
  } catch {
    return null
  }
  if (!path.startsWith('/')) return null
  if (path.startsWith('//')) return null
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return null
  if (/[\n\r\\]/.test(path)) return null
  const pathname = path.split(/[?#]/)[0] ?? path
  if (pathname === '/') return path
  const allowed = ALLOWED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
  return allowed ? path : null
}

export function labRunPath(labId: string, from?: string | null): string {
  const safe = safeInternalPath(from)
  if (!safe) return `/labs/${labId}/run`
  return `/labs/${labId}/run?from=${encodeURIComponent(safe)}`
}
