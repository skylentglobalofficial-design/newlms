import { Link } from "react-router-dom"
import {
  CertificateOsPreview,
  HarborDeskWorkspace,
  LearnFlow,
  NorthwindWorkspace,
  SkylentOsPreview,
} from "../product/ProductLanguage"
import { PROGRAMS_STUDY_CAMPUS, PROGRAMS_STUDY_DESK, PROGRAMS_STUDY_LIBRARY } from "../../media"
import { PROGRAMME_WORK_SURFACES, type ProgrammeDiscoveryCard } from "../../lib/programme-discovery"
import { programmeBuildLine } from "../../lib/programme-catalogue"
import "./ProgramsStory.css"

const LEARN_STEPS = [
  {
    title: "Learn",
    kind: "learn" as const,
    copy: "Written lessons in the enrolled course. Self-paced. No video stream and no live classroom.",
  },
  {
    title: "Practise",
    kind: "practice" as const,
    copy: "Short checks after a block of teaching, then assignments on the same material.",
  },
  {
    title: "Build",
    kind: "build" as const,
    copy: "A project against material that already exists: Harbor Desk or the Northwind extract.",
  },
  {
    title: "Keep",
    kind: "keep" as const,
    copy: "The work sample stays with you. It is not a grade, a certificate, or a job claim.",
  },
]

function ShowcaseBand({
  row,
  photo,
  photoAlt,
  flip,
}: {
  row: ProgrammeDiscoveryCard
  photo: string
  photoAlt: string
  flip?: boolean
}) {
  const title = row.courseTitle || row.title
  const build = programmeBuildLine(row)

  return (
    <article className={flip ? "pg-show is-flip is-da" : "pg-show is-pm"}>
      <div className="pg-show-copy">
        <p className="pg-kicker">Ready to start</p>
        <h3>
          <Link to={row.href}>{title}</Link>
        </h3>
        {row.courseTitle && row.courseTitle !== row.title ? (
          <p className="pg-show-aka">{row.title}</p>
        ) : null}
        <p className="pg-show-decision">{row.decisionLine}</p>
        <p className="pg-show-shape">
          {row.taughtModules} modules · {row.taughtLessons} lessons · {row.format} · {row.level}
        </p>
        <p className="pg-show-build">{build}</p>
        <p className="pg-show-note">{row.honesty}</p>
        <p className="pg-show-cta">
          <Link to={row.href}>
            Explore programme
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
      <div className="pg-show-visual">
        <figure className="pg-show-stage">
          <img src={photo} alt={photoAlt} width={1800} height={1200} decoding="async" />
          <div className="pg-show-product">
            {row.visual === "harbor-desk" ? (
              <HarborDeskWorkspace compact meta="harbor-desk-case.md · 4 interviews" />
            ) : (
              <NorthwindWorkspace compact />
            )}
          </div>
        </figure>
      </div>
    </article>
  )
}

export default function ProgramsStory({ live }: { live: ProgrammeDiscoveryCard[] }) {
  const pm = live.find((row) => row.visual === "harbor-desk")
  const da = live.find((row) => row.visual === "northwind")

  return (
    <>
      <section className="pg-story pg-showcase" aria-labelledby="pg-show-title">
        <div className="cat-rail">
          <p className="pg-kicker">Authored now</p>
          <h2 id="pg-show-title">Two programmes with teaching behind them.</h2>
          <p className="pg-lead">
            Product Management and Data Analytics with Gen AI are the programmes that currently have an authored
            course. The opening below is that course, the work it produces, and a photograph of study — not a
            brochure length.
          </p>
          <div className="pg-show-list">
            {pm ? (
              <ShowcaseBand
                row={pm}
                photo={PROGRAMS_STUDY_CAMPUS}
                photoAlt="A university student working on a laptop on campus"
              />
            ) : null}
            {da ? (
              <ShowcaseBand
                row={da}
                photo={PROGRAMS_STUDY_LIBRARY}
                photoAlt="College students studying at a library table"
                flip
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="pg-story pg-learn" aria-labelledby="pg-learn-title">
        <div className="cat-rail">
          <p className="pg-kicker">Learning model</p>
          <h2 id="pg-learn-title">Learning should end in something you can show.</h2>
          <p className="pg-lead">
            The path is the same product you enter after enrolment: written teaching, checks, a project, then a work
            sample you keep.
          </p>
          <LearnFlow steps={LEARN_STEPS} />
        </div>
      </section>

      <section className="pg-story pg-pair" aria-labelledby="pg-pair-title">
        <div className="cat-rail pg-pair-grid">
          <div className="pg-pair-copy">
            <p className="pg-kicker">Study and software</p>
            <h2 id="pg-pair-title">Study happens in Skylent OS.</h2>
            <p className="pg-lead">
              People study. The work happens in Skylent OS — lessons, practice, projects, and evidence in one
              workspace. This is not a live class.
            </p>
          </div>
          <figure className="pg-photo pg-pair-photo">
            <img
              src={PROGRAMS_STUDY_DESK}
              alt="Overhead view of a student working at a laptop with open books"
              width={1800}
              height={1200}
              decoding="async"
            />
          </figure>
          <div className="pg-pair-product">
            <CertificateOsPreview />
          </div>
        </div>
      </section>

      <section className="pg-story pg-anatomy" aria-labelledby="pg-anatomy-title">
        <div className="cat-rail">
          <p className="pg-kicker">Programme anatomy</p>
          <h2 id="pg-anatomy-title">What is actually taught.</h2>
          <p className="pg-lead">
            Module titles, activity counts, and capstones come from the linked authored course. Brochure length is
            not used here.
          </p>
          <div className="pg-anatomy-list">
            {live.map((row) => {
              const title = row.courseTitle || row.title
              return (
                <article key={row.slug} className="pg-anatomy-item">
                  <header>
                    <p className="pg-kicker">Ready to start</p>
                    <h3>
                      <Link to={row.href}>{title}</Link>
                    </h3>
                    <p>
                      {row.taughtModules} modules · {row.taughtLessons} lessons · {row.taughtWritten} written ·{" "}
                      {row.format}
                    </p>
                  </header>
                  <ol>
                    {row.modules.map((module) => (
                      <li key={module.id}>
                        <span>{String(module.index).padStart(2, "0")}</span>
                        <div>
                          <strong>{module.title}</strong>
                          <em>{module.countsLabel}</em>
                          <p>{module.workLine}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {row.capstone ? (
                    <p className="pg-anatomy-end">
                      Ends in <strong>{row.capstone}</strong>
                      {row.material ? (
                        <>
                          {" "}
                          against <code>{row.material}</code>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pg-story pg-os" aria-labelledby="pg-os-title">
        <div className="cat-rail pg-os-grid">
          <div className="pg-os-copy">
            <p className="pg-kicker">Skylent OS</p>
            <h2 id="pg-os-title">The programme runs inside the product.</h2>
            <p className="pg-lead">
              Skylent OS is the student workspace you enter after enrolling. It is the same product as the learner
              dashboard — not a separate operating system and not a video classroom.
            </p>
            <ul className="pg-os-facts">
              {PROGRAMME_WORK_SURFACES.map((surface) => (
                <li key={surface.id}>
                  <strong>{surface.label}</strong>
                  <span>{surface.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pg-os-visual">
            <SkylentOsPreview />
          </div>
        </div>
      </section>

      <section className="pg-story pg-close" aria-labelledby="pg-close-title">
        <div className="cat-rail">
          <p className="pg-kicker">Start</p>
          <h2 id="pg-close-title">Start with the work.</h2>
          <p className="pg-lead">
            Open a programme to see the taught path. Enrolment opens the linked authored course. Payment is not
            collected, and a certificate is not issued yet.
          </p>
          <p className="pg-hero-actions">
            <a className="pg-hero-cta" href="#pg-catalogue">
              Explore programmes
              <span className="pg-hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
