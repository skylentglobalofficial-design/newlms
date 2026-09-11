import type { CSSProperties } from 'react'
import type { AuroraThemeId } from '../aurora-themes'
import { C, T } from '../tokens'
import { parseSkylentVisualRef, isSkylentVisualRef } from '../media'
import { ProductVisual } from './product/ProductVisuals'
import { useAuroraTheme } from './foundation'

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
  style?: CSSProperties
  imgStyle?: CSSProperties
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
