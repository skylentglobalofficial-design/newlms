import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
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

      <p className="pg-row-note">{row.honesty}</p>

      <p className="pg-row-cta">
        <Link to={row.href}>
          Explore programme
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </article>
  )
}

function LaterRow({ row }: { row: LaterProgrammeRow }) {
  return (
    <article className="pg-row is-later">
      <header className="pg-row-head">
        <p className="pg-row-kicker">{row.statusLabel}</p>
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

  return (
    <PageShell aurora={false}>
      <div className="pg-cat">
        <section className="pg-cat-identity" aria-labelledby="pg-cat-title">
          <div className="cat-rail">
            <p className="pg-cat-eyebrow">
              <i aria-hidden="true" />
              Programmes
            </p>
            <h1 id="pg-cat-title">Professional programmes.</h1>
            <p className="pg-cat-lead">
              Two programmes have authored teaching in Skylent OS today. The rest are catalogue listings — not live
              classrooms, and not as complete as Product Management or Data Analytics.
            </p>
            <p className="pg-cat-index">
              {live.length} ready to start · {later.length} coming later
            </p>
          </div>
        </section>

        <section className="pg-cat-live" aria-labelledby="pg-cat-live-title">
          <div className="cat-rail">
            <p className="pg-cat-label">Catalogue</p>
            <h2 id="pg-cat-live-title">Authored programmes</h2>
            <p className="pg-cat-intro">
              Each row is built from the linked course, not from brochure length. Open a programme for the full
              taught path and enrolment.
            </p>
            <div className="pg-cat-list">
              {live.map((row) => (
                <LiveRow key={row.slug} row={row} />
              ))}
            </div>
          </div>
        </section>

        <section className="pg-cat-later" aria-labelledby="pg-cat-later-title">
          <div className="cat-rail">
            <p className="pg-cat-label">Not live yet</p>
            <h2 id="pg-cat-later-title">Coming later</h2>
            <p className="pg-cat-intro">Listings without a finished authored programme. You can still open the page.</p>
            <div className="pg-cat-list">
              {later.map((row) => (
                <LaterRow key={row.slug} row={row} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
