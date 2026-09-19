import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  CourseProductVisual,
  CourseThumb,
  CourseWorkspacePreview,
  ProductFrame,
} from "../components/product/ProductLanguage"
import { courses } from "../data"
import { coursePublicView } from "../lib/catalog-maturity"
import { authoredCourseList, courseProductProfile } from "../lib/course-product"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import { getCareerEvidence, getCourseQuiz, getLessonMeta } from "../content/course-lookups"
import { ACADEMIC_LINES, CAREER_OS_IA, EXAMS_NAV, MATURITY_LABEL } from "../lib/product-architecture"
import { programmeDiscoveryCards } from "../lib/programme-discovery"
import "./HomePage.css"

const FEATURED_SLUGS = [
  "data-analytics",
  "product-management",
  "python-programming",
  "generative-ai",
  "power-bi",
  "full-stack-web",
] as const

const SKILL_LINKS = [
  { label: "Artificial Intelligence", to: "/skills?intent=ai" },
  { label: "Data Analytics", to: "/courses/data-analytics" },
  { label: "Python", to: "/courses/python-programming" },
  { label: "SQL", to: "/courses/data-analytics" },
  { label: "Product Management", to: "/courses/product-management" },
  { label: "Web Development", to: "/courses/full-stack-web" },
  { label: "Marketing", to: "/courses?q=Marketing" },
  { label: "Design", to: "/courses?q=Design" },
  { label: "Communication", to: "/skills" },
  { label: "Business", to: "/workshops/ai-for-business" },
] as const

type GoalId = "career" | "exam" | "study" | "new"

const GOALS: Array<{
  id: GoalId
  title: string
  copy: string
  items: Array<{ label: string; to: string; mark?: string }>
}> = [
  {
    id: "career",
    title: "Build a career",
    copy: "Professional skills you can practise in Skylent OS.",
    items: [
      { label: "AI", to: "/skills?intent=ai" },
      { label: "Data", to: "/skills?intent=data" },
      { label: "Product", to: "/skills?intent=product" },
      { label: "Technology", to: "/skills?intent=software" },
      { label: "Business", to: "/workshops/ai-for-business" },
      { label: "Design", to: "/courses?q=Design" },
      { label: "Marketing", to: "/courses?q=Marketing" },
    ],
  },
  {
    id: "exam",
    title: "Prepare for an exam",
    copy: "Named exam paths. Prep engines are not live yet.",
    items: EXAMS_NAV.items.map((item) => ({
      label: item.label,
      to: item.to,
      mark: MATURITY_LABEL.coming_soon,
    })),
  },
  {
    id: "study",
    title: "Study",
    copy: "Schooling and degrees as their own product universe.",
    items: ACADEMIC_LINES.filter((line) => line.id !== "exams").map((line) => ({
      label: line.label,
      to: line.to,
      mark: MATURITY_LABEL[line.maturity],
    })),
  },
  {
    id: "new",
    title: "Learn something new",
    copy: "Start from a skill, a course, or a short session.",
    items: [
      { label: "Skills", to: "/skills" },
      { label: "Courses", to: "/courses" },
      { label: "Workshops", to: "/workshops", mark: MATURITY_LABEL.coming_soon },
    ],
  },
]

function authoredWorkspace(slug: string) {
  const course = authoredCourseList().find((item) => item.slug === slug)
  if (!course) return null
  const profile = courseProductProfile(course.slug)
  const view = coursePublicView(course)
  const lessons = course.modules.flatMap((module) => module.lessons)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
  const capstone = lessons.find((lesson) => /capstone|product case/i.test(lesson.title))
  const quiz = getCourseQuiz(course.slug, firstQuiz?.id)
  const lessonMeta = firstLesson ? getLessonMeta(course.slug, firstLesson.id) : undefined
  const evidence = capstone ? getCareerEvidence(course.slug, capstone.id) : undefined
  return {
    slug: course.slug,
    title: course.title,
    href: `/courses/${course.slug}`,
    modules: course.modules.map((module) => module.title),
    path: course.modules.slice(0, 3).map((module, index) => ({
      id: module.id,
      title: module.title,
      state: index < 2 ? "done" : "now",
    })),
    lessonTitle: firstLesson?.title ?? "Open the first lesson",
    lessonObjective: lessonMeta?.objective ?? null,
    practiceTitle: firstQuiz?.title ?? "Practice",
    practicePrompt: quiz?.questions[0]?.prompt ?? null,
    workTitle: profile?.project?.note?.split(" — ")[0] ?? capstone?.title ?? "Capstone",
    workNote: profile?.project?.note ?? null,
    material: profile?.datasets[0]?.filename ?? null,
    visual: profile?.visual ?? "northwind",
    lessonCount: view.stats.lessonCount,
    quizCount: view.stats.quizCount,
    assignmentCount: view.stats.assignmentCount,
    evidenceTitle: evidence?.artifact ?? capstone?.title ?? "Work sample you keep",
  }
}

function HomeHero() {
  const analytics = authoredWorkspace(FLAGSHIP_COURSE_SLUG)
  const product = authoredWorkspace(PRODUCT_MANAGEMENT_SLUG)

  return (
    <section className="hp-hero" aria-labelledby="home-hero-heading">
      <div className="hp-rail hp-hero-board">
        <div className="hp-hero-copy">
          <p className="hp-kicker">Skylent</p>
          <h1 id="home-hero-heading">
            Learn something
            <br />
            <em>worth building.</em>
          </h1>
          <p className="hp-hero-lead">
            Courses, programmes, education and exam preparation — all in one place.
          </p>
          <div className="hp-actions">
            <Link className="hp-btn hp-btn-primary" to="/programs">Explore learning →</Link>
            <Link className="hp-btn hp-btn-ghost" to="/education/exams">Explore exams →</Link>
          </div>
        </div>

        <div className="hp-hero-stage">
          {analytics ? (
            <div className="hp-hero-main">
              <ProductFrame brand="Skylent OS" title="" meta={`Lesson 7 of ${analytics.lessonCount}`}>
                <div className="hp-os-mini">
                  <p className="hp-os-mini-course">{analytics.title}</p>
                  <ol className="hp-os-mini-path">
                    {analytics.path.map((module) => (
                      <li key={module.id} className={`is-${module.state}`}>
                        <span aria-hidden="true">{module.state === "done" ? "✓" : "→"}</span>
                        {module.title}
                      </li>
                    ))}
                  </ol>
                  <div className="hp-os-mini-work">
                    <p>Current work</p>
                    <strong>{analytics.workTitle}</strong>
                    <Link to={analytics.href}>Open workspace →</Link>
                  </div>
                </div>
              </ProductFrame>
            </div>
          ) : null}
          <div className="hp-hero-satellites">
            {product ? (
              <ProductFrame brand="Skylent OS" title="" meta="Harbor Desk" compact>
                <p className="hp-hero-case-kicker">Product Management</p>
                <p className="hp-hero-case-title">{product.workTitle}</p>
              </ProductFrame>
            ) : null}
            <ProductFrame brand="Career OS" title="" meta="Evidence" compact>
              <ul className="hp-hero-career">
                {CAREER_OS_IA.slice(0, 3).map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <b>{item.label === "Opportunities" ? "Empty until published" : item.sub}</b>
                  </li>
                ))}
              </ul>
            </ProductFrame>
          </div>
          <p className="hp-hero-note">
            Live product UI from Skylent OS and Career OS. Data Analytics and Product Management are the two authored windows — not the brand.
          </p>
        </div>
      </div>
    </section>
  )
}

function HomeGoals() {
  const [goal, setGoal] = useState<GoalId>("career")
  const current = GOALS.find((item) => item.id === goal) ?? GOALS[0]

  return (
    <section className="hp-section hp-goals" aria-labelledby="home-goals-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">Start here</p>
          <h2 id="home-goals-heading">What are you here to learn?</h2>
        </header>
        <div className="hp-goals-grid" role="radiogroup" aria-label="Learning goal">
          {GOALS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={goal === item.id}
              className={goal === item.id ? "hp-goal is-on" : "hp-goal"}
              onClick={() => setGoal(item.id)}
              onMouseEnter={() => setGoal(item.id)}
              onFocus={() => setGoal(item.id)}
            >
              <span className="hp-goal-title">{item.title}</span>
              <span className="hp-goal-copy">{item.copy}</span>
            </button>
          ))}
        </div>
        <div className="hp-goal-panel" role="region" aria-label={current.title}>
          {current.items.map((item) => (
            <Link key={item.label} className="hp-goal-chip" to={item.to}>
              <span>{item.label}</span>
              {item.mark ? <em>{item.mark}</em> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomeFeatured() {
  const items = FEATURED_SLUGS.map((slug) => courses.find((course) => course.slug === slug))
    .filter(Boolean)
    .map((course) => coursePublicView(course!))

  return (
    <section className="hp-section hp-discover" aria-labelledby="home-discover-heading">
      <div className="hp-rail">
        <header className="hp-head hp-head-row">
          <div>
            <p className="hp-kicker">Catalogue</p>
            <h2 id="home-discover-heading">Explore what's worth learning.</h2>
          </div>
          <Link className="hp-text-link" to="/courses">All courses →</Link>
        </header>
      </div>
      <div className="hp-discover-scroller">
        <ul className="hp-discover-rail">
          {items.map((view) => {
            const profile = courseProductProfile(view.slug)
            return (
              <li key={view.slug}>
                <Link className="hp-discover-card" to={`/courses/${view.slug}`}>
                  <div className="hp-discover-visual">
                    {view.showLiveCurriculum && profile ? (
                      <CourseThumb authored visual={profile.visual} />
                    ) : (
                      <CourseThumb authored={false} />
                    )}
                  </div>
                  <div className="hp-discover-copy">
                    <p className="hp-discover-type">
                      {view.maturity === "ready" ? "Course · ready" : "Course · listing"}
                    </p>
                    <h3>{view.title}</h3>
                    <p className="hp-discover-meta">
                      {view.duration}
                      {" · "}
                      {view.course.level}
                    </p>
                    <p className="hp-discover-desc">{view.summary}</p>
                    <span className="hp-discover-cta">{view.ctaLabel} →</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function HomeUniverse() {
  return (
    <section className="hp-section hp-universe" aria-labelledby="home-universe-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">The Skylent universe</p>
          <h2 id="home-universe-heading">Find your next direction.</h2>
        </header>
        <ul className="hp-universe-list">
          <li>
            <Link className="hp-universe-row" to="/programs">
              <span>Career</span>
              <b>Build skills for modern work.</b>
              <em>Live</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/education">
              <span>Education</span>
              <b>Schooling / Undergraduate / Postgraduate</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/education/exams">
              <span>Exams</span>
              <b>JEE / NEET / CAT / GATE / IIT JAM / UPSC / SSC</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/workshops">
              <span>Workshops</span>
              <b>Focused learning around specific skills and problems.</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

function HomeLoop() {
  const analytics = authoredWorkspace(FLAGSHIP_COURSE_SLUG)
  const product = authoredWorkspace(PRODUCT_MANAGEMENT_SLUG)
  const stages = [
    {
      id: "learn",
      title: "Learn",
      copy: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom.",
      detail: analytics?.lessonTitle ?? "Open a lesson",
    },
    {
      id: "practise",
      title: "Practise",
      copy: "Short checks after a block of lessons, then applied assignments on the course material.",
      detail: analytics?.practiceTitle ?? "Checks and assignments",
    },
    {
      id: "build",
      title: "Build",
      copy: "A named capstone produced against the course material — not a worked example.",
      detail: [analytics?.workTitle, product?.workTitle].filter(Boolean).join(" · "),
    },
    {
      id: "evidence",
      title: "Evidence",
      copy: "Keep the work sample. Carry it into Career OS yourself. Nothing is invented here.",
      detail: "Profile · projects · opportunities",
    },
  ] as const

  return (
    <section className="hp-section hp-loop" aria-labelledby="home-loop-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">How Skylent works</p>
          <h2 id="home-loop-heading">Learning is only the beginning.</h2>
        </header>
        <ol className="hp-loop-line">
          {stages.map((stage, index) => (
            <li key={stage.id}>
              <p className="hp-loop-index">{String(index + 1).padStart(2, "0")}</p>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <strong>{stage.detail}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function HomeOS() {
  const analytics = authoredWorkspace(FLAGSHIP_COURSE_SLUG)
  const [pane, setPane] = useState<"Learning" | "Practice" | "Projects" | "Evidence" | "Career">("Learning")
  if (!analytics) return null

  return (
    <section className="hp-section hp-os" aria-labelledby="home-os-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">The workspace</p>
          <h2 id="home-os-heading">Meet Skylent OS.</h2>
          <p className="hp-lead">The workspace where learning turns into work.</p>
        </header>
        <div className="hp-os-stage">
          <nav className="hp-os-nav" aria-label="Skylent OS stages">
            {(["Learning", "Practice", "Projects", "Evidence", "Career"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={pane === item ? "is-on" : undefined}
                aria-pressed={pane === item}
                onClick={() => setPane(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="hp-os-frame">
            {pane === "Learning" ? (
              <CourseWorkspacePreview
                courseTitle={analytics.title}
                lessonTitle={analytics.lessonTitle}
                practiceTitle={analytics.practiceTitle}
                workTitle={analytics.workTitle}
                modules={analytics.modules.slice(0, 5)}
                lessonCount={analytics.lessonCount}
                visual="northwind"
              />
            ) : null}
            {pane === "Practice" ? (
              <ProductFrame title="Practice" meta={`${analytics.quizCount} checks · ${analytics.assignmentCount} assignments`}>
                <div className="hp-os-panel">
                  <p className="hp-kicker">{analytics.practiceTitle}</p>
                  <p className="hp-os-panel-title">{analytics.practicePrompt ?? "Short checks after a block of lessons."}</p>
                  <p className="hp-fine">Quizzes and assignments live inside the course — not a separate practise app.</p>
                </div>
              </ProductFrame>
            ) : null}
            {pane === "Projects" ? (
              <ProductFrame title="Projects" meta="Named work you produce">
                <div className="hp-os-panel">
                  <p className="hp-kicker">Capstone</p>
                  <p className="hp-os-panel-title">{analytics.workTitle}</p>
                  {analytics.material ? <p className="hp-fine"><code>{analytics.material}</code></p> : null}
                  <p className="hp-fine">{analytics.workNote}</p>
                </div>
              </ProductFrame>
            ) : null}
            {pane === "Evidence" ? (
              <ProductFrame title="Evidence" meta="Nothing kept until you add it">
                <div className="hp-os-panel">
                  <p className="hp-kicker">Work sample</p>
                  <p className="hp-os-panel-title">{analytics.evidenceTitle}</p>
                  <p className="hp-fine">You add finished work to Career OS. Nothing is created automatically.</p>
                </div>
              </ProductFrame>
            ) : null}
            {pane === "Career" ? (
              <ProductFrame title="Career OS" meta="Workspace — not a job board">
                <ul className="hp-hero-career hp-os-career">
                  {CAREER_OS_IA.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <b>{item.label === "Opportunities" ? "Empty until partners publish roles" : item.sub}</b>
                    </li>
                  ))}
                </ul>
              </ProductFrame>
            ) : null}
          </div>
        </div>
        <p className="hp-fine hp-os-honesty">
          This is the Data Analytics workspace as it exists today. Product Management is the other authored course. Other catalogue listings open an outline.
        </p>
      </div>
    </section>
  )
}

function HomeWork() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-work" aria-labelledby="home-work-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">Work you produce</p>
          <h2 id="home-work-heading">Don't just finish a course.</h2>
          <p className="hp-display">Make something.</p>
        </header>
        <ul className="hp-work-pair">
          {programmes.map((programme) => (
            <li key={programme.slug}>
              <article className="hp-work-card">
                <p className="hp-kicker">{programme.courseTitle}</p>
                <h3>{programme.capstone ?? programme.title}</h3>
                <p>{programme.decisionLine}</p>
                <div className="hp-work-stage">
                  <CourseProductVisual visual={programme.visual} compact />
                </div>
                <p className="hp-fine">
                  Against <code>{programme.material}</code>
                </p>
                <Link className="hp-text-link" to={programme.href}>View this programme →</Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeProgrammes() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-progs" aria-labelledby="home-progs-heading">
      <div className="hp-rail">
        <header className="hp-head hp-head-row">
          <div>
            <p className="hp-kicker">Professional learning</p>
            <h2 id="home-progs-heading">Professional programmes.</h2>
            <p className="hp-lead">Structured learning for skills you can actually use.</p>
          </div>
          <Link className="hp-text-link" to="/programs">All programmes →</Link>
        </header>
        <ul className="hp-progs-list">
          {programmes.map((programme) => (
            <li key={programme.slug}>
              <article className="hp-prog">
                <div className="hp-prog-copy">
                  <p className="hp-discover-type">Programme · {programme.enrollOpen ? "enrolment open" : "listing"}</p>
                  <h3>{programme.title}</h3>
                  <p>{programme.decisionLine}</p>
                  <p className="hp-discover-meta">
                    {programme.level}
                    {" · "}
                    {programme.format}
                    {" · "}
                    {programme.taughtModules} taught modules · {programme.taughtLessons} lessons
                  </p>
                  {programme.capstone ? (
                    <p className="hp-prog-work">
                      You produce <strong>{programme.capstone}</strong>
                    </p>
                  ) : null}
                  <p className="hp-fine">{programme.honesty}</p>
                  <Link className="hp-btn hp-btn-primary" to={programme.href}>View programme →</Link>
                </div>
                <div className="hp-prog-visual">
                  <CourseProductVisual visual={programme.visual} compact />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeEducation() {
  return (
    <section className="hp-section hp-edu" aria-labelledby="home-edu-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">Education and exams</p>
          <h2 id="home-edu-heading">Whatever you're preparing for, start here.</h2>
        </header>
        <div className="hp-edu-grid">
          <article className="hp-edu-col">
            <h3>Education</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <ul>
              {ACADEMIC_LINES.filter((line) => line.id !== "exams").map((line) => (
                <li key={line.id}>
                  <Link to={line.to}>{line.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="hp-edu-col is-wide">
            <h3>Competitive exams</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <ul className="hp-edu-exams">
              {EXAMS_NAV.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="hp-edu-col">
            <h3>Workshops</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <p>Short focused sessions on a single skill. Planned subjects are listed; registration is not open.</p>
            <Link className="hp-text-link" to="/workshops">See workshops →</Link>
          </article>
        </div>
      </div>
    </section>
  )
}

function HomeCareer() {
  return (
    <section className="hp-section hp-career" aria-labelledby="home-career-heading">
      <div className="hp-rail hp-career-split">
        <div>
          <p className="hp-kicker">Career OS</p>
          <h2 id="home-career-heading">What you build stays with you.</h2>
          <p className="hp-lead">
            Learning produces an artefact. You keep it. Career OS is the workspace for that evidence — not a
            placement service, and not a job board until roles are published.
          </p>
          <Link className="hp-btn hp-btn-primary" to="/career-os">Open Career OS →</Link>
        </div>
        <ProductFrame title="Career OS" meta="Live workspace">
          <ol className="hp-career-ia">
            {CAREER_OS_IA.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>
                  <strong>{item.label}</strong>
                  <span>{item.label === "Opportunities" ? "Empty until partners publish roles" : item.sub}</span>
                </Link>
              </li>
            ))}
          </ol>
        </ProductFrame>
      </div>
    </section>
  )
}

function HomeSkills() {
  return (
    <section className="hp-section hp-skills" aria-labelledby="home-skills-heading">
      <div className="hp-rail">
        <header className="hp-head hp-head-row">
          <div>
            <p className="hp-kicker">Browse</p>
            <h2 id="home-skills-heading">Explore by skill.</h2>
          </div>
          <Link className="hp-text-link" to="/skills">All skills →</Link>
        </header>
        <ul className="hp-skill-type">
          {SKILL_LINKS.map((item) => (
            <li key={item.label}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeClose() {
  return (
    <section className="hp-close" aria-labelledby="home-close-heading">
      <div className="hp-rail">
        <h2 id="home-close-heading">
          Learn something.
          <br />
          Build something.
          <br />
          Become someone who can show it.
        </h2>
        <Link className="hp-btn hp-btn-primary hp-btn-lg" to="/programs">Explore Skylent →</Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <HomeHero />
        <HomeGoals />
        <HomeFeatured />
        <HomeUniverse />
        <HomeLoop />
        <HomeOS />
        <HomeWork />
        <HomeProgrammes />
        <HomeEducation />
        <HomeCareer />
        <HomeSkills />
        <HomeClose />
      </div>
    </PageShell>
  )
}
