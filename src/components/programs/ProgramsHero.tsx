import { PROGRAMS_STUDY_UNIVERSITY } from "../../media"
import { liveProgrammeCatalogue } from "../../lib/programme-catalogue"
import "./ProgramsHero.css"

export default function ProgramsHero() {
  const live = liveProgrammeCatalogue()
  const readyCount = live.length
  const selfPaced = live.length > 0 && live.every((row) => row.format === "Self-paced")
  const projectBased = live.length > 0 && live.every((row) => Boolean(row.capstone))

  return (
    <section className="pg-hero" aria-labelledby="pg-hero-title">
      <div className="cat-rail pg-hero-stage">
        <div className="pg-hero-copy">
          <p className="pg-hero-eyebrow">
            <i aria-hidden="true" />
            Professional programmes
          </p>
          <h1 id="pg-hero-title">
            <span>Written programmes.</span>
            <span>A project you keep.</span>
          </h1>
          <p className="pg-hero-lead">
            Skylent programmes are structured courses with written lessons, checks, and a finishing project.
            You study in Skylent OS — self-paced, with no live classroom.
          </p>
          <p className="pg-hero-actions">
            <a className="pg-hero-cta" href="#pg-catalogue">
              Explore programmes
              <span className="pg-hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </p>
          <ul className="pg-hero-meta">
            <li>{readyCount} ready to start</li>
            {selfPaced ? <li>Self-paced</li> : null}
            {projectBased ? <li>Project-based</li> : null}
          </ul>
        </div>

        <figure className="pg-hero-figure">
          <div className="pg-hero-photo">
            <img
              src={PROGRAMS_STUDY_UNIVERSITY}
              alt="Adult learners working together in a university library"
              width={1800}
              height={1200}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <figcaption>Study, not a live stream</figcaption>
        </figure>
      </div>
    </section>
  )
}
