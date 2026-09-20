import { Link } from "react-router-dom"
import { MATURITY_LABEL, PG_PATHWAY, UG_PATHWAY } from "../../lib/product-architecture"

export default function SkylentHomeUniversity() {
  return (
    <section className="hp-ch hp-uni" aria-labelledby="home-university-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          University
        </p>
        <h2 id="home-university-heading" className="hp-ch-title">
          Undergraduate → Postgraduate.
        </h2>
        <p className="hp-ch-lead">
          An intended academic architecture — not a list of universities, degrees, or campuses.{" "}
          <span className="hp-ch-soon">{MATURITY_LABEL.coming_soon}</span>
        </p>

        <div className="hp-uni-row">
          <div className="hp-uni-label">
            <b>Undergraduate</b>
            <Link className="hp-ch-link" to="/education/undergraduate">
              Direction →
            </Link>
          </div>
          <ol className="hp-uni-steps">
            {UG_PATHWAY.map((step) => (
              <li key={step.label}>
                <span>UG</span>
                <b>{step.label}</b>
                <em>{step.sub}</em>
              </li>
            ))}
          </ol>
        </div>

        <div className="hp-uni-row">
          <div className="hp-uni-label">
            <b>Postgraduate</b>
            <Link className="hp-ch-link" to="/education/postgraduate">
              Direction →
            </Link>
          </div>
          <ol className="hp-uni-steps">
            {PG_PATHWAY.map((step) => (
              <li key={step.label}>
                <span>PG</span>
                <b>{step.label}</b>
                <em>{step.sub}</em>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
