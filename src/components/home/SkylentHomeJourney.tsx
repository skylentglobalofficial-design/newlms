import { Link } from "react-router-dom"
import "./SkylentHomeJourney.css"

const OS_HREF = "/os"

const BEATS = ["Goal", "Learning", "Practice", "Project", "Evidence", "Career"] as const

export default function SkylentHomeJourney() {
  return (
    <section className="hp-ch hp-line" aria-labelledby="home-journey-heading">
      <div className="hp-rail hp-line-stage">
        <header className="hp-line-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            17 Journey
          </p>
          <h2 id="home-journey-heading" className="hp-ch-title">
            Learning should lead somewhere.
          </h2>
        </header>

        <ol className="hp-line-path" aria-label="Learner journey">
          {BEATS.map((beat) => (
            <li key={beat}>
              <b>{beat}</b>
            </li>
          ))}
        </ol>

        <p className="hp-line-prove">Learn → Practice → Build → Prove</p>
        <Link className="hp-ch-cta" to={OS_HREF}>
          See how Skylent works
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </section>
  )
}
