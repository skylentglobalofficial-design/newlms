import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { programs } from '../data'
import { getAuroraTheme, getDomainAccent, resolveAuroraTheme, type AuroraThemeId } from '../aurora-themes'
import { C, T, glass, type GlassLevel } from '../tokens'
import { parseSkylentVisualRef, isSkylentVisualRef } from '../media'
import { ProductVisual } from './product/ProductVisuals'

// ─── Aurora ───────────────────────────────────────────────────────────────────
// Lightweight CSS radial gradients — atmospheric, low-cost, readable.

/** Focused atmospheric band for primary workspace headers — not full-page. */
export function AuroraBand({ themeId = 'general' }: { themeId?: AuroraThemeId }) {
  const theme = getAuroraTheme(themeId)
  return (
    <div
      aria-hidden
      className="skylent-aurora-band"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-45%',
          left: '-8%',
          width: 'min(92%, 720px)',
          height: 'min(140%, 420px)',
          background: `radial-gradient(ellipse 75% 55% at 28% 35%, ${theme.primary}48 0%, transparent 72%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          right: '-12%',
          width: 'min(58%, 520px)',
          height: 'min(120%, 360px)',
          background: `radial-gradient(ellipse at center, ${theme.secondary}38 0%, transparent 68%)`,
        }}
      />
    </div>
  )
}

export function Aurora({ themeId = 'general', variant = 'default' }: { themeId?: AuroraThemeId; variant?: 'default' | 'hero' }) {
  const theme = getAuroraTheme(themeId)
  const base = Number(theme.strength)
  const s = String(variant === 'hero' ? Math.min(base + 6, 34) : base)
  const s2 = String(Math.max(Number(s) - 3, 12))

  return (
    <div
      aria-hidden
      className="skylent-aurora"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          top: variant === 'hero' ? '-22%' : '-18%',
          left: '5%',
          width: variant === 'hero' ? 'min(80vw, 980px)' : 'min(72vw, 900px)',
          height: variant === 'hero' ? 'min(62vh, 580px)' : 'min(55vh, 520px)',
          background: `radial-gradient(ellipse at center, ${theme.primary}${s} 0%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '2%',
          right: variant === 'hero' ? '-12%' : '-8%',
          width: variant === 'hero' ? 'min(64vw, 800px)' : 'min(58vw, 720px)',
          height: variant === 'hero' ? 'min(52vh, 500px)' : 'min(48vh, 460px)',
          background: `radial-gradient(ellipse at center, ${theme.secondary}${s2} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '28%',
          width: 'min(50vw, 640px)',
          height: 'min(40vh, 380px)',
          background: `radial-gradient(ellipse at center, ${theme.primary}12 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

export function useAuroraTheme(): AuroraThemeId {
  const { pathname } = useLocation()
  const { slug } = useParams<{ slug?: string }>()
  const program = slug ? programs.find(p => p.slug === slug) : undefined
  return resolveAuroraTheme(pathname, slug, program?.programType)
}

// ─── Public canvas ────────────────────────────────────────────────────────────
// Near-black continuous background with optional Aurora.

export function PublicCanvas({
  children,
  themeId,
  aurora = true,
}: {
  children: React.ReactNode
  themeId?: AuroraThemeId
  aurora?: boolean
}) {
  const autoTheme = useAuroraTheme()
  const resolved = themeId ?? autoTheme
  return (
    <div
      className="skylent-public-canvas"
      style={{ position: 'relative', minHeight: '100%', background: C.canvas, color: C.white }}
    >
      {aurora && <Aurora themeId={resolved} />}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

// ─── Glass surface ──────────────────────────────────────────────────────────
// Restrained material primitive — uses CSS custom properties from index.css.

export function GlassSurface({
  children,
  level = 2,
  radius = T.rCard,
  padding,
  style,
  className,
}: {
  children: React.ReactNode
  level?: GlassLevel
  radius?: number
  padding?: string | number
  style?: React.CSSProperties
  className?: string
}) {
  const g = glass[level]
  return (
    <div
      className={className}
      style={{
        background: g.bg,
        border: `1px solid ${g.border}`,
        backdropFilter: g.blur,
        WebkitBackdropFilter: g.blur,
        boxShadow: g.shadow,
        borderRadius: radius,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Media image ──────────────────────────────────────────────────────────────
// Intentional aspect ratios, object-fit/position, optional gradient overlay.

type MediaAspect = '4/3' | '16/9' | '4/5' | '21/9' | '3/2' | '1/1'

const ASPECT: Record<MediaAspect, string> = {
  '4/3': '4/3',
  '16/9': '16/9',
  '4/5': '4/5',
  '21/9': '21/9',
  '3/2': '3/2',
  '1/1': '1/1',
}

export function MediaImage({
  src,
  alt,
  aspect = '4/3',
  objectPosition = 'center',
  radius = T.rCard,
  overlay = 'none',
  overlayText,
  themeId,
  className,
  style,
  imgStyle,
}: {
  src: string
  alt: string
  aspect?: MediaAspect
  objectPosition?: string
  radius?: number
  overlay?: 'none' | 'bottom' | 'full'
  overlayText?: string
  themeId?: AuroraThemeId
  className?: string
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
}) {
  const autoTheme = useAuroraTheme()
  const overlayGrad =
    overlay === 'bottom'
      ? 'linear-gradient(to top, rgba(5,5,5,0.75) 0%, transparent 55%)'
      : overlay === 'full'
        ? 'linear-gradient(to top, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.12) 50%, transparent 100%)'
        : undefined

  const visualId = isSkylentVisualRef(src) ? parseSkylentVisualRef(src) : null
  const resolvedTheme = themeId ?? autoTheme

  return (
    <div
      className={className}
      role={visualId ? 'img' : undefined}
      aria-label={visualId ? alt : undefined}
      style={{
        position: 'relative',
        borderRadius: radius,
        overflow: 'hidden',
        aspectRatio: ASPECT[aspect],
        background: C.ink3,
        ...style,
      }}
    >
      {visualId ? (
        <div className="skylent-product-visual-frame" style={{ width: '100%', height: '100%', minHeight: 0 }}>
          <ProductVisual id={visualId} themeId={resolvedTheme} style={{ height: '100%' }} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="skylent-media-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            display: 'block',
            ...imgStyle,
          }}
        />
      )}
      {overlayGrad && (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: overlayGrad, pointerEvents: 'none' }}
        />
      )}
      {overlayText && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 18px',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          {overlayText}
        </div>
      )}
    </div>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────
// Subtle transition between major sections on dark canvas.

export function SectionDivider({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const color = tone === 'dark' ? T.lineDark : T.lineLight
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`,
        margin: '0 auto',
        maxWidth: T.maxW,
      }}
    />
  )
}

// ─── Grid field (re-export pattern from ui — shared texture) ─────────────────
export function GridField({ opacity = 0.025, size = 64 }: { opacity?: number; size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Contextual navigation ─────────────────────────────────────────────────────
// Reusable secondary nav for long-form product/landing pages.

export type ContextualNavItem = {
  id: string
  label: string
  sub?: string
}

export function scrollToSection(id: string, offset = T.navH + 16) {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
}

export function useSectionSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-18% 0px -65% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [sectionIds.join('|')])

  return activeId
}

function NavButton({
  item,
  active,
  accent,
  compact,
  onClick,
}: {
  item: ContextualNavItem
  active: boolean
  accent: ReturnType<typeof getDomainAccent>
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: active ? accent.subtle : 'transparent',
        border: 'none',
        borderLeft: `2px solid ${active ? accent.primary : 'transparent'}`,
        padding: compact ? '10px 14px' : '11px 16px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'background 0.15s, border-color 0.15s',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: active ? 600 : 400, color: active ? C.white : 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>
        {item.label}
      </div>
      {item.sub && !compact && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, lineHeight: 1.4 }}>{item.sub}</div>
      )}
    </button>
  )
}

/** Vertical glass panel — desktop / hero right column */
export function ContextualNavPanel({
  items,
  themeId,
  title = 'In this workspace',
  activeId,
}: {
  items: ContextualNavItem[]
  themeId: AuroraThemeId
  title?: string
  activeId: string
}) {
  const accent = getDomainAccent(themeId)
  if (!items.length) return null

  return (
    <GlassSurface level={2} padding="0" className="contextual-nav-panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: accent.text }}>{title}</div>
      </div>
      <nav aria-label={title} style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        {items.map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            accent={accent}
            onClick={() => scrollToSection(item.id)}
          />
        ))}
      </nav>
    </GlassSurface>
  )
}

/** Horizontal scroll bar — tablet / mobile */
export function ContextualNavBar({
  items,
  themeId,
  activeId,
}: {
  items: ContextualNavItem[]
  themeId: AuroraThemeId
  activeId: string
}) {
  const accent = getDomainAccent(themeId)
  if (!items.length) return null

  return (
    <div
      className="contextual-nav-bar"
      style={{
        position: 'sticky',
        top: T.navH,
        zIndex: 70,
        background: 'var(--glass-01-bg)',
        backdropFilter: 'var(--glass-01-blur)',
        WebkitBackdropFilter: 'var(--glass-01-blur)',
        borderBottom: `1px solid ${T.lineDark}`,
      }}
    >
      <div className="scroll-control-strip" style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <div
          className="scroll-control-strip-scroll contextual-nav-bar-scroll"
          role="tablist"
          aria-label="Page sections"
          style={{
            padding: `0 ${T.gutter}`,
            display: 'flex',
            gap: 0,
          }}
        >
          {items.map(item => {
            const active = activeId === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => scrollToSection(item.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${active ? accent.primary : 'transparent'}`,
                  padding: '12px 16px',
                  color: active ? accent.text : 'rgba(255,255,255,0.42)',
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Renders panel (desktop) + sticky bar (mobile) */
export function PageContextualNav({
  items,
  themeId,
  title,
  activeId,
}: {
  items: ContextualNavItem[]
  themeId: AuroraThemeId
  title?: string
  activeId: string
}) {
  return (
    <>
      <ContextualNavPanel items={items} themeId={themeId} title={title} activeId={activeId} />
      <ContextualNavBar items={items} themeId={themeId} activeId={activeId} />
    </>
  )
}
