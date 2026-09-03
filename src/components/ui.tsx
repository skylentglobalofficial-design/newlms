import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn } from './shared'

// ─────────────────────────────────────────────────────────────────────────────
// Skylent shared design-system primitives.
// Restrained, editorial, technology-forward. Orange is a scarce accent.
// Built on the existing token object `C` and the fade-in hooks from shared.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // radius scale
  rControl: 8,
  rCard: 16,
  rPill: 100,
  // section rhythm
  section: 'clamp(88px, 12vw, 140px)',
  gutter: 'clamp(20px, 5vw, 32px)',
  maxW: 1240,
  // hairlines
  lineLight: 'rgba(11,13,15,0.08)',
  lineStrong: 'rgba(11,13,15,0.14)',
  lineDark: 'rgba(255,255,255,0.09)',
  lineDarkStrong: 'rgba(255,255,255,0.16)',
} as const

type Tone = 'light' | 'dark'

// ── Section wrapper ──────────────────────────────────────────────────────────
export function Section({
  children,
  bg = C.warmWhite,
  style,
  id,
}: {
  children: React.ReactNode
  bg?: string
  style?: React.CSSProperties
  id?: string
}) {
  return (
    <section id={id} style={{ background: bg, padding: `${T.section} ${T.gutter}`, ...style }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

// ── Eyebrow (mono label) ─────────────────────────────────────────────────────
export function Eyebrow({ children, tone = 'light', accent }: { children: React.ReactNode; tone?: Tone; accent?: boolean }) {
  const color = accent ? C.orange : tone === 'dark' ? 'rgba(255,255,255,0.42)' : C.slate
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
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: sizes[size], lineHeight: 1.04, letterSpacing: '-0.03em', color: tone === 'dark' ? C.white : C.ink, margin: 0, ...style }}>
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
          <p style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.5)' : C.slate, fontSize: 17, lineHeight: 1.7, margin: '22px 0 0', maxWidth: 560, ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }}>{lead}</p>
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
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  style?: React.CSSProperties
  type?: 'button' | 'submit'
}) {
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '9px 18px' : '13px 26px'
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14.5
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: T.rControl, padding: pad, fontSize, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-body)', border: '1px solid transparent', transition: 'all 0.22s ease',
    width: full ? '100%' : undefined, whiteSpace: 'nowrap', letterSpacing: '-0.01em',
  }
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: C.orange, color: C.white },
    secondary: { background: 'transparent', color: C.white, borderColor: T.lineDarkStrong },
    ghost: { background: 'transparent', color: C.ink, borderColor: T.lineStrong },
    dark: { background: C.ink, color: C.white },
    light: { background: C.white, color: C.ink },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.background = '#ff7d33'; t.style.transform = 'translateY(-1px)' }
        else if (variant === 'dark') { t.style.opacity = '0.85'; t.style.transform = 'translateY(-1px)' }
        else if (variant === 'light') { t.style.transform = 'translateY(-1px)'; t.style.boxShadow = '0 10px 30px rgba(0,0,0,0.14)' }
        else if (variant === 'secondary') t.style.borderColor = 'rgba(255,255,255,0.4)'
        else t.style.borderColor = C.ink
      }}
      onMouseLeave={e => {
        const t = e.currentTarget
        if (variant === 'primary') { t.style.background = C.orange; t.style.transform = 'none' }
        else if (variant === 'dark') { t.style.opacity = '1'; t.style.transform = 'none' }
        else if (variant === 'light') { t.style.transform = 'none'; t.style.boxShadow = 'none' }
        else if (variant === 'secondary') t.style.borderColor = T.lineDarkStrong
        else t.style.borderColor = T.lineStrong
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
    ? { background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.24)', color: C.orange }
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
  const base: React.CSSProperties = tone === 'dark'
    ? { background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}` }
    : { background: C.white, border: `1px solid ${T.lineLight}` }
  return (
    <div
      onClick={onClick}
      style={{ borderRadius: T.rCard, padding: 30, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', cursor: onClick ? 'pointer' : 'default', ...base, ...style }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = tone === 'dark' ? '0 24px 60px rgba(0,0,0,0.4)' : '0 20px 50px rgba(11,13,15,0.1)'
        e.currentTarget.style.borderColor = tone === 'dark' ? T.lineDarkStrong : T.lineStrong
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = tone === 'dark' ? T.lineDark : T.lineLight
      } : undefined}
    >
      {children}
    </div>
  )
}

// ── Product surface (dark glass, for UI mockups) ─────────────────────────────
export function ProductSurface({ children, style, depth = 2 }: { children: React.ReactNode; style?: React.CSSProperties; depth?: 1 | 2 | 3 }) {
  const shadow = depth === 3 ? '0 40px 100px rgba(0,0,0,0.55)' : depth === 1 ? '0 8px 30px rgba(0,0,0,0.25)' : '0 24px 70px rgba(0,0,0,0.4)'
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, backdropFilter: 'blur(20px)', borderRadius: 18, boxShadow: shadow, ...style }}>
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
export function GridField({ opacity = 0.02, size = 64 }: { opacity?: number; size?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`, backgroundSize: `${size}px ${size}px`, pointerEvents: 'none' }} />
  )
}

// ── Glow (single restrained radial accent) ───────────────────────────────────
export function Glow({ x = '50%', y = '30%', size = 560, color = C.orange, strength = '16' }: { x?: string; y?: string; size?: number; color?: string; strength?: string }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, ${color}${strength} 0%, transparent 65%)`, pointerEvents: 'none' }} />
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
}) {
  return (
    <section style={{ background: bg, position: 'relative', overflow: 'hidden', padding: `clamp(88px, 10vw, 120px) ${T.gutter} clamp(48px, 6vw, 72px)` }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: photo ? '1.05fr 0.95fr' : '1fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'center' }} className="two-col">
          <div>
            <div style={{ marginBottom: 20 }}><Eyebrow tone={tone} accent>{eyebrow}</Eyebrow></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(34px, 5.2vw, 64px)', lineHeight: 0.98, letterSpacing: '-0.035em', color: tone === 'dark' ? C.white : C.ink, margin: 0, maxWidth: 720 }}>
              {title}
            </h1>
            {lead && (
              <p style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.62)' : C.slate, fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.7, margin: '20px 0 0', maxWidth: 520 }}>{lead}</p>
            )}
            {actions && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>{actions}</div>}
            {children}
          </div>
          {photo && (
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: '#1a1f24', position: 'relative' }}>
              <img src={photo} alt={photoAlt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Flow / journey strip (Professional Program → Career OS style) ─────────────
export function FlowStrip({ steps, tone = 'dark' }: { steps: { label: string; sub?: string; highlight?: boolean }[]; tone?: Tone }) {
  return (
    <div className="flow-strip" style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 130, padding: '18px 20px', borderRadius: 12, background: s.highlight ? 'rgba(243,107,33,0.1)' : tone === 'dark' ? 'rgba(255,255,255,0.04)' : C.white, border: `1px solid ${s.highlight ? 'rgba(243,107,33,0.3)' : tone === 'dark' ? T.lineDark : T.lineLight}` }}>
            <div style={{ color: s.highlight ? C.orange : tone === 'dark' ? C.white : C.ink, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{s.label}</div>
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
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
  bg?: string
  tone?: Tone
}) {
  const navigate = useNavigate()
  return (
    <section style={{ background: bg, position: 'relative', overflow: 'hidden', padding: `${T.section} ${T.gutter}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <FadeIn>
          {eyebrow && <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}><Eyebrow tone={tone} accent>{eyebrow}</Eyebrow></div>}
          <Heading tone={tone} size="lg" style={{ textAlign: 'center' }}>{title}</Heading>
          {lead && <p style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.55)' : C.slate, fontSize: 19, lineHeight: 1.6, margin: '24px auto 0', maxWidth: 560 }}>{lead}</p>}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 44 }}>
            <Button variant="primary" size="lg" onClick={() => navigate(primary.to)}>{primary.label} →</Button>
            {secondary && <Button variant={tone === 'dark' ? 'secondary' : 'ghost'} size="lg" onClick={() => navigate(secondary.to)}>{secondary.label}</Button>}
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
