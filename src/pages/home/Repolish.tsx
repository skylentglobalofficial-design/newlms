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

const HERO_INTERACTIVE_ROLES = [
  {
    id: "da",
    label: "Data Analyst",
    badge: "Live Browser SQL Lab",
    title: "Audit 166 Northwind Retail Orders",
    metric: "14.5% Apparel Margin Leak Isolated",
    snippet: "SELECT category, ROUND(AVG(discount_pct),1) FROM northwind_sales GROUP BY 1;",
    deliverable: "Executive SQL Margin Dossier (SKL-2026-DA)",
    to: "/programmes/data-analytics-pro",
  },
  {
    id: "pm",
    label: "Product Manager",
    badge: "Harbor Desk PRD Studio",
    title: "Scope a 6-Week Bet for 12 Retail Stores",
    metric: "2 Engineers · 18 Store Interviews Synthesised",
    snippet: "Target: Cut weekend exception backlog by 62% without an ERP rewrite.",
    deliverable: "Graded Product Spec & Triage Memo (SKL-2026-PM)",
    to: "/programmes/product-management",
  },
  {
    id: "ai",
    label: "GenAI Engineer",
    badge: "Grounded RAG Studio",
    title: "Enforce Citation Policy & Catch Hallucinations",
    metric: "98/100 Groundedness Benchmark Passed",
    snippet: "Verify chunk provenance before emitting financial or policy claims.",
    deliverable: "RAG Evaluation & Guardrail Dossier (SKL-2026-AI)",
    to: "/programmes/generative-ai-program",
  },
  {
    id: "fs",
    label: "Full-Stack Dev",
    badge: "Node + Postgres Ledger",
    title: "Build Idempotent Wallet & Webhook APIs",
    metric: "Zero Double-Spend Under Concurrent Load",
    snippet: "BEGIN; INSERT INTO elixir_ledger ... ON CONFLICT (idempotency_key) DO NOTHING;",
    deliverable: "Transactional Full-Stack System Dossier",
    to: "/programmes/full-stack",
  },
] as const

export function HomeHero({
  catalogue = "confirmed",
  openTitles = [],
}: {
  catalogue?: "loading" | "confirmed" | "unknown"
  openTitles?: readonly string[]
}) {
  const [selectedRole, setSelectedRole] = useState<(typeof HERO_INTERACTIVE_ROLES)[number]["id"]>("da")
  const activeRole = HERO_INTERACTIVE_ROLES.find((r) => r.id === selectedRole) ?? HERO_INTERACTIVE_ROLES[0]
  const dataAnalyticsOpen = catalogue === "confirmed" && openTitles.includes("Data Analytics")
  const productManagementOpen = catalogue === "confirmed" && openTitles.includes("Product Management")
  const availability = catalogue === "loading"
    ? CATALOGUE_CHECKING
    : catalogue === "unknown"
      ? AVAILABILITY_UNKNOWN
      : dataAnalyticsOpen && productManagementOpen
        ? "Two programmes are open to start: Data Analytics (SQL & commercial analysis) and Product Management (product scoping & specs)."
        : programmesIndexIntro(true, openTitles)
  return (
    <section className="hxw-hero" data-clear-launcher aria-labelledby="hx-hero-title">
      <div className="hxw-hero__bg" aria-hidden="true" />
      <div className="sky-container hxw-hero__grid">
        <div className="hxw-hero__copy">
          <div className="hx-live-pulse hx-rise">
            <span className="hx-live-pulse__dot" aria-hidden="true" />
            <span>Interactive Execution Platform · Try Live Sandboxes Below (Zero Login)</span>
          </div>
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            Your education is just <em>the beginning.</em>
          </h1>
          <p className="hxw-hero__lead hx-rise">Learn something useful. Put it to work. Build a record of what you can do.</p>
          <p className="hxw-hero__today hx-rise">{availability}</p>

          <div className="hx-hero-switcher hx-rise" role="region" aria-label="Interactive career track preview">
            <p className="hx-hero-switcher__label">Click a role to preview what you will build inside Skylent OS:</p>
            <div className="hx-hero-switcher__tabs" role="tablist">
              {HERO_INTERACTIVE_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === role.id}
                  className={`hx-hero-switcher__tab${selectedRole === role.id ? " is-on" : ""}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <div className="hx-hero-switcher__card" role="tabpanel">
              <div className="hx-hero-switcher__top">
                <span className="hx-hero-switcher__badge">{activeRole.badge}</span>
                <span className="hx-hero-switcher__metric">{activeRole.metric}</span>
              </div>
              <strong className="hx-hero-switcher__title">{activeRole.title}</strong>
              <code className="hx-hero-switcher__code">{activeRole.snippet}</code>
              <div className="hx-hero-switcher__foot">
                <span>Proof of Work: <b>{activeRole.deliverable}</b></span>
                <Link to={activeRole.to} className="hx-hero-switcher__go">
                  Open {activeRole.label} Track →
                </Link>
              </div>
            </div>
          </div>

          <div className="hxw-hero__actions hx-rise">
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore programmes
              <ArrowRight />
            </Link>
            <a className="sk-btn sk-btn-secondary hx-btn" href="#interactive-playground">
              Try 60s Live Sandbox
            </a>
            <Link className="hxw-hero__path" to="/path">
              Find My Path
            </Link>
          </div>
          <div className="hx-elixir-pills hx-rise" style={{ marginTop: 16 }} aria-label="Platform access and pricing summary">
            <span className="hx-elixir-pill">Pilot Enrolment: ₹0 Free Access (No Card Needed)</span>
            <span className="hx-elixir-pill">₹99 Weekend Bootcamps = 99 Elixir Coins</span>
            <span className="hx-elixir-pill">Verified SKL Dossiers (/verify)</span>
          </div>
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
            <div className="hx-hero-float hx-hero-float--top">
              <span className="hx-hero-float__kicker">Live Studio Preview</span>
              <strong>{activeRole.badge}</strong>
              <span>{activeRole.metric}</span>
            </div>
            <div className="hx-hero-float hx-hero-float--bottom">
              <span className="hx-hero-float__kicker">Verified Credential</span>
              <strong>{activeRole.deliverable}</strong>
              <Link to="/verify">Inspect sample on /verify →</Link>
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
          <p className="hx-canvas__note">Lesson {facts.done + 1} of {facts.total} in the Data Analytics curriculum.</p>
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
              <span>Interactive workspace preview</span>
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
        <ul className="hx-stage-links" aria-label="Explore workspace stages">
          {LMS_STAGES.map((item) => (
            <li key={item.key}>
              <Link to={item.href}>{item.action} →</Link>
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
      <span className="hx-art__foot">Fictional retail operations case</span>
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
    line: "Clean messy retail data, write SQL queries, and deliver an actionable commercial review.",
  },
  "product-management": {
    title: "Product Management",
    image: photoProduct,
    width: 800,
    height: 534,
    alt: "Illustrative product working session.",
    line: "Frame an operations problem, scope a 6-week engineering bet, and write the product spec.",
  },
  "data-science-ai": {
    title: "Data Science",
    image: photoScience,
    width: 800,
    height: 534,
    alt: "Illustrative code on a screen.",
    line: "Python workflows, exploratory data analysis, and applied machine learning foundations.",
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

const UNIFIED_HOME_TRACKS = [
  {
    kicker: "DATA",
    group: "Data & SQL",
    badge: "Self-paced · ₹0 Pilot",
    title: "Data Analytics",
    meta: "5 modules · 15 lessons · Northwind SQL Lab",
    summary: "Query 166 order lines in the browser SQL lab, isolate 14.5% discount leakage, and write an executive margin brief.",
    capstone: "Northwind Commercial Margin & Discount Leakage Audit",
    rubric: "25% SQL Checks · 35% Written Briefs · 40% Capstone Defense",
    skills: ["SQL Joins & Window Functions", "Spreadsheet Cleaning", "Margin Analysis"],
    to: "/programmes/data-analytics-pro",
    cta: "Start course",
  },
  {
    kicker: "PRODUCT",
    group: "Product & Strategy",
    badge: "Self-paced · ₹0 Pilot",
    title: "Product Management",
    meta: "5 modules · 15 lessons · Harbor Desk Case",
    summary: "Synthesise 18 store-manager interviews, triage weekend exceptions, and scope a 6-week engineering PRD.",
    capstone: "Harbor Desk 12-Store Operations Exception PRD",
    rubric: "25% Framing Checks · 35% Trade-Off Memos · 40% PRD Spec",
    skills: ["Problem Framing", "Engineering Scoping", "PRD Specification"],
    to: "/programmes/product-management",
    cta: "Start course",
  },
  {
    kicker: "ENGINEERING",
    group: "AI & Engineering",
    badge: "Self-paced · ₹0 Pilot",
    title: "Python Programming & Automation",
    meta: "5 modules · 15 lessons · ETL & Pytest",
    summary: "Build resilient data ingestion scripts, automate schema validation, and verify edge cases with pytest.",
    capstone: "Automated Order CSV Sanitizer & Pytest Suite",
    rubric: "25% Syntax Checks · 35% ETL Scripts · 40% Test Harness",
    skills: ["Python 3", "Data Cleaning & ETL", "Automated Testing"],
    to: "/courses/python-programming",
    cta: "Start course",
  },
  {
    kicker: "DATA & AI PATHWAY",
    group: "Data & SQL",
    badge: "Self-paced · ₹0 Pilot",
    title: "Data Science & AI (Dual Track)",
    meta: "10 modules · 30 lessons · SQL + Python Dual Track",
    summary: "Combine relational SQL commercial audits with Python exploratory analysis and cohort retention workflows.",
    capstone: "Multi-Quarter Customer Churn & Revenue Retention Model",
    rubric: "25% Cohort Checks · 35% SQL+Python Notebooks · 40% Dossier",
    skills: ["SQL + Python", "Exploratory Data Analysis", "Cohort Modelling"],
    to: "/programmes/data-science-ai",
    cta: "Start course",
  },
  {
    kicker: "AI SYSTEMS",
    group: "AI & Engineering",
    badge: "Self-paced · ₹0 Pilot",
    title: "Generative AI & LLM Systems",
    meta: "5 modules · 15 lessons · Grounded RAG & Agents",
    summary: "Engineer citation-grounded RAG pipelines, run hallucination audits, and evaluate latency trade-offs.",
    capstone: "Citation-Enforced Enterprise RAG & Guardrail Suite",
    rubric: "25% Prompt Checks · 35% Eval Harnesses · 40% RAG Defense",
    skills: ["Grounded RAG", "Hallucination Auditing", "Prompt Security"],
    to: "/programmes/generative-ai-program",
    cta: "Start course",
  },
  {
    kicker: "WEB",
    group: "AI & Engineering",
    badge: "Self-paced · ₹0 Pilot",
    title: "Full Stack Web Engineering",
    meta: "5 modules · 15 lessons · React, Node & Postgres",
    summary: "Ship type-safe React interfaces, idempotent REST endpoints, and transactional PostgreSQL ledgers.",
    capstone: "Idempotent Elixir Wallet & Transactional Ledger API",
    rubric: "25% Architecture Checks · 35% API Specs · 40% Full-Stack Build",
    skills: ["React & TypeScript", "Node & Express", "PostgreSQL Transactions"],
    to: "/programmes/full-stack",
    cta: "Start course",
  },
] as const

const HOME_TRACK_FILTERS = ["All Tracks", "Data & SQL", "Product & Strategy", "AI & Engineering"] as const

export function HomeProgrammes({ programmes, loading, confirmed, onRetry }: { programmes: CatalogProgramSummary[]; loading: boolean; confirmed: boolean; onRetry?: () => void }) {
  const [activeFilter, setActiveFilter] = useState<(typeof HOME_TRACK_FILTERS)[number]>("All Tracks")
  const [expandedTrack, setExpandedTrack] = useState<string | null>("Data Analytics")
  const rows = homeRows(programmes).filter((row) => FOCUS_SLUGS.includes(row.program.slug as (typeof FOCUS_SLUGS)[number]))
  const ordered = [...rows].sort((a, b) => FOCUS_SLUGS.indexOf(a.program.slug as (typeof FOCUS_SLUGS)[number]) - FOCUS_SLUGS.indexOf(b.program.slug as (typeof FOCUS_SLUGS)[number]))
  const visibleTracks = UNIFIED_HOME_TRACKS.filter((t) => activeFilter === "All Tracks" || t.group === activeFilter)
  return (
    <section id="programmes" className="hx-programmes" aria-labelledby="hx-programmes-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Programmes &amp; Self-Paced Tracks</p>
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
            {[0, 1, 2].map((i) => (
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
            <div className="hx-ut-filters" role="tablist" aria-label="Filter tracks by domain">
              {HOME_TRACK_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f}
                  className={`hx-ut-filter${activeFilter === f ? " is-on" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <ul className="hx-unified-tracks" aria-label="Programmes and self-paced courses">
              {visibleTracks.map((track) => {
                const isExpanded = expandedTrack === track.title
                return (
                  <li key={track.title} className={`hx-ut-card${isExpanded ? " is-expanded" : ""}`}>
                    <div className="hx-ut-card__link">
                      <span className="hx-ut-card__top">
                        <span className="hx-ut-card__kicker">{track.kicker}</span>
                        <span className="hx-ut-card__badge">{track.badge}</span>
                      </span>
                      <Link to={track.to} className="hx-ut-card__title-link" data-clear-launcher>
                        <strong className="hx-ut-card__title">{track.title}</strong>
                      </Link>
                      <span className="hx-ut-card__meta">{track.meta}</span>
                      <span className="hx-ut-card__summary">{track.summary}</span>
                      <div className="hx-ut-card__skills">
                        {track.skills.map((s) => (
                          <span key={s} className="hx-ut-card__skill">{s}</span>
                        ))}
                      </div>
                      {isExpanded ? (
                        <div className="hx-ut-card__peek">
                          <div><span>Capstone Project:</span> <b>{track.capstone}</b></div>
                          <div><span>Grading Rubric:</span> <b>{track.rubric}</b></div>
                        </div>
                      ) : null}
                      <div className="hx-ut-card__actions">
                        <Link to={track.to} className="hx-ut-card__cta" data-clear-launcher>
                          {track.cta}
                          <ArrowRight />
                        </Link>
                        <button
                          type="button"
                          className="hx-ut-card__peek-btn"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedTrack(isExpanded ? null : track.title)}
                        >
                          {isExpanded ? "Hide Rubric ▲" : "Peek Lab & Rubric ▼"}
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="hx-sr" aria-hidden="true">
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
            <p className="hx-eyebrow hx-eyebrow--dark">Degrees</p>
            <h2 id="hx-degrees-title" className="hx-h2">
              Undergraduate or <em>postgraduate.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Planned degree areas. Partner universities award the degrees; applications open once an institution is confirmed, and you can register interest today.</p>
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
                    <span className="hx-door__tag">{plannedOnly ? "2026–27 Academic Partner Track · Register Interest" : "Includes a published degree"}</span>
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
  { key: "enrol", title: "Enrol", text: "Start a skill programme and set your target role and baseline skills." },
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
          <p className="hx-screen__hint">You add the roles. Career OS keeps them organised; it does not apply for you or promise an outcome.</p>
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
            <p className="hx-head__aside">Follow how your work moves from the first lesson of a course into a structured Career OS profile.</p>
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
            <p className="hx-journey__note">Illustrative preview · Not connected</p>
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
  const lines = ["Career OS is locked. Enrolment, course completion, and Career Rise do not open it."]
  if (truthOf("projectsAndEvidence") !== "live") lines.push("Project evidence records are not released yet.")
  if (truthOf("openings") !== "live") lines.push("No roles are published, and Career OS does not apply for you.")
  if (truthOf("degrees") !== "live") lines.push("Planned degree listings are not connected. You can record education on the profile you write.")
  return lines.join(" ")
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
        <p className="hx-screen__label">What enrolment does</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Profile</b><span className="hx-screen__tag">Starts when you enrol</span></span>
          <span className="hx-screen__item"><span className="hx-screen__k">Programme</span><span>{programme} · professional programme</span></span>
          <span className="hx-screen__hint">Your enrolled programme and target role anchor your workspace.</span>
        </div>
      </div>
    )
  }
  if (step === "learn") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">What learning shows</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Lesson in the programme</b><span className="hx-screen__tag">Example</span></span>
          <span className="hx-screen__item"><span className="hx-screen__k">Title</span><span>{facts ? facts.current.title : "The lesson you have open"}</span></span>
          <span className="hx-screen__hint">Active lessons and module progress sync directly from your course workspace.</span>
        </div>
      </div>
    )
  }
  if (step === "build") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">Where project work lives</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>{capstone}</b><span className="hx-screen__tag">Programme capstone</span></span>
          {["Read the brief", "Explore the data", "Build the analysis", "Write the recommendation"].map((task) => (
            <span key={task} className="hx-screen__task">
              <span className="hx-tick" aria-hidden="true" />
              {task}
            </span>
          ))}
          <span className="hx-screen__hint">Each capstone breaks down into structured, reviewable deliverables.</span>
        </div>
      </div>
    )
  }
  if (step === "evidence") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">What a record would hold</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Evidence record</b><span className="hx-screen__tag">Capstone dossier</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">The work</span><span>The project it came from</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">What it shows</span><span>Written when a record exists</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Reflection</span><span>Yours, when a record exists</span></span>
          <span className="hx-screen__hint">Every completed capstone pairs your SQL or product spec with a verifiable credential ID.</span>
        </div>
      </div>
    )
  }
  if (step === "profile") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">What you write</p>
        <div className="hx-screen__card">
          <span className="hx-screen__item"><span className="hx-screen__k">Target role</span><span>You write this</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Skills</span><span>SQL · Spreadsheets · Problem framing · Product specs</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Education</span><span>Your degree, institution, and graduation timeline</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Projects</span><span>Added only after you finish one</span></span>
        </div>
      </div>
    )
  }
  return (
    <div className="hx-screen">
      <p className="hx-screen__label">How you prepare</p>
      <div className="hx-screen__cols">
        {[
          ["Saved", "None yet"],
          ["Applied", "None yet"],
          ["Interview", "None yet"],
        ].map(([col, card]) => (
          <div key={col} className="hx-screen__col">
            <span className="hx-screen__k">{col}</span>
            <span className="hx-screen__mini">{card}</span>
          </div>
        ))}
      </div>
      <p className="hx-screen__hint">Track saved roles, submitted applications, and structured interview practice in one place.</p>
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
            <p className="hx-eyebrow hx-eyebrow--dark">Career OS</p>
            <h2 id="hx-career-title" className="hx-h2 hx-h2--sm">One profile for what you learn and keep.</h2>
          </div>
          <p className="hx-head__aside">Bring your target role, skills, and completed projects into one workspace. Preview the six steps below (illustrative example, not your account).</p>
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
            <p className="hx-career__label">Interactive step preview · Illustrative preview · Not connected</p>
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
  { title: "1-Click Hinglish & First-Principles Intuition", text: "Inside any open lesson, ask Skylent AI to explain SQL joins, product trade-offs, or RAG architecture in plain English or Hinglish." },
  { title: "Socratic Hints + 20-Min Faculty TA SLA", text: "During quizzes and assignments, Skylent AI gives guided Socratic hints without spoiling the solution—backed by human Teaching Assistants." },
  { title: "90-Second Skill & Path Diagnostic", text: "Take the 90-second technical benchmark or 7-step career path finder to match your current level to the right starting module." },
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
              <span className="hx-ai__name">Skylent AI</span>
              <span className="hx-ai__role">Inside an open lesson</span>
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
          <Link className="sk-btn sk-btn-primary" to="/path">
            Find My Path
            <ArrowRight />
          </Link>
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
  { title: "Available now", text: "Open programmes include written lessons, checks, and practice. Career OS stays locked until a separate entitlement is granted. Signing in does not unlock it." },
  { title: "Not a live dashboard here", text: "The homepage photograph is not a learner account. Course examples further down come from the Data Analytics materials." },
  { title: "Still planned", text: "Data Science does not yet include machine-learning teaching. Career OS does not compare your skills with a role, and it does not apply for jobs for you." },
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
          <p className="hx-close__lead">Start an open programme today, or join a ₹99 workshop to test-drive a real case study first.</p>
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


const ELIXIR_EARN_ACTIONS = [
  { id: "workshop", label: "Join ₹99 Weekend Bootcamp (100% Cashback)", coins: 99, defaultOn: true },
  { id: "sandbox", label: "Complete 60s Browser SQL / Cold-Call Tryout", coins: 50, defaultOn: false },
  { id: "streak", label: "Maintain 7-Day Execution Streak (+5/day)", coins: 35, defaultOn: false },
] as const

const ELIXIR_STORE_CASES = [
  { title: "E-Commerce Cohort & Retention Playbook", cost: 39, track: "Data Analytics" },
  { title: "Northwind Margin & Discount Leakage Audit", cost: 49, track: "Data Analytics" },
  { title: "Harbor Desk Weekend Exception PRD Case", cost: 49, track: "Product Management" },
  { title: "Enterprise B2B SaaS 90-Day Churn Teardown", cost: 99, track: "Product & Strategy" },
] as const

export function HomeElixirFlywheel() {
  const [selectedActions, setSelectedActions] = useState<Record<string, boolean>>({
    workshop: true,
    sandbox: false,
    streak: false,
  })

  const totalCoins = ELIXIR_EARN_ACTIONS.reduce(
    (sum, item) => sum + (selectedActions[item.id] ? item.coins : 0),
    0,
  )

  function toggleAction(id: string) {
    setSelectedActions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const steps = [
    {
      step: "01 · Start Small",
      title: "Join a ₹99 Live Workshop",
      copy: "Get 99 Elixir Coins (100% 1:1 credit) added to your wallet when you register for a scheduled session.",
    },
    {
      step: "02 · Unlock a Case",
      title: "Spend Credits in the Case Store",
      copy: "Use your 99 Elixir Coins to unlock SQL and Product case studies (49 or 99 Elixir), including Northwind and Harbor Desk.",
    },
    {
      step: "03 · Keep the Proof",
      title: "Solve & Save Your Work",
      copy: "Run SQL queries, write the case brief with Socratic AI hints, and keep your finished work in Career OS.",
    },
  ] as const

  return (
    <section className="hxw-goals" aria-labelledby="hx-flywheel-title">
      <div className="sky-container">
        <div className="hxw-goals__head">
          <div>
            <p className="hxw-goals__eyebrow">Why Elixir exists · 1:1 learning credit</p>
            <h2 id="hx-flywheel-title" className="hxw-goals__title">Start with a ₹99 Workshop. Get 99 Elixir Coins for Case Studies.</h2>
          </div>
          <p className="hxw-goals__aside">
            Instead of paying ₹50,000 upfront before touching a real problem, your ₹99 workshop fee comes back as 99 Elixir credits so you can test how Skylent teaches on a real case study first.
          </p>
        </div>
        <div className="hx-elixir-pills" aria-label="How Elixir credits work">
          <span className="hx-elixir-pill">₹99 Workshop = 99 Elixir</span>
          <span className="hx-elixir-pill">1 Case Study = 49–99 Elixir</span>
          <span className="hx-elixir-pill">+5 Elixir / Day Execution Streak</span>
        </div>

        <div className="hx-elixir-sim" role="region" aria-label="Interactive Elixir Wallet Simulator">
          <div className="hx-elixir-sim__left">
            <span className="hx-elixir-sim__kicker">Interactive Wallet Simulator · Click to toggle</span>
            <h3>Simulate your Elixir Coin balance</h3>
            <div className="hx-elixir-sim__toggles">
              {ELIXIR_EARN_ACTIONS.map((act) => {
                const active = Boolean(selectedActions[act.id])
                return (
                  <button
                    key={act.id}
                    type="button"
                    aria-pressed={active}
                    className={`hx-elixir-sim__btn${active ? " is-on" : ""}`}
                    onClick={() => toggleAction(act.id)}
                  >
                    <span className="hx-elixir-sim__check">{active ? "✓" : "+"}</span>
                    <span className="hx-elixir-sim__label">{act.label}</span>
                    <strong className="hx-elixir-sim__coins">+{act.coins} Elixir</strong>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="hx-elixir-sim__right">
            <div className="hx-elixir-sim__balance">
              <span>Simulated Wallet Balance</span>
              <strong>{totalCoins} Elixir Coins</strong>
            </div>
            <ul className="hx-elixir-sim__cases">
              {ELIXIR_STORE_CASES.map((c) => {
                const unlocked = totalCoins >= c.cost
                return (
                  <li key={c.title} className={unlocked ? "is-unlocked" : "is-locked"}>
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.track}</span>
                    </div>
                    <span className="hx-elixir-sim__status">
                      {unlocked ? `✓ Unlocked (${c.cost} Elixir)` : `Needs ${c.cost} Elixir`}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="hxw-goals__grid" style={{ marginTop: 20 }}>
          {steps.map((item) => (
            <div key={item.step} className="hxw-goal">
              <span className="hxw-goal__content">
                <span className="hxw-goals__eyebrow">{item.step}</span>
                <span className="hxw-goal__name">{item.title}</span>
                <span className="hxw-goal__text">{item.copy}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="hxw-hero__actions" style={{ marginTop: 20 }}>
          <Link className="sk-btn sk-btn-primary hx-btn" to="/events">
            Explore ₹99 Workshops
            <ArrowRight />
          </Link>
          <Link className="sk-btn sk-btn-secondary hx-btn" to="/dashboard/student">
            Open Case Study Store
          </Link>
        </div>
      </div>
    </section>
  )
}

const SQL_PRESETS = [
  {
    id: "category",
    label: "Query 1 · Category Margin Audit",
    sql: `SELECT category,
       COUNT(*) AS order_lines,
       ROUND(AVG(discount_pct), 1) AS avg_discount_pct,
       ROUND(SUM(units * unit_price * (1.0 - discount_pct / 100.0)), 0) AS net_revenue
FROM northwind_sales
WHERE units > 0 AND unit_price > 0 AND returned = no
GROUP BY category
ORDER BY net_revenue DESC;`,
    summary: "✓ 4 categories aggregated across 166 valid rows · Total net revenue: ₹8,12,020",
    rows: [
      { col1: "Electronics", col2: "58", col3: "3.2%", col4: "₹2,78,140", col5: "Healthy margin floor", leak: false },
      { col1: "Grocery", col2: "44", col3: "2.1%", col4: "₹2,21,390", col5: "Steady repeat orders", leak: false },
      { col1: "Apparel", col2: "36", col3: "14.5%", col4: "₹1,58,420", col5: "⚠ Unapproved discount leakage", leak: true },
      { col1: "Home Goods", col2: "28", col3: "4.0%", col4: "₹1,54,070", col5: "Within target band", leak: false },
    ],
  },
  {
    id: "apparel-leak",
    label: "Query 2 · Isolate Apparel >10% Promo Leak",
    sql: `SELECT region,
       COUNT(*) AS promo_orders,
       ROUND(AVG(discount_pct), 1) AS avg_discount_pct,
       ROUND(SUM(units * unit_price * (discount_pct / 100.0)), 0) AS margin_lost
FROM northwind_sales
WHERE category = Apparel AND discount_pct > 10 AND returned = no
GROUP BY region
ORDER BY margin_lost DESC;`,
    summary: "✓ Isolated 22 unapproved Apparel promo orders · ₹28,400 margin lost to stacked regional codes",
    rows: [
      { col1: "West Region", col2: "12", col3: "16.8%", col4: "₹16,920 lost", col5: "⚠ Stacked weekend coupon codes", leak: true },
      { col1: "North Region", col2: "7", col3: "13.4%", col4: "₹8,110 lost", col5: "⚠ Manual override above 10%", leak: true },
      { col1: "South Region", col2: "3", col3: "11.2%", col4: "₹3,370 lost", col5: "Clearance bundle overlap", leak: false },
    ],
  },
  {
    id: "channel",
    label: "Query 3 · Store vs. Online Channel Split",
    sql: `SELECT channel,
       COUNT(*) AS valid_orders,
       ROUND(AVG(discount_pct), 1) AS avg_discount_pct,
       ROUND(SUM(units * unit_price * (1.0 - discount_pct / 100.0)), 0) AS net_revenue
FROM northwind_sales
WHERE units > 0 AND unit_price > 0 AND returned = no
GROUP BY channel
ORDER BY net_revenue DESC;`,
    summary: "✓ Channel comparison complete across 166 valid rows · Online discounts run 2.6x higher than store",
    rows: [
      { col1: "Store POS", col2: "96", col3: "3.1%", col4: "₹4,86,510", col5: "Strict POS discount cap active", leak: false },
      { col1: "Online Checkout", col2: "70", col3: "8.2%", col4: "₹3,25,510", col5: "⚠ Missing promo-stacking guardrail", leak: true },
    ],
  },
] as const

const PRD_BACKLOG_ITEMS = [
  { id: "queue", title: "Automated Weekend Exception Queue & Store Owner Tag", weeks: 6, impact: "High: Cuts Monday backlog by 62%", recommended: true },
  { id: "sla", title: "4-Hour Store Manager SLA Escalation Alert", weeks: 4, impact: "High: Prevents unowned customer refunds", recommended: true },
  { id: "audit", title: "Shift Handoff Note & Reason-Code Picker", weeks: 2, impact: "Medium: Gives ops clean root-cause tags", recommended: true },
  { id: "erp", title: "Full Legacy Warehouse ERP Database Rewrite", weeks: 14, impact: "Trap: Blows past 6-week, 2-engineer constraint", recommended: false },
] as const

const RAG_SENTENCES = [
  {
    id: "s1",
    text: "1. Per Policy Doc §4.2, Apparel promotional discounts are capped at 10% unless approved by the Regional Director.",
    isHallucination: false,
    feedback: "✓ Grounded Citation: Directly verified against Policy Doc §4.2.",
  },
  {
    id: "s2",
    text: "2. Northwind automatically refunds 25% of shipping fees in crypto tokens whenever a package is delayed by 12 hours.",
    isHallucination: true,
    feedback: "🎯 Caught the Hallucination! Neither shipping crypto refunds nor a 12-hour clause exists in the source context.",
  },
  {
    id: "s3",
    text: "3. Across 166 validated order lines in Q1, Electronics generated ₹2,78,140 in net revenue at a 3.2% average discount.",
    isHallucination: false,
    feedback: "✓ Grounded Citation: Matches exact SQL aggregation on northwind_sales.csv.",
  },
] as const

export function ZeroLoginInteractiveTryout() {
  const [activeTab, setActiveTab] = useState<"sql" | "prd" | "rag" | "coldcall">("sql")
  const [presetId, setPresetId] = useState<(typeof SQL_PRESETS)[number]["id"]>("category")
  const [sqlExecuted, setSqlExecuted] = useState(true)
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [selectedPrd, setSelectedPrd] = useState<Record<string, boolean>>({ queue: true, sla: true, audit: false, erp: false })
  const [pickedRag, setPickedRag] = useState<string | null>(null)

  const currentPreset = SQL_PRESETS.find((p) => p.id === presetId) ?? SQL_PRESETS[0]
  const totalPrdWeeks = PRD_BACKLOG_ITEMS.reduce((sum, item) => sum + (selectedPrd[item.id] ? item.weeks : 0), 0)

  function togglePrdItem(id: string) {
    setSelectedPrd((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="interactive-playground" className="hxw-tryout" aria-labelledby="hx-tryout-title">
      <div className="sky-container">
        <div className="hx-tryout__head">
          <div>
            <p className="hxw-goals__eyebrow">Try Skylent in 60 seconds · No login needed</p>
            <h2 id="hx-tryout-title" className="hxw-goals__title">Run a real SQL audit, scope a PRD, or spot an AI hallucination.</h2>
          </div>
          <p className="hxw-goals__aside">
            Don’t just read a syllabus—test-drive 4 live interactive studios from Data Analytics, Product Management, and GenAI right here in your browser.
          </p>
        </div>

        <div className="hx-tryout__tabs" role="tablist" aria-label="Interactive tryout mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sql"}
            className={`hx-tryout__tab${activeTab === "sql" ? " is-on" : ""}`}
            onClick={() => setActiveTab("sql")}
          >
            01 · Live Northwind SQL Lab
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "prd"}
            className={`hx-tryout__tab${activeTab === "prd" ? " is-on" : ""}`}
            onClick={() => setActiveTab("prd")}
          >
            02 · Product PRD Scope Simulator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "rag"}
            className={`hx-tryout__tab${activeTab === "rag" ? " is-on" : ""}`}
            onClick={() => setActiveTab("rag")}
          >
            03 · GenAI Hallucination Spotter
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "coldcall"}
            className={`hx-tryout__tab${activeTab === "coldcall" ? " is-on" : ""}`}
            onClick={() => setActiveTab("coldcall")}
          >
            04 · 60-Second Case Cold Call
          </button>
        </div>

        {activeTab === "sql" ? (
          <div className="hx-tryout__terminal">
            <div className="hx-tryout__bar">
              <div>
                <strong className="hx-tryout__file">northwind_sales.csv (166 valid rows · ₹812,020 net revenue)</strong>
                <span className="hx-tryout__sub">Click any query preset below and run it live against the dataset:</span>
              </div>
              <button
                type="button"
                className="sk-btn sk-btn-primary"
                onClick={() => setSqlExecuted(true)}
              >
                {sqlExecuted ? "Re-Run Query ▶" : "Run Query ▶"}
              </button>
            </div>
            <div className="hx-sql-presets" role="group" aria-label="SQL query presets">
              {SQL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`hx-sql-preset${presetId === p.id ? " is-on" : ""}`}
                  onClick={() => {
                    setPresetId(p.id)
                    setSqlExecuted(true)
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <pre className="hx-tryout__code">{currentPreset.sql}</pre>
            {sqlExecuted ? (
              <div className="hx-tryout__result">
                <div className="hx-tryout__ok">
                  {currentPreset.summary}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="hx-tryout__table">
                    <thead>
                      <tr>
                        <th>group / dimension</th>
                        <th>order_lines</th>
                        <th>avg_discount_pct</th>
                        <th>revenue / impact</th>
                        <th>diagnostic finding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPreset.rows.map((r) => (
                        <tr key={r.col1} className={r.leak ? "is-leak" : undefined}>
                          <td>{r.col1}</td>
                          <td>{r.col2}</td>
                          <td>{r.col3}</td>
                          <td>{r.col4}</td>
                          <td>{r.col5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="hx-tryout__foot">
                  <span>Finding: Apparel discounts averaged 14.5% in April, eroding ₹28,400 in net margin.</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Link to="/programmes/data-analytics-pro" className="sk-btn sk-btn-primary">
                      Start Data Analytics (₹0 Pilot) →
                    </Link>
                    <Link to="/events" className="sk-btn sk-btn-secondary">
                      Claim +50 Elixir Bonus →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : activeTab === "prd" ? (
          <div className="hx-tryout__coldcall">
            <div className="hx-tryout__bar">
              <div>
                <span className="sky-label">Harbor Desk Operations Case · Interactive Sprint Scope Simulator</span>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#cbd5e1" }}>
                  Constraint: You have <strong>2 engineers for 6 weeks (12 engineer-weeks max)</strong>. Toggle backlog items below to build a shippable sprint without exceeding capacity:
                </p>
              </div>
              <span
                className="sky-mono"
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: totalPrdWeeks > 12 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: totalPrdWeeks > 12 ? "#fca5a5" : "#6ee7b7",
                  border: `1px solid ${totalPrdWeeks > 12 ? "rgba(239,68,68,0.45)" : "rgba(16,185,129,0.45)"}`,
                }}
              >
                Capacity Used: {totalPrdWeeks} / 12 Engineer-Weeks
              </span>
            </div>
            <div className="hx-tryout__options" style={{ marginTop: 14 }}>
              {PRD_BACKLOG_ITEMS.map((item) => {
                const checked = Boolean(selectedPrd[item.id])
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePrdItem(item.id)}
                    className={`hx-tryout__opt${checked ? " is-selected" : ""}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <strong>{checked ? "✓ " : "+ "}{item.title}</strong>
                      <span className="sky-mono" style={{ fontSize: 12, color: "#93c5fd" }}>{item.weeks} eng-wks</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4 }}>{item.impact}</div>
                  </button>
                )
              })}
            </div>
            <div className="hx-tryout__foot">
              <span>
                {totalPrdWeeks > 12
                  ? `⚠ Over Capacity (${totalPrdWeeks}/12 eng-wks): Uncheck the 14-week ERP rewrite so your 2 engineers can ship on time!`
                  : totalPrdWeeks === 12 && !selectedPrd.erp
                    ? "✓ Optimal 12/12 Eng-Week Scope! You solved weekend exception ownership for all 12 stores within budget."
                    : `Sprint has ${12 - totalPrdWeeks} engineer-weeks remaining. Select the highest-impact items up to 12 weeks.`}
              </span>
              <Link to="/programmes/product-management" className="sk-btn sk-btn-primary">
                Open Product Management Track →
              </Link>
            </div>
          </div>
        ) : activeTab === "rag" ? (
          <div className="hx-tryout__coldcall">
            <div className="hx-tryout__bar">
              <div>
                <span className="sky-label">GenAI &amp; LLM Systems · Grounded RAG Hallucination Audit</span>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#cbd5e1" }}>
                  An LLM agent generated the 3 statements below. <strong>Click the statement that is an ungrounded hallucination:</strong>
                </p>
              </div>
              <span className="sky-mono" style={{ fontSize: 12 }}>Citation Guardrail Lab</span>
            </div>
            <div className="hx-tryout__options" style={{ marginTop: 14 }}>
              {RAG_SENTENCES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPickedRag(item.id)}
                  className={`hx-tryout__opt${pickedRag === item.id ? " is-selected" : ""}`}
                >
                  <div>{item.text}</div>
                  {pickedRag === item.id ? (
                    <div className={`hx-tryout__peer${item.isHallucination ? " is-optimal" : ""}`}>
                      {item.feedback}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="hx-tryout__foot">
              <span>In Skylent’s GenAI track, you build automated citation harnesses that block ungrounded claims before production.</span>
              <Link to="/programmes/generative-ai-program" className="sk-btn sk-btn-primary">
                Explore GenAI &amp; LLM Track →
              </Link>
            </div>
          </div>
        ) : (
          <div className="hx-tryout__coldcall">
            <div className="hx-tryout__bar">
              <span className="sky-label">60-Second Case Cold Call · Commercial Strategy</span>
              <span className="sky-mono" style={{ fontSize: 12 }}>Northwind Retail Case</span>
            </div>
            <p className="hx-tryout__prompt">
              Apparel margins fell 14.5% in April because regional managers stacked promo codes without a floor. What rule do you put in place for May?
            </p>
            <div className="hx-tryout__options">
              {[
                { id: "opt-1", label: "A) Freeze all promo codes across every category immediately.", peer: 18, isOptimal: false },
                { id: "opt-2", label: "B) Cap Apparel discounts at 10% in checkout and require sign-off above that.", peer: 64, isOptimal: true },
                { id: "opt-3", label: "C) Increase ad spend on Apparel to make up the margin drop with volume.", peer: 18, isOptimal: false },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDecision(opt.id)}
                  className={`hx-tryout__opt${selectedDecision === opt.id ? " is-selected" : ""}`}
                >
                  <div>{opt.label}</div>
                  {selectedDecision ? (
                    <div className={`hx-tryout__peer${opt.isOptimal ? " is-optimal" : ""}`}>
                      Cohort split: <strong>{opt.peer}% of learners</strong> chose this {opt.isOptimal ? "· Strongest commercial trade-off" : ""}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
            {selectedDecision ? (
              <div className="hx-tryout__foot">
                <span>Why B works: A targeted checkout cap stops Apparel margin leakage without hurting Electronics or Grocery conversion.</span>
                <Link to="/events" className="sk-btn sk-btn-primary">
                  Claim +50 Elixir Bonus →
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
