// Skylent public-site design tokens — single source of truth for JS inline styles.
// CSS custom properties live in index.css; keep both in sync.

export const C = {
  ink: '#0B0D0F',
  ink2: '#14171A',
  ink3: '#1D2126',
  orange: '#F36B21',
  warmWhite: '#F8F6F2',
  sand: '#EEE9E1',
  slate: '#667078',
  white: '#FFFFFF',
  black: '#050505',
  canvas: '#050505',
} as const

export const T = {
  rControl: 8,
  rCard: 16,
  rPill: 100,
  section: 'clamp(88px, 12vw, 140px)',
  sectionSm: 'clamp(64px, 8vw, 96px)',
  sectionTight: 'clamp(48px, 6vw, 72px)',
  sectionCompact: 'clamp(40px, 5vw, 60px)',
  gutter: 'clamp(20px, 5vw, 32px)',
  maxW: 1240,
  navH: 64,
  lineLight: 'rgba(11,13,15,0.08)',
  lineStrong: 'rgba(11,13,15,0.14)',
  lineDark: 'rgba(255,255,255,0.09)',
  lineDarkStrong: 'rgba(255,255,255,0.16)',
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

export const glass = {
  1: {
    bg: 'var(--glass-01-bg)',
    border: 'var(--glass-01-border)',
    blur: 'var(--glass-01-blur)',
    shadow: 'var(--glass-01-shadow)',
  },
  2: {
    bg: 'var(--glass-02-bg)',
    border: 'var(--glass-02-border)',
    blur: 'var(--glass-02-blur)',
    shadow: 'var(--glass-02-shadow)',
  },
  3: {
    bg: 'var(--glass-03-bg)',
    border: 'var(--glass-03-border)',
    blur: 'var(--glass-03-blur)',
    shadow: 'var(--glass-03-shadow)',
  },
} as const
