import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FadeIn } from './shared'
import { C, T, glass, type } from '../tokens'
import { MediaImage } from './foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

const brandAccent = getDomainAccent('general')

// Re-export tokens for backward compatibility
export { T } from '../tokens'
export { MediaImage } from './foundation'

// ─────────────────────────────────────────────────────────────────────────────
// Skylent shared design-system primitives.
// Restrained, editorial, technology-forward. Orange is a scarce accent.
// ─────────────────────────────────────────────────────────────────────────────

type Tone = 'light' | 'dark' | 'canvas'

// ── Section wrapper ──────────────────────────────────────────────────────────
function sectionBg(tone: Tone, bg?: string): string {
  if (bg) return bg
  if (tone === 'canvas') return C.warmWhite
  if (tone === 'dark') return C.warmWhite
  return C.warmWhite
}

export function Section({
  children,
  bg,
  tone = 'light',
  style,
  id,
  divider,
}: {
  children: React.ReactNode
  bg?: string
  tone?: Tone
  style?: React.CSSProperties
  id?: string
  divider?: boolean
}) {
  const background = sectionBg(tone, bg)
  const textColor = C.ink
  return (
    <>
      {divider && <div className="skylent-section-divider" />}
      <section
        id={id}
        style={{
          background,
          color: textColor,
          padding: `${T.section} ${T.gutter}`,
          position: 'relative',
          ...style,
        }}
      >
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative' }}>{children}</div>
      </section>
    </>
  )
}

// ── Eyebrow (mono label) ─────────────────────────────────────────────────────
export function Eyebrow({ children, tone = 'light', accent }: { children: React.ReactNode; tone?: Tone; accent?: boolean }) {
  const color = accent ? brandAccent.text : C.slate
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
      <span style={{ width: 20, height: 1, background: 'currentColor', opacity: 0.5 }} />
      {children}
    </div>
  )
}

// ── Section heading ──────────────────────────────────────────────────────────
export function Heading({
  children,
  tone = 'light',
  size = 'lg',
  style,
}: {
  children: React.ReactNode
  tone?: Tone
  size?: 'sm' | 'md' | 'lg' | 'xl'
  style?: React.CSSProperties
}) {
  const sizes = {
    sm: 'clamp(24px, 3vw, 34px)',
    md: 'clamp(28px, 3.6vw, 44px)',
    lg: 'clamp(32px, 4.4vw, 58px)',
    xl: 'clamp(40px, 6vw, 84px)',
  }
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: sizes[size], lineHeight: 1.04, letterSpacing: '-0.03em', color: C.ink, margin: 0, ...style }}>
      {children}
    </h2>
  )
}

// ── Section header (eyebrow + heading + optional lead + optional action) ──────
export function SectionHeader({
  eyebrow,
  title,
  lead,
  tone = 'light',
  align = 'left',
  action,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  tone?: Tone
  align?: 'left' | 'center'
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', textAlign: align, ...(align === 'center' ? { flexDirection: 'column', alignItems: 'center' } : {}) }}>
      <div style={{ maxWidth: align === 'center' ? 760 : 640, ...(align === 'center' ? { margin: '0 auto' } : {}) }}>
        {eyebrow && <div style={{ marginBottom: 22 }}><Eyebrow tone={tone}>{eyebrow}</Eyebrow></div>}
        <Heading tone={tone}>{title}</Heading>
        {lead && (
          <p style={{ color: C.slate, fontSize: type.bodyLg, lineHeight: 1.7, margin: '22px 0 0', maxWidth: 560, ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }}>{lead}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light'
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  full,
  style,
  type = 'button',
  themeId,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  style?: React.CSSProperties
  type?: 'button' | 'submit'
  themeId?: AuroraThemeId
}) {
  const accent = themeId ? getDomainAccent(themeId) : brandAccent
  const primaryFill = accent.primary
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '9px 18px' : '13px 26px'
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14.5
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: T.rControl, padding: pad, fontSize, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-body)', border: '1px solid transparent', transition: 'all 0.22s ease',
    width: full ? '100%' : undefined, whiteSpace: 'nowrap', letterSpacing: '-0.01em',
  }
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: primaryFill, color: C.white },
    secondary: { background: 'transparent', color: C.ink, borderColor: T.lineStrong },
    ghost: { background: 'transparent', color: C.ink, borderColor: T.lineStrong },
    dark: { background: primaryFill, color: C.white },
    light: { background: C.cream, color: C.ink, borderColor: T.lineLight },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.background = accent.secondary; t.style.transform = 'translateY(-1px)' }
        else if (variant === 'dark') { t.style.background = accent.secondary; t.style.transform = 'translateY(-1px)' }
        else if (variant === 'light') { t.style.transform = 'translateY(-1px)'; t.style.boxShadow = '0 10px 30px rgba(21,23,26,0.08)' }
        else if (variant === 'secondary') t.style.borderColor = C.ink
        else t.style.borderColor = C.ink
      }}
      onMouseLeave={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.background = primaryFill; t.style.transform = 'none' }
        else if (variant === 'dark') { t.style.background = primaryFill; t.style.transform = 'none' }
        else if (variant === 'light') { t.style.transform = 'none'; t.style.boxShadow = 'none' }
        else if (variant === 'secondary') t.style.borderColor = T.lineStrong
        else t.style.borderColor = T.lineStrong
      }}
    >
      {children}
    </button>
  )
}

// ── Text link with underline reveal ──────────────────────────────────────────
export function TextLink({ children, onClick, tone = 'light' }: { children: React.ReactNode; onClick?: () => void; tone?: Tone }) {
  const color = C.ink
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${color}`, paddingBottom: 2 }}>
      {children} <span aria-hidden>→</span>
    </button>
  )
}

// ── Badge / pill ─────────────────────────────────────────────────────────────
export function Badge({ children, tone = 'light', accent }: { children: React.ReactNode; tone?: Tone; accent?: boolean }) {
  const styles: React.CSSProperties = accent
    ? { background: brandAccent.subtle, border: `1px solid ${brandAccent.border}`, color: brandAccent.text }
    : { background: C.cream, border: `1px solid ${T.lineStrong}`, color: C.slate }
  return (
    <span style={{ ...styles, borderRadius: 6, padding: '4px 11px', fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// ── Card (light or dark, optional hover lift) ────────────────────────────────
export function Card({
  children,
  tone = 'light',
  hover = true,
  onClick,
  style,
}: {
  children: React.ReactNode
  tone?: Tone
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = { background: C.cream, border: `1px solid ${T.lineLight}` }
  return (
    <div
      onClick={onClick}
      style={{ borderRadius: T.rCard, padding: 30, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', cursor: onClick ? 'pointer' : 'default', ...base, ...style }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = T.shadow
        e.currentTarget.style.borderColor = T.lineStrong
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = T.lineLight
      } : undefined}
    >
      {children}
    </div>
  )
}

// ── Product surface (solid cream/white, for UI mockups) ─────────────────────
export function ProductSurface({ children, style, depth = 2 }: { children: React.ReactNode; style?: React.CSSProperties; depth?: 1 | 2 | 3 }) {
  const g = glass[depth]
  return (
    <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: T.rCard, boxShadow: g.shadow, ...style }}>
      {children}
    </div>
  )
}

// ── Stat block ───────────────────────────────────────────────────────────────
export function Stat({ value, label, tone = 'light' }: { value: string; label: string; tone?: Tone }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 3.6vw, 46px)', fontWeight: 600, letterSpacing: '-0.03em', color: C.ink }}>{value}</div>
      <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ── Grid background overlay (subtle technical texture for dark sections) ──────
export { GridField } from './foundation'

// ── Glow (single restrained radial accent) ───────────────────────────────────
export function Glow(_props?: { x?: string; y?: string; size?: number; color?: string; strength?: string }) {
  return null
}

// ── Page hero (shared editorial hero for interior pages) ─────────────────────
export function PageHero({
  eyebrow,
  title,
  lead,
  tone = 'light',
  bg = C.canvas,
  actions,
  children,
  photo,
  photoAlt,
  auroraTheme,
  photoAspect = '4/3',
}: {
  eyebrow: string
  title: React.ReactNode
  lead?: React.ReactNode
  tone?: Tone
  bg?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  photo?: string
  photoAlt?: string
  auroraTheme?: AuroraThemeId
  photoAspect?: '4/3' | '16/9' | '4/5' | '3/2'
}) {
  return (
    <section style={{ background: bg, position: 'relative', overflow: 'hidden', padding: `clamp(88px, 10vw, 120px) ${T.gutter} clamp(48px, 6vw, 72px)` }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: photo ? '1.05fr 0.95fr' : '1fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'center' }} className="two-col skylent-page-hero">
          <div>
            <div style={{ marginBottom: 20 }}><Eyebrow tone="light" accent>{eyebrow}</Eyebrow></div>
            <h1 className="skylent-display-lg" style={{ color: C.ink, margin: 0, maxWidth: 720 }}>
              {title}
            </h1>
            {lead && (
              <p className="skylent-body-lg" style={{ color: C.slate, margin: '20px 0 0', maxWidth: 520 }}>{lead}</p>
            )}
            {actions && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>{actions}</div>}
            {children}
          </div>
          {photo && (
            <MediaImage
              src={photo}
              alt={photoAlt ?? ''}
              aspect={photoAspect}
              className="skylent-hero-visual"
              overlay="bottom"
            />
          )}
        </div>
      </div>
    </section>
  )
}

// ── Flow / journey strip (Professional Program → Career OS style) ─────────────
export function FlowStrip({ steps }: { steps: { label: string; sub?: string; highlight?: boolean }[]; tone?: Tone }) {
  return (
    <div className="flow-strip" style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 130, padding: '16px 0', borderTop: `1px solid ${s.highlight ? brandAccent.border : T.lineLight}` }}>
            <div style={{ color: s.highlight ? brandAccent.text : C.ink, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{s.label}</div>
            {s.sub && <div style={{ color: C.slate, fontSize: 11.5, marginTop: 4 }}>{s.sub}</div>}
          </div>
          {i < steps.length - 1 && <div className="flow-arrow" style={{ color: C.slate, padding: '0 14px', fontSize: 16, flexShrink: 0 }}>→</div>}
        </div>
      ))}
    </div>
  )
}

// ── CTA band ─────────────────────────────────────────────────────────────────
export function CTABand({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  bg = C.cream,
  tone = 'light',
  auroraTheme: _auroraTheme,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
  bg?: string
  tone?: Tone
  auroraTheme?: AuroraThemeId
}) {
  const navigate = useNavigate()
  return (
    <section className="skylent-cta-band" style={{ background: bg, position: 'relative', overflow: 'hidden', padding: `${T.section} ${T.gutter}`, borderTop: `1px solid ${T.lineLight}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          {eyebrow && <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}><Eyebrow tone="light" accent>{eyebrow}</Eyebrow></div>}
          <Heading tone="light" size="lg" style={{ textAlign: 'center' }}>{title}</Heading>
          {lead && <p style={{ color: C.slate, fontSize: 18, lineHeight: 1.65, margin: '24px auto 0', maxWidth: 560 }}>{lead}</p>}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 44 }}>
            <Button variant="primary" size="lg" onClick={() => navigate(primary.to)}>{primary.label} →</Button>
            {secondary && <Button variant="ghost" size="lg" onClick={() => navigate(secondary.to)}>{secondary.label}</Button>}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Interactive pillar card (Education / Skills / Career OS) ──────────────────
export function PillarCard({
  index,
  name,
  tagline,
  steps,
  to,
  accent,
}: {
  index: string
  name: string
  tagline: string
  steps: string[]
  to: string
  accent?: boolean
}) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={() => navigate(to)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 0, padding: '28px 0',
        background: 'transparent',
        borderBottom: `1px solid ${T.lineLight}`,
        transition: 'opacity 0.2s',
        opacity: hover ? 1 : 0.92,
        display: 'flex', flexDirection: 'column', minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.indigo, letterSpacing: '0.1em' }}>{index}</span>
        <span style={{ color: hover ? C.indigo : C.slate, fontSize: 18, transition: 'color 0.2s' }}>↗</span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.ink, margin: '0 0 10px', letterSpacing: '-0.02em' }}>{name}</h3>
      <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 20px' }}>{tagline}</p>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i === 0 ? `1px solid ${T.lineLight}` : 'none', borderBottom: `1px solid ${T.lineLight}` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.indigo, flexShrink: 0, opacity: hover ? 1 : 0.55 }} />
            <span style={{ color: C.ink, fontSize: 13.5 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
