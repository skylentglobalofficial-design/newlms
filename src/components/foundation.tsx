import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getDomainAccent, resolveAuroraTheme, type AuroraThemeId } from '../aurora-themes'
import { C, T, glass, type GlassLevel } from '../tokens'
import { parseSkylentVisualRef, isSkylentVisualRef } from '../media'
import { ProductVisual } from './product/ProductVisuals'

// ─── Aurora ───────────────────────────────────────────────────────────────────
// Lightweight CSS radial gradients — atmospheric, low-cost, readable.

/** Public pages: no coloured blobs. LMS/workspace may still import this as a no-op wash. */
export function AuroraBand(_props: { themeId?: AuroraThemeId }) {
  return (
    <div
      aria-hidden
      className="skylent-aurora-band"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'linear-gradient(180deg, #FFFDF8 0%, transparent 42%)',
      }}
    />
  )
}

export function Aurora(_props: { themeId?: AuroraThemeId; variant?: 'default' | 'hero' }) {
  return (
    <div
      aria-hidden
      className="skylent-aurora"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'linear-gradient(180deg, #F7F4EC 0%, #FFFDF8 48%, #F7F4EC 100%)',
      }}
    />
  )
}

export function useAuroraTheme(): AuroraThemeId {
  const { pathname } = useLocation()
  const { slug } = useParams<{ slug?: string }>()
  return resolveAuroraTheme(pathname, slug)
}

// ─── Public canvas ────────────────────────────────────────────────────────────
// Surface layer for the public marketing site: warm background, optional atmosphere.
// Does not compose Nav, main, or Footer — use PageShell (shared.tsx) for that.

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
      style={{ position: 'relative', minHeight: '100%', background: C.canvas, color: C.ink }}
    >
      {aurora && <div className="skylent-light-atmosphere" aria-hidden />}
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
  const surface: React.CSSProperties = {
    background: g.bg,
    border: `1px solid ${g.border}`,
    boxShadow: g.shadow,
    borderRadius: radius,
    padding,
    ...style,
  }
  if (g.blur && g.blur !== 'none') {
    surface.backdropFilter = g.blur
    surface.WebkitBackdropFilter = g.blur
  }
  return (
    <div
      className={className}
      style={surface}
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
      ? 'linear-gradient(to top, rgba(247,244,236,0.92) 0%, transparent 58%)'
      : overlay === 'full'
        ? 'linear-gradient(to top, rgba(247,244,236,0.55) 0%, transparent 62%)'
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
        background: C.cream,
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
            color: C.slate,
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
        backgroundImage: `linear-gradient(rgba(21,23,26,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(21,23,26,${opacity}) 1px, transparent 1px)`,
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
      <div style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: active ? 600 : 400, color: active ? C.ink : C.slate, lineHeight: 1.35 }}>
        {item.label}
      </div>
      {item.sub && !compact && (
        <div style={{ fontSize: 11, color: C.slate, marginTop: 3, lineHeight: 1.4 }}>{item.sub}</div>
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
        background: '#FFFDF8',
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
                  color: active ? accent.text : C.slate,
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
