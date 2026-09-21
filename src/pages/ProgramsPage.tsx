import { useEffect } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import ProgramsHero from "../components/programs/ProgramsHero"
import ProgramsStory from "../components/programs/ProgramsStory"
import { courses } from "../data"
import { isAuthoredCourse } from "../lib/authored-courses"
import { linkedCourseSlugsForProgram } from "../lib/catalog-maturity"
import { laterProgrammeCatalogue, liveProgrammeCatalogue, programmeBuildLine } from "../lib/programme-catalogue"
import type { LaterProgrammeRow } from "../lib/programme-catalogue"
import type { ProgrammeDiscoveryCard } from "../lib/programme-discovery"
import "./ProgramsPage.css"

function courseFor(programSlug: string) {
  const slug = linkedCourseSlugsForProgram(programSlug).find((row) => isAuthoredCourse(row))
  return slug ? courses.find((course) => course.slug === slug) : undefined
}

function LiveRow({ row }: { row: ProgrammeDiscoveryCard }) {
  const course = courseFor(row.slug)
  const leadsTo = course?.outcomes ?? []
  const build = programmeBuildLine(row)
  const title = row.courseTitle || row.title
  const format = course?.mode ?? row.format
  const level = course?.level ?? row.level

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
          <dd>{course?.desc ?? row.decisionLine}</dd>
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
              row.level
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
  const live = liveProgrammeCatalogue()
  const later = laterProgrammeCatalogue()
  const catalogue = later.filter((row) => row.statusLabel !== "Coming later")
  const planned = later.filter((row) => row.statusLabel === "Coming later")

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
        <ProgramsHero />
        <ProgramsStory live={live} />

        <div className="pg-cat">
          <section className="pg-cat-live" id="pg-catalogue" aria-labelledby="pg-cat-live-title">
            <div className="cat-rail">
              <p className="pg-cat-label">Available now</p>
              <h2 id="pg-cat-live-title">Ready to start</h2>
              <p className="pg-cat-intro">
                Enrolment opens the linked authored course in Skylent OS. Open a programme for the taught path.
              </p>
              <div className="pg-cat-list">
                {live.map((row) => (
                  <LiveRow key={row.slug} row={row} />
                ))}
              </div>
            </div>
          </section>

          {catalogue.length > 0 ? (
          <section className="pg-cat-later" aria-labelledby="pg-cat-catalogue-title">
            <div className="cat-rail">
              <p className="pg-cat-label">Catalogue</p>
              <h2 id="pg-cat-catalogue-title">Listed, thinner teaching</h2>
              <p className="pg-cat-intro">
                These programmes exist in the catalogue. Teaching is not as complete as Data Analytics or Product
                Management. Open the page to see what enrolment actually opens.
              </p>
              <div className="pg-cat-list">
                {catalogue.map((row, index) => (
                  <LaterRow key={row.slug} row={row} index={index} />
                ))}
              </div>
            </div>
          </section>
          ) : null}

          {planned.length > 0 ? (
          <section className="pg-cat-later" aria-labelledby="pg-cat-later-title">
            <div className="cat-rail">
              <p className="pg-cat-label">Planned</p>
              <h2 id="pg-cat-later-title">Coming later</h2>
              <p className="pg-cat-intro">
                These programmes are not open. You can read the listing; enrolment is not available.
              </p>
              <div className="pg-cat-list">
                {planned.map((row, index) => (
                  <LaterRow key={row.slug} row={row} index={index} />
                ))}
              </div>
            </div>
          </section>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}
