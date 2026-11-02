import { Link, useLocation } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import "./CareerOS.css"

const AREA_PREVIEW_ITEMS: Record<
  string,
  {
    kicker: string
    headline: string
    bullets: readonly string[]
  }
> = {
  profile: {
    kicker: "Career Profile Preview",
    headline: "Your target role, verified skills, and cryptographic credentials in one place.",
    bullets: [
      "Target Role & Readiness: Set your primary role focus (e.g., Data Analyst, Associate PM, Full-Stack Engineer).",
      "Verified Skills Matrix: Skills backed by graded SQL queries, Python pipelines, or PRD capstones.",
      "Public Credential Links: Direct verification links (/verify) that recruiters can audit in one click.",
    ],
  },
  projects: {
    kicker: "Projects & Evidence Preview",
    headline: "Every capstone and applied brief you complete in Skylent OS, organised as proof of work.",
    bullets: [
      "Northwind SQL Audit: 166-row revenue and promotional margin analysis with executive memo.",
      "Harbor Desk PRD Studio: 6-week engineering scope, user interview synthesis, and acceptance criteria.",
      "Code & Architecture Dossiers: Python ETL validation suites and Grounded RAG evaluation benchmarks.",
    ],
  },
  jobs: {
    kicker: "Skill-Matched Opportunities Preview",
    headline: "Partner roles matched directly against the skills you have proved in your coursework.",
    bullets: [
      "Transparent Skill-Match Breakdown: See which required skills your completed modules already cover.",
      "Direct Dossier Attachment: Attach your verified Skylent capstone record alongside your application.",
      "Zero Fake Listings: Only verified employer partner roles are listed.",
    ],
  },
  applications: {
    kicker: "Application Pipeline Preview",
    headline: "Track every role application, attached capstone evidence, and interview stage.",
    bullets: [
      "Stage-by-Stage Tracker: Applied → Screening → Technical Case → Final Decision.",
      "Evidence Mapping: Record exactly which Skylent project or certificate was shared with each employer.",
      "Follow-Up Timeline: Keep structured notes and next actions for every opportunity.",
    ],
  },
  interviews: {
    kicker: "Interview & Cold Call Prep Preview",
    headline: "Rehearse technical SQL, product trade-off, and architecture defenses before your interview.",
    bullets: [
      "Boardroom Cold Call Drills: Practice defending your capstone trade-offs under time constraints.",
      "Role-Specific Question Banks: Curated analytical, product, and engineering prompts.",
      "Structured Self-Review: Compare your written responses against senior practitioner rubrics.",
    ],
  },
  support: {
    kicker: "Career Workflow Support Preview",
    headline: "Get structured feedback on your capstone portfolio, resume alignment, and interview prep.",
    bullets: [
      "Portfolio & Dossier Review: Ensure your capstone findings read clearly to hiring managers.",
      "Role Alignment Guidance: Map your existing background + Skylent projects to target roles.",
      "Actionable Task Checklists: Clear milestones before you submit applications.",
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

  const preview = AREA_PREVIEW_ITEMS[area.id] ?? AREA_PREVIEW_ITEMS.profile

  return (
    <PageShell aurora={false}>
      <div className="cos-public-page">
        <section className="cos-public-area" aria-labelledby="cos-area-title">
          <div className="sk-rail">
            <CareerPublicSubnav current={navId} />
            <p className="cos-eyebrow">CAREER OS · WORKSPACE PREVIEW</p>
            <h1 id="cos-area-title">{area.label}</h1>
            <p className="cos-public-lead">{preview.headline}</p>

            <div
              style={{
                marginTop: 20,
                marginBottom: 24,
                padding: "22px 24px",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142B5", marginBottom: 10 }}>
                {preview.kicker} · What You Build Inside {area.label}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, color: "#334155", fontSize: 14.5, lineHeight: 1.55 }}>
                {preview.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>

            <div className="cos-public-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="sk-btn sk-btn-primary" to="/login" state={{ returnTo: pathname }}>
                Sign in to open {area.label} →
              </Link>
              <Link className="sk-btn sk-btn-secondary" to="/verify">
                Inspect Sample Graduate Dossiers (/verify)
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
