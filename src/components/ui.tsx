import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FadeIn } from './shared'
import { C, T, type } from '../tokens'
import { S } from '../theme'
import { Aurora, GridField, MediaImage } from './foundation'
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
  if (tone === 'light') return S.surface
  if (tone === 'dark') return S.elevated
  return S.canvas
}

export function Section({
  children,
  bg,
  tone = 'canvas',
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
  const textColor = tone === 'light' ? C.ink : S.text
  return (
    <>
      {divider && <div className="skylent-section-divider" />}
      <section
        id={id}
        style={{
          background,
          color: textColor,
          padding: `${T.sectionSm} 0`,
          position: 'relative',
          ...style,
        }}
      >
        <div className="skylent-content-standard" style={{ position: 'relative' }}>{children}</div>
      </section>
    </>
  )
}

// ── Eyebrow (mono label) ─────────────────────────────────────────────────────
export function Eyebrow({ children, tone = 'light', accent, centered }: { children: React.ReactNode; tone?: Tone; accent?: boolean; centered?: boolean }) {
  const color = accent ? brandAccent.text : tone === 'light' ? C.slate : S.textMuted
  const line = <span style={{ width: 20, height: 1, background: 'currentColor', opacity: 0.5, flexShrink: 0 }} />
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
      {line}
      {children}
      {centered ? line : null}
    </div>
  )
}

// ── Section heading ──────────────────────────────────────────────────────────
export function Heading({
  children,
  tone = 'canvas',
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
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: sizes[size], lineHeight: 1.04, letterSpacing: '-0.03em', color: tone === 'light' ? C.ink : S.text, margin: 0, ...style }}>
      {children}
    </h2>
  )
}

// ── Section header (eyebrow + heading + optional lead + optional action) ──────
export function SectionHeader({
  eyebrow,
  title,
  lead,
  tone = 'canvas',
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
          <p style={{ color: tone === 'light' ? C.slate : S.textSecondary, fontSize: type.bodyLg, lineHeight: 1.7, margin: '22px 0 0', maxWidth: 560, ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }}>{lead}</p>
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
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '9px 18px' : '13px 26px'
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14.5
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: T.rControl, padding: pad, fontSize, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-body)', border: '1px solid transparent', transition: 'all 0.22s ease',
    width: full ? '100%' : undefined, whiteSpace: 'nowrap', letterSpacing: '-0.01em',
  }
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: accent.primary, color: S.accentForeground },
    secondary: { background: 'transparent', color: S.text, borderColor: S.border },
    ghost: { background: 'transparent', color: S.text, borderColor: S.borderSubtle },
    dark: { background: C.ink, color: C.warmWhite },
    light: { background: S.surface, color: C.ink, borderColor: S.borderSubtle },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.opacity = '0.92' }
        else if (variant === 'secondary') t.style.borderColor = S.border
      }}
      onMouseLeave={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.opacity = '1' }
        else if (variant === 'secondary') t.style.borderColor = S.border
      }}
    >
      {children}
    </button>
  )
}

// ── Text link with underline reveal ──────────────────────────────────────────
export function TextLink({ children, onClick, tone = 'light' }: { children: React.ReactNode; onClick?: () => void; tone?: Tone }) {
  const color = tone === 'dark' ? C.white : C.ink
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
    : tone === 'dark'
      ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }
      : { background: C.white, border: `1px solid ${T.lineStrong}`, color: C.slate }
  return (
    <span style={{ ...styles, borderRadius: 6, padding: '4px 11px', fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// ── Card (light or dark, optional hover lift) ────────────────────────────────
export function Card({
  children,
  tone = 'canvas',
  hover = false,
  onClick,
  style,
}: {
  children: React.ReactNode
  tone?: Tone
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    background: S.cardBg,
    border: `1px solid ${S.borderSubtle}`,
  }
  return (
    <div
      onClick={onClick}
      style={{ borderRadius: T.rCard, padding: 30, transition: 'border-color 0.2s ease', cursor: onClick ? 'pointer' : 'default', ...base, ...style }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = S.border
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = S.borderSubtle
      } : undefined}
    >
      {children}
    </div>
  )
}

// ── Product surface (dark glass, for UI mockups) ─────────────────────────────
export function ProductSurface({ children, style, depth = 2 }: { children: React.ReactNode; style?: React.CSSProperties; depth?: 1 | 2 | 3 }) {
  const level = depth as 1 | 2 | 3
  const glassVar = level === 3 ? 'var(--glass-03-bg)' : level === 1 ? 'var(--glass-01-bg)' : 'var(--glass-02-bg)'
  const borderVar = level === 3 ? 'var(--glass-03-border)' : level === 1 ? 'var(--glass-01-border)' : 'var(--glass-02-border)'
  const blurVar = level === 3 ? 'var(--glass-03-blur)' : level === 1 ? 'var(--glass-01-blur)' : 'var(--glass-02-blur)'
  const shadowVar = level === 3 ? 'var(--glass-03-shadow)' : level === 1 ? 'var(--glass-01-shadow)' : 'var(--glass-02-shadow)'
  return (
    <div style={{ background: glassVar, border: `1px solid ${borderVar}`, backdropFilter: blurVar, WebkitBackdropFilter: blurVar, borderRadius: 18, boxShadow: shadowVar, ...style }}>
      {children}
    </div>
  )
}

// ── Stat block ───────────────────────────────────────────────────────────────
export function Stat({ value, label, tone = 'light' }: { value: string; label: string; tone?: Tone }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 3.6vw, 46px)', fontWeight: 600, letterSpacing: '-0.03em', color: tone === 'dark' ? C.white : C.ink }}>{value}</div>
      <div style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.4)' : C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ── Grid background overlay (subtle technical texture for dark sections) ──────
export { GridField } from './foundation'

// ── Glow (single restrained radial accent) ───────────────────────────────────
export function Glow({ x = '50%', y = '30%', size = 560, color = C.orange, strength = '16' }: { x?: string; y?: string; size?: number; color?: string; strength?: string }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, ${color}${strength} 0%, transparent 65%)`, pointerEvents: 'none' }} />
}

// ── Marketing hero (centered, content-first public page hero) ────────────────
export function MarketingHero({
  eyebrow,
  title,
  lead,
  tone = 'dark',
  bg,
  actions,
  back,
  badges,
  visual,
  footer,
  children,
  auroraTheme,
  size = 'lg',
  id,
  visualMaxWidth,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  tone?: Tone
  bg?: string
  actions?: React.ReactNode
  back?: React.ReactNode
  badges?: React.ReactNode
  visual?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  auroraTheme?: AuroraThemeId
  size?: 'lg' | 'xl'
  id?: string
  visualMaxWidth?: number | string
}) {
  const isDark = tone !== 'light'
  const headlineClass = size === 'xl' ? 'skylent-display-xl' : 'skylent-display-lg'
  const copyMax = size === 'xl' ? T.maxWReading : 640
  const leadMax = size === 'xl' ? 600 : 540
  const defaultVisualMax = visualMaxWidth ?? T.maxWContent
  const heroBg = bg ?? S.canvas

  return (
    <section
      id={id}
      className="marketing-hero-section"
      style={{
        background: heroBg,
        position: 'relative',
        overflow: 'hidden',
        padding: `${T.navH + 48}px 0 ${visual || footer ? T.sectionTight : 'clamp(48px, 6vw, 72px)'}`,
      }}
    >
      {isDark && auroraTheme && <Aurora themeId={auroraTheme} variant="hero" />}
      <div className="marketing-hero marketing-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
        {back && <div className="marketing-hero-back">{back}</div>}
        <FadeIn>
          <div className="marketing-hero-copy" style={{ textAlign: 'center', maxWidth: copyMax, margin: '0 auto' }}>
            {eyebrow && (
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                <Eyebrow tone={tone} accent centered>{eyebrow}</Eyebrow>
              </div>
            )}
            {badges && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {badges}
              </div>
            )}
            <h1 className={headlineClass} style={{ color: isDark ? S.text : C.ink, margin: 0 }}>
              {title}
            </h1>
            {lead && (
              <p className="skylent-body-lg" style={{ color: isDark ? S.textSecondary : C.slate, margin: '20px auto 0', maxWidth: leadMax }}>
                {lead}
              </p>
            )}
            {actions && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
                {actions}
              </div>
            )}
            {children}
          </div>
        </FadeIn>
        {visual && (
          <FadeIn delay={80}>
            <div
              className="marketing-hero-visual"
              style={{
                marginTop: 'clamp(40px, 5vw, 64px)',
                maxWidth: defaultVisualMax,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {visual}
            </div>
          </FadeIn>
        )}
        {footer && (
          <FadeIn delay={100}>
            <div className="marketing-hero-footer" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
              {footer}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}

// ── Page hero (shared editorial hero for interior pages) ─────────────────────
export function PageHero({
  eyebrow,
  title,
  lead,
  tone = 'dark',
  bg = C.ink,
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
    <MarketingHero
      eyebrow={eyebrow}
      title={title}
      lead={lead}
      tone={tone}
      bg={bg}
      actions={actions}
      auroraTheme={auroraTheme}
      visual={photo ? (
        <MediaImage
          src={photo}
          alt={photoAlt ?? ''}
          aspect={photoAspect}
          className="skylent-hero-visual"
          overlay="bottom"
        />
      ) : undefined}
    >
      {children}
    </MarketingHero>
  )
}

// ── Flow / journey strip (Professional Program → Career OS style) ─────────────
export function FlowStrip({ steps, tone = 'dark' }: { steps: { label: string; sub?: string; highlight?: boolean }[]; tone?: Tone }) {
  return (
    <div className="flow-strip" style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 130, padding: '18px 20px', borderRadius: 12, background: s.highlight ? brandAccent.subtle : tone === 'dark' ? 'rgba(255,255,255,0.04)' : C.white, border: `1px solid ${s.highlight ? brandAccent.border : tone === 'dark' ? T.lineDark : T.lineLight}` }}>
            <div style={{ color: s.highlight ? brandAccent.text : tone === 'dark' ? C.white : C.ink, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{s.label}</div>
            {s.sub && <div style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.4)' : C.slate, fontSize: 11.5, marginTop: 4 }}>{s.sub}</div>}
          </div>
          {i < steps.length - 1 && <div className="flow-arrow" style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.28)' : C.slate, padding: '0 10px', fontSize: 16, flexShrink: 0 }}>→</div>}
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
  bg = C.ink,
  tone = 'dark',
  auroraTheme,
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
  const isDark = tone !== 'light'
  return (
    <section style={{ background: bg, position: 'relative', overflow: 'hidden', padding: `${T.section} 0` }}>
      {isDark && auroraTheme && <Aurora themeId={auroraTheme} />}
      <div className="skylent-content-standard" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          {eyebrow && <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}><Eyebrow tone={tone} accent>{eyebrow}</Eyebrow></div>}
          <Heading tone={tone} size="lg" style={{ textAlign: 'center' }}>{title}</Heading>
          {lead && <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : C.slate, fontSize: 19, lineHeight: 1.6, margin: '24px auto 0', maxWidth: 560 }}>{lead}</p>}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 44 }}>
            <Button variant="primary" size="lg" onClick={() => navigate(primary.to)}>{primary.label} →</Button>
            {secondary && <Button variant={isDark ? 'secondary' : 'ghost'} size="lg" onClick={() => navigate(secondary.to)}>{secondary.label}</Button>}
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
        position: 'relative', cursor: 'pointer', borderRadius: T.rCard, padding: 34,
        background: accent ? C.ink : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hover ? (accent ? 'rgba(243,107,33,0.5)' : T.lineDarkStrong) : T.lineDark}`,
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        transform: hover ? 'translateY(-6px)' : 'none',
        boxShadow: hover ? '0 30px 70px rgba(0,0,0,0.45)' : 'none',
        display: 'flex', flexDirection: 'column', minHeight: 340, overflow: 'hidden',
      }}
    >
      {accent && <Glow x="90%" y="0%" size={320} strength="20" />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, position: 'relative' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: C.orange, letterSpacing: '0.1em' }}>{index}</span>
        <span style={{ color: hover ? C.orange : 'rgba(255,255,255,0.3)', fontSize: 20, transition: 'all 0.3s', transform: hover ? 'translate(2px,-2px)' : 'none' }}>↗</span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: C.white, margin: '0 0 12px', letterSpacing: '-0.02em', position: 'relative' }}>{name}</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 26px', position: 'relative' }}>{tagline}</p>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i === 0 ? `1px solid ${T.lineDark}` : 'none', borderBottom: `1px solid ${T.lineDark}` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.orange, flexShrink: 0, opacity: hover ? 1 : 0.5, transition: 'opacity 0.3s' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
