import { Link } from "react-router-dom"

export default function SkylentHomeFinal() {
  return (
    <section className="hp-ch hp-end is-close" aria-labelledby="home-final-heading">
      <div className="hp-rail">
        <h2 id="home-final-heading" className="hp-ch-title hp-end-title">
          Build the future you want to work in.
        </h2>
        <div className="hp-end-links">
          <Link className="hp-ch-link" to="/programs">
            Explore programmes →
          </Link>
          <Link className="hp-ch-link" to="/courses">
            Explore learning →
          </Link>
          <Link className="hp-ch-link" to="/login">
            Sign in →
          </Link>
        </div>
      </div>
    </section>
  )
}
