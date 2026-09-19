import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseProductVisual, CourseThumb, ProductFrame } from "../components/product/ProductLanguage"
import { coursePublicView } from "../lib/catalog-maturity"
import { authoredCourseList, courseProductProfile } from "../lib/course-product"
import { FLAGSHIP_COURSE_SLUG } from "../lib/authored-courses"
import { getCareerEvidence, getCourseQuiz, getLessonMeta } from "../content/course-lookups"
import { CAREER_OS_IA, MATURITY_LABEL } from "../lib/product-architecture"
import { programmeDiscoveryCards } from "../lib/programme-discovery"
import "./HomePage.css"

const HOME_DIRECTIONS = [
  {
    step: "01",
    id: "programs",
    title: "Professional Skills",
    copy: "The live core. Authored programmes in Skylent OS, built around work you keep.",
    to: "/programs",
    tone: "programs" as const,
    status: "live" as const,
    context: ["LEARN", "PRACTISE", "BUILD", "EVIDENCE"],
  },
  {
    step: "02",
    id: "education",
    title: "Education",
    copy: "Schooling, undergraduate and postgraduate learning as its own product universe.",
    to: "/education",
    tone: "education" as const,
    status: "coming_soon" as const,
    context: ["ACADEMIC", "FOUNDATIONS", "DEGREES"],
  },
  {
    step: "03",
    id: "exams",
    title: "Competitive Exams",
    copy: "Goal-first preparation for JEE, NEET, GATE, CAT, UPSC and SSC.",
    to: "/education/exams",
    tone: "exams" as const,
    status: "coming_soon" as const,
    context: ["GOAL", "SYLLABUS", "PRACTICE", "TEST"],
  },
  {
    step: "04",
    id: "workshops",
    title: "Workshops",
    copy: "Short focused sessions on a single skill. Planned subjects are listed; registration is not open.",
    to: "/workshops",
    tone: "workshops" as const,
    status: "coming_soon" as const,
    context: ["SESSION", "SKILL", "PRACTICE"],
  },
] as const

function PathLivingMotif({ id }: { id: (typeof HOME_DIRECTIONS)[number]["id"] }) {
  return (
    <svg className={`hp-dir-motif is-${id}`} viewBox="0 0 168 168" fill="none" aria-hidden="true">
      {id === "programs" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M40 118h68" />
          <path d="M108 118v24" />
          <path d="M40 142h68" />
          <path d="M54 82h68" />
          <path d="M122 82v24" />
          <path d="M54 106h68" />
          <path d="M68 46h68" />
          <path d="M136 46v24" />
          <path d="M68 70h68" />
        </g>
      ) : null}
      {id === "workshops" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M36 60h96" />
          <path d="M36 60v72" />
          <path d="M132 60v72" />
          <path d="M36 132h96" />
          <path d="M60 96h48" />
          <path d="M84 42v18" />
        </g>
      ) : null}
      {id === "education" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M42 136V48" />
          <path d="M70 136V62" />
          <path d="M98 128V48" />
          <path d="M42 136h48" />
          <path d="M42 90h44" />
          <path d="M50 48h36" />
        </g>
      ) : null}
      {id === "exams" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M84 40a44 44 0 0 1 44 44" />
          <path d="M128 84a44 44 0 0 1-36 43" />
          <path d="M84 62a22 22 0 0 1 22 22" />
          <path d="M84 28v10" />
          <path d="M134 84h10" />
        </g>
      ) : null}
    </svg>
  )
}

/**
 * Four product universes. Professional Skills is the only authored entry today;
 * the others stay quieter so the visitor can see where they would enter later.
 */
function HomeDirections() {
  const [lead, ...rest] = HOME_DIRECTIONS
  const openProgrammes = programmeDiscoveryCards()

  return (
    <div className="hp-rail hp-dir">
      <header className="hp-dir-intro">
        <p className="hp-eyebrow">WHERE YOU ENTER</p>
        <h2 id="home-paths-heading" className="hp-dir-title">Choose your direction.</h2>
        <p className="hp-dir-lead">
          Skylent is one learning environment. You pick a universe. Only Professional Skills is teachable today.
        </p>
      </header>

      <div className="hp-dir-grid">
        <Link className={`hp-dir-lead-card is-${lead.tone}`} to={lead.to}>
          <div className="hp-dir-lead-head">
            <div>
              <p className="hp-dir-step">{lead.step}</p>
              <h3>{lead.title}</h3>
            </div>
            <span className="hp-dir-flag is-live">{MATURITY_LABEL.live}</span>
          </div>
          <p className="hp-dir-lead-text">{lead.copy}</p>
          <p className="hp-dir-context">
            {lead.context.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </p>
          <ul className="hp-dir-open">
            {openProgrammes.map((programme) => (
              <li key={programme.slug}>
                <span className="hp-dir-open-head">
                  <strong>{programme.title}</strong>
                  <span className="hp-dir-open-count">
                    {programme.taughtModules} modules &middot; {programme.taughtLessons} lessons
                  </span>
                </span>
                {programme.capstone ? (
                  <span className="hp-dir-open-work">
                    <em>You produce</em>
                    {programme.capstone}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <span className="hp-dir-cta">Enter this universe &rarr;</span>
        </Link>

        <ul className="hp-dir-rest">
          {rest.map((direction) => (
            <li key={direction.id}>
              <Link className={`hp-dir-card is-${direction.tone}`} to={direction.to}>
                <p className="hp-dir-step">{direction.step}</p>
                <h3>{direction.title}</h3>
                <p>{direction.copy}</p>
                <span className="hp-dir-flag is-soon">{MATURITY_LABEL[direction.status]}</span>
                <PathLivingMotif id={direction.id} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function HomeWork() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-work" aria-labelledby="home-work-heading">
      <div className="hp-rail">
        <header className="hp-work-intro">
          <p className="hp-eyebrow">WHAT YOU WORK ON</p>
          <h2 id="home-work-heading" className="hp-h2">Real work from two programmes.</h2>
          <p className="hp-lead">
            Same learning system. Different material. Data Analytics is not the brand — it is one window.
          </p>
        </header>

        <ul className="hp-work-windows">
          {programmes.map((programme, index) => (
            <li key={programme.slug} className={index % 2 ? "is-flip" : undefined}>
              <article className="hp-window">
                <div className="hp-window-meta">
                  <p className="hp-window-kicker">Programme</p>
                  <h3>{programme.title}</h3>
                  <p className="hp-window-decision">{programme.decisionLine}</p>
                  <p className="hp-window-how">
                    How you learn · written lessons, checks, then a named capstone in Skylent OS.
                  </p>
                  <p className="hp-window-path">
                    {programme.taughtModules} modules · {programme.taughtLessons} lessons · self-paced
                  </p>
                  <Link className="hp-window-link" to={programme.href}>
                    View this programme →
                  </Link>
                </div>
                <div className="hp-window-stage">
                  <p className="hp-window-caption">You work on</p>
                  <CourseProductVisual visual={programme.visual} compact />
                  {programme.capstone ? (
                    <p className="hp-window-keep">
                      <span>You produce</span>
                      <strong>{programme.capstone}</strong>
                      <em>
                        against <code>{programme.material}</code>
                      </em>
                    </p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="hp-honesty">
          Only these two programmes have authored teaching today. Enrolment opens the linked course in Skylent OS
          — it does not create a separate classroom.
        </p>
      </div>
    </section>
  )
}

const LOOP_STEPS = [
  {
    id: "learn",
    step: "01",
    title: "Learn",
    copy: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom.",
  },
  {
    id: "practise",
    step: "02",
    title: "Practise",
    copy: "Short checks after a block of lessons, then applied assignments on the course material.",
  },
  {
    id: "build",
    step: "03",
    title: "Build",
    copy: "A named capstone produced against the course material, not a worked example.",
  },
  {
    id: "evidence",
    step: "04",
    title: "Evidence",
    copy: "Keep the work sample. Carry it into Career OS yourself. Nothing is invented here.",
  },
] as const

type LoopId = (typeof LOOP_STEPS)[number]["id"]

function HomeLoop() {
  const workspace = heroFeaturedWorkspace()
  const programmes = programmeDiscoveryCards()
  const [active, setActive] = useState<LoopId>("learn")
  const current = LOOP_STEPS.find((step) => step.id === active) ?? LOOP_STEPS[0]

  return (
    <section id="home-loop" className="hp-section hp-loop" aria-labelledby="home-loop-heading">
      <div className="hp-rail">
        <header className="hp-loop-intro">
          <p className="hp-eyebrow">HOW LEARNING HAPPENS HERE</p>
          <h2 id="home-loop-heading" className="hp-h2">Learn. Practise. Build. Keep.</h2>
          <p className="hp-lead">
            The loop is the product. You move through one workspace — not a gallery of dashboards.
          </p>
        </header>

        <div className="hp-loop-stage">
          <ol className="hp-loop-path" aria-label="Learn, practise, build, evidence">
            {LOOP_STEPS.map((stage) => (
              <li key={stage.id}>
                <button
                  type="button"
                  className={active === stage.id ? "is-on" : undefined}
                  aria-pressed={active === stage.id}
                  onClick={() => setActive(stage.id)}
                >
                  <span>{stage.step}</span>
                  {stage.title}
                </button>
              </li>
            ))}
          </ol>

          <div className="hp-loop-panel" role="region" aria-label={current.title}>
            <p className="hp-loop-kicker">{current.step} · {current.title}</p>
            <p className="hp-loop-copy">{current.copy}</p>

            {active === "learn" && workspace ? (
              <div className="hp-loop-fragment is-learn">
                <p className="pl-kicker">{workspace.moduleTitle}</p>
                <p className="hp-loop-fragment-title">{workspace.lessonTitle}</p>
                {workspace.lessonObjective ? <p>{workspace.lessonObjective}</p> : null}
              </div>
            ) : null}

            {active === "practise" && workspace?.practice.prompt ? (
              <div className="hp-loop-fragment is-practise">
                <p className="pl-kicker">{workspace.practice.title}</p>
                <p className="hp-loop-fragment-title">{workspace.practice.prompt}</p>
                {workspace.practice.options.length > 0 ? (
                  <ol className="hp-loop-choices" aria-hidden="true">
                    {workspace.practice.options.slice(0, 3).map((option, index) => (
                      <li key={option}>
                        <span>{String.fromCharCode(65 + index)}</span>
                        {option}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ) : null}

            {active === "build" ? (
              <div className="hp-loop-fragment is-build">
                <p className="pl-kicker">Named work</p>
                <ul>
                  {programmes.map((programme) =>
                    programme.capstone ? (
                      <li key={programme.slug}>
                        <strong>{programme.capstone}</strong>
                        <span>
                          {programme.title} · <code>{programme.material}</code>
                        </span>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ) : null}

            {active === "evidence" ? (
              <div className="hp-loop-fragment is-evidence">
                <p className="pl-kicker">What you keep</p>
                <p className="hp-loop-fragment-title">The artefact stays in your workspace.</p>
                <p>
                  You add it to Career OS as a work sample attached to your profile. A certificate is not issued
                  in this pilot.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeCareer() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-career" aria-labelledby="home-career-heading">
      <div className="hp-rail hp-career-split">
        <div className="hp-career-copy">
          <p className="hp-eyebrow">WHERE THE WORK GOES</p>
          <h2 id="home-career-heading" className="hp-h2">The work does not disappear.</h2>
          <p className="hp-lead">
            Learning produces an artefact. You keep it. Career OS is the workspace for that evidence — not a
            placement service, and not a job board until roles are published.
          </p>
          <ol className="hp-career-chain" aria-label="From learning to career activity">
            <li>
              <span>01</span>
              Learning
            </li>
            <li>
              <span>02</span>
              Project
            </li>
            <li>
              <span>03</span>
              Evidence
            </li>
            <li>
              <span>04</span>
              Career activity
            </li>
          </ol>
          <Link className="hp-btn hp-btn-primary" to="/career-os">Open Career OS →</Link>
        </div>
        <div className="hp-career-keep">
          <p className="hp-career-keep-label">Work you can keep today</p>
          <ul>
            {programmes.map((programme) =>
              programme.capstone ? (
                <li key={programme.slug}>
                  <strong>{programme.capstone}</strong>
                  <span>
                    from {programme.title} · <code>{programme.material}</code>
                  </span>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

function heroFeaturedWorkspace() {
  const authored = authoredCourseList()
  const course = authored.find((item) => item.slug === FLAGSHIP_COURSE_SLUG) ?? authored[0] ?? null
  if (!course) return null
  const profile = courseProductProfile(course.slug)
  const view = coursePublicView(course)
  const lessons = course.modules.flatMap((module) => module.lessons)
  const firstModule = course.modules[0]
  const firstLesson = firstModule?.lessons[0]
  const lessonMeta = firstLesson ? getLessonMeta(course.slug, firstLesson.id) : undefined
  const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
  const capstone = lessons.find((lesson) => /capstone|product case/i.test(lesson.title))
  const sqlModuleIndex = course.modules.findIndex((module) => /sql/i.test(module.title))
  const currentModuleIndex = sqlModuleIndex >= 0 ? sqlModuleIndex : Math.min(2, Math.max(0, course.modules.length - 1))
  const lessonsBeforeCurrent = course.modules
    .slice(0, currentModuleIndex)
    .reduce((count, module) => count + module.lessons.length, 0)
  const path = course.modules.slice(0, 3).map((module, index) => ({
    id: module.id,
    title: module.title,
    state: index < currentModuleIndex ? "done" : index === currentModuleIndex ? "now" : "ahead",
  }))
  const quiz = getCourseQuiz(course.slug, firstQuiz?.id)
  const evidence = capstone ? getCareerEvidence(course.slug, capstone.id) : undefined
  const courseHref = `/courses/${course.slug}`
  return {
    title: course.title,
    moduleTitle: firstModule?.title ?? "Module 01",
    path,
    progressLabel: `Lesson ${lessonsBeforeCurrent + 1} of ${view.stats.lessonCount}`,
    curriculum: (firstModule?.lessons ?? []).slice(0, 4).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      kind: lesson.type,
    })),
    lessonTitle: firstLesson?.title ?? "Open the first lesson",
    lessonObjective: lessonMeta?.objective ?? null,
    lessonWhy: lessonMeta?.whyItMatters ?? null,
    lessonCount: view.stats.lessonCount,
    quizCount: view.stats.quizCount,
    courseHref,
    material: profile?.datasets[0]?.filename ?? null,
    practice: {
      title: firstQuiz?.title ?? profile?.learningSteps[1]?.label ?? "Practice",
      intro: profile?.practiceIntro ?? "Short checks after a block of lessons.",
      duration: firstQuiz?.duration ?? null,
      questionCount: quiz?.questions.length ?? view.stats.quizCount,
      prompt: quiz?.questions[0]?.prompt ?? null,
      options: (quiz?.questions[0]?.options ?? []).slice(0, 4),
      href: courseHref,
    },
    project: {
      title: profile?.project?.note?.split(" — ")[0] ?? capstone?.title ?? "Capstone",
      note: profile?.project?.note ?? profile?.learningSteps.find((step) => step.label === "Capstone")?.detail ?? "Work you produce in this course.",
      href: profile?.project?.href ?? courseHref,
      status: "Capstone · not started",
    },
    evidence: {
      title: evidence?.artifact ?? capstone?.title ?? "Work sample you keep",
      skill: evidence?.skill ?? null,
      copy: evidence?.evidence ?? "Carry evidence into Career OS yourself. Nothing is invented here.",
      href: "/career-os/projects",
    },
    career: {
      href: "/career-os",
      skill: view.outcomes[0] ?? CAREER_OS_IA[1].sub,
      opportunity: "When roles are published",
    },
  }
}

function HomeHeroProduct() {
  const workspace = heroFeaturedWorkspace()

  if (!workspace) {
    return (
      <div className="hp-hero-visual">
        <div className="hp-hero-lms">
          <CourseThumb authored={false} />
        </div>
      </div>
    )
  }

  return (
    <div className="hp-hero-visual">
      <div className="hp-hero-lms">
        <ProductFrame title="" meta={workspace.progressLabel}>
          <div className="hp-hero-os" aria-label="Skylent OS specimen">
            <p className="hp-hero-os-course">{workspace.title}</p>
            <ol className="hp-hero-path" aria-label="Programme modules">
              {workspace.path.map((module) => (
                <li
                  key={module.id}
                  className={`is-${module.state}`}
                  aria-current={module.state === "now" ? "step" : undefined}
                >
                  <span aria-hidden="true">{module.state === "done" ? "✓" : module.state === "now" ? "→" : "○"}</span>
                  {module.title}
                </li>
              ))}
            </ol>
            <div className="hp-hero-work">
              <p className="hp-hero-work-label">Current work</p>
              <p className="hp-hero-work-title">{workspace.project.title}</p>
              <Link className="hp-hero-os-cta" to={workspace.courseHref}>Open workspace →</Link>
            </div>
          </div>
        </ProductFrame>
      </div>
      <p className="hp-hero-specimen">
        A specimen from Data Analytics — one authored programme in Skylent OS, not the brand. Product Management
        is the other.
      </p>
    </div>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero" aria-labelledby="home-hero-heading">
          <div className="hp-rail hp-hero-board">
            <div className="hp-hero-copy">
              <p className="hp-eyebrow hp-hero-eyebrow">Learning that becomes work</p>
              <h1 id="home-hero-heading">
                Learn skills.
                <br />
                Build real work.
                <br />
                <em>Keep the evidence.</em>
              </h1>
              <p className="hp-hero-lead">
                Skylent brings learning, practice, projects and career evidence into one connected workspace.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/programs">Explore programs →</Link>
                <Link className="hp-btn hp-btn-ghost" to="/#home-loop">See how Skylent works</Link>
              </div>
            </div>
            <HomeHeroProduct />
          </div>
        </section>

        <section className="hp-section hp-choose" aria-labelledby="home-paths-heading">
          <HomeDirections />
        </section>

        <HomeLoop />
        <HomeWork />
        <HomeCareer />
      </div>
    </PageShell>
  )
}
