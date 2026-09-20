import { Link } from "react-router-dom"
import { EXAMS_NAV, EXAM_PATHWAY, MATURITY_LABEL } from "../../lib/product-architecture"

export default function SkylentHomeExams() {
  const sections = EXAMS_NAV.sections ?? []

  return (
    <section className="hp-ch hp-examx" aria-labelledby="home-exams-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Exams
        </p>
        <h2 id="home-exams-heading" className="hp-ch-title">
          Prepare with structure.
        </h2>
        <p className="hp-ch-lead">
          Named exam paths. Catalogue outlines and specified routes — not a live prep engine.{" "}
          <span className="hp-ch-soon">{MATURITY_LABEL.coming_soon}</span>
        </p>
        <div className="hp-examx-tree">
          <div className="hp-examx-spine" aria-hidden="true" />
          <div>
            {sections.map((section) => (
              <div className="hp-examx-branch" key={section.heading}>
                <p>{section.heading}</p>
                <ul className="hp-examx-exams">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="hp-examx-prep">
          {EXAM_PATHWAY.map((step, index) => (
            <span key={step.label}>
              <b>{step.label}</b>
              {index < EXAM_PATHWAY.length - 1 ? " → " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
