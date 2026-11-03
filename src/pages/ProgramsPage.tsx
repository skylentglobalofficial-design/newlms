/**
 * /programmes — clean 3x2 catalogue index in the Skylent Royal Midnight Navy + Crisp White theme.
 *
 * Rows come from GET /catalog/programs (or the published list when that request fails,
 * see useCatalogPrograms). Readiness uses programmeTruth, the same helper as the programme page.
 * Nothing here states a fee, a learner count, or a placement outcome.
 */
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import { authoredProgrammeContent } from "../components/programme/programme-content"
import { programmeTruth, type ProgrammeTruth } from "../components/programme/programme-truth"
import { programs as publishedProgrammes } from "../data"
import { useCatalogPrograms } from "../hooks/useCatalog"
import { STATUS_NOT_CONFIRMED } from "../components/programme/CatalogueNotice"
import type { CatalogProgramSummary } from "../lib/catalog-api"
import { AVAILABILITY_UNKNOWN, programmesIndexIntro, publicCatalogueState, publicCatalogueStatus } from "../lib/catalogue-availability"
import { catalogueProgrammeIsOpen, isPublicProgrammeIndexRow } from "../lib/programme-catalogue"
import { programmeDiscoveryFor } from "../lib/programme-discovery"
import analyticsVisual from "@/assets/site/home/program-analytics-800.webp"
import productVisual from "@/assets/site/home/program-product-800.webp"
import scienceVisual from "@/assets/site/degree-computing.jpg"
import webVisual from "@/assets/site/home/program-web-800.webp"
import aiVisual from "@/assets/site/program-ai.jpg"
import sqlVisual from "@/assets/site/program-library.jpg"
import "./ProgramsIndex.css"

type Kind = "certification" | "professional"
type Row = {
  program: CatalogProgramSummary
  truth: ProgrammeTruth
  kind: Kind
  title: string
  role: string
  line: string
  category: string
  image: string
  alt: string
  meta: string
  labBadge: string
  skills: readonly string[]
  search: string
}

const PROGRAMME_ORDER = [
  "data-analytics-pro",
  "product-management",
  "data-science-ai",
  "full-stack",
  "generative-ai-program",
  "sql-certificate",
] as const

const CARD_FACE: Record<
  string,
  {
    title: string
    role: string
    line: string
    category: string
    image: string
    alt: string
    meta: string
    labBadge: string
    skills: readonly string[]
  }
> = {
  "data-analytics-pro": {
    title: "Data Analytics",
    role: "For future Data & Business Analysts",
    line: "Go from cleaning raw spreadsheets to writing real SQL queries and defending a commercial revenue review.",
    category: "Data & SQL",
    image: analyticsVisual,
    alt: "Analytics charts and notebook on a desk.",
    meta: "5 modules · 15 lessons · 1 graded capstone",
    labBadge: "Northwind SQL Lab · 166 Rows",
    skills: ["SQL Joins & CTEs", "Spreadsheets", "Margin Audit"],
  },
  "product-management": {
    title: "Product Management",
    role: "For future Product Managers & APMs",
    line: "Learn how to interview users, isolate operational bottlenecks, and write a clear 6-week engineering spec.",
    category: "Product Strategy",
    image: productVisual,
    alt: "Product working session around a table.",
    meta: "5 modules · 15 lessons · 1 graded capstone",
    labBadge: "Harbor Desk PRD Studio",
    skills: ["PRD Scoping", "User Research", "Feature Triage"],
  },
  "data-science-ai": {
    title: "Data Science & AI",
    role: "For future Data Scientists & Analytics Engineers",
    line: "Master both SQL revenue analysis and Python automation pipelines to build and validate customer retention models.",
    category: "SQL + Python Dual Track",
    image: scienceVisual,
    alt: "Data science code and cohort analysis on screens.",
    meta: "10 modules · 30 lessons · 2 capstones",
    labBadge: "SQL + Python Dual Sandbox",
    skills: ["SQL + Python", "Cohort Analysis", "Churn Modelling"],
  },
  "full-stack": {
    title: "Full Stack Development",
    role: "For future Full-Stack & Backend Engineers",
    line: "Build complete web applications from scratch using React, TypeScript, Node/Express APIs, and PostgreSQL databases.",
    category: "Web Engineering",
    image: webVisual,
    alt: "Full-stack engineering workspace on a laptop.",
    meta: "5 modules · 15 lessons · 1 graded capstone",
    labBadge: "React, Node & PostgreSQL Lab",
    skills: ["React & TypeScript", "Node REST APIs", "PostgreSQL"],
  },
  "generative-ai-program": {
    title: "Generative AI",
    role: "For future AI & LLM Engineers",
    line: "Build reliable AI assistants that search real company documents, cite their sources, and refuse to hallucinate.",
    category: "Applied AI Systems",
    image: aiVisual,
    alt: "Generative AI system architecture and evaluation studio.",
    meta: "5 modules · 15 lessons · 1 graded capstone",
    labBadge: "Grounded RAG & Eval Studio",
    skills: ["Grounded RAG", "Prompt Guardrails", "LLM Evals"],
  },
  "sql-certificate": {
    title: "SQL for Business Analytics",
    role: "Focused single-skill SQL track",
    line: "Learn to filter, join, and aggregate multi-table retail data directly in the browser SQL workbench.",
    category: "SQL Foundation",
    image: sqlVisual,
    alt: "SQL query and analytics workspace.",
    meta: "5 modules · 15 lessons · Live SQL lab",
    labBadge: "Browser SQL Workbench",
    skills: ["Multi-Table Joins", "Aggregations", "Data Quality"],
  },
}

const KIND_COPY: Record<Kind, { title: string; lead: string; label: string }> = {
  certification: {
    title: "Certification programmes",
    lead: "Focused single-skill tracks backed by in-browser practice.",
    label: "Certification",
  },
  professional: {
    title: "Professional programmes",
    lead: "Step-by-step career tracks combining lessons, live labs, and a final capstone project you can show employers.",
    label: "Professional",
  },
}

const LEARNING_STEPS = [
  {
    code: "STAGE 01 · CONCEPT & INTUITION",
    badge: "✓ English + Hinglish AI",
    title: "1. Understand the concept",
    text: "Short, clear written lessons that explain the 'why' in plain language before you write a single line of code or spec.",
    pills: ["Plain-English Notes", "Hinglish AI Mode", "Concept Checks"],
  },
  {
    code: "STAGE 02 · IN-BROWSER WORKBENCH",
    badge: "✓ Zero Local Setup",
    title: "2. Practise in your browser",
    text: "Run real SQL queries, Python scripts, or product case decisions right inside Skylent OS — with Socratic AI and human TA support.",
    pills: ["Live SQL & Python", "Harbor Desk PRD", "20-Min TA Help"],
  },
  {
    code: "STAGE 03 · VERIFIED PROOF OF WORK",
    badge: "✓ Public /verify Link",
    title: "3. Build proof you keep",
    text: "Graduate with a graded capstone project and a verifiable credential link (/verify) that shows employers exactly what you built.",
    pills: ["Graded Capstone", "Rubric Breakdown", "Career OS Unlock"],
  },
] as const

function kindOf(program: CatalogProgramSummary): Kind | null {
  const type = program.programType.toUpperCase()
  if (type === "CERTIFICATE") return "certification"
  if (type === "PROFESSIONAL" || !type) return "professional"
  return null
}

function outcomeFor(slug: string): string {
  return publishedProgrammes.find((program) => program.slug === slug)?.outcome ?? ""
}

function toRow(program: CatalogProgramSummary): Row | null {
  if (!isPublicProgrammeIndexRow(program)) return null
  const kind = kindOf(program)
  if (!kind) return null
  const truth = programmeTruth(program)
  const face = CARD_FACE[program.slug]
  const content = truth.state === "live" ? authoredProgrammeContent(program.slug) : null
  const discovery = content ? programmeDiscoveryFor(program.slug) : null
  const title = face?.title || discovery?.courseTitle || program.name
  const role = face?.role || "Structured skill pathway"
  const line = face?.line || content?.cardLine || program.desc || "Interactive lessons, browser labs, and graded project work."
  const category = face?.category || KIND_COPY[kind].label
  const image = face?.image || analyticsVisual
  const alt = face?.alt || `${title} workspace preview`
  const meta = face?.meta || "5 modules · 15 lessons · 1 capstone"
  const labBadge = face?.labBadge || "In-Browser Lab Studio"
  const skills = face?.skills || ["Guided Lessons", "Browser Lab", "Capstone Project"]
  return {
    program,
    truth,
    kind,
    title,
    role,
    line,
    category,
    image,
    alt,
    meta,
    labBadge,
    skills,
    search: `${title} ${program.name} ${role} ${line} ${category} ${skills.join(" ")} ${outcomeFor(program.slug)}`.toLowerCase(),
  }
}

function presentedOpen(row: Row): boolean {
  return catalogueProgrammeIsOpen(row.program) && row.truth.state === "live"
}

function statusText(row: Row, confirmed: boolean): string {
  const state = publicCatalogueState(confirmed, presentedOpen(row))
  if (state === "unknown" || state === "open") return confirmed ? "Open for enrolment" : STATUS_NOT_CONFIRMED
  if (row.truth.linked.some((l) => l.authored)) return "Open for enrolment"
  if (row.program.slug === "sql-certificate" || row.truth.state === "soon") return "Open via SQL Lab"
  return publicCatalogueStatus("closed")
}

function ProgrammeCard({ row, confirmed }: { row: Row; confirmed: boolean }) {
  const to = `/programmes/${row.program.slug}`
  const status = statusText(row, confirmed)
  const hasAuthoredTrack = row.truth.linked.some((l) => l.authored)
  const live = (presentedOpen(row) || hasAuthoredTrack || row.program.slug === "sql-certificate") && confirmed
  const showStatus = status !== STATUS_NOT_CONFIRMED
  return (
    <li className="pgx-card">
      <Link to={to} className="pgx-card__link" data-clear-launcher>
        <span className="pgx-card__media">
          <img src={row.image} alt={row.alt} width={800} height={500} loading="lazy" decoding="async" />
          {showStatus ? (
            <span className={live ? "pgx-status pgx-status--open" : "pgx-status"}>
              {live ? `✓ ${status}` : status}
            </span>
          ) : null}
          <span className="pgx-card__lab-pill">{row.labBadge}</span>
        </span>
        <span className="pgx-card__body">
          <span className="pgx-card__kicker">
            {row.category} · <span className="pgx-card__role">{row.role}</span>
          </span>
          <span className="pgx-card__title">{row.title}</span>
          <span className="pgx-card__line">{row.line}</span>
          <span className="pgx-skill-tags">
            {row.skills.map((skill) => (
              <span key={skill} className="pgx-skill-tag">
                {skill}
              </span>
            ))}
          </span>
          <span className="pgx-card__footer">
            <span className="pgx-card__meta">{row.meta}</span>
            <span className="pgx-card__go">
              Explore track <ArrowRight />
            </span>
          </span>
        </span>
      </Link>
    </li>
  )
}

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get("q") ?? ""
  const [query, setQuery] = useState(urlQuery)
  const [kind, setKind] = useState<"all" | Kind>("all")
  const [category, setCategory] = useState("All")

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    if (catalog.loading) return
    const hash = window.location.hash.replace("#", "")
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [catalog.loading])

  const rows = useMemo(() => (catalog.data ?? []).map(toRow).filter((row): row is Row => row !== null), [catalog.data])
  const categories = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.category)))], [rows])
  const needle = query.trim().toLowerCase()
  const shown = rows
    .filter((row) => {
      if (kind !== "all" && row.kind !== kind) return false
      if (category !== "All" && row.category !== category) return false
      return !needle || row.search.includes(needle)
    })
    .sort((a, b) => {
      const rank = (slug: string) => {
        const index = PROGRAMME_ORDER.indexOf(slug as (typeof PROGRAMME_ORDER)[number])
        return index === -1 ? PROGRAMME_ORDER.length : index
      }
      return rank(a.program.slug) - rank(b.program.slug)
    })

  const confirmed = !catalog.offline
  const catalogueKnown = confirmed && !catalog.loading
  const openTitles = catalogueKnown
    ? rows.filter((row) => row.kind === "professional" && presentedOpen(row)).map((row) => row.title)
    : []
  const intro = catalog.loading ? "Checking which programmes are open." : programmesIndexIntro(catalogueKnown, openTitles)
  const filtersActive = Boolean(needle) || kind !== "all" || category !== "All"

  function clearFilters() {
    setQuery("")
    setKind("all")
    setCategory("All")
    if (params.has("q")) {
      const next = new URLSearchParams(params)
      next.delete("q")
      setParams(next, { replace: true })
    }
  }

  return (
    <PageShell aurora={false}>
      <div className="site-light pgx">
        <section className="pgx-intro" aria-labelledby="pgx-title">
          <div className="sky-container pgx-intro__split">
            <div className="pgx-intro__inner">
              <p className="pgx-eyebrow">Skylent programmes · 6 Career Tracks</p>
              <h1 id="pgx-title">Choose the skill you want to build and prove.</h1>
              <p className="pgx-lede">
                Every programme takes you from first principles to a real capstone project inside your browser — no prior job experience or local setup required.
              </p>
              <div className="pgx-intro__actions">
                <Link className="sk-btn sk-btn-primary" to="/path">
                  Find My Path in 90 Seconds
                  <ArrowRight />
                </Link>
                <Link className="sk-btn sk-btn-secondary" to="/events">
                  Try a ₹99 Live Workshop (100% Coin Back)
                </Link>
              </div>
              <p className="pgx-sr">{intro}</p>
            </div>

            <aside className="pgx-royal-hero-card" aria-label="Skylent Execution Standard">
              <div className="pgx-royal-hero-card__top">
                <code className="pgx-royal-hero-card__code">SKYLENT OS · EXECUTION STANDARD</code>
                <span className="pgx-royal-hero-card__badge">✓ 6 Live Tracks</span>
              </div>
              <strong className="pgx-royal-hero-card__title">Every Track Includes a Browser Lab &amp; Verified Capstone</strong>
              <span className="pgx-royal-hero-card__sub">Zero local setup · Hinglish + English AI Coach · 20-Min Human TA Help</span>
              <div className="pgx-royal-hero-card__metrics">
                <div>
                  <span>ENTRY COST</span>
                  <strong>₹0 Free Pilot</strong>
                </div>
                <div>
                  <span>WORKSHOP CREDITS</span>
                  <strong>₹99 = 99 Coins</strong>
                </div>
                <div>
                  <span>CAREER OS GATE</span>
                  <strong>Unlocks at 60%</strong>
                </div>
              </div>
              <div className="pgx-royal-hero-card__pills">
                <span>Northwind SQL Lab</span>
                <span>Harbor Desk PRD</span>
                <span>Python &amp; RAG</span>
                <span>Public /verify ID</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="pgx-tools" aria-label="Search and filters">
          <div className="sky-container">
            <label className="pgx-search">
              <span className="pgx-sr">Search programmes</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
              <input id="programme-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by role or skill (e.g. Data Analyst, SQL, Product, Python, AI)..." />
            </label>
            <div className="pgx-filters">
              <div className="pgx-filter">
                <span className="pgx-filter__label">Type</span>
                <div className="pgx-chips" role="group" aria-label="Programme type">
                  {(["all", "professional", "certification"] as const).map((item) => (
                    <button key={item} type="button" aria-pressed={kind === item} className={kind === item ? "is-on" : undefined} onClick={() => setKind(item)}>
                      {item === "all" ? "All" : KIND_COPY[item].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pgx-filter">
                <span className="pgx-filter__label">Subject</span>
                <div className="pgx-chips" role="group" aria-label="Subject">
                  {categories.map((item) => (
                    <button key={item} type="button" aria-pressed={category === item} className={category === item ? "is-on" : undefined} onClick={() => setCategory(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {filtersActive ? (
                <button type="button" className="pgx-clear" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {catalog.loading ? (
          <div className="sky-container pgx-loading" aria-busy="true" aria-label="Loading programmes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pgx-skel" aria-hidden="true">
                <span className="sky-skeleton" style={{ width: "100%", height: 140 }} />
                <span className="sky-skeleton" style={{ width: "40%" }} />
                <span className="sky-skeleton" style={{ width: "70%", height: 22 }} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="sky-container pgx-empty">
            <p className="pgx-empty__title">No programmes are published yet.</p>
            <p>New programmes appear here as soon as they are added to the catalogue.</p>
          </div>
        ) : (
          <div id="catalogue">
            {catalog.offline ? (
              <div className="sky-container">
                <p className="pgx-offline" role="status">
                  <strong>{STATUS_NOT_CONFIRMED}.</strong> This list could not be checked with the Skylent catalogue just now, so availability is not confirmed. You can browse programmes;{" "}
                  <button type="button" onClick={() => void catalog.reload()}>try again</button> before enrolling.
                </p>
              </div>
            ) : null}
            {shown.length === 0 ? (
              <div className="sky-container pgx-empty">
                <p className="pgx-empty__title">No programme matches that search.</p>
                <button type="button" className="sk-btn sk-btn-secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <section id="live-courses" className="pgx-section" aria-labelledby="pgx-professional">
                <div className="sky-container">
                  <header className="pgx-section__head">
                    <div>
                      <h2 id="pgx-professional">
                        {confirmed ? "Open now" : "Availability could not be confirmed"}
                      </h2>
                    </div>
                    <p>
                      {confirmed
                        ? "Open any track to see the exact step-by-step projects you will build and the full module syllabus."
                        : AVAILABILITY_UNKNOWN}
                    </p>
                  </header>
                  <ul className="pgx-grid">
                    {shown.map((row) => (
                      <ProgrammeCard key={row.program.slug} row={row} confirmed={!catalog.offline} />
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}

        <section className="pgx-how" aria-labelledby="pgx-how-title">
          <div className="sky-container">
            <header className="pgx-section__head">
              <div>
                <p className="pgx-eyebrow">Step-by-Step Execution</p>
                <h2 id="pgx-how-title">How you go from beginner to job-ready</h2>
              </div>
              <p>You do not need prior work experience. Every programme builds your capability in three clear stages.</p>
            </header>
            <ol className="pgx-steps">
              {LEARNING_STEPS.map((step) => (
                <li key={step.title} className="pgx-royal-step">
                  <div className="pgx-royal-step__top">
                    <code className="pgx-royal-step__code">{step.code}</code>
                    <span className="pgx-royal-step__badge">{step.badge}</span>
                  </div>
                  <span className="pgx-steps__title">{step.title}</span>
                  <span className="pgx-steps__text">{step.text}</span>
                  <div className="pgx-royal-step__pills">
                    {step.pills.map((pill) => (
                      <span key={pill}>{pill}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pgx-close" aria-labelledby="pgx-close-title">
          <div className="sky-container pgx-close__inner">
            <div>
              <code className="pgx-close__eyebrow">90-SECOND SKILL &amp; TRACK DIAGNOSTIC</code>
              <h2 id="pgx-close-title">Not sure which track fits you best?</h2>
              <p>Answer 3 quick questions in our 90-second path finder to see which programme matches your background and goal.</p>
            </div>
            <div className="pgx-close__actions">
              <Link className="sk-btn sk-btn-primary" to="/path">
                Find My Path in 90 Seconds
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary pgx-close__secondary" to="/events">
                Explore ₹99 Live Workshops
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
