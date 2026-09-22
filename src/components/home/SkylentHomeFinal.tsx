import { Link } from "react-router-dom"
import "./SkylentHomeFinal.css"

export default function SkylentHomeFinal() {
  return (
    <section className="hp-ch hp-end is-close" aria-labelledby="home-final-heading">
      <div className="hp-rail hp-end-stage">
        <div className="hp-end-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            Start
          </p>
          <h2 id="home-final-heading" className="hp-ch-title hp-end-title">
            Start learning on Skylent.
          </h2>
          <p className="hp-ch-lead">
            Choose a programme with authored teaching, or sign in to resume where you left off in Skylent OS.
          </p>
        </div>
        <div className="hp-end-links">
          <Link className="hp-end-primary" to="/programs">
            Start learning
            <span aria-hidden="true"> →</span>
          </Link>
          <Link className="hp-ch-link" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}
