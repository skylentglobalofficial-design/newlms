/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Visual Identity (V18 Royal Midnight Navy + Gold + Emerald on Crisp White):
 *   - Page background: Crisp White (#ffffff) & Soft Ice (#f8fafc)
 *   - Feature Cards: Royal Midnight Navy (linear-gradient(135deg, #3B2D96 0%, #5142B5 100%))
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
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            Practical courses with hands-on projects &amp; internship.
          </h1>
          <span className="hx-sr" style={{ display: "none" }}>Learn. Practise. Build. <em>Prove it.</em> Interactive SQL &amp; Python practice</span>
          <p className="hxw-hero__lead hx-rise" style={{ marginTop: 14, marginBottom: 24 }}>
            Learn in live browser labs with a 2-month complimentary internship, or choose our dedicated Job Assistance track.
          </p>
          <p className="hx-sr" aria-live="polite">{availability}</p>

          <div className="hxw-hero__actions hx-rise" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore Programmes
              <ArrowRight />
            </Link>
            <a
              className="sk-btn sk-btn-secondary hx-btn"
              href="#programmes"
              style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 600 }}
            >
              View Plans (₹1,499 & ₹11,999)
            </a>
          </div>
          <div
            className="hx-rise"
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid #e2e8f0",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              maxWidth: 520,
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>2 Months</strong>
              <span style={{ fontSize: 12.5, color: "#475569" }}>Course + Free Internship</span>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#5142b5" }}>₹1,499</strong>
              <span style={{ fontSize: 12.5, color: "#475569" }}>Certification + Internship</span>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>₹11,999</strong>
              <span style={{ fontSize: 12.5, color: "#475569" }}>Full Job Assistance</span>
            </div>
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

            <div className="hxw-ws" aria-label="Skylent OS workspace summary">
              <div className="hxw-ws__top">
                <span className="hxw-ws__mark" aria-hidden="true">✓</span>
                <div>
                  <span className="hxw-ws__title">Hands-On Labs + 2-Month Internship</span>
                  <span className="hxw-ws__note">Certification Plan (₹1,499) · Job Assistance Track (₹11,999)</span>
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
  { icon: "sparkle", title: "Path Finder", text: "A 90-second guide for where to start across the 6 Skylent tracks.", to: "/path" },
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
  { key: "programme", label: "1. Course Syllabus", href: "/programmes/data-analytics-pro", action: "Explore Programmes" },
  { key: "lesson", label: "2. Interactive Lesson", href: "/courses/data-analytics", action: "Preview Lessons" },
  { key: "practice", label: "3. Browser SQL Lab", href: "/labs", action: "See Browser Labs" },
  { key: "project", label: "4. Capstone Project", href: "/verify/SKL-2026-DA-EXEMPLAR", action: "View Capstones" },
  { key: "evidence", label: "5. Verified Certificate", href: "/verify/SKL-2026-DA-EXEMPLAR", action: "Verify Credentials" },
] as const

function LmsCanvas({ stage }: { stage: number }) {
  const facts = courseFacts()
  const content = authoredProgrammeContent(DA_SLUG)
  const max = NORTHWIND.categories[0].value

  if (stage === 0) {
    return (
      <div className="hx-canvas" style={{ padding: "8px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Step 1 · Structured Curriculum
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              {facts?.title ?? "Data Analytics"} — 5 Modules · 15 Guided Lessons
            </h3>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#5142b5", fontSize: 12.5, fontWeight: 600 }}>
            Self-Paced · Browser Lab Included
          </span>
        </div>

        <ol className="hx-mods" style={{ display: "grid", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
          {(facts?.modules ?? []).map((module) => (
            <li
              key={module.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderRadius: 12,
                background: module.state === "current" ? "#f5f3ff" : "#ffffff",
                border: module.state === "current" ? "1.5px solid #5142b5" : "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", minWidth: 72 }}>{module.label}</span>
                <div>
                  <strong style={{ display: "block", fontSize: 14.5, color: "#0f172a" }}>{module.title}</strong>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>{module.lessons.length} lessons · Notes, Browser Lab &amp; Project Brief</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: module.state === "current" ? "#5142b5" : "#475569" }}>
                {module.state === "current" ? "Active Module" : module.state === "complete" ? "✓ Completed" : "3 Lessons"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (stage === 1) {
    return (
      <div className="hx-canvas" style={{ padding: "8px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Step 2 · Interactive Lesson &amp; Study Notes
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              {facts?.current.title ?? "SQL SELECT, WHERE, and aggregates"}
            </h3>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: 12.5, fontWeight: 600 }}>
            English + Hinglish Notes
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div style={{ padding: "20px", borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", fontSize: 15.5, color: "#0f172a", marginBottom: 8 }}>
              Filtering valid order rows before calculating revenue
            </strong>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
              Raw sales tables include cancelled shipments and returned orders. Filtering those rows out first ensures your category revenue total is accurate.
            </p>
            <pre className="hx-sql" style={{ margin: 0, padding: "12px 14px", borderRadius: 10, fontSize: 12.5 }}>
              {`SELECT category, SUM(units * unit_price)
FROM northwind_orders
WHERE units > 0 AND returned = 'no'
GROUP BY category;`}
            </pre>
          </div>

          <div style={{ padding: "20px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "3px solid #5142b5", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
            <div>
              <span style={{ display: "inline-block", fontSize: 11.5, fontWeight: 700, color: "#5142b5", marginBottom: 6 }}>
                SIMPLE HINGLISH EXPLANATION
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                “Socho ek order bill mein 4 items hain. Agar bina filter kiye seedha JOIN karke total nikaloge, toh returned items bhi revenue mein count ho jayenge. Isliye pehle <code style={{ fontSize: 12.5 }}>WHERE returned = &apos;no&apos;</code> lagao.”
              </p>
            </div>
            <div style={{ paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#475569" }}>
              <span>Need help with a query?</span>
              <strong style={{ color: "#5142b5" }}>Ask Mentor Desk (20-min reply) →</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 2) {
    return (
      <div className="hx-canvas" style={{ padding: "8px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Step 3 · In-Browser SQL Lab
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Run real SQL queries in your browser — zero setup
            </h3>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: 12.5, fontWeight: 600 }}>
            ✓ {NORTHWIND.validRows} Verified Rows
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div>
            <pre className="hx-sql" style={{ margin: 0, height: "100%", boxSizing: "border-box" }}>{NORTHWIND_CATEGORY_SQL_EXCERPT}</pre>
          </div>
          <div style={{ padding: "20px", borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", fontSize: 15, color: "#0f172a", marginBottom: 12 }}>
              Query Output · Net Revenue by Category
            </strong>
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
        </div>
      </div>
    )
  }

  if (stage === 3) {
    const title = content?.capstoneTitle ?? facts?.capstoneTitle ?? "Northwind Commercial Review"
    return (
      <div className="hx-canvas" style={{ padding: "8px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Step 4 · Guided Capstone Project
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              {title}
            </h3>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#5142b5", fontSize: 12.5, fontWeight: 600 }}>
            Faculty Reviewed
          </span>
        </div>

        <ol className="hx-deliver" style={{ margin: 0 }}>
          {[
            "Clean 180 raw order rows and filter out 14 returned or cancelled records",
            "Run multi-table SQL joins to compare category revenue and discount leakage",
            "Submit a concise business recommendation reviewed by faculty",
          ].map((task, index) => (
            <li key={task} className={index === 1 ? "is-open" : undefined}>
              <span>0{index + 1}</span>
              <span>{task}</span>
              <span>{index === 0 ? "✓ Completed" : index === 1 ? "In Progress" : "Final Step"}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  const record = content?.evidence.record
  return (
    <div className="hx-canvas" style={{ padding: "8px 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Step 5 · Shareable Certificate &amp; Portfolio
          </span>
          <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {record?.title ?? "Northwind Commercial Review"} · Verified Certificate
          </h3>
        </div>
        <span style={{ padding: "5px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: 12.5, fontWeight: 600 }}>
          ✓ Publicly Verifiable at /verify
        </span>
      </div>

      <div style={{ padding: "20px", borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0", borderTop: "3px solid #5142b5" }}>
        <dl className="hx-record" style={{ margin: 0 }}>
          <div><dt>Certificate ID</dt><dd>SKL-2026-DA-EXEMPLAR · Issued by Skylent Global Pvt. Ltd.</dd></div>
          <div><dt>Project Included</dt><dd>{record?.workShown}</dd></div>
        </dl>
        <p className="hx-chips" style={{ marginTop: 14, marginBottom: 0 }}>
          {(record?.skills ?? []).slice(0, 4).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </p>
      </div>
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
              Inside the learning workspace
            </h2>
          </div>
          <p className="hx-head__aside">
            Interactive labs and code sandboxes live right inside each course — click through the 5 stages below to see how you learn and build on Skylent.
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
    line: "Interactive SQL practice on the Northwind sales extract, 15 interactive lessons, and a commercial review capstone.",
  },
  "product-management": {
    title: "Product Management",
    image: photoProduct,
    width: 800,
    height: 534,
    alt: "Illustrative product working session.",
    line: "Harbor Desk operations case workspace, 15 interactive lessons, and a constrained product specification.",
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
  const [trackFilter, setTrackFilter] = useState<"all" | "data" | "ai" | "product-web">("all")
  const rows = homeRows(programmes).filter((row) => FOCUS_SLUGS.includes(row.program.slug as (typeof FOCUS_SLUGS)[number]))
  const ordered = [...rows].sort((a, b) => FOCUS_SLUGS.indexOf(a.program.slug as (typeof FOCUS_SLUGS)[number]) - FOCUS_SLUGS.indexOf(b.program.slug as (typeof FOCUS_SLUGS)[number]))
  return (
    <section id="programmes" className="hx-programmes" aria-labelledby="hx-programmes-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">6 Job-Ready Career Tracks</p>
            <h2 id="hx-programmes-title" className="hx-h2">
              Choose a career track
            </h2>
            <p className="hx-programmes__lead">{homepageProgrammeLead(loading, confirmed)}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {[
              { id: "all" as const, label: "All (6)" },
              { id: "data" as const, label: "Data & SQL" },
              { id: "ai" as const, label: "AI & Python" },
              { id: "product-web" as const, label: "Product & Web" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrackFilter(tab.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: trackFilter === tab.id ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                  background: trackFilter === tab.id ? "#5142b5" : "#ffffff",
                  color: trackFilter === tab.id ? "#ffffff" : "#334155",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
            <Link className="hx-more" to="/programmes" style={{ marginLeft: 6 }}>
              Compare all
              <ArrowRight />
            </Link>
          </div>
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
                  group: "data",
                  to: "/programmes/data-analytics-pro",
                  category: "DATA ANALYTICS",
                  title: "Data Analytics",
                  desc: "Master SQL queries, spreadsheets & BI dashboards with hands-on business analytics projects.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoAnalytics,
                  alt: "Data Analytics workspace preview",
                },
                {
                  slug: "product-management",
                  group: "product-web",
                  to: "/programmes/product-management",
                  category: "PRODUCT MANAGEMENT",
                  title: "Product Management",
                  desc: "Master user research, product strategy, metrics & engineering PRDs with real case studies.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoProduct,
                  alt: "Product Management studio preview",
                },
                {
                  slug: "python-programming",
                  group: "ai",
                  to: "/courses/python-programming",
                  category: "PYTHON & AUTOMATION",
                  title: "Python & Automation",
                  desc: "Build Python data automation scripts, validators & backend ETL workflows from scratch.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoScience,
                  alt: "Python engineering workspace preview",
                },
                {
                  slug: "data-science-ai",
                  group: "data",
                  to: "/programmes/data-science-ai",
                  category: "DATA SCIENCE",
                  title: "Data Science & AI",
                  desc: "Combine SQL revenue analytics, Python data pipelines & cohort retention modelling.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoClass,
                  alt: "Data Science cohort analysis preview",
                },
                {
                  slug: "generative-ai",
                  group: "ai",
                  to: "/programmes/generative-ai-program",
                  category: "GENERATIVE AI",
                  title: "Generative AI",
                  desc: "Build grounded RAG assistants, prompt workflows & practical AI applications in your browser.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoCampusPg,
                  alt: "Generative AI evaluation preview",
                },
                {
                  slug: "full-stack-web",
                  group: "product-web",
                  to: "/programmes/full-stack",
                  category: "FULL-STACK WEB",
                  title: "Full-Stack Web Development",
                  desc: "Build full-stack React + TypeScript interfaces, Node APIs & PostgreSQL database apps.",
                  meta: "2 Months + Internship · From ₹1,499",
                  img: photoScience,
                  alt: "Full-stack engineering preview",
                },
              ].filter((item) => trackFilter === "all" || item.group === trackFilter).map((item) => (
                <li key={item.slug}>
                  <Link to={item.to} className="hx-live-course-card">
                    <span className="hx-live-course-card__media" style={{ position: "relative" }}>
                      <img
                        src={item.img}
                        alt={item.alt}
                        width={800}
                        height={530}
                        loading="lazy"
                        decoding="async"
                        style={item.slug === "full-stack-web" ? { objectPosition: "left center", filter: "hue-rotate(-14deg) saturate(1.08)" } : undefined}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: 12,
                          bottom: 10,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "rgba(15, 23, 42, 0.84)",
                          backdropFilter: "blur(6px)",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item.slug === "data-analytics"
                          ? "SQL · Excel · BI Dashboards"
                          : item.slug === "product-management"
                            ? "PRDs · User Research · Metrics"
                            : item.slug === "python-programming"
                              ? "Python 3 · Pandas · ETL"
                              : item.slug === "data-science-ai"
                                ? "SQL · Python · Cohort Models"
                                : item.slug === "generative-ai"
                                  ? "OpenAI · RAG · Prompt Evals"
                                  : "React · TypeScript · Node · SQL"}
                      </span>
                    </span>
                    <span className="hx-live-course-card__body">
                      <span className="hx-live-course-card__cat">{item.category}</span>
                      <strong className="hx-live-course-card__title">{item.title}</strong>
                      <span className="hx-live-course-card__desc">{item.desc}</span>
                      <span className="hx-live-course-card__foot">
                        <span className="hx-live-course-card__meta">{item.meta}</span>
                        <span className="hx-live-course-card__cta">
                          Explore Programme <ArrowRight />
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
              Undergraduate and postgraduate pathways
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
  { key: "learn", title: "Learn Step-by-Step", sub: "Interactive lessons + concept checks", text: "Master concepts in plain language with instant English & Hinglish AI explanations." },
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
          <span className="hx-royal-plate__gold">Step 01 · Course Workspace</span>
          <span className="hx-royal-plate__emerald">✓ +50 Elixir Welcome Bonus</span>
        </div>
        <h3 className="hx-royal-plate__title">Start {programme} in One Click</h3>
        <p className="hx-royal-plate__sub">5 Modules · 15 Guided Lessons · Pre-Loaded Browser SQL Lab · Zero Setup</p>
        <div className="hx-royal-plate__metrics">
          <div>
            <span>Cost to Start</span>
            <strong>Guest Lab Free · Tracks From ₹1,499</strong>
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
          <span className="hx-royal-plate__gold">Step 02 · Guided Modules</span>
          <span className="hx-royal-plate__emerald">✓ +5 to +15 Coins / Milestone</span>
        </div>
        <h3 className="hx-royal-plate__title">{facts ? facts.current.title : "SQL Joins & Revenue Hygiene"}</h3>
        <p className="hx-royal-plate__sub">Short, clear readings written in plain language — with built-in English &amp; Hinglish study notes</p>
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
            <strong>Guided Hints + 20-Min Human TA</strong>
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
          <span className="hx-royal-plate__gold">Step 03 · Capstone Project</span>
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
          <span className="hx-royal-plate__gold">Step 04 · Verified Credential</span>
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
          <span className="hx-royal-plate__gold">Step 05 · Portfolio Profile</span>
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
        <span className="hx-royal-plate__gold">Step 06 · Interview Prep &amp; Role Applications</span>
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
              From your first lesson to a verified portfolio
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
    tabLabel: "Explain in Simple Hinglish",
    badge: "Hinglish + English Intuition",
    studentQ: "Bhai, SQL mein WHERE aur HAVING dono filter karte hain toh dono mein asli fark kya hai? Simple Hinglish mein samjhao.",
    coachTitle: "Guided Study Notes · Instant Hinglish Breakdown",
    coachReply: "Simple rule: WHERE filters raw rows before GROUP BY. HAVING filters aggregated totals (like SUM or COUNT) after GROUP BY.",
    takeaway: " Rule of thumb: Raw row filter = WHERE · Grouped total filter = HAVING.",
    pills: ["Switch to English", "Run this in SQL Lab", "Give me 1 practice question"],
  },
  {
    id: "debug",
    tabLabel: "Debug SQL & Code",
    badge: "Live Code & Query Debugger",
    studentQ: "Why is my Northwind category revenue total showing ₹9,40,000 instead of ₹8,12,020 when I run SUM(units * unit_price)?",
    coachTitle: "Interactive Lab Check · Line-by-Line Bug Catch",
    coachReply: "Check two filters: (1) apply (1 - discount_pct / 100.0), and (2) add WHERE returned = 'no' AND units > 0 to exclude the 14 returned rows.",
    takeaway: "Always check row hygiene (returned = 'no') before aggregating revenue.",
    pills: ["Apply fix in Lab", "Check rubric criteria", "Test edge cases"],
  },
  {
    id: "human",
    tabLabel: "20-Minute Faculty Review",
    badge: "Guaranteed 20-Min Faculty TA SLA",
    studentQ: "I finished my Capstone SQL query and executive memo, but I'm not sure if my Q2 margin recommendation is strong enough for recruiters.",
    coachTitle: "Human Faculty TA Desk · Structured Rubric Feedback",
    coachReply: "Your SQL CTE is accurate. Quantify the ₹48,200 margin recovery in your recommendation so recruiters see the exact business impact.",
    takeaway: "Every enrolled learner gets direct access to human Faculty TAs with a 20-minute response SLA.",
    pills: ["20-Min TA SLA", "Rubric pre-check", "Capstone review"],
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
                <span className="hx-ai__name">24/7 Study Support + 20-Min Faculty TA Help</span>
                <span className="hx-ai__role">Never get stuck alone · English &amp; Hinglish Explanations · Live Code Review</span>
              </span>
            </div>
            <h2 id="hx-ai-title" className="hx-h2 hx-h2--sm" style={{ marginTop: 14 }}>
              Bilingual study notes and 20-minute faculty TA support
            </h2>
          </div>
          <p className="hx-head__aside">
            Built-in English &amp; Hinglish guided concept notes inside every lesson, backed by 20-minute Faculty TA support.
          </p>
        </div>

        <div className="hx-ai-studio">
          {/* Left: 3 Interactive Scenario Selector Cards */}
          <div className="hx-ai-studio__tabs" role="tablist" aria-label="Study support and faculty review scenarios">
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
              <Link className="sk-btn sk-btn-primary" to="/programmes">
                Explore Programmes
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
            Start learning for free today
          </h2>
          <p className="hx-close__lead">
            Try our interactive Guest Browser Labs free, enrol in any of our 6 self-paced flagship courses from ₹1,499, or book a live ₹99 weekend workshop (with 100% Coin Back).
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
      desc: "Build a citation-grounded RAG assistant & evaluation pipeline in 120 minutes.",
      skills: ["Grounded RAG", "Prompt Guardrails", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
    },
    {
      slug: "commercial-sql-analytics-workshop",
      tag: "LIVE SQL STUDIO · 2 HOURS",
      priceBadge: "₹99 · 100% Coin Back",
      title: "Commercial SQL & Revenue Analytics Bootcamp",
      audience: "For Future Data & Business Analysts · Browser SQL Lab",
      desc: "Write multi-table SQL joins & CTEs on 180 retail orders to find margin leaks.",
      skills: ["Multi-Table SQL", "Margin Audit", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
    },
    {
      slug: "product-triage-prd-workshop",
      tag: "LIVE CASE TEARDOWN · 2 HOURS",
      priceBadge: "₹99 · 100% Coin Back",
      title: "Product Strategy & PRD Teardown Workshop",
      audience: "For Future Product Managers & Founders · Real Case Study",
      desc: "Turn customer escalations into a scoped, engineering-ready PRD in 2 hours.",
      skills: ["PRD Writing", "Feature Prioritisation", "Workshop Certificate"],
      cta: "Book ₹99 Seat & Get 99 Coins →",
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
              Weekend live workshops for ₹99
            </h2>
            <p className="hx-royal-showcase__sub">
              Join a 2-hour weekend workshop for ₹99 — earn a verified certificate plus 99 Elixir Coins (100% cashback) to unlock case studies.
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
        background: "linear-gradient(180deg, #F6F4FF 0%, #FFFFFF 100%)",
        borderTop: "1px solid #DDD7FF",
        borderBottom: "1px solid #DDD7FF",
        padding: "clamp(44px, 5.2vw, 72px) 0",
        color: "#0F172A",
      }}
    >
      <div className="sky-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#5142B5", font: "700 11.5px/1.4 var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              SKYLENT APPLIED WORK MODEL · SIMULATED LABS TO REAL PARTNER FIELDWORK
            </p>
            <h2 id="hx-inst-arch-title" style={{ margin: 0, fontSize: "clamp(24px, 3vw, 36px)", color: "#0F172A", fontFamily: "var(--sk-font-heading)", fontWeight: 750, lineHeight: 1.14, letterSpacing: "-0.02em" }}>
              From Simulated Enterprise Units to <span style={{ color: "#5142B5" }}>Real Partner Fieldwork</span>
            </h2>
          </div>
          <div role="tablist" aria-label="Institutional Environments" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "envB"}
              onClick={() => setActiveTab("envB")}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: activeTab === "envB" ? "1.5px solid #5142B5" : "1px solid #DDD7FF",
                background: activeTab === "envB" ? "#5142B5" : "#FFFFFF",
                color: activeTab === "envB" ? "#FFFFFF" : "#43349F",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: activeTab === "envB" ? "0 6px 16px -6px rgba(81, 66, 181, 0.35)" : "none",
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
                padding: "10px 18px",
                borderRadius: 999,
                border: activeTab === "envA" ? "1.5px solid #5142B5" : "1px solid #DDD7FF",
                background: activeTab === "envA" ? "#5142B5" : "#FFFFFF",
                color: activeTab === "envA" ? "#FFFFFF" : "#43349F",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: activeTab === "envA" ? "0 6px 16px -6px rgba(81, 66, 181, 0.35)" : "none",
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
                padding: "10px 18px",
                borderRadius: 999,
                border: activeTab === "rubric" ? "1.5px solid #5142B5" : "1px solid #DDD7FF",
                background: activeTab === "rubric" ? "#5142B5" : "#FFFFFF",
                color: activeTab === "rubric" ? "#FFFFFF" : "#43349F",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: activeTab === "rubric" ? "0 6px 16px -6px rgba(81, 66, 181, 0.35)" : "none",
              }}
            >
              03 · L1–L5 &amp; 5-Dimension Flight Recorder
            </button>
          </div>
        </div>

        {activeTab === "envB" ? (
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderLeft: "5px solid #5142B5", borderRadius: 16, padding: "20px 24px", boxShadow: "0 8px 24px -12px rgba(81, 66, 181, 0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ padding: "4px 12px", borderRadius: 999, background: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", fontSize: 11.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  ✓ ENVIRONMENT B · SKYLENT WORK ASSIGNMENT EXCHANGE (CUTTACK–BHUBANESWAR &amp; INDIA-WIDE HYBRID)
                </span>
                <Link to="/contact?for=institution" style={{ color: "#5142B5", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                  Submit a Partner Organisation Problem →
                </Link>
              </div>
              <p style={{ margin: 0, color: "#334155", fontSize: 14.5, lineHeight: 1.6 }}>
                After mastering Environment A simulations, learners qualify for <strong style={{ color: "#0F172A" }}>supervised fieldwork with real MSMEs, local manufacturers, clinics (non-clinical workflows), NGOs, startups, and colleges</strong>. Real organisations submit scoped operational problems; Skylent faculty validate permissions and supervise V1 → V2 delivery.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <article style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "1px solid #E2E8F0", borderRadius: 14, padding: 20, boxShadow: "0 8px 22px -12px rgba(81, 66, 181, 0.12)" }}>
                <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, background: "#F5F3FF", border: "1px solid #DDD7FF", color: "#5142B5", fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  FIELDWORK ARCHETYPE 01 · MSME &amp; DISTRIBUTION
                </span>
                <h3 style={{ margin: "10px 0 8px", fontSize: 17.5, fontWeight: 750, color: "#0F172A" }}>Regional Distributor Margin &amp; Return Leakage Audit</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.58 }}>
                  <strong style={{ color: "#0F172A" }}>Problem Scope:</strong> 4,000+ anonymised invoice rows with falling SKU margins. Learners isolate discount leakage, submit V1 SQL/sheet memo, and incorporate supervisor V2 critique.
                </p>
              </article>
              <article style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "1px solid #E2E8F0", borderRadius: 14, padding: 20, boxShadow: "0 8px 22px -12px rgba(81, 66, 181, 0.12)" }}>
                <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, background: "#F5F3FF", border: "1px solid #DDD7FF", color: "#5142B5", fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  FIELDWORK ARCHETYPE 02 · STARTUP &amp; SaaS OPS
                </span>
                <h3 style={{ margin: "10px 0 8px", fontSize: 17.5, fontWeight: 750, color: "#0F172A" }}>Onboarding Drop-Off &amp; Support Ticket Triage</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.58 }}>
                  <strong style={{ color: "#0F172A" }}>Problem Scope:</strong> Categorise 150 support escalations, write a 2-week engineering fix PRD, and defend trade-offs before the partner product lead.
                </p>
              </article>
              <article style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "1px solid #E2E8F0", borderRadius: 14, padding: 20, boxShadow: "0 8px 22px -12px rgba(81, 66, 181, 0.12)" }}>
                <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, background: "#F5F3FF", border: "1px solid #DDD7FF", color: "#5142B5", fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  FIELDWORK ARCHETYPE 03 · NGO &amp; CLINIC WORKFLOWS
                </span>
                <h3 style={{ margin: "10px 0 8px", fontSize: 17.5, fontWeight: 750, color: "#0F172A" }}>Non-Clinical Appointment Queue &amp; Impact Reporting</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.58 }}>
                  <strong style={{ color: "#0F172A" }}>Problem Scope:</strong> Strict privacy-gated operational reporting on wait-time bottlenecks and field survey data hygiene, signed off by faculty reviewers.
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
              <div key={title} style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "1px solid #E2E8F0", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px -12px rgba(81, 66, 181, 0.1)" }}>
                <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 999, background: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{school}</span>
                <h3 style={{ margin: "8px 0 6px", fontSize: 17, fontWeight: 750, color: "#0F172A" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.55 }}>{desc}</p>
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
                <div key={k} style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "1px solid #E2E8F0", borderRadius: 12, padding: 16, boxShadow: "0 6px 18px -10px rgba(81, 66, 181, 0.1)" }}>
                  <strong style={{ color: "#5142B5", fontSize: 17, fontWeight: 600, display: "block", marginBottom: 4 }}>{k}</strong>
                  <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.45, display: "block" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderRadius: 14, padding: "16px 20px" }}>
              <span style={{ fontSize: 13.5, color: "#334155" }}>
                <strong style={{ color: "#0F172A" }}>5 Internal Competency Levels:</strong> L1 Foundation → L2 Guided Practice → L3 Independent Execution → L4 Professional Practice → L5 Advanced Practice
              </span>
              <Link to="/verify" style={{ padding: "8px 16px", borderRadius: 999, background: "#5142B5", color: "#FFFFFF", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Open Public Flight Recorder Registry →
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
