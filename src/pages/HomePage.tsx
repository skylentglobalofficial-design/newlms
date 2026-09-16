import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  CareerEvidencePreview,
  CourseProductVisual,
  CourseWorkspacePreview,
  LearnFlow,
} from "../components/product/ProductLanguage"
import { courses } from "../data"
import { countStaticCourseLessons } from "../lib/curriculum-counts"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import "./HomePage.css"

const analytics = courses.find((course) => course.slug === FLAGSHIP_COURSE_SLUG)
const product = courses.find((course) => course.slug === PRODUCT_MANAGEMENT_SLUG)

const studyLoop = [
  { title: "Choose", copy: "Pick Data Analytics or Product Management.", kind: "choose" as const },
  { title: "Learn", copy: "Read the idea in Skylent OS.", kind: "learn" as const },
  { title: "Practise", copy: "Check whether you can use it.", kind: "practice" as const },
  { title: "Build", copy: "Turn it into useful work.", kind: "build" as const },
  { title: "Keep", copy: "Save the evidence of what you built.", kind: "keep" as const },
] as const

function workspaceFor(course: NonNullable<typeof analytics>) {
  const lessonCount = countStaticCourseLessons(course)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")
  const capstone = course.modules.flatMap((module) => module.lessons).find((lesson) => /capstone|product case/i.test(lesson.title))
  return {
    lessonCount,
    firstLesson,
    firstQuiz,
    capstone,
  }
}

export default function HomePage() {
  const [hero, setHero] = useState<"analytics" | "product">("analytics")
  const featured = hero === "product" && product ? product : analytics
  const work = featured ? workspaceFor(featured) : null
  const analyticsLessons = analytics ? countStaticCourseLessons(analytics) : 0
  const productLessons = product ? countStaticCourseLessons(product) : 0

  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero">
          <div className="hp-rail hp-hero-grid">
            <div className="hp-hero-copy">
              <h1>Learn something useful.</h1>
              <p>
                Open a focused course. Do the exercises in a real workspace. Keep the work.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">Explore courses</Link>
              </div>
            </div>
            {featured && work ? (
              <div className="hp-hero-stage">
                <div className="hp-hero-switch" role="tablist" aria-label="Featured course workspace">
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
                  lessonTitle={work.firstLesson?.title ?? "Open the first lesson"}
                  practiceTitle={work.firstQuiz?.title ?? "A short check"}
                  workTitle={work.capstone?.title ?? "Capstone"}
                  modules={featured.modules.map((module) => module.title)}
                  lessonCount={work.lessonCount}
                  visual={hero === "product" ? "harbor-desk" : "northwind"}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="hp-flagship" id="start-learning" aria-labelledby="start-learning-heading">
          <div className="hp-rail">
            <div className="hp-flagship-head">
              <div>
                <h2 id="start-learning-heading" className="hp-h2">Start with a course you can actually do.</h2>
                <p className="hp-lead">Two live courses. Different work. Same learning product.</p>
              </div>
              <Link className="hp-text-link" to="/skills">Not sure where to start? Use Skills</Link>
            </div>
            <div className="hp-product-pair">
              {analytics ? (
                <Link className="hp-product" to="/courses/data-analytics">
                  <CourseProductVisual visual="northwind" compact />
                  <div className="hp-product-copy">
                    <h3>{analytics.title}</h3>
                    <p>Northwind revenue, categories, SQL, and a dashboard you keep.</p>
                    <p className="hp-flagship-meta">
                      {analytics.duration}
                      {analyticsLessons > 0 ? ` · ${analyticsLessons} lessons` : ""}
                      {analytics.projects > 0 ? ` · ${analytics.projects} assignments` : ""}
                      {" · Self-paced"}
                    </p>
                    <span className="hp-btn hp-btn-primary">Open Data Analytics</span>
                  </div>
                </Link>
              ) : null}
              {product ? (
                <Link className="hp-product" to="/courses/product-management">
                  <CourseProductVisual visual="harbor-desk" compact />
                  <div className="hp-product-copy">
                    <h3>{product.title}</h3>
                    <p>Harbor Desk: 12 stores, 4 interviews, 9 weekend exceptions. Evidence → Spec.</p>
                    <p className="hp-flagship-meta">
                      {product.duration}
                      {productLessons > 0 ? ` · ${productLessons} lessons` : ""}
                      {product.projects > 0 ? ` · ${product.projects} assignments` : ""}
                      {" · Self-paced"}
                    </p>
                    <span className="hp-btn hp-btn-primary">Open Product Management</span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="hp-section" aria-labelledby="how-study-heading">
          <div className="hp-rail">
            <h2 id="how-study-heading" className="hp-h2">Choose. Learn. Practise. Build. Keep.</h2>
            <div className="hp-flow-wrap">
              <LearnFlow steps={studyLoop} />
            </div>
          </div>
        </section>

        <section className="hp-section hp-career" aria-labelledby="work-heading">
          <div className="hp-rail hp-career-grid">
            <div>
              <h2 id="work-heading" className="hp-h2">Keep the work in Career OS</h2>
              <p className="hp-lead">
                Your learning evidence can stay with you in Career OS. It is a workspace for your profile, projects, and career activity — not a job guarantee.
              </p>
              <Link className="hp-text-link" to="/career-os">See Career OS</Link>
            </div>
            <CareerEvidencePreview />
          </div>
        </section>

        <section className="hp-section hp-future" aria-labelledby="future-heading">
          <div className="hp-rail">
            <h2 id="future-heading" className="hp-future-title">More ways to learn are coming.</h2>
            <p>
              Academic paths for school, degrees, and exams are being built later. They are not the product you start with today.
            </p>
          </div>
        </section>

        <section className="hp-section hp-final" aria-labelledby="final-heading">
          <div className="hp-rail">
            <div className="hp-final-card">
              <h2 id="final-heading" className="hp-h2">Ready to start learning?</h2>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">Explore courses</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
