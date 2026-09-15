import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EnrollmentModal, PageShell } from "../components/shared"
import { coursePublicView, publicLessonKind } from "../lib/catalog-maturity"
import { courses } from "../data"
import { useCatalogCourse } from "../hooks/useCatalog"
import "./Catalog.css"

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = courses.find((item) => item.slug === slug)
  const catalog = useCatalogCourse(slug)
  const [openModule, setOpenModule] = useState<string | null>(course?.modules[0]?.id ?? null)
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
  const practice = course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.type === "quiz" || lesson.type === "assignment")

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/courses">← Courses</Link>
            <p className="cat-label">Course</p>
            <h1>{view.title}</h1>
            <p className="cat-lead">{view.summary}</p>
            <div className="cat-meta" style={{ marginTop: 16 }}>
              <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
                {view.maturityLabel}
              </span>
              <span>{view.course.level}</span>
              <span>{view.delivery}</span>
            </div>
            {view.honesty ? <p className="cat-note">{view.honesty}</p> : null}
            <p className="cat-fine" style={{ maxWidth: "36em" }}>
              {view.showLiveCurriculum
                ? "How you learn: written lessons, quizzes, and assignments in Skylent OS. Self-paced. No live classroom and no video stream."
                : "How you learn: this listing is not a finished teaching path yet. Enrolment opens the LMS outline."}
            </p>
            <div className="cat-specs" aria-label="Course facts">
              <div>
                <p className="cat-label">Duration</p>
                <strong>{view.showLiveCurriculum ? view.duration : "Not a finished course yet"}</strong>
              </div>
              <div>
                <p className="cat-label">Lessons</p>
                <strong>{view.stats.lessonCount}</strong>
              </div>
              <div>
                <p className="cat-label">How you learn</p>
                <strong>{view.delivery}</strong>
              </div>
              <div>
                <p className="cat-label">Practice</p>
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
                onClick={() => { if (enrollable || !catalog.loading) setEnrollOpen(true) }}
              >
                {enrollable ? "Enrol" : catalog.loading ? "Checking availability…" : "Enrollment unavailable"}
              </button>
              <Link className="cat-btn cat-btn-ghost" to="/skills">Back to Skills</Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="learn-heading">
          <div className="cat-rail cat-split">
            <div>
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

              {view.forWhom.length > 0 ? (
                <div className="cat-group">
                  <p className="cat-label">Who it is for</p>
                  <ul className="cat-bullets">
                    {view.forWhom.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="cat-group">
                <p className="cat-label">{view.showLiveCurriculum ? "Curriculum" : "Course outline"}</p>
                <h2>{view.showLiveCurriculum ? `${view.stats.moduleCount} modules · ${view.stats.lessonCount} lessons` : "What exists in the LMS today"}</h2>
                {!view.showLiveCurriculum ? (
                  <p className="cat-fine">Full learning content is being built. Titles below are an outline, not a finished teaching path.</p>
                ) : null}
                <div className="cat-curriculum">
                  {course.modules.map((module, index) => {
                    const open = openModule === module.id
                    return (
                      <div className="cat-module" key={module.id}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenModule(open ? null : module.id)}
                        >
                          <span>
                            <span className="cat-kind">{String(index + 1).padStart(2, "0")}</span>
                            {" "}
                            <strong>{module.title}</strong>
                          </span>
                          <span className="cat-fine" style={{ margin: 0 }}>{module.lessons.length} lessons</span>
                        </button>
                        {open ? (
                          <ol>
                            {module.lessons.map((lesson) => (
                              <li key={lesson.id}>
                                <span>{lesson.title}</span>
                                <span className="cat-kind">{publicLessonKind(lesson, view.showLiveCurriculum)}</span>
                                {view.showLiveCurriculum && lesson.duration ? <span>{lesson.duration}</span> : null}
                              </li>
                            ))}
                          </ol>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              {view.showLiveCurriculum ? (
                <div className="cat-group">
                  <p className="cat-label">Practice / work</p>
                  <h2>What you actually do</h2>
                  <p className="cat-fine">
                    Practice uses a synthetic Northwind Retail dataset. There is no live classroom and no video stream.
                  </p>
                  <ul className="cat-bullets">
                    {practice.map((lesson) => (
                      <li key={lesson.id}>{lesson.title}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="cat-group">
                <p className="cat-label">What you keep</p>
                <p className="cat-fine">
                  Progress and submitted work stay on your enrollment. You can carry learning evidence into Career OS. Career OS is a workspace — not a job guarantee.
                </p>
              </div>
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
                  onClick={() => { if (enrollable || !catalog.loading) setEnrollOpen(true) }}
                >
                  {enrollable ? "Enrol" : catalog.loading ? "Checking availability…" : "Enrollment unavailable"}
                </button>
              </div>
              <p className="cat-fine">After you enrol: Get learning access → Skylent OS → first lesson.</p>
            </aside>
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
