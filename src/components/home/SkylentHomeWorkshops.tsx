import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeWorkshops.css"

const WORKSHOPS_HREF = "/workshops"

const BEATS = [
  { id: "question", label: "Question", note: "A real problem" },
  { id: "try", label: "Try", note: "Hands-on work" },
  { id: "make", label: "Make", note: "Create something" },
  { id: "reflect", label: "Reflect", note: "Keep the takeaway" },
] as const

function WorkshopCube() {
  return (
    <svg className="hp-ws-cube" viewBox="0 0 160 148" aria-hidden="true">
      <polygon className="is-left" points="28,52 80,78 80,128 28,102" />
      <polygon className="is-right" points="80,78 132,52 132,102 80,128" />
      <polygon className="is-top" points="80,28 132,52 80,78 28,52" />
      <polygon className="is-stroke" points="80,28 132,52 80,78 28,52" />
      <polygon className="is-stroke" points="28,52 80,78 80,128 28,102" />
      <polygon className="is-stroke" points="80,78 132,52 132,102 80,128" />
    </svg>
  )
}

function ProcessRing() {
  return (
    <svg className="hp-ws-ring" viewBox="0 0 360 360" aria-hidden="true">
      <circle className="is-track" cx="180" cy="180" r="128" />
      <circle className="is-spin" cx="180" cy="180" r="128" />
    </svg>
  )
}

export default function SkylentHomeWorkshops() {
  return (
    <section className="hp-ch hp-ws" aria-labelledby="home-workshops-heading">
      <div className="hp-rail hp-ws-stage">
        <header className="hp-ch-copy hp-ws-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            15 Workshops
          </p>
          <h2 id="home-workshops-heading" className="hp-ch-title">
            Learn by doing.
          </h2>
          <p className="hp-ch-lead">Focused sessions built around a problem, a tool, or a piece of work.</p>
          <p className="hp-ch-soon-pill">{MATURITY_LABEL.coming_soon}</p>
          <Link className="hp-ch-cta" to={WORKSHOPS_HREF}>
            Explore workshops
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-ws-visual" aria-label="Workshop as a short practical loop">
          <ProcessRing />
          <div className="hp-ws-core">
            <WorkshopCube />
          </div>
          <ol className="hp-ws-orbit">
            {BEATS.map((beat) => (
              <li key={beat.id} className={`is-${beat.id}`}>
                <b>{beat.label}</b>
                <span>{beat.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
