import type { ReactNode } from "react"
import { getDaLessonMeta } from "../../content/data-analytics/lessons"
import { formatInr, NORTHWIND_PREVIEW as NW } from "../../lib/northwind-preview"
import "./ProductLanguage.css"

export function ProductFrame({
  brand = "Skylent OS",
  title,
  meta,
  children,
  compact = false,
}: {
  brand?: string
  title: string
  meta?: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <figure className={compact ? "pl-frame is-compact" : "pl-frame"}>
      <figcaption className="pl-frame-bar">
        <span className="pl-frame-brand">{brand}</span>
        <span className="pl-frame-title">{title}</span>
        {meta ? <span className="pl-frame-meta">{meta}</span> : null}
      </figcaption>
      <div className="pl-frame-body">{children}</div>
    </figure>
  )
}

export function VisualStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pl-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function BarRow({ name, value, max }: { name: string; value: number; max: number }) {
  const pct = Math.max(8, Math.round((value / max) * 100))
  return (
    <div className="pl-bar-row">
      <span>{name}</span>
      <div className="pl-bar-track" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <b>{formatInr(value)}</b>
    </div>
  )
}

export function NorthwindWorkspace({ compact = false }: { compact?: boolean }) {
  const catMax = NW.categories[0].value
  const monthMax = Math.max(...NW.months.map((item) => item.value))
  return (
    <ProductFrame title="Data Analytics" meta={NW.window} compact={compact}>
      <div className="pl-nw">
        <div className="pl-stat-row" aria-label="Northwind extract">
          <VisualStat label="Orders" value={String(NW.rows)} />
          <VisualStat label="Valid rows" value={String(NW.validRows)} />
          <VisualStat label="Net revenue" value={NW.netRevenueLabel} />
        </div>
        <div className="pl-nw-split">
          <div>
            <p className="pl-kicker">Valid net revenue by category</p>
            {NW.categories.map((item) => (
              <BarRow key={item.name} name={item.name} value={item.value} max={catMax} />
            ))}
          </div>
          <div>
            <p className="pl-kicker">Month trend</p>
            <div className="pl-spark" aria-hidden="true">
              {NW.months.map((item) => (
                <span key={item.name} style={{ height: `${Math.max(12, Math.round((item.value / monthMax) * 100))}%` }}>
                  <em>{item.name}</em>
                </span>
              ))}
            </div>
            <p className="pl-fine">{NW.weakestMonth} is the weakest month in this extract.</p>
          </div>
        </div>
        {!compact ? (
          <pre className="pl-sql" tabIndex={0}>
            <code>{NW.sql}</code>
          </pre>
        ) : null}
      </div>
    </ProductFrame>
  )
}

export function CourseWorkspacePreview({
  courseTitle,
  lessonTitle,
  practiceTitle,
  workTitle,
  modules,
}: {
  courseTitle: string
  lessonTitle: string
  practiceTitle: string
  workTitle: string
  modules: string[]
}) {
  return (
    <ProductFrame title={courseTitle} meta="Course workspace">
      <div className="pl-ws">
        <ol className="pl-ws-rail" aria-label="Modules">
          {modules.map((title, index) => (
            <li key={title} className={index === 0 ? "is-on" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {title}
            </li>
          ))}
        </ol>
        <div className="pl-ws-main">
          <p className="pl-kicker">Current lesson</p>
          <p className="pl-ws-lesson">{lessonTitle}</p>
          <div className="pl-chip-row">
            <span className="pl-chip">Lesson</span>
            <span className="pl-chip">{practiceTitle}</span>
            <span className="pl-chip">{workTitle}</span>
          </div>
          <div className="pl-ws-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </ProductFrame>
  )
}

export function CourseThumb({ authored }: { authored: boolean }) {
  const monthMax = Math.max(...NW.months.map((item) => item.value))
  return (
    <div className={authored ? "pl-thumb is-live" : "pl-thumb"} aria-hidden="true">
      {authored ? (
        <>
          <div className="pl-thumb-kpis">
            <b>{NW.netRevenueLabel}</b>
            <span>{NW.validRows} valid rows</span>
          </div>
          <div className="pl-spark pl-spark-mini">
            {NW.months.map((item) => (
              <span key={item.name} style={{ height: `${Math.max(18, Math.round((item.value / monthMax) * 100))}%` }} />
            ))}
          </div>
        </>
      ) : (
        <div className="pl-thumb-outline">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  )
}

export function LearnFlow({
  steps,
}: {
  steps: ReadonlyArray<{ title: string; copy: string; kind: "learn" | "practice" | "build" | "keep" }>
}) {
  return (
    <ol className="pl-flow">
      {steps.map((step) => (
        <li key={step.title}>
          <div className={`pl-flow-visual is-${step.kind}`} aria-hidden="true">
            {step.kind === "learn" ? (
              <>
                <span />
                <span />
                <span />
              </>
            ) : null}
            {step.kind === "practice" ? (
              <>
                <b>○</b>
                <b>●</b>
                <b>○</b>
              </>
            ) : null}
            {step.kind === "build" ? <em>Northwind</em> : null}
            {step.kind === "keep" ? <strong>Work sample</strong> : null}
          </div>
          <strong>{step.title}</strong>
          <p>{step.copy}</p>
        </li>
      ))}
    </ol>
  )
}

export function PathwayTrack({
  steps,
}: {
  steps: Array<{ label: string; live: boolean; note: string }>
}) {
  return (
    <ol className="pl-path">
      {steps.map((step) => (
        <li key={step.label} className={step.live ? "is-live" : "is-later"}>
          <span className="pl-path-mark" aria-hidden="true" />
          <div>
            <strong>{step.label}</strong>
            <p>{step.note}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function CareerEvidencePreview() {
  return (
    <ProductFrame title="Career OS" meta="Evidence workspace" compact>
      <div className="pl-evidence">
        <p className="pl-kicker">Work you can keep</p>
        <p className="pl-ws-lesson">Northwind commercial review</p>
        <p className="pl-fine">A capstone work sample from Data Analytics. Career OS is a workspace — not a job guarantee.</p>
      </div>
    </ProductFrame>
  )
}

export function PathwayThumb() {
  return (
    <div className="pl-thumb" aria-hidden="true">
      <div className="pl-mini-path">
        <i className="is-live" />
        <i className="is-live" />
        <i />
        <i />
      </div>
    </div>
  )
}

export function LessonContextPanel({ lessonId }: { lessonId: string }) {
  const meta = getDaLessonMeta(lessonId)
  if (!meta) return null
  const haystack = `${meta.title} ${meta.concepts.join(" ")} ${meta.objective}`
  const visual = /sql|select|join/i.test(haystack)
    ? "sql"
    : /dashboard|chart|pivot|stand-up/i.test(haystack)
      ? "chart"
      : /northwind|spreadsheet|dataset|valid row|revenue/i.test(haystack)
        ? "dataset"
        : "none"

  return (
    <aside className="pl-lesson-ctx">
      <div>
        <p className="pl-kicker">Objective</p>
        <p className="pl-ws-lesson pl-lesson-obj">{meta.objective}</p>
        <p className="pl-fine">You produce: {meta.practicalOutput}</p>
      </div>
      {visual === "sql" ? (
        <pre className="pl-sql">
          <code>{NW.sql}</code>
        </pre>
      ) : null}
      {visual === "chart" || visual === "dataset" ? (
        <div className="pl-stat-row" aria-label="Northwind extract">
          <VisualStat label="Valid rows" value={String(NW.validRows)} />
          <VisualStat label="Net revenue" value={NW.netRevenueLabel} />
          <VisualStat label="Top category" value={NW.topCategory} />
        </div>
      ) : null}
    </aside>
  )
}
