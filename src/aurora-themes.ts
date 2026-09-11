// Semantic Aurora themes — color shifts by domain/page; design system stays identical.

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
  /** CSS opacity suffix for radial gradients (hex alpha) */
  strength: string
}

export const AURORA_THEMES: Record<AuroraThemeId, AuroraTheme> = {
  general: { id: 'general', primary: '#6366F1', secondary: '#3B82F6', strength: '18' },
  'data-science': { id: 'data-science', primary: '#8B5CF6', secondary: '#6366F1', strength: '28' },
  'data-analytics': { id: 'data-analytics', primary: '#06B6D4', secondary: '#3B82F6', strength: '20' },
  'full-stack': { id: 'full-stack', primary: '#10B981', secondary: '#14B8A6', strength: '20' },
  jee: { id: 'jee', primary: '#F59E0B', secondary: '#F97316', strength: '18' },
  neet: { id: 'neet', primary: '#EC4899', secondary: '#D946EF', strength: '20' },
  cat: { id: 'cat', primary: '#A855F7', secondary: '#3B82F6', strength: '20' },
  schooling: { id: 'schooling', primary: '#38BDF8', secondary: '#3B82F6', strength: '18' },
  undergraduate: { id: 'undergraduate', primary: '#3B82F6', secondary: '#06B6D4', strength: '18' },
  postgraduate: { id: 'postgraduate', primary: '#8B5CF6', secondary: '#7C3AED', strength: '20' },
  professional: { id: 'professional', primary: '#10B981', secondary: '#14B8A6', strength: '18' },
  certificate: { id: 'certificate', primary: '#06B6D4', secondary: '#3B82F6', strength: '18' },
  webinar: { id: 'webinar', primary: '#EC4899', secondary: '#D946EF', strength: '18' },
  career: { id: 'career', primary: '#3B82F6', secondary: '#8B5CF6', strength: '20' },
  institution: { id: 'institution', primary: '#14B8A6', secondary: '#10B981', strength: '18' },
  superadmin: { id: 'superadmin', primary: '#2563EB', secondary: '#1D4ED8', strength: '16' },
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
  '/exams': 'jee',
  '/junior': 'schooling',
  '/schooling': 'schooling',
  '/degrees': 'undergraduate',
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

/** Domain accent tokens derived from Aurora theme — use for nav, workflow, selected states. */
export function getDomainAccent(themeId: AuroraThemeId) {
  const t = AURORA_THEMES[themeId]
  return {
    primary: t.primary,
    secondary: t.secondary,
    subtle: `${t.primary}1A`,
    subtleStrong: `${t.primary}28`,
    border: `${t.primary}45`,
    text: t.primary,
    textMuted: `${t.primary}CC`,
  }
}
