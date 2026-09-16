import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import {
  AUTHORED_DATASETS,
  AUTHORED_FAQ,
  AUTHORED_LEARNING_STEPS,
  AUTHORED_PREREQUISITE,
  AUTHORED_TOOLS,
  courseAfterEnrolSteps,
  courseModuleCards,
  coursePracticeGroups,
  coursePublicView,
} from "../lib/catalog-maturity"
import { courses } from "../data"
import { useCatalogCourse } from "../hooks/useCatalog"
import "./Catalog.css"

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = courses.find((item) => item.slug === slug)
  const catalog = useCatalogCourse(slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!course) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <h1>Course not found</h1>
              <Link className="cat-btn cat-btn-ghost" to="/courses">Back to courses</Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const view = coursePublicView(course)
  const enrollable = Boolean(catalog.data)
  const modules = courseModuleCards(course, view.showLiveCurriculum)
  const practice = coursePracticeGroups(course)
  const afterEnrol = courseAfterEnrolSteps(view.showLiveCurriculum)
  const cta = enrollCta(enrollable, catalog.loading, view.primaryCta)

  function openEnrol() {
    if (enrollable || !catalog.loading) setEnrollOpen(true)
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/courses">← Courses</Link>
            <p className="cat-label">Course</p>
            <h1>{view.title}</h1>
            <p className="cat-lead">{view.summary}</p>
            <div className="cat-meta">
              <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
                {view.maturityLabel}
              </span>
              <span>{view.course.level}</span>
              <span>{view.delivery}</span>
            </div>
            {view.honesty ? <p className="cat-note">{view.honesty}</p> : null}
            <div className="cat-facts" aria-label="Course facts">
              <div className="cat-fact">
                <span>Duration</span>
                <strong>{view.showLiveCurriculum ? view.duration : "Not finished yet"}</strong>
              </div>
              <div className="cat-fact">
                <span>{view.showLiveCurriculum ? "Lessons" : "Outline items"}</span>
                <strong>{view.stats.lessonCount}</strong>
              </div>
              <div className="cat-fact">
                <span>Modules</span>
                <strong>{view.stats.moduleCount}</strong>
              </div>
              <div className="cat-fact">
                <span>Practice</span>
                <strong>
                  {view.showLiveCurriculum
                    ? `${view.stats.quizCount} quizzes · ${view.stats.assignmentCount} assignments`
                    : "Outline only"}
                </strong>
              </div>
            </div>
            <div className="cat-actions">
              <button
                type="button"
                className="cat-btn cat-btn-primary"
                disabled={catalog.loading && !enrollable}
                onClick={openEnrol}
              >
                {cta}
              </button>
              <Link className="cat-btn cat-btn-ghost" to="/skills">Back to Skills</Link>
            </div>
            <p className="cat-fine">
              {view.showLiveCurriculum
                ? "Enrol opens Skylent OS at the first lesson. If you are not signed in, you will be asked to sign in first. Payment is not collected."
                : "Enrol opens the LMS outline. If you are not signed in, you will be asked to sign in first. Payment is not collected."}
            </p>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail cat-split">
            <div className="cat-main">
              {view.forWhom.length > 0 ? (
                <section className="cat-card" aria-labelledby="for-heading">
                  <p className="cat-label">Who it is for</p>
                  <h2 id="for-heading">Who this course is for</h2>
                  <ul className="cat-bullets">
                    {view.forWhom.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="cat-card" aria-labelledby="learn-heading">
                <p className="cat-label">What you will learn</p>
                <h2 id="learn-heading">{view.showLiveCurriculum ? "Capabilities in this course" : "Listed capabilities"}</h2>
                {!view.showLiveCurriculum ? (
                  <p className="cat-fine">These statements come from the catalogue listing, not a full authored course.</p>
                ) : null}
                <ul className="cat-bullets">
                  {view.outcomes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="cat-card" aria-labelledby="structure-heading">
                <p className="cat-label">{view.showLiveCurriculum ? "Course structure" : "Course outline"}</p>
                <h2 id="structure-heading">
                  {view.showLiveCurriculum
                    ? `${view.stats.moduleCount} modules · ${view.stats.lessonCount} lessons`
                    : "What exists in the LMS today"}
                </h2>
                {!view.showLiveCurriculum ? (
                  <p className="cat-fine">Titles below are an outline, not a finished teaching path.</p>
                ) : (
                  <p className="cat-fine">Each module is a block of written work and practice. Lesson bodies stay in Skylent OS.</p>
                )}
                <div className="cat-modules">
                  {modules.map((module) => (
                    <article className="cat-module" key={module.id}>
                      <span className="cat-module-num" aria-hidden="true">{String(module.index).padStart(2, "0")}</span>
                      <div>
                        <h3>{module.title}</h3>
                        <p>{module.countsLabel}</p>
                        <p>{module.workLine}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="cat-card" aria-labelledby="how-heading">
                <p className="cat-label">How learning works</p>
                <h2 id="how-heading">{view.showLiveCurriculum ? "Learn, practise, then keep the work" : "What enrolment opens"}</h2>
                {view.showLiveCurriculum ? (
                  <ol className="cat-steps">
                    {AUTHORED_LEARNING_STEPS.map((step) => (
                      <li key={step.label}>
                        <strong>{step.label}</strong>
                        <p>{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="cat-fine">
                    Enrolment opens an LMS outline. It is not the same as the Data Analytics teaching path.
                  </p>
                )}
              </section>

              {view.showLiveCurriculum ? (
                <section className="cat-card" aria-labelledby="practice-heading">
                  <p className="cat-label">Practical work</p>
                  <h2 id="practice-heading">What you will practise and build</h2>
                  <p className="cat-fine">
                    Practice uses a synthetic Northwind Retail dataset. There is no live classroom and no video stream.
                  </p>
                  <div className="cat-practice">
                    <article>
                      <h3>Learning</h3>
                      <p>{practice.learning.length} written lessons in Skylent OS.</p>
                    </article>
                    <article>
                      <h3>Practice</h3>
                      <p>{practice.practice.length} short checks.</p>
                      <ul>
                        {practice.practice.map((item) => (
                          <li key={item.id}>{item.title}</li>
                        ))}
                      </ul>
                    </article>
                    <article>
                      <h3>Assignment</h3>
                      <p>{practice.assignments.length} applied briefs.</p>
                      <ul>
                        {practice.assignments.map((item) => (
                          <li key={item.id}>{item.title}</li>
                        ))}
                      </ul>
                    </article>
                    <article>
                      <h3>Capstone</h3>
                      <p>A work sample you keep.</p>
                      <ul>
                        {practice.capstone.map((item) => (
                          <li key={item.id}>{item.title}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </section>
              ) : null}

              {view.showLiveCurriculum ? (
                <section className="cat-card" aria-labelledby="tools-heading">
                  <p className="cat-label">Dataset, tools, prerequisites</p>
                  <h2 id="tools-heading">What you need, and what you work on</h2>
                  <p className="cat-fine">Prerequisite: {AUTHORED_PREREQUISITE}</p>
                  <ul className="cat-tools">
                    {AUTHORED_TOOLS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <ul className="cat-bullets">
                    {AUTHORED_DATASETS.map((item) => (
                      <li key={item.filename}>
                        <strong>{item.filename}</strong>
                        {" — "}
                        {item.detail}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="cat-card" aria-labelledby="after-heading">
                <p className="cat-label">After enrolment</p>
                <h2 id="after-heading">What happens when you enrol</h2>
                <ol className="cat-numbered">
                  {afterEnrol.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <p className="cat-fine">
                  Progress and submitted work stay on your enrolment. You can carry learning evidence into Career OS. Career OS is a workspace — not a job guarantee.
                </p>
              </section>

              {view.showLiveCurriculum ? (
                <section className="cat-card" aria-labelledby="faq-heading">
                  <p className="cat-label">Questions</p>
                  <h2 id="faq-heading">Before you enrol</h2>
                  <div className="cat-faq">
                    {AUTHORED_FAQ.map((item) => (
                      <details key={item.q}>
                        <summary>{item.q}</summary>
                        <p>{item.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="cat-access">
              <p className="cat-label">Access</p>
              <p className="cat-price">₹{view.listedPrice.toLocaleString("en-IN")}</p>
              <p className="cat-fine">Listed price. Payment is not collected here yet.</p>
              <p className="cat-fine">Certificate: not issued in this pilot.</p>
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
              <p className="cat-fine">
                {view.showLiveCurriculum
                  ? "Primary action: sign in if needed, then open Skylent OS at the first lesson."
                  : "Primary action: sign in if needed, then open the LMS outline."}
              </p>
            </aside>
          </div>
        </section>

        <section className="cat-final">
          <div className="cat-rail">
            <div className="cat-final-card">
              <div>
                <h2>{view.showLiveCurriculum ? "Start Data Analytics" : `Open ${view.title}`}</h2>
                <p>
                  {view.showLiveCurriculum
                    ? "Enrolment does not collect payment. It opens the written course in Skylent OS."
                    : "This listing is thinner than Data Analytics. Enrolment opens the outline only."}
                </p>
              </div>
              <button
                type="button"
                className="cat-btn cat-btn-primary"
                disabled={catalog.loading && !enrollable}
                onClick={openEnrol}
              >
                {cta}
              </button>
            </div>
          </div>
        </section>
      </div>

      {enrollOpen ? (
        <EnrollmentModal
          item={{ kind: "course", slug: course.slug, title: course.title, price: view.listedPrice, enrollable }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      ) : null}
    </PageShell>
  )
}

function enrollCta(enrollable: boolean, loading: boolean, primaryCta: string): string {
  if (enrollable) return primaryCta
  if (loading) return "Checking availability…"
  return "Enrolment unavailable"
}
