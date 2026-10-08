import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { useAuth, type UserRole } from "../../context/AuthContext"
import { DEGREE_ROUTES, DEGREE_SAMPLE_NOTE, degreeLevelLabel } from "../../data/education"
import { degreeImage } from "../../data/educationImages"
import { useLivePrograms, type LiveProgram } from "../../hooks/useLivePrograms"
import heroStudent from "../../assets/site/hero-student.jpg"
import heroClassroom from "../../assets/site/hero-classroom.jpg"
import programAnalytics from "../../assets/site/program-analytics.jpg"
import programProduct from "../../assets/site/program-product.jpg"
import programAi from "../../assets/site/program-ai.jpg"
import programWeb from "../../assets/site/program-web.jpg"
import programLibrary from "../../assets/site/program-library.jpg"
import studentHome from "../../assets/product/U01_student_home.webp"
import myCourses from "../../assets/product/U02_my_courses.webp"
import learningPlayer from "../../assets/product/U03_learning_player.webp"
import careerEvidence from "../../assets/product/U07_career_evidence.webp"
import "./PublicHome.css"

const STAGES = [
  { title: "Discover", body: "Compare programmes and degree routes, or use Find My Path." },
  { title: "Learn", body: "Study published modules and lessons in order." },
  { title: "Practice", body: "Quizzes and tasks inside each course." },
  { title: "Build", body: "Applied work where the curriculum includes it." },
  { title: "Prove", body: "Certificates with an ID anyone can check." },
  { title: "Grow", body: "Carry your record into Career OS." },
] as const

const CAREER_STATUS = [
  { title: "Career profile", body: "One profile that carries your enrolled learning and completed work.", status: "Live" },
  { title: "Verifiable certificates", body: "Certificates issued on completion, each checkable by ID.", status: "Live" },
  { title: "Projects and evidence", body: "Applied work collected next to your learning record.", status: "In development" },
  { title: "Openings board", body: "Opportunities will appear here once published. None are listed yet.", status: "Coming soon" },
] as const

const SCREENS = [
  {
    src: studentHome,
    alt: "Skylent Student Home showing Continue learning with course progress and a Resume program button",
    label: "Student Home",
    note: "Continue learning and see what comes next.",
  },
  {
    src: myCourses,
    alt: "Skylent My Courses page listing enrolled programs with their progress",
    label: "My Courses",
    note: "Every enrolled programme with its progress.",
  },
  {
    src: learningPlayer,
    alt: "The Skylent OS learning player with module curriculum, lessons and quizzes",
    label: "Learning player",
    note: "Structured lessons, practice and progress.",
  },
  {
    src: careerEvidence,
    alt: "Career OS evidence panels: what I completed, what I built and what I can show",
    label: "Career OS",
    note: "Turn completed learning into a record.",
  },
] as const

const PROGRAM_IMAGES: { test: RegExp; src: string; alt: string }[] = [
  { test: /data|analytics/i, src: programAnalytics, alt: "Analytics charts on paper beside a laptop" },
  { test: /web|stack|full/i, src: programWeb, alt: "A developer writing code across several screens" },
  { test: /ai|machine|prompt|gen/i, src: programAi, alt: "A researcher working at monitors in a technology lab" },
  { test: /product|mba|business/i, src: programProduct, alt: "A product team working around a shared table" },
]

function programImage(slug: string) {
  return PROGRAM_IMAGES.find((item) => item.test.test(slug)) ?? {
    src: programLibrary,
    alt: "A learner studying in a library",
  }
}

function dashboardPath(role: UserRole | undefined) {
  switch (role) {
    case "faculty":
      return "/dashboard/faculty"
    case "organisation":
      return "/dashboard/organisation"
    case "recruiter":
      return "/dashboard/recruiter"
    case "superadmin":
      return "/dashboard/admin"
    default:
      return "/dashboard/student"
  }
}

function Arrow() {
  return (
    <svg className="ph-arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StageIcon({ index }: { index: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  const marks = [
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" {...common} />
      <path d="M22 10v6" {...common} />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" {...common} />
    </>,
    <>
      <path d="M12 7v14" {...common} />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" {...common} />
    </>,
    <>
      <path d="m3 17 2 2 4-4" {...common} />
      <path d="m3 7 2 2 4-4" {...common} />
      <path d="M13 6h8" {...common} />
      <path d="M13 12h8" {...common} />
      <path d="M13 18h8" {...common} />
    </>,
    <>
      <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" {...common} />
      <path d="m18 15 4-4" {...common} />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" {...common} />
    </>,
    <>
      <circle cx="12" cy="12" r="10" {...common} />
      <path d="m9 12 2 2 4-4" {...common} />
    </>,
    <>
      <path d="M12 12h.01" {...common} />
      <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" {...common} />
      <path d="M22 13a18.15 18.15 0 0 1-20 0" {...common} />
      <rect width="20" height="14" x="2" y="6" rx="2" {...common} />
    </>,
  ]
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {marks[index] ?? marks[0]}
    </svg>
  )
}

function ButtonLink({ to, children, primary = false }: { to: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link className={primary ? "ph-btn ph-btn-primary" : "ph-btn ph-btn-secondary"} to={to}>
      {children}
      <Arrow />
    </Link>
  )
}

function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="ph-text-link" to={to}>
      {children}
      <Arrow />
    </Link>
  )
}

function Hero() {
  return (
    <section className="ph-hero">
      <div className="ph-container ph-hero-grid">
        <div>
          <p className="ph-eyebrow">Skill programs · Degrees · Career OS</p>
          <h1>
            Education built <span>for <em>what comes next.</em></span>
          </h1>
          <p className="ph-hero-lead">
            Skylent offers online skill programmes and university degree routes for students and working learners. Study published modules, practise with quizzes and tasks, and earn certificates anyone can verify.
          </p>
          <div className="ph-hero-actions">
            <ButtonLink to="/programs" primary>Explore Skill Programs</ButtonLink>
            <ButtonLink to="/education#degrees">Explore University Degrees</ButtonLink>
          </div>
          <Link className="ph-quiet" to="/path">
            Not sure where to start? <strong>Find My Path</strong>
            <Arrow />
          </Link>
        </div>
        <figure>
          <div className="ph-hero-frame">
            <img
              className="ph-hero-student"
              src={heroStudent}
              alt="A student studying with a laptop and books"
              width={1200}
              height={800}
            />
            <div className="ph-hero-shot">
              <div className="ph-hero-shot-bar">
                <span>Skylent Learning</span>
                <span>Published course workspace</span>
              </div>
              <img
                src={studentHome}
                alt="Skylent Student Home showing Continue learning with course progress and a Resume program button"
                width={1600}
                height={900}
              />
            </div>
          </div>
          <figcaption>The real Skylent learning workspace: modules, lessons, practice and progress.</figcaption>
        </figure>
      </div>
    </section>
  )
}

function statusLabel(status: LiveProgram["status"]) {
  if (status === "coming_soon") return "Coming soon"
  if (status === "waitlist") return "Waitlist"
  if (status === "open") return "Live"
  return "Live"
}

function Programs() {
  const { programs, isLive, isLoading, isUnavailable, retry } = useLivePrograms()
  const categories = useMemo(
    () => Array.from(new Set(programs.map((program) => program.category).filter(Boolean))),
    [programs],
  )
  const [filter, setFilter] = useState("All")
  const visible = filter === "All" ? programs : programs.filter((program) => program.category === filter)
  const shown = visible.slice(0, 6)

  return (
    <section className="ph-section ph-programs" aria-labelledby="home-programs-title">
      <div className="ph-container">
        <div className="ph-split-head">
          <div>
            <p className="ph-kicker">{isLive ? "Live catalogue" : "Catalogue"}</p>
            <h2 id="home-programs-title">Choose a skill program.</h2>
            <p className="ph-lead">
              Every program shows its published structure — modules, lessons, quizzes and assignments — so you can judge the fit before you enrol.
            </p>
          </div>
          <div className="ph-split-side">
            {isLive ? (
              <p className="ph-meta">{programs.length} published programs · updated from the Skylent catalogue</p>
            ) : null}
            {isUnavailable ? (
              <p className="ph-meta">Live catalogue unavailable right now.</p>
            ) : null}
            <TextLink to="/programs">Explore all programs</TextLink>
          </div>
        </div>

        {categories.length > 1 ? (
          <div className="ph-tabs" role="tablist" aria-label="Filter programs by category">
            {["All", ...categories].map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={filter === category}
                className={filter === category ? "is-on" : undefined}
                onClick={() => setFilter(category)}
              >
                {category}
                {category !== "All" ? (
                  <span>{programs.filter((program) => program.category === category).length}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <ul className="ph-card-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="ph-skel" />
            ))}
          </ul>
        ) : null}

        {isUnavailable ? (
          <div className="ph-empty">
            <p>The catalogue could not be loaded from the Skylent API.</p>
            <button type="button" onClick={() => void retry()}>Try again</button>
          </div>
        ) : null}

        {isLive ? (
          <ul className="ph-card-grid">
            {shown.map((program) => {
              const image = programImage(program.slug)
              const facts = [program.duration, program.deliveryMode, program.level].filter(Boolean)
              return (
                <li key={program.slug}>
                  <Link className="ph-card" to={`/programs/${program.slug}`}>
                    <img src={image.src} alt={image.alt} />
                    <div className="ph-card-body">
                      <p className="ph-card-kicker">
                        <span>{program.category}</span>
                        <span className={program.status === "open" ? "ph-pill is-live" : "ph-pill"}>{statusLabel(program.status)}</span>
                      </p>
                      <h3>{program.title}</h3>
                      {program.description ? <p>{program.description}</p> : null}
                      {facts.length > 0 ? <p className="ph-card-facts">{facts.join("  ·  ")}</p> : null}
                      {program.modules > 0 ? (
                        <dl>
                          <div><dd>{program.modules}</dd><dt>Modules</dt></div>
                          <div><dd>{program.projects}</dd><dt>Projects</dt></div>
                        </dl>
                      ) : (
                        <p className="ph-card-pending">Curriculum publishing soon</p>
                      )}
                      <span className="ph-card-cta">View curriculum <Arrow /></span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches) {
      setProgress(1)
      return
    }
    const update = () => {
      const node = listRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight
      const next = Math.max(0, Math.min(1, (viewport * 0.85 - rect.top) / (rect.height + viewport * 0.35)))
      setProgress(next)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    const onChange = () => {
      if (media.matches) setProgress(1)
      else update()
    }
    media.addEventListener("change", onChange)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      media.removeEventListener("change", onChange)
    }
  }, [])

  return (
    <section id="how" className="ph-section ph-how">
      <div className="ph-container">
        <p className="ph-kicker">How Skylent works</p>
        <h2>One connected route, from first lesson to proof.</h2>
        <ol ref={listRef}>
          <span className="ph-how-track" aria-hidden="true" />
          <span className="ph-how-fill ph-how-fill-y" aria-hidden="true" style={{ transform: `scaleY(${progress})` }} />
          <span className="ph-how-fill ph-how-fill-x" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
          {STAGES.map((stage, index) => {
            const active = progress >= index / (STAGES.length - 1) - 0.02
            return (
              <li key={stage.title} className={active ? "is-on" : undefined}>
                <span className="ph-how-mark"><StageIcon index={index} /></span>
                <div>
                  <p>{String(index + 1).padStart(2, "0")}</p>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function Shot({ src, alt, label, note, index }: { src: string; alt: string; label: string; note: string; index: number }) {
  return (
    <figure className="ph-shot">
      <div>
        <img src={src} alt={alt} width={1600} height={1000} />
      </div>
      <figcaption>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>
          <strong>{label}</strong>
          {note}
        </span>
      </figcaption>
    </figure>
  )
}

function SeeItWorking() {
  const { user } = useAuth()
  const [lead, ...rest] = SCREENS
  return (
    <section id="see-it-working" className="ph-section ph-see">
      <div className="ph-container">
        <div className="ph-split-head">
          <div>
            <p className="ph-kicker">See it working</p>
            <h2>This is what learning on Skylent looks like.</h2>
            <p className="ph-lead">Real screens from the student workspace — not mock-ups.</p>
          </div>
          <div className="ph-split-side">
            {user ? (
              <ButtonLink to={dashboardPath(user.role)}>Open Dashboard</ButtonLink>
            ) : (
              <ButtonLink to="/login">Open My learning</ButtonLink>
            )}
          </div>
        </div>
        <Shot {...lead} index={0} />
        <div className="ph-see-grid">
          {rest.map((screen, index) => (
            <Shot key={screen.label} {...screen} index={index + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Education() {
  return (
    <section className="ph-section ph-edu" aria-labelledby="home-degrees-title">
      <div className="ph-container">
        <div className="ph-split-head">
          <div>
            <p className="ph-kicker">Degree routes</p>
            <h2 id="home-degrees-title">Choose an undergraduate or postgraduate route.</h2>
            <p className="ph-lead">Compare the listed study modes and open each degree page for the information currently available.</p>
          </div>
          <TextLink to="/education#degrees">Explore all degrees</TextLink>
        </div>
        <ul className="ph-degree-grid">
          {DEGREE_ROUTES.map((degree) => {
            const image = degreeImage(degree.slug)
            const level = degreeLevelLabel(degree.level)
            return (
              <li key={degree.id}>
                <Link to={`/education/degrees/${degree.slug}`}>
                  {image ? (
                    <span className="ph-degree-photo">
                      <img src={image.src} alt={image.alt} />
                      <span>{level}</span>
                    </span>
                  ) : null}
                  <span className="ph-degree-body">
                    <span className="ph-kicker">Degree area</span>
                    <strong>{degree.field} degrees</strong>
                    <span className="ph-degree-tags">
                      <span>{level}</span>
                      <span>{degree.studyMode === "online" ? "Online" : "On-campus"}</span>
                    </span>
                    <span className="ph-card-cta">
                      <span className="ph-degree-pathway">
                        View pathway
                        <Arrow />
                      </span>
                      {degree.sample ? <span className="ph-sample-pill">Sample listing</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="ph-note">{DEGREE_SAMPLE_NOTE}</p>
      </div>
    </section>
  )
}

function CareerOSSpotlight() {
  return (
    <section id="career-os" className="ph-section ph-career">
      <div className="ph-container ph-career-grid">
        <figure className="ph-shot">
          <div>
            <img
              src={careerEvidence}
              alt="Career OS evidence panels: what I completed, what I built and what I can show"
              width={1600}
              height={1000}
            />
          </div>
          <figcaption>Career OS in the student workspace — real screen.</figcaption>
        </figure>
        <div>
          <p className="ph-kicker">Career OS</p>
          <h2>Turn learning into evidence you can use.</h2>
          <p className="ph-lead">One record that connects your enrolled learning, completed work and certificates.</p>
          <ul className="ph-status">
            {CAREER_STATUS.map((item) => (
              <li key={item.title}>
                <p>
                  <strong>{item.title}</strong>
                  <span className={item.status === "Live" ? "ph-pill is-live" : "ph-pill"}>{item.status}</span>
                </p>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="ph-note">Career OS does not guarantee a job.</p>
          <ButtonLink to="/career-os" primary>Explore Career OS</ButtonLink>
        </div>
      </div>
    </section>
  )
}

function PathSection() {
  return (
    <section className="ph-section ph-path">
      <div className="ph-container ph-path-grid">
        <div className="ph-path-photo">
          <img src={heroClassroom} alt="Students planning their next step together" width={1200} height={900} />
        </div>
        <div>
          <p className="ph-kicker">Not sure where to start?</p>
          <h2>Tell us what you&apos;re trying to do.</h2>
          <p className="ph-lead">
            Find My Path asks about your stage and goals, then suggests a sensible next step across programmes, degrees and Career OS. It is a guidance tool — clear rules, not a prediction.
          </p>
          <ButtonLink to="/path" primary>Find My Path</ButtonLink>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  const links = [
    ["Explore programmes", "/programs"],
    ["Explore degrees", "/education"],
    ["Find My Path", "/path"],
  ] as const
  return (
    <section className="ph-final">
      <div className="ph-container ph-final-grid">
        <div>
          <p className="ph-kicker">Begin</p>
          <h2>Start with what you need next.</h2>
        </div>
        <ul>
          {links.map(([label, to]) => (
            <li key={label}>
              <Link to={to}>
                {label}
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function PublicHome() {
  return (
    <div className="public-home">
      <Hero />
      <Programs />
      <HowItWorks />
      <SeeItWorking />
      <Education />
      <CareerOSSpotlight />
      <PathSection />
      <FinalCta />
    </div>
  )
}
