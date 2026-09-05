import { useLocation, useParams } from 'react-router-dom'
import { programs } from '../data'
import { getAuroraTheme, resolveAuroraTheme, type AuroraThemeId } from '../aurora-themes'
import { C, T, glass, type GlassLevel } from '../tokens'

// ─── Aurora ───────────────────────────────────────────────────────────────────
// Lightweight CSS radial gradients — atmospheric, low-cost, readable.

export function Aurora({ themeId = 'general' }: { themeId?: AuroraThemeId }) {
  const theme = getAuroraTheme(themeId)
  const s = theme.strength

  return (
    <div
      aria-hidden
      className="skylent-aurora"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-18%',
          left: '5%',
          width: 'min(72vw, 900px)',
          height: 'min(55vh, 520px)',
          background: `radial-gradient(ellipse at center, ${theme.primary}${s} 0%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '2%',
          right: '-8%',
          width: 'min(58vw, 720px)',
          height: 'min(48vh, 460px)',
          background: `radial-gradient(ellipse at center, ${theme.secondary}${Math.max(Number(s) - 4, 10)} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '28%',
          width: 'min(50vw, 640px)',
          height: 'min(40vh, 380px)',
          background: `radial-gradient(ellipse at center, ${theme.primary}0A 0%, transparent 70%)`,
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
  className?: string
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
}) {
  const overlayGrad =
    overlay === 'bottom'
      ? 'linear-gradient(to top, rgba(5,5,5,0.75) 0%, transparent 55%)'
      : overlay === 'full'
        ? 'linear-gradient(to top, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.12) 50%, transparent 100%)'
        : undefined

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: radius,
        overflow: 'hidden',
        aspectRatio: ASPECT[aspect],
        background: C.ink3,
        ...style,
      }}
    >
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
