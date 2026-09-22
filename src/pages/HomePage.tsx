import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  CareerEvidencePreview,
  CourseThumb,
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
  { title: "Choose", copy: "Pick a focused course and a clear outcome.", kind: "choose" as const },
  { title: "Learn", copy: "Understand the idea in Skylent OS.", kind: "learn" as const },
  { title: "Practise", copy: "Check whether you can actually use it.", kind: "practice" as const },
  { title: "Build", copy: "Turn the learning into useful work.", kind: "build" as const },
  { title: "Keep", copy: "Save evidence of what you built.", kind: "keep" as const },
] as const

function workspaceFor(course: NonNullable<typeof analytics>) {
  const lessonCount = countStaticCourseLessons(course)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")
  const capstone = course.modules.flatMap((module) => module.lessons).find((lesson) => /capstone|product case/i.test(lesson.title))
  return { lessonCount, firstLesson, firstQuiz, capstone }
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
        <section className="hp-hero" aria-labelledby="home-hero-heading">
          <div className="hp-rail hp-hero-grid">
            <div className="hp-hero-copy">
              <p className="hp-kicker">LEARN · PRACTISE · BUILD</p>
              <h1 id="home-hero-heading">Learn something useful.</h1>
              <p>
                Focused courses, hands-on practice, and work you can keep. Start with a clear skill and build from there.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
                <Link className="hp-btn hp-btn-ghost" to="/programs">Explore programmes</Link>
              </div>
              <p className="hp-hero-note">
                Skylent is built around a simple loop: understand the idea, practise it, build something, and keep the evidence.
              </p>
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

        <section className="hp-flagship" aria-labelledby="featured-heading">
          <div className="hp-rail">
            <div className="hp-section-head">
              <div>
                <p className="hp-kicker">START HERE</p>
                <h2 id="featured-heading" className="hp-h2">Courses you can actually do.</h2>
                <p className="hp-lead">Start with one of the focused learning experiences currently authored in Skylent.</p>
              </div>
              <Link className="hp-text-link" to="/courses">View all courses</Link>
            </div>

            <div className="hp-product-pair">
              {analytics ? (
                <Link className="hp-product" to="/courses/data-analytics">
                  <CourseThumb authored visual="northwind" />
                  <div className="hp-product-copy">
                    <h3>{analytics.title}</h3>
                    <p>Northwind revenue, categories, SQL, and a dashboard you keep.</p>
                    <p className="hp-flagship-meta">{analytics.duration}{analyticsLessons > 0 ? ` · ${analyticsLessons} lessons` : ""}{analytics.projects > 0 ? ` · ${analytics.projects} assignments` : ""} · Self-paced</p>
                    <span className="hp-btn hp-btn-primary">Open Data Analytics</span>
                  </div>
                </Link>
              ) : null}
              {product ? (
                <Link className="hp-product" to="/courses/product-management">
                  <CourseThumb authored visual="harbor-desk" />
                  <div className="hp-product-copy">
                    <h3>{product.title}</h3>
                    <p>Harbor Desk: 12 stores, 4 interviews, 9 weekend exceptions. Evidence → Spec.</p>
                    <p className="hp-flagship-meta">{product.duration}{productLessons > 0 ? ` · ${productLessons} lessons` : ""}{product.projects > 0 ? ` · ${product.projects} assignments` : ""} · Self-paced</p>
                    <span className="hp-btn hp-btn-primary">Open Product Management</span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="hp-section" aria-labelledby="how-study-heading">
          <div className="hp-rail">
            <p className="hp-kicker">HOW IT WORKS</p>
            <h2 id="how-study-heading" className="hp-h2">Choose. Learn. Practise. Build. Keep.</h2>
            <p className="hp-lead">The learning experience is designed to move beyond watching lessons into practice and visible work.</p>
            <div className="hp-flow-wrap">
              <LearnFlow steps={studyLoop} />
            </div>
          </div>
        </section>

        <section className="hp-section hp-career" aria-labelledby="work-heading">
          <div className="hp-rail hp-career-grid">
            <div>
              <p className="hp-kicker">EXPLORE SKYLENT</p>
              <h2 id="work-heading" className="hp-h2">Go deeper when you are ready.</h2>
              <p className="hp-lead">
                The homepage introduces the system. Dedicated pages hold the detail, so you can go straight to the part of Skylent you need.
              </p>
              <div className="hp-explore-grid">
                <Link to="/programs" className="hp-explore-card"><strong>Programmes</strong><span>Structured learning paths.</span></Link>
                <Link to="/skills" className="hp-explore-card"><strong>Skills</strong><span>Explore skills and where they lead.</span></Link>
                <Link to="/career-os" className="hp-explore-card"><strong>Career OS</strong><span>Keep your profile, projects, and career activity.</span></Link>
                <Link to="/institutions" className="hp-explore-card"><strong>Institutions</strong><span>See the institutional side of Skylent.</span></Link>
              </div>
            </div>
            <CareerEvidencePreview />
          </div>
        </section>

        <section className="hp-final" aria-labelledby="final-heading">
          <div className="hp-rail">
            <div className="hp-final-card">
              <div>
                <p className="hp-kicker">YOUR NEXT STEP</p>
                <h2 id="final-heading" className="hp-h2">Start with one useful skill.</h2>
              </div>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start Data Analytics</Link>
                <Link className="hp-btn hp-btn-ghost" to="/programs">Explore programmes</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
