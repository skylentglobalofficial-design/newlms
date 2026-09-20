import { Link } from "react-router-dom"

const ROUTES = [
  {
    title: "Build a career",
    copy: "Practical skills, real work, and Career OS for the evidence you keep.",
    to: "/programs",
  },
  {
    title: "Prepare for an exam",
    copy: "Named exam paths with a specified preparation structure. Not a live engine yet.",
    to: "/education/exams",
  },
  {
    title: "Study a subject",
    copy: "Authored courses in Skylent OS — Product Management and Data Analytics are teachable today.",
    to: "/courses",
  },
  {
    title: "Learn something new",
    copy: "Start from a skill and follow it into a course when one exists.",
    to: "/skills",
  },
] as const

export default function SkylentHomeStart() {
  return (
    <section className="hp-ch hp-start" aria-labelledby="home-start-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Start
        </p>
        <h2 id="home-start-heading" className="hp-ch-title hp-start-title">
          Start with a goal.
        </h2>
        <ol className="hp-start-routes">
          {ROUTES.map((route) => (
            <li key={route.to}>
              <Link to={route.to}>
                <span>
                  <b>{route.title}</b>
                  <span>{route.copy}</span>
                </span>
                <em aria-hidden="true">→</em>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
