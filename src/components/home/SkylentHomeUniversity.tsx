import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeUniversity.css"

const EDUCATION_HREF = "/education"

const TIERS = [
  { id: "ug", label: "Undergraduate", note: "Applied learning", to: "/education/undergraduate" },
  { id: "pg", label: "Postgraduate", note: "Deeper expertise", to: "/education/postgraduate" },
  { id: "spec", label: "Deeper specialisation", note: "Research and advanced work", to: "/education/postgraduate" },
] as const

function AcademicRise() {
  return (
    <svg className="hp-uni-rise-art" viewBox="0 0 280 300" aria-hidden="true">
      <ellipse className="is-base" cx="140" cy="268" rx="108" ry="18" />
      <path className="is-fill" d="M46 214c0-10 42-18 94-18s94 8 94 18v36c0 10-42 18-94 18s-94-8-94-18z" />
      <ellipse className="is-top" cx="140" cy="214" rx="94" ry="18" />
      <path className="is-fill" d="M62 150c0-10 35-17 78-17s78 7 78 17v36c0 10-35 17-78 17s-78-7-78-17z" />
      <ellipse className="is-top" cx="140" cy="150" rx="78" ry="16" />
      <path className="is-fill" d="M80 88c0-9 27-15 60-15s60 6 60 15v34c0 9-27 15-60 15s-60-6-60-15z" />
      <ellipse className="is-cap" cx="140" cy="88" rx="60" ry="14" />
      <path className="is-stroke" d="M46 214c0-10 42-18 94-18s94 8 94 18v36c0 10-42 18-94 18s-94-8-94-18z" />
      <ellipse className="is-stroke" cx="140" cy="214" rx="94" ry="18" />
      <path className="is-stroke" d="M62 150c0-10 35-17 78-17s78 7 78 17v36c0 10-35 17-78 17s-78-7-78-17z" />
      <ellipse className="is-stroke" cx="140" cy="150" rx="78" ry="16" />
      <path className="is-stroke" d="M80 88c0-9 27-15 60-15s60 6 60 15v34c0 9-27 15-60 15s-60-6-60-15z" />
      <ellipse className="is-stroke" cx="140" cy="88" rx="60" ry="14" />
      <path className="is-mark" d="M140 74v-18" />
      <circle className="is-mark" cx="140" cy="52" r="5" />
    </svg>
  )
}

export default function SkylentHomeUniversity() {
  return (
    <section className="hp-ch hp-uni" aria-labelledby="home-university-heading">
      <div className="hp-rail hp-ch-split hp-uni-stage">
        <header className="hp-ch-copy">
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

        <div className="hp-uni-visual" aria-label="Undergraduate to specialisation progression">
          <AcademicRise />
          <ol className="hp-uni-legend">
            {TIERS.map((tier) => (
              <li key={tier.id}>
                <Link to={tier.to}>
                  <b>{tier.label}</b>
                  <span>{tier.note}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
