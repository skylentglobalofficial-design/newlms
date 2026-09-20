import { Link } from "react-router-dom"
import { MATURITY_LABEL, SCHOOLING_PATHWAY } from "../../lib/product-architecture"

const BANDS = [
  { band: "Primary", grades: "1–5", subjects: "Mathematics, science, language, socials" },
  { band: "Middle", grades: "6–8", subjects: "Mathematics, sciences, language" },
  { band: "Secondary", grades: "9–10", subjects: "Board-aligned core plus IT" },
  { band: "Senior", grades: "11–12", subjects: "Stream subjects, electives, practicals" },
] as const

export default function SkylentHomeSchool() {
  return (
    <section className="hp-ch hp-school" aria-labelledby="home-school-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          School
        </p>
        <h2 id="home-school-heading" className="hp-ch-title">
          Foundations first.
        </h2>
        <p className="hp-ch-lead">
          Schooling on Skylent is a grade-and-subject pathway for schools and families. There is no live schooling
          catalogue to browse or buy.{" "}
          <span className="hp-ch-soon">{MATURITY_LABEL.coming_soon}</span>
        </p>
        <ol className="hp-school-scale">
          {BANDS.map((row) => (
            <li key={row.band}>
              <b>{row.band}</b>
              <em>Grade {row.grades}</em>
              <span>{row.subjects}</span>
            </li>
          ))}
        </ol>
        <p className="hp-school-path">
          {SCHOOLING_PATHWAY.map((step, index) => (
            <span key={step.label}>
              <b>{step.label}</b>
              {index < SCHOOLING_PATHWAY.length - 1 ? " → " : ""}
            </span>
          ))}
        </p>
        <p className="hp-ch-lead">
          <Link className="hp-ch-link" to="/education/schooling">
            Read the schooling direction →
          </Link>
        </p>
      </div>
    </section>
  )
}
