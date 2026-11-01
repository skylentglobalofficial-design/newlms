import { Link, useLocation } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import { ArrowRight } from "../../components/skylent/primitives"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import "./CareerOS.css"

const AREA_PREVIEWS: Record<string, { kicker: string; sampleTitle: string; bullets: string[] }> = {
  profile: {
    kicker: "Sample Career Profile Preview",
    sampleTitle: "Target Role, Verified Skills & Academic Record",
    bullets: [
      "Target Role: Associate Data Analyst / Product Analyst",
      "Verified Skills: SQL Joins, Window Functions, Cohort Analysis, PRD Scoping",
      "Attached Credentials: SKL-2026-DA-EXEMPLAR (96/100 Graded Capstone)",
    ],
  },
  projects: {
    kicker: "Sample Proof-of-Work Dossier Preview",
    sampleTitle: "Northwind Commercial Margin & Discount Leakage Audit",
    bullets: [
      "Dataset Audited: 166 validated retail order lines (₹8,12,020 net revenue)",
      "Key Finding: Isolated 14.5% unapproved promotional discount leakage in Apparel",
      "Verification: Publicly verifiable via /verify with full rubric breakdown",
    ],
  },
  jobs: {
    kicker: "Sample Role Discovery Preview",
    sampleTitle: "Skill-Matched Opportunities & Role Requirements",
    bullets: [
      "Compare your completed SQL, Product, and GenAI modules against role skill requirements",
      "Bookmark target roles and prepare your capstone evidence before applying",
    ],
  },
  applications: {
    kicker: "Sample Application Tracker Preview",
    sampleTitle: "Structured Pipeline: Saved → Applied → Interviewing",
    bullets: [
      "Organise every role you apply to with dates, notes, and attached proof-of-work links",
      "Keep follow-up reminders and interview preparation notes connected to each application",
    ],
  },
  interviews: {
    kicker: "Sample Interview Prep Preview",
    sampleTitle: "SQL, Case Cold Call & Behavioural Practice",
    bullets: [
      "Practise defending your Northwind SQL queries and Harbor Desk PRD trade-offs",
      "Review structured rubric feedback before your real technical and product rounds",
    ],
  },
  support: {
    kicker: "Sample Career Support Preview",
    sampleTitle: "Resume & Portfolio Review Requests",
    bullets: [
      "Request structured feedback on your Career OS profile and capstone narratives",
      "Track open action items and faculty mentor notes in one place",
    ],
  },
}

function areaFromPath(pathname: string) {
  const match = CAREER_OS_IA.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  return match ?? null
}

function subnavId(pathname: string): string {
  return areaFromPath(pathname)?.id ?? "overview"
}

export default function CareerOSPublicAreaPage() {
  const { pathname } = useLocation()
  const area = areaFromPath(pathname)
  const navId = subnavId(pathname)
  const preview = AREA_PREVIEWS[navId] ?? AREA_PREVIEWS.profile

  if (!area) {
    return (
      <PageShell aurora={false}>
        <div className="cos-public-page">
          <div className="sk-rail">
            <CareerPublicSubnav current={navId} />
            <p className="cos-public-lead">This Career OS destination is not recognised.</p>
            <Link to="/career-os">Back to Career OS overview</Link>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <div className="cos-public-page">
        <section className="cos-public-area" aria-labelledby="cos-area-title">
          <div className="sk-rail">
            <CareerPublicSubnav current={navId} />
            <p className="cos-eyebrow">CAREER OS · WORKSPACE PREVIEW</p>
            <h1 id="cos-area-title">{area.label}</h1>
            <p className="cos-public-lead">{area.sub}</p>

            <div
              style={{
                margin: "24px 0",
                padding: "22px 24px",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 10px 28px -16px rgba(15, 23, 42, 0.08)",
                maxWidth: 680,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142b5" }}>
                {preview.kicker}
              </span>
              <h2 style={{ margin: "6px 0 12px", fontSize: 19, fontWeight: 750, color: "#0f172a" }}>
                {preview.sampleTitle}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 14.5, lineHeight: 1.55, color: "#334155" }}>
                {preview.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <p className="cos-public-fine">
              Sign in to access your personal Career OS workspace, or inspect live verified exemplar dossiers on the verification page.
            </p>
            <div className="cos-public-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
              <Link className="sk-btn sk-btn-primary" to="/login" state={{ returnTo: pathname }}>
                Sign in to open {area.label}
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary" to="/verify">
                Inspect Verified Dossiers (/verify)
              </Link>
              <Link className="sk-btn sk-btn-secondary" to="/career-os">
                Career OS Overview
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
