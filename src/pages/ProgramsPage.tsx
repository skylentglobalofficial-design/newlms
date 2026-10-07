/**
 * Programme catalogue. Every entry is a row returned by GET /catalog/programs;
 * nothing is listed here that the API did not return, and search and filters
 * only cover those rows. Authored copy is an overlay on a row, never a row.
 *
 * The first live programme in the current result is shown as a large feature on
 * the navy stage with its real course artefact; the others are ruled rows.
 */
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight, TruthChip, type TruthState } from "../components/skylent/primitives"
import { Reveal } from "../components/skylent/Reveal"
import { HarborDeskPlate, NorthwindLabPlate, ProgrammeThumb, programmeThumbInfo } from "../components/programme/ProgrammeArtefacts"
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

function rowFacts(row: Row): Array<{ label: string; value: string }> {
  const { program, truth } = row
  const live = truth.state === "live"
  const content = live ? authoredProgrammeContent(program.slug) : null
  return [
    { label: "Format", value: program.format },
    { label: "Level", value: live ? "" : program.level },
    { label: "Modules", value: !live && program.moduleCount > 0 ? String(program.moduleCount) : "" },
    { label: "Capstone", value: content?.capstoneTitle ?? "" },
  ].filter((fact) => fact.value)
}

/** The first live programme in the current result: its real course artefact, large, on the navy stage. */
function ProgrammeFeature({ row }: { row: Row }) {
  const { program, truth, title, line } = row
  const thumb = programmeThumbInfo(program.slug)
  const discovery = programmeDiscoveryFor(program.slug)
  const content = authoredProgrammeContent(program.slug)
  const facts = rowFacts(row)
  const to = `/programmes/${program.slug}`

  return (
    <li className="pg-card pg-feature sky-stage sky-band-navy">
      <div className="sky-container pg-feature__inner">
        <Reveal className="pg-feature__copy">
          <p className="pg-card__chips">
            <TruthChip state={truth.state as TruthState} />
            <span className="sky-label">Start here</span>
          </p>
          <h2 className="sky-display sky-display--md pg-feature__title">
            <Link to={to}>{title}</Link>
          </h2>
          {title !== program.name ? <p className="pg-card__aka">Listed as {program.name}</p> : null}
          {line ? <p className="pg-feature__line">{line}</p> : null}
          <dl className="pg-feature__spec">
            {discovery ? (
              <div>
                <dt>Taught today</dt>
                <dd>
                  {plural(discovery.taughtModules, "module")} · {plural(discovery.taughtLessons, "lesson")} ·{" "}
                  {plural(discovery.taughtAssignments, "assignment")}
                </dd>
              </div>
            ) : null}
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="pg-feature__foot">
            <Link className="sk-btn sk-btn-primary" to={to} aria-label={`View programme: ${title}`}>
              View programme
              <ArrowRight />
            </Link>
            {!truth.enrollable ? <span className="pg-card__closed">Enrolment not open</span> : null}
          </p>
        </Reveal>

        <Reveal as="figure" variant="plate" className="pg-feature__figure">
          <div className="sky-stage__plate pg-feature__plate">
            {content?.artefact === "northwind" ? (
              <NorthwindLabPlate />
            ) : content?.artefact === "harbor-desk" ? (
              <HarborDeskPlate />
            ) : (
              <ProgrammeThumb program={program} />
            )}
          </div>
          <figcaption className="sky-stage__caption">
            <span>FIG. 01 · {content ? content.hero.figure : thumb.caption}</span>
            <span>{content ? content.hero.figureNote : thumb.illustrative ? "Illustrative. Not course material." : ""}</span>
          </figcaption>
        </Reveal>
      </div>
    </li>
  )
}

/** Every other programme: one ruled row, with its artefact as a small figure. */
function ProgrammeRow({ row }: { row: Row }) {
  const { program, truth, title, line } = row
  const thumb = programmeThumbInfo(program.slug)
  const live = truth.state === "live"
  const discovery = live ? programmeDiscoveryFor(program.slug) : null
  const facts = rowFacts(row)
  const to = `/programmes/${program.slug}`

  return (
    <li className={`pg-card pg-row${thumb.illustrative ? " pg-row--illustrative" : ""}`}>
      <div className="pg-row__art">
        <ProgrammeThumb program={program} />
      </div>
      <div className="pg-row__main">
        <p className="pg-card__chips">
          <TruthChip state={truth.state as TruthState} />
          {thumb.illustrative ? (
            <span className="pg-row__figchip">
              <TruthChip state="illustrative" label="Illustrative figure" />
            </span>
          ) : null}
        </p>
        <h2 className="pg-card__title">
          <Link to={to}>{title}</Link>
        </h2>
        {title !== program.name ? <p className="pg-card__aka">Listed as {program.name}</p> : null}
        {line ? <p className="pg-card__line">{line}</p> : null}
        {discovery ? (
          <p className="pg-card__counts">
            {plural(discovery.taughtModules, "module")} · {plural(discovery.taughtLessons, "lesson")} ·{" "}
            {plural(discovery.taughtAssignments, "assignment")}
          </p>
        ) : null}
      </div>
      <div className="pg-row__side">
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
          <Link className="sk-link" to={to} aria-label={`View programme: ${title}`}>
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
  /* Rows are sorted live first, so the feature is simply the first row when that row is live. */
  const feature = shown.length > 0 && shown[0].truth.state === "live" ? shown[0] : null
  const rest = feature ? shown.slice(1) : shown

  return (
    <PageShell aurora={false}>
      <div className="site-light">
        <div className="pg-page">
          <section className="sky-container pg-hero" aria-labelledby="pg-title">
            <p className="sky-label">Programmes</p>
            <h1 id="pg-title" className="sky-display sky-display--lg pg-h1">
              Choose a programme by <em>the work it produces.</em>
            </h1>
            <div className="pg-hero__row">
              <p className="pg-lede">
                Every programme below is a row in the Skylent catalogue. Live means a written course sits behind it and
                you can enrol today. The others are listed as they are: in development or coming soon.
              </p>
              {ready && rows.length > 0 ? (
                <dl className="pg-count" aria-label={`${plural(rows.length, "programme")} listed, ${liveCount} live`}>
                  <div>
                    <dt className="sky-label">Listed</dt>
                    <dd>{rows.length}</dd>
                  </div>
                  <div>
                    <dt className="sky-label">Live</dt>
                    <dd>{liveCount}</dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </section>

          <section className="pg-list" aria-label="Programme catalogue">
            {catalog.loading ? (
              <div className="sky-container">
                <ul className="pg-rows" aria-busy="true" aria-label="Loading programmes">
                  {[0, 1, 2].map((item) => (
                    <li className="pg-card pg-row pg-card--skeleton" key={item} aria-hidden="true">
                      <div className="pg-row__art" />
                      <div className="pg-row__main">
                        <span className="sky-skeleton" style={{ width: 84 }} />
                        <span className="sky-skeleton" style={{ width: "70%", height: 20 }} />
                        <span className="sky-skeleton" style={{ width: "94%" }} />
                        <span className="sky-skeleton" style={{ width: "58%" }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : catalog.error ? (
              <div className="sky-container">
                <div className="pg-state" role="alert">
                  <p className="sky-error">The programme catalogue could not be loaded.</p>
                  <p>The request failed. That is not the same as an empty catalogue.</p>
                  <button type="button" className="sk-btn sk-btn-secondary" onClick={() => void catalog.reload()}>
                    Try again
                  </button>
                </div>
              </div>
            ) : rows.length === 0 ? (
              <div className="sky-container">
                <p className="sky-empty">
                  <strong>No programmes are published yet.</strong>
                  When a programme is added to the catalogue it will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="sky-container">
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
                </div>
                {shown.length === 0 ? (
                  <div className="sky-container">
                    <div className="pg-state">
                      <p>No programme in the catalogue matches that.</p>
                      <button type="button" className="sk-btn sk-btn-secondary" onClick={() => { setQuery(""); setState("all") }}>
                        Clear search and filter
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="pg-results">
                    {feature ? <ProgrammeFeature key={feature.program.slug} row={feature} /> : null}
                    {rest.length > 0 ? (
                      <li className="pg-results__rest">
                        <div className="sky-container">
                          {feature ? (
                            <p className="sky-label pg-rows__label">
                              {rest.length === 1 ? "One more programme" : `${rest.length} more programmes`}
                            </p>
                          ) : null}
                          <ul className={feature ? "pg-rows" : "pg-rows pg-rows--first"}>
                            {rest.map((row) => (
                              <ProgrammeRow key={row.program.slug} row={row} />
                            ))}
                          </ul>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="sky-stage sky-band-navy pg-next" aria-labelledby="pg-next-title">
            <Reveal className="sky-container pg-next__inner">
              <div>
                <p className="sky-label">Next step</p>
                <h2 id="pg-next-title" className="sky-display sky-display--lg pg-h2">
                  Not sure which one fits? <em>Answer a few questions first.</em>
                </h2>
              </div>
              <Link className="sk-btn sk-btn-primary" to="/path">
                Find my path
                <ArrowRight />
              </Link>
            </Reveal>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
