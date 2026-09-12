import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { R, RAIL, S, SHADOW, TY } from './tokens'
import { getSurfaceAccent, type SurfaceAccent } from './accent'
import type { AuroraThemeId } from '../aurora-themes'
import type { Availability, AvailabilityTone } from '../lib/catalogue-status'

export { getSurfaceAccent }
export type { SurfaceAccent }

// ── Rail ─────────────────────────────────────────────────────────────────────
export function Rail({
  children,
  width = 'wide',
  className,
  style,
}: {
  children: ReactNode
  width?: keyof typeof RAIL
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`sk-rail${className ? ` ${className}` : ''}`}
      style={{ maxWidth: RAIL[width], ...style }}
    >
      {children}
    </div>
  )
}

// ── Page header ──────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
  meta,
  back,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  back?: { label: string; to: string }
}) {
  return (
    <header className="sk-page-header">
      {back && (
        <Link to={back.to} className="sk-backlink">
          <span aria-hidden>←</span> {back.label}
        </Link>
      )}
      <div className="sk-page-header-row">
        <div className="sk-page-header-copy">
          {eyebrow && <div className="sk-eyebrow">{eyebrow}</div>}
          <h1 style={{ ...TY.h1, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{title}</h1>
          {lead && <p className="sk-page-lead">{lead}</p>}
          {meta && <div className="sk-page-header-meta">{meta}</div>}
        </div>
        {actions && <div className="sk-page-header-actions">{actions}</div>}
      </div>
    </header>
  )
}

// ── Section heading ──────────────────────────────────────────────────────────
export function SectionHeading({
  title,
  lead,
  action,
  id,
  size = 'md',
}: {
  title: ReactNode
  lead?: ReactNode
  action?: ReactNode
  id?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className="sk-section-heading" id={id}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ ...(size === 'sm' ? TY.h3 : TY.h2), color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        {lead && <p className="sk-section-lead">{lead}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  tone = 'surface',
  padding = 20,
  interactive,
  className,
  style,
}: {
  children: ReactNode
  tone?: 'surface' | 'muted' | 'dark'
  padding?: number | string
  interactive?: boolean
  className?: string
  style?: CSSProperties
}) {
  const toneStyle: CSSProperties =
    tone === 'dark'
      ? { background: S.surfaceDark, border: `1px solid ${S.lineOnDark}`, color: S.inkOnDark }
      : tone === 'muted'
        ? { background: S.surfaceMuted, border: `1px solid ${S.line}`, color: S.ink }
        : { background: S.surface, border: `1px solid ${S.line}`, color: S.ink, boxShadow: SHADOW.sm }

  return (
    <div
      className={`sk-card${interactive ? ' sk-card-interactive' : ''}${className ? ` ${className}` : ''}`}
      style={{ borderRadius: R.card, padding, ...toneStyle, ...style }}
    >
      {children}
    </div>
  )
}

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'quiet'
type ButtonSize = 'sm' | 'md' | 'lg'

function buttonStyle(variant: ButtonVariant, size: ButtonSize, accent: SurfaceAccent, full?: boolean): CSSProperties {
  const pad = size === 'lg' ? '13px 24px' : size === 'sm' ? '7px 14px' : '10px 18px'
  const fontSize = size === 'lg' ? 15 : size === 'sm' ? 13 : 14
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: pad,
    minHeight: size === 'lg' ? 48 : size === 'sm' ? 36 : 44,
    fontSize,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    borderRadius: R.control,
    border: '1px solid transparent',
    cursor: 'pointer',
    letterSpacing: '-0.005em',
    textDecoration: 'none',
    width: full ? '100%' : undefined,
    lineHeight: 1.2,
    transition: 'background 0.16s ease, border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease',
  }
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: { background: accent.solid, color: '#FFFFFF', boxShadow: SHADOW.sm },
    secondary: { background: S.surface, color: S.ink, borderColor: S.lineStrong },
    ghost: { background: 'transparent', color: S.ink, borderColor: S.lineStrong },
    dark: { background: S.ink, color: '#FFFFFF' },
    quiet: { background: 'transparent', color: S.inkSecondary, borderColor: 'transparent', padding: size === 'sm' ? '6px 8px' : '8px 10px' },
  }
  return { ...base, ...variants[variant] }
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  full,
  themeId = 'general',
  disabled,
  type = 'button',
  style,
  ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  themeId?: AuroraThemeId
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: CSSProperties
  ariaLabel?: string
}) {
  const accent = getSurfaceAccent(themeId)
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`sk-btn sk-btn-${variant}`}
      style={{ ...buttonStyle(variant, size, accent, full), ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  to,
  variant = 'primary',
  size = 'md',
  full,
  themeId = 'general',
  style,
  state,
}: {
  children: ReactNode
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  themeId?: AuroraThemeId
  style?: CSSProperties
  state?: unknown
}) {
  const accent = getSurfaceAccent(themeId)
  return (
    <Link to={to} state={state} className={`sk-btn sk-btn-${variant}`} style={{ ...buttonStyle(variant, size, accent, full), ...style }}>
      {children}
    </Link>
  )
}

// ── Status pill (catalogue honesty) ──────────────────────────────────────────
const TONE_STYLE: Record<AvailabilityTone, CSSProperties> = {
  positive: { background: S.positiveSoft, color: S.positive, borderColor: S.positiveLine },
  active: { background: S.activeSoft, color: S.active, borderColor: S.activeLine },
  neutral: { background: S.surfaceMuted, color: S.ink, borderColor: S.lineStrong },
  muted: { background: S.neutralSoft, color: S.inkMuted, borderColor: S.neutralLine },
}

export function StatusPill({ availability, size = 'md' }: { availability: Availability; size?: 'sm' | 'md' }) {
  const tone = TONE_STYLE[availability.tone]
  return (
    <span
      className="sk-status-pill"
      style={{
        ...tone,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: R.pill,
        padding: size === 'sm' ? '2px 9px' : '4px 11px',
        fontSize: size === 'sm' ? 11 : 11.5,
        fontWeight: 600,
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.75, flexShrink: 0 }}
      />
      {availability.label}
    </span>
  )
}

// ── Badge / tag ──────────────────────────────────────────────────────────────
export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent'; }) {
  return (
    <span
      style={{
        background: tone === 'accent' ? S.activeSoft : S.surfaceMuted,
        color: tone === 'accent' ? S.active : S.inkSecondary,
        border: `1px solid ${tone === 'accent' ? S.activeLine : S.line}`,
        borderRadius: 6,
        padding: '3px 9px',
        fontSize: 11.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  )
}

// ── Metadata row (·-separated facts) ─────────────────────────────────────────
export function MetaRow({ items, tone = 'light' }: { items: (string | null | undefined | false)[]; tone?: 'light' | 'dark' }) {
  const real = items.filter((item): item is string => typeof item === 'string' && item.length > 0)
  if (!real.length) return null
  return (
    <div
      style={{
        ...TY.meta,
        color: tone === 'dark' ? S.inkOnDarkMuted : S.inkMuted,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px 8px',
      }}
    >
      {real.map((item, i) => (
        <span key={`${item}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {i > 0 && <span aria-hidden style={{ opacity: 0.5 }}>·</span>}
          {item}
        </span>
      ))}
    </div>
  )
}

// ── Definition list (summary rails, spec tables) ─────────────────────────────
export function DefinitionList({
  items,
  tone = 'light',
}: {
  items: { term: string; value: ReactNode }[]
  tone?: 'light' | 'dark'
}) {
  return (
    <dl className="sk-deflist" style={{ margin: 0 }}>
      {items.map(({ term, value }) => (
        <div key={term} className="sk-deflist-row" style={{ borderColor: tone === 'dark' ? S.lineOnDark : S.line }}>
          <dt style={{ ...TY.bodySm, color: tone === 'dark' ? S.inkOnDarkMuted : S.inkMuted, margin: 0 }}>{term}</dt>
          <dd style={{ ...TY.bodySm, color: tone === 'dark' ? S.inkOnDark : S.ink, fontWeight: 500, margin: 0, textAlign: 'right' }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ── Progress ─────────────────────────────────────────────────────────────────
export function Progress({
  value,
  total,
  label,
  themeId = 'general',
  tone = 'light',
  showFraction = true,
}: {
  value: number
  total: number
  label?: string
  themeId?: AuroraThemeId
  tone?: 'light' | 'dark'
  showFraction?: boolean
}) {
  const accent = getSurfaceAccent(themeId)
  const safeTotal = Math.max(total, 0)
  const pct = safeTotal === 0 ? 0 : Math.round((Math.min(value, safeTotal) / safeTotal) * 100)
  return (
    <div>
      {(label || showFraction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 7 }}>
          {label && <span style={{ ...TY.bodySm, color: tone === 'dark' ? S.inkOnDarkSecondary : S.inkSecondary }}>{label}</span>}
          {showFraction && (
            <span style={{ ...TY.bodySm, fontWeight: 600, color: tone === 'dark' ? S.inkOnDark : S.ink, fontVariantNumeric: 'tabular-nums' }}>
              {safeTotal === 0 ? '—' : `${pct}%`}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        style={{
          height: 6,
          borderRadius: R.pill,
          background: tone === 'dark' ? 'rgba(255,255,255,0.16)' : S.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: R.pill,
            background: tone === 'dark' ? accent.glow : accent.solid,
            transition: 'width 0.35s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({
  items,
  active,
  onChange,
  themeId = 'general',
}: {
  items: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
  themeId?: AuroraThemeId
}) {
  const accent = getSurfaceAccent(themeId)
  return (
    <div className="sk-tabs" role="tablist">
      {items.map(item => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className="sk-tab"
            style={{
              color: isActive ? S.ink : S.inkMuted,
              borderBottomColor: isActive ? accent.solid : 'transparent',
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className="sk-tab-count"
                style={{
                  background: isActive ? accent.soft : S.surfaceMuted,
                  color: isActive ? accent.text : S.inkMuted,
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  title,
  body,
  action,
  compact,
}: {
  title: string
  body: ReactNode
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className="sk-empty"
      style={{
        background: S.surfaceMuted,
        border: `1px dashed ${S.lineStrong}`,
        borderRadius: R.card,
        padding: compact ? '20px 22px' : '34px 28px',
        textAlign: compact ? 'left' : 'center',
      }}
    >
      <div style={{ ...TY.h3, color: S.ink, marginBottom: 6 }}>{title}</div>
      <p
        style={{
          ...TY.body,
          color: S.inkSecondary,
          margin: '0 auto',
          maxWidth: compact ? undefined : 460,
        }}
      >
        {body}
      </p>
      {action && <div style={{ marginTop: 18, display: 'flex', justifyContent: compact ? 'flex-start' : 'center', gap: 10, flexWrap: 'wrap' }}>{action}</div>}
    </div>
  )
}

// ── Note (inline honesty callout) ────────────────────────────────────────────
export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'caution' }) {
  return (
    <p
      style={{
        ...TY.bodySm,
        color: tone === 'caution' ? S.caution : S.inkSecondary,
        background: tone === 'caution' ? S.cautionSoft : S.surfaceMuted,
        border: `1px solid ${tone === 'caution' ? S.cautionLine : S.line}`,
        borderRadius: R.control,
        padding: '10px 13px',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

// ── Stat ─────────────────────────────────────────────────────────────────────
export function Stat({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ ...TY.bodySm, color: S.inkSecondary, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Search field ─────────────────────────────────────────────────────────────
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}) {
  return (
    <div className="sk-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <line x1="20" y1="20" x2="16.7" y2="16.7" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  )
}

// ── Select ───────────────────────────────────────────────────────────────────
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
}) {
  return (
    <select className="sk-select" value={value} onChange={e => onChange(e.target.value)} aria-label={ariaLabel}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
