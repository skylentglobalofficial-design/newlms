/**
 * Skylent product design system — light-first ivory / indigo tokens.
 *
 * Warm ivory is the page canvas. Indigo is the action colour. Orange is the
 * wordmark dot only. Green is semantic (available / completed / verified).
 * CSS equivalents live in src/design/product.css under `--sk-*`; keep both in sync.
 */

export const S = {
  /** Primary page canvas — warm milk / ivory. */
  canvas: '#F7F4EC',
  /** Product cards and content surfaces. */
  surface: '#FFFDF8',
  /** Elevated UI — dialogs, sticky bars, inputs. Use sparingly. */
  surfacePure: '#FFFFFF',
  /** Recessed surface — filter wells, table headers. */
  surfaceMuted: '#EFEBE1',
  /** Selected / active tint. */
  selected: '#EEF2FF',
  /** Deliberate dark band: featured product, resume hero. Used sparingly. */
  surfaceDark: '#15171A',
  surfaceDarkRaised: '#1E232D',

  ink: '#15171A',
  inkSecondary: '#626875',
  inkMuted: '#8A909A',
  inkOnDark: '#FFFFFF',
  inkOnDarkSecondary: 'rgba(255,255,255,0.72)',
  inkOnDarkMuted: 'rgba(255,255,255,0.52)',

  line: '#E6E1D7',
  lineStrong: '#D9D3C8',
  lineOnDark: 'rgba(255,255,255,0.12)',

  /** Primary action — deep indigo. */
  action: '#4F46E5',
  actionHover: '#4338CA',
  actionSoft: '#EEF2FF',
  actionLine: 'rgba(79,70,229,0.28)',

  /** Meaningful blue — links that are genuinely navigational, academic maps. */
  blue: '#2563EB',
  blueSoft: '#EFF6FF',

  /** Brand orange — logo dot and rare micro-accents, never the main UI. */
  orange: '#F97316',

  /** Semantic status — never used as brand colour. */
  positive: '#0F766E',
  positiveSoft: '#ECFDF5',
  positiveLine: 'rgba(15,118,110,0.22)',
  active: '#4F46E5',
  activeSoft: '#EEF2FF',
  activeLine: 'rgba(79,70,229,0.22)',
  caution: '#B45309',
  cautionSoft: '#FFF7ED',
  cautionLine: 'rgba(180,83,9,0.22)',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  dangerLine: 'rgba(180,35,24,0.22)',
  neutralSoft: '#F3F0E8',
  neutralLine: 'rgba(21,23,26,0.12)',
} as const

export const R = {
  control: 8,
  card: 12,
  panel: 14,
  pill: 999,
} as const

export const SHADOW = {
  sm: '0 1px 2px rgba(21, 23, 26, 0.04)',
  md: '0 2px 8px rgba(21, 23, 26, 0.05)',
  lg: '0 12px 28px rgba(21, 23, 26, 0.08)',
  xl: '0 24px 56px rgba(21, 23, 26, 0.10)',
} as const

/** Content rail — 1080–1200px. Do not stretch endlessly. */
export const RAIL = {
  wide: 1180,
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
 * Product type scale. Editorial headings, dense interface body.
 * Page titles are large but controlled — not poster-size SaaS type.
 */
export const TY = {
  display: { fontSize: 'clamp(28px, 3.2vw, 40px)', lineHeight: 1.12, letterSpacing: '-0.022em', fontWeight: 600 },
  h1: { fontSize: 'clamp(24px, 2.4vw, 32px)', lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 600 },
  h2: { fontSize: 'clamp(18px, 1.7vw, 22px)', lineHeight: 1.3, letterSpacing: '-0.014em', fontWeight: 600 },
  h3: { fontSize: 16.5, lineHeight: 1.35, letterSpacing: '-0.01em', fontWeight: 600 },
  bodyLg: { fontSize: 16, lineHeight: 1.62, letterSpacing: '-0.005em' },
  body: { fontSize: 14.5, lineHeight: 1.6 },
  bodySm: { fontSize: 13, lineHeight: 1.55 },
  label: { fontSize: 11.5, lineHeight: 1.4, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 600 },
  meta: { fontSize: 12.5, lineHeight: 1.45 },
} as const
