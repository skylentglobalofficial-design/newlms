import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { courses } from "../data"
import { countStaticCourseLessons } from "../lib/curriculum-counts"
import "./HomePage.css"

const FLAGSHIP_SLUG = "data-analytics"
const flagship = courses.find((course) => course.slug === FLAGSHIP_SLUG)

const studyLoop = [
  { title: "Learn", copy: "Understand the concept." },
  { title: "Practise", copy: "Test whether you can use it." },
  { title: "Build", copy: "Turn the lesson into useful work." },
  { title: "Keep", copy: "Save the evidence of what you built." },
] as const

function HeroCourseVisual() {
  if (!flagship) return null
  const firstLesson = flagship.modules[0]?.lessons[0]
  const firstQuiz = flagship.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")
  const capstone = flagship.modules.flatMap((module) => module.lessons).find((lesson) => /capstone/i.test(lesson.title))

  const rows = [
    { label: "Course", value: flagship.title },
    { label: "Lesson", value: firstLesson?.title ?? "Open the first lesson" },
    { label: "Practice", value: firstQuiz?.title ?? "A short check after the lesson" },
    { label: "Work you keep", value: capstone?.title ?? "A capstone you can show" },
  ]

  return (
    <figure className="hp-hero-visual">
      <figcaption className="hp-visual-kicker">How a course is built</figcaption>
      <ol className="hp-visual-list" aria-label="Course, lesson, practice, work you keep">
        {rows.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </li>
        ))}
      </ol>
    </figure>
  )
}

export default function HomePage() {
  const lessonCount = flagship ? countStaticCourseLessons(flagship) : 0
  const outcomes = flagship?.outcomes.slice(0, 3) ?? []

  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero">
          <div className="hp-rail hp-hero-grid">
            <div className="hp-hero-copy">
              <p className="hp-label">A place to learn</p>
              <h1>Learn something useful.</h1>
              <p>
                Skylent is for learning, practice, and useful work. Take a focused course, try the ideas, and keep what you build.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">
                  Start learning
                </Link>
                <Link className="hp-btn hp-btn-ghost" to="/courses">
                  Explore courses
                </Link>
              </div>
              <p className="hp-hero-note">
                Data Analytics is open now: spreadsheets, SQL, dashboards, and a capstone on a practice dataset.
              </p>
            </div>
            <HeroCourseVisual />
          </div>
        </section>

        <section className="hp-section hp-section-alt" id="start-learning" aria-labelledby="start-learning-heading">
          <div className="hp-rail">
            <p className="hp-label">Start learning</p>
            <h2 id="start-learning-heading" className="hp-h2">A real course you can open today.</h2>
            {flagship ? (
              <article className="hp-flagship">
                <div className="hp-flagship-copy">
                  <p className="hp-flagship-kicker">Flagship course</p>
                  <h3>{flagship.title}</h3>
                  <p>{flagship.desc}</p>
                  <ul>
                    {outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                  <p className="hp-flagship-meta">
                    {flagship.duration}
                    {lessonCount > 0 ? ` · ${lessonCount} lessons` : ""}
                    {flagship.projects > 0 ? ` · ${flagship.projects} assignments` : ""}
                    {" · Self-paced"}
                  </p>
                  <div className="hp-actions">
                    <Link className="hp-btn hp-btn-primary" to={`/courses/${flagship.slug}`}>
                      Open Data Analytics
                    </Link>
                    <Link className="hp-btn hp-btn-ghost" to="/courses">
                      Explore courses
                    </Link>
                  </div>
                </div>
                <ol className="hp-flagship-path" aria-label="Data Analytics path">
                  {flagship.modules.map((module, index) => (
                    <li key={module.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{module.title}</strong>
                    </li>
                  ))}
                </ol>
              </article>
            ) : (
              <p className="hp-lead">Open the course catalogue to see what is live.</p>
            )}
            <p className="hp-fine">
              Other catalogue listings are thinner than Data Analytics. This is the course with a full practice path.
            </p>
          </div>
        </section>

        <section className="hp-section" aria-labelledby="how-study-heading">
          <div className="hp-rail">
            <p className="hp-label">How study works</p>
            <h2 id="how-study-heading" className="hp-h2">Learn. Practise. Build. Keep.</h2>
            <ol className="hp-loop">
              {studyLoop.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="hp-section hp-section-alt" aria-labelledby="work-heading">
          <div className="hp-rail hp-career-grid">
            <div>
              <p className="hp-label">After you build something</p>
              <h2 id="work-heading" className="hp-h2">What happens to the work you build?</h2>
              <p className="hp-lead">
                Your learning evidence can stay with you in Career OS. It is a workspace for your profile, projects, and career activity — not a job guarantee.
              </p>
              <Link className="hp-text-link" to="/career-os">
                See Career OS
              </Link>
            </div>
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
            <h2 id="final-heading" className="hp-h2">Ready to start learning?</h2>
            <div className="hp-actions">
              <Link className="hp-btn hp-btn-primary" to="/courses/data-analytics">
                Start learning
              </Link>
              <Link className="hp-btn hp-btn-ghost" to="/courses">
                Explore courses
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
