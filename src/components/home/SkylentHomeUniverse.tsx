import { Link } from "react-router-dom"
import { CAREER_OS_IA, MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeUniverse.css"

const ARMS = [
  { label: "Professional learning", to: "/programs", mark: "Live" },
  { label: "Career OS", to: "/career-os", mark: "Live" },
  { label: "Education", to: "/education", mark: MATURITY_LABEL.coming_soon },
  { label: "Competitive exams", to: "/education/exams", mark: MATURITY_LABEL.coming_soon },
  { label: "Workshops", to: "/workshops", mark: MATURITY_LABEL.coming_soon },
] as const

const SUPPORT = [
  { label: "Programs", to: "/programs" },
  { label: "Labs", to: "/labs" },
  { label: "Projects", to: "/career-os/projects" },
  { label: "Evidence", to: "/career-os/projects" },
  { label: "Profile", to: CAREER_OS_IA[1].to },
  { label: "Opportunities", to: CAREER_OS_IA[2].to },
  { label: "Applications", to: CAREER_OS_IA[3].to },
] as const

export default function SkylentHomeUniverse() {
  return (
    <section className="hp-ch hp-eco" aria-labelledby="home-universe-heading">
      <div className="hp-rail hp-eco-stage">
        <header className="hp-eco-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            18 Skylent
          </p>
          <h2 id="home-universe-heading" className="hp-ch-title">
            A learning ecosystem that grows with you.
          </h2>
          <p className="hp-ch-lead">
            Professional learning, career tools, education, competitive exams and hands-on workshops — connected
            around the learner.
          </p>
        </header>

        <div className="hp-eco-orbit" aria-label="Skylent ecosystem map">
          <p className="hp-eco-core">Skylent</p>
          <ul className="hp-eco-arms">
            {ARMS.map((arm) => (
              <li key={arm.to}>
                <Link to={arm.to}>{arm.label}</Link>
                <em>{arm.mark}</em>
              </li>
            ))}
          </ul>
          <ul className="hp-eco-support">
            {SUPPORT.map((item) => (
              <li key={`${item.label}-${item.to}`}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
