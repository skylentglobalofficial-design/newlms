import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import TrackInteractiveSandbox from "../components/labs/TrackInteractiveSandbox"
import { PRACTICE_ENVIRONMENTS } from "../lib/practice-environments"
import "./Catalog.css"

const ALL_SIX_SANDBOXES = [
  {
    projectType: "northwind-margin-audit",
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics & Business SQL",
    label: "SQL Northwind Lab",
    summary: "Execute read-only SQL SELECT, JOIN, and GROUP BY queries on the 166-row Northwind retail dataset and audit the 14.5% Apparel discount leakage.",
    studioHref: "/os/labs/data-analytics/northwind",
  },
  {
    projectType: "harbor-desk-prd",
    courseSlug: "product-management",
    courseTitle: "Product Management",
    label: "Harbor Desk PRD Studio",
    summary: "Filter 18 store-manager interviews, isolate the delivery-exception root cause, and scope a 6-week engineering bet for a 2-engineer team.",
    studioHref: "/os/projects/product-management/harbor-desk-case",
  },
  {
    projectType: "python-pipeline-audit",
    courseSlug: "python-programming",
    courseTitle: "Python Programming & Automation",
    label: "Python Pipeline Sandbox",
    summary: "Validate settlement rows, quarantine duplicate webhook retries, and enforce composite idempotency keys.",
    studioHref: "/os/projects/python-programming/python-pipeline-audit",
  },
  {
    projectType: "churn-cohort-validation",
    courseSlug: "data-science-ai",
    courseTitle: "Data Science & Applied AI",
    label: "Data Science Cohort Lab",
    summary: "Audit temporal feature leakage, out-of-time validation splits, and precision-recall lift on churn cohorts.",
    studioHref: "/os/projects/data-science-ai/churn-cohort-validation",
  },
  {
    projectType: "enterprise-rag-evaluation",
    courseSlug: "generative-ai",
    courseTitle: "Generative AI & LLM Systems",
    label: "GenAI RAG Evaluation Lab",
    summary: "Verify chunk citation grounding, refusal guardrails, and retrieval latency budgets on enterprise prompts.",
    studioHref: "/os/projects/generative-ai/enterprise-rag-evaluation",
  },
  {
    projectType: "idempotent-ledger-architecture",
    courseSlug: "full-stack-web",
    courseTitle: "Full Stack Web Engineering",
    label: "Full-Stack Ledger Sandbox",
    summary: "Test transactional outbox guarantees, row-level locking, and API idempotency under concurrent retries.",
    studioHref: "/os/projects/full-stack-web/idempotent-ledger-architecture",
  },
] as const

export default function LabsPage() {
  const [searchParams] = useSearchParams()
  const requestedTrack = searchParams.get("track")
  const [activeSandbox, setActiveSandbox] = useState<string>(() => {
    const match = ALL_SIX_SANDBOXES.find((t) => t.courseSlug === requestedTrack || t.projectType === requestedTrack)
    return match ? match.projectType : ALL_SIX_SANDBOXES[0].projectType
  })

  useEffect(() => {
    if (!requestedTrack) return
    const match = ALL_SIX_SANDBOXES.find((t) => t.courseSlug === requestedTrack || t.projectType === requestedTrack)
    if (match) setActiveSandbox(match.projectType)
  }, [requestedTrack])

  const currentTrack = ALL_SIX_SANDBOXES.find((t) => t.projectType === activeSandbox) ?? ALL_SIX_SANDBOXES[0]

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero" style={{ paddingTop: 16, paddingBottom: 18 }}>
          <div className="cat-rail">
            <div
              className="sky-on-navy"
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #3b2d96 55%, #5142b5 100%)",
                border: "1px solid rgba(196, 184, 255, 0.35)",
                borderRadius: 18,
                padding: "clamp(18px, 3vw, 28px)",
                color: "#ffffff",
                boxShadow: "0 16px 36px -16px rgba(30, 27, 75, 0.4)",
              }}
            >
              <p style={{ margin: "0 0 6px", color: "#c4b5fd", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                SKYLENT INTERACTIVE LABS · ZERO SETUP IN-BROWSER WORKBENCH
              </p>
              <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px, 3vw, 32px)", color: "#ffffff", fontWeight: 700, lineHeight: 1.15 }}>
                Practise live in your browser across all 6 tracks.
              </h1>
              <p style={{ margin: 0, color: "#e2e8f0", fontSize: 14, lineHeight: 1.55, maxWidth: 680 }}>
                Select any career track below to run live SQL queries, Python pipeline checks, product PRD scoping, or RAG grounding evaluations directly in your browser.
              </p>
            </div>

            {/* Interactive Workbench Front-and-Center at the Top of /labs */}
            <div
              id="live-lab-workbench"
              style={{
                marginTop: 16,
                padding: "clamp(16px, 2.5vw, 24px)",
                borderRadius: 16,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                boxShadow: "0 10px 28px -14px rgba(15, 23, 42, 0.1)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Active Browser Lab · {currentTrack.courseTitle}
                  </span>
                  <h2 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
                    {currentTrack.label}
                  </h2>
                </div>
                <Link
                  to={currentTrack.studioHref}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#f5f3ff",
                    border: "1px solid #c4b5fd",
                    color: "#5142b5",
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open Full Studio Workspace →
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  paddingBottom: 10,
                  marginBottom: 14,
                  borderBottom: "1px solid #e2e8f0",
                }}
                role="tablist"
                aria-label="Select track sandbox"
              >
                {ALL_SIX_SANDBOXES.map((item) => {
                  const active = activeSandbox === item.projectType
                  return (
                    <button
                      key={item.projectType}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveSandbox(item.projectType)}
                      style={{
                        padding: "7px 13px",
                        borderRadius: 999,
                        border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                        background: active ? "#5142b5" : "#f8fafc",
                        color: active ? "#ffffff" : "#334155",
                        fontSize: 12.5,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <TrackInteractiveSandbox projectType={currentTrack.projectType} />
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title" style={{ paddingTop: 12 }}>
          <div className="cat-rail">
            <p className="cat-label" style={{ color: "#5142b5" }}>Dedicated Course Workspaces</p>
            <h2 id="labs-live-title">All 6 graded practice environments</h2>
            <ul
              style={{
                listStyle: "none",
                margin: "14px 0 0",
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 14,
              }}
            >
              {PRACTICE_ENVIRONMENTS.map((environment) => (
                <li
                  key={environment.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#5142b5", textTransform: "uppercase" }}>
                      {environment.statusLabel}
                    </span>
                    <h3 style={{ margin: "4px 0 6px", fontSize: 17, color: "#0f172a" }}>{environment.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>{environment.summary}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 600, color: "#5142b5" }}>
                      {environment.tools.join(" · ")}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSandbox(environment.courseSlug === "data-analytics" ? "northwind-margin-audit" : "harbor-desk-prd")
                        document.getElementById("live-lab-workbench")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "#5142b5",
                        color: "#ffffff",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Launch Lab Above ↑
                    </button>
                    <Link to={environment.href} style={{ fontWeight: 600, fontSize: 12.5, color: "#475569", textDecoration: "none" }}>
                      Open Full Studio →
                    </Link>
                  </div>
                </li>
              ))}
              {ALL_SIX_SANDBOXES.slice(2).map((item) => (
                <li
                  key={item.projectType}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#5142b5", textTransform: "uppercase" }}>
                      In-browser evaluator · {item.courseTitle}
                    </span>
                    <h3 style={{ margin: "4px 0 6px", fontSize: 17, color: "#0f172a" }}>{item.label}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>{item.summary}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSandbox(item.projectType)
                        document.getElementById("live-lab-workbench")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "#5142b5",
                        color: "#ffffff",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Launch Lab Above ↑
                    </button>
                    <Link to={item.studioHref} style={{ fontWeight: 600, fontSize: 12.5, color: "#475569", textDecoration: "none" }}>
                      Open Full Studio →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
