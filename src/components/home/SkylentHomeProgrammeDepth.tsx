import { Link } from "react-router-dom"
import { programmeDiscoveryFor } from "../../lib/programme-discovery"
import "./SkylentHomeProgrammeDepth.css"

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
        <p className="hp-depth-decision">{programme.decisionLine}</p>

        <p className="hp-depth-meta">
          <span>{programme.taughtModules} modules</span>
          <span>{programme.taughtLessons} lessons</span>
          {programme.capstone ? <span>{programme.capstone}</span> : null}
          <span>{programme.format}</span>
        </p>

        <ol className="hp-depth-seq" aria-label={`${programme.courseTitle} learning sequence`}>
          {programme.modules.map((module) => (
            <li key={module.id}>
              <span>{String(module.index).padStart(2, "0")}</span>
              <b>{module.title}</b>
            </li>
          ))}
          {programme.capstone ? (
            <li className="is-cap">
              <span>Capstone</span>
              <b>{programme.capstone}</b>
              <em>A product case you keep as a work sample.</em>
            </li>
          ) : null}
        </ol>

        <p className="hp-depth-foot">
          <Link className="hp-depth-cta" to={programme.href}>
            Explore programme
            <span aria-hidden="true"> →</span>
          </Link>
          <Link className="hp-ch-link" to={programme.courseHref}>
            View full curriculum →
          </Link>
        </p>
      </div>
    </section>
  )
}
