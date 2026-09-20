import { Link } from "react-router-dom"
import { programmeDiscoveryFor } from "../../lib/programme-discovery"

export default function SkylentHomeProgrammeDepth() {
  const programme = programmeDiscoveryFor("product-management")
  if (!programme) return null

  return (
    <section className="hp-ch hp-depth" aria-labelledby="home-depth-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Depth
        </p>
        <h2 id="home-depth-heading" className="hp-ch-title">
          Go deeper with a professional programme.
        </h2>
        <p className="hp-depth-name">{programme.courseTitle}</p>
        <p className="hp-depth-meta">
          <span>{programme.taughtModules} modules</span>
          <span>{programme.taughtLessons} lessons</span>
          <span>
            {programme.taughtWritten} written · {programme.taughtQuizzes} checks · {programme.taughtAssignments} assignments
          </span>
          <span>{programme.format}</span>
        </p>
        <ol className="hp-depth-index">
          {programme.modules.map((module) => (
            <li key={module.id}>
              <span>{String(module.index).padStart(2, "0")}</span>
              <b>{module.title}</b>
              <em>{module.countsLabel}</em>
            </li>
          ))}
        </ol>
        <div className="hp-depth-cap">
          {programme.capstone ? (
            <p>
              Capstone: <strong>{programme.capstone}</strong>
              {" — "}
              {programme.decisionLine} Against <code>{programme.material}</code>.
            </p>
          ) : (
            <p>{programme.decisionLine}</p>
          )}
          <Link className="hp-ch-link" to={programme.href}>
            View programme →
          </Link>
        </div>
      </div>
    </section>
  )
}
