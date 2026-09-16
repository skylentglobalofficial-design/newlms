import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { CourseThumb, PathwayTrack } from "../components/product/ProductLanguage"
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

  const pathSteps = PROGRAMME_INTENDED_STEPS.map((step) => ({
    label: step,
    live: LIVE_PROGRAMME_STEPS.has(step),
    note: LIVE_PROGRAMME_STEPS.has(step) ? "Available now as linked learning" : "Not taught yet",
  }))

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail cat-hero-split">
            <div>
              <Link className="cat-back" to="/programs">← Programmes</Link>
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
              <aside className="cat-access">
                <p className="cat-label">Access</p>
                {view.listedPrice > 0 && !comingLater ? (
                  <p className="cat-price">₹{view.listedPrice.toLocaleString("en-IN")}</p>
                ) : null}
                <p className="cat-fine">Listed price. Payment is not collected here yet.</p>
                <p className="cat-fine">Certificate: not issued in this pilot.</p>
              </aside>
            </div>
            <div className="cat-path-panel">
              <p className="cat-label">Intended pathway</p>
              <h2>What a programme is meant to be</h2>
              <p className="cat-fine cat-path-copy">
                That structure is not fully implemented here. Enrolment does not create a separate taught syllabus beyond the linked course.
              </p>
              <PathwayTrack steps={pathSteps} />
            </div>
          </div>
        </section>

        <section className="cat-band">
          <div className="cat-rail">
            <h2>What is actually taught</h2>
            <p className="cat-fine">Linked LMS learning — not a brochure syllabus.</p>
            {view.linked.length === 0 ? (
              <p className="cat-fine">No LMS course is linked yet.</p>
            ) : (
              view.linked.map((item) => (
                <Link className="cat-link" key={item.slug} to={item.to}>
                  <CourseThumb authored={item.authored} />
                  <div>
                    <span className={item.authored ? "cat-mark cat-mark-ready" : "cat-mark"}>{item.maturityLabel}</span>
                    <h3>{item.title}</h3>
                    <p>{item.authored ? "Authored course in Skylent OS." : "Thinner catalogue listing in the LMS."}</p>
                  </div>
                  <span className="cat-btn cat-btn-ghost">View course</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {view.taughtOutcomes.length > 0 ? (
          <section className="cat-section">
            <div className="cat-rail">
              <h2>What you will learn now</h2>
              <p className="cat-fine">These capabilities come from the live linked course, not from brochure modules that are not taught yet.</p>
              <div className="cat-caps">
                {view.taughtOutcomes.map((item) => (
                  <article className="cat-cap" key={item}>
                    <strong>{item}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="cat-band">
          <div className="cat-rail">
            <h2>After enrolment</h2>
            <p className="cat-fine">{afterEnrol}</p>
            <p className="cat-fine">
              Learning evidence can be carried into Career OS. Career OS is a workspace for your profile and work — not a placement service.
            </p>
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
