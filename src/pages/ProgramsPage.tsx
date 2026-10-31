/**
 * /programmes — unified 3x2 photo-card catalogue index with visual presentation hero.
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
import analyticsVisual from "@/assets/site/program-analytics.jpg"
import productVisual from "@/assets/site/program-product.jpg"
import scienceVisual from "@/assets/site/degree-computing.jpg"
import webVisual from "@/assets/site/program-web.jpg"
import aiVisual from "@/assets/site/program-ai.jpg"
import sqlVisual from "@/assets/site/program-library.jpg"
import heroClassroomVisual from "@/assets/site/home/hero-classroom-960.webp"
import "./ProgramsIndex.css"

type Kind = "certification" | "professional"
type Row = {
  program: CatalogProgramSummary
  truth: ProgrammeTruth
  kind: Kind
  title: string
  line: string
  category: string
  image: string
  alt: string
  lab: string
  meta: string
  skills: string[]
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
    line: string
    category: string
    image: string
    alt: string
    lab: string
    meta: string
    skills: string[]
  }
> = {
  "data-analytics-pro": {
    title: "Data Analytics",
    line: "Audit 166 Northwind retail rows, write SQL joins and CTEs, and defend a Q3 commercial margin review.",
    category: "Data",
    image: analyticsVisual,
    alt: "Analytics charts and notebook on a desk.",
    lab: "Northwind SQL Lab · 166 Rows",
    meta: "5 modules · 15 lessons · 3 quizzes · 1 capstone",
    skills: ["SQL & CTEs", "Northwind Lab", "Margin Audit"],
  },
  "product-management": {
    title: "Product Management",
    line: "Diagnose 9 weekend store exceptions on the Harbor Desk case and ship a 6-week engineering-constrained PRD.",
    category: "Product",
    image: productVisual,
    alt: "Product working session around a table.",
    lab: "Harbor Desk Studio · 18 Interviews",
    meta: "5 modules · 15 lessons · 3 quizzes · 1 capstone",
    skills: ["PRD Scoping", "Harbor Desk Case", "Triage Specs"],
  },
  "data-science-ai": {
    title: "Data Science & AI",
    line: "Dual-track pathway combining Data Analytics (SQL & cohorts) and Python Programming & Automation (ETL & pytest).",
    category: "Data",
    image: scienceVisual,
    alt: "Data science code and cohort analysis on screens.",
    lab: "SQL + Python Dual Track · 30 Lessons",
    meta: "10 modules · 30 lessons · 6 quizzes · 2 capstones",
    skills: ["SQL & Python", "Cohort Validation", "Leakage Audit"],
  },
  "full-stack": {
    title: "Full Stack Development",
    line: "Build type-safe React 18 interfaces, Node/Express APIs, PostgreSQL schemas, and idempotent payment ledgers.",
    category: "Engineering",
    image: webVisual,
    alt: "Full-stack engineering workspace on a laptop.",
    lab: "React, Node & PostgreSQL Stack",
    meta: "5 modules · 15 lessons · 3 quizzes · 1 capstone",
    skills: ["React & TS", "Node & Express", "PostgreSQL"],
  },
  "generative-ai-program": {
    title: "Generative AI",
    line: "Architect grounded RAG pipelines, vector retrieval, ReAct tool agents, and adversarial LLM evaluation suites.",
    category: "AI",
    image: aiVisual,
    alt: "Generative AI system architecture and evaluation studio.",
    lab: "Grounded RAG · LLM Eval Suite",
    meta: "5 modules · 15 lessons · 3 quizzes · 1 capstone",
    skills: ["Prompt Systems", "Grounded RAG", "ReAct Agents"],
  },
  "sql-certificate": {
    title: "SQL for Business Analytics",
    line: "Write defensible multi-table SQL joins, CTEs, window functions, and category revenue audits on retail order data.",
    category: "SQL",
    image: sqlVisual,
    alt: "SQL query and analytics workspace.",
    lab: "Northwind SQL Query Workbench",
    meta: "5 SQL modules · 15 lessons · Live SQL practice",
    skills: ["Joins & CTEs", "Window Functions", "Data Hygiene"],
  },
}

const KIND_COPY: Record<Kind, { title: string; lead: string; label: string }> = {
  certification: {
    title: "Certification programmes",
    lead: "Focused single-skill syllabus tracks backed by Skylent OS labs.",
    label: "Certification",
  },
  professional: {
    title: "Professional programmes",
    lead: "Structured programmes combining interactive lessons, live sandboxes, and a graded capstone.",
    label: "Professional",
  },
}

const LEARNING_STEPS = [
  { title: "Learn", text: "Concise written lessons with concept checks." },
  { title: "Practise", text: "In-browser SQL, Python, and product case sandboxes." },
  { title: "Prove it", text: "Graded capstone and verifiable Career OS dossier." },
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
  const line = face?.line || content?.cardLine || program.desc || "Interactive lessons, sandbox labs, and graded capstone work."
  const category = face?.category || KIND_COPY[kind].label
  const image = face?.image || analyticsVisual
  const alt = face?.alt || `${title} workspace preview`
  const lab = face?.lab || "Skylent OS Interactive Workspace"
  const meta = face?.meta || "5 modules · 15 lessons · 3 quizzes · 1 capstone"
  const skills = face?.skills || ["Written Lessons", "Sandbox Lab", "Capstone"]
  return {
    program,
    truth,
    kind,
    title,
    line,
    category,
    image,
    alt,
    lab,
    meta,
    skills,
    search: `${title} ${program.name} ${line} ${category} ${lab} ${skills.join(" ")} ${outcomeFor(program.slug)}`.toLowerCase(),
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
          <img src={row.image} alt={row.alt} loading="lazy" decoding="async" />
          {showStatus ? (
            <span className={live ? "pgx-status pgx-status--open" : "pgx-status"}>
              {status}
            </span>
          ) : null}
        </span>
        <span className="pgx-card__body">
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="pgx-card__kicker">{row.category}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4338ca", background: "#eef2ff", padding: "2px 9px", borderRadius: 999 }}>
              {row.lab}
            </span>
          </span>
          <span className="pgx-card__title">{row.title}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{row.meta}</span>
          <span className="pgx-card__line">{row.line}</span>
          <span className="pgx-skill-tags">
            {row.skills.map((skill) => (
              <span key={skill} className="pgx-skill-tag">{skill}</span>
            ))}
          </span>
          <span className="pgx-card__go">
            Explore programme <ArrowRight />
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
              <p className="pgx-eyebrow">Skylent programmes</p>
              <h1 id="pgx-title">Find the right programme for your next step.</h1>
              <p className="pgx-lede">{intro}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                <span className="pgx-skill-tag">In-Browser SQL &amp; Python Workbenches</span>
                <span className="pgx-skill-tag">25% · 35% · 40% Grading Rubric</span>
                <span className="pgx-skill-tag">Verifiable Proof-of-Work Dossiers</span>
              </div>
            </div>
            <div className="pgx-intro__visual" aria-label="Skylent OS live workspace preview">
              <div className="pgx-intro__photo-wrap">
                <img
                  src={heroClassroomVisual}
                  alt="Learners collaborating on practical case studies and SQL labs"
                  width={960}
                  height={640}
                  decoding="async"
                />
                <div className="pgx-intro__hud">
                  <div className="pgx-intro__hud-top">
                    <span className="pgx-intro__hud-badge">SKYLENT OS · LIVE WORKBENCH</span>
                    <span className="pgx-intro__hud-status">6 Tracks Open</span>
                  </div>
                  <div className="pgx-intro__hud-grid">
                    <div>
                      <strong>Northwind SQL Lab</strong>
                      <span>166 validated retail order rows</span>
                    </div>
                    <div>
                      <strong>Harbor Desk Studio</strong>
                      <span>18 interviews · 6-week PRD scope</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <input id="programme-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by skill, tool, or track (e.g. SQL, Product, Python, RAG)..." />
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
                      <p className="pgx-eyebrow">All 6 Flagship Tracks</p>
                      <h2 id="pgx-professional">
                        {confirmed ? "Open now" : "Availability could not be confirmed"}
                      </h2>
                    </div>
                    <p>
                      {confirmed
                        ? "Select any programme below to open its interactive workbench, 5-module syllabus, and capstone studio."
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
              <h2 id="pgx-how-title">How learning works</h2>
              <p>Every track moves from concept reading to in-browser lab execution and a verifiable portfolio artifact.</p>
            </header>
            <ol className="pgx-steps">
              {LEARNING_STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="pgx-steps__n" aria-hidden="true">{index + 1}</span>
                  <span className="pgx-steps__title">{step.title}</span>
                  <span className="pgx-steps__text">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pgx-close" aria-labelledby="pgx-close-title">
          <div className="sky-container pgx-close__inner">
            <div>
              <h2 id="pgx-close-title">Not sure where to begin?</h2>
              <p>Take the 90-second skill check to match your current SQL, Python, or Product level to the right starting module.</p>
            </div>
            <Link className="sk-btn sk-btn-primary" to="/path">
              Find My Path
              <ArrowRight />
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
