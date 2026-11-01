/**
 * Shared pieces of the degree surfaces (education landing, online degree, campus degree).
 * Nothing here knows a university, a fee, a date or an outcome: a degree's facts arrive as a
 * `Degree` from src/lib/degrees.ts, and anything that record does not carry is shown as
 * "Published once an institution is confirmed".
 */
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight, ProductSlice, TruthChip } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { openSkylentAi } from "../../components/skylent/ai-events"
import {
  PUBLISHED_BY_INSTITUTION,
  degreeLevelName,
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
      {degree.sample || degree.status === "coming_soon" ? (
        <span className="dg-soon-pill">Academic Partner Track · Register Interest</span>
      ) : null}
    </>
  )
}

export function DegreeCrumb({ mode, level }: { mode?: DeliveryMode; level?: Degree["level"] }) {
  const levelParam = level === "UNDERGRADUATE" ? "ug" : level === "POSTGRADUATE" ? "pg" : null
  return (
    <nav aria-label="Breadcrumb" className="sky-label dg-crumb">
      <Link to="/education">Education</Link>
      <span aria-hidden="true">/</span>
      {mode || levelParam ? (
        <>
          <Link to="/education#degrees">Degrees</Link>
          {level ? (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/education?level=${levelParam}`}>{degreeLevelName(level)}</Link>
            </>
          ) : null}
          {mode ? (
            <>
              <span aria-hidden="true">/</span>
              <Link to={degreeListingPath(mode, level)}>{deliveryModeLabel(mode)}</Link>
            </>
          ) : null}
        </>
      ) : (
        <span aria-current="page">Degrees</span>
      )}
    </nav>
  )
}

export function QuietLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="dg-link">
      <span>{children}</span>
      <ArrowRight />
    </Link>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */

export function DegreeHero({
  crumb,
  chips,
  title,
  lede,
  primaryCta,
  secondaryCta,
  stage,
  aside,
}: {
  crumb: ReactNode
  chips?: ReactNode
  title: ReactNode
  lede: ReactNode
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; to: string }
  stage?: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="sky-stage dg-hero" aria-labelledby="dg-title">
      <div className="sky-container">
        <div className="dg-hero__top">
          {crumb}
          {chips ? <div className="dg-hero__chips">{chips}</div> : null}
        </div>
        <div className={`dg-hero__grid${aside ? " dg-hero__grid--aside" : ""}`}>
          <div className="dg-hero__copy">
            <h1 id="dg-title" className="sky-display sky-display--xl dg-h1">
              {title}
            </h1>
            <p className="dg-lede">{lede}</p>
            <div className="dg-actions">
              <a className="sk-btn sk-btn-primary" href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight />
              </a>
              {secondaryCta ? (
                <Link className="sk-btn sk-btn-secondary" to={secondaryCta.to}>
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
          {aside ? <div className="dg-hero__aside">{aside}</div> : null}
        </div>
        {stage ? <div className="dg-hero__stage">{stage}</div> : null}
      </div>
    </section>
  )
}

/* ── Asset figure ──────────────────────────────────────────────────────────── */

/**
 * Renders a degree asset when one exists on the record, or the curated stand-in
 * photograph for that discipline/slot. Every stand-in carries an explicit caption.
 */
export function AssetFigure({
  asset,
  fallback,
  label,
  caption,
  ratio = "16/10",
  className = "",
}: {
  asset?: DegreeAsset | null
  fallback: { src: string; alt: string; note: string }
  label?: string
  caption?: string
  ratio?: "16/10" | "4/3" | "21/9"
  className?: string
}) {
  const src = asset?.url || fallback.src
  const alt = asset ? assetAlt(asset, fallback.alt) : fallback.alt
  const note = asset?.caption || caption || fallback.note
  return (
    <figure className={`dg-fig dg-fig--${ratio.replace("/", "-")}${className ? ` ${className}` : ""}`}>
      <div className="dg-fig__frame">
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        {label ? <span className="dg-fig__tag">{label}</span> : null}
      </div>
      {note ? <figcaption className="dg-fig__cap">{note}</figcaption> : null}
    </figure>
  )
}

/* ── Illustrative weekly rhythm ────────────────────────────────────────────── */

export type WeekSlot = {
  day: string
  kind: "Live" | "Self-paced" | "Project" | "Campus" | "Lab"
  title: string
  /** Whether the session has a fixed time. The time itself is never stated: it is not published. */
  timed?: boolean
}

/** One illustrative week. Days and counts are placeholders; no clock times are shown anywhere. */
export function WeeklyRhythm({
  caption,
  slots,
  tone = "light",
}: {
  caption: string
  slots: WeekSlot[]
  tone?: "light" | "navy"
}) {
  return (
    <ProductSlice
      tone={tone}
      header={
        <div className="dg-rhythm__head">
          <span className="sky-label">Weekly study rhythm</span>
          <TruthChip state="illustrative" label="Illustrative week" />
        </div>
      }
      caption={caption}
    >
      <ol className="dg-rhythm" aria-label="Illustrative weekly study rhythm">
        {slots.map((slot) => (
          <li key={`${slot.day}-${slot.title}`} className={`dg-rhythm__day dg-rhythm__day--${slot.kind.toLowerCase()}`}>
            <span className="dg-rhythm__d">{slot.day}</span>
            <span className="dg-rhythm__k">{slot.kind}</span>
            <strong className="dg-rhythm__t">{slot.title}</strong>
            <span className="dg-rhythm__when">{slot.timed ? "Scheduled session" : "Flexible window"}</span>
          </li>
        ))}
      </ol>
    </ProductSlice>
  )
}

/* ── Curriculum outline ────────────────────────────────────────────────────── */

export function CurriculumOutline({ degree }: { degree: Degree }) {
  const terms = degree.curriculum ?? []
  return (
    <Reveal as="section" className="sky-stage dg-section" aria-labelledby="dg-curriculum-title">
      <div className="sky-container">
        <div className="dg-split">
          <div className="dg-split__intro">
            <p className="sky-label">Curriculum architecture</p>
            <h2 id="dg-curriculum-title" className="sky-display sky-display--md dg-h2">
              Core domains &amp; practical studios.
            </h2>
            <p className="dg-body">
              Partner universities define the semester credit schedule and examination weighting, while Skylent OS provides the applied SQL, Python, and case-writing studio modules alongside academic terms.
            </p>
          </div>
          <div className="dg-split__main">
            {terms.length > 0 ? (
              <ol className="dg-terms">
                {terms.map((term, index) => (
                  <li key={term.id || term.title || index} className="dg-term">
                    <div className="dg-term__head">
                      <span className="sky-label">Term {String(index + 1).padStart(2, "0")}</span>
                      <strong>{term.title}</strong>
                    </div>
                    {term.summary ? <p className="dg-term__sum">{term.summary}</p> : null}
                    {term.modules && term.modules.length > 0 ? (
                      <ul className="dg-term__mods">
                        {term.modules.map((mod) => (
                          <li key={mod}>{mod}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="sky-empty dg-empty">
                <p className="sky-label">Core capability pillars</p>
                <p>
                  <strong>1. Quantitative &amp; Analytical Foundations</strong> — Relational databases (SQL), spreadsheet modelling, and structured problem solving.
                </p>
                <p style={{ marginTop: 8 }}>
                  <strong>2. Applied Studio Projects</strong> — Semester-aligned case briefs and capstone dossiers verified inside Skylent OS.
                </p>
                <p style={{ marginTop: 8 }}>
                  <strong>3. Career OS Portfolio Readiness</strong> — Verified coursework and project artefacts mapped directly into your graduate profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ── Honest closing band ───────────────────────────────────────────────────── */

export function DegreeNoticeBand({
  degree,
  enquiryHref = "#enquire",
}: {
  degree: Degree
  enquiryHref?: string
}) {
  return (
    <section className="sky-stage sky-band-warm dg-notice" aria-labelledby="dg-notice-title">
      <div className="sky-container dg-notice__inner">
        <div>
          <p className="sky-label">Academic partnership &amp; intake</p>
          <h2 id="dg-notice-title" className="sky-display sky-display--md dg-h2">
            {degree.institution?.name
              ? `Awarded by ${degree.institution.name}.`
              : "Partner university degree pathway — register interest for the upcoming intake."}
          </h2>
          <p className="dg-body">
            {degree.institution?.name
              ? `${degree.institution.name} awards the degree and governs admissions. Skylent provides the digital learning workspace, practical studios, and Career OS.`
              : "Partner universities award the degree and confirm semester schedules and tuition. Register interest below for priority notification, or start an open Skylent professional programme immediately."}
          </p>
        </div>
        <div className="dg-actions">
          <a className="sk-btn sk-btn-primary" href={enquiryHref}>
            Register interest
            <ArrowRight />
          </a>
          <Link className="sk-btn sk-btn-secondary" to="/programmes">
            Explore open programmes
          </Link>
          <button type="button" className="dg-ai-btn" onClick={() => openSkylentAi(`Tell me about ${degree.title} and which Skylent programmes I can start right now.`)}>
            Ask Skylent AI
          </button>
        </div>
      </div>
    </section>
  )
}
