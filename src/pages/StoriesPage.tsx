import { Link } from "react-router-dom"
import { HarborDeskWorkspace, LearnFlow, NorthwindWorkspace } from "../components/product/ProductLanguage"
import { stories } from "../data"
import { CAREER_OS_IA } from "../lib/product-architecture"
import { liveProgrammeCatalogue } from "../lib/programme-catalogue"
import { PROGRAMS_STUDY_DESK } from "../media"
import { PublicEditorialShell } from "./public-editorial"

const DOCUMENTING = [
  {
    label: "Learner journeys",
    desc: "How someone moved through education, skills, and career — with their consent and verification.",
  },
  {
    label: "Programme experiences",
    desc: "What a professional programme actually involved — curriculum, projects, and the work produced.",
  },
  {
    label: "Learning and projects",
    desc: "Work produced during programmes — artefacts, not invented before/after claims.",
  },
  {
    label: "Career preparation",
    desc: "How Career OS was used — only when the learner agrees to share.",
  },
  {
    label: "Institution stories",
    desc: "How a partner institution runs programmes on Skylent — verified, not promotional.",
  },
] as const

const WORK_STEPS = [
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

export default function StoriesPage() {
  const published = stories.length
  const live = liveProgrammeCatalogue()
  const harbor = live.find((row) => row.visual === "harbor-desk")
  const northwind = live.find((row) => row.visual === "northwind")
  const empty = published === 0

  return (
    <PublicEditorialShell>
      <section className="pe-hero" aria-labelledby="stories-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              Stories
            </p>
            <h1 id="stories-hero-title">
              <span>Stories from the work</span>
              <span>behind learning.</span>
            </h1>
            <p className="pe-lead">
              This page will publish verified learner, programme, and institution stories — not marketing
              testimonials. Until those experiences are reviewed and approved, the page states that fact and shows the
              product work stories will eventually document.
            </p>
            <p className="pe-note">
              We do not publish names, salaries, placement rates, or sample narratives from the codebase.
            </p>
          </div>
          <figure className="pe-figure">
            <div className="pe-photo is-desk">
              <img
                src={PROGRAMS_STUDY_DESK}
                alt="Overhead view of a student working at a laptop with open books"
                width={1800}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>The work, not a testimonial portrait</figcaption>
          </figure>
        </div>
      </section>

      <nav className="pe-inkbar" aria-label="Stories sections">
        <div className="cat-rail pe-inkbar-inner">
          <a href="#work">Work</a>
          <a href="#status">Currently</a>
          <a href="#learning">Evidence</a>
        </div>
      </nav>

      <section className="pe-section is-warm" id="work" aria-labelledby="stories-work-title">
        <div className="cat-rail pe-ink-stage">
          <div>
            <p className="pe-kicker">Editorial</p>
            <h2 id="stories-work-title" className="is-quiet">The work comes first.</h2>
            <p className="pe-lead">
              Skylent is documenting how learning becomes work you can show: written lessons, practice, projects, and
              evidence in Career OS. A story here will be a reviewed account of that work — never a fabricated outcome.
            </p>
            <p className="pe-note">
              Editorial writing that is not a learner story lives on the <Link to="/blog">blog</Link>.
            </p>
          </div>
          <div className="pe-product">
            {harbor ? (
              <HarborDeskWorkspace compact meta="harbor-desk-case.md · 4 interviews" />
            ) : (
              <NorthwindWorkspace compact />
            )}
          </div>
        </div>
      </section>

      <section className="pe-section is-paper" id="status" aria-labelledby="stories-status-title">
        <div className="cat-rail">
          <p className="pe-kicker">Currently</p>
          <h2 id="stories-status-title" className="pe-display">
            {empty ? "None published." : "Not shown until verified."}
          </h2>
          <p className="pe-lead">
            {empty
              ? "There are no verified learner, programme, or institution stories on this page. We will publish journeys only when the person agrees and we can verify the facts. Empty is the honest state — not a broken one."
              : "The catalogue has records that are not published here. Names, salaries, and outcomes stay off this page until they can be verified."}
          </p>
          <ol className="pe-map is-follow">
            {DOCUMENTING.map((item, index) => (
              <li className="pe-map-item" key={item.label}>
                <div className="pe-map-row is-static">
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pe-section is-soft" id="learning" aria-labelledby="stories-evidence-title">
        <div className="cat-rail">
          <p className="pe-kicker">How evidence will appear</p>
          <h2 id="stories-evidence-title" className="is-quiet">The work first. The story later.</h2>
          <p className="pe-lead">
            When a story is ready, it will point at work that already exists in the product: a programme project, a
            Career OS profile, an application when a role is published. The specimens below are live programme
            workspaces — not learner testimonials.
          </p>
          <LearnFlow steps={WORK_STEPS} />

          {live.length > 0 ? (
            <div className="pe-specimens">
              {harbor ? (
                <div>
                  <HarborDeskWorkspace compact meta="harbor-desk-case.md · 4 interviews" />
                  <div className="pe-attr">
                    <p>
                      {harbor.courseTitle || harbor.title}
                      <br />
                      <Link to={harbor.href}>Explore programme →</Link>
                    </p>
                  </div>
                </div>
              ) : null}
              {northwind ? (
                <div>
                  <NorthwindWorkspace compact />
                  <div className="pe-attr">
                    <p>
                      {northwind.courseTitle || northwind.title}
                      <br />
                      <Link to={northwind.href}>Explore programme →</Link>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="pe-note">
              Live programme workspaces will appear here when the catalogue has authored programmes.
            </p>
          )}

          <p className="pe-kicker is-spaced">Career OS — product workflow</p>
          <ol className="pe-list">
            {CAREER_OS_IA.map((item, index) => (
              <li key={item.to}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <span>
                  <strong>{item.label}. </strong>
                  {item.sub}
                </span>
              </li>
            ))}
          </ol>
          <p className="pe-actions">
            <Link className="pe-cta-ghost" to="/career-os">
              Explore Career OS
            </Link>
            <Link className="pe-cta-ghost" to="/institutions">
              For institutions
            </Link>
          </p>
        </div>
      </section>

      <section className="pe-close" aria-labelledby="stories-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Explore Skylent</p>
          <h2 id="stories-close-title">See the product stories will document.</h2>
          <p className="pe-lead">
            Programmes and courses are the live learning surfaces. Open them while verified stories are prepared.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/programs">
              Explore programmes
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/courses">
              Explore courses
            </Link>
          </p>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
