import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeWorkshops.css"

const WORKSHOPS_HREF = "/workshops"

const FORMATS = [
  { id: "build", label: "Build" },
  { id: "analyse", label: "Analyse" },
  { id: "design", label: "Design" },
  { id: "practise", label: "Practise" },
  { id: "review", label: "Review" },
] as const

const FLOW = [
  { id: "problem", label: "Problem" },
  { id: "session", label: "Session" },
  { id: "work", label: "Work" },
  { id: "takeaway", label: "Takeaway" },
] as const

function CellMark({ format, flow }: { format: string; flow: string }) {
  const seed = format.length + flow.length
  const inset = 6 + (seed % 4)
  return (
    <svg className="hp-ws-cell" viewBox="0 0 36 28" aria-hidden="true">
      <rect x={inset} y="6" width={24 - inset / 2} height="16" />
      <path d="M10 14h16" />
    </svg>
  )
}

export default function SkylentHomeWorkshops() {
  return (
    <section className="hp-ch hp-ws" aria-labelledby="home-workshops-heading">
      <div className="hp-rail hp-ws-stage">
        <header className="hp-ws-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            15 Workshops
          </p>
          <h2 id="home-workshops-heading" className="hp-ch-title">
            Learn by doing, together.
          </h2>
          <p className="hp-ch-lead">Focused sessions built around a problem, a tool, or a piece of work.</p>
          <p className="hp-ws-soon">{MATURITY_LABEL.coming_soon}</p>
          <p className="hp-ws-note">
            Formats only. No dates, instructors, seats, or registration on this page.
          </p>
          <Link className="hp-ws-cta" to={WORKSHOPS_HREF}>
            Explore workshops
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-ws-table" role="table" aria-label="Workshop formats">
          <div className="hp-ws-head" role="row">
            <span role="columnheader">Flow</span>
            {FORMATS.map((format) => (
              <span key={format.id} role="columnheader">
                {format.label}
              </span>
            ))}
          </div>
          {FLOW.map((row) => (
            <div className="hp-ws-row" role="row" key={row.id}>
              <b role="rowheader">{row.label}</b>
              {FORMATS.map((format) => (
                <span role="cell" key={`${row.id}-${format.id}`}>
                  <CellMark format={format.id} flow={row.id} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
