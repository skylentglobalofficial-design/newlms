import { Link } from "react-router-dom"
import "./SkylentHomeFinal.css"

export default function SkylentHomeFinal() {
  return (
    <section className="hp-ch hp-end is-close" aria-labelledby="home-final-heading">
      <div className="hp-rail hp-end-stage">
        <div className="hp-end-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            20
          </p>
          <h2 id="home-final-heading" className="hp-ch-title hp-end-title">
            Build the future you want to work in.
          </h2>
          <p className="hp-ch-lead">Learn something useful. Build something real. Keep the evidence.</p>
        </div>
        <div className="hp-end-links">
          <Link className="hp-end-primary" to="/programs">
            Explore programmes
            <span aria-hidden="true"> →</span>
          </Link>
          <Link className="hp-ch-link" to="/os">
            Explore learning →
          </Link>
          <Link className="hp-ch-link" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}
