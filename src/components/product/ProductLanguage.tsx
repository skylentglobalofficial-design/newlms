import type { ReactNode } from "react"
import { getLessonMeta } from "../../content/course-lookups"
import { PRODUCT_MANAGEMENT_SLUG } from "../../lib/authored-courses"
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

const HARBOR = {
  stores: 12,
  interviews: 4,
  weekendExceptions: 9,
  unlogged: 3,
  constraint: "2 engineers · 6 weeks",
  bet: "Weekend exception queue",
} as const

function HarborStores() {
  return (
    <div className="pl-hd-stores" aria-hidden="true">
      {Array.from({ length: HARBOR.stores }, (_, index) => (
        <span key={index} className={index < HARBOR.weekendExceptions ? "is-ex" : undefined} />
      ))}
    </div>
  )
}

function HarborDeskBoard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "pl-hd is-compact" : "pl-hd"}>
      <div className="pl-stat-row" aria-label="Harbor Desk case">
        <VisualStat label="Stores" value={String(HARBOR.stores)} />
        <VisualStat label="Interviews" value={String(HARBOR.interviews)} />
        <VisualStat label="Weekend exceptions" value={String(HARBOR.weekendExceptions)} />
      </div>
      <div className="pl-hd-board">
        <div>
          <p className="pl-kicker">Harbor Retail stores</p>
          <HarborStores />
        </div>
        {!compact ? (
          <div>
            <p className="pl-kicker">Exception log</p>
            <p className="pl-hd-quote">
              {HARBOR.unlogged} of {HARBOR.weekendExceptions} weekend exceptions never appeared in a channel.
            </p>
            <p className="pl-fine">{HARBOR.interviews} interviews · fictional Harbor Retail — not Northwind.</p>
          </div>
        ) : (
          <div className="pl-hd-board-compact-quote">
            <p className="pl-kicker">Exception log</p>
            <p className="pl-hd-quote">
              {HARBOR.unlogged} of {HARBOR.weekendExceptions} weekend exceptions never appeared in a channel.
            </p>
          </div>
        )}
      </div>
      <ol className="pl-hd-flow" aria-label="Product case path">
        <li>
          <span>01</span>
          <strong>Evidence</strong>
          <p>Quotes and the exception log — not a solution name.</p>
        </li>
        <li>
          <span>02</span>
          <strong>Frame</strong>
          <p>A testable problem with a user and a pain.</p>
        </li>
        <li>
          <span>03</span>
          <strong>One bet</strong>
          <p>{HARBOR.bet} under {HARBOR.constraint}.</p>
        </li>
        <li>
          <span>04</span>
          <strong>Spec</strong>
          <p>Trigger, happy path, one edge, out of scope.</p>
        </li>
      </ol>
    </div>
  )
}

export function HarborDeskWorkspace({
  compact = false,
  meta,
}: {
  compact?: boolean
  meta?: string
}) {
  const resolvedMeta = meta ?? "harbor-desk-case.md · 4 interviews"
  return (
    <ProductFrame title="Product Management" meta={resolvedMeta} compact={compact}>
      <HarborDeskBoard compact={compact} />
    </ProductFrame>
  )
}

export function CourseProductVisual({
  visual,
  compact = false,
}: {
  visual: "northwind" | "harbor-desk"
  compact?: boolean
}) {
  if (visual === "harbor-desk") return <HarborDeskWorkspace compact={compact} />
  return <NorthwindWorkspace compact={compact} />
}

const WORKFLOW_STAGES = [
  { id: "learn", label: "Learn", lesson: "Spreadsheet tables, types, and filters" },
  { id: "practise", label: "Practise", lesson: "Spreadsheet analysis check" },
  { id: "project", label: "Project", lesson: "Northwind commercial review" },
  { id: "evidence", label: "Evidence", lesson: "Work sample you keep" },
] as const

export function SkylentWorkflowStory() {
  return (
    <ProductFrame title="Data Analytics" meta={`${NW.filename} · one pathway through Skylent OS`}>
      <div className="pl-workflow-rail" aria-hidden="true">
        {WORKFLOW_STAGES.map((stage, index) => (
          <span key={stage.id} className={index === 0 ? "is-on" : undefined}>
            {stage.label}
          </span>
        ))}
      </div>
      <div className="pl-workflow-strip" aria-label="One pathway from lesson to evidence">
        <article className="pl-workflow-pane is-learn">
          <p className="pl-kicker">01 · Learn</p>
          <div className="pl-flow-visual is-learn">
            <div className="pl-flow-lesson">
              <em>Written lesson</em>
              <b>{WORKFLOW_STAGES[0].lesson}</b>
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>
        <span className="pl-workflow-join" aria-hidden="true" />
        <article className="pl-workflow-pane is-practise">
          <p className="pl-kicker">02 · Practise</p>
          <div className="pl-flow-visual is-practice">
            <div className="pl-flow-quiz">
              <em>{WORKFLOW_STAGES[1].lesson}</em>
              <span className="pl-opt is-on" />
              <span className="pl-opt" />
              <span className="pl-opt" />
            </div>
          </div>
        </article>
        <span className="pl-workflow-join" aria-hidden="true" />
        <article className="pl-workflow-pane is-project">
          <p className="pl-kicker">03 · Project</p>
          <div className="pl-flow-visual is-build">
            <em>{WORKFLOW_STAGES[2].lesson}</em>
            <Spark mini />
            <p className="pl-fine">{NW.topCategory} leads {NW.netRevenueLabel} in this extract.</p>
          </div>
        </article>
        <span className="pl-workflow-join" aria-hidden="true" />
        <article className="pl-workflow-pane is-evidence">
          <p className="pl-kicker">04 · Evidence</p>
          <div className="pl-flow-visual is-keep">
            <div className="pl-flow-keep">
              <em>Work sample</em>
              <strong>{WORKFLOW_STAGES[3].lesson}</strong>
            </div>
            <div className="pl-workflow-evidence">
              <VisualStat label="Dataset" value={NW.filename.replace(".csv", "")} />
              <VisualStat label="Net revenue" value={NW.netRevenueLabel} />
            </div>
          </div>
        </article>
      </div>
    </ProductFrame>
  )
}

export function SkylentOsPreview() {
  return (
    <ProductFrame title="Progress" meta="Learning · Practice · Projects · Evidence">
      <div className="pl-os-layers" aria-label="Skylent OS layers">
        <article className="pl-os-layer">
          <div className="pl-flow-visual is-learn">
            <div className="pl-flow-lesson">
              <em>Learning</em>
              <b>Written lesson</b>
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>
        <article className="pl-os-layer">
          <div className="pl-flow-visual is-practice">
            <div className="pl-flow-quiz">
              <em>Practice</em>
              <span className="pl-opt is-on" />
              <span className="pl-opt" />
              <span className="pl-opt" />
            </div>
          </div>
        </article>
        <article className="pl-os-layer">
          <div className="pl-flow-visual is-build">
            <em>Projects</em>
            <b>Work you produce</b>
            <span className="pl-os-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </article>
        <article className="pl-os-layer">
          <div className="pl-flow-visual is-keep">
            <div className="pl-flow-keep">
              <em>Evidence</em>
              <strong>Keep what you built</strong>
            </div>
          </div>
        </article>
      </div>
    </ProductFrame>
  )
}

const CERTIFICATE_JOURNEY = [
  { id: "learn", label: "Learn", note: "Structured courses", state: "done" as const },
  { id: "practise", label: "Practise", note: "Checks on the work", state: "done" as const },
  { id: "build", label: "Build", note: "A project you produce", state: "now" as const },
  { id: "evidence", label: "Evidence", note: "Work you keep", state: "next" as const },
]

function JourneyMark({ state }: { state: "done" | "now" | "next" }) {
  if (state === "done") {
    return (
      <span className="pl-cert-mark is-done" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2.2 6.2 4.7 8.6 9.8 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (state === "now") {
    return <span className="pl-cert-mark is-now" aria-hidden="true" />
  }
  return <span className="pl-cert-mark is-next" aria-hidden="true" />
}

/** Generic Professional Certificate workspace — not a named course. */
export function CertificateOsPreview() {
  return (
    <ProductFrame title="Professional learning" meta="Programme workspace">
      <div className="pl-cert">
        <ol className="pl-cert-rail" aria-label="Learner journey in Skylent OS">
          {CERTIFICATE_JOURNEY.map((step) => (
            <li key={step.id} className={`is-${step.state}`}>
              <JourneyMark state={step.state} />
              <div>
                <strong>{step.label}</strong>
                <span>{step.note}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="pl-cert-stage">
          <p className="pl-kicker">Current work</p>
          <p className="pl-cert-stage-title">Project workspace</p>
          <p className="pl-fine">Produce work from what the courses taught. Nothing here is a grade or a job claim.</p>
          <div className="pl-cert-paper" aria-hidden="true">
            <em>Brief</em>
            <span />
            <span />
            <span />
            <b />
          </div>
          <p className="pl-cert-keep">This becomes evidence you keep.</p>
        </div>
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
  lessonCount,
  visual = "northwind",
  marketing = false,
}: {
  courseTitle: string
  lessonTitle: string
  practiceTitle: string
  workTitle: string
  modules: string[]
  lessonCount?: number
  visual?: "northwind" | "harbor-desk"
  marketing?: boolean
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
          {visual === "harbor-desk" ? (
            <div className="pl-ws-extract" aria-label="Harbor Desk case">
              <p className="pl-kicker">harbor-desk-case.md</p>
              <HarborDeskBoard compact />
            </div>
          ) : (
            <div className="pl-ws-extract" aria-label="Northwind extract">
              <p className="pl-kicker">{NW.filename}</p>
              <div className="pl-stat-row">
                <VisualStat label="Valid rows" value={String(NW.validRows)} />
                <VisualStat label={marketing ? "Sample KPI" : "Net revenue"} value={marketing ? "Category mix" : NW.netRevenueLabel} />
                <VisualStat label="Top category" value={NW.topCategory} />
              </div>
              <div className="pl-ws-viz">
                <Spark mini />
                <NorthwindTable />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProductFrame>
  )
}

export function CourseThumb({
  authored,
  visual = "northwind",
}: {
  authored: boolean
  visual?: "northwind" | "harbor-desk"
}) {
  return (
    <div className={authored ? "pl-thumb is-live" : "pl-thumb"} aria-hidden="true">
      {authored && visual === "harbor-desk" ? (
        <>
          <div className="pl-thumb-kpis">
            <b>Product case</b>
            <span>Evidence → spec</span>
          </div>
          <ol className="pl-hd-mini">
            <li />
            <li />
            <li />
            <li />
          </ol>
        </>
      ) : authored ? (
        <>
          <div className="pl-thumb-kpis">
            <b>Sample dashboard</b>
            <span>SQL · Northwind</span>
          </div>
          <Spark mini />
        </>
      ) : (
        <div className="pl-thumb-outline">
          <b>Outline</b>
          <span>LMS titles only</span>
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
  steps: ReadonlyArray<{ title: string; copy: string; kind: "choose" | "learn" | "practice" | "build" | "keep" }>
}) {
  return (
    <ol className={`pl-flow is-${steps.length}`}>
      {steps.map((step) => (
        <li key={step.title}>
          <div className={`pl-flow-visual is-${step.kind}`} aria-hidden="true">
            {step.kind === "choose" ? (
              <div className="pl-flow-choose">
                <em>Start</em>
                <b>Pick a course</b>
                <span className="pl-flow-choose-pair">
                  <i />
                  <i />
                </span>
              </div>
            ) : null}
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
                <em>Practical work</em>
                <Spark mini />
              </>
            ) : null}
            {step.kind === "keep" ? (
              <div className="pl-flow-keep">
                <em>Work sample</em>
                <strong>Keep what you produced</strong>
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

export function CareerKeepEmpty({
  heading = "Nothing kept yet",
  copy = "Work samples from Data Analytics and Product Management appear here when you add them from a completed project. Nothing is invented.",
}: {
  heading?: string
  copy?: string
}) {
  return (
    <div className="cos-empty">
      <article className="cos-empty-row">
        <CourseThumb authored visual="northwind" />
        <div>
          <strong>Data Analytics</strong>
          <p>Northwind commercial review — kept from the capstone when you add it.</p>
        </div>
      </article>
      <article className="cos-empty-row">
        <CourseThumb authored visual="harbor-desk" />
        <div>
          <strong>Product Management</strong>
          <p>Harbor Desk product case — kept from the product case when you add it.</p>
        </div>
      </article>
      <h2>{heading}</h2>
      <p>{copy}</p>
    </div>
  )
}

export function evidenceVisualFor(title: string, context = ""): "northwind" | "harbor-desk" | null {
  const hay = `${title} ${context}`.toLowerCase()
  if (/harbor|product management|product case/.test(hay)) return "harbor-desk"
  if (/northwind|data analytics|commercial review/.test(hay)) return "northwind"
  return null
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
  if (/capstone|applied project|specification|product case/i.test(hay)) return "build" as const
  if (/spread|sheet/i.test(hay)) return "sheet" as const
  if (/user|evidence|research/i.test(hay)) return "research" as const
  if (/priorit|fram|thinking/i.test(hay)) return "frame" as const
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
    return <span className="pl-lane-doc">Work sample</span>
  }
  if (kind === "frame") {
    return (
      <ol className="pl-hd-mini" aria-hidden="true">
        <li />
        <li />
        <li />
        <li />
      </ol>
    )
  }
  if (kind === "research") {
    return (
      <div className="pl-lane-quote" aria-hidden="true">
        <span />
        <span />
      </div>
    )
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

export function LessonContextPanel({ courseSlug, lessonId }: { courseSlug: string; lessonId: string }) {
  const meta = getLessonMeta(courseSlug, lessonId)
  if (!meta) return null
  const haystack = `${meta.title} ${meta.concepts.join(" ")} ${meta.objective}`
  const isProduct = courseSlug === PRODUCT_MANAGEMENT_SLUG
  const visual = isProduct
    ? /spec|accept|happy path/i.test(haystack)
      ? "spec"
      : /priorit|bet|score/i.test(haystack)
        ? "bet"
        : /interview|quote|evidence|research|job/i.test(haystack)
          ? "case"
          : "case"
    : /sql|select|join/i.test(haystack)
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
      {visual === "case" || visual === "bet" || visual === "spec" ? (
        <div className="pl-lesson-extract" aria-label="Harbor Desk case">
          <div className="pl-stat-row">
            <VisualStat label="Stores" value={String(HARBOR.stores)} />
            <VisualStat label="Exceptions" value={String(HARBOR.weekendExceptions)} />
            <VisualStat label="Unlogged" value={String(HARBOR.unlogged)} />
          </div>
          {visual === "spec" ? (
            <p className="pl-fine">Thin spec: trigger, happy path, one edge, out of scope. Not Gmail.</p>
          ) : visual === "bet" ? (
            <p className="pl-fine">{HARBOR.bet} — {HARBOR.constraint}. Not an ERP.</p>
          ) : (
            <p className="pl-fine">harbor-desk-case.md · {HARBOR.interviews} interviews · fictional Harbor Retail</p>
          )}
        </div>
      ) : null}
    </aside>
  )
}
