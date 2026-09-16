import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { programs } from "../data"
import { isProgramEnrollable } from "../lib/catalog-api"
import {
  PROGRAMME_INTENDED_STEPS,
  programmeAfterEnrolCopy,
  programmePublicView,
} from "../lib/catalog-maturity"
import { useCatalogProgram } from "../hooks/useCatalog"
import "./Catalog.css"

const LIVE_PROGRAMME_STEPS = new Set(["Programme", "Module"])

export default function ProgramPage() {
  const { slug } = useParams()
  const program = programs.find((item) => item.slug === slug)
  const catalog = useCatalogProgram(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!program) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <h1>Programme not found</h1>
              <Link className="cat-btn cat-btn-ghost" to="/programs">Back to programmes</Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const view = programmePublicView(program)
  const linkedFromApi = catalog.data?.linkedCourseSlugs ?? view.linked.map((item) => item.slug)
  const enrollable = catalog.data
    ? isProgramEnrollable(catalog.data)
    : view.enrollOpen
  const comingLater = view.maturity === "coming_later"
  const afterEnrol = programmeAfterEnrolCopy(view)
  const cta = comingLater
    ? "Coming later"
    : enrollable
      ? view.ctaLabel
      : catalog.loading
        ? "Checking availability…"
        : "Enrolment unavailable"

  function openEnrol() {
    if (comingLater) return
    if (enrollable || !catalog.loading) setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/programs">← Programmes</Link>
            <p className="cat-label">Programme</p>
            <h1>{view.title}</h1>
            <p className="cat-lead">{view.summary}</p>
            <div className="cat-meta">
              <span className="cat-mark">{view.maturityLabel}</span>
            </div>
            <p className="cat-note">{view.honesty}</p>
            <div className="cat-actions">
              {comingLater ? (
                <span className="cat-btn cat-btn-ghost" aria-disabled="true">Coming later</span>
              ) : (
                <button
                  type="button"
                  className="cat-btn cat-btn-primary"
                  disabled={catalog.loading && !enrollable}
                  onClick={openEnrol}
                >
                  {cta}
                </button>
              )}
              {view.linked[0] ? (
                <Link className="cat-btn cat-btn-ghost" to={view.linked[0].to}>
                  View {view.linked[0].title}
                </Link>
              ) : (
                <Link className="cat-btn cat-btn-ghost" to="/courses">Explore courses</Link>
              )}
            </div>
            <p className="cat-fine">{afterEnrol}</p>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail cat-split">
            <div className="cat-main">
              <section className="cat-card" aria-labelledby="intended-heading">
                <p className="cat-label">How a programme is meant to work</p>
                <h2 id="intended-heading">A longer path than a single course</h2>
                <p className="cat-fine">
                  The intended model is programme → term → specialisation → module → case study → project → assessment → career outcome. That structure is not fully implemented here. Enrolment does not create a separate taught syllabus beyond the linked course.
                </p>
                <ul className="cat-path" aria-label="Intended programme path">
                  {PROGRAMME_INTENDED_STEPS.map((step) => (
                    <li key={step} className={LIVE_PROGRAMME_STEPS.has(step) ? "is-live" : undefined}>
                      {step}
                      {LIVE_PROGRAMME_STEPS.has(step) ? " · available as linked learning" : " · not taught yet"}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="cat-card" aria-labelledby="linked-heading">
                <p className="cat-label">What is actually taught</p>
                <h2 id="linked-heading">Linked learning</h2>
                {view.linked.length === 0 ? (
                  <p className="cat-fine">No LMS course is linked yet.</p>
                ) : (
                  view.linked.map((item) => (
                    <Link className="cat-link" key={item.slug} to={item.to}>
                      <div>
                        <span className={item.authored ? "cat-mark cat-mark-ready" : "cat-mark"}>{item.maturityLabel}</span>
                        <h3>{item.title}</h3>
                        <p>{item.authored ? "Authored course in Skylent OS." : "Thinner catalogue listing in the LMS."}</p>
                      </div>
                      <span className="cat-btn cat-btn-ghost">View course</span>
                    </Link>
                  ))
                )}
              </section>

              {view.taughtOutcomes.length > 0 ? (
                <section className="cat-card" aria-labelledby="now-heading">
                  <p className="cat-label">What you will learn now</p>
                  <h2 id="now-heading">From the linked course</h2>
                  <p className="cat-fine">These capabilities come from the live linked course, not from brochure modules that are not taught yet.</p>
                  <ul className="cat-bullets">
                    {view.taughtOutcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="cat-card" aria-labelledby="keep-heading">
                <p className="cat-label">After enrolment</p>
                <h2 id="keep-heading">What you keep</h2>
                <p className="cat-fine">{afterEnrol}</p>
                <p className="cat-fine">
                  Learning evidence can be carried into Career OS. Career OS is a workspace for your profile and work — not a placement service.
                </p>
              </section>
            </div>

            <aside className="cat-access">
              <p className="cat-label">Access</p>
              {view.listedPrice > 0 && !comingLater ? (
                <p className="cat-price">₹{view.listedPrice.toLocaleString("en-IN")}</p>
              ) : null}
              <p className="cat-fine">Listed price. Payment is not collected here yet.</p>
              <p className="cat-fine">Certificate: not issued in this pilot.</p>
              {!comingLater ? (
                <div className="cat-actions">
                  <button
                    type="button"
                    className="cat-btn cat-btn-primary"
                    disabled={catalog.loading && !enrollable}
                    onClick={openEnrol}
                  >
                    {cta}
                  </button>
                </div>
              ) : (
                <p className="cat-fine">Enrolment is not open.</p>
              )}
            </aside>
          </div>
        </section>

        <section className="cat-final">
          <div className="cat-rail">
            <div className="cat-final-card">
              <div>
                <h2>{comingLater ? "This programme is not open yet" : "Open the linked learning"}</h2>
                <p>{afterEnrol}</p>
              </div>
              {comingLater ? (
                <Link className="cat-btn cat-btn-ghost" to="/courses">Browse courses</Link>
              ) : (
                <button
                  type="button"
                  className="cat-btn cat-btn-primary"
                  disabled={catalog.loading && !enrollable}
                  onClick={openEnrol}
                >
                  {cta}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{
            kind: "program",
            slug: program.slug,
            title: program.name,
            price: view.listedPrice,
            enrollmentStatus: program.enrollmentStatus ?? "open",
            enrollable,
            linkedCourseSlugs: linkedFromApi,
          }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}
