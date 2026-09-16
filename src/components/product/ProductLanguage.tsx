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

function Spark({ mini = false }: { mini?: boolean }) {
  const monthMax = Math.max(...NW.months.map((item) => item.value))
  return (
    <div className={mini ? "pl-spark pl-spark-mini" : "pl-spark"} aria-hidden="true">
      {NW.months.map((item) => (
        <span key={item.name} style={{ height: `${Math.max(mini ? 18 : 12, Math.round((item.value / monthMax) * 100))}%` }}>
          {mini ? null : <em>{item.name}</em>}
        </span>
      ))}
    </div>
  )
}

function NorthwindTable() {
  return (
    <table className="pl-table">
      <caption className="pl-kicker">Valid net revenue by category</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">Net revenue</th>
        </tr>
      </thead>
      <tbody>
        {NW.categories.map((item) => (
          <tr key={item.name}>
            <td>{item.name}</td>
            <td>{formatInr(item.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function NorthwindExtract({ compact = false }: { compact?: boolean }) {
  const catMax = NW.categories[0].value
  return (
    <div className={compact ? "pl-nw is-compact" : "pl-nw"}>
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
          <Spark />
          <p className="pl-fine">{NW.weakestMonth} is the weakest month in this extract.</p>
        </div>
      </div>
      {!compact ? (
        <pre className="pl-sql" tabIndex={0}>
          <code>{NW.sql}</code>
        </pre>
      ) : null}
    </div>
  )
}

export function NorthwindWorkspace({ compact = false }: { compact?: boolean }) {
  return (
    <ProductFrame title="Data Analytics" meta={`${NW.filename} · ${NW.window}`} compact={compact}>
      <NorthwindExtract compact={compact} />
    </ProductFrame>
  )
}

export function CourseWorkspacePreview({
  courseTitle,
  lessonTitle,
  practiceTitle,
  workTitle,
  modules,
  lessonCount,
}: {
  courseTitle: string
  lessonTitle: string
  practiceTitle: string
  workTitle: string
  modules: string[]
  lessonCount?: number
}) {
  return (
    <ProductFrame
      title={courseTitle}
      meta={lessonCount ? `${lessonCount} lessons · not started` : "Course workspace"}
    >
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
          <div className="pl-ws-current">
            <p className="pl-kicker">Current lesson</p>
            <p className="pl-ws-lesson">{lessonTitle}</p>
            <p className="pl-fine">
              {practiceTitle}
              {" · "}
              {workTitle}
            </p>
          </div>
          <div className="pl-ws-extract" aria-label="Northwind extract">
            <p className="pl-kicker">{NW.filename}</p>
            <div className="pl-stat-row">
              <VisualStat label="Valid rows" value={String(NW.validRows)} />
              <VisualStat label="Net revenue" value={NW.netRevenueLabel} />
              <VisualStat label="Top category" value={NW.topCategory} />
            </div>
            <div className="pl-ws-viz">
              <Spark mini />
              <NorthwindTable />
            </div>
          </div>
        </div>
      </div>
    </ProductFrame>
  )
}

export function CourseThumb({ authored }: { authored: boolean }) {
  return (
    <div className={authored ? "pl-thumb is-live" : "pl-thumb"} aria-hidden="true">
      {authored ? (
        <>
          <div className="pl-thumb-kpis">
            <b>{NW.netRevenueLabel}</b>
            <span>{NW.validRows} valid rows</span>
          </div>
          <Spark mini />
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
              <div className="pl-flow-lesson">
                <em>Lesson</em>
                <b>Written work</b>
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {step.kind === "practice" ? (
              <div className="pl-flow-quiz">
                <em>Knowledge check</em>
                <span className="pl-opt is-on" />
                <span className="pl-opt" />
                <span className="pl-opt" />
              </div>
            ) : null}
            {step.kind === "build" ? (
              <>
                <em>{NW.filename}</em>
                <Spark mini />
              </>
            ) : null}
            {step.kind === "keep" ? (
              <div className="pl-flow-keep">
                <em>Work sample</em>
                <strong>Northwind commercial review</strong>
              </div>
            ) : null}
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
  layout = "track",
}: {
  steps: Array<{ label: string; live: boolean; note: string }>
  layout?: "track" | "board"
}) {
  return (
    <ol className={layout === "board" ? "pl-path is-board" : "pl-path"}>
      {steps.map((step, index) => (
        <li key={step.label} className={step.live ? "is-live" : "is-later"}>
          <span className="pl-path-index">{String(index + 1).padStart(2, "0")}</span>
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

export type ModuleLaneItem = {
  id: string
  index: number
  title: string
  workLine: string
  countsLabel: string
}

export function moduleVisualKind(title: string, countsLabel = "") {
  const hay = `${title} ${countsLabel}`
  if (/sql/i.test(hay)) return "sql" as const
  if (/dashboard/i.test(hay)) return "chart" as const
  if (/capstone|applied project/i.test(hay)) return "build" as const
  if (/spread|sheet/i.test(hay)) return "sheet" as const
  return "learn" as const
}

function ModuleVisual({ kind }: { kind: ReturnType<typeof moduleVisualKind> }) {
  if (kind === "sql") {
    return (
      <pre className="pl-lane-sql" aria-hidden="true">
        <code>SELECT net_revenue FROM sales</code>
      </pre>
    )
  }
  if (kind === "chart") return <Spark mini />
  if (kind === "sheet") {
    return (
      <div className="pl-lane-sheet" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    )
  }
  if (kind === "build") {
    return <span className="pl-lane-doc">Northwind review</span>
  }
  return (
    <div className="pl-lane-lines" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

export function ModuleLane({ modules }: { modules: ModuleLaneItem[] }) {
  return (
    <ol className="pl-lane">
      {modules.map((module) => {
        const kind = moduleVisualKind(module.title, module.countsLabel)
        return (
          <li key={module.id} className={`pl-lane-item is-${kind}${module.index === 1 ? " is-start" : ""}`}>
            <ModuleVisual kind={kind} />
            <span className="pl-lane-num">{String(module.index).padStart(2, "0")}</span>
            <div className="pl-lane-copy">
              <strong>{module.title}</strong>
              <p>{module.workLine}</p>
              <p>{module.countsLabel}</p>
            </div>
          </li>
        )
      })}
    </ol>
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
        <p className="pl-kicker">You produce</p>
        <p className="pl-ws-lesson pl-lesson-obj">{meta.practicalOutput}</p>
        <p className="pl-fine">{meta.whyItMatters}</p>
      </div>
      {visual === "sql" ? (
        <pre className="pl-sql">
          <code>{NW.sql}</code>
        </pre>
      ) : null}
      {visual === "chart" || visual === "dataset" ? (
        <div className="pl-lesson-extract" aria-label="Northwind extract">
          <div className="pl-stat-row">
            <VisualStat label="Valid rows" value={String(NW.validRows)} />
            <VisualStat label="Net revenue" value={NW.netRevenueLabel} />
            <VisualStat label="Top category" value={NW.topCategory} />
          </div>
          {visual === "chart" ? <Spark mini /> : <NorthwindTable />}
        </div>
      ) : null}
    </aside>
  )
}
