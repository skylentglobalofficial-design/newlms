import { AURORA_THEMES, type AuroraThemeId } from '../aurora-themes'

/**
 * The Aurora accents were chosen to glow on a near-black canvas. Several of
 * them (sky, cyan, amber) fall below 4.5:1 against white, so light surfaces use
 * a hand-tuned ink-safe pair: `solid` for fills, `text` for type on white.
 */
const ON_LIGHT: Record<AuroraThemeId, { solid: string; text: string }> = {
  general: { solid: '#4F46E5', text: '#4338CA' },
  'data-science': { solid: '#7C3AED', text: '#6D28D9' },
  'data-analytics': { solid: '#0E7490', text: '#155E75' },
  'full-stack': { solid: '#047857', text: '#065F46' },
  jee: { solid: '#B45309', text: '#92400E' },
  neet: { solid: '#BE185D', text: '#9D174D' },
  cat: { solid: '#7E22CE', text: '#6B21A8' },
  schooling: { solid: '#0369A1', text: '#075985' },
  undergraduate: { solid: '#1D4ED8', text: '#1E40AF' },
  postgraduate: { solid: '#6D28D9', text: '#5B21B6' },
  professional: { solid: '#047857', text: '#065F46' },
  certificate: { solid: '#0E7490', text: '#155E75' },
  webinar: { solid: '#BE185D', text: '#9D174D' },
  career: { solid: '#1D4ED8', text: '#1E40AF' },
  institution: { solid: '#0F766E', text: '#115E59' },
  superadmin: { solid: '#1D4ED8', text: '#1E40AF' },
}

export type SurfaceAccent = {
  /** Saturated fill for buttons, active bars and progress. */
  solid: string
  /** Ink-safe colour for accent text on white. */
  text: string
  /** Tinted background for chips and selected rows. */
  soft: string
  /** Tinted background, one step stronger. */
  softStrong: string
  /** Hairline that reads on white. */
  line: string
  /** The original Aurora hue, for dark bands and gradients. */
  glow: string
  glowSecondary: string
}

export function getSurfaceAccent(themeId: AuroraThemeId): SurfaceAccent {
  const aurora = AURORA_THEMES[themeId]
  const { solid, text } = ON_LIGHT[themeId]
  return {
    solid,
    text,
    soft: `${solid}12`,
    softStrong: `${solid}1F`,
    line: `${solid}33`,
    glow: aurora.primary,
    glowSecondary: aurora.secondary,
  }
}
