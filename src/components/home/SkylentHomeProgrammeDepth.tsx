import { Link } from "react-router-dom"
import { programmeDiscoveryFor } from "../../lib/programme-discovery"
import "./SkylentHomeProgrammeDepth.css"

const ARC = ["Learn", "Apply", "Build", "Capstone"] as const

const HARBOR_TABS = ["Overview", "Issues", "Customers"] as const

const HARBOR_ISSUES = ["Late inbound", "Delivery failed", "Weekend exception"] as const

function moduleVisual(title: string): "framing" | "research" | "statement" | "matrix" | "spec" {
  const key = title.toLowerCase()
  if (key.includes("user")) return "research"
  if (key.includes("fram")) return "statement"
  if (key.includes("priorit")) return "matrix"
  if (key.includes("spec")) return "spec"
  return "framing"
}

function moduleNote(title: string): string {
  const key = title.toLowerCase()
  if (key.includes("product thinking")) return "Problems, users, and outcomes."
  if (key.includes("user")) return "Evidence, not opinions."
  if (key.includes("fram")) return "Problem statements that can be tested."
  if (key.includes("priorit")) return "Choosing one bet."
  if (key.includes("spec")) return "Writing a specification someone can build."
  return ""
}

function moduleGlyphLabel(kind: ReturnType<typeof moduleVisual>): string {
  if (kind === "research") return "User research"
  if (kind === "statement") return "Problem statement"
  if (kind === "matrix") return "Prioritisation"
  if (kind === "spec") return "Product specification"
  return "Problem framing"
}

function ModuleGlyph({ kind }: { kind: ReturnType<typeof moduleVisual> }) {
  return (
    <div className={`hp-depth-glyph is-${kind}`} aria-hidden="true">
      {kind === "research" ? (
        <span className="hp-depth-nodes">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      ) : kind === "matrix" ? (
        <span className="hp-depth-matrix">
          <i />
          <i />
          <i />
          <i />
        </span>
      ) : (
        <span className="hp-depth-lines">
          <i />
          <i />
          <i />
          {kind === "spec" ? <i /> : null}
        </span>
      )}
      <em>{moduleGlyphLabel(kind)}</em>
    </div>
  )
}

function HarborCapstonePreview() {
  return (
    <div className="hp-depth-desk" aria-hidden="true">
      <div className="hp-depth-desk-tabs">
        {HARBOR_TABS.map((tab) => (
          <span key={tab} className={tab === "Issues" ? "is-on" : undefined}>
            {tab}
          </span>
        ))}
      </div>
      <div className="hp-depth-desk-issues">
        <p>Open issues</p>
        <ul>
          {HARBOR_ISSUES.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function MetaIcon({ name }: { name: "modules" | "lessons" | "capstone" | "pace" }) {
  const s = { width: 14, height: 14, viewBox: "0 0 16 16", "aria-hidden": true as const }
  if (name === "modules") {
    return (
      <svg {...s}>
        <path d="M3 2.5h8.2A1.8 1.8 0 0 1 13 4.3v9.2H4.2A1.2 1.2 0 0 1 3 12.3V2.5z" />
        <path d="M3 12.4h9.8" />
      </svg>
    )
  }
  if (name === "lessons") {
    return (
      <svg {...s}>
        <path d="M4 2.5h5.2L12.5 6v7.5H4V2.5z" />
        <path d="M9.1 2.5V6h3.4" />
      </svg>
    )
  }
  if (name === "capstone") {
    return (
      <svg {...s}>
        <path d="M3 13.2V3.4l5 1.6 5-1.6v9.8l-5 1.5-5-1.5z" />
        <path d="M8 5v9.4" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <circle cx="8" cy="8" r="5.2" />
      <path d="M8 5.2V8l2 1.6" />
    </svg>
  )
}

export default function SkylentHomeProgrammeDepth() {
  const programme = programmeDiscoveryFor("product-management")
  if (!programme) return null

  return (
    <section className="hp-ch hp-depth" aria-labelledby="home-depth-heading">
      <div className="hp-rail hp-depth-stage">
        <header className="hp-depth-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            07 Depth
          </p>
          <h2 id="home-depth-heading" className="hp-ch-title">
            Go deeper with a professional programme.
          </h2>
          <p className="hp-ch-lead">{programme.decisionLine}</p>
          <p className="hp-depth-actions">
            <Link className="hp-depth-cta" to={programme.href}>
              Explore programme
              <span aria-hidden="true"> →</span>
            </Link>
            <Link className="hp-ch-link" to={programme.courseHref}>
              View full curriculum →
            </Link>
          </p>
        </header>

        <article className="hp-depth-specimen" aria-labelledby="home-depth-programme-title">
          <header className="hp-depth-spec-head">
            <div>
              <p className="hp-depth-spec-kicker">Programme</p>
              <h3 id="home-depth-programme-title">{programme.courseTitle}</h3>
            </div>
            <p className="hp-depth-decision">{programme.decisionLine}</p>
          </header>

          <ul className="hp-depth-meta">
            <li>
              <MetaIcon name="modules" />
              {programme.taughtModules} modules
            </li>
            <li>
              <MetaIcon name="lessons" />
              {programme.taughtLessons} lessons
            </li>
            {programme.capstone ? (
              <li>
                <MetaIcon name="capstone" />
                Harbor Desk capstone
              </li>
            ) : null}
            <li>
              <MetaIcon name="pace" />
              {programme.format}
            </li>
          </ul>

          <ol className="hp-depth-arc" aria-label="How the programme builds">
            {ARC.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="hp-depth-track">
            <ol className="hp-depth-mods" aria-label={`${programme.courseTitle} modules`}>
              {programme.modules.map((module) => {
                const kind = moduleVisual(module.title)
                return (
                  <li key={module.id}>
                    <span className="hp-depth-idx">{String(module.index).padStart(2, "0")}</span>
                    <b>{module.title}</b>
                    {moduleNote(module.title) ? <p>{moduleNote(module.title)}</p> : null}
                    <ModuleGlyph kind={kind} />
                  </li>
                )
              })}
            </ol>

            {programme.capstone ? (
              <section className="hp-depth-cap" aria-labelledby="home-depth-cap-title">
                <p className="hp-depth-cap-kicker">Capstone</p>
                <h4 id="home-depth-cap-title">{programme.capstone}</h4>
                <p>A product case you keep as a work sample.</p>
                <HarborCapstonePreview />
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  )
}
