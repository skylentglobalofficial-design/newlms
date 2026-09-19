import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseProductVisual, CourseThumb, ProductFrame } from "../components/product/ProductLanguage"
import { courseBySlug, coursePublicView } from "../lib/catalog-maturity"
import { authoredCourseList, courseProductProfile } from "../lib/course-product"
import { FLAGSHIP_COURSE_SLUG, isAuthoredCourse } from "../lib/authored-courses"
import { getCareerEvidence, getCourseQuiz } from "../content/course-lookups"
import { CAREER_OS_IA, MATURITY_LABEL } from "../lib/product-architecture"
import { programmeDiscoveryCards } from "../lib/programme-discovery"
import { NORTHWIND_PREVIEW as NW } from "../lib/northwind-preview"
import "./HomePage.css"

const HOME_DIRECTIONS = [
  {
    step: "01",
    id: "programs",
    title: "Professional Programs",
    copy: "Structured professional journeys built around work you can show afterwards.",
    to: "/programs",
    tone: "programs" as const,
    status: "live" as const,
    statusNote: "Two programmes authored end to end",
    context: ["LEARN", "PRACTISE", "BUILD", "EVIDENCE"],
  },
  {
    step: "02",
    id: "workshops",
    title: "Workshops",
    copy: "Short focused sessions on a single skill. Planned subjects are listed; registration is not open.",
    to: "/workshops",
    tone: "workshops" as const,
    status: "coming_soon" as const,
    statusNote: "Subjects planned, nothing scheduled",
    context: ["SESSION", "SKILL", "PRACTICE"],
  },
  {
    step: "03",
    id: "education",
    title: "Education",
    copy: "Schooling, undergraduate and postgraduate learning as its own product universe.",
    to: "/education",
    tone: "education" as const,
    status: "coming_soon" as const,
    statusNote: "Specified, not built",
    context: ["ACADEMIC", "FOUNDATIONS", "DEGREES"],
  },
  {
    step: "04",
    id: "exams",
    title: "Competitive Exams",
    copy: "Goal-first preparation for JEE, NEET, GATE, CAT, UPSC and SSC.",
    to: "/education/exams",
    tone: "exams" as const,
    status: "coming_soon" as const,
    statusNote: "Specified, not built",
    context: ["GOAL", "SYLLABUS", "PRACTICE", "TEST"],
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
 * The four public directions, shown together so they can be compared rather than
 * revealed one at a time. Each states whether it is open today: only Professional
 * Programs has authored teaching, so it carries the lead position and the others
 * stay deliberately quieter.
 */
function HomeDirections() {
  const [lead, ...rest] = HOME_DIRECTIONS
  const openProgrammes = programmeDiscoveryCards()

  return (
    <div className="hp-rail hp-dir">
      <header className="hp-dir-intro">
        <p className="hp-eyebrow">ONE PLATFORM. MULTIPLE PATHS.</p>
        <h2 id="home-paths-heading" className="hp-dir-title">Choose your direction.</h2>
        <p className="hp-dir-lead">
          Four directions, at different stages of being built. Each one says which, so you always know what
          you can start today.
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
          <span className="hp-dir-cta">Explore programmes &rarr;</span>
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

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Learn",
    copy: "Access structured content from experts.",
    labels: "CONCEPTS · GUIDANCE · CLARITY",
  },
  {
    step: "02",
    title: "Practise",
    copy: "Reinforce your skills with hands-on exercises.",
    labels: "EXERCISES · SIMULATIONS · FEEDBACK",
  },
  {
    step: "03",
    title: "Build",
    copy: "Work on real projects and create meaningful work.",
    labels: "PROJECTS · PORTFOLIO · SOLUTIONS",
  },
  {
    step: "04",
    title: "Evidence",
    copy: "Keep what you build and use it as proof of your skills.",
    labels: "EVIDENCE · PROFILE · OPPORTUNITIES",
  },
] as const

function HomeWorkflow() {
  const sectionRef = useRef<HTMLElement>(null)
  const profile = courseProductProfile(FLAGSHIP_COURSE_SLUG)
  const course = courseBySlug(FLAGSHIP_COURSE_SLUG)
  const view = course ? coursePublicView(course) : null

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-in")
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        section.classList.add("is-in")
        io.disconnect()
      })
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hp-section hp-workflow" aria-labelledby="home-workflow-heading" ref={sectionRef}>
      <div className="hp-rail">
        <header className="hp-workflow-intro">
          <p className="hp-eyebrow hp-workflow-eyebrow">HOW SKYLENT WORKS</p>
          <h2 id="home-workflow-heading" className="hp-workflow-title">
            From learning
            <span>to real outcomes.</span>
          </h2>
          <p className="hp-workflow-lead">
            A simple, structured journey. Learn from experts, practise with purpose, build real work, and keep evidence of what you can do.
          </p>
        </header>

        {profile ? (
          <div className="hp-workflow-visual">
            <CourseProductVisual visual={profile.visual} />
            {view ? (
              <p className="hp-workflow-caption">
                {view.title} · {NW.filename}
              </p>
            ) : null}
          </div>
        ) : null}

        <ol className="hp-workflow-path" aria-label="Learn, practise, build, evidence">
          {WORKFLOW_STEPS.map((stage) => (
            <li key={stage.step}>
              <p className="hp-workflow-num">{stage.step}</p>
              <h3>{stage.title}</h3>
              <p className="hp-workflow-copy-line">{stage.copy}</p>
              <p className="hp-workflow-labels">{stage.labels}</p>
            </li>
          ))}
        </ol>

        <div className="hp-workflow-close">
          <div className="hp-workflow-close-copy">
            <p className="hp-eyebrow hp-workflow-eyebrow">MORE THAN COURSES.</p>
            <p className="hp-workflow-close-title">A complete learning-to-career ecosystem.</p>
          </div>
          <Link className="hp-workflow-close-cta" to="/programs">Explore Skylent →</Link>
        </div>
      </div>
    </section>
  )
}

const HOME_CERTIFICATE_PROGRAMS = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics" },
  { programSlug: "product-management", courseSlug: "product-management" },
] as const

function homeCertificatePrograms() {
  return HOME_CERTIFICATE_PROGRAMS.flatMap((row) => {
    const course = courseBySlug(row.courseSlug)
    const profile = courseProductProfile(row.courseSlug)
    if (!course || !profile || !isAuthoredCourse(course.slug)) return []
    const view = coursePublicView(course)
    const capstone = course.modules
      .flatMap((module) => module.lessons)
      .some((lesson) => /capstone/i.test(lesson.title))
    return [{
      href: `/programs/${row.programSlug}`,
      title: course.title,
      work: course.desc,
      duration: view.duration,
      level: course.level,
      moduleCount: view.stats.moduleCount,
      lessonCount: view.stats.lessonCount,
      visual: profile.visual,
      practice: view.stats.quizCount > 0,
      project: Boolean(profile.project),
      evidence: capstone,
      projectNote: profile.project?.note ?? null,
    }]
  })
}

const HERO_VALUE_ITEMS = [
  "Industry-relevant curriculum",
  "Hands-on practice and projects",
  "Mentor support and guidance",
  "Career-focused learning",
] as const

const HERO_LMS_NAV = ["Learning", "Practice", "Projects", "Evidence", "Career"] as const
type HeroOsPane = (typeof HERO_LMS_NAV)[number]

function HeroOsIcon({ name }: { name: HeroOsPane }) {
  const s = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45 }
  if (name === "Learning") return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  if (name === "Practice") return <svg {...s}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
  if (name === "Projects") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  if (name === "Evidence") return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
  return <svg {...s}><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}

function heroFeaturedWorkspace() {
  const authored = authoredCourseList()
  const course = authored.find((item) => item.slug === FLAGSHIP_COURSE_SLUG) ?? authored[0] ?? null
  if (!course) return null
  const profile = courseProductProfile(course.slug)
  const view = coursePublicView(course)
  const lessons = course.modules.flatMap((module) => module.lessons)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
  const capstone = lessons.find((lesson) => /capstone|product case/i.test(lesson.title))
  const quiz = getCourseQuiz(course.slug, firstQuiz?.id)
  const evidence = capstone ? getCareerEvidence(course.slug, capstone.id) : undefined
  const visual = profile?.visual === "harbor-desk" ? "harbor-desk" as const : "northwind" as const
  const courseHref = `/courses/${course.slug}`
  return {
    title: course.title,
    lessonTitle: firstLesson?.title ?? "Open the first lesson",
    lessonCount: view.stats.lessonCount,
    quizCount: view.stats.quizCount,
    visual,
    courseHref,
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
      title: capstone?.title ?? profile?.project?.note?.split(" — ")[0] ?? "Capstone",
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

function heroOsMeta(pane: HeroOsPane, workspace: NonNullable<ReturnType<typeof heroFeaturedWorkspace>>) {
  if (pane === "Practice") return `${workspace.quizCount} checks · not started`
  if (pane === "Projects") return workspace.project.status
  if (pane === "Evidence") return "Nothing kept yet"
  if (pane === "Career") return "Profile · evidence · opportunities"
  return `${workspace.lessonCount} lessons · not started`
}

function HeroReviewSheet() {
  return (
    <div className="hp-hero-report" aria-hidden="true">
      <p>Commercial review</p>
      <strong>{NW.filename}</strong>
      <ul>
        <li><span>Window</span>{NW.window}</li>
        <li><span>Valid rows</span>{String(NW.validRows)}</li>
        <li><span>Net revenue</span>{NW.netRevenueLabel}</li>
        <li><span>Lead</span>{NW.topCategory}</li>
      </ul>
    </div>
  )
}

function HomeHeroProduct() {
  const workspace = heroFeaturedWorkspace()
  const [pane, setPane] = useState<HeroOsPane>("Learning")

  if (!workspace) {
    return (
      <div className="hp-hero-visual">
        <div className="hp-hero-lms">
          <CourseThumb authored={false} />
        </div>
      </div>
    )
  }

  const next = pane === "Learning"
    ? { kicker: "Next", title: workspace.practice.title, pane: "Practice" as const }
    : pane === "Practice"
      ? { kicker: "Next", title: workspace.project.title, pane: "Projects" as const }
      : pane === "Projects"
        ? { kicker: "Next", title: "Keep this as evidence", pane: "Evidence" as const }
        : pane === "Evidence"
          ? { kicker: "Next", title: "Career OS", pane: "Career" as const }
          : { kicker: "Path", title: "Back to learning", pane: "Learning" as const }

  return (
    <div className="hp-hero-visual">
      <div className="hp-hero-lms">
        <ProductFrame title={pane === "Career" ? "Career OS" : workspace.title} meta={heroOsMeta(pane, workspace)}>
          <div className="hp-hero-os">
            <nav className="hp-hero-lms-rail" role="tablist" aria-label="Skylent OS preview">
              {HERO_LMS_NAV.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  id={`hero-os-tab-${item}`}
                  aria-selected={pane === item}
                  aria-controls="hero-os-panel"
                  className={pane === item ? "is-on" : undefined}
                  onClick={() => setPane(item)}
                >
                  <HeroOsIcon name={item} />
                  {item}
                </button>
              ))}
            </nav>
            <div className="hp-hero-lms-stage">
              <div
                key={pane}
                className="hp-hero-pane"
                role="tabpanel"
                id="hero-os-panel"
                aria-labelledby={`hero-os-tab-${pane}`}
              >
                {pane === "Learning" ? (
                  <article className="hp-hero-workspace">
                    <div className="hp-hero-media">
                      <CourseProductVisual visual={workspace.visual} compact />
                    </div>
                    <div className="hp-hero-caption">
                      <div>
                        <p className="hp-hero-workspace-title">{workspace.title}</p>
                        <p>{workspace.lessonTitle}</p>
                        <p className="hp-hero-meta">{workspace.lessonCount} lessons · not started</p>
                      </div>
                      <Link className="hp-hero-os-cta" to={workspace.courseHref}>Start learning →</Link>
                    </div>
                  </article>
                ) : null}
                {pane === "Practice" ? (
                  <article className="hp-hero-workspace is-practice">
                    <div className="hp-hero-caption">
                      <div>
                        <p className="hp-hero-workspace-title">{workspace.practice.title}</p>
                        <p className="hp-hero-meta">1 of {workspace.practice.questionCount} · not started</p>
                      </div>
                    </div>
                    {workspace.practice.prompt ? (
                      <div className="hp-hero-exercise">
                        <p className="hp-hero-exercise-q">{workspace.practice.prompt}</p>
                        {workspace.practice.options.length > 0 ? (
                          <ol className="hp-hero-choices" aria-hidden="true">
                            {workspace.practice.options.map((option, index) => (
                              <li key={option}>
                                <span>{String.fromCharCode(65 + index)}</span>
                                {option}
                              </li>
                            ))}
                          </ol>
                        ) : null}
                      </div>
                    ) : null}
                    <Link className="hp-hero-os-cta" to={workspace.practice.href}>Continue practice →</Link>
                  </article>
                ) : null}
                {pane === "Projects" ? (
                  <article className="hp-hero-workspace">
                    <div className="hp-hero-media is-report">
                      {workspace.visual === "northwind" ? (
                        <HeroReviewSheet />
                      ) : (
                        <CourseProductVisual visual={workspace.visual} compact />
                      )}
                    </div>
                    <div className="hp-hero-caption">
                      <div>
                        <p className="hp-hero-workspace-title">{workspace.project.title}</p>
                        <p className="hp-hero-purpose">{workspace.project.note}</p>
                        <p className="hp-hero-meta">{workspace.project.status}</p>
                      </div>
                      <Link className="hp-hero-os-cta" to={workspace.project.href}>View project →</Link>
                    </div>
                  </article>
                ) : null}
                {pane === "Evidence" ? (
                  <article className="hp-hero-workspace is-keep">
                    <div className="hp-hero-folio">
                      <p>Work sample</p>
                      <p className="hp-hero-workspace-title">{workspace.project.title}</p>
                      <ul>
                        {workspace.evidence.title.split(/\s+\+\s+/).map((part) => (
                          <li key={part}>{part.charAt(0).toUpperCase() + part.slice(1)}</li>
                        ))}
                      </ul>
                      <p className="hp-hero-meta">Capstone · not kept yet</p>
                    </div>
                    <Link className="hp-hero-os-cta" to={workspace.evidence.href}>View evidence →</Link>
                  </article>
                ) : null}
                {pane === "Career" ? (
                  <article className="hp-hero-workspace is-career">
                    <p className="pl-kicker">Career profile</p>
                    <ul className="hp-hero-career-line">
                      <li>
                        <span>Skills</span>
                        <b>{workspace.career.skill}</b>
                      </li>
                      <li>
                        <span>Projects</span>
                        <b>{workspace.project.title}</b>
                      </li>
                      <li>
                        <span>Evidence</span>
                        <b>Not kept yet</b>
                      </li>
                      <li>
                        <span>Opportunities</span>
                        <b>{workspace.career.opportunity}</b>
                      </li>
                    </ul>
                    <Link className="hp-hero-os-cta" to={workspace.career.href}>Open Career OS →</Link>
                  </article>
                ) : null}
              </div>
              <aside className="hp-hero-next">
                <p className="pl-kicker">{next.kicker}</p>
                <p>{next.title}</p>
                <button type="button" className="hp-hero-next-go" onClick={() => setPane(next.pane)}>
                  Open {next.pane}
                </button>
              </aside>
            </div>
          </div>
        </ProductFrame>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero" aria-labelledby="home-hero-heading">
          <div className="hp-rail">
            <div className="hp-hero-grid">
              <div className="hp-hero-copy">
                <p className="hp-eyebrow hp-hero-eyebrow">LEARN · PRACTISE · BUILD · EVIDENCE</p>
                <h1 id="home-hero-heading">
                  Build skills
                  <br />
                  that take you
                  <br />
                  <span className="hp-hero-further">further</span>
                  <span className="hp-hero-further-dot">.</span>
                </h1>
                <p className="hp-hero-lead">
                  Structured programs, hands-on practice, real projects
                  <br className="hp-hero-lead-br" />
                  {" "}and career support — all in one place.
                </p>
                <div className="hp-actions">
                  <Link className="hp-btn hp-btn-primary" to="/programs">Explore Programs →</Link>
                  <button type="button" className="hp-btn hp-btn-ghost hp-btn-video">
                    <span className="hp-btn-play" aria-hidden="true" />
                    Watch Video
                  </button>
                </div>
              </div>
              <div className="hp-hero-stage">
                <HomeHeroProduct />
              </div>
            </div>
            <ul className="hp-hero-values" aria-label="Platform highlights">
              {HERO_VALUE_ITEMS.map((label, index) => (
                <li key={label}>
                  <span className="hp-hero-values-num">{String(index + 1).padStart(2, "0")}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hp-section hp-choose" aria-labelledby="home-paths-heading">
          <HomeDirections />
        </section>

        <section className="hp-section hp-programs" aria-labelledby="home-programs-heading">
          <div className="hp-rail">
            <p className="hp-eyebrow">PROFESSIONAL CERTIFICATE PROGRAMS</p>
            <h2 id="home-programs-heading" className="hp-h2">
              Build practical capability through structured learning, practice and real work.
            </h2>
            <p className="hp-lead">
              A Skylent Professional Certificate Program is a pathway in Skylent OS: written lessons, practice, and a piece of work you keep. It is not a single course tile, and it is not a catalogue of unrelated classes.
            </p>
            <ul className="hp-pcp-list">
              {homeCertificatePrograms().map((program) => (
                <li key={program.href}>
                  <article className="hp-pcp">
                    <div className="hp-pcp-body">
                      <p className="hp-pcp-label">Professional Certificate</p>
                      <h3>{program.title}</h3>
                      <dl className="hp-pcp-facts">
                        <div>
                          <dt>Duration</dt>
                          <dd>{program.duration}</dd>
                        </div>
                        <div>
                          <dt>Level</dt>
                          <dd>{program.level}</dd>
                        </div>
                        <div>
                          <dt>Modules</dt>
                          <dd>{program.moduleCount}</dd>
                        </div>
                        <div>
                          <dt>Lessons</dt>
                          <dd>{program.lessonCount}</dd>
                        </div>
                      </dl>
                      <p className="hp-pcp-work">{program.work}</p>
                      {program.projectNote ? <p className="hp-pcp-project">{program.projectNote}</p> : null}
                      <ul className="hp-pcp-marks">
                        <li className={program.practice ? "is-on" : undefined}>Practice</li>
                        <li className={program.project ? "is-on" : undefined}>Project</li>
                        <li className={program.evidence ? "is-on" : undefined}>Evidence</li>
                      </ul>
                      <Link className="hp-btn hp-btn-primary" to={program.href}>View Program</Link>
                    </div>
                    <div className="hp-pcp-visual">
                      <p className="hp-preview-caption">Work you produce in this program</p>
                      <CourseProductVisual visual={program.visual} compact />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            <p className="hp-honesty">
              Only these two Professional Certificate Programs have authored teaching today. Enrolment opens the linked course in Skylent OS — it does not create a separate classroom. Other programme listings are not shown here because they are not teachable yet.
            </p>
          </div>
        </section>

        <HomeWorkflow />
      </div>
    </PageShell>
  )
}
