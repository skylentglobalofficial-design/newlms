// Semantic accent themes. Public Skylent is light-first: indigo + selective blue.
// Do not use these as full-page colour washes or rainbow category systems.

export type AuroraThemeId =
  | 'general'
  | 'data-science'
  | 'data-analytics'
  | 'full-stack'
  | 'jee'
  | 'neet'
  | 'cat'
  | 'schooling'
  | 'undergraduate'
  | 'postgraduate'
  | 'professional'
  | 'certificate'
  | 'webinar'
  | 'career'
  | 'institution'
  | 'superadmin'

export type AuroraTheme = {
  id: AuroraThemeId
  primary: string
  secondary: string
  /** CSS opacity suffix for radial gradients (hex alpha) — keep extremely low */
  strength: string
}

const INDIGO = '#4F46E5'
const BLUE = '#2563EB'

export const AURORA_THEMES: Record<AuroraThemeId, AuroraTheme> = {
  general: { id: 'general', primary: INDIGO, secondary: BLUE, strength: '08' },
  'data-science': { id: 'data-science', primary: INDIGO, secondary: BLUE, strength: '08' },
  'data-analytics': { id: 'data-analytics', primary: BLUE, secondary: INDIGO, strength: '08' },
  'full-stack': { id: 'full-stack', primary: INDIGO, secondary: BLUE, strength: '08' },
  jee: { id: 'jee', primary: BLUE, secondary: INDIGO, strength: '08' },
  neet: { id: 'neet', primary: BLUE, secondary: INDIGO, strength: '08' },
  cat: { id: 'cat', primary: INDIGO, secondary: BLUE, strength: '08' },
  schooling: { id: 'schooling', primary: INDIGO, secondary: BLUE, strength: '08' },
  undergraduate: { id: 'undergraduate', primary: INDIGO, secondary: BLUE, strength: '08' },
  postgraduate: { id: 'postgraduate', primary: INDIGO, secondary: BLUE, strength: '08' },
  professional: { id: 'professional', primary: INDIGO, secondary: BLUE, strength: '08' },
  certificate: { id: 'certificate', primary: INDIGO, secondary: BLUE, strength: '08' },
  webinar: { id: 'webinar', primary: BLUE, secondary: INDIGO, strength: '08' },
  career: { id: 'career', primary: INDIGO, secondary: BLUE, strength: '08' },
  institution: { id: 'institution', primary: INDIGO, secondary: BLUE, strength: '08' },
  superadmin: { id: 'superadmin', primary: BLUE, secondary: INDIGO, strength: '08' },
}

const PROGRAM_SLUG_THEME: Record<string, AuroraThemeId> = {
  'data-science-ai': 'data-science',
  'data-analytics-pro': 'data-analytics',
  'full-stack': 'full-stack',
  'generative-ai-program': 'data-science',
  'product-management': 'professional',
  'jee-advanced-prep': 'jee',
  'cat-prep': 'cat',
  'sql-certificate': 'certificate',
}

const PROGRAM_TYPE_THEME: Record<string, AuroraThemeId> = {
  PROFESSIONAL: 'professional',
  CERTIFICATE: 'certificate',
  WEBINAR: 'webinar',
  EXAM_PREP: 'jee',
  SCHOOLING: 'schooling',
  UNDERGRADUATE: 'undergraduate',
  POSTGRADUATE: 'postgraduate',
}

const ROUTE_THEME: Record<string, AuroraThemeId> = {
  '/': 'general',
  '/education': 'schooling',
  '/skills': 'professional',
  '/career-os': 'career',
  '/career': 'career',
  '/institutions': 'institution',
  '/universities': 'institution',
  '/os': 'career',
  '/programs': 'general',
  '/courses': 'certificate',
  '/workshops': 'webinar',
  '/stories': 'general',
  '/about': 'general',
  '/blog': 'general',
  '/contact': 'general',
  '/labs': 'professional',
}

export function resolveAuroraTheme(pathname: string, programSlug?: string, programType?: string): AuroraThemeId {
  if (pathname.startsWith('/programs/') && programSlug) {
    const bySlug = PROGRAM_SLUG_THEME[programSlug]
    if (bySlug) return bySlug
    if (programType) {
      const byType = PROGRAM_TYPE_THEME[programType]
      if (byType) {
        if (programType === 'EXAM_PREP') {
          if (programSlug.includes('neet')) return 'neet'
          if (programSlug.includes('cat')) return 'cat'
          if (programSlug.includes('jee')) return 'jee'
        }
        return byType
      }
    }
    return 'general'
  }

  const base = pathname.split('?')[0].replace(/\/$/, '') || '/'
  if (ROUTE_THEME[base]) return ROUTE_THEME[base]

  if (pathname.startsWith('/courses')) return 'certificate'
  if (pathname.startsWith('/workshops')) return 'webinar'
  if (pathname.startsWith('/blog')) return 'general'

  return 'general'
}

export function getAuroraTheme(id: AuroraThemeId): AuroraTheme {
  return AURORA_THEMES[id]
}

/** Domain accent tokens — indigo/blue hierarchy, not rainbow decoration. */
export function getDomainAccent(themeId: AuroraThemeId) {
  const t = AURORA_THEMES[themeId]
  return {
    primary: t.primary,
    secondary: t.secondary,
    subtle: `${t.primary}14`,
    subtleStrong: `${t.primary}22`,
    border: `${t.primary}40`,
    text: t.primary,
    textMuted: `${t.primary}CC`,
  }
}
