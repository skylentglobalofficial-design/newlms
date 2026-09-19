import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { HarborDeskWorkspace, NorthwindWorkspace } from "../components/product/ProductLanguage"
import {
  PROGRAMME_ENROLMENT_FACTS,
  PROGRAMME_WORK_SURFACES,
  programmeDiscoveryCards,
} from "../lib/programme-discovery"
import "./Catalog.css"

function useProgramsOpenNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return narrow
}

export default function ProgramsPage() {
  const narrow = useProgramsOpenNarrow()
  const programmes = programmeDiscoveryCards()

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="pg-open" aria-labelledby="pg-open-title">
          <div className="cat-rail pg-open-stack">
            <div className="pg-open-editorial">
              <div className="pg-open-editorial-copy">
                <p className="pg-open-eyebrow">Professional programmes · Authored in Skylent OS</p>
                <h1 id="pg-open-title">Learn to produce work like this.</h1>
                <p className="pg-open-lead">
                  Two authored Professional Certificate programmes — each built around work you can show.
                </p>
                <div className="pg-open-actions">
                  <a className="cat-btn cat-btn-primary cat-btn-lg" href="#programs">
                    Explore programmes ↓
                  </a>
                </div>
              </div>
            </div>

            <div className="pg-open-specimens">
              <div className="pg-open-specimen">
                <NorthwindWorkspace compact />
                <div className="pg-open-attr">
                  <p className="pg-open-attr-label">Professional Certificate</p>
                  <p className="pg-open-attr-title">Data Analytics with Gen AI</p>
                  <Link
                    className="pg-open-attr-link"
                    to="/programs/data-analytics-pro"
                    aria-label="View Data Analytics with Gen AI programme"
                  >
                    View programme →
                  </Link>
                </div>
              </div>

              <div className="pg-open-specimen">
                <HarborDeskWorkspace compact={narrow} meta="harbor-desk-case.md · 4 interviews" />
                <div className="pg-open-attr">
                  <p className="pg-open-attr-label">Professional Certificate</p>
                  <p className="pg-open-attr-title">Product Management</p>
                  <Link
                    className="pg-open-attr-link"
                    to="/programs/product-management"
                    aria-label="View Product Management programme"
                  >
                    View programme →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-band pg-which" aria-labelledby="pg-which-title">
          <div className="cat-rail">
            <p className="cat-label">Which programme fits</p>
            <h2 id="pg-which-title">
              Both programmes teach you to make a decision. They are not the same decision.
            </h2>
            <div className="pg-which-grid">
              {programmes.map((programme) => (
                <article className="pg-which-item" key={programme.slug}>
                  <h3>{programme.title}</h3>
                  <p>{programme.decisionLine}</p>
                  <p className="pg-which-material">
                    Worked on <code>{programme.material}</code>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cat-section pg-list" id="programs" aria-labelledby="pg-list-title">
          <div className="cat-rail">
            <p className="cat-label">Professional Certificate Programs</p>
            <h2 id="pg-list-title">Two programmes, authored end to end.</h2>
            <p className="cat-lead">
              These are the programmes with real teaching behind them today. Each one is shown with what is
              actually taught, not the advertised brochure length.
            </p>

            <div className="pg-programmes">
              {programmes.map((programme) => (
                <article className="pg-programme" key={programme.slug}>
                  <div className="pg-programme-main">
                    <p className="pg-programme-label">Professional Certificate</p>
                    <h3>
                      <Link to={programme.href}>{programme.title}</Link>
                    </h3>
                    <p className="pg-programme-decision">{programme.decisionLine}</p>

                    <dl className="pg-programme-facts">
                      <div>
                        <dt>Taught now</dt>
                        <dd>
                          {programme.taughtModules} modules · {programme.taughtLessons} lessons
                        </dd>
                      </div>
                      <div>
                        <dt>Practice</dt>
                        <dd>
                          {programme.taughtQuizzes} checks · {programme.taughtAssignments} assignments
                        </dd>
                      </div>
                      <div>
                        <dt>Level</dt>
                        <dd>{programme.level}</dd>
                      </div>
                      <div>
                        <dt>Format</dt>
                        <dd>{programme.format}</dd>
                      </div>
                    </dl>

                    <div className="cat-actions pg-programme-actions">
                      <Link className="cat-btn cat-btn-primary" to={programme.href}>
                        View programme
                      </Link>
                      <Link className="cat-btn cat-btn-ghost" to={programme.courseHref}>
                        View {programme.courseTitle} course
                      </Link>
                    </div>

                    <p className="cat-honesty">
                      Advertised as {programme.brochureDuration} / {programme.brochureModules} modules.{" "}
                      {programme.honesty}
                    </p>
                  </div>

                  <div className="pg-programme-path">
                    <p className="pg-programme-path-label">The taught path</p>
                    <ol className="pg-programme-modules">
                      {programme.modules.map((module) => (
                        <li key={module.id}>
                          <span className="pg-programme-modules-num">
                            {String(module.index).padStart(2, "0")}
                          </span>
                          <span className="pg-programme-modules-body">
                            <strong>{module.title}</strong>
                            <em>{module.countsLabel}</em>
                          </span>
                        </li>
                      ))}
                    </ol>
                    {programme.capstone ? (
                      <p className="pg-programme-path-end">
                        <span>Ends in</span>
                        {programme.capstone}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cat-band pg-where" aria-labelledby="pg-where-title">
          <div className="cat-rail">
            <p className="cat-label">Where the work happens</p>
            <h2 id="pg-where-title">The programme runs inside Skylent OS.</h2>
            <p className="cat-lead">
              Skylent OS is the workspace you enter after enrolling. It is the same product as the student
              dashboard — not a separate operating system and not a video classroom.
            </p>
            <div className="pg-where-grid">
              {PROGRAMME_WORK_SURFACES.map((surface) => (
                <article className="pg-where-item" key={surface.id}>
                  <strong>{surface.label}</strong>
                  <p>{surface.detail}</p>
                  {surface.learnerOnly ? (
                    <span className="pg-where-gate">Opens after you enrol</span>
                  ) : null}
                </article>
              ))}
            </div>
            <p className="cat-fine">
              <Link className="cat-text-link" to="/os">
                See how Skylent OS works →
              </Link>
            </p>
          </div>
        </section>

        <section className="cat-section pg-enrol" aria-labelledby="pg-enrol-title">
          <div className="cat-rail">
            <p className="cat-label">Before you enrol</p>
            <h2 id="pg-enrol-title">What enrolment actually does.</h2>
            <ul className="pg-enrol-list">
              {PROGRAMME_ENROLMENT_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            <div className="cat-final-card pg-enrol-card">
              <div>
                <p className="pg-enrol-card-title">Start with the programme that matches your decision.</p>
                <p className="pg-enrol-card-copy">
                  Open a programme to see the full taught path, the work you produce, and what happens after
                  enrolment.
                </p>
              </div>
              <div className="cat-enrol-actions">
                {programmes.map((programme) => (
                  <Link className="cat-btn cat-btn-primary" key={programme.slug} to={programme.href}>
                    {programme.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
