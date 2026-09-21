import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeUniversity.css"

const EDUCATION_HREF = "/education"

const TIERS = [
  { id: "spec", label: "Deeper specialisation", note: "Research and advanced work", to: "/education/postgraduate", width: 88 },
  { id: "pg", label: "Postgraduate", note: "Deeper expertise", to: "/education/postgraduate", width: 118 },
  { id: "ug", label: "Undergraduate", note: "Applied learning", to: "/education/undergraduate", width: 148 },
] as const

function Platform({ width }: { width: number }) {
  const cx = 160
  const top = 18
  const h = 22
  const d = 22
  const half = width / 2
  const x0 = cx - half
  const x1 = cx + half
  return (
    <svg className="hp-uni-slab" viewBox="0 0 320 78" aria-hidden="true">
      <polygon className="is-side" points={`${x1},${top} ${x1 + d},${top + 10} ${x1 + d},${top + 10 + h} ${x1},${top + h}`} />
      <polygon className="is-face" points={`${x0},${top} ${x1},${top} ${x1},${top + h} ${x0},${top + h}`} />
      <polygon className="is-top" points={`${x0},${top} ${x0 + d},${top - 10} ${x1 + d},${top - 10} ${x1},${top}`} />
      <polygon className="is-stroke" points={`${x0},${top} ${x0 + d},${top - 10} ${x1 + d},${top - 10} ${x1},${top}`} />
      <polygon className="is-stroke" points={`${x0},${top} ${x1},${top} ${x1},${top + h} ${x0},${top + h}`} />
      <polygon className="is-stroke" points={`${x1},${top} ${x1 + d},${top - 10} ${x1 + d},${top + 10 + h} ${x1},${top + h}`} />
    </svg>
  )
}

export default function SkylentHomeUniversity() {
  return (
    <section className="hp-ch hp-uni" aria-labelledby="home-university-heading">
      <div className="hp-rail hp-uni-stage">
        <div className="hp-uni-visual" aria-label="Undergraduate to specialisation progression">
          <ol className="hp-uni-stack">
            {TIERS.map((tier) => (
              <li key={tier.id}>
                <Platform width={tier.width} />
                <Link to={tier.to}>
                  <b>{tier.label}</b>
                  <span>{tier.note}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <header className="hp-ch-copy hp-uni-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            13 University
          </p>
          <h2 id="home-university-heading" className="hp-ch-title">
            Education that grows with the learner.
          </h2>
          <p className="hp-ch-lead">
            A future academic layer for undergraduate and postgraduate learning, built around depth, practice and
            specialisation.
          </p>
          <p className="hp-ch-soon-pill">{MATURITY_LABEL.coming_soon}</p>
          <Link className="hp-ch-cta" to={EDUCATION_HREF}>
            Explore education
            <span aria-hidden="true"> →</span>
          </Link>
        </header>
      </div>
    </section>
  )
}
