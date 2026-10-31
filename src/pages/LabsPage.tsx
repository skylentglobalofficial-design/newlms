import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CapabilityRail, PracticePillarSubnav } from "../components/product/Architecture"
import { TrackInteractiveSandbox } from "../components/labs/TrackInteractiveSandbox"
import { LAB_PATHWAY } from "../lib/product-architecture"
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
        <div className="cat-pillar-bar">
          <div className="cat-rail">
            <PracticePillarSubnav current="labs" />
          </div>
        </div>
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Skylent Labs · Browser Workspaces across All 6 Courses</p>
            <h1>Labs live inside the learning path.</h1>
            <p className="cat-lead">
              Every flagship course pairs written lessons with an interactive workspace where you execute queries, audit code pipelines, or defend product specifications before submitting your capstone.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/courses/data-analytics">Open Data Analytics (Northwind SQL Lab)</Link>
              <Link className="cat-btn cat-btn-ghost" to="/courses/product-management">Open Product Management (Harbor Desk Case)</Link>
              <Link className="cat-btn cat-btn-ghost" to="/courses">Browse all 6 courses</Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="labs-live-title">
          <div className="cat-rail">
            <p className="cat-label">Dedicated Course Workspaces</p>
            <h2 id="labs-live-title">Each authored course includes a graded practice environment.</h2>
            <ul className="practice-env">
              {PRACTICE_ENVIRONMENTS.map((environment) => (
                <li key={environment.id}>
                  <p className="cat-label">{environment.statusLabel}</p>
                  <h3>{environment.title}</h3>
                  <p className="cat-fine">{environment.summary}</p>
                  <p className="cat-fine">{environment.tools.join(" · ")}</p>
                  <p className="cat-fine" style={{ marginTop: 8 }}>
                    <Link to={`/courses/${environment.courseSlug}`} style={{ fontWeight: 600, color: "#0f172a" }}>
                      Inspect course curriculum →
                    </Link>
                  </p>
                </li>
              ))}
              {MULTI_TRACK_SANDBOXES.map((item) => (
                <li key={item.projectType}>
                  <p className="cat-label">In-browser evaluator · {item.courseTitle}</p>
                  <h3>{item.label}</h3>
                  <p className="cat-fine">{item.summary}</p>
                  <p className="cat-fine" style={{ marginTop: 8 }}>
                    <Link to={`/courses/${item.courseSlug}`} style={{ fontWeight: 600, color: "#0f172a" }}>
                      Inspect {item.courseTitle} →
                    </Link>
                  </p>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 36, padding: "24px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div>
                  <p className="cat-label" style={{ margin: 0 }}>Live Interactive Sandbox Preview</p>
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

            <p className="cat-label" style={{ marginTop: 32 }}>How a lab fits the path</p>
            <CapabilityRail
              items={[
                { label: "Lab model", status: "live", note: LAB_PATHWAY.map((step) => step.label).join(" → ") },
                {
                  label: "Course-integrated",
                  status: "live",
                  note: "Workspaces open directly from the lessons and capstones that use them.",
                },
              ]}
            />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
