import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseWorkspacePreview } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { countStaticCourseLessons } from "../lib/curriculum-counts"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import "./Catalog.css"

const analytics = courses.find((course) => course.slug === FLAGSHIP_COURSE_SLUG)
const product = courses.find((course) => course.slug === PRODUCT_MANAGEMENT_SLUG)

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

        <section className="cat-section">
          <div className="cat-rail">
            <h2>What lives here</h2>
            <div className="cat-caps is-3">
              <article className="cat-cap">
                <strong>Courses and lessons</strong>
                <p>Move through written work in the enrolled course. Lesson bodies stay in this workspace.</p>
              </article>
              <article className="cat-cap">
                <strong>Practice</strong>
                <p>Short checks and assignments become work you can keep as evidence.</p>
              </article>
              <article className="cat-cap">
                <strong>Progress</strong>
                <p>See what you have completed and what comes next from the student dashboard.</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
