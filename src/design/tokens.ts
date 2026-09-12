/**
 * Skylent product design system — light surface tokens.
 *
 * The public marketing canvas is near-black; the product surfaces (home,
 * catalogue, programme, dashboard, education) are light. These tokens are the
 * single source of truth for the light system. CSS equivalents live in
 * src/design/product.css under the `--sk-*` prefix; keep both in sync.
 */

export const S = {
  /** Page background behind cards. */
  canvas: '#F5F6F8',
  /** Raised surface — cards, panels, tables. */
  surface: '#FFFFFF',
  /** Recessed surface — inputs, inline blocks, table headers. */
  surfaceMuted: '#F0F2F5',
  /** Deliberate dark band: featured cards, progress hero. Used sparingly. */
  surfaceDark: '#141820',
  surfaceDarkRaised: '#1E232D',

  ink: '#0C0E12',
  inkSecondary: '#495062',
  inkMuted: '#767E8E',
  inkOnDark: '#FFFFFF',
  inkOnDarkSecondary: 'rgba(255,255,255,0.72)',
  inkOnDarkMuted: 'rgba(255,255,255,0.52)',

  line: 'rgba(12,14,18,0.09)',
  lineStrong: 'rgba(12,14,18,0.16)',
  lineOnDark: 'rgba(255,255,255,0.12)',

  /** Semantic status colours — used by StatusPill and progress states. */
  positive: '#1B7F4B',
  positiveSoft: '#E8F5EE',
  positiveLine: 'rgba(27,127,75,0.24)',
  active: '#2D5BD6',
  activeSoft: '#EAF0FE',
  activeLine: 'rgba(45,91,214,0.22)',
  caution: '#9A6212',
  cautionSoft: '#FBF2E2',
  cautionLine: 'rgba(154,98,18,0.22)',
  neutralSoft: '#EEF0F4',
  neutralLine: 'rgba(12,14,18,0.12)',
} as const

export const R = {
  control: 10,
  card: 14,
  panel: 18,
  pill: 999,
} as const

export const SHADOW = {
  sm: '0 1px 2px rgba(12,14,18,0.05)',
  md: '0 2px 8px rgba(12,14,18,0.06)',
  lg: '0 12px 32px rgba(12,14,18,0.10)',
  xl: '0 24px 64px rgba(12,14,18,0.14)',
} as const

/** Content rail — the brief specifies a 1080–1200px reading/content width. */
export const RAIL = {
  wide: 1160,
  content: 1040,
  reading: 720,
} as const

/** 4px base spacing scale. */
export const SP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
} as const

/**
 * Product type scale. Deliberately smaller and denser than the marketing
 * display scale — these are working surfaces, not posters.
 */
export const TY = {
  display: { fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 600 },
  h1: { fontSize: 'clamp(24px, 2.6vw, 32px)', lineHeight: 1.18, letterSpacing: '-0.02em', fontWeight: 600 },
  h2: { fontSize: 'clamp(19px, 1.8vw, 22px)', lineHeight: 1.28, letterSpacing: '-0.015em', fontWeight: 600 },
  h3: { fontSize: 16.5, lineHeight: 1.35, letterSpacing: '-0.01em', fontWeight: 600 },
  bodyLg: { fontSize: 16, lineHeight: 1.62, letterSpacing: '-0.005em' },
  body: { fontSize: 14.5, lineHeight: 1.6 },
  bodySm: { fontSize: 13, lineHeight: 1.55 },
  label: { fontSize: 11.5, lineHeight: 1.4, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 600 },
  meta: { fontSize: 12.5, lineHeight: 1.45 },
} as const
