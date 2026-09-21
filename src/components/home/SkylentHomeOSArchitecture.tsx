import { Link } from "react-router-dom"
import "./SkylentHomeOSArchitecture.css"

const OS_HREF = "/os"

const LAYERS = ["Learn", "Practice", "Build", "Evidence", "Career"] as const

const SATELLITES = [
  { label: "Learning", to: "/programs" },
  { label: "Labs", to: "/labs" },
  { label: "Projects", to: "/career-os/projects" },
  { label: "Career OS", to: "/career-os" },
] as const

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
          <ol className="hp-osx-spine">
            {LAYERS.map((layer) => (
              <li key={layer}>
                <b>{layer}</b>
              </li>
            ))}
          </ol>
          <ul className="hp-osx-sats">
            {SATELLITES.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
