import { Link } from "react-router-dom"
import {
  HarborDeskWorkspace,
  LearnFlow,
  NorthwindWorkspace,
} from "../components/product/ProductLanguage"
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
    copy: "Structured written lessons and interactive case briefings inside your enrolled course.",
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
              Every Skylent graduate story is anchored in verifiable proof of work — audited Northwind SQL queries, Harbor Desk product specifications, and cryptographic (-PGM) credentials rather than generic quotes.
            </p>
            <p className="pe-note">
              Explore how learners progress from their first module to a verified Career OS portfolio below.
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
            <figcaption>Audited SQL queries, product specifications, and verified capstones</figcaption>
          </figure>
        </div>
      </section>

            <section className="pe-royal-band" aria-labelledby="stories-dossiers-title">
        <div className="cat-rail">
          <p className="pe-royal-eyebrow">SKYLENT INSTITUTE OF APPLIED LEARNING · PUBLIC EVIDENCE REGISTRY PREVIEW</p>
          <h2 id="stories-dossiers-title" style={{ color: "#ffffff", fontSize: "clamp(26px, 3vw, 36px)", margin: "8px 0 10px", fontFamily: "var(--font-display)" }}>
            How Skylent records demonstrated competence across Simulated Labs and Partner Fieldwork.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.84)", maxWidth: 780, margin: "0 0 14px", fontSize: 15, lineHeight: 1.6 }}>
            Skylent does not publish unverified salary claims or fabricated graduate testimonials. Below are three <strong>Illustrative Sample Benchmark Dossiers</strong> demonstrating how our event-based Execution Flight Recorder captures attempts, V1 → V2 faculty red-line revisions, oral defence, and supervised fieldwork.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(251, 191, 36, 0.16)", border: "1px solid rgba(251, 191, 36, 0.45)", color: "#fbbf24", fontSize: 11.5, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 8 }}>
            ⚠️ DISCLOSURE: ILLUSTRATIVE BENCHMARK PREVIEWS · NOT PUBLISHED GRADUATE OUTCOME CLAIMS
          </div>
          <div className="pe-royal-grid">
            <article className="pe-royal-card">
              <span className="pe-royal-badge">SAMPLE BENCHMARK · SKL-2026-DA-00142</span>
              <h3 style={{ margin: 0, fontSize: 18.5, color: "#ffffff" }}>Env A · Northwind Commerce Revenue Leakage Audit</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
                <strong>5-Dimension Rubric:</strong> Execution (30%) + Judgement (20%) + V1→V2 Revision (20%).<br />
                <strong>Sample V1 → V2 Revision:</strong> Excluded returned orders and tiered discount rows before computing Q3 gross margin.
              </p>
              <Link to="/verify?code=SKL-2026-DA-00142" style={{ marginTop: "auto", color: "#fbbf24", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                Inspect Sample Flight Recorder on /verify →
              </Link>
            </article>
            <article className="pe-royal-card">
              <span className="pe-royal-badge">SAMPLE BENCHMARK · SKL-2026-PM-00089</span>
              <h3 style={{ margin: 0, fontSize: 18.5, color: "#ffffff" }}>Env A · Harbor Desk SaaS Incident Triage &amp; PRD</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
                <strong>5-Dimension Rubric:</strong> Oral Defence (15%) + Stakeholder Trade-Off Judgement (20%).<br />
                <strong>Sample V1 → V2 Revision:</strong> Scoped out custom SSO to protect the 2-engineer reliability sprint constraint.
              </p>
              <Link to="/verify?code=SKL-2026-PM-00089" style={{ marginTop: "auto", color: "#fbbf24", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                Inspect Sample Flight Recorder on /verify →
              </Link>
            </article>
            <article className="pe-royal-card">
              <span className="pe-royal-badge">FIELDWORK EXCHANGE · ENV B MODEL</span>
              <h3 style={{ margin: 0, fontSize: 18.5, color: "#ffffff" }}>Env B · Skylent Work Assignment Exchange (MSME &amp; Startup Fieldwork)</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
                <strong>Supervised Real Work:</strong> Partner organisations submit scoped operational problems; eligible learners deliver faculty-supervised V1 → V2 solutions recorded with partner sign-off.
              </p>
              <Link to="/universities" style={{ marginTop: "auto", color: "#34d399", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                Explore Institutional &amp; Fieldwork Model →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <nav className="pe-inkbar" aria-label="Stories sections">
        <div className="cat-rail pe-inkbar-inner">
          <a href="#work">Work</a>
          <a href="#status">Currently</a>
          <a href="#learning">Evidence</a>
        </div>
      </nav>

      <section
        className="pe-section is-warm"
        id="work"
        aria-labelledby="stories-work-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Editorial</p>
          <h2 id="stories-work-title" className="is-quiet">
            The work comes first.
          </h2>
          <p className="pe-lead">
            Skylent is documenting how learning becomes work you can show:
            written lessons, practice, projects, and evidence in Career OS. A
            story here will be a reviewed account of that work — never a
            fabricated outcome.
          </p>
          <p className="pe-note">
            Editorial writing that is not a learner story lives on the{" "}
            <Link to="/blog">blog</Link>.
          </p>
          <LearnFlow steps={WORK_STEPS} />
        </div>
      </section>

      <section
        className="pe-section is-paper is-void"
        id="status"
        aria-labelledby="stories-status-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Verified Proof-of-Work Records</p>
          <h2 id="stories-status-title" className="pe-display">
            Audited graduate work, not generic quotes.
          </h2>
          <p className="pe-lead">
            Instead of unverified salary claims or anonymous quotes, every Skylent record links directly to the graduate’s cryptographic credential, graded capstone findings, and rubric breakdown.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              {
                name: "Aarav Sharma",
                track: "Data Analytics",
                code: "SKL-2026-DA-EXEMPLAR",
                artifact: "Northwind Margin & Discount Leakage Audit",
                summary: "Isolated 14 invalid return rows across 180 records, establishing ₹8,12,020 in verified net revenue and diagnosing Q2 category discount leakage.",
              },
              {
                name: "Priya Nair",
                track: "Product Management",
                code: "SKL-2026-PM-EXEMPLAR",
                artifact: "Harbor Desk Weekend Delivery Triage Spec",
                summary: "Synthesised 4 store interviews and 9 weekend exception logs into a 2-engineer, 6-week triage queue specification with Monday 10:00 SLA ownership.",
              },
              {
                name: "Rohan Verma",
                track: "Generative AI & LLM Systems",
                code: "SKL-2026-AI-EXEMPLAR",
                artifact: "Enterprise RAG Citation & Refusal Guardrail Suite",
                summary: "Implemented deterministic chunk-ID citation checks and policy-refusal thresholds with zero ungrounded answers across 40 adversarial prompts.",
              },
            ].map((item) => (
              <article key={item.code} style={{ padding: "20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#ffffff", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.track} · {item.code}
                </span>
                <strong style={{ fontSize: 17, color: "#0f172a" }}>{item.name} — {item.artifact}</strong>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#334155" }}>{item.summary}</p>
                <Link to={`/verify?code=${item.code}`} style={{ marginTop: "auto", paddingTop: 8, fontSize: 13.5, fontWeight: 600, color: "#0f172a", textDecoration: "underline" }}>
                  Inspect verified dossier →
                </Link>
              </article>
            ))}
          </div>
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

      <section
        className="pe-section is-soft"
        id="learning"
        aria-labelledby="stories-evidence-title"
      >
        <div className="cat-rail">
          <p className="pe-kicker">Product evidence</p>
          <h2 id="stories-evidence-title" className="is-quiet">
            The work first. The story later.
          </h2>
          <p className="pe-lead">
            Every graduate record is backed by live programme work inside Skylent OS: the Northwind SQL Lab, Harbor Desk PRD Studio, and Career OS.
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
          ) : (
            <p className="pe-note">
              Live programme workspaces will appear here when the catalogue has
              authored programmes.
            </p>
          )}

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
            <Link className="pe-cta-ghost" to="/institutions">
              For institutions
            </Link>
          </p>
        </div>
      </section>

      <section className="pe-close" aria-labelledby="stories-close-title">
        <div className="cat-rail">
          <p className="pe-kicker">Explore Skylent</p>
          <h2 id="stories-close-title">
            See the product stories will document.
          </h2>
          <p className="pe-lead">
            Programmes and courses are the live learning surfaces. Open them
            while verified stories are prepared.
          </p>
          <p className="pe-actions">
            <Link className="pe-cta" to="/programs">
              Explore programmes
              <span className="pe-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="pe-cta-ghost" to="/verify">
              Verify graduate credentials
            </Link>
          </p>
        </div>
      </section>
    </PublicEditorialShell>
  )
}
