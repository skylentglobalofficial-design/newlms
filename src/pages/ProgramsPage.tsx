/**
 * /programmes — catalogue-first index.
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
import scienceVisual from "@/assets/site/program-web.jpg"
import "./ProgramsIndex.css"

type Kind = "certification" | "professional"
type Row = {
  program: CatalogProgramSummary
  truth: ProgrammeTruth
  kind: Kind
  title: string
  line: string
  category: string
  image: string | null
  alt: string
  search: string
}

const PROFESSIONAL_ORDER = ["data-analytics-pro", "product-management", "data-science-ai", "full-stack", "generative-ai-program"] as const

const CARD_FACE: Record<string, { title: string; line: string; category: string; image: string; alt: string }> = {
  "data-analytics-pro": {
    title: "Data Analytics",
    line: "Take a messy sales extract to a finding and a recommendation someone can act on.",
    category: "Data",
    image: analyticsVisual,
    alt: "Illustrative analytics charts on a desk.",
  },
  "product-management": {
    title: "Product Management",
    line: "Frame one retail operations problem and recommend a single constrained bet.",
    category: "Product",
    image: productVisual,
    alt: "Illustrative product working session around a table.",
  },
  "data-science-ai": {
    title: "Data Science",
    line: "Python workflows, exploratory data analysis, and applied machine learning foundations.",
    category: "Data",
    image: scienceVisual,
    alt: "Illustrative code on a laptop and monitors.",
  },
  "sql-certificate": {
    title: "SQL for Business Analytics",
    line: "Focused SQL querying, joins, aggregations, and business reporting for analysts.",
    category: "SQL",
    image: "",
    alt: "",
  },
}

const KIND_COPY: Record<Kind, { title: string; lead: string; label: string }> = {
  certification: {
    title: "Certification programmes",
    lead: "Focused tracks built around one core technical or analytical skill.",
    label: "Certification",
  },
  professional: {
    title: "Professional programmes",
    lead: "Longer directions that combine lessons, practice, and a project you can keep.",
    label: "Professional",
  },
}

const LEARNING_STEPS = [
  { title: "Learn", text: "Short written lessons with checks, taken one step at a time." },
  { title: "Practise", text: "A lab or case opened from the lesson, on a realistic piece of work." },
  { title: "Keep the work", text: "Finished work can stay in your Career OS profile." },
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
  const line = face?.line || content?.cardLine || program.desc || (truth.comingLater ? "This programme is not open yet." : "A catalogue direction. A full taught pathway is not open yet.")
  const category = face?.category || KIND_COPY[kind].label
  return {
    program,
    truth,
    kind,
    title,
    line,
    category,
    image: face?.image || null,
    alt: face?.alt ?? "",
    search: `${title} ${program.name} ${line} ${category} ${outcomeFor(program.slug)}`.toLowerCase(),
  }
}

function presentedOpen(row: Row): boolean {
  return catalogueProgrammeIsOpen(row.program) && row.truth.state === "live"
}

function statusText(row: Row, confirmed: boolean): string {
  const state = publicCatalogueState(confirmed, presentedOpen(row))
  if (state === "unknown" || state === "open") return confirmed ? "Open for enrolment" : STATUS_NOT_CONFIRMED
  if (row.truth.state === "soon") return "Coming soon"
  return publicCatalogueStatus("closed")
}

function ProgrammeCard({ row, confirmed }: { row: Row; confirmed: boolean }) {
  const to = `/programmes/${row.program.slug}`
  const status = statusText(row, confirmed)
  const live = presentedOpen(row) && confirmed
  const showStatus = status !== STATUS_NOT_CONFIRMED
  const face = (
    <>
      <span className="pgx-card__media">
        {row.image ? <img src={row.image} alt={row.alt} /> : <span className="pgx-card__fallback" aria-hidden="true" />}
        {showStatus ? <span className={live ? "pgx-status pgx-status--open" : "pgx-status"}>{status}</span> : null}
      </span>
      <span className="pgx-card__body">
        <span className="pgx-card__kicker">{row.category}</span>
        <span className="pgx-card__title">{row.title}</span>
        <span className="pgx-card__line">{row.line}</span>
        <span className="pgx-card__go">
          {live ? "View programme" : "View outline"}
          <ArrowRight />
        </span>
      </span>
    </>
  )
  return (
    <li className="pgx-card">
      <Link to={to} className="pgx-card__link" data-clear-launcher>
        {face}
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

  const rows = useMemo(() => (catalog.data ?? []).map(toRow).filter((row): row is Row => row !== null), [catalog.data])
  const categories = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.category)))], [rows])
  const needle = query.trim().toLowerCase()
  const shown = rows.filter((row) => {
    if (kind !== "all" && row.kind !== kind) return false
    if (category !== "All" && row.category !== category) return false
    return !needle || row.search.includes(needle)
  })
  const confirmed = !catalog.offline
  const catalogueKnown = confirmed && !catalog.loading
  const openTitles = catalogueKnown
    ? rows.filter((row) => row.kind === "professional" && presentedOpen(row)).map((row) => row.title)
    : []
  const intro = catalog.loading ? "Checking which programmes are open." : programmesIndexIntro(catalogueKnown, openTitles)
  const professional = shown.filter((row) => row.kind === "professional").sort((a, b) => {
    const rank = (slug: string) => {
      const index = PROFESSIONAL_ORDER.indexOf(slug as (typeof PROFESSIONAL_ORDER)[number])
      return index === -1 ? PROFESSIONAL_ORDER.length : index
    }
    return rank(a.program.slug) - rank(b.program.slug)
  })
  const certification = shown.filter((row) => row.kind === "certification")
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
          <div className="sky-container pgx-intro__inner">
            <p className="pgx-eyebrow">Skylent programmes</p>
            <h1 id="pgx-title">Find the right programme for your next step.</h1>
            <p className="pgx-lede">{intro}</p>
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
              <input id="programme-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programmes" />
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
              <>
                {professional.length ? (
                  confirmed ? (
                    <>
                      {professional.filter((row) => presentedOpen(row)).length ? (
                        <section id="professional" className="pgx-section" aria-labelledby="pgx-professional">
                          <div className="sky-container">
                            <header className="pgx-section__head">
                              <h2 id="pgx-professional">Open now</h2>
                              <p>These programmes are open for enrolment and have a linked course.</p>
                            </header>
                            <ul className="pgx-grid">
                              {professional.filter((row) => presentedOpen(row)).map((row) => (
                                <ProgrammeCard key={row.program.slug} row={row} confirmed />
                              ))}
                            </ul>
                          </div>
                        </section>
                      ) : null}
                      {professional.filter((row) => !presentedOpen(row)).length ? (
                        <section id="professional-later" className="pgx-section" aria-labelledby="pgx-professional-later">
                          <div className="sky-container">
                            <header className="pgx-section__head">
                              <h2 id="pgx-professional-later">Not open yet</h2>
                              <p>These listings can be read. New enrolment is not available.</p>
                            </header>
                            <ul className="pgx-grid">
                              {professional.filter((row) => !presentedOpen(row)).map((row) => (
                                <ProgrammeCard key={row.program.slug} row={row} confirmed />
                              ))}
                            </ul>
                          </div>
                        </section>
                      ) : null}
                    </>
                  ) : (
                    <section id="professional" className="pgx-section" aria-labelledby="pgx-professional">
                      <div className="sky-container">
                        <header className="pgx-section__head">
                          <h2 id="pgx-professional">Availability could not be confirmed</h2>
                          <p>{AVAILABILITY_UNKNOWN}</p>
                        </header>
                        <ul className="pgx-grid">
                          {professional.map((row) => (
                            <ProgrammeCard key={row.program.slug} row={row} confirmed={false} />
                          ))}
                        </ul>
                      </div>
                    </section>
                  )
                ) : null}
                {certification.length ? (
                  <section id="certification" className="pgx-section" aria-labelledby="pgx-certification">
                    <div className="sky-container">
                      <header className="pgx-section__head">
                        <h2 id="pgx-certification">{KIND_COPY.certification.title}</h2>
                        <p>{KIND_COPY.certification.lead}</p>
                      </header>
                      <ul className="pgx-grid">
                        {certification.map((row) => (
                          <ProgrammeCard key={row.program.slug} row={row} confirmed={!catalog.offline} />
                        ))}
                      </ul>
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </div>
        )}

        <section className="pgx-how" aria-labelledby="pgx-how-title">
          <div className="sky-container">
            <header className="pgx-section__head">
              <h2 id="pgx-how-title">How learning works</h2>
              <p>Where a programme is open, study moves from a lesson to practice, and the finished work can stay with you.</p>
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
              <h2 id="pgx-close-title">Not sure where to start?</h2>
              <p>Explore the available learning directions and discover what fits your goals.</p>
            </div>
            <button type="button" className="sk-btn sk-btn-primary" onClick={() => document.getElementById("programme-search")?.focus()}>
              Search programmes
              <ArrowRight />
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
