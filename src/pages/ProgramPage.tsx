import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { programs } from "../data"
import { isProgramEnrollable } from "../lib/catalog-api"
import { programmePublicView } from "../lib/catalog-maturity"
import { useCatalogProgram } from "../hooks/useCatalog"
import "./Catalog.css"

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
  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/programs">← Programmes</Link>
            <p className="cat-label">Programme</p>
            <h1>{view.title}</h1>
            <p className="cat-lead">{view.summary}</p>
            <div className="cat-meta" style={{ marginTop: 16 }}>
              <span className="cat-mark">{view.maturityLabel}</span>
            </div>
            <p className="cat-note">{view.honesty}</p>
            <div className="cat-actions">
              {view.maturity === "coming_later" ? (
                <span className="cat-btn cat-btn-ghost" aria-disabled="true">Coming later</span>
              ) : (
                <button
                  type="button"
                  className="cat-btn cat-btn-primary"
                  disabled={catalog.loading && !enrollable}
                  onClick={() => { if (enrollable || !catalog.loading) setEnrollOpen(true) }}
                >
                  {enrollable ? "Enrol" : catalog.loading ? "Checking availability…" : "Enrollment unavailable"}
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
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail cat-split">
            <div>
              <p className="cat-label">What is actually taught</p>
              <h2>Linked learning</h2>
              {view.linked.length === 0 ? (
                <p className="cat-fine">No LMS course is linked yet.</p>
              ) : (
                <div className="cat-list">
                  {view.linked.map((item) => (
                    <Link className="cat-row" key={item.slug} to={item.to}>
                      <div>
                        <span className={item.authored ? "cat-mark cat-mark-ready" : "cat-mark"}>{item.maturityLabel}</span>
                        <h3>{item.title}</h3>
                        <p>{item.authored ? "Authored course in Skylent OS." : "Thinner catalogue listing in the LMS."}</p>
                      </div>
                      <span className="cat-btn cat-btn-ghost">View course</span>
                    </Link>
                  ))}
                </div>
              )}

              {view.taughtOutcomes.length > 0 ? (
                <div className="cat-group">
                  <p className="cat-label">What you will learn now</p>
                  <h2>From the linked course</h2>
                  <ul className="cat-bullets">
                    {view.taughtOutcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="cat-group">
                <p className="cat-label">How a programme is meant to work</p>
                <p className="cat-fine">
                  The intended model is programme → module → practice → project → evidence. That structure is not fully implemented here. Enrolment does not create a separate taught programme beyond the linked course.
                </p>
              </div>

              <div className="cat-group">
                <p className="cat-label">What you keep</p>
                <p className="cat-fine">
                  Learning evidence can be carried into Career OS. Career OS is a workspace for your profile and work — not a placement service.
                </p>
              </div>
            </div>

            <aside className="cat-access">
              <p className="cat-label">Access</p>
              {view.listedPrice > 0 ? (
                <p className="cat-price">₹{view.listedPrice.toLocaleString("en-IN")}</p>
              ) : null}
              <p className="cat-fine">Listed price. Payment is not collected here yet.</p>
              <p className="cat-fine">Certificate: not issued in this pilot.</p>
              {view.maturity !== "coming_later" ? (
                <div className="cat-actions">
                  <button
                    type="button"
                    className="cat-btn cat-btn-primary"
                    disabled={catalog.loading && !enrollable}
                    onClick={() => { if (enrollable || !catalog.loading) setEnrollOpen(true) }}
                  >
                    {enrollable ? "Enrol" : catalog.loading ? "Checking availability…" : "Enrollment unavailable"}
                  </button>
                </div>
              ) : (
                <p className="cat-fine">Enrolment is not open.</p>
              )}
            </aside>
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
