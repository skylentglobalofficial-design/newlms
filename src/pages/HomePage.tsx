import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CareerEvidencePreview, CourseWorkspacePreview, LearnFlow, NorthwindWorkspace } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { countStaticCourseLessons } from "../lib/curriculum-counts"
import "./HomePage.css"

const FLAGSHIP_SLUG = "data-analytics"
const flagship = courses.find((course) => course.slug === FLAGSHIP_SLUG)

const studyLoop = [
  { title: "Learn", copy: "Read the idea in Skylent OS.", kind: "learn" as const },
  { title: "Practise", copy: "Check whether you can use it.", kind: "practice" as const },
  { title: "Build", copy: "Turn it into useful work.", kind: "build" as const },
  { title: "Keep", copy: "Save the evidence of what you built.", kind: "keep" as const },
] as const

export default function HomePage() {
  const lessonCount = flagship ? countStaticCourseLessons(flagship) : 0
  const firstLesson = flagship?.modules[0]?.lessons[0]
  const firstQuiz = flagship?.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")
  const capstone = flagship?.modules.flatMap((module) => module.lessons).find((lesson) => /capstone/i.test(lesson.title))

  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero">
          <div className="hp-rail hp-hero-grid">
            <div className="hp-hero-copy">
              <h1>Learn something useful.</h1>
              <p>
                Skylent is a place to learn, practise, and keep the work. Open a focused course and do the exercises in a real workspace.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start learning</Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">Explore courses</Link>
              </div>
              <p className="hp-hero-note">
                Data Analytics is open now: spreadsheets, SQL, dashboards, and a capstone on a practice dataset.
              </p>
            </div>
            {flagship ? (
              <CourseWorkspacePreview
                courseTitle={flagship.title}
                lessonTitle={firstLesson?.title ?? "Open the first lesson"}
                practiceTitle={firstQuiz?.title ?? "A short check"}
                workTitle={capstone?.title ?? "Capstone"}
                modules={flagship.modules.map((module) => module.title)}
              />
            ) : null}
          </div>
        </section>

        <section className="hp-section hp-section-alt" id="start-learning" aria-labelledby="start-learning-heading">
          <div className="hp-rail hp-feature">
            <div>
              <h2 id="start-learning-heading" className="hp-h2">{flagship?.title ?? "Data Analytics"}</h2>
              <p className="hp-lead">{flagship?.desc}</p>
              <p className="hp-flagship-meta">
                {flagship?.duration}
                {lessonCount > 0 ? ` · ${lessonCount} lessons` : ""}
                {flagship && flagship.projects > 0 ? ` · ${flagship.projects} assignments` : ""}
                {" · Self-paced"}
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Open Data Analytics</Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">Explore courses</Link>
              </div>
              <p className="hp-fine">Other catalogue listings are thinner than Data Analytics.</p>
            </div>
            <NorthwindWorkspace compact />
          </div>
        </section>

        <section className="hp-section" aria-labelledby="how-study-heading">
          <div className="hp-rail">
            <h2 id="how-study-heading" className="hp-h2">Learn. Practise. Build. Keep.</h2>
            <div className="hp-flow-wrap">
              <LearnFlow steps={studyLoop} />
            </div>
          </div>
        </section>

        <section className="hp-section hp-section-alt" aria-labelledby="work-heading">
          <div className="hp-rail hp-feature">
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
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">Start learning</Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">Explore courses</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
