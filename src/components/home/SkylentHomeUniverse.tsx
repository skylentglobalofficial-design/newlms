import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"

const ARMS = [
  { label: "Professional learning", to: "/programs", mark: "Live" },
  { label: "Career OS", to: "/career-os", mark: "Live" },
  { label: "Education", to: "/education", mark: MATURITY_LABEL.coming_soon },
  { label: "Competitive exams", to: "/education/exams", mark: MATURITY_LABEL.coming_soon },
  { label: "Workshops", to: "/workshops", mark: MATURITY_LABEL.coming_soon },
] as const

export default function SkylentHomeUniverse() {
  return (
    <section className="hp-ch hp-eco" aria-labelledby="home-universe-heading">
      <div className="hp-rail hp-eco-map">
        <div>
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            Universe
          </p>
          <h2 id="home-universe-heading" className="hp-ch-title">
            The Skylent ecosystem.
          </h2>
          <p className="hp-eco-core">Skylent.</p>
        </div>
        <ul className="hp-eco-arms">
          {ARMS.map((arm) => (
            <li key={arm.to}>
              <Link to={arm.to}>{arm.label}</Link>
              <em>{arm.mark}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
