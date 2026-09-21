import { Link } from "react-router-dom"
import "./SkylentHomeUniverse.css"

const ARMS = [
  { id: "education", label: "Education", to: "/education", active: false },
  { id: "learning", label: "Professional learning", to: "/programs", active: true },
  { id: "exams", label: "Competitive exams", to: "/exams", active: false },
  { id: "career", label: "Career OS", to: "/career-os", active: false },
  { id: "workshops", label: "Workshops", to: "/workshops", active: false },
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
          <svg className="hp-eco-lines" viewBox="0 0 420 360" aria-hidden="true">
            <path className="is-quiet" d="M210 168 C 210 96, 232 48, 248 28" />
            <path className="is-live" d="M186 180 C 120 176, 72 168, 36 154" />
            <path className="is-quiet" d="M236 176 C 300 150, 348 128, 392 118" />
            <path className="is-quiet" d="M200 204 C 150 250, 120 286, 96 318" />
            <path className="is-quiet" d="M222 210 C 250 260, 280 300, 318 338" />
          </svg>
          <p className="hp-eco-core">Skylent.</p>
          {ARMS.map((arm) => (
            <Link key={arm.id} className={`hp-eco-arm is-${arm.id}${arm.active ? " is-live" : ""}`} to={arm.to}>
              {arm.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
