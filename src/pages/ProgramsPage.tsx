import { useEffect } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import ProgramsHero from "../components/programs/ProgramsHero"
import ProgramsStory from "../components/programs/ProgramsStory"
import { useCatalogPrograms } from "../hooks/useCatalog"
import { isAuthoredCourse } from "../lib/authored-courses"
import { courseBySlug } from "../lib/catalog-maturity"
import type { CatalogProgramSummary } from "../lib/catalog-api"
import { partitionCatalogPrograms, programmeBuildLine } from "../lib/programme-catalogue"
import type { LaterProgrammeRow } from "../lib/programme-catalogue"
import { hasAuthoredProgrammePath, type ProgrammeDiscoveryCard } from "../lib/programme-discovery"
import "./ProgramsPage.css"

function courseFor(program: CatalogProgramSummary) {
  const slug = program.linkedCourseSlugs.find((row) => isAuthoredCourse(row))
  return slug ? courseBySlug(slug) : undefined
}

function LiveRow({ row, program }: { row: ProgrammeDiscoveryCard; program: CatalogProgramSummary }) {
  const course = courseFor(program)
  const leadsTo = course?.outcomes ?? []
  const build = programmeBuildLine(row)
  const title = row.courseTitle || row.title
  const format = program.format || course?.mode || row.format
  const level = program.level || course?.level || row.level

  return (
    <article className="pg-row is-live">
      <div className="pg-row-main">
        <header className="pg-row-head">
          <p className="pg-row-kicker">Ready to start</p>
          <h3>
            <Link to={row.href}>{title}</Link>
          </h3>
          <p className="pg-row-decision">{row.decisionLine}</p>
          <p className="pg-row-shape">
            {row.taughtModules} modules · {row.taughtLessons} lessons · {format} · {level}
          </p>
        </header>

        <p className="pg-row-note">{row.honesty}</p>

        <p className="pg-row-cta">
          <Link to={row.href}>
            Explore programme
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>

      <dl className="pg-row-facts">
        <div>
          <dt>What it is</dt>
          <dd>{course?.desc ?? program.desc ?? row.decisionLine}</dd>
        </div>
        <div>
          <dt>What it leads to</dt>
          <dd>
            {leadsTo.length ? (
              <ul>
                {leadsTo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              level
            )}
          </dd>
        </div>
        <div>
          <dt>What you will build</dt>
          <dd>{build}</dd>
        </div>
        <div>
          <dt>Learning shape</dt>
          <dd>
            <ol>
              {row.modules.map((module) => (
                <li key={module.id}>{module.title}</li>
              ))}
            </ol>
          </dd>
        </div>
      </dl>
    </article>
  )
}

function LaterRow({ row, index }: { row: LaterProgrammeRow; index: number }) {
  return (
    <article className="pg-row is-later">
      <header className="pg-row-head">
        <p className="pg-row-kicker">
          <span className="pg-row-index">{String(index + 1).padStart(2, "0")}</span>
          {row.statusLabel}
        </p>
        <h3>
          <Link to={row.href}>{row.title}</Link>
        </h3>
      </header>
      <div className="pg-row-later-body">
        <p className="pg-row-decision">{row.summary}</p>
        <p className="pg-row-note">{row.honesty}</p>
        <p className="pg-row-cta">
          <Link to={row.href}>
            Explore programme
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </article>
  )
}

export default function ProgramsPage() {
  const catalog = useCatalogPrograms()
  const rows = !catalog.loading && !catalog.error ? (catalog.data ?? []) : []
  const { live, later } = partitionCatalogPrograms(rows)
  const liveBySlug = new Map(rows.filter((row) => hasAuthoredProgrammePath(row.slug)).map((row) => [row.slug, row]))

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollPaddingTop
    root.style.scrollPaddingTop = "calc(var(--nav-h) + 20px)"
    return () => {
      root.style.scrollPaddingTop = previous
    }
  }, [])

  return (
    <PageShell aurora={false}>
      <div className="pg-page">
        <div className="pg-pillar-bar cat-rail">
          <LearnPillarSubnav current="programs" />
        </div>
        <ProgramsHero live={live} catalogReady={!catalog.loading && !catalog.error} />
        <ProgramsStory live={live} />

        <div className="pg-cat">
          {catalog.loading ? (
            <section className="pg-cat-live" id="pg-catalogue" aria-labelledby="pg-cat-live-title">
              <div className="cat-rail">
                <p className="pg-cat-label">Catalogue</p>
                <h2 id="pg-cat-live-title">Loading programmes</h2>
                <p className="pg-cat-status">Loading the current catalogue…</p>
              </div>
            </section>
          ) : catalog.error ? (
            <section className="pg-cat-live" id="pg-catalogue" aria-labelledby="pg-cat-live-title">
              <div className="cat-rail">
                <p className="pg-cat-label">Catalogue</p>
                <h2 id="pg-cat-live-title">The programme catalogue could not be loaded</h2>
                <p className="pg-cat-status">
                  The catalogue request failed. This is not an empty catalogue.
                </p>
                <p className="pg-row-cta">
                  <button type="button" onClick={() => { void catalog.reload() }}>
                    Try again
                  </button>
                </p>
              </div>
            </section>
          ) : rows.length === 0 ? (
            <section className="pg-cat-live" id="pg-catalogue" aria-labelledby="pg-cat-live-title">
              <div className="cat-rail">
                <p className="pg-cat-label">Catalogue</p>
                <h2 id="pg-cat-live-title">The programme catalogue is empty</h2>
                <p className="pg-cat-status">No programmes are listed in the catalogue right now.</p>
              </div>
            </section>
          ) : (
            <>
              {live.length > 0 ? (
                <section className="pg-cat-live" id="pg-catalogue" aria-labelledby="pg-cat-live-title">
                  <div className="cat-rail">
                    <p className="pg-cat-label">Authored / Ready to start</p>
                    <h2 id="pg-cat-live-title">Authored programmes</h2>
                    <p className="pg-cat-intro">
                      Each row is built from the linked course, not from brochure length. Open a programme for the full
                      taught path and enrolment.
                    </p>
                    <div className="pg-cat-list">
                      {live.map((row) => {
                        const program = liveBySlug.get(row.slug)
                        return program ? <LiveRow key={row.slug} row={row} program={program} /> : null
                      })}
                    </div>
                  </div>
                </section>
              ) : null}

              {later.length > 0 ? (
                <section
                  className="pg-cat-later"
                  id={live.length > 0 ? undefined : "pg-catalogue"}
                  aria-labelledby="pg-cat-later-title"
                >
                  <div className="cat-rail">
                    <p className="pg-cat-label">Coming later</p>
                    <h2 id="pg-cat-later-title">Listed, not yet taught</h2>
                    <p className="pg-cat-intro">
                      Listings without a finished authored programme. You can still open the page.
                    </p>
                    <div className="pg-cat-list">
                      {later.map((row, index) => (
                        <LaterRow key={row.slug} row={row} index={index} />
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}
