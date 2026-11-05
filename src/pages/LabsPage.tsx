import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import TrackInteractiveSandbox from "../components/labs/TrackInteractiveSandbox"
import { PRACTICE_ENVIRONMENTS } from "../lib/practice-environments"
import "./Catalog.css"

const MULTI_TRACK_SANDBOXES = [
  {
    projectType: "python-pipeline-audit",
    courseSlug: "python-programming",
    courseTitle: "Python Programming & Automation",
    label: "Python Pipeline Sandbox",
    summary: "Validate settlement rows, quarantine duplicate webhook retries, and enforce composite idempotency keys.",
  },
  {
    projectType: "churn-cohort-validation",
    courseSlug: "data-science-ai",
    courseTitle: "Data Science & Applied AI",
    label: "Data Science Cohort Lab",
    summary: "Audit temporal feature leakage, out-of-time validation splits, and precision-recall lift on churn cohorts.",
  },
  {
    projectType: "enterprise-rag-evaluation",
    courseSlug: "generative-ai",
    courseTitle: "Generative AI & LLM Systems",
    label: "GenAI RAG Evaluation Lab",
    summary: "Verify chunk citation grounding, refusal guardrails, and retrieval latency budgets on enterprise prompts.",
  },
  {
    projectType: "idempotent-ledger-architecture",
    courseSlug: "full-stack-web",
    courseTitle: "Full Stack Web Engineering",
    label: "Full-Stack Ledger Sandbox",
    summary: "Test transactional outbox guarantees, row-level locking, and API idempotency under concurrent retries.",
  },
] as const

export default function LabsPage() {
  const [activeSandbox, setActiveSandbox] = useState<string>(MULTI_TRACK_SANDBOXES[0].projectType)
  const currentTrack = MULTI_TRACK_SANDBOXES.find((t) => t.projectType === activeSandbox) ?? MULTI_TRACK_SANDBOXES[0]

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero" style={{ paddingBottom: 24 }}>
          <div className="cat-rail">
            <div
              style={{
                background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
                border: "1px solid rgba(196, 184, 255, 0.45)",
                borderRadius: 20,
                padding: "clamp(26px, 4vw, 38px)",
                color: "#ffffff",
                boxShadow: "0 20px 44px -16px rgba(59, 45, 150, 0.35)",
              }}
            >
              <p style={{ margin: "0 0 8px", color: "#e9d5ff", font: "700 11.5px/1.4 var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                SKYLENT LABS · IN-BROWSER EXECUTION WORKSPACES ACROSS ALL 6 COURSES
              </p>
              <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 3.4vw, 40px)", color: "#ffffff", fontFamily: "var(--font-display)", lineHeight: 1.12 }}>
                Labs live inside the learning path.
              </h1>
              <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.9)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 720 }}>
                Every flagship course pairs written lessons with an interactive browser workspace where you execute SQL queries, audit Python pipelines, evaluate RAG citations, or defend product specifications before submitting your capstone.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  to="/courses/data-analytics"
                  style={{
                    padding: "11px 20px",
                    borderRadius: 999,
                    background: "#ffffff",
                    color: "#5142b5",
                    fontWeight: 800,
                    fontSize: 13.5,
                    textDecoration: "none",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.16)",
                  }}
                >
                  Open Data Analytics (Northwind SQL Lab) →
                </Link>
                <Link
                  to="/courses/product-management"
                  style={{
                    padding: "11px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.34)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: "none",
                  }}
                >
                  Open Product Management (Harbor Desk Case)
                </Link>
                <Link
                  to="/programmes"
                  style={{
                    padding: "11px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.34)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: "none",
                  }}
                >
                  Browse all 6 tracks
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title">
          <div className="cat-rail">
            <p className="cat-label" style={{ color: "#5142b5" }}>Dedicated Course Workspaces</p>
            <h2 id="labs-live-title">Each authored course includes a graded practice environment.</h2>
            <ul
              style={{
                listStyle: "none",
                margin: "18px 0 0",
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: 18,
              }}
            >
              {PRACTICE_ENVIRONMENTS.map((environment) => (
                <li
                  key={environment.id}
                  style={{
                    padding: "20px 22px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg, #f6f4ff 0%, #ffffff 100%)",
                    border: "1px solid #ddd6fe",
                    borderTop: "4px solid #5142b5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
                      {environment.statusLabel}
                    </span>
                    <h3 style={{ margin: "4px 0 6px", fontSize: 18, color: "#0f172a" }}>{environment.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{environment.summary}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "#5142b5" }}>
                      {environment.tools.join(" · ")}
                    </p>
                  </div>
                  <Link to={`/courses/${environment.courseSlug}`} style={{ fontWeight: 800, fontSize: 13, color: "#5142b5", textDecoration: "none" }}>
                    Inspect course curriculum →
                  </Link>
                </li>
              ))}
              {MULTI_TRACK_SANDBOXES.map((item) => (
                <li
                  key={item.projectType}
                  style={{
                    padding: "20px 22px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg, #f6f4ff 0%, #ffffff 100%)",
                    border: "1px solid #ddd6fe",
                    borderTop: "4px solid #5142b5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
                      In-browser evaluator · {item.courseTitle}
                    </span>
                    <h3 style={{ margin: "4px 0 6px", fontSize: 18, color: "#0f172a" }}>{item.label}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{item.summary}</p>
                  </div>
                  <Link to={`/courses/${item.courseSlug}`} style={{ fontWeight: 800, fontSize: 13, color: "#5142b5", textDecoration: "none" }}>
                    Inspect {item.courseTitle} →
                  </Link>
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 32,
                padding: "24px",
                borderRadius: 16,
                border: "1px solid #ddd6fe",
                borderTop: "4px solid #5142b5",
                background: "#ffffff",
                boxShadow: "0 12px 30px -14px rgba(81, 66, 181, 0.14)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div>
                  <p className="cat-label" style={{ margin: 0, color: "#5142b5" }}>Live Interactive Sandbox Preview</p>
                  <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                    Test-drive multi-track code &amp; architecture evaluators
                  </h3>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="tablist" aria-label="Select track sandbox">
                  {MULTI_TRACK_SANDBOXES.map((item) => (
                    <button
                      key={item.projectType}
                      type="button"
                      role="tab"
                      aria-selected={activeSandbox === item.projectType}
                      className={activeSandbox === item.projectType ? "cat-chip is-on" : "cat-chip"}
                      onClick={() => setActiveSandbox(item.projectType)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <TrackInteractiveSandbox projectType={currentTrack.projectType} />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
