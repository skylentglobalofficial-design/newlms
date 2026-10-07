/**
 * Programme catalogue. Every card is a row returned by GET /catalog/programs;
 * nothing is listed here that the API did not return, and search and filters
 * only cover those rows. Authored copy is an overlay on a row, never a row.
 */
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight, TruthChip, type TruthState } from "../components/skylent/primitives"
import { ProgrammeThumb, programmeThumbInfo } from "../components/programme/ProgrammeArtefacts"
import { authoredProgrammeContent } from "../components/programme/programme-content"
import { plural, programmeTruth, type ProgrammeTruth } from "../components/programme/programme-truth"
import { useCatalogPrograms } from "../hooks/useCatalog"
import type { CatalogProgramSummary } from "../lib/catalog-api"
import { isPublicProgrammeIndexRow } from "../lib/programme-catalogue"
import { programmeDiscoveryFor } from "../lib/programme-discovery"
import "./ProgramsPage.css"

type Row = { program: CatalogProgramSummary; truth: ProgrammeTruth; title: string; line: string; search: string }

const STATE_ORDER: Array<Row["truth"]["state"]> = ["live", "development", "soon"]
const STATE_LABEL: Record<Row["truth"]["state"], string> = { live: "Live", development: "In development", soon: "Coming soon" }

function toRow(program: CatalogProgramSummary): Row {
  const truth = programmeTruth(program)
  const content = truth.state === "live" ? authoredProgrammeContent(program.slug) : null
  const discovery = content ? programmeDiscoveryFor(program.slug) : null
  const title = discovery?.courseTitle || program.name
  const line = content?.cardLine || program.desc
  const linkedTitles = truth.linked.map((item) => item.title).join(" ")
  return {
    program,
    truth,
    title,
    line,
    search: `${title} ${program.name} ${line} ${program.desc} ${program.level} ${program.format} ${linkedTitles} ${content?.capstoneTitle ?? ""}`.toLowerCase(),
  }
}

function ProgrammeCard({ row }: { row: Row }) {
  const { program, truth, title, line } = row
  const thumb = programmeThumbInfo(program.slug)
  const live = truth.state === "live"
  const discovery = live ? programmeDiscoveryFor(program.slug) : null
  const content = live ? authoredProgrammeContent(program.slug) : null
  const facts: Array<{ label: string; value: string }> = [
    { label: "Format", value: program.format },
    { label: "Level", value: live ? "" : program.level },
    { label: "Modules", value: !live && program.moduleCount > 0 ? String(program.moduleCount) : "" },
    { label: "Capstone", value: content?.capstoneTitle ?? "" },
  ].filter((fact) => fact.value)

  return (
    <li className="pg-card">
      <div className="pg-card__art">
        <ProgrammeThumb program={program} />
      </div>
      <div className="pg-card__body">
        <p className="pg-card__chips">
          <TruthChip state={truth.state as TruthState} />
          {thumb.illustrative ? <TruthChip state="illustrative" /> : null}
        </p>
        <h2 className="pg-card__title">
          <Link to={`/programmes/${program.slug}`}>{title}</Link>
        </h2>
        {title !== program.name ? <p className="pg-card__aka">Listed as {program.name}</p> : null}
        {line ? <p className="pg-card__line">{line}</p> : null}
        {discovery ? (
          <p className="pg-card__counts">
            {plural(discovery.taughtModules, "module")} · {plural(discovery.taughtLessons, "lesson")} ·{" "}
            {plural(discovery.taughtAssignments, "assignment")}
          </p>
        ) : null}
        {facts.length > 0 ? (
          <dl className="pg-card__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="pg-card__foot">
          <Link className="sk-link" to={`/programmes/${program.slug}`} aria-label={`View programme: ${title}`}>
            View programme
            <ArrowRight />
          </Link>
          {!truth.enrollable ? <span className="pg-card__closed">Enrolment not open</span> : null}
        </p>
      </div>
    </li>
  )
}

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const [query, setQuery] = useState("")
  const [state, setState] = useState<"all" | Row["truth"]["state"]>("all")

  const rows = useMemo(() => {
    const list = (catalog.data ?? []).filter(isPublicProgrammeIndexRow).map(toRow)
    return list.sort((a, b) => STATE_ORDER.indexOf(a.truth.state) - STATE_ORDER.indexOf(b.truth.state))
  }, [catalog.data])

  const states = STATE_ORDER.filter((item) => rows.some((row) => row.truth.state === item))
  const needle = query.trim().toLowerCase()
  const shown = rows.filter((row) => (state === "all" || row.truth.state === state) && (!needle || row.search.includes(needle)))
  const liveCount = rows.filter((row) => row.truth.state === "live").length
  const ready = !catalog.loading && !catalog.error

  return (
    <PageShell aurora={false}>
      <div className="site-light">
        <div className="pg-page">
          <section className="sky-container pg-hero" aria-labelledby="pg-title">
            <p className="sky-label">Programmes</p>
            <h1 id="pg-title" className="pg-h1">
              Choose a programme by the work it produces.
            </h1>
            <p className="pg-lede">
              Every programme below is a row in the Skylent catalogue. Live means a written course sits behind it and
              you can enrol today. The others are listed as they are: in development or coming soon.
            </p>
            {ready && rows.length > 0 ? (
              <p className="pg-count">
                {plural(rows.length, "programme")} listed · {liveCount} live
              </p>
            ) : null}
          </section>

          <section className="sky-container pg-list" aria-label="Programme catalogue">
            {catalog.loading ? (
              <ul className="pg-grid" aria-busy="true" aria-label="Loading programmes">
                {[0, 1, 2].map((item) => (
                  <li className="pg-card pg-card--skeleton" key={item} aria-hidden="true">
                    <div className="pg-card__art" />
                    <div className="pg-card__body">
                      <span className="sky-skeleton" style={{ width: 84 }} />
                      <span className="sky-skeleton" style={{ width: "70%", height: 20 }} />
                      <span className="sky-skeleton" style={{ width: "94%" }} />
                      <span className="sky-skeleton" style={{ width: "58%" }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : catalog.error ? (
              <div className="pg-state" role="alert">
                <p className="sky-error">The programme catalogue could not be loaded.</p>
                <p>The request failed. That is not the same as an empty catalogue.</p>
                <button type="button" className="sk-btn sk-btn-secondary" onClick={() => void catalog.reload()}>
                  Try again
                </button>
              </div>
            ) : rows.length === 0 ? (
              <p className="sky-empty">
                <strong>No programmes are published yet.</strong>
                When a programme is added to the catalogue it will appear here.
              </p>
            ) : (
              <>
                <div className="pg-tools">
                  <label className="pg-search">
                    <span className="sky-label">Search programmes</span>
                    <input
                      className="sk-input"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Title, level or format"
                    />
                  </label>
                  {states.length > 1 ? (
                    <div className="pg-filters" role="group" aria-label="Filter by status">
                      {(["all", ...states] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={state === item ? "pg-filter is-on" : "pg-filter"}
                          aria-pressed={state === item}
                          onClick={() => setState(item)}
                        >
                          {item === "all" ? "All" : STATE_LABEL[item]}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {shown.length === 0 ? (
                  <div className="pg-state">
                    <p>No programme in the catalogue matches that.</p>
                    <button type="button" className="sk-btn sk-btn-secondary" onClick={() => { setQuery(""); setState("all") }}>
                      Clear search and filter
                    </button>
                  </div>
                ) : (
                  <ul className="pg-grid">
                    {shown.map((row) => (
                      <ProgrammeCard key={row.program.slug} row={row} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="sky-band-navy pg-next" aria-labelledby="pg-next-title">
            <div className="sky-container pg-next__inner">
              <div>
                <p className="sky-label">Next step</p>
                <h2 id="pg-next-title" className="pg-h2">
                  Not sure which one fits? Answer a few questions first.
                </h2>
              </div>
              <Link className="sk-btn sk-btn-primary" to="/path">
                Find my path
                <ArrowRight />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
