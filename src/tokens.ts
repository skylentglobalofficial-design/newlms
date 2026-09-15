// Skylent design tokens — single source of truth for JS inline styles.
// CSS custom properties live in index.css; keep both in sync.
//
// LIGHT ONLY (non-negotiable — public site, login, dashboard, LMS / Skylent OS, Career OS):
//   canvas  #F7F4EC  warm ivory
//   cream   #FFFDF8  warm cream
//   white   #FFFFFF
//   ink     #15171A  dark ink
//   slate   #5C6168
//   sand    #E8E2D6  borders
//   indigo  #4F46E5  primary action
//   blue    #2563EB  semantic secondary
//   orange  #F97316  brand mark only
// There is no dark mode and no separate dark LMS theme.

export const C = {
  ink: '#15171A',
  ink2: '#1C1F24',
  ink3: '#2A2E35',
  orange: '#F97316',
  indigo: '#4F46E5',
  blue: '#2563EB',
  warmWhite: '#F7F4EC',
  cream: '#FFFDF8',
  sand: '#E8E2D6',
  slate: '#5C6168',
  muted: '#6E737A',
  white: '#FFFFFF',
  black: '#15171A',
  canvas: '#F7F4EC',
  success: '#15803D',
  danger: '#B91C1C',
} as const

export const T = {
  rControl: 8,
  rCard: 12,
  rPill: 100,
  section: 'clamp(88px, 12vw, 140px)',
  sectionSm: 'clamp(64px, 8vw, 96px)',
  sectionTight: 'clamp(48px, 6vw, 72px)',
  sectionCompact: 'clamp(40px, 5vw, 60px)',
  gutter: 'clamp(20px, 5vw, 32px)',
  maxW: 1240,
  navH: 64,
  lineLight: 'rgba(21,23,26,0.10)',
  lineStrong: 'rgba(21,23,26,0.16)',
  lineDark: 'rgba(21,23,26,0.10)',
  lineDarkStrong: 'rgba(21,23,26,0.16)',
  shadow: '0 8px 24px rgba(21,23,26,0.06)',
  shadowLg: '0 16px 40px rgba(21,23,26,0.08)',
} as const

export const type = {
  displayXl: 'clamp(40px, 6vw, 84px)',
  displayLg: 'clamp(34px, 5.2vw, 64px)',
  displayMd: 'clamp(28px, 3.6vw, 44px)',
  displaySm: 'clamp(24px, 3vw, 34px)',
  bodyLg: 'clamp(16px, 2vw, 18px)',
  body: '15px',
  bodySm: '13.5px',
  label: '11px',
  caption: '10px',
} as const

export type GlassLevel = 1 | 2 | 3

/** Raised surfaces — solid cream/white, thin border, no blur. */
export const glass = {
  1: {
    bg: '#FFFDF8',
    border: 'rgba(21,23,26,0.10)',
    blur: 'none',
    shadow: '0 4px 16px rgba(21,23,26,0.05)',
  },
  2: {
    bg: '#FFFFFF',
    border: 'rgba(21,23,26,0.10)',
    blur: 'none',
    shadow: '0 8px 24px rgba(21,23,26,0.06)',
  },
  3: {
    bg: '#FFFFFF',
    border: 'rgba(21,23,26,0.10)',
    blur: 'none',
    shadow: '0 12px 32px rgba(21,23,26,0.07)',
  },
} as const
