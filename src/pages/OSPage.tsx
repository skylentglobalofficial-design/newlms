import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseWorkspacePreview } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { countStaticCourseLessons } from "../lib/curriculum-counts"
import { coursePracticeGroups, courseLessonStats } from "../lib/catalog-maturity"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import "./Catalog.css"

const analytics = courses.find((course) => course.slug === FLAGSHIP_COURSE_SLUG)
const product = courses.find((course) => course.slug === PRODUCT_MANAGEMENT_SLUG)

const authored = [analytics, product].filter(Boolean) as NonNullable<typeof analytics>[]

/** Everything the workspace holds today, counted from the authored courses. */
const workspaceScope = authored.reduce(
  (total, course) => {
    const stats = courseLessonStats(course)
    const groups = coursePracticeGroups(course)
    return {
      courses: total.courses + 1,
      modules: total.modules + stats.moduleCount,
      lessons: total.lessons + stats.lessonCount,
      checks: total.checks + groups.practice.length,
      assignments: total.assignments + groups.assignments.length,
      capstones: total.capstones + groups.capstone.length,
    }
  },
  { courses: 0, modules: 0, lessons: 0, checks: 0, assignments: 0, capstones: 0 },
)

export default function OSPage() {
  const [hero, setHero] = useState<"analytics" | "product">("analytics")
  const featured = hero === "product" && product ? product : analytics
  const firstLesson = featured?.modules[0]?.lessons[0]
  const firstQuiz = featured?.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")
  const capstone = featured?.modules.flatMap((module) => module.lessons).find((lesson) => /capstone|product case/i.test(lesson.title))

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail cat-hero-split">
            <div>
              <p className="cat-label">Skylent OS</p>
              <h1>Your learning workspace</h1>
              <p className="cat-lead">
                Written lessons, quizzes, and assignments in one place. It is the same product as the student dashboard — not a separate operating system, and not a video classroom.
              </p>
              <div className="cat-actions">
                <Link className="cat-btn cat-btn-primary cat-btn-lg" to="/courses/data-analytics">Start Data Analytics</Link>
                <Link className="cat-btn cat-btn-ghost" to="/courses/product-management">Start Product Management</Link>
              </div>
              <p className="cat-honesty">
                Open a course, enrol, then Skylent OS starts at the first lesson. Payment is not collected in this pilot.
              </p>

              <p className="cat-label os-scope-label">In the workspace today</p>
              <div className="cat-facts os-scope">
                {[
                  ["Authored courses", workspaceScope.courses],
                  ["Modules", workspaceScope.modules],
                  ["Lessons", workspaceScope.lessons],
                  ["Checks", workspaceScope.checks],
                  ["Assignments", workspaceScope.assignments],
                  ["Capstones", workspaceScope.capstones],
                ].map(([label, value]) => (
                  <div className="cat-fact" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <p className="cat-fine">
                Counted from the two authored courses. Other catalogue courses open an outline, not a finished
                teaching path.
              </p>
            </div>
            {featured ? (
              <div className="cat-hero-visual">
                <p className="cat-preview-caption">What you open after enrol</p>
                <div className="cat-hero-switch" role="tablist" aria-label="Course workspace preview">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={hero === "analytics"}
                    className={hero === "analytics" ? "is-on" : undefined}
                    onClick={() => setHero("analytics")}
                  >
                    Data Analytics
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={hero === "product"}
                    className={hero === "product" ? "is-on" : undefined}
                    onClick={() => setHero("product")}
                  >
                    Product Management
                  </button>
                </div>
                <CourseWorkspacePreview
                  courseTitle={featured.title}
                  lessonTitle={firstLesson?.title ?? "Open the first lesson"}
                  practiceTitle={firstQuiz?.title ?? "A short check"}
                  workTitle={capstone?.title ?? "Capstone"}
                  modules={featured.modules.map((module) => module.title)}
                  lessonCount={countStaticCourseLessons(featured)}
                  visual={hero === "product" ? "harbor-desk" : "northwind"}
                  marketing
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="cat-band" aria-labelledby="os-lives-title">
          <div className="cat-rail">
            <h2 id="os-lives-title">What lives here</h2>
            <div className="cat-caps is-4">
              <article className="cat-cap">
                <strong>Courses and lessons</strong>
                <p>Move through written work in the enrolled course. Lesson bodies stay in this workspace.</p>
              </article>
              <article className="cat-cap">
                <strong>Practice</strong>
                <p>Short checks after a block of lessons. Five out of five to pass a check.</p>
              </article>
              <article className="cat-cap">
                <strong>Practical work</strong>
                <p>Assignments and a capstone produced against the course material, not a worked example.</p>
              </article>
              <article className="cat-cap">
                <strong>Progress and evidence</strong>
                <p>
                  The student dashboard tracks what is done. Finished work can be carried into Career OS as
                  evidence.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="os-work-title">
          <div className="cat-rail">
            <p className="cat-label">What you actually produce</p>
            <h2 id="os-work-title">Named work, not a worked example.</h2>
            <p className="cat-lead">
              Each authored course ends in a capstone you keep. These are the real assignment titles inside the
              workspace.
            </p>
            <div className="os-produce">
              {authored.map((course) => {
                const groups = coursePracticeGroups(course)
                return (
                  <article className="os-produce-item" key={course.slug}>
                    <p className="os-produce-course">{course.title}</p>
                    <ul>
                      {[...groups.assignments, ...groups.capstone].map((lesson) => (
                        <li key={lesson.id} className={/capstone/i.test(lesson.title) ? "is-capstone" : undefined}>
                          <span>{/capstone/i.test(lesson.title) ? "Capstone" : "Assignment"}</span>
                          <strong>{lesson.title.replace(/^capstone\s*[—–-]\s*/i, "")}</strong>
                        </li>
                      ))}
                    </ul>
                    <Link className="cat-text-link" to={`/courses/${course.slug}`}>
                      Open {course.title} →
                    </Link>
                  </article>
                )
              })}
            </div>
            <p className="cat-fine">
              Written lessons, checks, assignments, and the capstone all open after you enrol. There is no video
              stream and no live classroom.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
