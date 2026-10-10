/**
 * Skylent v2 shared primitives — the six signatures of the approved design language.
 * Styles live in src/skylent-site.css under "Skylent v2 primitives" (class prefix `sky-`).
 * Nothing here fetches data or invents content: every value is passed in by the page.
 */
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

/* ── Path language ─────────────────────────────────────────────────────────── */

/** The canonical public journey. Seven stages: never six, never without Grow. */
export const PUBLIC_JOURNEY = ["Discover", "Choose", "Learn", "Practice", "Build", "Prove", "Grow"] as const
export type JourneyStage = (typeof PUBLIC_JOURNEY)[number]

/** The deeper product operating model. Show a slice of it inside product screens, never all nine at once. */
export const PRODUCT_MODEL = ["Goal", "Path", "Programme", "Learn", "Practice", "Build", "Prove", "Career", "Next step"] as const
export type ProductStep = (typeof PRODUCT_MODEL)[number]

/** Slim seven-stage locator that sits under the public navigation. */
export function JourneyLocator({ current }: { current?: JourneyStage }) {
  return (
    <div className="sky-locator">
      <ol className="sky-locator__list" aria-label="Where this page sits in the Skylent journey">
        {PUBLIC_JOURNEY.map((stage) => (
          <li key={stage} className="sky-locator__item" aria-current={stage === current ? "step" : undefined}>
            {stage}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** A short slice of the product model, e.g. Learn › Practice › Build › Prove. */
export function ProductSlice({ steps, current, label }: { steps: readonly ProductStep[]; current?: ProductStep; label: string }) {
  return (
    <ol className="sky-slice" aria-label={label}>
      {steps.map((step, i) => (
        <li key={step} className="sky-slice__item" aria-current={step === current ? "step" : undefined}>
          {i > 0 ? <span className="sky-slice__sep" aria-hidden="true">›</span> : null}
          <span className="sky-slice__step">{step}</span>
        </li>
      ))}
    </ol>
  )
}

/** Mono section index: a cobalt numeral and a label, above an H2. */
/** Section eyebrow. Repolish: the section number is no longer shown (n is kept for call sites). */
export function SectionIndex({ n, label }: { n: string; label: string }) {
  return <div className="sky-index" data-section={n}>{label}</div>
}

/* ── Truth chips ───────────────────────────────────────────────────────────── */

export type TruthState = "live" | "development" | "soon" | "sample" | "illustrative"

// Repolish: plain-language labels. The states themselves are unchanged (src/lib/truth.ts).
const TRUTH_LABEL: Record<TruthState, string> = {
  live: "Available",
  development: "Coming soon",
  soon: "Coming soon",
  sample: "Example",
  illustrative: "Example",
}

/** Solidity shows how real something is: solid, outline, dashed, warm fill. Never a status colour. */
export function TruthChip({ state, label }: { state: TruthState; label?: string }) {
  return <span className={`sky-chip sky-chip--${state}`}>{label ?? TRUTH_LABEL[state]}</span>
}

/* ── Captioned product plate ───────────────────────────────────────────────── */

/** Real interface or a domain artefact in a white frame on a warm mat, with a ruled figure caption. */
export function Plate({
  children,
  fig,
  caption,
  note,
  mat = true,
  className = "",
}: {
  children: ReactNode
  fig?: string
  caption: string
  note?: string
  mat?: boolean
  className?: string
}) {
  return (
    <figure className={`${mat ? "sky-mat" : "sky-figure"} ${className}`.trim()}>
      <div className="sky-plate">
        <div className="sky-plate__inner">{children}</div>
      </div>
      {/* Repolish: no figure numbers or construction notes; the caption names what is shown. */}
      <figcaption className="sky-caption">
        <span>{caption}</span>
        {fig && note ? null : null}
      </figcaption>
    </figure>
  )
}

/* ── Ruled spec sheet ──────────────────────────────────────────────────────── */

export type SpecRow = { label: string; value: ReactNode; note?: ReactNode }

/** Facts as labelled rows between hairlines. A row with an empty value is dropped, never filled with a default. */
export function SpecSheet({ rows, className = "" }: { rows: SpecRow[]; className?: string }) {
  const shown = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "")
  if (shown.length === 0) return null
  return (
    <dl className={`sky-spec ${className}`.trim()}>
      {shown.map((row) => (
        <div key={row.label} className="sky-spec__row">
          <dt className="sky-spec__label">{row.label}</dt>
          <dd className="sky-spec__value">{row.value}</dd>
          {row.note ? <dd className="sky-spec__note">{row.note}</dd> : null}
        </div>
      ))}
    </dl>
  )
}

/* ── Actions ───────────────────────────────────────────────────────────────── */

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

/** Primary (cobalt), secondary (outline) or quiet (text) action that navigates inside the app. */
export function Action({ to, kind = "primary", children }: { to: string; kind?: "primary" | "secondary" | "quiet"; children: ReactNode }) {
  if (kind === "quiet") {
    return (
      <Link to={to} className="sk-link">
        {children}
        <ArrowRight />
      </Link>
    )
  }
  return (
    <Link to={to} className={`sk-btn ${kind === "primary" ? "sk-btn-primary" : "sk-btn-secondary"}`}>
      {children}
      {kind === "primary" ? <ArrowRight /> : null}
    </Link>
  )
}

/* ── Skylent AI mark ───────────────────────────────────────────────────────── */

/** The assistant's user-facing name is always "Skylent AI". Legacy API route names are internal. */
export const AI_NAME = "Skylent AI"

export function AiMark({ className = "" }: { className?: string }) {
  return (
    <span className={`sky-ai-mark ${className}`.trim()}>
      <span className="sky-ai-mark__dot" aria-hidden="true" />
      {AI_NAME}
    </span>
  )
}

/** Models sometimes sign with a legacy name. Display text always uses the product name. */
export function displayAiText(text: string): string {
  return text.replace(/\bReva\b/g, AI_NAME)
}
