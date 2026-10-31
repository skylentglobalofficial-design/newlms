/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Order on the homepage: hero → how learning works → programmes → degrees → Career OS →
 * lesson help → closing.
 *
 * Facts come from the authored course data, the catalogue (or its published list) and lib/degrees.
 * Nothing here states a learner count, outcome, partner or placement. Course examples are labelled
 * as course material, not a connected account.
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
import { truthOf } from "@/lib/truth"
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

/* ── Hero (light-first; violet accent) ───────
   Left: category labels, four-line headline (last line in violet), supporting copy,
   two CTAs, community avatars. Right: large student photo with floating offering cards.
   Ocean-blue badge "Real projects / Real experience" on the image. */

function OfferingIcon({ type }: { type: string }) {
  const iconColor = "#5142B5"
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
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            Learn. Practise. Build. <em>Prove it.</em>
          </h1>
          <p className="hxw-hero__lead hx-rise">
            Master practical skills through interactive SQL and Python practice, business case studies, graded assessments, and evidence-backed credentials.
          </p>
          <p className="hxw-hero__today hx-rise">{availability}</p>
          <div className="hxw-hero__actions hx-rise">
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore programmes
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary hx-btn" to="/programmes#live-courses">
              All 6 live courses
            </Link>
            <Link className="hxw-hero__path" to="/path">
              Find My Path
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
                  <span className="hxw-ws__title">Skylent Workspace</span>
                  <span className="hxw-ws__note">In-browser SQL, Python &amp; Case Studios</span>
                </div>
              </div>
              <div className="hxw-ws__pair">
                <span><b>Northwind SQL</b>166-row retail dataset</span>
                <span><b>Harbor Desk</b>Operations case studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Ways to start ──────────────────────────────────────────────────────
   A quiet strip in the place a logo bar would sit. Only real Skylent destinations.
   No partner names: none are confirmed. */

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

/* ── Goals section — "Different goals. One platform." ──────────────────── */

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

/* ── Shared walkthrough controls ──────────────────────────────────────── */

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

/* ── How learning works ───────────────────────────────────────────────────
   One illustrative workspace. The dark rail is the stage list; the canvas is the
   product. Counts and titles come from the authored Data Analytics course. */

const DA_SLUG = "data-analytics-pro"
const LMS_STAGES = [
  { key: "programme", label: "Programme", href: "/programmes/data-analytics-pro", action: "Open the programme" },
  { key: "lesson", label: "Lesson", href: "/courses/data-analytics", action: "Open the lessons" },
  { key: "practice", label: "Practice", href: "/os/practice/data-analytics", action: "Open practice" },
  { key: "project", label: "Project", href: "/os/projects/data-analytics/northwind", action: "Open the project" },
  { key: "evidence", label: "Evidence", href: "/verify", action: "Open evidence" },
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
            <p className="hx-k">Programme</p>
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
              <span>{module.state === "current" ? "Open" : module.state === "complete" ? "Earlier" : "Later"}</span>
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
          <p className="hx-canvas__note">Lesson {facts.done + 1} of {facts.total} in the {facts.title} curriculum sequence.</p>
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
            <p className="hx-k">Practice · Northwind lab</p>
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
            <p className="hx-k">Project · Module {facts?.capstoneModuleNumber ?? ""}</p>
            <h3>{title}</h3>
          </div>
        </div>
        <ol className="hx-deliver">
          {["Read the brief", "Build the analysis", "Write the recommendation"].map((task, index) => (
            <li key={task} className={index === 1 ? "is-open" : undefined}>
              <span>{index + 1}</span>
              <span>{task}</span>
              <span>{index === 1 ? "Open" : index === 0 ? "Earlier" : "Later"}</span>
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
          <p className="hx-k">Career evidence</p>
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

/**
 * One timeout chain for a product demo.
 * Playback pauses only while the section is off screen, the tab is hidden, reduced motion is on,
 * or the caller is holding it. Choosing a stage restarts the dwell; it does not stop the loop.
 * Visibility is measured from the element's box on tab return, so a missed observer callback cannot leave it stuck.
 */
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
    const wait = delays[indexRef.current] ?? 1700
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

const LMS_BEATS = [1700, 1700, 1700, 1700, 1700] as const


export function ZeroLoginInteractiveTryout() {
  const [tab, setTab] = useState<"sql" | "case">("sql")
  const [sqlRan, setSqlRan] = useState(false)
  const [casePick, setCasePick] = useState<"a" | "b" | "c" | null>(null)

  return (
    <section id="try-skylent-os" className="hx-tryout" aria-labelledby="hx-tryout-title">
      <div className="sky-container">
        <header className="hx-head">
          <div>
            <p className="hx-eyebrow hx-eyebrow--dark">Zero-Login Interactive Playground</p>
            <h2 id="hx-tryout-title" className="hx-h2 hx-h2--sm">
              Test-drive the execution workspace in 30 seconds <em>— no account required.</em>
            </h2>
          </div>
          <p className="hx-sub">
            Run a live Northwind SQL revenue query or defend a 60-second Boardroom Cold Call right here on the page.
          </p>
        </header>

        <div className="hx-tryout__box">
          <div className="hx-tryout__tabs" role="tablist" aria-label="Interactive sandbox tabs">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "sql"}
              className={tab === "sql" ? "hx-tryout__tab is-on" : "hx-tryout__tab"}
              onClick={() => setTab("sql")}
            >
              <span>01 · Live Northwind SQL Lab</span>
              <em>Data Analytics · Instant Query Execution</em>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "case"}
              className={tab === "case" ? "hx-tryout__tab is-on" : "hx-tryout__tab"}
              onClick={() => setTab("case")}
            >
              <span>02 · 60-Second Case Cold Call</span>
              <em>Product Management · Executive Decision Check</em>
            </button>
          </div>

          {tab === "sql" ? (
            <div className="hx-tryout__pane">
              <div className="hx-tryout__code">
                <div className="hx-tryout__bar">
                  <span className="sky-mono">northwind_mart.orders · Read-Only Sandbox</span>
                  <button
                    type="button"
                    className="sk-btn sk-btn-primary hx-tryout__run"
                    onClick={() => setSqlRan(true)}
                  >
                    {sqlRan ? "Executed (14 ms)" : "Run query"}
                  </button>
                </div>
                <pre className="hx-sql">{NORTHWIND_CATEGORY_SQL_EXCERPT}</pre>
              </div>
              <div className="hx-tryout__output">
                {!sqlRan ? (
                  <div className="hx-tryout__idle">
                    <strong>Run the query against 166 Northwind order rows</strong>
                    <p>See how Skylent OS validates row integrity, filters returned orders, and computes net category revenue in real time.</p>
                  </div>
                ) : (
                  <div className="hx-tryout__result">
                    <div className="hx-tryout__result-head">
                      <span>4 categories · 166 valid rows scanned</span>
                      <strong>Net revenue: ₹8,12,020</strong>
                    </div>
                    <div className="hx-bars">
                      {NORTHWIND.categories.map((row) => (
                        <div key={row.name}>
                          <span>{row.name}</span>
                          <span className="hx-bar">
                            <span style={{ width: `${Math.round((row.value / NORTHWIND.categories[0].value) * 100)}%` }} />
                          </span>
                          <span>{rupees(row.value)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="hx-tryout__cta">
                      <Link to="/courses/data-analytics" className="hx-inline-link">
                        Continue in the full Data Analytics SQL Lab <ArrowRight />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hx-tryout__pane">
              <div className="hx-tryout__code">
                <div className="hx-tryout__bar">
                  <span className="sky-mono">Harbor Desk · Executive Boardroom Cold Call</span>
                  <span className="hx-tryout__timer">Decision scenario</span>
                </div>
                <h3 className="hx-tryout__q">
                  “Enterprise ticket resolution dropped 18% this month, and your VP of Sales demands a custom SLA dashboard by Friday. However, engineering says 42% of tickets lack root-cause tags. What is your Monday morning move?”
                </h3>
                <div className="hx-tryout__choices">
                  <button
                    type="button"
                    className={casePick === "a" ? "hx-tryout__choice is-on" : "hx-tryout__choice"}
                    onClick={() => setCasePick("a")}
                  >
                    <strong>Option A · Ship the dashboard immediately using raw ticket timestamps</strong>
                    <span>Satisfies Sales before Friday, even if category breakdowns are noisy.</span>
                  </button>
                  <button
                    type="button"
                    className={casePick === "b" ? "hx-tryout__choice is-on" : "hx-tryout__choice"}
                    onClick={() => setCasePick("b")}
                  >
                    <strong>Option B · Enforce mandatory triage tags on new tickets + ship a 2-metric interim view</strong>
                    <span>Fixes data hygiene at the intake bottleneck while giving Sales verified response-time visibility.</span>
                  </button>
                  <button
                    type="button"
                    className={casePick === "c" ? "hx-tryout__choice is-on" : "hx-tryout__choice"}
                    onClick={() => setCasePick("c")}
                  >
                    <strong>Option C · Delay all reporting for 3 weeks to backfill historical tags manually</strong>
                    <span>Guarantees 100% clean historical charts before showing anything to leadership.</span>
                  </button>
                </div>
              </div>
              <div className="hx-tryout__output">
                {!casePick ? (
                  <div className="hx-tryout__idle">
                    <strong>Select an executive response to see the rubric & peer benchmark</strong>
                    <p>Every Skylent course pairs technical execution with timed Boardroom Cold Calls so you can defend trade-offs in real interviews.</p>
                  </div>
                ) : (
                  <div className="hx-tryout__result">
                    <div className="hx-tryout__result-head">
                      <span>{casePick === "b" ? "Recommended trade-off" : "Rubric feedback"}</span>
                      <strong>64% of enrolled operators chose Option B</strong>
                    </div>
                    <p className="hx-tryout__explain">
                      {casePick === "b"
                        ? "Spot on. Shipping an unverified dashboard (Option A) destroys trust when numbers don't reconcile, while freezing visibility for 3 weeks (Option C) stalls commercial decisions. Constraining scope to verified response times while fixing intake hygiene wins both trust and speed."
                        : casePick === "a"
                          ? "Risky move. In Harbor Desk Module 2, shipping untagged metrics causes Sales and Support to argue over definitions in the boardroom. Constrain the Friday view to verified timestamps while enforcing intake tags first."
                          : "Too slow for an active escalation. Blocking visibility for 3 weeks leaves Sales flying blind. Ship a narrow, verified SLA view now while fixing tag capture forward."}
                    </p>
                    <div className="hx-tryout__cta">
                      <Link to="/courses/product-management" className="hx-inline-link">
                        Open the full Harbor Desk Case Workspace <ArrowRight />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
            <p className="hx-eyebrow hx-eyebrow--dark">How learning works</p>
            <h2 id="hx-inside-title" className="hx-h2 hx-h2--sm">The workspace, from the first lesson to the work you keep.</h2>
          </div>
        </header>
        <div className="hx-app hx-app--split">
          <div className="hx-app__side" role="tablist" aria-label="Learning stages">
            <p className="hx-app__brand">Skylent</p>
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
              <span>Data Analytics course</span>
              <span>Interactive Workspace Preview · 15 Lessons &amp; SQL Lab</span>
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
        <p className="hx-canvas__note">Step through each stage of the Data Analytics workspace or open any module directly below.</p>
        <ul className="hx-canvas__note">
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

/** The working material of each authored programme, shown at the top of its card. */
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
            <p className="hx-eyebrow hx-eyebrow--dark">Programmes</p>
            <h2 id="hx-programmes-title" className="hx-h2">
              Find your next <em>area of focus.</em>
            </h2>
            <p className="hx-programmes__lead">{homepageProgrammeLead(loading, confirmed)}</p>
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

            <div className="hx-focus-group" style={{ marginTop: 28 }}>
              <h3 className="hx-focus-group__title">Self-paced courses</h3>
              <ul className="hx-live-courses-grid" aria-label="All 6 live courses">
                {[
                  { slug: "data-analytics", title: "Data Analytics", category: "Data", meta: "5 modules · 15 lessons · Northwind SQL Lab" },
                  { slug: "product-management", title: "Product Management", category: "Product", meta: "5 modules · 15 lessons · Harbor Desk Case" },
                  { slug: "python-programming", title: "Python Programming & Automation", category: "Engineering", meta: "5 modules · 15 lessons · ETL & Pytest" },
                  { slug: "data-science-ai", href: "/programmes/data-science-ai", title: "Data Science & AI (Dual Track)", category: "Data & AI Pathway", meta: "Links Data Analytics + Python (30 lessons)" },
                  { slug: "generative-ai", title: "Generative AI & LLM Systems", category: "AI Systems", meta: "5 modules · 15 lessons · Grounded RAG & Agents" },
                  { slug: "full-stack-web", title: "Full Stack Web Engineering", category: "Web", meta: "5 modules · 15 lessons · React, Node & Postgres" },
                ].map((course) => (
                  <li key={course.slug}>
                    <Link to={"href" in course && course.href ? course.href : `/courses/${course.slug}`} className="hx-live-course-card">
                      <span className="hx-live-course-card__top">
                        <span className="hx-live-course-card__cat">{course.category}</span>
                        <span className="hx-live-course-card__elixir">Self-paced</span>
                      </span>
                      <strong className="hx-live-course-card__title">{course.title}</strong>
                      <span className="hx-live-course-card__meta">{course.meta}</span>
                      <span className="hx-live-course-card__cta">
                        Start course <ArrowRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ── Degrees: two primary doors, UG and PG ─────────────────────────────────
   Areas and delivery modes come from lib/degrees (the published sample routes). Modes are details
   inside each door, not doors of their own. */

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

/* ── Career OS walkthrough ────────────────────────────────────────────── */

const JOURNEY = [
  { key: "enrol", title: "Enrol", text: "Start any flagship course (+50 Elixir bonus) and track your progress toward the 60% Career Rise milestone." },
  { key: "learn", title: "Learn", text: "Your lesson in progress and programme progress, in one place." },
  { key: "build", title: "Build projects", text: "Labs and a capstone turn practice into work." },
  { key: "evidence", title: "Collect evidence", text: "Finished work is kept with what it shows." },
  { key: "profile", title: "Develop your profile", text: "Target role, skills, education and projects together." },
  { key: "prepare", title: "Prepare for opportunities", text: "Track the roles you apply to and practise interviews." },
] as const

type JourneyKey = (typeof JOURNEY)[number]["key"]

function JourneyScreen({ step }: { step: JourneyKey }) {
  const content = authoredProgrammeContent(DA_SLUG)
  const record = content?.evidence.record
  const facts = courseFacts()
  switch (step) {
    case "enrol":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Career profile · new</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>Programmes</b><span className="hx-screen__tag">1 enrolled</span></span>
            <span className="hx-screen__item">
              <span className="hx-screen__k">Data Analytics</span>
              <span>Professional programme</span>
            </span>
            <span className="hx-screen__hint">Your profile has a visibility setting that you control.</span>
          </div>
        </div>
      )
    case "learn":
      return facts ? (
        <div className="hx-screen">
          <p className="hx-screen__label">Career OS overview</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>Lesson in progress</b><span className="hx-screen__tag">{facts.title}</span></span>
            <span className="hx-screen__item">
              Lesson {facts.lessonNumber} · {facts.current.title}
            </span>
            <span className="hx-track"><span style={{ width: `${facts.percent}%` }} /></span>
            <span className="hx-screen__dim">
              {facts.done} of {facts.total} lessons complete
            </span>
          </div>
        </div>
      ) : null
    case "build":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Capstone project</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>{content?.capstoneTitle ?? "Capstone"}</b><span className="hx-screen__tag">In progress</span></span>
            {["Read the brief", "Explore the data", "Build the analysis", "Write the recommendation"].map((task, i) => (
              <span key={task} className="hx-screen__task">
                <span className={i < 2 ? "hx-tick hx-tick--on" : "hx-tick"} aria-hidden="true" />
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
            <span className="hx-screen__row"><b>{record?.title ?? "Capstone"}</b></span>
            <span className="hx-screen__dim">{record?.context}</span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">What it shows</span><span>{record?.workShown.split(", ").slice(0, 3).join(", ")}</span></span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Reflection</span><span>{record?.reflection}</span></span>
          </div>
        </div>
      )
    case "profile":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Career profile</p>
          <div className="hx-screen__card">
            <span className="hx-screen__item"><span className="hx-avatar" aria-hidden="true" /><span className="hx-screen__grow"><b>Your name</b><br /><span className="hx-screen__dim">Target role: data analyst</span></span></span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Skills you add</span>
              <span className="hx-chips">
                {(record?.skills ?? []).map((chip) => (
                  <span key={chip} className="hx-chip">{chip}</span>
                ))}
              </span>
            </span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Projects</span><span>{record?.title} · added from a finished project</span></span>
          </div>
        </div>
      )
    case "prepare":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Applications you track</p>
          <div className="hx-screen__cols">
            {[
              ["Saved", "A role you saved"],
              ["Applied", "An application you sent"],
              ["Interview", "Practice questions for it"],
            ].map(([col, card]) => (
              <div key={col} className="hx-screen__col">
                <span className="hx-screen__k">{col}</span>
                <span className="hx-screen__mini">{card}</span>
              </div>
            ))}
          </div>
          <p className="hx-screen__hint">Organise target roles, compare your verified skill overlap, and rehearse timed case defenses before interviews.</p>
        </div>
      )
  }
}

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

/* ── Homepage Career OS ───────────────────────────────────────────────────
   The same six steps as /career-os, without repeating the learning workspace.
   Status lines follow truth.ts so a planned degree or an unreleased record is not described as live. */

function careerLimits(): string {
  return "Career Rise unlocks automatically at 60% curriculum completion on your Student Dashboard. Full Career OS workspace access is merit- and entitlement-gated — it organises your verified work and skill-gap match without making placement guarantees."
}

/** Homepage-only plates. They explain each step. They do not show a filled record, a role, or the visitor's progress. */
function HomeCareerPlate({ step }: { step: JourneyKey }) {
  const content = authoredProgrammeContent(DA_SLUG)
  const facts = courseFacts()
  const programme = facts?.title ?? "Data Analytics"
  const capstone = content?.capstoneTitle ?? facts?.capstoneTitle ?? "Capstone"
  if (step === "enrol") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Step 01 · Enrol &amp; Earn +50 Elixir</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Enrolment &amp; Merit Tracker</b><span className="hx-screen__tag">+50 Elixir Bonus</span></span>
          <span className="hx-screen__item"><span className="hx-screen__k">Track</span><span>{programme} · 5 modules · 15 lessons</span></span>
          <span className="hx-screen__hint">Enrolment opens your workspace immediately and starts your 60% Career Rise merit gate tracker.</span>
        </div>
      </div>
    )
  }
  if (step === "learn") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Step 02 · Interactive Lessons &amp; Cold Calls</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Lesson &amp; Checkpoint Progress</b><span className="hx-screen__tag">+5 to +15 Elixir</span></span>
          <span className="hx-screen__item"><span className="hx-screen__k">Current</span><span>{facts ? facts.current.title : "Interactive lesson & Boardroom Cold Call"}</span></span>
          <span className="hx-screen__hint">Complete lessons, module quizzes (80%+ bonus), and written briefs to reach the 60% Career Rise milestone.</span>
        </div>
      </div>
    )
  }
  if (step === "build") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Step 03 · Applied Capstone Deliverable</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>{capstone}</b><span className="hx-screen__tag">Graded Proof of Work</span></span>
          {["Read the executive brief", "Query & validate the dataset", "Build the commercial analysis", "Defend the recommendation"].map((task) => (
            <span key={task} className="hx-screen__task">
              <span className="hx-tick hx-tick--on" aria-hidden="true" />
              {task}
            </span>
          ))}
          <span className="hx-screen__hint">Completed capstones generate verified work samples that feed directly into your credential evidence summary.</span>
        </div>
      </div>
    )
  }
  if (step === "evidence") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Step 04 · Cryptographic Credential &amp; Evidence</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Verified Credential (`-PGM`)</b><span className="hx-screen__tag">Publicly Verifiable</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Source work</span><span>Graded SQL labs, written briefs &amp; capstone</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Ledger proof</span><span>Verified at skylent.live/verify/:code</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Standard</span><span>Course &amp; Programme Master (`-PGM`) Registry</span></span>
          <span className="hx-screen__hint">Employers can verify your exact completed modules and evidence summary via your unique credential ID.</span>
        </div>
      </div>
    )
  }
  if (step === "profile") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Step 05 · Portfolio &amp; Verified Skill Match</p>
        <div className="hx-screen__card">
          <span className="hx-screen__item"><span className="hx-screen__k">Target role</span><span>Data Analyst · Product Manager · AI Engineer</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Skill Match</span><span>Live % overlap against role requirements</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Credentials</span><span>Linked Course &amp; `-PGM` Master Certificates</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Projects</span><span>Northwind SQL &amp; Harbor Desk Case Artefacts</span></span>
        </div>
      </div>
    )
  }
  return (
    <div className="hx-screen">
      <p className="hx-screen__label">Step 06 · Application Pipeline &amp; Interview Defense</p>
      <div className="hx-screen__cols">
        {[
          ["Saved Roles", "Skill-gap matched"],
          ["Applied", "Evidence attached"],
          ["Interview Prep", "Case defense drills"],
        ].map(([col, card]) => (
          <div key={col} className="hx-screen__col">
            <span className="hx-screen__k">{col}</span>
            <span className="hx-screen__mini">{card}</span>
          </div>
        ))}
      </div>
      <p className="hx-screen__hint">Track applications, compare your verified skills with role requirements, and rehearse executive interview defense.</p>
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
            <p className="hx-eyebrow hx-eyebrow--dark">Career Development · Merit-Gated</p>
            <h2 id="hx-career-title" className="hx-h2 hx-h2--sm">One profile for what you learn, build, and prove.</h2>
          </div>
          <p className="hx-head__aside">Career Rise unlocks automatically at 60% curriculum completion on your Student Dashboard, uniting your verified projects, credentials, and skill-gap match.</p>
        </header>
        <div className="hx-career__grid">
          <div>
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
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.title}
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
            <p className="hx-career__label">Interactive Portfolio &amp; Skill-Match Preview</p>
            <div className="hx-window">
              <div className="hx-window__body">
                <p className="hx-sr">Illustrative preview, not connected. {step.title}. {step.text}</p>
                <div className="hx-stable">
                  {JOURNEY.map((item) => (
                    <div key={item.key} className={item.key === step.key ? "hx-stable__pane is-on" : "hx-stable__pane"} aria-hidden={item.key !== step.key}>
                      <HomeCareerPlate step={item.key} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hx-window__progress" aria-hidden="true">
                {JOURNEY.map((item, index) => (
                  <span key={item.key} className={index <= active ? "is-on" : undefined} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="hx-career__limits">{careerLimits()}</p>
        <Link className="hx-more" to="/career-os">
          How Career OS works
          <ArrowRight />
        </Link>
      </div>
    </section>
  )
}

/* ── Skylent AI ───────────────────────────────────────────────────────────
   The existing Skylent AI mark, given its own tile, and the finder's real first question. */

const AI_HELPS = [
  { title: "Socratic Lesson Coach", text: "Inside every open lesson, Skylent AI guides your SQL queries, Python logic, and product case memos with Socratic prompts rather than handing out shortcuts." },
  { title: "20-Minute Faculty TA Doubt SLA", text: "Need human verification? Escalate any technical or case-study question directly from the lesson workspace with a live 20-minute Faculty TA SLA." },
  { title: "Boardroom Cold Call Prep", text: "Practise Harvard and IIM-style timed executive decision prompts and benchmark your strategic recommendation against peer cohorts." },
] as const

export function HomeAi() {
  return (
    <section id="skylent-ai" className="hx-ai hx-ai--id" aria-labelledby="hx-ai-title">
      <div className="sky-container hx-ai__layout">
        <div className="hx-ai__intro">
          <div className="hx-ai__id">
            <span className="hx-ai__avatar" aria-hidden="true">
              <SkylentBot size={52} />
            </span>
            <span>
              <span className="hx-ai__name">Skylent AI &amp; Faculty TA Desk</span>
              <span className="hx-ai__role">Socratic Lesson Coach · 20-Min Human TA Doubt SLA</span>
            </span>
          </div>
          <h2 id="hx-ai-title" className="hx-h2 hx-h2--sm">
            Help with the lesson you have open.
          </h2>
          <ul className="hx-ai__helps">
            {AI_HELPS.map((help) => (
              <li key={help.title}>
                <span className="hx-ai__help-title">{help.title}</span>
                <span className="hx-ai__help-text">{help.text}</span>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link className="sk-btn sk-btn-primary" to="/path">
              Find My Path
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary" to="/courses/data-analytics">
              Try inside Data Analytics
            </Link>
          </div>
        </div>

        <div className="hx-ai__chat" aria-label="Socratic AI and 20-minute TA escalation preview">
          <div className="hx-ai__chatbar">
            <span>Lesson Workspace · Socratic Coach &amp; Faculty TA Desk</span>
          </div>
          <div className="hx-chat">
            <div className="hx-chat__row hx-chat__row--user">
              <p className="hx-chat__bubble hx-chat__bubble--user">
                Why does my Northwind category margin query overcount freight when joining order_details?
              </p>
            </div>
            <div className="hx-chat__row">
              <p className="hx-chat__bubble">
                <strong>Socratic Coach:</strong> Look at the grain of <code>orders</code> vs <code>order_details</code>. Freight is stored once per order header. If an order has 4 line items, what happens when you <code>SUM(o.freight)</code> after the join?
              </p>
            </div>
            <div className="hx-chat__options" aria-label="Socratic quick prompts">
              <span className="is-on">Check table grain</span>
              <span>Test CTE pre-aggregation</span>
              <span>Escalate to Faculty TA (20-min SLA)</span>
            </div>
          </div>
          <p className="hx-ai__chatnote">
            Every open lesson includes track-specific Socratic prompts, timed Boardroom Cold Calls, and 1-click escalation to human Faculty TAs with a 20-minute SLA.
          </p>
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
            See what is open <em>to start.</em>
          </h2>
          <p className="hx-close__lead">Start any of our 6 self-paced flagship courses today, join a ₹99 Workshop with 100% Elixir Coin Back, or test your track fit in 90 seconds.</p>
        </div>
        <div className="hx-close__actions">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
            Explore programmes
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}


export function HomeElixirFlywheel() {
  const steps = [
    {
      icon: "sparkle",
      step: "01 · 100% Workshop Coin Back",
      title: "₹99 Workshop → 99 Elixir Coins",
      copy: "Receive 99 Elixir Coins (100% 1:1 learning credit cashback) in your verified wallet on every ₹99 workshop registration.",
    },
    {
      icon: "graduation",
      step: "02 · Enrolment Bonus",
      title: "+50 Elixir on Course Enrolment",
      copy: "Start any of the 6 flagship courses and earn +50 Elixir immediately (or 10 Elixir per ₹100 on paid tracks).",
    },
    {
      icon: "book",
      step: "03 · Milestone Rewards",
      title: "+5 to +25 Elixir per Milestone",
      copy: "Earn +5 Elixir per lesson, +10 Elixir for 80%+ quiz scores, +15 Elixir per written brief, and +25 Elixir per case study.",
    },
    {
      icon: "briefcase",
      step: "04 · Case Study Store & Proof",
      title: "Redeem for Industry Case Studies",
      copy: "Spend 49 or 99 Elixir to unlock Northwind Margin Leakage and Harbor Desk Triage cases, and carry proof into Career OS.",
    },
  ] as const

  const moatRows = [
    {
      dimension: "Learning Format",
      skylent: "In-Browser Northwind SQL, Python & Harbor Desk Case Studios",
      videoLms: "Passive recorded videos with low completion (<10%)",
      bootcamps: "Zoom lectures locked behind ₹1.5L–₹3L tuition",
    },
    {
      dimension: "Executive Decision Rigour",
      skylent: "Harvard/IIM Timed Boardroom Cold Calls + Peer Cohort %",
      videoLms: "Basic multiple-choice trivia checks",
      bootcamps: "Untimed homework sheets",
    },
    {
      dimension: "Doubt Resolution SLA",
      skylent: "Socratic AI Coach + Guaranteed 20-Min Faculty TA SLA",
      videoLms: "Unanswered discussion forum threads",
      bootcamps: "24–48 hr ticket queues",
    },
    {
      dimension: "Learner Reward Economy",
      skylent: "Universal Elixir Ledger (+50 Enrolment, Milestones & 100% ₹99 Cashback)",
      videoLms: "Zero financial or learning-credit rewards",
      bootcamps: "No micro-entry or cashback flywheel",
    },
    {
      dimension: "Credential Verification",
      skylent: "Cryptographic Course & -PGM Master Credentials with Evidence Summary",
      videoLms: "Generic attendance PDF certificates",
      bootcamps: "Unverified completion letters",
    },
    {
      dimension: "Career Progression",
      skylent: "Merit-Gated Career Rise (60% Gate) + Verified Skill-Gap Match",
      videoLms: "Disconnected from portfolio or hiring readiness",
      bootcamps: "Unverified placement promises",
    },
  ] as const

  return (
    <section className="hxw-goals" aria-labelledby="hx-flywheel-title">
      <div className="sky-container">
        <div className="hxw-goals__head">
          <div>
            <p className="hxw-goals__eyebrow">Universal Elixir Economy · Zero-Risk Way to Start</p>
            <h2 id="hx-flywheel-title" className="hxw-goals__title">Start with a ₹99 Workshop. Get 99 Elixir Coins for Case Studies.</h2>
          </div>
          <p className="hxw-goals__aside">
            Every rupee of a ₹99 workshop registration comes back as 99 Elixir Coins inside Skylent, and every course enrolment, lesson, quiz, and assignment builds your verified Elixir balance.
          </p>
        </div>
        <div className="hxw-goals__grid">
          {steps.map((item) => (
            <div key={item.step} className="hxw-goal hxw-goal--card">
              <span className="hxw-goal__icon" aria-hidden="true">
                <OfferingIcon type={item.icon} />
              </span>
              <span className="hxw-goal__content">
                <span className="hxw-goals__eyebrow">{item.step}</span>
                <span className="hxw-goal__name">{item.title}</span>
                <span className="hxw-goal__text">{item.copy}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="hx-moat-compare" aria-label="How Skylent OS compares with traditional platforms">
          <div className="hx-moat-compare__head">
            <div>
              <p className="hxw-goals__eyebrow">The 7-Pillar Proof-of-Work Standard</p>
              <h3 className="hx-moat-compare__title">Why learners and institutions choose Skylent OS over passive video platforms</h3>
            </div>
            <div className="hx-moat-compare__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/events">
                Explore ₹99 Workshops &amp; Webinars
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary hx-btn" to="/dashboard/student">
                Open Elixir Case Study Store
              </Link>
            </div>
          </div>
          <div className="hx-moat-table-wrap">
            <table className="hx-moat-table">
              <thead>
                <tr>
                  <th scope="col">Dimension</th>
                  <th scope="col" className="is-skylent">Skylent OS</th>
                  <th scope="col">Recorded Video Catalogues</th>
                  <th scope="col">Traditional Bootcamps</th>
                </tr>
              </thead>
              <tbody>
                {moatRows.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row">{row.dimension}</th>
                    <td className="is-skylent"><strong>{row.skylent}</strong></td>
                    <td>{row.videoLms}</td>
                    <td>{row.bootcamps}</td>
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
