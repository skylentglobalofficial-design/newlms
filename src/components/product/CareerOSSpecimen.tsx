/**
 * The Career OS workspace, drawn from src/lib/product-manifest.ts. The homepage plate and the
 * public Career OS plate both render through this, so they show the same names, order and states
 * as the signed-in Career OS overview.
 *
 * mode "example": public pages. Live features show a label example; the plate is marked Example.
 * mode "empty":   what a new account sees. Every feature shows its empty state.
 * No learner data is ever passed in, and nothing here is a score, match, salary or opening.
 */
import { AiMark, TruthChip } from "../skylent/primitives"
import {
  CAREER_OS_FEATURES,
  CAREER_OS_NAV,
  aiFeature,
  publicFeatures,
  type ProductFeature,
} from "../../lib/product-manifest"
import "./CareerOSSpecimen.css"

type Mode = "example" | "empty"

function valueOf(item: ProductFeature, mode: Mode): string | null {
  if (item.status !== "live") return null
  if (mode === "example" && item.specimen?.example) return item.specimen.example
  return item.specimen?.empty ?? null
}

export function careerSpecimenLabel(): string {
  const features = publicFeatures(CAREER_OS_FEATURES)
  const parts = features.map((item) => `${item.label}: ${item.status === "live" ? "live" : item.status === "soon" ? "coming soon" : "in development"}`)
  return `Career OS workspace, example. ${parts.join(". ")}. No readiness score, job match or salary is shown.`
}

export default function CareerOSSpecimen({ mode = "example", activeNav = "overview" }: { mode?: Mode; activeNav?: string }) {
  const features = publicFeatures(CAREER_OS_FEATURES)
  const lead = features.find((item) => item.specimen?.slot === "lead")
  const action = features.find((item) => item.specimen?.slot === "action")
  const cells = features.filter((item) => item !== lead && item !== action)
  const careerAi = aiFeature("career-context")
  const number = (item: ProductFeature) => String(features.indexOf(item) + 1).padStart(2, "0")

  return (
    <div className="cspec" role="img" aria-label={careerSpecimenLabel()}>
      <div className="cspec__bar">
        <span className="cspec__brand">Career OS</span>
        <span className="cspec__nav" aria-hidden="true">
          {CAREER_OS_NAV.slice(0, 4).map((item) => (
            <span key={item.id} className={item.id === activeNav ? "is-on" : undefined}>
              {item.label}
            </span>
          ))}
        </span>
        <TruthChip state="illustrative" label={mode === "example" ? "Example" : "Empty account"} />
      </div>

      <div className="cspec__top">
        {lead ? (
          <div className="cspec__lead">
            <div className="cspec__label">
              <span className="cspec__n cspec__n--on">{number(lead)}</span>
              {lead.label}
            </div>
            <div className={mode === "example" ? "cspec__role" : "cspec__role cspec__role--empty"}>{valueOf(lead, mode)}</div>
            <div className="cspec__by">{mode === "example" ? "Example · entered by you" : "Not set"}</div>
            <p className="cspec__note">{lead.summary}</p>
          </div>
        ) : null}
        {action ? (
          <div className="cspec__action">
            <div className="cspec__label">
              <span className="cspec__n cspec__n--on">{number(action)}</span>
              {action.label}
            </div>
            <div className="cspec__actiontitle">{valueOf(action, mode)}</div>
            <p className="cspec__note">{action.summary}</p>
            <span className="cspec__btn">{mode === "example" ? action.specimen?.action : action.specimen?.empty}</span>
          </div>
        ) : null}
      </div>

      <ol className="cspec__cells">
        {cells.map((item) => {
          const value = valueOf(item, mode)
          return (
            <li key={item.id} className="cspec__cell">
              <div className="cspec__cellhead">
                <span className="cspec__label">
                  <span className={item.status === "live" ? "cspec__n cspec__n--on" : "cspec__n"}>{number(item)}</span>
                  {item.label}
                </span>
                <TruthChip state={item.status} />
              </div>
              {value ? <div className="cspec__value">{value}</div> : null}
              <p className="cspec__cellnote">{item.summary}</p>
            </li>
          )
        })}
      </ol>

      <div className="cspec__ai">
        <AiMark />
        <span className="cspec__aitext">
          {careerAi.label}. {careerAi.summary}
        </span>
        <TruthChip state={careerAi.status} />
      </div>
    </div>
  )
}
