import { Link } from "react-router-dom"
import { ACADEMIC_LINES, MATURITY_LABEL } from "../../lib/product-architecture"

export default function SkylentHomeEducation() {
  const lines = ACADEMIC_LINES.filter((line) => line.id !== "exams")

  return (
    <section className="hp-ch hp-acad" aria-labelledby="home-education-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Education
        </p>
        <h2 id="home-education-heading" className="hp-ch-title">
          {"Learning doesn't stop at professional skills."}
        </h2>
        <p className="hp-ch-lead">
          School, undergraduate, and postgraduate are specified academic lines. They are not live catalogues you
          can enrol in today.
        </p>
        <div className="hp-acad-map">
          {lines.map((line) => (
            <Link key={line.id} className="hp-acad-node" to={line.to}>
              <i aria-hidden="true" />
              <b>{line.id === "schooling" ? "School" : line.label}</b>
              <span>{line.job}</span>
              <span className="hp-ch-soon">{MATURITY_LABEL[line.maturity]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
