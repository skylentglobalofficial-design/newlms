import { Link } from "react-router-dom"
import "./SkylentHomeStart.css"

const PATHS = [
  {
    id: "career",
    index: "01",
    title: "Build a career",
    node: "Career",
    copy: "Practical skills, real work, and Career OS for the evidence you keep.",
    to: "/career-os",
  },
  {
    id: "exam",
    index: "02",
    title: "Prepare for an exam",
    node: "Exam",
    copy: "Named exam paths with a specified preparation structure. Not a live engine yet.",
    to: "/education/exams",
  },
  {
    id: "subject",
    index: "03",
    title: "Study a subject",
    node: "Subject",
    copy: "Go deeper into a subject with clear explanations, examples and practice.",
    to: "/courses",
  },
  {
    id: "skill",
    index: "04",
    title: "Learn something new",
    node: "New skill",
    copy: "Explore a new skill and follow it into a course when one exists.",
    to: "/skills",
  },
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

        <div className="hp-start-field" aria-label="Starting destinations">
          <p className="hp-start-core">Start</p>
          {PATHS.map((path) => (
            <Link key={path.id} className={`hp-start-way is-${path.id}`} to={path.to}>
              <em>{path.index}</em>
              <b>{path.node}</b>
              <strong>{path.title}</strong>
              <span>{path.copy}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
