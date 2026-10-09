// Skylent design tokens — single source of truth for JS inline styles.
// CSS custom properties live in src/styles/design-system.css; keep both in sync.
//
// One frozen palette on every surface (public site, login, dashboards, learning player, Career OS):
//   white workspace · warm paper for proof only · deep navy ink and product anchors ·
//   cobalt for action and progress · cyan for the Skylent AI mark only.
// Type: Space Grotesk (headings), DM Sans (body), DM Mono (labels, numbers, code). No serif.
// Navy surfaces are product anchors: the shell rail, product top bars and the code workbench.

export const C = {
  // Themeable tokens resolve through the CSS custom properties in
  // src/styles/design-system.css (:root = the signed-in product). Inside the public shell
  // (.skylent-public-canvas, src/skylent-public.css) the same properties are re-declared.
  // Legacy names are kept so call sites stay stable: `orange` and `indigo` are cobalt,
  // `cream` and `warmWhite` are white.
  ink: 'var(--skylent-color-ink)',
  ink2: 'var(--skylent-color-ink-2)',
  ink3: 'var(--skylent-color-ink-3)',
  orange: 'var(--skylent-color-mark)',
  indigo: 'var(--skylent-color-accent)',
  blue: 'var(--skylent-color-accent-hover)',
  warmWhite: 'var(--skylent-color-paper)',
  cream: 'var(--skylent-color-cream)',
  creamWarm: 'var(--skylent-surface-cream-warm)',
  soft: 'var(--skylent-color-soft)',
  sand: 'var(--skylent-color-sand)',
  slate: 'var(--skylent-color-slate)',
  muted: 'var(--skylent-color-muted)',
  textSubtle: 'var(--skylent-color-text-subtle)',
  white: '#FFFFFF',
  black: 'var(--skylent-color-ink)',
  canvas: 'var(--skylent-color-canvas)',
  success: 'var(--skylent-color-success)',
  warning: 'var(--skylent-color-warning)',
  information: 'var(--skylent-color-info)',
  danger: 'var(--skylent-color-error)',
  surfaceProductDark: '#0B1220',
  textOnDark: '#E8ECF5',
  mutedOnDark: '#9AA6BF',
  textOnAccent: '#FFFFFF',
  // Frozen-system additions
  navy: '#0B1220',
  navyRaised: '#141C2E',
  navyLine: '#26304A',
  onNavy: '#E8ECF5',
  onNavyMuted: '#9AA6BF',
  cobalt: '#2563FF',
  cobaltTint: '#EAF0FF',
  proof: '#F5F7FB',
  proofInset: '#EDF1F7',
  proofLine: '#E6E1D6',
  cyan: '#22C7F2',
} as const

/** Public surfaces — mirrors --skylent-surface-* in design-system.css */
export const surfaces = {
  paper: C.warmWhite,
  cream: C.cream,
  creamWarm: C.creamWarm,
  soft: C.soft,
  sand: C.sand,
  elevated: C.white,
  inverse: C.ink,
} as const

/** Semantic color groups for inline styles */
export const colors = {
  text: {
    ink: C.ink,
    slate: C.slate,
    muted: C.muted,
    subtle: C.textSubtle,
    inverse: C.textOnAccent,
    inverseMuted: '#9AA6BF',
    onDark: C.textOnDark,
    onAccent: C.textOnAccent,
  },
  border: {
    subtle: '#E6EAF2',
    default: '#DDE2EC',
    strong: '#A9B4C8',
  },
  accent: {
    default: C.indigo,
    hover: C.blue,
    soft: '#EAF0FF',
    border: '#BFD0FF',
    strong: '#1D4FD8',
  },
  orange: {
    default: C.orange,
    soft: '#EAF0FF',
    strong: '#1D4FD8',
  },
  state: {
    success: { fg: C.success, soft: '#EAF0FF', border: '#BFD0FF' },
    warning: { fg: C.warning, soft: '#F6F8FB', border: '#A9B4C8' },
    error: { fg: C.danger, soft: 'rgba(182,37,32,0.05)', border: 'rgba(182,37,32,0.3)' },
    info: { fg: C.information, soft: '#EAF0FF', border: '#BFD0FF' },
  },
  productDark: {
    bg: C.surfaceProductDark,
    surface: '#141C2E',
    muted: C.mutedOnDark,
    border: '#26304A',
    accent: C.indigo,
  },
  overlay: {
    scrim: 'rgba(11,18,32,0.45)',
    soft: 'rgba(11,18,32,0.3)',
  },
} as const

/** @deprecated Prefer `surfaces` / `colors` — flat aliases for existing call sites */
export const semantic = {
  paper: surfaces.paper,
  cream: surfaces.cream,
  softSurface: surfaces.elevated,
  ink: C.ink,
  muted: C.muted,
  border: colors.border.default,
  borderStrong: colors.border.strong,
  accent: colors.accent.default,
  accentHover: colors.accent.hover,
  success: C.success,
  warning: C.warning,
  error: C.danger,
  information: C.information,
  surfaceProductDark: C.surfaceProductDark,
} as const

export const T = {
  rControl: 8,
  rCard: 12,
  rPill: 100,
  section: 'var(--skylent-section-pad)',
  sectionSm: 'var(--skylent-section-pad-sm)',
  sectionTight: 'clamp(48px, 6vw, 72px)',
  sectionCompact: 'var(--skylent-section-pad-compact)',
  sectionSpacious: 'var(--skylent-section-pad-spacious)',
  gutter: 'var(--skylent-gutter-page)',
  maxW: 1360,
  maxWProse: 720,
  maxWNarrow: 560,
  maxWWorkspace: 1040,
  maxWCareer: 1120,
  navH: 64,
  lineLight: '#DDE2EC',
  lineStrong: '#A9B4C8',
  lineDark: '#DDE2EC',
  lineDarkStrong: '#A9B4C8',
  shadow: '0 1px 2px rgba(11,18,32,0.05), 0 18px 40px -24px rgba(11,18,32,0.22)',
  shadowLg: '0 1px 2px rgba(11,18,32,0.06), 0 28px 56px -28px rgba(11,18,32,0.30)',
} as const

/** Radius & elevation — mirrors components.css / design-system.css */
export const radius = {
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  control: 'var(--radius-control)',
  card: 'var(--radius-card)',
  modal: 'var(--radius-modal)',
  pill: 100,
} as const

export const elevation = {
  none: 'var(--shadow-elevation-none)',
  subtle: 'var(--shadow-elevation-subtle)',
  raised: 'var(--shadow-elevation-raised)',
  overlay: 'var(--shadow-elevation-overlay)',
} as const

/** Shared component metrics & state tokens for inline styles */
export const components = {
  controlHeight: {
    sm: 'var(--skylent-control-height-sm)',
    md: 'var(--skylent-control-height-md)',
    lg: 'var(--skylent-control-height-lg)',
  },
  focusRing: 'var(--skylent-focus-ring)',
  focusOffset: 'var(--skylent-focus-offset)',
  disabledOpacity: 'var(--skylent-disabled-opacity)',
  duration: {
    fast: 'var(--skylent-duration-fast)',
    ui: 'var(--skylent-duration-ui)',
  },
} as const

/** 4px-based spacing scale (matches --space-* in design-system.css). */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  11: 56,
  12: 64,
  13: 80,
  14: 96,
  15: 120,
} as const

/** Layout tokens — mirrors semantic layout vars in design-system.css / layout.css */
export const layout = {
  gutterPage: 'var(--skylent-gutter-page)',
  gutterSection: 'var(--skylent-gutter-section)',
  sectionPad: 'var(--skylent-section-pad)',
  sectionPadSm: 'var(--skylent-section-pad-sm)',
  sectionPadCompact: 'var(--skylent-section-pad-compact)',
  sectionPadSpacious: 'var(--skylent-section-pad-spacious)',
  sectionPadHeroStart: 'var(--skylent-section-pad-hero-block-start)',
  sectionPadHeroEnd: 'var(--skylent-section-pad-hero-block-end)',
  rail: 'var(--rail)',
  gapGrid: 'var(--skylent-gap-grid)',
  gapGridTight: 'var(--skylent-gap-grid-tight)',
  gapGridLoose: 'var(--skylent-gap-grid-loose)',
  gapEditorial: 'var(--skylent-gap-editorial)',
  gapCards: 'var(--skylent-gap-cards)',
  gapStack: 'var(--skylent-gap-stack)',
  measureReading: 'var(--skylent-measure-reading)',
  measureNarrow: 'var(--skylent-measure-narrow)',
  maxContent: 1360,
  maxWide: 1360,
  maxProse: 720,
  maxNarrow: 560,
  maxWorkspace: 1040,
  maxCareer: 1120,
} as const

/** Layout breakpoints (px) — use in JS matchMedia; CSS uses the same literals. */
export const breakpoints = {
  xs: 390,
  sm: 640,
  md: 768,
  lg: 900,
  xl: 1100,
  '2xl': 1360,
} as const

/** Semantic typography roles — mirrors --skylent-t-* in src/styles/design-system.css */
export const typography = {
  display: {
    xl: {
      family: 'var(--skylent-t-display-xl-family)',
      size: 'var(--skylent-t-display-xl-size)',
      line: 'var(--skylent-t-display-xl-line)',
      weight: 'var(--skylent-t-display-xl-weight)',
      tracking: 'var(--skylent-t-display-xl-tracking)',
    },
    lg: {
      family: 'var(--skylent-t-display-lg-family)',
      size: 'var(--skylent-t-display-lg-size)',
      line: 'var(--skylent-t-display-lg-line)',
      weight: 'var(--skylent-t-display-lg-weight)',
      tracking: 'var(--skylent-t-display-lg-tracking)',
    },
    md: {
      family: 'var(--skylent-t-display-md-family)',
      size: 'var(--skylent-t-display-md-size)',
      line: 'var(--skylent-t-display-md-line)',
      weight: 'var(--skylent-t-display-md-weight)',
      tracking: 'var(--skylent-t-display-md-tracking)',
    },
  },
  heading: {
    xl: {
      family: 'var(--skylent-t-heading-xl-family)',
      size: 'var(--skylent-t-heading-xl-size)',
      line: 'var(--skylent-t-heading-xl-line)',
      weight: 'var(--skylent-t-heading-xl-weight)',
      tracking: 'var(--skylent-t-heading-xl-tracking)',
    },
    lg: {
      family: 'var(--skylent-t-heading-lg-family)',
      size: 'var(--skylent-t-heading-lg-size)',
      line: 'var(--skylent-t-heading-lg-line)',
      weight: 'var(--skylent-t-heading-lg-weight)',
      tracking: 'var(--skylent-t-heading-lg-tracking)',
    },
    md: {
      family: 'var(--skylent-t-heading-md-family)',
      size: 'var(--skylent-t-heading-md-size)',
      line: 'var(--skylent-t-heading-md-line)',
      weight: 'var(--skylent-t-heading-md-weight)',
      tracking: 'var(--skylent-t-heading-md-tracking)',
    },
    sm: {
      family: 'var(--skylent-t-heading-sm-family)',
      size: 'var(--skylent-t-heading-sm-size)',
      line: 'var(--skylent-t-heading-sm-line)',
      weight: 'var(--skylent-t-heading-sm-weight)',
      tracking: 'var(--skylent-t-heading-sm-tracking)',
    },
  },
  body: {
    lg: {
      family: 'var(--skylent-t-body-lg-family)',
      size: 'var(--skylent-t-body-lg-size)',
      line: 'var(--skylent-t-body-lg-line)',
      weight: 'var(--skylent-t-body-lg-weight)',
      tracking: 'var(--skylent-t-body-lg-tracking)',
    },
    md: {
      family: 'var(--skylent-t-body-md-family)',
      size: 'var(--skylent-t-body-md-size)',
      line: 'var(--skylent-t-body-md-line)',
      weight: 'var(--skylent-t-body-md-weight)',
      tracking: 'var(--skylent-t-body-md-tracking)',
    },
    sm: {
      family: 'var(--skylent-t-body-sm-family)',
      size: 'var(--skylent-t-body-sm-size)',
      line: 'var(--skylent-t-body-sm-line)',
      weight: 'var(--skylent-t-body-sm-weight)',
      tracking: 'var(--skylent-t-body-sm-tracking)',
    },
  },
  label: {
    lg: {
      family: 'var(--skylent-t-label-lg-family)',
      size: 'var(--skylent-t-label-lg-size)',
      line: 'var(--skylent-t-label-lg-line)',
      weight: 'var(--skylent-t-label-lg-weight)',
      tracking: 'var(--skylent-t-label-lg-tracking)',
    },
    md: {
      family: 'var(--skylent-t-label-md-family)',
      size: 'var(--skylent-t-label-md-size)',
      line: 'var(--skylent-t-label-md-line)',
      weight: 'var(--skylent-t-label-md-weight)',
      tracking: 'var(--skylent-t-label-md-tracking)',
    },
    sm: {
      family: 'var(--skylent-t-label-sm-family)',
      size: 'var(--skylent-t-label-sm-size)',
      line: 'var(--skylent-t-label-sm-line)',
      weight: 'var(--skylent-t-label-sm-weight)',
      tracking: 'var(--skylent-t-label-sm-tracking)',
    },
  },
  eyebrow: {
    family: 'var(--skylent-t-eyebrow-family)',
    size: 'var(--skylent-t-eyebrow-size)',
    line: 'var(--skylent-t-eyebrow-line)',
    weight: 'var(--skylent-t-eyebrow-weight)',
    tracking: 'var(--skylent-t-eyebrow-tracking)',
  },
  caption: {
    family: 'var(--skylent-t-caption-family)',
    size: 'var(--skylent-t-caption-size)',
    line: 'var(--skylent-t-caption-line)',
    weight: 'var(--skylent-t-caption-weight)',
    tracking: 'var(--skylent-t-caption-tracking)',
  },
  nav: {
    family: 'var(--skylent-t-nav-family)',
    size: 'var(--skylent-t-nav-size)',
    line: 'var(--skylent-t-nav-line)',
    weight: 'var(--skylent-t-nav-weight)',
    tracking: 'var(--skylent-t-nav-tracking)',
  },
  measure: {
    prose: 'var(--skylent-measure-prose)',
    narrow: 'var(--skylent-measure-narrow)',
  },
} as const

/** @deprecated Prefer `typography.*` — kept for existing inline style call sites */
export const type = {
  displayXl: typography.display.xl.size,
  displayLg: typography.display.lg.size,
  displayMd: typography.display.md.size,
  displaySm: 'clamp(20px, 2.2vw, 26px)',
  bodyLg: typography.body.lg.size,
  body: typography.body.md.size,
  bodySm: typography.body.sm.size,
  label: typography.label.md.size,
  caption: typography.caption.size,
  nav: typography.nav.size,
  stat: 'var(--skylent-t-stat-size)',
} as const

export const fonts = {
  heading: "'Inter', system-ui, sans-serif",
  /** @deprecated Legacy name. There is no serif in the system; this is the heading face. */
  serif: "'Inter', system-ui, sans-serif",
  sans: "'Inter', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace",
} as const

export type GlassLevel = 1 | 2 | 3

/** Raised surfaces — solid white, cool hairline, no blur. */
export const glass = {
  1: {
    bg: 'var(--skylent-color-cream)',
    border: '#DDE2EC',
    blur: 'none',
    shadow: '0 1px 2px rgba(11,18,32,0.05)',
  },
  2: {
    bg: '#FFFFFF',
    border: '#DDE2EC',
    blur: 'none',
    shadow: '0 1px 2px rgba(11,18,32,0.05), 0 18px 40px -24px rgba(11,18,32,0.22)',
  },
  3: {
    bg: '#FFFFFF',
    border: '#DDE2EC',
    blur: 'none',
    shadow: '0 1px 2px rgba(11,18,32,0.06), 0 28px 56px -28px rgba(11,18,32,0.30)',
  },
} as const

/** Opt-in CSS class names from design-system.css (for documentation / gradual adoption). */
export const dsClass = {
  btn: 'skylent-btn',
  btnPrimary: 'skylent-btn skylent-btn--primary',
  btnSecondary: 'skylent-btn skylent-btn--secondary',
  btnGhost: 'skylent-btn skylent-btn--ghost',
  btnDestructive: 'skylent-btn skylent-btn--destructive',
  btnFull: 'skylent-btn--full',
  card: 'skylent-card',
  cardRaised: 'skylent-card skylent-card--raised',
  cardInteractive: 'skylent-card skylent-card--interactive',
  cardPad: 'skylent-card--pad',
  cardProductDark: 'skylent-card skylent-card--product-dark',
  badge: 'skylent-badge',
  badgeAccent: 'skylent-badge skylent-badge--accent',
  badgeSuccess: 'skylent-badge skylent-badge--success',
  badgeWarning: 'skylent-badge skylent-badge--warning',
  badgeError: 'skylent-badge skylent-badge--error',
  badgeInfo: 'skylent-badge skylent-badge--info',
  input: 'skylent-input',
  fieldLabel: 'skylent-field-label',
  fieldError: 'skylent-field-error',
  tabs: 'skylent-tabs',
  tabsScroll: 'skylent-tabs skylent-tabs--scroll',
  tab: 'skylent-tab',
  navItem: 'skylent-nav-item',
  textLink: 'skylent-text-link',
  linkMuted: 'skylent-link-muted',
  spinner: 'skylent-spinner',
  stateInline: 'skylent-state-inline',
  stateLoading: 'skylent-state-panel skylent-state-panel--loading',
  modalScrim: 'skylent-modal-scrim',
  modalPanel: 'skylent-modal-panel',
  progress: 'skylent-progress',
  stateEmpty: 'skylent-state-panel skylent-state-panel--empty',
  stateErrorPanel: 'skylent-state-panel skylent-state-panel--error',
  stateSuccessPanel: 'skylent-state-panel skylent-state-panel--success',
  stateInfoPanel: 'skylent-state-panel skylent-state-panel--info',
  sectionHeader: 'skylent-section-header',
  link: 'skylent-link',
  displayXl: 'skylent-t-display-xl',
  displayLg: 'skylent-t-display-lg',
  headingXl: 'skylent-t-heading-xl',
  bodyLg: 'skylent-t-body-lg',
  bodyMd: 'skylent-t-body-md',
  eyebrow: 'skylent-t-eyebrow',
  caption: 'skylent-t-caption',
  measure: 'skylent-measure',
  measureReading: 'skylent-measure-reading',
  page: 'skylent-page',
  rail: 'skylent-rail',
  container: 'skylent-container',
  containerProse: 'skylent-container--prose',
  containerNarrow: 'skylent-container--narrow',
  section: 'skylent-section',
  sectionCompact: 'skylent-section--compact',
  sectionSm: 'skylent-section--sm',
  sectionSpacious: 'skylent-section--spacious',
  sectionHero: 'skylent-section--hero',
  grid: 'skylent-grid',
  layoutEditorial: 'skylent-layout-editorial',
  layoutAsymmetric: 'skylent-layout-asymmetric',
  layoutCards3: 'skylent-layout-cards-3',
  layoutDiscovery4: 'skylent-layout-discovery-4',
  stack6: 'skylent-stack-6',
  surfacePaper: 'skylent-surface-paper',
  surfaceCream: 'skylent-surface-cream',
  surfaceSoft: 'skylent-surface-soft',
  surfaceProductDark: 'skylent-surface-product-dark',
  stateSuccessSurface: 'skylent-state-success',
  stateErrorSurface: 'skylent-state-error',
  stateWarningSurface: 'skylent-state-warning',
  stateInfoSurface: 'skylent-state-info',
} as const
