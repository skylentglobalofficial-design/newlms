/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Order: hero (white/cool blue) → ways to start → goals → how learning works → programmes →
 * degrees → Career OS → Skylent AI → institutions → closing.
 *
 * Facts come from the authored course data, the catalogue (or its published list) and lib/degrees.
 * Nothing here states a learner count, outcome, partner or placement. Previews are drawn from the
 * authored Data Analytics programme and are labelled as product previews, not account data.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { SkylentBot } from "@/components/skylent/SiteAssistant"
import { openSkylentAi } from "@/components/skylent/ai-events"
import { HARBOR, NORTHWIND, NORTHWIND_CATEGORY_SQL_EXCERPT, authoredProgrammeContent, rupees, type AuthoredProgrammeContent } from "@/components/programme/programme-content"
import { programmeTruth } from "@/components/programme/programme-truth"
import { programmeDiscoveryFor } from "@/lib/programme-discovery"
import type { CatalogProgramSummary } from "@/lib/catalog-api"
import { deliveryModeLabel, listDegrees } from "@/lib/degrees"
import { truthOf } from "@/lib/truth"
import { courseFacts } from "./course-facts"
import { useWalkthrough } from "./useWalkthrough"
import heroStudent720 from "@/assets/site/home/hero-student-720.webp"
import heroStudent1024 from "@/assets/site/home/hero-student-1024.webp"
import heroStudentAvatar from "@/assets/site/home/hero-student-96.webp"
import photoAnalytics from "@/assets/site/home/program-analytics-800.webp"
import photoProduct from "@/assets/site/home/program-product-800.webp"
import photoProductAvatar from "@/assets/site/home/program-product-96.webp"
import photoScience from "@/assets/site/home/program-web-800.webp"
import photoClass from "@/assets/site/home/hero-classroom-960.webp"
import photoClassAvatar from "@/assets/site/home/hero-classroom-96.webp"
import photoCampusPg from "@/assets/site/home/degree-management-960.webp"
import photoCampusPgAvatar from "@/assets/site/home/degree-management-96.webp"
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

export function HomeHero() {
  return (
    <section className="hxw-hero" data-clear-launcher aria-labelledby="hx-hero-title">
      <div className="hxw-hero__bg" aria-hidden="true" />
      <div className="sky-container hxw-hero__grid">
        <div className="hxw-hero__copy">
          <p className="hxw-eyebrow hx-rise">
            <span>Skills</span> <span className="hxw-eyebrow__dot">&middot;</span> <span>Education</span> <span className="hxw-eyebrow__dot">&middot;</span> <span>Career</span> <span className="hxw-eyebrow__dot">&middot;</span> <span>AI</span>
          </p>
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            <span>Learn skills.</span>
            <span>Explore education.</span>
            <span>Build real experience.</span>
            <em>Find what comes next.</em>
          </h1>
          <p className="hxw-hero__lead hx-rise">
            Skylent brings together programmes, courses, real projects and career opportunities to help you go from learning to doing.
          </p>
          <div className="hxw-hero__actions hx-rise">
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore Skylent
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary hx-btn" to="/path">
              Find My Path
            </Link>
          </div>
          <div className="hxw-hero__community hx-rise">
            <div className="hxw-hero__avatars" aria-hidden="true">
              <img className="hxw-hero__avatar" src={heroStudentAvatar} width={96} height={120} alt="" decoding="async" style={{ objectPosition: "50% 18%" }} />
              <img className="hxw-hero__avatar" src={photoClassAvatar} width={96} height={64} alt="" decoding="async" style={{ objectPosition: "18% 42%" }} />
              <img className="hxw-hero__avatar" src={photoProductAvatar} width={96} height={64} alt="" decoding="async" style={{ objectPosition: "50% 30%" }} />
              <img className="hxw-hero__avatar" src={photoCampusPgAvatar} width={96} height={64} alt="" decoding="async" style={{ objectPosition: "62% 35%" }} />
            </div>
            <p className="hxw-hero__community-text">Learners, builders and professionals.</p>
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
            <div className="hxw-ws" aria-label="Illustrative learning workspace. Not a connected account.">
              <div className="hxw-ws__top">
                <span className="hxw-ws__mark" aria-hidden="true">S</span>
                <span>
                  <span className="hxw-ws__title">Learning workspace</span>
                  <span className="hxw-ws__note">Illustrative preview · Not connected</span>
                </span>
              </div>
              <div className="hxw-ws__row">
                <span>Programme direction</span>
                <span className="hxw-ws__pill">Explore</span>
              </div>
              <span className="hxw-ws__track" aria-hidden="true"><span /></span>
              <Link className="hxw-ws__item" to="/programmes/data-analytics-pro">
                <span className="hxw-ws__plus" aria-hidden="true">+</span>
                <span>
                  <strong>Data Analytics</strong>
                  <em>Open this programme</em>
                </span>
                <ArrowRight />
              </Link>
              <div className="hxw-ws__pair">
                <span><b>Learn</b> Structured course work</span>
                <span><b>Build</b> Practical project work</span>
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
  { key: "programme", label: "Programme" },
  { key: "lesson", label: "Lesson" },
  { key: "practice", label: "Practice" },
  { key: "project", label: "Project" },
  { key: "evidence", label: "Evidence" },
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
          <p className="hx-canvas__note">{facts.done} of {facts.total} lessons sit before this one in the preview. Not your progress.</p>
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
              <span>Learning workspace</span>
              <span>Illustrative preview · Not connected</span>
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
    line: "Take a messy sales extract to a finding and a recommendation someone can act on.",
  },
  "product-management": {
    title: "Product Management",
    image: photoProduct,
    width: 800,
    height: 534,
    alt: "Illustrative product working session.",
    line: "Frame one operations problem and recommend a single constrained bet.",
  },
  "data-science-ai": {
    title: "Data Science",
    image: photoScience,
    width: 800,
    height: 534,
    alt: "Illustrative code on a screen.",
    line: "A listed direction. Machine learning teaching is not in the pathway yet.",
  },
}

export function HomeProgrammes({ programmes, loading, confirmed }: { programmes: CatalogProgramSummary[]; loading: boolean; confirmed: boolean }) {
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
            <p className="hx-programmes__lead">Each card shows whether enrolment is open. A programme in development can be read, not started.</p>
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
                <strong>{STATUS_NOT_CONFIRMED}.</strong> The catalogue could not be checked just now, so enrolment status is not shown.{" "}
                <Link to="/programmes">See programmes</Link>
              </p>
            )}
            <ul className="hx-focus">
              {ordered.map((row) => {
                const face = FOCUS_FACE[row.program.slug]
                const open = confirmed && row.open
                const status = !confirmed ? STATUS_NOT_CONFIRMED : open ? "Open for enrolment" : "In development"
                const action = !confirmed ? "View programme" : open ? "View programme" : "See what is listed"
                return (
                  <li key={row.program.slug}>
                    <Link to={`/programmes/${row.program.slug}`} className={open ? "hx-focus__card is-open" : "hx-focus__card is-soon"} data-clear-launcher>
                      <span className="hx-focus__media">
                        {face ? <img src={face.image} alt={face.alt} width={face.width} height={face.height} loading="lazy" decoding="async" /> : null}
                      </span>
                      <span className="hx-focus__body">
                        <span className={open ? "hx-focus__status is-open" : "hx-focus__status"}>{status}</span>
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
  const degrees = listDegrees()
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
          <p className="hx-head__aside">These are planned degree areas. No institution, accreditation or admission process is confirmed, and applications are not open. You can register interest. Career OS is not connected to these listings.</p>
        </Reveal>
        <ul className="hx-doors">
          {DEGREE_DOORS.map((door) => {
            const items = degrees.filter((degree) => degree.level === door.level)
            const areas = [...new Set(items.map((degree) => degree.discipline))]
            const modes = [...new Set(items.map((degree) => deliveryModeLabel(degree.deliveryMode)))]
            return (
              <li key={door.short}>
                <Link to={`/education?level=${door.param}`} className="hx-door">
                  <span className="hx-door__media">
                    <img src={door.img} alt={door.alt} width={door.width} height={door.height} loading="lazy" decoding="async" />
                    <span className="hx-door__tag">Planned · not open for applications</span>
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
                      Explore {door.name.toLowerCase()} degrees
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
  { key: "enrol", title: "Enrol", text: "Your Career OS profile starts with your first programme." },
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
          <p className="hx-head__aside">The projects and evidence from your programmes feed one Career OS profile. It stays with you after you enrol and keeps growing as you learn.</p>
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
  const lines = ["After you enrol in a skill programme, lessons from that programme can appear in Career OS."]
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
          <span className="hx-screen__hint">Joining a skill programme is what opens Career OS. You choose who can see the profile. This is not your account.</span>
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
          <span className="hx-screen__hint">Career OS can show the lesson you are taking in an enrolled programme. It is not a count of lessons you have finished.</span>
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
          <span className="hx-screen__hint">These are the parts of the capstone. Nothing here is a finished project in an account.</span>
        </div>
      </div>
    )
  }
  if (step === "evidence") {
    return (
      <div className="hx-screen">
        <p className="hx-screen__label">What a record would hold</p>
        <div className="hx-screen__card">
          <span className="hx-screen__row"><b>Evidence record</b><span className="hx-screen__tag">Not released</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">The work</span><span>The project it came from</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">What it shows</span><span>Written when a record exists</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Reflection</span><span>Yours, when a record exists</span></span>
          <span className="hx-screen__hint">Records you can share are not released. This is the shape of one, not a completed record.</span>
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
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Skills</span><span>You add them. Skylent does not score them.</span></span>
          <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Education</span><span>You record it. Degree listings are not connected.</span></span>
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
      <p className="hx-screen__hint">You file the applications. Career OS can keep them in order. It does not publish roles or apply for you.</p>
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
          <p className="hx-head__aside">Skill programmes can feed learning into Career OS after you enrol. A degree pathway is not connected, and nothing here is your account.</p>
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
            <p className="hx-career__label">Illustrative preview · Not connected</p>
            <div className="hx-window">
              <div className="hx-window__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>Career OS</em>
              </div>
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
  { title: "Finds a starting point", text: "A few questions, then programmes or degrees from the Skylent catalogue." },
  { title: "Explains inside lessons", text: "Ask about the lesson you have open, in plain language." },
  { title: "Keeps assessments fair", text: "It will not give answers to an open quiz or write an open assignment for you." },
] as const

const AI_FIRST_OPTIONS = ["Learn a job skill", "Study for a degree", "I'm not sure yet"] as const

const AI_BEATS = [1600, 1400, 1500, 1200, 1600, 1500, 1800] as const

function AiTranscript({ beat }: { beat: number }) {
  return (
    <>
      <div className="hx-chat__row">
        <SkylentBot size={26} />
        <p className="hx-chat__bubble">Hi. What are you looking for?</p>
      </div>
      {beat < 2 ? (
        <div className="hx-chat__options">
          {AI_FIRST_OPTIONS.map((option) => (
            <span key={option} className={beat >= 1 && option === "Learn a job skill" ? "is-on" : undefined}>{option}</span>
          ))}
        </div>
      ) : (
        <div className="hx-chat__row hx-chat__row--user">
          <p className="hx-chat__bubble hx-chat__bubble--user">Learn a job skill</p>
        </div>
      )}
      {beat === 3 ? (
        <div className="hx-chat__row">
          <SkylentBot size={26} />
          <p className="hx-chat__typing"><span /><span /><span /></p>
        </div>
      ) : null}
      {beat >= 4 ? (
        <div className="hx-chat__row">
          <SkylentBot size={26} />
          <p className="hx-chat__bubble">Which kind of work do you want to practise?</p>
        </div>
      ) : null}
      {beat >= 5 ? (
        <div className="hx-chat__row hx-chat__row--user">
          <p className="hx-chat__bubble hx-chat__bubble--user">Data Analytics</p>
        </div>
      ) : null}
      {beat >= 6 ? (
        <div className="hx-chat__row">
          <SkylentBot size={26} />
          <p className="hx-chat__bubble">Data Analytics is open. It takes one sales extract through SQL to a recommendation you can keep. Explore it from Programmes.</p>
        </div>
      ) : null}
    </>
  )
}

export function HomeAi() {
  const demo = useProductDemo(AI_BEATS)
  const beat = demo.reduced ? 0 : demo.index
  const [trackedBeat, setTrackedBeat] = useState(beat)
  const [epoch, setEpoch] = useState(0)
  if (beat !== trackedBeat) {
    setTrackedBeat(beat)
    if (beat < trackedBeat) setEpoch((current) => current + 1)
  }
  return (
    <section
      ref={demo.ref}
      id="skylent-ai"
      className="hx-ai hx-ai--id"
      aria-labelledby="hx-ai-title"
      onMouseEnter={() => demo.setHolding(true)}
      onMouseLeave={() => demo.setHolding(false)}
      onFocus={() => demo.setHolding(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) demo.setHolding(false)
      }}
    >
      <div className="sky-container hx-ai__layout">
        <div className="hx-ai__intro">
          <div className="hx-ai__id">
            <span className="hx-ai__avatar" aria-hidden="true">
              <SkylentBot size={52} />
            </span>
            <span>
              <span className="hx-ai__name">Skylent AI</span>
              <span className="hx-ai__role">Your guide on Skylent</span>
            </span>
          </div>
          <h2 id="hx-ai-title" className="hx-h2 hx-h2--sm">
            Not sure where to start? <em>Ask.</em>
          </h2>
          <ul className="hx-ai__helps">
            {AI_HELPS.map((help) => (
              <li key={help.title}>
                <span className="hx-ai__help-title">{help.title}</span>
                <span className="hx-ai__help-text">{help.text}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
            Ask Skylent AI
            <ArrowRight />
          </button>
        </div>
        <div className="hx-ai__chat">
          <div className="hx-ai__chatbar">
            <SkylentBot size={26} />
            <span>Skylent AI</span>
          </div>
          <div className="hx-chat hx-chat--stage" aria-hidden="true">
            <div className="hx-chat__measure hx-stable">
              {AI_BEATS.map((_, index) => (
                <div key={index} className="hx-stable__pane">
                  <AiTranscript beat={index} />
                </div>
              ))}
            </div>
            <div key={epoch} className="hx-chat__live">
              <AiTranscript beat={beat} />
            </div>
          </div>
          <p className="hx-ai__chatnote">Illustrative preview · Not a live conversation.</p>
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
  { title: "Available now", text: "Open programmes include written lessons, checks, and practice. Career OS keeps a profile, projects, and the applications you record." },
  { title: "Not a live dashboard here", text: "The workspace shown in the hero is an illustration. It is not connected to a learner account." },
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
          <p className="hx-eyebrow">Start with one programme</p>
          <h2 id="hx-close-title" className="hx-close__title">
            Your next step <em>starts here.</em>
          </h2>
          <p className="hx-close__lead">Explore Skylent and the learning directions that are open now.</p>
        </div>
        <div className="hx-close__actions">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
            Create your account
            <ArrowRight />
          </Link>
          <Link className="hx-close__link" to="/programmes">
            Browse programmes
          </Link>
        </div>
      </div>
    </section>
  )
}
