import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Program } from '../data'
import { PROGRAM_TYPE_LABELS } from '../skylent-worlds'
import type { ProductWorld } from './world/WorldFrame'
export type { ProductWorld }
export { default as AppShell } from './world/WorldFrame'
export { default as ProductShell } from './world/WorldFrame'

export type Crumb = { label: string; href?: string }

export type FilterOption = {
  id: string
  label: string
  count?: number
}

export type ProgrammeCardModel = {
  href: string
  title: string
  type: string
  description: string
  meta: string[]
  price?: string
  cta?: string
}

export function formatInr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export function programCard(program: Program, extras?: { price?: number; status?: string }): ProgrammeCardModel {
  return {
    href: `/programs/${program.slug}`,
    title: program.name,
    type: PROGRAM_TYPE_LABELS[program.programType],
    description: program.desc,
    meta: [
      extras?.status,
      program.level,
      program.duration,
      program.format,
    ].filter(Boolean) as string[],
    price: extras?.price != null ? formatInr(extras.price) : formatInr(Math.min(...program.pricing.map((tier) => tier.price))),
    cta: 'Open',
  }
}

export function ContentRail({
  children,
  wide = false,
}: {
  children: React.ReactNode
  wide?: boolean
}) {
  return <div className={wide ? 'product-rail product-rail--wide' : 'product-rail'}>{children}</div>
}

export function ProductBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="product-crumbs">
        {items.map((item, index) => {
          const current = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              {item.href && !current ? <Link to={item.href}>{item.label}</Link> : (
                <span aria-current={current ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ContextHeader({
  world: _world,
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: {
  world: ProductWorld
  eyebrow: string
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
}) {
  return (
    <header className="product-header">
      {breadcrumbs?.length ? <ProductBreadcrumbs items={breadcrumbs} /> : null}
      <div className="product-header-row">
        <div>
          <p className="product-kicker">{eyebrow}</p>
          <h1 className="product-title">{title}</h1>
          {description ? <p className="product-lede">{description}</p> : null}
        </div>
        {actions ? <div className="product-header-actions">{actions}</div> : null}
      </div>
    </header>
  )
}

export function ProductLayout({
  sidebar,
  children,
  variant = 'catalog',
}: {
  sidebar?: React.ReactNode
  children: React.ReactNode
  variant?: 'catalog' | 'pdp' | 'stack'
}) {
  if (variant === 'stack' || !sidebar) {
    return <div className="product-layout product-layout--stack">{children}</div>
  }
  if (variant === 'pdp') {
    return (
      <div className="product-layout product-layout--pdp">
        <div className="product-main">{children}</div>
        <aside className="product-side pdp-enroll">{sidebar}</aside>
      </div>
    )
  }
  return (
    <div className="product-layout">
      <aside className="product-side product-side--desktop">{sidebar}</aside>
      <div className="product-main">{children}</div>
    </div>
  )
}

export function SideRail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="product-filter-title">{title}</h2>
      {children}
    </div>
  )
}

export function FilterPanel({
  title = 'Filters',
  options,
  value,
  onChange,
  labelledBy,
}: {
  title?: string
  options: FilterOption[]
  value: string
  onChange: (id: string) => void
  labelledBy?: string
}) {
  const headingId = useId()
  return (
    <div>
      <h2 className="product-filter-title" id={labelledBy ?? headingId}>{title}</h2>
      <ul className="product-filter-list" aria-labelledby={labelledBy ?? headingId}>
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              aria-pressed={value === option.id}
              onClick={() => onChange(option.id)}
            >
              <span>{option.label}</span>
              {option.count != null ? <span className="product-count">{option.count}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NavList({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string; href?: string }[]
  value?: string
  onChange?: (id: string) => void
}) {
  return (
    <ul className="product-nav-list">
      {items.map((item) => (
        <li key={item.id}>
          {item.href ? (
            <Link to={item.href} aria-current={value === item.id ? 'page' : undefined}>{item.label}</Link>
          ) : (
            <button
              type="button"
              aria-current={value === item.id ? 'true' : undefined}
              onClick={() => onChange?.(item.id)}
            >
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export function ProductTabs({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <div className="product-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function SegmentedControl({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <div className="product-segments" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="product-section-head">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function ProgrammeMeta({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="programme-meta">
      {items.map((item) => <span key={item}>{item}</span>)}
    </div>
  )
}

export function ProgrammeCard({ item }: { item: ProgrammeCardModel }) {
  return (
    <Link to={item.href} className="programme-card">
      <div>
        <ProgrammeMeta items={[item.type, ...item.meta]} />
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="programme-card-cta">
        {item.price ? <div style={{ fontWeight: 700, marginBottom: 8 }}>{item.price}</div> : null}
        <span className="product-btn-ghost">{item.cta ?? 'Open'}</span>
      </div>
    </Link>
  )
}

export function ProgrammeList({
  items,
  empty,
}: {
  items: ProgrammeCardModel[]
  empty: React.ReactNode
}) {
  if (!items.length) return <>{empty}</>
  return (
    <div className="product-list">
      {items.map((item) => <ProgrammeCard key={item.href} item={item} />)}
    </div>
  )
}

export function CurriculumNav({
  items,
  current,
}: {
  items: { id: string; label: string; meta?: string }[]
  current?: string
}) {
  return (
    <nav aria-label="Curriculum">
      <ol className="curriculum-nav">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#module-${item.id}`} aria-current={current === item.id ? 'location' : undefined}>
              <strong>{item.label}</strong>
              {item.meta ? <span className="product-count">{item.meta}</span> : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function AssessmentPanel({
  title = 'Assessment',
  items,
}: {
  title?: string
  items: { title: string; detail: string }[]
}) {
  return (
    <section className="assessment-panel">
      <h2>{title}</h2>
      <ul className="assessment-list">
        {items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span className="product-count">{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProgressPanel({
  title = 'Progress',
  steps,
  note,
}: {
  title?: string
  steps: string[]
  note?: string
}) {
  return (
    <section className="progress-panel">
      <h2>{title}</h2>
      <ol className="progress-steps">
        {steps.map((step) => (
          <li key={step}><strong>{step}</strong></li>
        ))}
      </ol>
      {note ? <p className="progress-note">{note}</p> : null}
    </section>
  )
}

export function ActionPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="action-panel">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="product-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  )
}

export function ComingSoonState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="product-soon">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export function StickyActionBar({
  children,
  visible = true,
}: {
  children: React.ReactNode
  visible?: boolean
}) {
  return (
    <div className={`product-sticky-bar${visible ? ' is-visible' : ''}`}>
      {children}
    </div>
  )
}

export function FilterToggle({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="filter-toggle product-btn-ghost"
      aria-expanded={open}
      aria-controls="product-filter-drawer"
      onClick={onClick}
    >
      Filters
    </button>
  )
}

export function FilterDrawer({
  open,
  onClose,
  children,
  title = 'Filters',
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  return (
    <div
      id="product-filter-drawer"
      className={`product-drawer${open ? ' is-open' : ''}`}
      aria-hidden={!open}
    >
      {open ? (
        <div className="product-drawer-backdrop" onClick={onClose} />
      ) : null}
      <div
        className="product-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button type="button" ref={closeRef} className="drawer-close product-btn-ghost" onClick={onClose}>
          Close filters
        </button>
        {children}
      </div>
    </div>
  )
}

export function ProductTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="product-table">
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function WorkspaceBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="workspace-block">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
