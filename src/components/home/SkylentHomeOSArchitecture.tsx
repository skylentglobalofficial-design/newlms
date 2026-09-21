import { Link } from "react-router-dom"
import "./SkylentHomeOSArchitecture.css"

const OS_HREF = "/os"

export default function SkylentHomeOSArchitecture() {
  return (
    <section className="hp-ch hp-osx" aria-labelledby="home-os-arch-heading">
      <div className="hp-rail hp-ch-split hp-osx-stage">
        <header className="hp-ch-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            16 Skylent OS
          </p>
          <h2 id="home-os-arch-heading" className="hp-ch-title">
            One system for the work behind learning.
          </h2>
          <p className="hp-ch-lead">
            Learning, practice, projects, evidence and career activity can live together instead of becoming
            separate destinations.
          </p>
          <Link className="hp-ch-cta" to={OS_HREF}>
            Explore Skylent OS
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-osx-frame" aria-label="Skylent OS architecture">
          <p className="hp-osx-label">Skylent OS</p>
          <div className="hp-osx-arch">
            <svg className="hp-osx-wires" viewBox="0 0 320 340" aria-hidden="true">
              <line x1="160" y1="42" x2="160" y2="86" />
              <line x1="160" y1="118" x2="64" y2="164" />
              <line x1="160" y1="118" x2="256" y2="164" />
              <line x1="64" y1="196" x2="160" y2="242" />
              <line x1="256" y1="196" x2="160" y2="242" />
              <line x1="160" y1="274" x2="160" y2="308" />
            </svg>
            <span className="hp-osx-n is-learn">Learn</span>
            <span className="hp-osx-n is-practice">Practice</span>
            <Link className="hp-osx-n is-labs" to="/labs">
              Labs
            </Link>
            <Link className="hp-osx-n is-projects" to="/career-os/projects">
              Projects
            </Link>
            <span className="hp-osx-n is-evidence">Evidence</span>
            <Link className="hp-osx-n is-career" to="/career-os">
              Career OS
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
