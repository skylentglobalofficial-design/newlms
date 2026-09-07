// Semantic theme tokens — CSS custom properties in index.css are the source of truth.
// Use these in inline styles so components respond to Light / Dark / System.

export const S = {
  canvas: "var(--skylent-canvas)",
  surface: "var(--skylent-surface)",
  elevated: "var(--skylent-elevated)",
  glass: "var(--skylent-glass-bg)",
  text: "var(--skylent-text)",
  textSecondary: "var(--skylent-text-secondary)",
  textMuted: "var(--skylent-text-muted)",
  border: "var(--skylent-border)",
  borderSubtle: "var(--skylent-border-subtle)",
  accent: "var(--skylent-accent)",
  accentForeground: "var(--skylent-accent-foreground)",
  inputBg: "var(--skylent-input-bg)",
  inputBorder: "var(--skylent-input-border)",
  cardBg: "var(--skylent-card-bg)",
  navBg: "var(--skylent-nav-bg)",
  footerBg: "var(--skylent-footer-bg)",
  focusRing: "var(--skylent-focus-ring)",
  successSurface: "var(--skylent-success-surface)",
  warningSurface: "var(--skylent-warning-surface)",
  errorSurface: "var(--skylent-error-surface)",
} as const
