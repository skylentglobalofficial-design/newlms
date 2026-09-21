import { Link } from "react-router-dom"
import "./SkylentHomeUniverse.css"

const ARMS = [
  { id: "education", label: "Education", note: "School to university", to: "/education", active: false },
  { id: "learning", label: "Professional learning", note: "Programmes and courses", to: "/programs", active: true },
  { id: "exams", label: "Competitive exams", note: "A future preparation path", to: "/exams", active: false },
  { id: "workshops", label: "Workshops", note: "Short, focused learning", to: "/workshops", active: false },
  { id: "career", label: "Career OS", note: "Evidence and next steps", to: "/career-os", active: false },
] as const

export default function SkylentHomeUniverse() {
  return (
    <section className="hp-ch hp-eco" aria-labelledby="home-universe-heading">
      <div className="hp-rail hp-ch-split hp-eco-stage">
        <header className="hp-ch-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            18 Universe
          </p>
          <h2 id="home-universe-heading" className="hp-ch-title">
            Everything connects.
          </h2>
          <p className="hp-ch-lead">
            Professional learning, career tools, education, competitive exams and workshops — connected around the
            learner.
          </p>
          <Link className="hp-ch-cta" to="/">
            Explore the ecosystem
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-eco-map" aria-label="Skylent ecosystem">
          <svg className="hp-eco-lines" viewBox="0 0 360 300" aria-hidden="true">
            <line className="is-quiet" x1="180" y1="150" x2="180" y2="36" />
            <line className="is-live" x1="180" y1="150" x2="48" y2="150" />
            <line className="is-quiet" x1="180" y1="150" x2="312" y2="150" />
            <line className="is-quiet" x1="180" y1="150" x2="180" y2="228" />
            <line className="is-quiet" x1="180" y1="150" x2="86" y2="270" />
          </svg>
          <p className="hp-eco-core">Skylent</p>
          {ARMS.map((arm) => (
            <Link key={arm.id} className={`hp-eco-arm is-${arm.id}${arm.active ? " is-live" : ""}`} to={arm.to}>
              <b>{arm.label}</b>
              <span>{arm.note}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
