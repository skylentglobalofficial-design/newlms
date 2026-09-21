import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import {
  ACADEMIC_LINES,
  LIVE_CORE,
  MATURITY_LABEL,
  type ProductMaturity,
} from "../../lib/product-architecture"

export function MaturityMark({
  maturity,
  compact,
}: {
  maturity: ProductMaturity
  compact?: boolean
}) {
  const palette: Record<ProductMaturity, { color: string; border: string; bg: string }> = {
    live: { color: "#166534", border: "rgba(22,101,52,0.28)", bg: "rgba(22,101,52,0.08)" },
    coming_soon: { color: C.indigo, border: "rgba(79,70,229,0.28)", bg: "rgba(79,70,229,0.07)" },
    direction: { color: C.slate, border: T.lineStrong, bg: C.cream },
    demo: { color: "#9A3412", border: "rgba(154,52,18,0.28)", bg: "rgba(249,115,22,0.08)" },
  }
  const tone = palette[maturity]
  return (
    <span
      className="arch-mark"
      style={{
        display: "inline-flex",
        alignItems: "center",
        color: tone.color,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 4,
        padding: compact ? "1px 6px" : "3px 8px",
        fontSize: compact ? 9 : 10,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {MATURITY_LABEL[maturity]}
    </span>
  )
}

export function UpcomingBanner({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div
      className="arch-upcoming"
      style={{
        border: `1px solid ${T.lineDark}`,
        borderLeft: `3px solid ${C.indigo}`,
        background: C.cream,
        padding: "16px 18px",
        marginBottom: 28,
        maxWidth: 720,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
        <MaturityMark maturity="coming_soon" />
        <strong style={{ color: C.ink, fontSize: 14, fontWeight: 600 }}>{title}</strong>
      </div>
      <p style={{ margin: 0, color: C.slate, fontSize: 13.5, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

export function PathwayModel({
  steps,
  title,
}: {
  title: string
  steps: readonly { label: string; sub: string }[]
}) {
  return (
    <div className="arch-pathway">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18 }}>{title}</div>
      <ol className="arch-pathway-list">
        {steps.map((step, i) => (
          <li key={step.label} className="arch-pathway-step">
            <span className="arch-pathway-index">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="arch-pathway-label">{step.label}</div>
              <div className="arch-pathway-sub">{step.sub}</div>
            </div>
            {i < steps.length - 1 && <span className="arch-pathway-rule" aria-hidden />}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function LiveCoreRail({ lead }: { lead?: string }) {
  return (
    <aside className="arch-live-core" aria-label="Skylent products you can use now">
      <div className="skylent-label" style={{ color: C.indigo, marginBottom: 10 }}>Available now</div>
      {lead && <p style={{ margin: "0 0 16px", color: C.slate, fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>{lead}</p>}
      <div className="arch-live-core-row">
        {LIVE_CORE.map((item, i) => (
          <span key={item.label} className="arch-live-core-item">
            <Link to={item.to}>{item.label}</Link>
            <span>{item.note}</span>
            {i < LIVE_CORE.length - 1 && <i aria-hidden>→</i>}
          </span>
        ))}
      </div>
    </aside>
  )
}

export function AcademicLineIndex({ current }: { current?: string }) {
  return (
    <nav className="arch-line-index" aria-label="Academic product lines">
      {ACADEMIC_LINES.map((line) => {
        const active = current === line.id
        return (
          <Link
            key={line.id}
            to={line.to}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <span className="arch-line-name">{line.label}</span>
            <MaturityMark maturity={line.maturity} compact />
            <span className="arch-line-job">{line.job}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function CompareTable({
  leftTitle,
  rightTitle,
  rows,
}: {
  leftTitle: string
  rightTitle: string
  rows: readonly { aspect: string; left: string; right: string }[]
}) {
  return (
    <div className="arch-compare" role="table" aria-label={`${leftTitle} compared with ${rightTitle}`}>
      <div className="arch-compare-head" role="row">
        <span role="columnheader"> </span>
        <span role="columnheader">{leftTitle}</span>
        <span role="columnheader">{rightTitle}</span>
      </div>
      {rows.map((row) => (
        <div key={row.aspect} className="arch-compare-row" role="row">
          <span role="rowheader">{row.aspect}</span>
          <span role="cell">{row.left}</span>
          <span role="cell">{row.right}</span>
        </div>
      ))}
    </div>
  )
}

export function CapabilityRail({
  items,
}: {
  items: readonly { label: string; status: ProductMaturity; note: string }[]
}) {
  return (
    <div className="arch-capability">
      {items.map((item) => (
        <div key={item.label} className="arch-capability-row">
          <strong>{item.label}</strong>
          <MaturityMark maturity={item.status} compact />
          <span>{item.note}</span>
        </div>
      ))}
    </div>
  )
}

export function AcademicSubnav({ current }: { current?: string }) {
  return (
    <nav className="arch-academic-subnav" aria-label="Academic lines">
      <Link to="/education" className={!current ? "is-active" : undefined}>Overview</Link>
      {ACADEMIC_LINES.map((line) => (
        <Link key={line.id} to={line.to} className={current === line.id ? "is-active" : undefined} aria-current={current === line.id ? "page" : undefined}>
          {line.label}
        </Link>
      ))}
    </nav>
  )
}

export function LinePageHeader({
  kicker,
  title,
  lead,
  maturity,
}: {
  kicker: string
  title: string
  lead: string
  maturity: ProductMaturity
}) {
  return (
    <header className="arch-line-header">
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div className="skylent-label" style={{ color: C.indigo, margin: 0 }}>{kicker}</div>
        <MaturityMark maturity={maturity} />
      </div>
      <h1 className="skylent-display-md" style={{ color: C.ink, margin: "0 0 14px", maxWidth: 720 }}>{title}</h1>
      <p className="skylent-body-lg" style={{ color: C.slate, margin: 0, maxWidth: 560 }}>{lead}</p>
    </header>
  )
}
