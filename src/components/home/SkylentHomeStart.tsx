import { Link } from "react-router-dom"
import "./SkylentHomeStart.css"

const PATHS = [
  { id: "career", index: "01", title: "Build a career", dest: "Career OS", to: "/career-os" },
  { id: "exam", index: "02", title: "Prepare for an exam", dest: "Competitive exams", to: "/exams" },
  { id: "subject", index: "03", title: "Study a subject", dest: "Programmes", to: "/programs" },
  { id: "skill", index: "04", title: "Learn something new", dest: "Programmes", to: "/programs" },
] as const

export default function SkylentHomeStart() {
  return (
    <section className="hp-ch hp-start" aria-labelledby="home-start-heading">
      <div className="hp-rail hp-start-stage">
        <header className="hp-start-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            19 Start
          </p>
          <h2 id="home-start-heading" className="hp-ch-title">
            Where do you want to go?
          </h2>
        </header>

        <ol className="hp-start-choices" aria-label="Starting destinations">
          {PATHS.map((path) => (
            <li key={path.id}>
              <Link className="hp-start-choice" to={path.to}>
                <em>{path.index}</em>
                <strong>
                  {path.title}
                  <span aria-hidden="true"> →</span>
                </strong>
                <b>{path.dest}</b>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
