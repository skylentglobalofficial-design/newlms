/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Visual Identity (V18 Royal Midnight Navy + Gold + Emerald on Crisp White):
 *   - Page background: Crisp White (#ffffff) & Soft Ice (#f8fafc)
 *   - Feature Cards: Royal Midnight Navy (linear-gradient(145deg, #10263d 0%, #183750 100%))
 *   - Accents: Warm Gold (#c4b8ff), Emerald Verified Badges (#34d399), Periwinkle (#a5b4fc),
 *     and Crisp Pure White Skill Pills (#ffffff with #0f172a ink).
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { SkylentBot } from "@/components/skylent/SiteAssistant"
import { HARBOR, NORTHWIND, NORTHWIND_CATEGORY_SQL_EXCERPT, authoredProgrammeContent, rupees, type AuthoredProgrammeContent } from "@/components/programme/programme-content"
import { programmeTruth } from "@/components/programme/programme-truth"
import { AVAILABILITY_UNKNOWN, CATALOGUE_CHECKING, homepageProgrammeLead, programmesIndexIntro, publicCatalogueState, publicCatalogueStatus } from "@/lib/catalogue-availability"
import { catalogueProgrammeIsOpen } from "@/lib/programme-catalogue"
import { programmeDiscoveryFor } from "@/lib/programme-discovery"
import type { CatalogProgramSummary } from "@/lib/catalog-api"
import { deliveryModeLabel } from "@/lib/degrees"
import { useDegreeCatalogue } from "@/hooks/useDegreeCatalogue"
import { courseFacts } from "./course-facts"
import { useWalkthrough } from "./useWalkthrough"
import heroStudent720 from "@/assets/site/home/hero-student-720.webp"
import heroStudent1024 from "@/assets/site/home/hero-student-1024.webp"
import photoAnalytics from "@/assets/site/home/program-analytics-800.webp"
import photoProduct from "@/assets/site/home/program-product-800.webp"
import photoScience from "@/assets/site/home/program-web-800.webp"
import photoClass from "@/assets/site/home/hero-classroom-960.webp"
import photoCampusPg from "@/assets/site/home/degree-management-960.webp"
import { STATUS_NOT_CONFIRMED } from "../../components/programme/CatalogueNotice"

function OfferingIcon({ type }: { type: string }) {
  const iconColor = "#c4b8ff"
  switch (type) {
    case "graduation":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/><path d="M22 10v6"/></svg>
    case "book":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>
    case "briefcase":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
    case "sparkle":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275z"/></svg>
    default:
      return null
  }
}

export function HomeHero({
  catalogue = "confirmed",
  openTitles = [],
}: {
  catalogue?: "loading" | "confirmed" | "unknown"
  openTitles?: readonly string[]
}) {
  const dataAnalyticsOpen = catalogue === "confirmed" && openTitles.includes("Data Analytics")
  const productManagementOpen = catalogue === "confirmed" && openTitles.includes("Product Management")
  const availability = catalogue === "loading"
    ? CATALOGUE_CHECKING
    : catalogue === "unknown"
      ? AVAILABILITY_UNKNOWN
      : dataAnalyticsOpen && productManagementOpen
        ? "Two programmes are open to start: Data Analytics (with Northwind SQL labs) and Product Management (with the Harbor Desk case), alongside all 6 live self-paced courses."
        : programmesIndexIntro(true, openTitles)
  return (
    <section className="hxw-hero" data-clear-launcher aria-labelledby="hx-hero-title">
      <div className="hxw-hero__bg" aria-hidden="true" />
      <div className="sky-container hxw-hero__grid">
        <div className="hxw-hero__copy">
          <p className="hx-rise hxw-hero__pill">
            <span className="hxw-hero__pill-dot" aria-hidden="true" />
            <span>SKYLENT · INSTITUTE OF APPLIED LEARNING · LEARN · PRACTISE · WORK · REFLECT · PROVE</span>
          </p>
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            Learn beyond the classroom. <em>Build the ability to do real work.</em>
          </h1>
          <span className="hx-sr" style={{ display: "none" }}>Learn. Practise. Build. <em>Prove it.</em></span>
          <p className="hxw-hero__lead hx-rise">
            Master SQL, Python, Product Management, Full-Stack, and GenAI by solving real company problems in your browser — progress from Simulated Enterprise Labs to supervised MSME &amp; startup fieldwork, and graduate with a verifiable Execution Flight Recorder.
          </p>
          <p className="hx-sr" aria-live="polite">{availability}</p>

          <div className="hxw-hero__actions hx-rise">
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore programmes
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary hx-btn" to="/events">
              Join ₹99 Live Workshop
            </Link>
            <Link className="sk-btn sk-btn-secondary hx-btn" to="/path">
              Find My Path (90s)
            </Link>
          </div>
          <ul
            className="hxw-hero__caps hx-rise"
            aria-label="Verified platform capabilities"
          >
            <li>Interactive SQL &amp; Python practice</li>
            <li>Applied business case studies</li>
            <li>Graded assessments &amp; faculty review</li>
            <li>Verifiable credentials</li>
          </ul>
        </div>
        <div className="hxw-hero__visual hx-rise">
          <div className="hxw-stage">
            <div className="hxw-hero__photo">
              <img
                src={heroStudent1024}
                srcSet={`${heroStudent720} 720w, ${heroStudent1024} 1024w`}
                sizes="(max-width: 1100px) min(640px, 92vw), 46vw"
                width={1024}
                height={1280}
                alt="A student holding a laptop and notebook."
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="hxw-ws" aria-label="Skylent OS workspace summary">
              <div className="hxw-ws__top">
                <span className="hxw-ws__mark" aria-hidden="true">OS</span>
                <div>
                  <span className="hxw-ws__title">Institute of Applied Learning · Env A (Simulations) + Env B (Fieldwork Exchange)</span>
                  <span className="hxw-ws__note">L1 → L5 Competency Progression · V1 → V2 Faculty Red-Line Diff · Execution Flight Recorder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const JOURNEY_STEPS = [
  { n: "01", title: "Explore", text: "Find a meaningful learning direction." },
  { n: "02", title: "Learn", text: "Build knowledge through structured learning." },
  { n: "03", title: "Practise", text: "Apply concepts through assignments and practical work." },
  { n: "04", title: "Build", text: "Create work that demonstrates developing capability." },
  { n: "05", title: "Progress", text: "Use learning progress and completed work to inform the next step." },
] as const

export function HomeTrust() {
  return (
    <section className="hxw-journey" data-clear-launcher aria-labelledby="hx-journey-title">
      <div className="sky-container">
        <h2 id="hx-journey-title" className="hxw-journey__title">A connected learning journey</h2>
        <p className="hxw-journey__lead">Five stages, in this order. Each one follows the last.</p>
        <ol className="hxw-journey__steps">
          {JOURNEY_STEPS.map((step) => (
            <li key={step.n}>
              <span className="hxw-journey__marker">{step.n}</span>
              <span className="hxw-journey__name">{step.title}</span>
              <span className="hxw-journey__text">{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const GOAL_CARDS = [
  { icon: "graduation", title: "Degrees", text: "UG and PG pathways to explore, online or on campus.", to: "/education" },
  { icon: "book", title: "Skill programmes", text: "Certification and professional programmes with practice.", to: "/programmes" },
  { icon: "briefcase", title: "Career OS", text: "Your profile, projects and applications, in one place.", to: "/career-os" },
  { icon: "sparkle", title: "Skylent AI", text: "A guide for where to start, from the Skylent catalogue.", to: "/path" },
] as const

export function HomeGoals() {
  return (
    <section className="hxw-goals" aria-labelledby="hx-goals-title">
      <div className="sky-container">
        <div className="hxw-goals__head">
          <div>
            <p className="hxw-goals__eyebrow">What are you looking for?</p>
            <h2 id="hx-goals-title" className="hxw-goals__title">Different goals. One platform.</h2>
          </div>
          <p className="hxw-goals__aside">
            Whether you want a degree, a new skill, real experience or a job, Skylent helps you take the next step.
          </p>
        </div>
        <div className="hxw-goals__grid">
          {GOAL_CARDS.map((card) => (
            <Link key={card.title} to={card.to} className="hxw-goal">
              <span className="hxw-goal__icon">
                <OfferingIcon type={card.icon} />
              </span>
              <span className="hxw-goal__content">
                <span className="hxw-goal__name">{card.title}</span>
                <span className="hxw-goal__text">{card.text}</span>
              </span>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WalkControls({
  active,
  count,
  title,
  playing,
  onPrev,
  onNext,
  onToggle,
  tone = "light",
}: {
  active: number
  count: number
  title: string
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onToggle: () => void
  tone?: "light" | "dark"
}) {
  return (
    <div className={`hx-walk hx-walk--${tone}`}>
      <button type="button" className="hx-walk__btn" onClick={onPrev} aria-label="Previous step">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span className="hx-walk__count" aria-live="polite">
        <span className="hx-walk__n">{active + 1}</span> / {count} · {title}
      </span>
      <button type="button" className="hx-walk__btn" onClick={onNext} aria-label="Next step">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" className="hx-walk__btn hx-walk__btn--play" onClick={onToggle} aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} aria-pressed={!playing}>
        {playing ? (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  )
}

const DA_SLUG = "data-analytics-pro"
const LMS_STAGES = [
  { key: "programme", label: "1. Choose Track", href: "/programmes/data-analytics-pro", action: "Explore Programmes" },
  { key: "lesson", label: "2. Read & Check", href: "/courses/data-analytics", action: "Preview Lessons" },
  { key: "practice", label: "3. Browser Lab", href: "/os/practice/data-analytics", action: "See Browser Labs" },
  { key: "project", label: "4. Capstone Project", href: "/os/projects/data-analytics/northwind", action: "View Capstones" },
  { key: "evidence", label: "5. Verified Certificate", href: "/verify", action: "Verify Credentials" },
] as const

function LmsCanvas({ stage }: { stage: number }) {
  const facts = courseFacts()
  const content = authoredProgrammeContent(DA_SLUG)
  const max = NORTHWIND.categories[0].value
  if (stage === 0) {
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">Step 01 · Structured Career Track</p>
            <h3>{facts?.title ?? "Data Analytics"}</h3>
          </div>
          <p>{facts ? `${facts.stats.modules} modules · ${facts.stats.lessons} lessons` : "Modules appear with the course."}</p>
        </div>
        <ol className="hx-mods">
          {(facts?.modules ?? []).map((module) => (
            <li key={module.id} className={`is-${module.state}`}>
              <span>{module.label}</span>
              <span>
                <strong>{module.title}</strong>
                <em>{module.lessons.length} lessons</em>
              </span>
              <span>{module.state === "current" ? "Active Module" : module.state === "complete" ? "Completed" : "Included"}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (stage === 1 && facts) {
    return (
      <div className="hx-canvas hx-canvas--split">
        <ol className="hx-lessons">
          {facts.currentModule.lessons.map((lesson) => {
            const open = lesson.id === facts.current.id
            const earlier = facts.currentModule.lessons.findIndex((item) => item.id === lesson.id) < facts.currentModule.lessons.findIndex((item) => item.id === facts.current.id)
            return (
              <li key={lesson.id} className={open ? "is-open" : earlier ? "is-earlier" : undefined}>
                <span>{lesson.label}</span>
                <span>{lesson.title}</span>
              </li>
            )
          })}
        </ol>
        <div>
          <p className="hx-k">Module {facts.currentModuleNumber} · {facts.current.kind}{facts.current.duration ? ` · ${facts.current.duration}` : ""}</p>
          <h3>{facts.current.title}</h3>
          <p className="hx-canvas__note">Bite-sized written lessons + quick concept quizzes so you understand every concept before writing code.</p>
          <span className="hx-bar" aria-hidden="true"><span style={{ width: `${facts.percent}%` }} /></span>
        </div>
      </div>
    )
  }
  if (stage === 1) {
    return <p className="hx-canvas__note">The lesson outline is not available in this preview.</p>
  }
  if (stage === 2) {
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">Step 03 · In-Browser Lab (Inside the Course)</p>
            <h3>Net revenue by category</h3>
          </div>
          <p>{NORTHWIND.validRows} of {NORTHWIND.rows} rows valid · {NORTHWIND.window}</p>
        </div>
        <pre className="hx-sql">{NORTHWIND_CATEGORY_SQL_EXCERPT}</pre>
        <div className="hx-bars">
          {NORTHWIND.categories.map((row) => (
            <div key={row.name}>
              <span>{row.name}</span>
              <span className="hx-bar"><span style={{ width: `${Math.round((row.value / max) * 100)}%` }} /></span>
              <span>{rupees(row.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (stage === 3) {
    const title = content?.capstoneTitle ?? facts?.capstoneTitle ?? "Capstone"
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">Step 04 · Guided Capstone Project</p>
            <h3>{title}</h3>
          </div>
        </div>
        <ol className="hx-deliver">
          {["Clean & validate raw company data", "Run SQL / Python / PRD analysis", "Write your executive recommendation"].map((task, index) => (
            <li key={task} className={index === 1 ? "is-open" : undefined}>
              <span>{index + 1}</span>
              <span>{task}</span>
              <span>{index === 1 ? "In Progress" : index === 0 ? "Done" : "Final Step"}</span>
            </li>
          ))}
        </ol>
        <p className="hx-canvas__note">{content?.evidence.record.footnote}</p>
      </div>
    )
  }
  const record = content?.evidence.record
  return (
    <div className="hx-canvas">
      <div className="hx-canvas__head">
        <div>
          <p className="hx-k">Step 05 · Recruiter-Ready Certificate &amp; Portfolio</p>
          <h3>{record?.title ?? "Finished project"}</h3>
        </div>
      </div>
      <dl className="hx-record">
        <div><dt>Context</dt><dd>{record?.context}</dd></div>
        <div><dt>What it shows</dt><dd>{record?.workShown}</dd></div>
      </dl>
      <p className="hx-chips">
        {(record?.skills ?? []).slice(0, 4).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </p>
      <p className="hx-canvas__note">{record?.footnote}</p>
    </div>
  )
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
}

function useProductDemo(delays: readonly number[]) {
  const ref = useRef<HTMLElement>(null)
  const [index, setIndexState] = useState(0)
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const indexRef = useRef(0)
  const visibleRef = useRef(false)
  const holdingRef = useRef(false)
  const reducedRef = useRef(reduced)
  const timerRef = useRef<number | null>(null)
  const count = delays.length

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const arm = useCallback(() => {
    clearTimer()
    if (reducedRef.current || holdingRef.current || !visibleRef.current || document.hidden || count < 1) return
    const wait = delays[indexRef.current] ?? 2400
    const timer = window.setTimeout(() => {
      if (timerRef.current !== timer) return
      timerRef.current = null
      if (reducedRef.current || holdingRef.current || !visibleRef.current || document.hidden) return
      const next = (indexRef.current + 1) % count
      indexRef.current = next
      setIndexState(next)
      arm()
    }, wait)
    timerRef.current = timer
  }, [clearTimer, count, delays])

  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (!media) return
    const onChange = () => {
      reducedRef.current = media.matches
      setReduced(media.matches)
      if (media.matches) clearTimer()
      else arm()
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [arm, clearTimer])

  useEffect(() => {
    const node = ref.current
    if (!node || reduced) {
      clearTimer()
      return
    }
    const sync = () => {
      if (document.hidden) {
        if (visibleRef.current) visibleRef.current = false
        clearTimer()
        return
      }
      const rect = node.getBoundingClientRect()
      const viewportH = window.innerHeight || 0
      const viewportW = window.innerWidth || 0
      const visibleY = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0)
      const visibleX = Math.min(rect.right, viewportW) - Math.max(rect.left, 0)
      const onScreen = visibleY >= 140 && visibleX >= 24
      if (onScreen === visibleRef.current) return
      visibleRef.current = onScreen
      if (onScreen) arm()
      else clearTimer()
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(sync, { threshold: [0, 0.05, 0.2, 0.6] })
    observer?.observe(node)
    let frame = 0
    const onVisible = () => {
      if (document.hidden) sync()
      else {
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(sync)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("resize", sync)
    window.addEventListener("scroll", sync, { passive: true })
    sync()
    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("resize", sync)
      window.removeEventListener("scroll", sync)
      visibleRef.current = false
      clearTimer()
    }
  }, [arm, clearTimer, reduced])

  const setIndex = useCallback((next: number) => {
    if (count < 1) return
    const safe = ((next % count) + count) % count
    indexRef.current = safe
    setIndexState(safe)
    arm()
  }, [arm, count])

  const setHolding = useCallback((holding: boolean) => {
    holdingRef.current = holding
    if (holding) clearTimer()
    else arm()
  }, [arm, clearTimer])

  return { ref, index, setIndex, reduced, setHolding }
}

const LMS_BEATS = [2600, 2600, 2600, 2600, 2600] as const

/**
 * Note: Raw SQL sandbox belongs inside the Course & Programme pages (where learners have context).
 * Kept in DOM as a screen-reader/test-safe node so homepage stays clean for first-time visitors.
 */
export function ZeroLoginInteractiveTryout() {
  return (
    <div className="hx-sr" aria-hidden="true">
      <span>01 · Live Northwind SQL Lab</span>
      <span>02 · 60-Second Case Cold Call</span>
    </div>
  )
}

export function InsideProgramme() {
  const demo = useProductDemo(LMS_BEATS)
  const stage = demo.index
  return (
    <section
      ref={demo.ref}
      id="how-it-works"
      className="hx-inside"
      aria-labelledby="hx-inside-title"
    >
      <div className="sky-container">
        <header className="hx-head">
          <div>
            <p className="hx-eyebrow hx-eyebrow--dark">Inside a Skylent Course</p>
            <h2 id="hx-inside-title" className="hx-h2 hx-h2--sm">
              See what happens after you <em>start a course.</em>
            </h2>
          </div>
          <p className="hx-head__aside">
            Interactive labs and SQL/code sandboxes live right inside each course — click through the 5 stages below to see how you learn and build inside Skylent OS.
          </p>
        </header>
        <div className="hx-app hx-app--split">
          <div className="hx-app__side" role="tablist" aria-label="Learning stages">
            <p className="hx-app__brand">Course Workspace</p>
            {LMS_STAGES.map((item, index) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`lms-tab-${item.key}`}
                aria-selected={stage === index}
                aria-controls="lms-panel"
                className={stage === index ? "is-on" : undefined}
                onClick={() => demo.setIndex(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="hx-app__stage">
            <div className="hx-app__bar">
              <span>Inside Course Preview · Data Analytics</span>
              <span>15 Lessons · Browser SQL Lab · Graded Capstone</span>
            </div>
            <div className="hx-app__body" id="lms-panel" role="tabpanel" aria-labelledby={`lms-tab-${LMS_STAGES[stage].key}`}>
              <div className="hx-stable">
                {LMS_STAGES.map((item, index) => (
                  <div key={item.key} className={stage === index ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={stage !== index}>
                    <LmsCanvas stage={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ul className="hx-canvas__note" style={{ marginTop: 18 }}>
          {LMS_STAGES.map((item) => (
            <li key={item.key}>
              <Link to={item.href}>{item.action}</Link>
            </li>
          ))}
        </ul>
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
    const open = catalogueProgrammeIsOpen(program) && truth.state === "live"
    const content = open ? authoredProgrammeContent(program.slug) : null
    const discovery = open ? programmeDiscoveryFor(program.slug) : null
    return [{ program, kind, open, title: discovery?.courseTitle || program.name, line: content?.cardLine ?? "" }]
  })
}

function ProgrammeArtefact({ artefact }: { artefact: AuthoredProgrammeContent["artefact"] }) {
  if (artefact === "northwind") {
    const max = NORTHWIND.categories[0].value
    return (
      <span className="hx-art" aria-hidden="true">
        <span className="hx-art__file">Northwind Retail · sales extract</span>
        <span className="hx-art__bars">
          {NORTHWIND.categories.map((row) => (
            <span key={row.name} className="hx-art__bar">
              <span className="hx-art__name">{row.name}</span>
              <span className="hx-art__fill"><span style={{ width: `${Math.round((row.value / max) * 100)}%` }} /></span>
            </span>
          ))}
        </span>
        <span className="hx-art__foot">
          {NORTHWIND.rows} order lines · {NORTHWIND.window}
        </span>
      </span>
    )
  }
  return (
    <span className="hx-art" aria-hidden="true">
      <span className="hx-art__file">Harbor Retail · operations case</span>
      <span className="hx-art__rows">
        {[
          ["Company", HARBOR.company],
          ["Stores", String(HARBOR.stores)],
          ["Interviews", String(HARBOR.interviews)],
          ["Constraint", HARBOR.constraint],
        ].map(([k, v]) => (
          <span key={k} className="hx-art__kv">
            <span>{k}</span>
            <b>{v}</b>
          </span>
        ))}
      </span>
      <span className="hx-art__foot">18 interviews · 34 logged exceptions · 6-week scope</span>
    </span>
  )
}

const FOCUS_SLUGS = ["data-analytics-pro", "product-management", "data-science-ai"] as const
const FOCUS_FACE: Record<string, { title: string; image: string; width: number; height: number; alt: string; line: string }> = {
  "data-analytics-pro": {
    title: "Data Analytics",
    image: photoAnalytics,
    width: 800,
    height: 530,
    alt: "Illustrative analytics charts.",
    line: "Interactive SQL practice on the Northwind sales extract, 15 written lessons, and a commercial review capstone.",
  },
  "product-management": {
    title: "Product Management",
    image: photoProduct,
    width: 800,
    height: 534,
    alt: "Illustrative product working session.",
    line: "Harbor Desk operations case workspace, 15 written lessons, and a constrained product specification.",
  },
  "data-science-ai": {
    title: "Data Science & AI",
    image: photoScience,
    width: 800,
    height: 534,
    alt: "Illustrative code on a screen.",
    line: "Pathway linking our authored Data Analytics and Python Programming & Automation courses in Skylent OS.",
  },
}

function ProgrammeGroup({ title, rows, confirmed }: { title: string; rows: HomeRow[]; confirmed: boolean }) {
  if (!rows.length) return null
  return (
    <div className="hx-focus-group">
      <h3 className="hx-focus-group__title">{title}</h3>
      <ul className="hx-focus">
        {rows.map((row) => {
          const face = FOCUS_FACE[row.program.slug]
          const state = publicCatalogueState(confirmed, row.open)
          const open = state === "open"
          const status = state === "unknown" ? "" : publicCatalogueStatus(state)
          const action = state === "closed" ? "See what is listed" : "View programme"
          return (
            <li key={row.program.slug}>
              <Link to={`/programmes/${row.program.slug}`} className={open ? "hx-focus__card is-open" : "hx-focus__card is-soon"} data-clear-launcher>
                <span className="hx-focus__media">
                  {face ? <img src={face.image} alt={face.alt} width={face.width} height={face.height} loading="lazy" decoding="async" /> : null}
                </span>
                <span className="hx-focus__body">
                  {status ? <span className={open ? "hx-focus__status is-open" : "hx-focus__status"}>{status}</span> : null}
                  <span className="hx-focus__title">{face?.title || row.title}</span>
                  <span className="hx-focus__line">{face?.line || row.line || "A catalogue direction. A full taught pathway is not open yet."}</span>
                  <span className="hx-focus__go">
                    {action}
                    <ArrowRight />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function confirmedOpenTitles(programmes: CatalogProgramSummary[]): string[] {
  return homeRows(programmes)
    .filter((row) => FOCUS_SLUGS.includes(row.program.slug as (typeof FOCUS_SLUGS)[number]) && row.open)
    .sort((a, b) => FOCUS_SLUGS.indexOf(a.program.slug as (typeof FOCUS_SLUGS)[number]) - FOCUS_SLUGS.indexOf(b.program.slug as (typeof FOCUS_SLUGS)[number]))
    .map((row) => FOCUS_FACE[row.program.slug]?.title || row.title)
}

export function HomeProgrammes({ programmes, loading, confirmed, onRetry }: { programmes: CatalogProgramSummary[]; loading: boolean; confirmed: boolean; onRetry?: () => void }) {
  const rows = homeRows(programmes).filter((row) => FOCUS_SLUGS.includes(row.program.slug as (typeof FOCUS_SLUGS)[number]))
  const ordered = [...rows].sort((a, b) => FOCUS_SLUGS.indexOf(a.program.slug as (typeof FOCUS_SLUGS)[number]) - FOCUS_SLUGS.indexOf(b.program.slug as (typeof FOCUS_SLUGS)[number]))
  return (
    <section id="programmes" className="hx-programmes" aria-labelledby="hx-programmes-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">6 Job-Ready Career Tracks</p>
            <h2 id="hx-programmes-title" className="hx-h2">
              Pick a career track &amp; <em>build real proof.</em>
            </h2>
            <p className="hx-programmes__lead">{homepageProgrammeLead(loading, confirmed)}</p>
          </div>
          <Link className="hx-more" to="/programmes">
            Compare all 6 programmes
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
            {confirmed ? null : (
              <p className="hx-prog-note" role="status">
                <strong>{STATUS_NOT_CONFIRMED}.</strong> {AVAILABILITY_UNKNOWN}{" "}
                {onRetry ? (
                  <>
                    <button type="button" onClick={onRetry}>Try again</button>
                    {" · "}
                  </>
                ) : null}
                <Link to="/programmes">See programmes</Link>
              </p>
            )}
            <ul className="hx-live-courses-grid" aria-label="All 6 programmes and courses">
              {[
                {
                  slug: "data-analytics",
                  to: "/programmes/data-analytics-pro",
                  category: "DATA & SQL · FOR FUTURE DATA ANALYSTS",
                  status: "✓ Open · 15 Lessons",
                  title: "Data Analytics",
                  desc: "Go from cleaning raw spreadsheets to writing real SQL queries and defending a commercial revenue review.",
                  skills: ["SQL Joins & CTEs", "Spreadsheets", "Margin Audit"],
                  meta: "5 modules · 15 lessons · 1 capstone",
                  img: photoAnalytics,
                  alt: "Data Analytics workspace preview",
                },
                {
                  slug: "product-management",
                  to: "/programmes/product-management",
                  category: "PRODUCT STRATEGY · FOR FUTURE PMs",
                  status: "✓ Open · 15 Lessons",
                  title: "Product Management",
                  desc: "Investigate real store operations bottlenecks, frame the user problem, and write a 6-week engineering PRD.",
                  skills: ["PRD Writing", "User Research", "Feature Triage"],
                  meta: "5 modules · 15 lessons · 1 capstone",
                  img: photoProduct,
                  alt: "Product Management studio preview",
                },
                {
                  slug: "python-programming",
                  to: "/courses/python-programming",
                  category: "PYTHON & ETL · FOR BACKEND & DATA ROLES",
                  status: "✓ Open · 15 Lessons",
                  title: "Python Programming & Automation",
                  desc: "Build automated data cleaning scripts, schema validators, and resilient ETL pipelines with pytest.",
                  skills: ["Python 3", "ETL Pipelines", "Automated Tests"],
                  meta: "5 modules · 15 lessons · 1 capstone",
                  img: photoScience,
                  alt: "Python engineering workspace preview",
                },
                {
                  slug: "data-science-ai",
                  to: "/programmes/data-science-ai",
                  category: "DUAL TRACK · SQL + PYTHON COMBINED",
                  status: "✓ Open · 30 Lessons",
                  title: "Data Science & AI",
                  desc: "Master both SQL revenue analytics and Python automation pipelines to build and validate retention models.",
                  skills: ["SQL + Python", "Cohort Analysis", "Churn Modelling"],
                  meta: "10 modules · 30 lessons · 2 capstones",
                  img: photoClass,
                  alt: "Data Science cohort analysis preview",
                },
                {
                  slug: "generative-ai",
                  to: "/programmes/generative-ai-program",
                  category: "APPLIED AI · FOR AI & LLM ENGINEERS",
                  status: "✓ Open · 15 Lessons",
                  title: "Generative AI & LLM Systems",
                  desc: "Build citation-backed RAG search assistants, prompt guardrails, and automated accuracy benchmarks.",
                  skills: ["Grounded RAG", "Prompt Guardrails", "LLM Evals"],
                  meta: "5 modules · 15 lessons · 1 capstone",
                  img: photoCampusPg,
                  alt: "Generative AI evaluation preview",
                },
                {
                  slug: "full-stack-web",
                  to: "/programmes/full-stack",
                  category: "WEB ENGINEERING · FOR FULL-STACK DEVS",
                  status: "✓ Open · 15 Lessons",
                  title: "Full Stack Web Engineering",
                  desc: "Ship end-to-end React + TypeScript interfaces, Node/Express APIs, and safe PostgreSQL payment ledgers.",
                  skills: ["React & TypeScript", "Node REST APIs", "PostgreSQL"],
                  meta: "5 modules · 15 lessons · 1 capstone",
                  img: heroStudent720,
                  alt: "Full-stack engineering preview",
                },
              ].map((item) => (
                <li key={item.slug}>
                  <Link to={item.to} className="hx-live-course-card">
                    <span className="hx-live-course-card__media">
                      <img src={item.img} alt={item.alt} width={800} height={530} loading="lazy" decoding="async" />
                      <span className="hx-live-course-card__badge">{item.status}</span>
                    </span>
                    <span className="hx-live-course-card__body">
                      <span className="hx-live-course-card__cat">{item.category}</span>
                      <strong className="hx-live-course-card__title">{item.title}</strong>
                      <span className="hx-live-course-card__desc">{item.desc}</span>
                      <span className="hx-live-course-card__skills">
                        {item.skills.map((s) => (
                          <span key={s} className="hx-live-course-card__skill">{s}</span>
                        ))}
                      </span>
                      <span className="hx-live-course-card__foot">
                        <span className="hx-live-course-card__meta">{item.meta}</span>
                        <span className="hx-live-course-card__cta">
                          Explore track <ArrowRight />
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hx-sr" aria-hidden="true" style={{ display: "none" }}>
              <ProgrammeGroup
                title="Open now"
                rows={confirmed ? ordered.filter((row) => row.open) : []}
                confirmed={confirmed}
              />
              <ProgrammeGroup
                title="Not open yet"
                rows={confirmed ? ordered.filter((row) => !row.open) : []}
                confirmed={confirmed}
              />
              <ProgrammeGroup
                title="Programmes"
                rows={confirmed ? [] : ordered}
                confirmed={false}
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ── Degrees: two primary doors, UG and PG ───────────────────────────────── */

const DEGREE_DOORS = [
  { level: "UNDERGRADUATE", name: "Undergraduate", short: "UG", param: "ug", text: "Your first degree after school, studied over several years.", img: photoClass, width: 960, height: 640, alt: "Students at long benches in a lecture hall." },
  { level: "POSTGRADUATE", name: "Postgraduate", short: "PG", param: "pg", text: "Specialise after a first degree, alongside work or full time.", img: photoCampusPg, width: 960, height: 640, alt: "Two students studying together outdoors on a campus lawn." },
] as const

export function HomeDegrees() {
  const { degrees } = useDegreeCatalogue()
  return (
    <section id="degrees" className="hx-degrees" aria-labelledby="hx-degrees-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">University &amp; Institutional Pathways</p>
            <h2 id="hx-degrees-title" className="hx-h2">
              Undergraduate &amp; <em>postgraduate pathways.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Academic curriculum tracks built for university articulation and autonomous campus integration. Partner institutions confer the degree while Skylent powers the applied lab and Career OS stack.</p>
        </Reveal>
        <ul className="hx-doors">
          {DEGREE_DOORS.map((door) => {
            const items = degrees.filter((degree) => degree.level === door.level)
            const areas = [...new Set(items.map((degree) => degree.discipline))]
            const modes = [...new Set(items.map((degree) => deliveryModeLabel(degree.deliveryMode)))]
            const plannedOnly = items.every((degree) => degree.sample)
            return (
              <li key={door.short}>
                <Link to={`/education?level=${door.param}`} className="hx-door">
                  <span className="hx-door__media">
                    <img src={door.img} alt={door.alt} width={door.width} height={door.height} loading="lazy" decoding="async" />
                    <span className="hx-door__tag">{plannedOnly ? "Institutional Pathway · Register Interest" : "Includes a published degree"}</span>
                  </span>
                  <span className="hx-door__body">
                    <span className="hx-door__title">
                      {door.name} <span>({door.short})</span>
                    </span>
                    <span className="hx-door__text">{door.text}</span>
                    <span className="hx-door__rows">
                      {areas.length ? (
                        <span className="hx-door__row">
                          <span className="hx-door__k">Planned areas</span>
                          <span>{areas.join(", ")}</span>
                        </span>
                      ) : null}
                      {modes.length ? (
                        <span className="hx-door__row">
                          <span className="hx-door__k">Study</span>
                          <span className="hx-door__modes">
                            {modes.map((mode) => (
                              <span key={mode}>{mode}</span>
                            ))}
                          </span>
                        </span>
                      ) : null}
                    </span>
                    <span className="hx-door__go">
                      {plannedOnly ? `See planned ${door.name.toLowerCase()} areas` : `Explore ${door.name.toLowerCase()} degrees`}
                      <ArrowRight />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ── Career OS walkthrough & Student Portfolio Showcase ──────────────────── */

const JOURNEY = [
  { key: "enrol", title: "Pick a Career Track", sub: "Start free in Skylent OS (+50 Coins)", text: "Choose any of our 6 career tracks and unlock your interactive learning workspace immediately." },
  { key: "learn", title: "Learn Step-by-Step", sub: "Simple written lessons + concept checks", text: "Master concepts in plain language with instant English & Hinglish AI explanations." },
  { key: "build", title: "Practise in Live Labs", sub: "SQL, Python, PRDs & RAG in browser", text: "Run real queries and build real deliverables without installing anything on your laptop." },
  { key: "evidence", title: "Earn Verified Certificate", sub: "Graded capstone + public ID link", text: "Every completed course issues a verifiable SKL certificate linked to your actual project work." },
  { key: "profile", title: "Unlock Career Profile", sub: "Auto-unlocks at 60% course progress", text: "Your completed projects, skills, and certificates come together in one recruiter-ready profile." },
  { key: "prepare", title: "Match & Apply to Roles", sub: "Skill-gap score + interview prep", text: "See how your verified skills match open roles and practise role-specific interview questions." },
] as const

type JourneyKey = (typeof JOURNEY)[number]["key"]

export function CareerJourney({ eyebrow = "Career OS", showLink = true }: { eyebrow?: string; showLink?: boolean } = {}) {
  const walk = useWalkthrough<HTMLElement>(JOURNEY.length, 1650)
  const active = walk.active
  const step = JOURNEY[active]
  return (
    <section ref={walk.rootRef} id="career-os" className="hx-journey" aria-labelledby="hx-journey-title">
      <div className="sky-container">
        <Reveal className="hx-head hx-head--dark" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow">{eyebrow}</p>
            <h2 id="hx-journey-title" className="hx-h2 hx-h2--light">
              From your first lesson <em>to your first application.</em>
            </h2>
          </div>
          <p className="hx-head__aside">See how your completed lessons, SQL queries, and Harbor Desk briefs turn into verifiable portfolio evidence.</p>
        </Reveal>
        <div className="hx-journey__grid" {...walk.regionProps}>
          <div className="hx-journey__nav">
            <ol className="hx-steps" aria-label="How Career OS organises your work">
              {JOURNEY.map((item, i) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={i === active ? "hx-step is-on" : i < active ? "hx-step is-done" : "hx-step"}
                    aria-current={i === active ? "step" : undefined}
                    aria-describedby={i === active ? `hx-step-copy-${item.key}` : undefined}
                    onClick={() => walk.go(i)}
                  >
                    <span className="hx-step__dot" aria-hidden="true" />
                    <span className="hx-step__title">{item.title}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="hx-step__live hx-stable">
              {JOURNEY.map((item, i) => (
                <p id={`hx-step-copy-${item.key}`} key={item.key} className={i === active ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={i !== active}>
                  {item.text}
                </p>
              ))}
            </div>
          </div>
          <div className="hx-journey__stage">
            <p className="hx-journey__note">Interactive Career OS Walkthrough <span className="hx-sr">Illustrative preview · Not connected</span></p>
            <div className="hx-window">
              <div className="hx-window__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>Career OS</em>
              </div>
              <div className="hx-window__body">
                <p className="hx-sr">Illustrative preview · Not connected. {step.title}. {step.text}</p>
                <div className="hx-stable">
                  {JOURNEY.map((item) => (
                    <div key={item.key} className={item.key === step.key ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={item.key !== step.key}>
                      <HomeCareerPlate step={item.key} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hx-window__progress" aria-hidden="true">
                {JOURNEY.map((item, i) => (
                  <span key={item.key} className={i <= active ? "is-on" : undefined} />
                ))}
              </div>
            </div>
            <div className="hx-journey__actions">
              <WalkControls active={active} count={JOURNEY.length} title={step.title} playing={walk.playing} onPrev={walk.prev} onNext={walk.next} onToggle={walk.toggle} />
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

function careerLimits(): string {
  return "Your Career OS profile unlocks automatically once you complete 60% of any course — bringing your verified projects, certificates, and role skill-match score together in one shareable link."
}

function HomeCareerPlate({ step }: { step: JourneyKey }) {
  const content = authoredProgrammeContent(DA_SLUG)
  const facts = courseFacts()
  const programme = facts?.title ?? "Data Analytics"
  const capstone = content?.capstoneTitle ?? facts?.capstoneTitle ?? "Northwind Commercial Review"

  if (step === "enrol") {
    return (
      <div className="hx-royal-plate">
        <div className="hx-royal-plate__top">
          <span className="hx-royal-plate__gold">STAGE 01 · INSTANT WORKSPACE SETUP</span>
          <span className="hx-royal-plate__emerald">✓ +50 Elixir Welcome Bonus</span>
        </div>
        <h3 className="hx-royal-plate__title">Start {programme} in One Click</h3>
        <p className="hx-royal-plate__sub">5 Modules · 15 Guided Lessons · Pre-Loaded Browser SQL Lab · Zero Setup</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Cost to Start</span>
            <strong>₹0 (Free Pilot)</strong>
          </div>
          <div>
            <span>First Lesson</span>
            <strong>What is Data Analytics?</strong>
          </div>
          <div>
            <span>Career OS Unlock</span>
            <strong>At 60% Progress (9/15 Lessons)</strong>
          </div>
        </div>
        <div className="hx-royal-plate__pills">
          <span>SQL Queries</span>
          <span>Spreadsheet Cleaning</span>
          <span>Business Metrics</span>
          <span>Live Browser Lab</span>
        </div>
      </div>
    )
  }
  if (step === "learn") {
    return (
      <div className="hx-royal-plate">
        <div className="hx-royal-plate__top">
          <span className="hx-royal-plate__gold">STAGE 02 · SIMPLE STEP-BY-STEP LESSONS</span>
          <span className="hx-royal-plate__emerald">✓ +5 to +15 Coins / Milestone</span>
        </div>
        <h3 className="hx-royal-plate__title">{facts ? facts.current.title : "SQL Joins & Revenue Hygiene"}</h3>
        <p className="hx-royal-plate__sub">Short, clear readings written in plain language — with instant English &amp; Hinglish AI help</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Reading Time</span>
            <strong>15–20 mins per lesson</strong>
          </div>
          <div>
            <span>Concept Checks</span>
            <strong>3 Module Quizzes (+10 Bonus)</strong>
          </div>
          <div>
            <span>Doubt Support</span>
            <strong>AI Coach + 20-Min Human TA</strong>
          </div>
        </div>
        <div className="hx-royal-plate__pills">
          <span>Plain-English Notes</span>
          <span>Hinglish Intuition</span>
          <span>Instant Quiz Feedback</span>
        </div>
      </div>
    )
  }
  if (step === "build") {
    return (
      <div className="hx-royal-plate">
        <div className="hx-royal-plate__top">
          <span className="hx-royal-plate__gold">STAGE 03 · REAL CAPSTONE PROJECT</span>
          <span className="hx-royal-plate__emerald">✓ Graded on 4-Point Rubric</span>
        </div>
        <h3 className="hx-royal-plate__title">{capstone}</h3>
        <p className="hx-royal-plate__sub">You don’t just watch — you build a real project report that recruiters can actually read</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Step 1</span>
            <strong>Filter 166 valid sales rows</strong>
          </div>
          <div>
            <span>Step 2</span>
            <strong>Find ₹8,12,020 category revenue</strong>
          </div>
          <div>
            <span>Step 3</span>
            <strong>Write executive recommendation</strong>
          </div>
        </div>
        <div className="hx-royal-plate__pills">
          <span>Real Dataset (180 Rows)</span>
          <span>Multi-Table SQL</span>
          <span>Executive Memo</span>
        </div>
      </div>
    )
  }
  if (step === "evidence") {
    return (
      <div className="hx-royal-plate">
        <div className="hx-royal-plate__top">
          <span className="hx-royal-plate__gold">STAGE 04 · VERIFIED CERTIFICATE LINK</span>
          <span className="hx-royal-plate__emerald">✓ Publicly Verifiable at /verify</span>
        </div>
        <h3 className="hx-royal-plate__title">SKL-2026 Verified Credential &amp; Project Proof</h3>
        <p className="hx-royal-plate__sub">Recruiters click your certificate link and immediately see the SQL queries and project you built</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Certificate ID</span>
            <strong>Unique SKL-2026 Code</strong>
          </div>
          <div>
            <span>Attached Proof</span>
            <strong>3 Briefs + 1 Graded Capstone</strong>
          </div>
          <div>
            <span>One-Click Share</span>
            <strong>LinkedIn &amp; Resume Ready</strong>
          </div>
        </div>
        <div className="hx-royal-plate__pills">
          <span>Employer Verifiable</span>
          <span>Rubric Score Shown</span>
          <span>No Fake PDFs</span>
        </div>
      </div>
    )
  }
  if (step === "profile") {
    return (
      <div className="hx-royal-plate">
        <div className="hx-royal-plate__top">
          <span className="hx-royal-plate__gold">STAGE 05 · RECRUITER-READY CAREER PROFILE</span>
          <span className="hx-royal-plate__emerald">✓ Unlocks at 60% Completion</span>
        </div>
        <h3 className="hx-royal-plate__title">Your Skills, Projects &amp; Certificates in One Link</h3>
        <p className="hx-royal-plate__sub">Target Roles: Data Analyst · Business Analyst · Product Manager · AI Engineer</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Verified Projects</span>
            <strong>Northwind &amp; Harbor Desk</strong>
          </div>
          <div>
            <span>Skill Match Engine</span>
            <strong>Live % Overlap with Job Posts</strong>
          </div>
          <div>
            <span>Privacy Control</span>
            <strong>You Choose Public or Private</strong>
          </div>
        </div>
        <div className="hx-royal-plate__pills">
          <span>SQL &amp; Python Proof</span>
          <span>PRD Portfolio</span>
          <span>Verified Badge</span>
        </div>
      </div>
    )
  }
  return (
    <div className="hx-royal-plate">
      <div className="hx-royal-plate__top">
        <span className="hx-royal-plate__gold">STAGE 06 · INTERVIEW PREP &amp; ROLE APPLICATIONS</span>
        <span className="hx-royal-plate__emerald">✓ Role Skill-Gap Matcher</span>
      </div>
      <h3 className="hx-royal-plate__title">Apply with Proof &amp; Practise Mock Interviews</h3>
      <p className="hx-royal-plate__sub">Compare your verified skills against open roles and rehearse real interview questions before you apply</p>
      <div className="hx-royal-plate__metrics">
        <div>
          <span>1. Role Match</span>
          <strong>See matched &amp; missing skills</strong>
        </div>
        <div>
          <span>2. Attach Proof</span>
          <strong>Link your graded capstone</strong>
        </div>
        <div>
          <span>3. Mock Defense</span>
          <strong>Practise timed case questions</strong>
        </div>
      </div>
      <div className="hx-royal-plate__pills">
        <span>Skill-Gap Check</span>
        <span>Application Tracker</span>
        <span>Interview Drills</span>
      </div>
    </div>
  )
}

export function HomeCareer() {
  const [active, setActive] = useState(0)
  const step = JOURNEY[active]
  return (
    <section className="hx-career" aria-labelledby="hx-career-title">
      <div className="sky-container">
        <header className="hx-head">
          <div>
            <p className="hx-eyebrow hx-eyebrow--dark">Step-by-Step From Beginner to Job-Ready</p>
            <h2 id="hx-career-title" className="hx-h2 hx-h2--sm">
              How your learning turns into a <em>recruiter-ready portfolio.</em>
            </h2>
          </div>
          <p className="hx-head__aside">
            New to Skylent? Here is how a first-time learner goes from Lesson 1 to a verified project portfolio and certificate in 6 simple steps.
          </p>
        </header>

        <div className="hx-career__grid">
          <div className="hx-career__nav-col">
            <ol className="hx-career__steps" aria-label="Career OS steps">
              {JOURNEY.map((item, index) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={index === active ? "is-on" : undefined}
                    aria-current={index === active ? "step" : undefined}
                    aria-describedby={index === active ? `hx-home-step-${item.key}` : undefined}
                    onClick={() => setActive(index)}
                  >
                    <span className="hx-career__step-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="hx-career__step-copy">
                      <strong>{item.title}</strong>
                      <small>{item.sub}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="hx-career__live hx-stable">
              {JOURNEY.map((item, index) => (
                <p id={`hx-home-step-${item.key}`} key={item.key} className={index === active ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={index !== active}>
                  {item.text}
                </p>
              ))}
            </div>
          </div>

          <div className="hx-career__stage">
            <p className="hx-sr">Illustrative preview, not connected. {step.title}. {step.text}</p>
            <div className="hx-stable">
              {JOURNEY.map((item) => (
                <div key={item.key} className={item.key === step.key ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={item.key !== step.key}>
                  <HomeCareerPlate step={item.key} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real Student Projects, Verified Certificates & Learner Outcomes (Royal Midnight Navy Theme) */}
        <div className="hx-royal-showcase">
          <div className="hx-royal-showcase__head">
            <div>
              <p className="hx-eyebrow hx-eyebrow--dark" style={{ marginBottom: 6 }}>
                Sample Benchmark Dossiers · Execution Flight Recorder Previews (Illustrative)
              </p>
              <h3 className="hx-royal-showcase__title">
                See How Skylent Flight Recorders Capture V1 → V2 Revisions &amp; Lab Telemetry
              </h3>
              <p className="hx-royal-showcase__sub">
                Every learner builds a defended project dossier and a public verification ID. Below are three illustrative benchmark dossiers demonstrating the public `/verify` Flight Recorder format.
              </p>
            </div>
            <Link className="sk-btn sk-btn-secondary" to="/verify">
              Verify any certificate ID <ArrowRight />
            </Link>
          </div>

          <div className="hx-royal-grid">
            {[
              {
                code: "SKL-2026-DA-EXEMPLAR",
                name: "Data Analytics Benchmark Specimen (Illustrative)",
                role: "Aspiring Data Analyst · Final-Year B.Tech",
                score: "96/100 Project Score",
                track: "Data Analytics · Built in Northwind SQL Lab",
                projectBuilt: "Project Built: Retail Revenue & Discount Leakage Audit",
                finding: "Cleaned 180 raw retail orders in SQL, isolated a 14.5% promo discount leak across ₹8,12,020 net revenue, and presented a Q3 pricing fix.",
                skills: ["SQL Joins & CTEs", "Spreadsheet Audit", "Commercial BI"],
              },
              {
                code: "SKL-2026-PM-EXEMPLAR",
                name: "Product Management Benchmark Specimen (Illustrative)",
                role: "Transitioning to Product Management",
                score: "95/100 Project Score",
                track: "Product Management · Built in Harbor Desk Studio",
                projectBuilt: "Project Built: 12-Store Exception Triage PRD",
                finding: "Analysed 18 store manager interviews and 34 weekend delivery failures to scope a 2-engineer, 6-week mobile triage workflow.",
                skills: ["PRD Scoping", "Problem Framing", "Rollout Governance"],
              },
              {
                code: "SKL-2026-AI-EXEMPLAR",
                name: "Applied AI & RAG Benchmark Specimen (Illustrative)",
                role: "Software Engineer Upskilling in AI",
                score: "97/100 Project Score",
                track: "Generative AI · Built in Grounded RAG Lab",
                projectBuilt: "Project Built: Citation-Grounded Policy Assistant",
                finding: "Built an enterprise RAG pipeline with strict document date filtering and mandatory [doc_id] citations, cutting ungrounded answers to 0%.",
                skills: ["Grounded RAG", "Citation Gates", "Prompt Defense"],
              },
            ].map((dossier) => (
              <Link
                key={dossier.code}
                to={`/verify/${dossier.code}`}
                className="hx-royal-card"
              >
                <div>
                  <div className="hx-royal-card__top">
                    <code className="hx-royal-card__code">{dossier.code}</code>
                    <span className="hx-royal-card__badge">✓ {dossier.score}</span>
                  </div>
                  <strong className="hx-royal-card__name">{dossier.name}</strong>
                  <span className="hx-royal-card__track">{dossier.track}</span>
                  <span className="hx-royal-card__project">{dossier.projectBuilt}</span>
                  <p className="hx-royal-card__quote">“{dossier.finding}”</p>
                </div>
                <div>
                  <div className="hx-royal-card__pills">
                    {dossier.skills.map((s) => (
                      <span key={s} className="hx-royal-card__pill">{s}</span>
                    ))}
                  </div>
                  <span className="hx-royal-card__cta">
                    Inspect verified certificate &amp; project report →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="hx-career__limits" style={{ marginTop: 20 }}>{careerLimits()}</p>
        <Link className="hx-more" to="/career-os">
          Explore Career OS
          <ArrowRight />
        </Link>
      </div>
    </section>
  )
}

/* ── Skylent AI & 20-Min Human Expert Mentor Studio ─────────────────────── */

const AI_DEMO_SCENARIOS = [
  {
    id: "hinglish",
    tabLabel: "🇮🇳 Explain in Simple Hinglish",
    badge: "Hinglish + English Intuition",
    studentQ: "Bhai, SQL mein WHERE aur HAVING dono filter karte hain toh dono mein asli fark kya hai? Simple Hinglish mein samjhao.",
    coachTitle: "Skylent AI Mentor · Instant Hinglish Breakdown",
    coachReply: "Ekdum simple tarike se samajh: WHERE tab kaam karta hai jab table ki raw rows filter karni ho (GROUP BY se pehle). Lekin jab tu SUM() ya COUNT() laga kar group bana leta hai, aur us total par filter lagana ho (jaise 'jin categories ka total revenue ₹1,00,000 se zyada hai'), tab HAVING lagta hai!",
    takeaway: " Rule of thumb: Raw row filter = WHERE · Grouped total filter = HAVING.",
    pills: ["Switch to English", "Run this in SQL Lab", "Give me 1 practice question"],
  },
  {
    id: "debug",
    tabLabel: "🛠️ Fix My SQL / Code Bug",
    badge: "Live Code & Query Debugger",
    studentQ: "Why is my Northwind category revenue total showing ₹9,40,000 instead of ₹8,12,020 when I run SUM(units * unit_price)?",
    coachTitle: "Skylent AI Mentor · Line-by-Line Bug Catch",
    coachReply: "Check two things in your query: (1) Did you subtract the promo discount using (1 - discount_pct / 100.0)? And (2) did you filter out returned orders with WHERE returned = 'no' AND units > 0? Those 14 returned/invalid rows explain the exact ₹1,27,980 gap!",
    takeaway: "Always check row hygiene (returned = 'no') before aggregating revenue.",
    pills: ["Apply fix in Lab", "Check rubric criteria", "Test edge cases"],
  },
  {
    id: "human",
    tabLabel: "👨‍🏫 20-Min Human Expert Help",
    badge: "Guaranteed 20-Min Faculty TA SLA",
    studentQ: "I finished my Capstone SQL query and executive memo, but I'm not sure if my Q2 margin recommendation is strong enough for recruiters.",
    coachTitle: "Human Faculty TA Desk · Verified Mentor Response (11 mins)",
    coachReply: "Reviewed your Northwind draft! Your SQL CTE is 100% accurate. In paragraph 2 of your recommendation, quantify the exact ₹48,200 margin recovery if Electronics discounts are capped at 10% — recruiters love seeing a concrete rupee impact tied to your query.",
    takeaway: "Every enrolled learner gets 1-click access to human Faculty TAs with a 20-minute response SLA.",
    pills: ["Resolved in 11 mins ✓", "Rubric pre-check passed", "Ready for Capstone submission"],
  },
] as const

export function HomeAi() {
  const [activeTab, setActiveTab] = useState<number>(0)
  const current = AI_DEMO_SCENARIOS[activeTab]

  return (
    <section id="skylent-ai" className="hx-ai hx-ai--id" aria-labelledby="hx-ai-title">
      <div className="sky-container">
        <div className="hx-ai__header">
          <div>
            <div className="hx-ai__id">
              <span className="hx-ai__avatar" aria-hidden="true">
                <SkylentBot size={48} />
              </span>
              <span>
                <span className="hx-ai__name">24/7 AI Mentor + 20-Min Human Expert Help</span>
                <span className="hx-ai__role">Never get stuck alone · English &amp; Hinglish Explanations · Live Code Review</span>
              </span>
            </div>
            <h2 id="hx-ai-title" className="hx-h2 hx-h2--sm" style={{ marginTop: 14 }}>
              Stuck on a concept or bug? <em>Get unstuck in seconds.</em>
            </h2>
          </div>
          <p className="hx-head__aside">
            Most online courses leave you alone with recorded videos. Inside Skylent, every lesson has a built-in AI Mentor (with 1-click Hinglish mode) plus real human Faculty TAs who reply within 20 minutes.
          </p>
        </div>

        <div className="hx-ai-studio">
          {/* Left: 3 Interactive Scenario Selector Cards */}
          <div className="hx-ai-studio__tabs" role="tablist" aria-label="Try AI and Mentor scenarios">
            {AI_DEMO_SCENARIOS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeTab === idx}
                className={activeTab === idx ? "hx-ai-tab is-on" : "hx-ai-tab"}
                onClick={() => setActiveTab(idx)}
              >
                <span className="hx-ai-tab__badge">{item.badge}</span>
                <strong className="hx-ai-tab__title">{item.tabLabel}</strong>
                <span className="hx-ai-tab__preview">“{item.studentQ.slice(0, 78)}…”</span>
              </button>
            ))}

            <div className="hx-ai-studio__actions">
              <Link className="sk-btn sk-btn-primary" to="/path">
                Find My Path in 90s
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary" to="/courses/data-analytics">
                Try inside Data Analytics
              </Link>
            </div>
          </div>

          {/* Right: Royal Midnight Navy Live Conversation & Mentor Card */}
          <div className="hx-royal-ai-card" role="tabpanel">
            <div className="hx-royal-ai-card__bar">
              <span className="hx-royal-plate__gold">{current.coachTitle}</span>
              <span className="hx-royal-plate__emerald">● Live Inside Every Lesson</span>
            </div>

            <div className="hx-royal-ai-card__body">
              <div className="hx-royal-ai-card__user">
                <span className="hx-royal-ai-card__who">Learner Question</span>
                <p>“{current.studentQ}”</p>
              </div>

              <div className="hx-royal-ai-card__reply">
                <span className="hx-royal-ai-card__who hx-royal-ai-card__who--mentor">
                  ✓ {current.badge}
                </span>
                <p>{current.coachReply}</p>
                <div className="hx-royal-ai-card__takeaway">
                  <strong>Key Takeaway:</strong> {current.takeaway}
                </div>
              </div>

              <div className="hx-royal-card__pills" style={{ marginTop: 14 }}>
                {current.pills.map((p) => (
                  <span key={p} className="hx-royal-card__pill">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Institutions and closing ─────────────────────────────────────────── */

const INSTITUTION_POINTS = [
  { title: "Practical programmes", text: "Certification and professional programmes your learners take alongside their studies." },
  { title: "A structured learner experience", text: "Lessons, checks, assignments and progress for every enrolled learner." },
  { title: "Evidence learners keep", text: "Each learner keeps a profile of skills, projects and certificates in Career OS." },
] as const

export function HomeInstitutions() {
  return (
    <section className="hx-inst" aria-labelledby="hx-inst-title">
      <div className="sky-container hx-inst__grid">
        <div className="hx-inst__copy">
          <p className="hx-eyebrow hx-eyebrow--dark">For institutions</p>
          <h2 id="hx-inst-title" className="hx-h2 hx-h2--sm">
            Add practical programmes <em>beside your own teaching.</em>
          </h2>
          <p className="hx-inst__text">For colleges, universities and training partners. We map your learners, curriculum and goals together first.</p>
          <Link className="sk-btn sk-btn-secondary" to="/institutions">
            Partner with Skylent
            <ArrowRight />
          </Link>
        </div>
        <ul className="hx-inst__points">
          {INSTITUTION_POINTS.map((point, i) => (
            <li key={point.title}>
              <span className="hx-inst__num" aria-hidden="true">0{i + 1}</span>
              <span className="hx-inst__title">{point.title}</span>
              <span className="hx-inst__ptext">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const SYSTEM_POINTS = [
  { title: "Interactive Execution Over Passive Video", text: "All 6 flagship courses combine written briefings, in-browser SQL and product workspaces, timed Boardroom Cold Calls, and graded capstone deliverables." },
  { title: "Universal Elixir Learning Economy", text: "Earn +50 Elixir on course enrolment, +5 to +25 Elixir on every completed lesson, quiz, assignment, and case study, and 100% Coin Back on ₹99 workshops." },
  { title: "Merit-Gated Career Rise & Verifiable Proof", text: "Unlock Career Rise at 60% curriculum completion with verified skill-gap matching and cryptographic Course & Programme Master (-PGM) credentials." },
] as const

export function HomeSystems() {
  return (
    <section className="hx-systems" aria-labelledby="hx-systems-title">
      <div className="sky-container">
        <header className="hx-head">
          <div>
            <p className="hx-eyebrow hx-eyebrow--dark">Skylent OS and Career OS</p>
            <h2 id="hx-systems-title" className="hx-h2 hx-h2--sm">Learning progress and career work, kept apart until you connect them.</h2>
          </div>
        </header>
        <ul className="hx-systems__list">
          {SYSTEM_POINTS.map((point) => (
            <li key={point.title}>
              <span className="hx-systems__title">{point.title}</span>
              <span className="hx-systems__text">{point.text}</span>
            </li>
          ))}
        </ul>
        <Link className="hx-more" to="/career-os">
          How Career OS works
          <ArrowRight />
        </Link>
      </div>
    </section>
  )
}

export function HomeClosing() {
  return (
    <section className="hx-close hx-close--final" aria-labelledby="hx-close-title">
      <div className="hx-close__glow" aria-hidden="true" />
      <div className="sky-container hx-close__layout">
        <div>
          <h2 id="hx-close-title" className="hx-close__title">
            Ready to build real proof of work? <em>Start free today.</em>
          </h2>
          <p className="hx-close__lead">
            Start any of our 6 self-paced flagship courses for ₹0 during the pilot, book a live ₹99 weekend workshop (with 100% Coin Back), or find your best-fit career track in 90 seconds.
          </p>
        </div>
        <div className="hx-close__actions">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
            Explore programmes
            <ArrowRight />
          </Link>
          <Link className="sk-btn sk-btn-secondary hx-btn" to="/events" style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", borderColor: "rgba(255,255,255,0.28)" }}>
            Explore ₹99 Workshops
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Live ₹99 Workshops Showcase & Clear First-Visitor Comparison ──────── */

export function HomeElixirFlywheel() {
  const workshops = [
    {
      slug: "ai-systems-rag-workshop",
      tag: "LIVE HANDS-ON WORKSHOP · 2 HOURS",
      priceBadge: "₹99 · 100% Coin Back",
      title: "AI Systems & Grounded RAG Masterclass",
      audience: "For Aspiring AI & Software Engineers · Live Build + Q&A",
      desc: "Build a citation-grounded AI assistant from scratch, eliminate LLM hallucinations, and ship a working RAG pipeline in 120 minutes.",
      skills: ["Grounded RAG", "Prompt Guardrails", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
    },
    {
      slug: "commercial-sql-analytics-workshop",
      tag: "LIVE SQL STUDIO · 2 HOURS",
      priceBadge: "₹99 · 100% Coin Back",
      title: "Commercial SQL & Revenue Analytics Bootcamp",
      audience: "For Future Data & Business Analysts · Browser SQL Lab",
      desc: "Write real multi-table SQL joins, CTEs, and window functions on a 180-row retail dataset to isolate hidden discount leakage.",
      skills: ["Multi-Table SQL", "Margin Audit", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
    },
    {
      slug: "product-triage-prd-workshop",
      tag: "LIVE CASE TEARDOWN · 2 HOURS",
      priceBadge: "₹99 · 100% Coin Back",
      title: "Product Strategy & PRD Teardown Workshop",
      audience: "For Future Product Managers & Founders · Real Case Study",
      desc: "Turn messy customer complaints and store operations bottlenecks into a sharp, engineering-ready Product Requirements Document (PRD).",
      skills: ["PRD Writing", "Feature Prioritisation", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
    },
  ] as const

  const comparisonRows = [
    {
      dimension: "How You Learn Every Day",
      skylent: "Write real SQL, Python, PRDs & AI pipelines directly in your browser from Day 1",
      videoLms: "Watch hours of passive recorded videos that you forget in a week",
      bootcamps: "Sit in long Zoom lectures locked behind ₹1.5L–₹3L upfront fees",
    },
    {
      dimension: "When You Get Stuck on a Doubt",
      skylent: "24/7 AI Mentor (English + Hinglish) + Real Human Expert reply within 20 mins",
      videoLms: "Post in dead discussion forums and hope someone replies",
      bootcamps: "Wait 24–48 hours in a support ticket queue",
    },
    {
      dimension: "What You Show Recruiters",
      skylent: "A graded Capstone Project + Publicly Verifiable Certificate ID (/verify)",
      videoLms: "A generic '100% Video Watched' PDF certificate",
      bootcamps: "An unverified completion letter with template projects",
    },
    {
      dimension: "Cost & Risk to Start",
      skylent: "Start any course Free (₹0 Pilot) or try a ₹99 Live Workshop (100% Coin Back)",
      videoLms: "Pay ₹3,000–₹15,000 upfront before testing the workspace",
      bootcamps: "Sign high-interest EMI loans before writing a single line of code",
    },
  ] as const

  return (
    <section className="hxw-goals hx-workshops-band" aria-labelledby="hx-flywheel-title">
      <div className="sky-container">
        {/* Part 1: Goated ₹99 Live Workshops & Webinars in Royal Midnight Navy Theme */}
        <div className="hx-royal-showcase__head" style={{ marginBottom: 24 }}>
          <div>
            <p className="hx-eyebrow hx-eyebrow--dark" style={{ marginBottom: 6 }}>
              Live Weekend Workshops &amp; Masterclasses · Zero-Risk Entry
            </p>
            <h2 id="hx-flywheel-title" className="hx-h2 hx-h2--sm">
              Start with a <em>₹99 Live Workshop.</em> Get 100% Back as Learning Credits.
            </h2>
            <p className="hx-royal-showcase__sub">
              Want to experience Skylent live before committing to a full track? Join a 2-hour weekend builder workshop for just ₹99 — you get a Workshop Certificate plus all 99 Elixir Coins credited back to your wallet to unlock industry Case Studies.
            </p>
          </div>
          <Link className="sk-btn sk-btn-primary hx-btn" to="/events">
            See all ₹99 Workshops &amp; Webinars
            <ArrowRight />
          </Link>
        </div>

        <div className="hx-royal-grid">
          {workshops.map((ws) => (
            <Link key={ws.slug} to="/events" className="hx-royal-card">
              <div>
                <div className="hx-royal-card__top">
                  <code className="hx-royal-card__code">{ws.tag}</code>
                  <span className="hx-royal-card__badge">★ {ws.priceBadge}</span>
                </div>
                <strong className="hx-royal-card__name">{ws.title}</strong>
                <span className="hx-royal-card__track">{ws.audience}</span>
                <p className="hx-royal-card__quote">{ws.desc}</p>
              </div>
              <div>
                <div className="hx-royal-card__pills">
                  {ws.skills.map((s) => (
                    <span key={s} className="hx-royal-card__pill">{s}</span>
                  ))}
                </div>
                <span className="hx-royal-card__cta">{ws.cta}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Simple 4-Step Cashback Ribbon */}
        <div className="hx-coin-strip" aria-label="How the ₹99 workshop cashback works">
          <div className="hx-coin-strip__item">
            <span className="hx-coin-strip__num">01</span>
            <div>
              <strong>Book Any ₹99 Workshop</strong>
              <span>2-hour live weekend build session</span>
            </div>
          </div>
          <div className="hx-coin-strip__item">
            <span className="hx-coin-strip__num">02</span>
            <div>
              <strong>Get 99 Coins Back Instantly</strong>
              <span>100% 1:1 cashback in your Skylent wallet</span>
            </div>
          </div>
          <div className="hx-coin-strip__item">
            <span className="hx-coin-strip__num">03</span>
            <div>
              <strong>Earn +50 Coins on Free Courses</strong>
              <span>Plus +5 to +25 Coins on every lesson &amp; quiz</span>
            </div>
          </div>
          <div className="hx-coin-strip__item">
            <span className="hx-coin-strip__num">04</span>
            <div>
              <strong>Unlock Industry Case Studies</strong>
              <span>Redeem coins for bonus SQL &amp; Product cases</span>
            </div>
          </div>
        </div>

        {/* Part 2: Crystal-Clear First-Time Visitor Comparison Table */}
        <div className="hx-moat-compare" aria-label="How Skylent OS compares with traditional platforms">
          <div className="hx-moat-compare__head">
            <div>
              <p className="hx-eyebrow hx-eyebrow--dark" style={{ marginBottom: 6 }}>
                Why First-Time Learners Choose Skylent
              </p>
              <h3 className="hx-moat-compare__title">
                How Skylent compares with passive video courses &amp; ₹2L bootcamps
              </h3>
            </div>
            <div className="hx-moat-compare__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore Free Pilot Courses
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary hx-btn" to="/events">
                Try a ₹99 Workshop
              </Link>
            </div>
          </div>
          <div className="hx-moat-table-wrap">
            <table className="hx-moat-table">
              <thead>
                <tr>
                  <th scope="col">What Matters to You</th>
                  <th scope="col" className="is-skylent">Skylent OS (Learn by Doing)</th>
                  <th scope="col">Recorded Video Courses</th>
                  <th scope="col">Traditional ₹2L Bootcamps</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row">{row.dimension}</th>
                    <td className="is-skylent">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#dcfce7", color: "#15803d", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>✓</span>
                        <strong>{row.skylent}</strong>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 700 }}>✕</span>
                        <span>{row.videoLms}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 700 }}>✕</span>
                        <span>{row.bootcamps}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeInstitutionalArchitecture() {
  const [activeTab, setActiveTab] = useState<"envA" | "envB" | "rubric">("envB")

  return (
    <section
      aria-labelledby="hx-inst-arch-title"
      style={{
        background: "linear-gradient(145deg, #10263d 0%, #183750 100%)",
        borderTop: "1px solid rgba(196, 184, 255, 0.42)",
        borderBottom: "1px solid rgba(196, 184, 255, 0.42)",
        padding: "clamp(40px, 5vw, 68px) 0",
        color: "#ffffff",
      }}
    >
      <div className="sky-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#c4b8ff", font: "700 11.5px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              SKYLENT APPLIED WORK MODEL · SIMULATED LABS TO REAL PARTNER FIELDWORK
            </p>
            <h2 id="hx-inst-arch-title" style={{ margin: 0, fontSize: "clamp(24px, 3.2vw, 38px)", color: "#ffffff", fontFamily: "var(--font-display)", lineHeight: 1.12 }}>
              From Simulated Enterprise Units to Real Partner Fieldwork &amp; Flight Recorders
            </h2>
          </div>
          <div role="tablist" aria-label="Institutional Environments" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "envB"}
              onClick={() => setActiveTab("envB")}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: activeTab === "envB" ? "1px solid #c4b8ff" : "1px solid rgba(255,255,255,0.22)",
                background: activeTab === "envB" ? "#5142b5" : "rgba(15,23,42,0.65)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              01 · Real Partner Fieldwork (Work Exchange)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "envA"}
              onClick={() => setActiveTab("envA")}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: activeTab === "envA" ? "1px solid #c4b8ff" : "1px solid rgba(255,255,255,0.22)",
                background: activeTab === "envA" ? "#5142b5" : "rgba(15,23,42,0.65)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              02 · 6 Simulated Enterprise Labs (Env A)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "rubric"}
              onClick={() => setActiveTab("rubric")}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: activeTab === "rubric" ? "1px solid #c4b8ff" : "1px solid rgba(255,255,255,0.22)",
                background: activeTab === "rubric" ? "#5142b5" : "rgba(15,23,42,0.65)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              03 · L1–L5 &amp; 5-Dimension Flight Recorder
            </button>
          </div>
        </div>

        {activeTab === "envB" ? (
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ background: "rgba(15,23,42,0.68)", border: "1px solid rgba(52,211,153,0.45)", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.18)", border: "1px solid rgba(52,211,153,0.45)", color: "#34d399", fontSize: 11.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  ENVIRONMENT B · SKYLENT WORK ASSIGNMENT EXCHANGE (CUTTACK–BHUBANESWAR &amp; INDIA-WIDE HYBRID)
                </span>
                <Link to="/contact?for=institution" style={{ color: "#c4b8ff", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                  Submit a Partner Organisation Problem →
                </Link>
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.88)", fontSize: 14.5, lineHeight: 1.6 }}>
                After mastering Environment A simulations, learners qualify for <strong>supervised fieldwork with real MSMEs, local manufacturers, clinics (non-clinical workflows), NGOs, startups, and colleges</strong>. Real organisations submit scoped operational problems; Skylent faculty validate permissions and supervise V1 → V2 delivery.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <article style={{ background: "rgba(15,23,42,0.62)", border: "1px solid rgba(196, 184, 255,0.36)", borderRadius: 14, padding: 20 }}>
                <span style={{ color: "#c4b8ff", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>FIELDWORK ARCHETYPE 01 · MSME &amp; DISTRIBUTION</span>
                <h3 style={{ margin: "6px 0 8px", fontSize: 17.5, color: "#ffffff" }}>Regional Distributor Margin &amp; Return Leakage Audit</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                  <strong>Problem Scope:</strong> 4,000+ anonymised invoice rows with falling SKU margins. Learners isolate discount leakage, submit V1 SQL/sheet memo, and incorporate supervisor V2 critique.
                </p>
              </article>
              <article style={{ background: "rgba(15,23,42,0.62)", border: "1px solid rgba(196, 184, 255,0.36)", borderRadius: 14, padding: 20 }}>
                <span style={{ color: "#c4b8ff", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>FIELDWORK ARCHETYPE 02 · STARTUP &amp; SaaS OPS</span>
                <h3 style={{ margin: "6px 0 8px", fontSize: 17.5, color: "#ffffff" }}>Onboarding Drop-Off &amp; Support Ticket Triage</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                  <strong>Problem Scope:</strong> Categorise 150 support escalations, write a 2-week engineering fix PRD, and defend trade-offs before the partner product lead.
                </p>
              </article>
              <article style={{ background: "rgba(15,23,42,0.62)", border: "1px solid rgba(196, 184, 255,0.36)", borderRadius: 14, padding: 20 }}>
                <span style={{ color: "#c4b8ff", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>FIELDWORK ARCHETYPE 03 · NGO &amp; CLINIC WORKFLOWS</span>
                <h3 style={{ margin: "6px 0 8px", fontSize: 17.5, color: "#ffffff" }}>Non-Clinical Appointment Queue &amp; Impact Reporting</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                  <strong>Problem Scope:</strong> Strict privacy-gated operational reporting on wait-time bottlenecks and field survey data hygiene, signed off by faculty reviewers.
                </p>
              </article>
            </div>
          </div>
        ) : null}

        {activeTab === "envA" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {[
              ["01 · Northwind Commerce", "Data & Decision Sciences", "Revenue leakage, returns, pricing tiers, and SQL business intelligence (Live Now)."],
              ["02 · Harbor Desk SaaS", "Business & Product Management", "Customer retention, SLA incident prioritisation, and executive PRDs (Live Now)."],
              ["03 · FinGrid UPI Switch", "Financial Operations Simulation", "Simulated payment reconciliation, webhook retry deduplication, and risk controls."],
              ["04 · BazaarKart Logistics", "Industry & Supply Chain", "Delivery delay root-cause analysis, route efficiency, and warehouse SLA tracking."],
              ["05 · PulseAI", "AI & Evaluation Lab", "RAG reliability, prompt evaluation rubrics, data hygiene, and hallucination checks."],
              ["06 · Skylent Digital Systems", "Computing & Full-Stack", "API contracts, automated QA assertions, deployment readiness, and security checks."],
            ].map(([title, school, desc]) => (
              <div key={title} style={{ background: "rgba(15,23,42,0.62)", border: "1px solid rgba(196, 184, 255,0.34)", borderRadius: 14, padding: 18 }}>
                <span style={{ color: "#34d399", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{school}</span>
                <h3 style={{ margin: "6px 0", fontSize: 17, color: "#ffffff" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "rubric" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              {[
                ["15% · Knowledge", "First-principles conceptual understanding"],
                ["30% · Execution", "Browser lab tasks & edge-case accuracy"],
                ["20% · Judgement", "Trade-off reasoning under constraints"],
                ["15% · Oral Defence", "Boardroom Cold Call & stakeholder clarity"],
                ["20% · V1 → V2 Revision", "Measurable improvement after faculty critique"],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(15,23,42,0.65)", border: "1px solid rgba(196, 184, 255,0.38)", borderRadius: 12, padding: 16 }}>
                  <strong style={{ color: "#c4b8ff", fontSize: 17, display: "block", marginBottom: 4 }}>{k}</strong>
                  <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "rgba(15,23,42,0.65)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: "16px 20px" }}>
              <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)" }}>
                <strong>5 Internal Competency Levels:</strong> L1 Foundation → L2 Guided Practice → L3 Independent Execution → L4 Professional Practice → L5 Advanced Practice
              </span>
              <Link to="/verify" style={{ padding: "8px 16px", borderRadius: 999, background: "#5142b5", color: "#ffffff", border: "1px solid rgba(196, 184, 255, 0.45)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Open Public Flight Recorder Registry →
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

