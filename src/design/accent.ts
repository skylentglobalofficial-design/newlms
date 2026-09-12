import { AURORA_THEMES, type AuroraThemeId } from '../aurora-themes'

/**
 * Public product accents on ivory. Indigo is the default action colour.
 * Domain hues stay distinct for marks and academic maps, but green/teal is
 * not a brand accent — those remain semantic (available / completed).
 */
const ON_LIGHT: Record<AuroraThemeId, { solid: string; text: string }> = {
  general: { solid: '#4F46E5', text: '#4338CA' },
  'data-science': { solid: '#4F46E5', text: '#4338CA' },
  'data-analytics': { solid: '#2563EB', text: '#1D4ED8' },
  'full-stack': { solid: '#4F46E5', text: '#4338CA' },
  jee: { solid: '#B45309', text: '#92400E' },
  neet: { solid: '#BE185D', text: '#9D174D' },
  cat: { solid: '#6D28D9', text: '#5B21B6' },
  schooling: { solid: '#2563EB', text: '#1D4ED8' },
  undergraduate: { solid: '#1D4ED8', text: '#1E40AF' },
  postgraduate: { solid: '#4F46E5', text: '#4338CA' },
  professional: { solid: '#4F46E5', text: '#4338CA' },
  certificate: { solid: '#4F46E5', text: '#4338CA' },
  webinar: { solid: '#4F46E5', text: '#4338CA' },
  career: { solid: '#1D4ED8', text: '#1E40AF' },
  institution: { solid: '#1E3A5F', text: '#1E3A5F' },
  superadmin: { solid: '#4F46E5', text: '#4338CA' },
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
