import { Link } from "react-router-dom"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import "./SkylentHomeOSArchitecture.css"

const LAYERS = [
  { id: "learning", label: "Learning", width: 58 },
  { id: "practice", label: "Practice", width: 46 },
  { id: "projects", label: "Projects", width: 70 },
  { id: "evidence", label: "Evidence", width: 54 },
  { id: "career", label: "Career", width: 78 },
] as const

const SATELLITES = [
  { label: "Programs", to: "/programs" },
  { label: "Labs", to: "/labs" },
  { label: "Projects", to: "/career-os/projects" },
  { label: "Career OS", to: "/career-os" },
  { label: "Profile", to: CAREER_OS_IA[1].to },
  { label: "Opportunities", to: CAREER_OS_IA[2].to },
  { label: "Applications", to: CAREER_OS_IA[3].to },
] as const

export default function SkylentHomeOSArchitecture() {
  return (
    <section className="hp-ch hp-osx" aria-labelledby="home-os-arch-heading">
      <div className="hp-rail hp-osx-stage">
        <header className="hp-osx-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            16 Skylent OS
          </p>
          <h2 id="home-os-arch-heading" className="hp-ch-title">
            One system for the work that matters.
          </h2>
          <p className="hp-ch-lead">
            Learning, practice, projects, evidence and career activity can live together instead of becoming
            separate destinations.
          </p>
        </header>

        <div className="hp-osx-arch">
          <ol className="hp-osx-bus" aria-label="System layers">
            {LAYERS.map((layer, index) => (
              <li key={layer.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{layer.label}</b>
                <i style={{ width: `${layer.width}%` }} aria-hidden="true" />
              </li>
            ))}
          </ol>
          <ul className="hp-osx-sats">
            {SATELLITES.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
