import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import ProgramsHero from "../components/programs/ProgramsHero"
import {
  HarborDeskWorkspace,
  LearnFlow,
  NorthwindWorkspace,
  SkylentOsPreview,
  SkylentWorkflowStory,
} from "../components/product/ProductLanguage"
import { courses } from "../data"
import { isAuthoredCourse } from "../lib/authored-courses"
import { linkedCourseSlugsForProgram } from "../lib/catalog-maturity"
import {
  laterProgrammeCatalogue,
  liveProgrammeCatalogue,
  programmeBuildLine,
} from "../lib/programme-catalogue"
import type { LaterProgrammeRow } from "../lib/programme-catalogue"
import type { ProgrammeDiscoveryCard } from "../lib/programme-discovery"
import "./ProgramsPage.css"

const LIBRARY_IMAGE =
  "https://images.pexels.com/photos/7777713/pexels-photo-7777713.jpeg?auto=compress&dpr=1&w=1600"

function courseFor(programSlug: string) {
  const slug = linkedCourseSlugsForProgram(programSlug).find((row) => isAuthoredCourse(row))
  return slug ? courses.find((course) => course.slug === slug) : undefined
}

function ProgrammeCard({ row, index }: { row: ProgrammeDiscoveryCard; index: number }) {
  const course = courseFor(row.slug)
  const visual = row.visual === "northwind" ? "northwind" : "harbor-desk"

  return (
    <article className={"pg-programme-card " + (index % 2 ? "is-reverse" : "")}>
      <div className="pg-programme-card-copy">
        <p className="pg-section-label">0{index + 1} · Programme</p>
        <h3>{row.courseTitle || row.title}</h3>
        <p className="pg-programme-decision">{row.decisionLine}</p>

        <div className="pg-programme-meta">
          <span>{row.taughtModules} modules</span>
          <span>{row.taughtLessons} lessons</span>
          <span>{row.format}</span>
        </div>

        <p className="pg-programme-build">
          <strong>Build</strong>
          {programmeBuildLine(row)}
        </p>

        <Link className="pg-arrow-link" to={row.href}>
          Open programme <span aria-hidden="true">→</span>
        </Link>

        {course ? (
          <p className="pg-programme-course-note">
            Built from <strong>{course.title}</strong> · {course.mode} · {course.level}
          </p>
        ) : null}
      </div>

      <div className="pg-programme-card-visual">
        {visual === "harbor-desk" ? (
          <HarborDeskWorkspace compact meta="harbor-desk-case.md · 4 interviews" />
        ) : (
          <NorthwindWorkspace compact />
        )}
      </div>

    </article>
  )
}

function LaterRow({ row }: { row: LaterProgrammeRow }) {
  return (
    <Link className="pg-later-row" to={row.href}>
      <span className="pg-later-status">{row.statusLabel}</span>
      <strong>{row.title}</strong>
      <span>{row.summary}</span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}

export default function ProgramsPage() {
  const live = liveProgrammeCatalogue()
  const later = laterProgrammeCatalogue()

  return (
    <PageShell aurora={false}>
      <div className="pg-cat">
        <ProgramsHero />

        <nav className="pg-programme-rail" aria-label="Programme sections">
          <div className="cat-rail">
            <a href="#pg-programmes" className="is-active">Programmes</a>
            <a href="#pg-learning-model">Learning model</a>
            <a href="#pg-skylent-os">Skylent OS</a>
            <a href="#pg-anatomy">Programme anatomy</a>
          </div>
        </nav>

        <section className="pg-intro-section" id="pg-programmes" aria-labelledby="pg-programmes-title">
          <div className="cat-rail">
            <div className="pg-intro-head">
              <div>
                <p className="pg-section-label">Find your programme</p>
                <h2 id="pg-programmes-title">Two programmes. Built around real work.</h2>
              </div>
              <p>
                Start with an authored programme below. Each one is anchored to a real Skylent course, with the work,
                lesson counts, and project surface shown as they exist today.
              </p>
            </div>

            <div className="pg-programme-list">
              {live.map((row, index) => (
                <ProgrammeCard key={row.slug} row={row} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="pg-statement-section" id="pg-learning-model" aria-labelledby="pg-statement-title">
          <div className="cat-rail pg-statement-grid">
            <div>
              <p className="pg-section-label">The learning model</p>
              <h2 id="pg-statement-title">Learning should end in something you can show.</h2>
            </div>
            <p>
              Skylent connects the lesson to the work. You learn the concept, check your understanding, use it on a
              real-shaped problem, and keep the resulting work as evidence.
            </p>
          </div>

          <div className="cat-rail pg-flow-wrap">
            <LearnFlow
              steps={[
                { title: "Learn", copy: "Written lessons that establish the idea.", kind: "learn" },
                { title: "Practise", copy: "Checks that make understanding visible.", kind: "practice" },
                { title: "Build", copy: "A project against authored material.", kind: "build" },
                { title: "Keep", copy: "Evidence that stays in your workspace.", kind: "keep" },
              ]}
            />
          </div>
        </section>

        <section className="pg-editorial-section" aria-labelledby="pg-editorial-title">
          <div className="cat-rail pg-editorial-grid">
            <figure className="pg-editorial-photo">
              <img src={LIBRARY_IMAGE} alt="Two students studying together at a library table" />
              <figcaption>Learning is a practice, not a backdrop.</figcaption>
            </figure>

            <div className="pg-editorial-copy">
              <p className="pg-section-label">Real people. Real product.</p>
              <h2 id="pg-editorial-title">The human side of learning belongs next to the product.</h2>
              <p>
                The interface gives structure to the work. The study environment gives it context. Skylent brings
                both together without turning the programme into a live classroom.
              </p>
              <div className="pg-editorial-rule" />
              <p className="pg-editorial-small">
                The photography is intentionally editorial: one strong frame, generous space, and no decorative
                collage.
              </p>
            </div>
          </div>
        </section>

        <section className="pg-os-section" id="pg-skylent-os" aria-labelledby="pg-os-title">
          <div className="cat-rail">
            <div className="pg-os-head">
              <div>
                <p className="pg-section-label">Inside Skylent OS</p>
                <h2 id="pg-os-title">The system behind the programme.</h2>
              </div>
              <p>Lessons, practice, projects and the work you keep are designed as one learning system.</p>
            </div>

            <SkylentWorkflowStory />
            <SkylentOsPreview />
          </div>
        </section>

        <section className="pg-anatomy-section" id="pg-anatomy" aria-labelledby="pg-anatomy-title">
          <div className="cat-rail">
            <div className="pg-anatomy-head">
              <div>
                <p className="pg-section-label">Programme anatomy</p>
                <h2 id="pg-anatomy-title">See what you actually move through.</h2>
              </div>
              <p>
                Module titles, lesson counts, practice and project work come from the authored course data. Nothing is
                padded to make the programme look bigger.
              </p>
            </div>

            <div className="pg-anatomy-table">
              {live.map((row, index) => (
                <Link key={row.slug} to={row.href} className="pg-anatomy-row">
                  <span>0{index + 1}</span>
                  <strong>{row.courseTitle || row.title}</strong>
                  <span>{row.taughtModules} modules</span>
                  <span>{row.taughtLessons} lessons</span>
                  <span>{row.capstone ? "Project included" : "Course-led"}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {later.length > 0 ? (
          <section className="pg-later-section" aria-labelledby="pg-later-title">
            <div className="cat-rail">
              <div className="pg-later-head">
                <div>
                  <p className="pg-section-label">Catalogue</p>
                  <h2 id="pg-later-title">Coming later.</h2>
                </div>
                <p>Listings remain visible, but they are not presented as finished authored programmes.</p>
              </div>
              <div className="pg-later-list">
                {later.map((row) => (
                  <LaterRow key={row.slug} row={row} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pg-final-section" aria-labelledby="pg-final-title">
          <div className="cat-rail pg-final-inner">
            <div>
              <p className="pg-section-label">Start with the work</p>
              <h2 id="pg-final-title">Start with the work. Keep what you build.</h2>
            </div>
            <a className="pg-final-cta" href="#pg-programmes">
              Explore programmes <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
