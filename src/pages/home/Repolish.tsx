/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Order: hero (navy, entry points only) → inside a programme (the learner photo, player and lab
 * result, now one scroll down and explained) → programmes (certification / professional) →
 * degrees (UG and PG, online and on campus) → student home (navy) → labs across domains →
 * Career OS walkthrough (navy) → Skylent AI → institutions → closing.
 *
 * Facts come from the authored course data, the catalogue (or its published list) and
 * src/data/education.ts. Nothing here states a learner count, outcome, partner or placement.
 */
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { SkylentBot } from "@/components/skylent/SiteAssistant"
import { openSkylentAi } from "@/components/skylent/ai-events"
import { HarborDeskPlate, NorthwindLabPlate } from "@/components/programme/ProgrammeArtefacts"
import { authoredProgrammeContent } from "@/components/programme/programme-content"
import { programmeTruth } from "@/components/programme/programme-truth"
import { programmeDiscoveryFor } from "@/lib/programme-discovery"
import type { CatalogProgramSummary } from "@/lib/catalog-api"
import { LESSON_AI } from "@/lib/product-manifest"
import heroLearner from "@/assets/site/program-library.jpg"
import photoOnlineUg from "@/assets/site/degree-computing.jpg"
import photoCampusUg from "@/assets/site/hero-classroom.jpg"
import photoOnlinePg from "@/assets/site/degree-business.jpg"
import photoCampusPg from "@/assets/site/degree-management.jpg"
import { PlayerPlate, ResultCard } from "./Hero"
import { courseFacts } from "./course-facts"

/* ── Hero ─────────────────────────────────────────────────────────────── */

const ENTRY_POINTS = [
  { title: "Degrees", text: "Undergraduate and postgraduate, online or on campus.", to: "/education" },
  { title: "Programmes", text: "Certification and professional programmes with hands-on labs.", to: "/programmes" },
  { title: "Career OS", text: "Your profile, projects and applications in one workspace.", to: "/career-os" },
] as const

export function HomeHero() {
  return (
    <section className="hx-hero" aria-labelledby="hx-hero-title">
      <div className="hx-hero__glow" aria-hidden="true" />
      <div className="sky-container hx-hero__inner">
        <p className="hx-eyebrow hx-rise">Degrees · Programmes · Career OS</p>
        <h1 id="hx-hero-title" className="hx-hero__title hx-rise">
          Education built for <em>what comes next.</em>
        </h1>
        <p className="hx-hero__lead hx-rise">Study for a degree or learn a job skill, practise on real work, and keep everything you build in one career profile.</p>
        <div className="hx-hero__actions hx-rise">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
            Explore programmes
            <ArrowRight />
          </Link>
          <Link className="sk-btn hx-btn hx-btn--ghost" to="/education">
            Explore degrees
          </Link>
        </div>
        <ul className="hx-entries hx-rise" aria-label="Ways to start">
          {ENTRY_POINTS.map((entry) => (
            <li key={entry.title}>
              <Link to={entry.to} className="hx-entry">
                <span className="hx-entry__title">{entry.title}</span>
                <span className="hx-entry__text">{entry.text}</span>
                <span className="hx-entry__go" aria-hidden="true">
                  <ArrowRight />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Inside a programme ───────────────────────────────────────────────── */

const INSIDE_POINTS = [
  { title: "Learn", text: "Short written lessons with checks, one step at a time." },
  { title: "Practise", text: "Run the work yourself in a lab, on a realistic dataset or case." },
  { title: "Prove", text: "Keep the result as evidence in your Career OS profile." },
]

export function InsideProgramme() {
  const facts = courseFacts()
  return (
    <section className="hx-inside" aria-labelledby="hx-inside-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">How learning works</p>
            <h2 id="hx-inside-title" className="hx-h2">
              Every lesson leads to <em>work you can show.</em>
            </h2>
          </div>
          <p className="hx-head__aside">
            A real lesson from a Skylent course, next to the result its lab query produces.
          </p>
        </Reveal>
        <Reveal variant="plate" className="hm-hero__stage hx-inside__stage">
          <div className="hm-hero__player">
            <PlayerPlate />
          </div>
          <div className="hm-hero__photo">
            <img src={heroLearner} alt="A learner working at a laptop at a library table." width={1000} height={666} loading="lazy" decoding="async" />
            <div className="hm-hero__result">
              <ResultCard />
            </div>
          </div>
        </Reveal>
        <ul className="hx-points">
          {INSIDE_POINTS.map((point) => (
            <li key={point.title}>
              <span className="hx-points__title">{point.title}</span>
              <span className="hx-points__text">{point.text}</span>
            </li>
          ))}
        </ul>
        {facts ? (
          <p className="hx-points__note">
            Shown: lesson {facts.lessonNumber} of {facts.title}. <Link to={`/courses/${facts.slug}`}>See the course</Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}

/* ── Programmes ───────────────────────────────────────────────────────── */

type HomeRow = { program: CatalogProgramSummary; title: string; line: string; open: boolean; kind: "Professional" | "Certification" }

function homeRows(programmes: CatalogProgramSummary[]): HomeRow[] {
  return programmes.flatMap((program) => {
    const type = program.programType.toUpperCase()
    const kind = type === "CERTIFICATE" ? "Certification" : type === "PROFESSIONAL" || !type ? "Professional" : null
    if (!kind) return []
    const truth = programmeTruth(program)
    const open = truth.state === "live"
    const content = open ? authoredProgrammeContent(program.slug) : null
    const discovery = open ? programmeDiscoveryFor(program.slug) : null
    return [{ program, kind, open, title: discovery?.courseTitle || program.name, line: content?.cardLine ?? "" }]
  })
}

export function HomeProgrammes({ programmes, loading }: { programmes: CatalogProgramSummary[]; loading: boolean }) {
  const rows = homeRows(programmes)
  const open = rows.filter((row) => row.open)
  const later = rows.filter((row) => !row.open)
  return (
    <section id="programmes" className="hx-programmes" aria-labelledby="hx-programmes-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Programmes</p>
            <h2 id="hx-programmes-title" className="hx-h2">
              Learn a job skill, <em>step by step.</em>
            </h2>
          </div>
          <Link className="hx-more" to="/programmes">
            All programmes
            <ArrowRight />
          </Link>
        </Reveal>
        {loading ? (
          <div className="hx-prog-grid" aria-busy="true" aria-label="Loading programmes">
            {[0, 1].map((i) => (
              <div key={i} className="hx-prog hx-prog--skel" aria-hidden="true">
                <span className="sky-skeleton" style={{ width: 120 }} />
                <span className="sky-skeleton" style={{ width: "70%", height: 22 }} />
                <span className="sky-skeleton" style={{ width: "90%" }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ul className="hx-prog-grid">
              {open.map((row) => {
                const content = authoredProgrammeContent(row.program.slug)
                return (
                  <li key={row.program.slug}>
                    <Link to={`/programmes/${row.program.slug}`} className="hx-prog">
                      <span className="hx-prog__top">
                        <span className="hx-pill hx-pill--open">Open for enrolment</span>
                        <span className="hx-prog__kind">{row.kind}</span>
                      </span>
                      <span className="hx-prog__title">{row.title}</span>
                      {row.line ? <span className="hx-prog__line">{row.line}</span> : null}
                      <span className="hx-prog__art" aria-hidden="true">
                        {content?.artefact === "harbor-desk" ? <HarborDeskPlate /> : <NorthwindLabPlate />}
                      </span>
                      <span className="hx-prog__go">
                        View programme
                        <ArrowRight />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            {later.length ? (
              <div className="hx-later">
                <p className="hx-later__label">Opening soon</p>
                <ul className="hx-later__list">
                  {later.map((row) => (
                    <li key={row.program.slug}>
                      <Link to={`/programmes/${row.program.slug}`}>
                        <span>{row.title}</span>
                        <span className="hx-later__kind">{row.kind}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

/* ── Degrees ──────────────────────────────────────────────────────────── */

const DEGREE_TILES = [
  { level: "Undergraduate", short: "UG", mode: "Online", text: "Recorded lectures, live sessions and assessed work on screen.", to: "/education?level=ug&mode=online", img: photoOnlineUg, alt: "A student in a video lesson on a laptop at home." },
  { level: "Undergraduate", short: "UG", mode: "On campus", text: "Lectures, labs and tutorials in person, on a timetable.", to: "/education?level=ug&mode=campus", img: photoCampusUg, alt: "Students at long benches in a lecture hall." },
  { level: "Postgraduate", short: "PG", mode: "Online", text: "Specialise while you work, with flexible weekly study.", to: "/education?level=pg&mode=online", img: photoOnlinePg, alt: "A learner taking notes beside a laptop." },
  { level: "Postgraduate", short: "PG", mode: "On campus", text: "Full-time study at the institution that awards the degree.", to: "/education?level=pg&mode=campus", img: photoCampusPg, alt: "Two students studying together outdoors on a campus lawn." },
] as const

export function HomeDegrees() {
  return (
    <section id="degrees" className="hx-degrees" aria-labelledby="hx-degrees-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Degrees</p>
            <h2 id="hx-degrees-title" className="hx-h2">
              UG and PG, <em>online or on campus.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Choose your level, then how you want to study. Online means you learn on screen; on campus means you attend in person.</p>
        </Reveal>
        <ul className="hx-degree-grid">
          {DEGREE_TILES.map((tile) => (
            <li key={tile.to}>
              <Link to={tile.to} className="hx-degree">
                <span className="hx-degree__media">
                  <img src={tile.img} alt={tile.alt} loading="lazy" decoding="async" />
                  <span className={tile.mode === "Online" ? "hx-mode hx-mode--online" : "hx-mode hx-mode--campus"}>{tile.mode}</span>
                </span>
                <span className="hx-degree__body">
                  <span className="hx-degree__level">
                    {tile.level} <span>({tile.short})</span>
                  </span>
                  <span className="hx-degree__text">{tile.text}</span>
                  <span className="hx-degree__go">
                    View {tile.short} {tile.mode.toLowerCase()} degrees
                    <ArrowRight />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Labs across domains ──────────────────────────────────────────────── */

const LABS = [
  {
    domain: "Data and analytics",
    title: "SQL lab on a sales extract",
    text: "Write queries, clean the data and reach a finding you can defend.",
    programme: "data-analytics-pro",
    Plate: NorthwindLabPlate,
  },
  {
    domain: "Product and business",
    title: "Product case workbench",
    text: "Frame a real operations problem and recommend one constrained bet.",
    programme: "product-management",
    Plate: HarborDeskPlate,
  },
] as const

export function HomeLabs() {
  return (
    <section id="labs" className="hx-labs" aria-labelledby="hx-labs-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Labs and projects</p>
            <h2 id="hx-labs-title" className="hx-h2">
              Practice on real work, <em>in every programme.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Each programme has its own lab and a capstone project. What you finish is saved to your profile.</p>
        </Reveal>
        <ul className="hx-lab-grid">
          {LABS.map((lab) => {
            const discovery = programmeDiscoveryFor(lab.programme)
            return (
              <li key={lab.programme} className="hx-lab">
                <div className="hx-lab__art" aria-hidden="true">
                  <lab.Plate />
                </div>
                <div className="hx-lab__body">
                  <p className="hx-lab__domain">{lab.domain}</p>
                  <h3 className="hx-lab__title">{lab.title}</h3>
                  <p className="hx-lab__text">{lab.text}</p>
                  <Link className="hx-more" to={`/programmes/${lab.programme}`}>
                    Part of {discovery?.courseTitle ?? "this programme"}
                    <ArrowRight />
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ── Career OS walkthrough ────────────────────────────────────────────── */

const JOURNEY = [
  { key: "enrol", title: "Enrol", text: "Pick a programme or degree and start." },
  { key: "learn", title: "Learn", text: "Lessons, checks and progress in one place." },
  { key: "build", title: "Build projects", text: "Labs and a capstone turn practice into work." },
  { key: "evidence", title: "Collect evidence", text: "Finished work is kept with what it shows." },
  { key: "profile", title: "Develop your profile", text: "Role, skills, education and projects together." },
  { key: "prepare", title: "Prepare for opportunities", text: "Track applications and interview practice." },
] as const

type JourneyKey = (typeof JOURNEY)[number]["key"]

function Bar({ w, tone = "rest" }: { w: string; tone?: "rest" | "on" | "soft" }) {
  return <span className={`hx-bar hx-bar--${tone}`} style={{ width: w }} />
}

function JourneyScreen({ step }: { step: JourneyKey }) {
  switch (step) {
    case "enrol":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Programme</p>
          <div className="hx-screen__card">
            <Bar w="62%" tone="on" />
            <Bar w="88%" />
            <Bar w="74%" />
            <span className="hx-screen__check">
              <span className="hx-screen__box" /> I agree to the Terms &amp; Conditions
            </span>
            <span className="hx-screen__btn">Enrol</span>
          </div>
        </div>
      )
    case "learn":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">My learning</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>Next lesson</b><span className="hx-screen__btn hx-screen__btn--sm">Continue</span></span>
            <span className="hx-track"><span style={{ width: "42%" }} /></span>
            {[["Module 1", 100], ["Module 2", 100], ["Module 3", 35], ["Module 4", 0]].map(([m, p]) => (
              <span key={m} className="hx-screen__row">
                <span>{m}</span>
                <span className="hx-track hx-track--sm"><span style={{ width: `${p}%` }} /></span>
              </span>
            ))}
          </div>
        </div>
      )
    case "build":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Capstone project</p>
          <div className="hx-screen__card">
            {["Read the brief", "Explore the data", "Build the analysis", "Write the recommendation"].map((task, i) => (
              <span key={task} className="hx-screen__task">
                <span className={i < 2 ? "hx-tick hx-tick--on" : "hx-tick"} />
                {task}
              </span>
            ))}
          </div>
        </div>
      )
    case "evidence":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Evidence record</p>
          <div className="hx-screen__card">
            {["Project", "Files", "What it shows", "Reflection"].map((label, i) => (
              <span key={label} className="hx-screen__row hx-screen__row--rule">
                <span className="hx-screen__k">{label}</span>
                <Bar w={["70%", "45%", "80%", "60%"][i]} />
              </span>
            ))}
          </div>
        </div>
      )
    case "profile":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Career profile</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><span className="hx-avatar" /><Bar w="50%" tone="on" /></span>
            <span className="hx-chips">
              {["Skill", "Skill", "Skill", "Skill"].map((chip, i) => (
                <span key={i} className="hx-chip">{chip}</span>
              ))}
            </span>
            <span className="hx-screen__row hx-screen__row--rule"><span className="hx-screen__k">Education</span><Bar w="55%" /></span>
            <span className="hx-screen__row hx-screen__row--rule"><span className="hx-screen__k">Projects</span><Bar w="65%" /></span>
          </div>
        </div>
      )
    case "prepare":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Applications</p>
          <div className="hx-screen__cols">
            {["Saved", "Applied", "Interview"].map((col) => (
              <div key={col} className="hx-screen__col">
                <span className="hx-screen__k">{col}</span>
                <span className="hx-screen__mini"><Bar w="80%" /><Bar w="55%" tone="soft" /></span>
                {col !== "Interview" ? <span className="hx-screen__mini"><Bar w="70%" /><Bar w="45%" tone="soft" /></span> : null}
              </div>
            ))}
          </div>
        </div>
      )
  }
}

export function CareerJourney({ eyebrow = "Career OS", showLink = true }: { eyebrow?: string; showLink?: boolean } = {}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Auto-advances like a short video while on screen; stops for reduced motion or once the visitor picks a step.
  useEffect(() => {
    if (paused || !inView) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % JOURNEY.length), 3200)
    return () => window.clearInterval(timer)
  }, [paused, inView])

  const step = JOURNEY[active]
  return (
    <section ref={rootRef} id="career-os" className="hx-journey" aria-labelledby="hx-journey-title">
      <div className="sky-container">
        <Reveal className="hx-head hx-head--dark" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow">{eyebrow}</p>
            <h2 id="hx-journey-title" className="hx-h2 hx-h2--light">
              From your first lesson <em>to your first application.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Degrees, programmes and labs all feed one Career OS profile. It stays with you after you enrol and keeps growing as you learn.</p>
        </Reveal>
        <div className="hx-journey__grid">
          <ol className="hx-steps" aria-label="How Career OS helps after you enrol">
            {JOURNEY.map((item, i) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={i === active ? "hx-step is-on" : i < active ? "hx-step is-done" : "hx-step"}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => {
                    setActive(i)
                    setPaused(true)
                  }}
                >
                  <span className="hx-step__dot" aria-hidden="true" />
                  <span className="hx-step__title">{item.title}</span>
                  <span className="hx-step__text">{item.text}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hx-journey__stage">
            <div className="hx-window">
              <div className="hx-window__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>Career OS</em>
              </div>
              <div className="hx-window__body" key={step.key} aria-live="polite">
                <p className="hx-sr">Step {active + 1} of {JOURNEY.length}: {step.title}.</p>
                <JourneyScreen step={step.key} />
              </div>
              <div className="hx-window__progress" aria-hidden="true">
                {JOURNEY.map((item, i) => (
                  <span key={item.key} className={i <= active ? "is-on" : undefined} />
                ))}
              </div>
            </div>
            <div className="hx-journey__actions">
              <button type="button" className="hx-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                {paused ? "Play walkthrough" : "Pause walkthrough"}
              </button>
              {showLink ? (
                <Link className="sk-btn sk-btn-primary" to="/career-os">
                  How Career OS works
                  <ArrowRight />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Skylent AI ───────────────────────────────────────────────────────── */

export function HomeAi() {
  return (
    <section id="skylent-ai" className="hx-ai" aria-labelledby="hx-ai-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Skylent AI</p>
            <h2 id="hx-ai-title" className="hx-h2">
              A small helper, <em>before and after you join.</em>
            </h2>
          </div>
          <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
            Try Skylent AI
            <ArrowRight />
          </button>
        </Reveal>
        <div className="hx-ai__grid">
          <article className="hx-ai__card">
            <p className="hx-ai__when">Before you join</p>
            <h3>Find the right programme or degree</h3>
            <div className="hx-chat" aria-label="How the guided questions look">
              <div className="hx-chat__row">
                <SkylentBot size={28} />
                <p className="hx-chat__bubble">What are you looking for?</p>
              </div>
              <div className="hx-chat__options" aria-hidden="true">
                <span>Learn a job skill</span>
                <span>Study for a degree</span>
                <span>I'm not sure yet</span>
              </div>
              <p className="hx-chat__bubble hx-chat__bubble--user">Learn a job skill</p>
              <div className="hx-chat__row">
                <SkylentBot size={28} />
                <p className="hx-chat__bubble">Which area do you want to work in?</p>
              </div>
            </div>
            <p className="hx-ai__note">A few questions, then suggestions from the Skylent catalogue. Not helpful? Leave your details and the team replies.</p>
          </article>
          <article className="hx-ai__card hx-ai__card--dark">
            <p className="hx-ai__when">While you learn</p>
            <h3>Help inside every lesson</h3>
            <ul className="hx-ai__modes">
              {LESSON_AI.modes.map((mode) => (
                <li key={mode.id}>
                  <span className="hx-ai__mode">{mode.label}</span>
                  <span className="hx-ai__modetext">{mode.detail}</span>
                </li>
              ))}
            </ul>
            <p className="hx-ai__note">During an open quiz or assignment it explains the idea, but never gives you the answer.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ── Institutions and closing ─────────────────────────────────────────── */

export function HomeInstitutions() {
  return (
    <section className="hx-inst" aria-labelledby="hx-inst-title">
      <div className="sky-container hx-inst__inner">
        <div>
          <p className="hx-eyebrow hx-eyebrow--dark">For institutions</p>
          <h2 id="hx-inst-title" className="hx-h2 hx-h2--sm">
            Bring programmes, labs and Career OS to your learners.
          </h2>
          <p className="hx-inst__text">For colleges, universities and training partners who want practical learning alongside their own teaching.</p>
        </div>
        <Link className="sk-btn sk-btn-secondary" to="/institutions">
          Partner with Skylent
          <ArrowRight />
        </Link>
      </div>
    </section>
  )
}

export function HomeClosing() {
  return (
    <section className="hx-close" aria-labelledby="hx-close-title">
      <div className="hx-hero__glow" aria-hidden="true" />
      <div className="sky-container hx-close__inner">
        <h2 id="hx-close-title" className="hx-close__title">
          Start learning. <em>Keep what you build.</em>
        </h2>
        <div className="hx-hero__actions">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
            Get started
            <ArrowRight />
          </Link>
          <Link className="sk-btn hx-btn hx-btn--ghost" to="/programmes">
            Explore programmes
          </Link>
        </div>
      </div>
    </section>
  )
}
