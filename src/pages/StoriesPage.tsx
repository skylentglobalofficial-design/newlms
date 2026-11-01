import { Link } from "react-router-dom"
import {
  HarborDeskWorkspace,
  LearnFlow,
  NorthwindWorkspace,
} from "../components/product/ProductLanguage"
import { CAREER_OS_IA } from "../lib/product-architecture"
import { liveProgrammeCatalogue } from "../lib/programme-catalogue"
import { PROGRAMS_STUDY_DESK } from "../media"
import { PublicEditorialShell } from "./public-editorial"

const EXEMPLAR_JOURNEYS = [
  {
    code: "SKY-2026-8841",
    learner: "Aarav Mehta · B.Tech Final Year",
    programme: "Data Analytics Professional Programme",
    artifact: "Q3 Promotional Margin Erosion Audit (Northwind SQL · 166 rows · 96/100)",
    summary:
      "Queried 166 rows of Northwind regional order data in Skylent Labs, isolated stacked promotional discount leakage in the West region, and published a boardroom-ready executive memo.",
  },
  {
    code: "SKY-2026-7392",
    learner: "Ananya Iyer · Operations Associate → Associate PM",
    programme: "Product Management Professional Programme",
    artifact: "Harbor Desk Self-Serve Onboarding Redesign PRD (94/100)",
    summary:
      "Synthesised 4 customer interview transcripts in Harbor Desk Studio, scoped a strict 6-week engineering bet with clear non-goals, and defined activation guardrail metrics.",
  },
  {
    code: "SKY-2026-9104",
    learner: "Rohan Verma · Full-Stack Engineer",
    programme: "Generative AI & AI Systems Track",
    artifact: "Grounded Support Triage Assistant & Hallucination Guardrail Suite (98/100)",
    summary:
      "Designed a hybrid BM25 + vector retrieval pipeline with strict citation refusal rules and a 50-prompt adversarial evaluation benchmark.",
  },
] as const

const WORK_STEPS = [
  {
    title: "Learn",
    kind: "learn" as const,
    copy: "Structured written lessons and interactive case briefings inside your enrolled course.",
  },
  {
    title: "Practise",
    kind: "practice" as const,
    copy: "Concept checks after each module block, followed by applied assignments on the same dataset.",
  },
  {
    title: "Build",
    kind: "build" as const,
    copy: "A graded capstone project in Harbor Desk Studio or the Northwind SQL Lab.",
  },
  {
    title: "Keep",
    kind: "keep" as const,
    copy: "Your verified capstone dossier and certificate code stay permanently inspectable on /verify.",
  },
]

export default function StoriesPage() {
  const live = liveProgrammeCatalogue()
  const harbor = live.find((row) => row.visual === "harbor-desk")
  const northwind = live.find((row) => row.visual === "northwind")

  return (
    <PublicEditorialShell>
      <section className="pe-hero" aria-labelledby="stories-hero-title">
        <div className="cat-rail pe-hero-stage">
          <div className="pe-hero-copy">
            <p className="pe-eyebrow">
              <i aria-hidden="true" />
              Stories &amp; Proof of Work
            </p>
            <h1 id="stories-hero-title">
              <span>Stories from the work</span>
              <span>behind learning.</span>
            </h1>
            <p className="pe-lead">
              Every Skylent learner graduates with a cryptographically verifiable Capstone Dossier (/verify) rather than an unverified quote. Explore exemplar SQL audits, product specifications, and AI evaluations below.
            </p>
            <p className="pe-note">
              Want to inspect graded 94+/100 capstone submissions right now?{" "}
              <Link to="/verify">Open the Public Exemplar Dossier Gallery (/verify) →</Link>
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
            <figcaption>Real SQL audits and product specifications built inside Skylent OS</figcaption>
          </figure>
        </div>
      </section>

      <nav className="pe-inkbar" aria-label="Stories sections">
        <div className="cat-rail pe-inkbar-inner">
          <a href="#work">How It Works</a>
          <a href="#status">Exemplar Dossiers</a>
          <a href="#learning">Workspaces</a>
        </div>
      </nav>

      <section
        className="pe-section is-warm"
        id="work"
        aria-labelledby="stories-work-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Execution Standard</p>
          <h2 id="stories-work-title" className="is-quiet">
            The work comes first.
          </h2>
          <p className="pe-lead">
            Skylent documents how learning becomes work you can show to any hiring manager: written case lessons, browser labs, graded capstones, and verifiable evidence in Career OS.
          </p>
          <p className="pe-note">
            Editorial articles and curriculum notes live on the{" "}
            <Link to="/blog">Skylent blog →</Link>
          </p>
          <LearnFlow steps={WORK_STEPS} />
        </div>
      </section>

      <section
        className="pe-section is-paper"
        id="status"
        aria-labelledby="stories-status-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Public Exemplar Dossiers</p>
          <h2 id="stories-status-title" className="pe-display">
            Inspect verified capstone artefacts.
          </h2>
          <p className="pe-lead">
            Instead of unverified salary claims, Skylent publishes inspectable capstone dossiers with rubric scores and verification codes that any recruiter can audit on{" "}
            <Link to="/verify">/verify</Link>.
          </p>
          <ol className="pe-map is-follow">
            {EXEMPLAR_JOURNEYS.map((item, index) => (
              <li className="pe-map-item" key={item.code}>
                <div className="pe-map-row is-static">
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <div>
                    <strong>
                      {item.learner} · <span style={{ color: "#4f46e5" }}>{item.code}</span>
                    </strong>
                    <span style={{ display: "block", fontWeight: 600, marginTop: 2 }}>
                      {item.programme} — {item.artifact}
                    </span>
                    <span style={{ display: "block", marginTop: 4 }}>{item.summary}</span>
                    <span style={{ display: "inline-block", marginTop: 8 }}>
                      <Link to={`/verify?code=${item.code}`} style={{ fontWeight: 700, color: "#4f46e5", textDecoration: "none" }}>
                        Inspect verified dossier ({item.code}) →
                      </Link>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="pe-section is-soft"
        id="learning"
        aria-labelledby="stories-evidence-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Product evidence</p>
          <h2 id="stories-evidence-title" className="is-quiet">
            Live workspaces behind every dossier.
          </h2>
          <p className="pe-lead">
            Every capstone is built inside Skylent&apos;s browser studios—the Northwind SQL Lab (166 rows) and Harbor Desk PRD Studio—and connects directly into Career OS.
          </p>

          {live.length > 0 ? (
            <div className="pe-specimens">
              {harbor ? (
                <div>
                  <HarborDeskWorkspace
                    compact
                    meta="harbor-desk-case.md · 4 interviews"
                  />
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
          ) : null}

          <p className="pe-kicker is-spaced">
            Career OS — how verified work becomes a job application
          </p>
          <ul className="pe-plain">
            {CAREER_OS_IA.map((item) => (
              <li key={item.to}>
                <strong>{item.label}.</strong> {item.sub}
              </li>
            ))}
          </ul>
          <p className="pe-actions">
            <Link className="pe-cta-ghost" to="/career-os">
              Explore Career OS
            </Link>
            <Link className="pe-cta-ghost" to="/verify">
              Verify a Certificate
            </Link>
          </p>
        </div>
      </section>

      <section className="pe-close" aria-labelledby="stories-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Start Building</p>
          <h2 id="stories-close-title">
            Build your own verified capstone dossier.
          </h2>
          <p className="pe-lead">
            Enrol in an open flagship programme with ₹0 pilot access or join a live weekend ₹99 bootcamp.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/programmes">
              Explore programmes
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/events">
              Book ₹99 Weekend Bootcamp
            </Link>
          </p>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
