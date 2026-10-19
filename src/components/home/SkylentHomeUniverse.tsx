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
            <path className="is-field" d="M 24 258 C 70 64, 268 6, 538 92" />
            <path className="is-quiet" d="M 398 172 C 322 70, 216 30, 150 26" />
            <path className="is-live" d="M 360 197 C 292 190, 224 176, 158 172" />
            <path className="is-quiet" d="M 468 170 C 516 150, 540 82, 528 42" />
            <path className="is-quiet" d="M 372 222 C 290 288, 198 336, 116 348" />
            <path className="is-quiet" d="M 438 220 C 498 292, 508 352, 480 386" />
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
