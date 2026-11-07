/**
 * Public entry to Career OS (signed out) — V32 Interactive Dossier & Crisp White + Royal Purple Card Architecture.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight } from "../../components/skylent/primitives"
import { CAREER_OS_FEATURES, publicFeatures, type ProductFeature } from "../../lib/product-manifest"
import { CareerJourney } from "../home/Repolish"
import "../HomePage.v2.css"
import "../HomeRepolish.css"
import "./CareerOSPublicRepolish.css"

const CARD_META: Record<
  string,
  {
    code: string
    tag: string
    previewLabel: string
    previewValue: string
    svgPath: string
  }
> = {
  profile: {
    code: "01 · Career Profile",
    tag: "Role Alignment",
    previewLabel: "STRUCTURED PROFILE FIELDS",
    previewValue: "Target Role · Domain Focus · GitHub & Portfolio Links · Education",
    svgPath: "M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z",
  },
  skills: {
    code: "02 · Verified Skills",
    tag: "Lab-Backed Skills",
    previewLabel: "EVIDENCE-TAGGED CAPABILITIES",
    previewValue: "SQL Joins & CTEs · Cohort Retention · PRD Scoping · Grounded RAG",
    svgPath: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
  },
  gaps: {
    code: "03 · Skill-Gap Match",
    tag: "Readiness Audit",
    previewLabel: "SKILL COMPARISON ENGINE",
    previewValue: "Matched Skills vs. Missing Role Requirements → Direct Module Link",
    svgPath: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
  },
  learning: {
    code: "04 · Course Progress",
    tag: "Curriculum Gate",
    previewLabel: "LIVE COMPLETION TRACKER",
    previewValue: "5 Modules · 15 Lessons · 3 Concept Quizzes · 60% Career Rise Gate",
    svgPath: "M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
  },
  practice: {
    code: "05 · Lab Work",
    tag: "Saved Lab Work",
    previewLabel: "IN-BROWSER STUDIO SNAPSHOTS",
    previewValue: "Saved Northwind SQL Queries · Harbor Desk Triage Notes · Pytest Logs",
    svgPath: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13H6v-2h6v2zm6-4H6v-2h12v2zm0-4H6V7h12v2z",
  },
  projects: {
    code: "06 · Capstone Projects",
    tag: "5-Dimension Rubric",
    previewLabel: "FACULTY-REVIEWED DELIVERABLES",
    previewValue: "Northwind Commercial Review · Harbor Desk 6-Week PRD · V1→V2 Revision",
    svgPath: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  },
  evidence: {
    code: "07 · EXECUTION FLIGHT RECORDER",
    tag: "Reviewer Proof",
    previewLabel: "VERIFIABLE WORK SAMPLES",
    previewValue: "Finding · Why It Matters · Executive Recommendation · Attached SQL",
    svgPath: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  },
  certificates: {
    code: "08 · VERIFIABLE SKL CREDENTIALS",
    tag: "Public /verify ID",
    previewLabel: "CRYPTOGRAPHIC VERIFICATION",
    previewValue: "Course & Programme Master Certificates · Direct LinkedIn Share",
    svgPath: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z",
  },
  opportunities: {
    code: "09 · SKILL-MATCHED OPENINGS",
    tag: "Direct Shortlist",
    previewLabel: "MERIT-GATED APPLICATION PIPELINE",
    previewValue: "Role Match Breakdown · Direct Mock Interview Defense · Saved Jobs",
    svgPath: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
  },
}

function statusLabel(status: ProductFeature["status"]): string {
  if (status === "live") return "✓ Unlocks at 60% Course Progress"
  if (status === "soon") return "Coming soon"
  if (status === "sample") return "Interactive Preview"
  return "In development"
}

function FeatureCard({ feature, index }: { feature: ProductFeature; index: number }) {
  const meta = CARD_META[feature.id] ?? {
    code: `0${index + 1} · CAREER OS MODULE`,
    tag: "Portfolio Tool",
    previewLabel: "INCLUDED IN CAREER OS",
    previewValue: "Connected to your Skylent OS coursework and graded labs.",
    svgPath: "M12 2L2 7l10 5 10-5-10-5zm0 7.5l-6-3 6-3 6 3-6 3z",
  }

  const body = (
    <>
      <div className="cpx-card__head">
        <span className="cpx-card__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d={meta.svgPath} />
          </svg>
        </span>
        <div className="cpx-card__badges">
          <span className="cpx-card__code">{meta.code}</span>
          <span className="cpx-card__tag">{meta.tag}</span>
        </div>
      </div>

      <h3>{feature.label}</h3>
      <p>{feature.summary}</p>

      <div className="cpx-card__preview">
        <span>{meta.previewLabel}</span>
        <strong>{meta.previewValue}</strong>
      </div>

      <div className="cpx-card__foot">
        <span className={feature.status === "live" ? "cpx-soon cpx-soon--live" : "cpx-soon"}>
          {statusLabel(feature.status)}
        </span>
        <span className="cpx-card__go">Inspect →</span>
      </div>
    </>
  )

  if (!feature.route || feature.route.includes(":")) {
    return <li className="cpx-card">{body}</li>
  }
  return (
    <li className="cpx-card">
      <Link to={feature.route}>{body}</Link>
    </li>
  )
}

const SOURCES = [
  { title: "6 Live Courses & Programmes", text: "Complete 60% of any authored course to unlock Career Rise and carry graded capstones into your portfolio.", to: "/courses" },
  { title: "Verified Skill-Gap Match", text: "Compare your verified skills against target roles with live match percentages and missing-skill badges.", to: "/career-os/profile" },
  { title: "Verifiable Project Certificates", text: "Attach publicly verifiable Course and Programme Master certificates (/verify) with project summaries.", to: "/verify" },
]

const FEATURES = publicFeatures(CAREER_OS_FEATURES).filter((feature) => feature.id !== "next-step")

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page cpx">
        <section className="cpx-hero" aria-labelledby="cpx-title">
          <div className="sky-container cpx-hero__split">
            <div className="cpx-hero__inner">
              <p className="hx-eyebrow hx-eyebrow--dark">Career OS · Verified Proof-of-Work &amp; Role Readiness</p>
              <h1 id="cpx-title" className="cpx-h1">
                Turn your lab work and capstones into <em>verifiable hiring proof.</em>
              </h1>
              <p className="cpx-lead">
                Resumes claim skills; Career OS proves them. As you execute SQL queries, Python pipelines, and product specs in Skylent OS, Career OS compiles your graded artefacts, 5-dimension rubric scores, and public `/verify` credentials into one recruiter-verifiable dossier.
              </p>
              <div className="hx-hero__actions">
                <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
                  Create your account
                  <ArrowRight />
                </Link>
                <Link className="sk-btn sk-btn-secondary hx-btn" to="/verify/SKL-2026-DA-EXEMPLAR">
                  Inspect live exemplar dossier
                </Link>
                <Link className="sk-btn sk-btn-secondary hx-btn" to="/login" state={{ returnTo: "/career-os" }}>
                  Sign in
                </Link>
              </div>
            </div>

            {/* Right-Hand Interactive Proof-of-Work Dossier Preview Card */}
            <aside className="cpx-dossier-preview" aria-label="Sample Career OS Proof-of-Work Dossier">
              <div className="cpx-dossier-preview__top">
                <div>
                  <span className="cpx-dossier-preview__eyebrow">EXEMPLAR CAREER OS DOSSIER · PUBLIC /VERIFY</span>
                  <strong>Northwind Commercial Margin &amp; SQL Audit</strong>
                </div>
                <span className="cpx-dossier-preview__badge">✓ Verified Artefact</span>
              </div>
              <div className="cpx-dossier-preview__rubric">
                {[
                  ["Knowledge", "15%"],
                  ["Execution", "30%"],
                  ["Judgement", "20%"],
                  ["Oral Defence", "15%"],
                  ["V1→V2 Revision", "20%"],
                ].map(([dim, wt]) => (
                  <div key={dim}>
                    <span>{dim}</span>
                    <strong>{wt}</strong>
                  </div>
                ))}
              </div>
              <div className="cpx-dossier-preview__rows">
                <div>
                  <span>ATTACHED LAB EVIDENCE</span>
                  <p>166 validated Northwind order rows · Category discount leakage SQL query · 3-point executive memo</p>
                </div>
                <div>
                  <span>VERIFIED SKILLS UNLOCKED</span>
                  <div className="cpx-dossier-preview__pills">
                    <span>PostgreSQL &amp; CTEs</span>
                    <span>Data Hygiene</span>
                    <span>Margin Analysis</span>
                    <span>Executive Synthesis</span>
                  </div>
                </div>
              </div>
              <div className="cpx-dossier-preview__foot">
                <code>skylent.live/verify/SKL-2026-DA-EXEMPLAR</code>
                <Link to="/verify/SKL-2026-DA-EXEMPLAR">Open live dossier →</Link>
              </div>
            </aside>
          </div>

          <div className="sky-container">
            <div className="cpx-pillars" aria-label="Career OS 3-Pillar Architecture">
              <div className="cpx-pillar">
                <span>01 · Execute in Skylent OS Labs</span>
                <strong>Build Real Artefacts, Not Attendance Badges</strong>
                <p>Write real SQL queries on 166 retail rows, scope 6-week engineering PRDs, and run LLM accuracy evaluations inside browser sandboxes.</p>
              </div>
              <div className="cpx-pillar">
                <span>02 · Pass the 60% Merit Gate</span>
                <strong>Unlock Career Rise &amp; V1 → V2 Faculty Review</strong>
                <p>Reach 60% course completion to unlock Career Rise, Guided Mock Interview Defense, and human faculty red-line critique on your capstone.</p>
              </div>
              <div className="cpx-pillar">
                <span>03 · Share Verifiable Proof</span>
                <strong>Public Flight Recorder on /verify</strong>
                <p>Attach your cryptographically verifiable SKL certificate and saved work samples so hiring teams can inspect your actual execution in one click.</p>
              </div>
            </div>
          </div>
        </section>

        <CareerJourney eyebrow="Step-by-step career journey" showLink={false} />

        <section className="cpx-parts" aria-labelledby="cpx-parts-title">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Inside the Career OS Workspace · 9 Connected Modules</p>
                <h2 id="cpx-parts-title" className="hx-h2">
                  Every tool required to turn coursework <em>into verified proof.</em>
                </h2>
              </div>
              <p className="hx-head__aside">
                Each module connects directly to the lessons, browser labs, and capstones you complete inside Skylent OS.
              </p>
            </div>
            <ul className="cpx-grid">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} />
              ))}
            </ul>
          </div>
        </section>

        <section className="cpx-flow" aria-labelledby="cpx-flow-title">
          <div className="sky-container">
            <h2 id="cpx-flow-title" className="hx-h2 hx-h2--sm">
              What sits beside <em>the profile you build.</em>
            </h2>
            <div className="cpx-flow__row">
              <ul className="cpx-sources">
                {SOURCES.map((source) => (
                  <li key={source.title}>
                    <Link to={source.to}>
                      <b>{source.title}</b>
                      <span>{source.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="cpx-arrow" aria-hidden="true">
                <span />
              </div>
              <div className="cpx-hub">
                <b>Career OS</b>
                <span>Profile · Verified Projects · Role Skill-Gap Match</span>
              </div>
            </div>
            <p className="cpx-note">Career Rise unlocks automatically at 60% course completion so every role application is backed by verified work.</p>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="cpx-close-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="cpx-close-title" className="hx-close__title">
              Sign in to build <em>your profile.</em>
            </h2>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
                Explore programmes
                <ArrowRight />
              </Link>
              <Link className="sk-btn hx-btn hx-btn--ghost" to="/login" state={{ returnTo: "/career-os" }}>
                Sign in to Career OS
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
