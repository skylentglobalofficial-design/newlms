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
          <svg
            className="hp-eco-lines"
            viewBox="0 0 560 420"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <path className="is-field" d="M 36 236 C 52 72, 248 18, 528 96" />
            <path className="is-quiet" d="M 396 176 C 328 88, 196 40, 108 36" />
            <path className="is-live" d="M 348 198 C 236 188, 112 176, 18 170" />
            <path className="is-quiet" d="M 486 176 C 512 118, 534 72, 546 48" />
            <path className="is-quiet" d="M 368 226 C 248 292, 126 338, 48 350" />
            <path className="is-quiet" d="M 452 226 C 480 304, 506 366, 522 400" />
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
