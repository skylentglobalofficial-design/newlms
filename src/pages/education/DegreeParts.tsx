/**
 * Shared pieces of the degree surfaces (education landing, online degree, campus degree).
 * Nothing here knows a university, a fee, a date or an outcome: a degree's facts arrive as a
 * `Degree` from src/lib/degrees.ts, and anything that record does not carry is shown as
 * "Published by the institution".
 */
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight, ProductSlice, TruthChip } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { openSkylentAi } from "../../components/skylent/ai-events"
import {
  PUBLISHED_BY_INSTITUTION,
  degreeListingPath,
  deliveryModeLabel,
  type Degree,
  type DegreeAsset,
  type DeliveryMode,
} from "../../lib/degrees"
import { assetAlt } from "./degreeStandIns"
import "./Degree.css"
import "../cine.css"

/* ── Shell ─────────────────────────────────────────────────────────────────── */

/** Public shell + the seven-stage locator. Choosing a degree is the "Choose" stage. */
export function DegreeShell({ children }: { children: ReactNode }) {
  return (
    <PageShell aurora={false}>
      <div className="site-light dg">
        {children}
      </div>
    </PageShell>
  )
}

/* ── Small pieces ──────────────────────────────────────────────────────────── */

export function Unpublished({ children }: { children?: ReactNode }) {
  return <span className="dg-unpub">{children ?? PUBLISHED_BY_INSTITUTION}</span>
}

/** A published value, or the honest empty wording when the record does not carry it. */
export function orUnpublished(value: string | undefined | null): ReactNode {
  return value && value.trim() ? value : <Unpublished />
}

/** Mode chip + the truth chips the record calls for. Mode comes from metadata, never from the page. */
export function ListingChips({ degree }: { degree: Degree; showStatus?: boolean }) {
  return (
    <>
      <span className="sky-chip dg-mode">{deliveryModeLabel(degree.deliveryMode)}</span>
      {degree.status === "coming_soon" || degree.sample ? <span className="dg-soon-pill">Admissions opening soon</span> : null}
    </>
  )
}

export function DegreeCrumb({ mode }: { mode?: DeliveryMode }) {
  return (
    <nav aria-label="Breadcrumb" className="sky-label dg-crumb">
      <Link to="/education">Education</Link>
      <span aria-hidden="true">/</span>
      {mode ? (
        <>
          <Link to="/education#degrees">Degrees</Link>
          <span aria-hidden="true">/</span>
          <Link to={degreeListingPath(mode)} aria-current="page">
            {deliveryModeLabel(mode)}
          </Link>
        </>
      ) : (
        <span aria-current="page">Degrees</span>
      )}
    </nav>
  )
}

export function QuietLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="dg-quiet">
      {children}
      <ArrowRight />
    </Link>
  )
}

export function Tick({ label }: { label?: string }) {
  return (
    <svg
      className="dg-tick"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/* ── Photographs ───────────────────────────────────────────────────────────── */

/**
 * A captioned photograph. A stand-in always says "Stand-in photograph" in the caption;
 * an institution's own photograph (none exist yet) would carry only its own caption.
 */
export function Photo({
  asset,
  fig,
  aside,
  className = "",
  eager = false,
  plain = false,
}: {
  asset: DegreeAsset
  fig?: string
  aside?: ReactNode
  className?: string
  eager?: boolean
  /** Plain caption: "Stand-in photograph" on the left, what it shows on the right. */
  plain?: boolean
}) {
  // Repolish: photographs carry no figure numbers or construction captions; the alt text describes them.
  void fig
  void aside
  void plain
  return (
    <figure className={`dg-photo ${className}`.trim()}>
      <img src={asset.src} alt={assetAlt(asset)} loading={eager ? "eager" : "lazy"} decoding="async" />
    </figure>
  )
}

/* ── The learning week (illustrative product artefact for online study) ────── */

export type WeekSession = {
  day: string
  name: string
  format: "Live" | "Recorded" | "Self-study" | "Assessed"
  /** Whether the session has a fixed time. The time itself is never stated: it is not published. */
  timing: "Set time" | "Own time" | "Deadline"
  room: string
  state: "done" | "today" | "ahead"
}

/** One illustrative week. Days and counts are placeholders; no clock times are shown anywhere. */
export const ILLUSTRATIVE_WEEK: WeekSession[] = [
  { day: "MON", name: "Live session", format: "Live", timing: "Set time", room: "In the virtual classroom", state: "done" },
  { day: "TUE", name: "Recorded lecture", format: "Recorded", timing: "Own time", room: "In resources", state: "done" },
  { day: "WED", name: "Reading and resources", format: "Self-study", timing: "Own time", room: "In resources", state: "today" },
  { day: "THU", name: "Tutorial", format: "Live", timing: "Set time", room: "In the virtual classroom", state: "ahead" },
  { day: "FRI", name: "Assessment due", format: "Assessed", timing: "Deadline", room: "In online assessment", state: "ahead" },
]

export function LearningWeek({ compact = false }: { compact?: boolean }) {
  const week = ILLUSTRATIVE_WEEK
  const done = week.filter((s) => s.state === "done").length
  const todayIndex = week.findIndex((s) => s.state === "today")
  return (
    <div className={`dg-week${compact ? " dg-week--compact" : ""}`}>
      <div className="dg-week__head sky-on-navy">
        <div className="dg-week__headrow">
          <div>
            <div className="dg-week__kicker">Online learning environment</div>
            <div className="dg-week__title">A study week</div>
          </div>
          {compact ? null : (
            <ProductSlice steps={["Learn", "Practice", "Prove"]} current="Learn" label="Where this week sits in the product model" />
          )}
        </div>
        <div className="dg-week__progress">
          <div
            className="dg-progress"
            role="progressbar"
            aria-label="Sessions done this week"
            aria-valuemin={0}
            aria-valuemax={week.length}
            aria-valuenow={done}
          >
            <span style={{ width: `${(done / week.length) * 100}%` }} />
          </div>
          <span className="dg-week__count">
            {done} of {week.length} done
          </span>
        </div>
      </div>

      <div className="dg-week__bar">
        <span className="sky-label">This week</span>
        <TruthChip state="illustrative" />
      </div>

      <ol className="dg-week__list">
        {week.map((session, i) => {
          const reached = i <= todayIndex
          const last = i === week.length - 1
          return (
            <li key={session.day} className="dg-week__item" aria-current={session.state === "today" ? "step" : undefined}>
              <span className="dg-week__day">{session.day}</span>
              <span className="dg-week__rail" aria-hidden="true">
                <span className={`dg-week__seg ${i === 0 ? "dg-week__seg--none" : reached ? "dg-week__seg--on" : ""}`.trim()} />
                <span className={`dg-week__node ${reached ? "dg-week__node--on" : ""}`.trim()} />
                <span
                  className={`dg-week__seg dg-week__seg--grow ${
                    last ? "dg-week__seg--none" : i < todayIndex ? "dg-week__seg--on" : i === todayIndex ? "dg-week__seg--rest" : ""
                  }`.trim()}
                />
              </span>
              <div className="dg-week__body">
                <div>
                  <div className="dg-week__name">{session.name}</div>
                  <div className="dg-week__meta">
                    {session.format} · {session.timing.toLowerCase()}
                  </div>
                </div>
                {session.state === "done" ? (
                  <span className="dg-week__state dg-week__state--done">
                    <Tick />
                    Done
                  </span>
                ) : session.state === "today" ? (
                  <span className="dg-week__state dg-week__state--today">
                    <span className="dg-dot" aria-hidden="true" />
                    Today
                  </span>
                ) : (
                  <span className="dg-week__state">Upcoming</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {compact ? null : (
        <div className="dg-week__rooms">
          <div className="dg-week__room">
            <span className="sky-label">Classroom</span>
            <b>Thu, set time</b>
          </div>
          <div className="dg-week__room">
            <span className="sky-label">Resources</span>
            <b>{week.length} this week</b>
          </div>
          <div className="dg-week__room">
            <span className="sky-label">Assessment</span>
            <b>Due Fri</b>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Closing navy band ─────────────────────────────────────────────────────── */

export function ClosingBand({
  label,
  title,
  secondary,
}: {
  label: string
  title: string
  secondary: { to: string; label: string }
}) {
  /* A question followed by its answer: the answer is the one cobalt phrase. */
  const split = title.indexOf("? ")
  return (
    <section className="sky-stage sky-band-navy dg-close">
      <Reveal className="sky-container dg-close__inner">
        <div className="dg-close__lead">
          <div className="sky-label">{label}</div>
          <h2 className="sky-display sky-display--lg dg-close__title">
            {split > 0 ? (
              <>
                {title.slice(0, split + 2)}
                <em>{title.slice(split + 2)}</em>
              </>
            ) : (
              title
            )}
          </h2>
        </div>
        <Reveal delay={180} className="dg-close__actions">
          <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
            Ask Skylent AI
            <ArrowRight />
          </button>
          <Link to={secondary.to} className="sk-btn sk-btn-secondary">
            {secondary.label}
          </Link>
        </Reveal>
      </Reveal>
    </section>
  )
}

/* ── Not found ─────────────────────────────────────────────────────────────── */

export function DegreeNotFound() {
  return (
    <DegreeShell>
      <section className="sky-container dg-missing">
        <DegreeCrumb />
        <h1 className="dg-h1">This degree route is not listed.</h1>
        <p className="dg-lead">
          Skylent lists only its sample degree areas, and this address does not match one of them. Nothing has been removed: the
          listing does not exist.
        </p>
        <div className="dg-actions">
          <Link to="/education" className="sk-btn sk-btn-primary">
            Explore degrees
            <ArrowRight />
          </Link>
        </div>
      </section>
    </DegreeShell>
  )
}
