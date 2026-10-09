/**
 * /programmes — the programme catalogue, split the way learners choose: certification
 * programmes (one focused skill) and professional programmes (longer, with projects and a
 * capstone). Rows come from GET /catalog/programs; if the API cannot be reached, the published
 * list the API is seeded from is shown instead (useCatalogPrograms), so the page never turns
 * into an error screen. Programmes open for enrolment are drawn large with their real course
 * artefact (the lab or case the learner works on); the rest say plainly that they open later.
 */
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import { HarborDeskPlate, NorthwindLabPlate, ProgrammeThumb } from "../components/programme/ProgrammeArtefacts"
import { authoredProgrammeContent } from "../components/programme/programme-content"
import { plural, programmeTruth, type ProgrammeTruth } from "../components/programme/programme-truth"
import { openSkylentAi } from "../components/skylent/ai-events"
import { programs as publishedProgrammes } from "../data"
import { useCatalogPrograms } from "../hooks/useCatalog"
import type { CatalogProgramSummary } from "../lib/catalog-api"
import { programmeDiscoveryFor } from "../lib/programme-discovery"
import "./ProgramsIndex.css"

type Kind = "certification" | "professional"
type Row = { program: CatalogProgramSummary; truth: ProgrammeTruth; kind: Kind; title: string; line: string; search: string }

const KIND_COPY: Record<Kind, { title: string; lead: string; label: string }> = {
  certification: {
    title: "Certification programmes",
    lead: "Short, focused programmes on one skill, finished with a certificate when every lesson is complete.",
    label: "Certification",
  },
  professional: {
    title: "Professional programmes",
    lead: "Longer programmes that combine lessons, hands-on labs and a capstone project you keep in Career OS.",
    label: "Professional",
  },
}

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
  const kind = kindOf(program)
  if (!kind) return null
  const truth = programmeTruth(program)
  const content = truth.state === "live" ? authoredProgrammeContent(program.slug) : null
  const discovery = content ? programmeDiscoveryFor(program.slug) : null
  const title = discovery?.courseTitle || program.name
  const outcome = outcomeFor(program.slug)
  const line = content?.cardLine || (outcome ? `For learners heading towards ${outcome} roles.` : "")
  return {
    program,
    truth,
    kind,
    title,
    line,
    search: `${title} ${program.name} ${line} ${program.level} ${program.format} ${outcome}`.toLowerCase(),
  }
}

function OpenProgramme({ row }: { row: Row }) {
  const { program, title, line } = row
  const content = authoredProgrammeContent(program.slug)
  const discovery = programmeDiscoveryFor(program.slug)
  const to = `/programmes/${program.slug}`
  const includes = [
    discovery ? plural(discovery.taughtLessons, "lesson") : "",
    content?.artefact === "northwind" ? "SQL lab on a sales extract" : content?.artefact === "harbor-desk" ? "Product case workbench" : "Hands-on lab",
    content?.capstoneTitle ? `Capstone: ${content.capstoneTitle}` : "Capstone project",
    "Career OS profile",
  ].filter(Boolean)
  return (
    <li className="pgx-open">
      <div className="pgx-open__body">
        <div className="pgx-open__top">
          <span className="pgx-badge pgx-badge--open">Open for enrolment</span>
          <span className="pgx-kind">{KIND_COPY[row.kind].label}</span>
        </div>
        <h3 className="pgx-open__title">
          <Link to={to}>{title}</Link>
        </h3>
        {line ? <p className="pgx-open__line">{line}</p> : null}
        <ul className="pgx-includes" aria-label="What the programme includes">
          {includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <dl className="pgx-facts">
          {[
            ["Format", program.format],
            ["Level", program.level],
            ["Duration", program.duration],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        <div className="pgx-open__actions">
          <Link className="sk-btn sk-btn-primary" to={to}>
            View programme<span className="pgx-sr">: {title}</span>
            <ArrowRight />
          </Link>
          <Link className="pgx-link" to={`${to}#pp-curriculum`}>
            Curriculum<span className="pgx-sr"> for {title}</span>
          </Link>
        </div>
      </div>
      <div className="pgx-open__art" aria-hidden="true">
        <div className="pgx-open__plate">{content?.artefact === "harbor-desk" ? <HarborDeskPlate /> : content?.artefact === "northwind" ? <NorthwindLabPlate /> : <ProgrammeThumb program={program} />}</div>
      </div>
    </li>
  )
}

function LaterProgramme({ row }: { row: Row }) {
  const { program, title, line } = row
  const to = `/programmes/${program.slug}`
  return (
    <li className="pgx-card">
      <div className="pgx-card__art" aria-hidden="true">
        <ProgrammeThumb program={program} />
      </div>
      <div className="pgx-card__body">
        <div className="pgx-card__top">
          <span className="pgx-badge">Opening soon</span>
          <span className="pgx-kind">{KIND_COPY[row.kind].label}</span>
        </div>
        <h3 className="pgx-card__title">
          <Link to={to}>{title}</Link>
        </h3>
        {line ? <p className="pgx-card__line">{line}</p> : null}
        <p className="pgx-card__meta">{[program.duration, program.level].filter(Boolean).join(" · ")}</p>
        <Link className="pgx-link" to={to}>
          View details<span className="pgx-sr">: {title}</span>
          <ArrowRight />
        </Link>
      </div>
    </li>
  )
}

function KindSection({ kind, rows }: { kind: Kind; rows: Row[] }) {
  if (rows.length === 0) return null
  const open = rows.filter((row) => row.truth.state === "live")
  const later = rows.filter((row) => row.truth.state !== "live")
  const copy = KIND_COPY[kind]
  return (
    <section id={kind} className="pgx-section" aria-labelledby={`pgx-${kind}`}>
      <div className="sky-container">
        <header className="pgx-section__head">
          <h2 id={`pgx-${kind}`}>{copy.title}</h2>
          <p>{copy.lead}</p>
        </header>
        {open.length ? (
          <ul className="pgx-open-list">
            {open.map((row) => (
              <OpenProgramme key={row.program.slug} row={row} />
            ))}
          </ul>
        ) : null}
        {later.length ? (
          <>
            {open.length ? <p className="pgx-later-label">Opening soon</p> : null}
            <ul className="pgx-grid">
              {later.map((row) => (
                <LaterProgramme key={row.program.slug} row={row} />
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<"all" | Kind>("all")

  const rows = useMemo(() => (catalog.data ?? []).map(toRow).filter((row): row is Row => row !== null), [catalog.data])
  const needle = query.trim().toLowerCase()
  const shown = rows.filter((row) => (kind === "all" || row.kind === kind) && (!needle || row.search.includes(needle)))
  const byKind = (k: Kind) => shown.filter((row) => row.kind === k).sort((a, b) => Number(b.truth.state === "live") - Number(a.truth.state === "live"))

  return (
    <PageShell aurora={false}>
      <div className="site-light pgx">
        <section className="pgx-hero" aria-labelledby="pgx-title">
          <div className="sky-container pgx-hero__inner">
            <div>
              <p className="pgx-eyebrow">Programmes</p>
              <h1 id="pgx-title" className="pgx-h1">
                Learn a skill. <em>Build the proof.</em>
              </h1>
              <p className="pgx-lede">Every programme pairs lessons with hands-on labs and a project you keep in your Career OS profile.</p>
            </div>
            <div className="pgx-hero__tools">
              <label className="pgx-search">
                <span className="pgx-sr">Search programmes</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.5" y2="16.5" />
                </svg>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by skill, role or level" />
              </label>
              <div className="pgx-tabs" role="group" aria-label="Programme type">
                {(["all", "certification", "professional"] as const).map((item) => (
                  <button key={item} type="button" aria-pressed={kind === item} className={kind === item ? "is-on" : undefined} onClick={() => setKind(item)}>
                    {item === "all" ? "All" : KIND_COPY[item].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {catalog.loading ? (
          <div className="sky-container pgx-loading" aria-busy="true" aria-label="Loading programmes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pgx-skel" aria-hidden="true">
                <span className="sky-skeleton" style={{ width: 96 }} />
                <span className="sky-skeleton" style={{ width: "60%", height: 22 }} />
                <span className="sky-skeleton" style={{ width: "90%" }} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="sky-container pgx-empty">
            <p className="pgx-empty__title">No programmes are published yet.</p>
            <p>New programmes appear here as soon as they are added to the catalogue.</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="sky-container pgx-empty">
            <p className="pgx-empty__title">No programme matches that search.</p>
            <button type="button" className="sk-btn sk-btn-secondary" onClick={() => { setQuery(""); setKind("all") }}>
              Clear search
            </button>
          </div>
        ) : (
          <>
            {catalog.offline ? (
              <div className="sky-container">
                <p className="pgx-offline" role="status">
                  Enrolment is briefly unavailable. You can browse programmes now;{" "}
                  <button type="button" onClick={() => void catalog.reload()}>try again</button> in a moment to enrol.
                </p>
              </div>
            ) : null}
            <KindSection kind="professional" rows={byKind("professional")} />
            <KindSection kind="certification" rows={byKind("certification")} />
          </>
        )}

        <section className="pgx-help" aria-labelledby="pgx-help-title">
          <div className="sky-container pgx-help__inner">
            <div>
              <h2 id="pgx-help-title">Not sure which programme fits?</h2>
              <p>Tell Skylent AI what you want to do next and it suggests programmes from this catalogue.</p>
            </div>
            <div className="pgx-help__actions">
              <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
                Ask Skylent AI
                <ArrowRight />
              </button>
              <Link className="sk-btn sk-btn-secondary pgx-help__secondary" to="/contact">
                Talk to the team
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
