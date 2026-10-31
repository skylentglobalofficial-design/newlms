/**
 * Public entry to Career OS (signed out), repolish.
 *
 * Shows how learning, capstones, and verified credentials connect inside Career OS:
 *   01 Build in Skylent OS -> 02 Assemble Proof-of-Work Dossier -> 03 Organise Roles & Interview Prep
 * Availability comes from src/lib/product-manifest.ts (states from src/lib/truth.ts).
 */
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { ArrowRight } from "../../components/skylent/primitives"
import { CAREER_OS_FEATURES, publicFeatures, type ProductFeature } from "../../lib/product-manifest"
import { CareerJourney } from "../home/Repolish"
import "../HomePage.v2.css"
import "../HomeRepolish.css"
import "./CareerOSPublicRepolish.css"

function FeatureCard({ feature }: { feature: ProductFeature }) {
  const body = (
    <>
      <span className="cpx-card__icon" aria-hidden="true" />
      <h3>{feature.label}</h3>
      <p>{feature.summary}</p>
      <span className={feature.status === "live" ? "cpx-soon cpx-soon--live" : "cpx-soon"}>{statusLabel(feature.status)}</span>
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

const PILLARS = [
  {
    step: "01 · Enrol & Build in Skylent OS",
    title: "Complete 60% of your course modules",
    text: "Start any open programme (Free Pilot Enrolment · No Card Required), run SQL queries on the 166-row Northwind extract, or write a Harbor Desk product specification.",
  },
  {
    step: "02 · Defend Your Capstone Dossier",
    title: "Pass 1 graded capstone & earn a SKL ID",
    text: "Submit your final commercial review or PRD against the 3-tier rubric (25% Checks · 35% Briefs · 40% Capstone) to generate a cryptographic /verify dossier.",
  },
  {
    step: "03 · Unlock Career OS & Career Rise",
    title: "Activate ATS diagnostics & interview prep",
    text: "Once your proof-of-work milestone is verified, unlock your public Career Profile, ATS resume diagnostics, mock interview studio, and application tracker.",
  },
] as const

const SOURCES = [
  { title: "Programmes & Courses", text: "Enrolled lessons, SQL lab work, and finished capstones carry into Career OS.", to: "/programmes" },
  { title: "Your Career Profile", text: "You write your target role, skills, links, and education in your own words.", to: "/career-os/profile" },
  { title: "Verified Certificates", text: "Every completed course issues a verifiable SKL certificate ID anyone can check.", to: "/verify" },
]

const FEATURES = publicFeatures(CAREER_OS_FEATURES).filter((feature) => feature.id !== "next-step")

function statusLabel(status: ProductFeature["status"]): string {
  if (status === "live") return "Available in Career OS"
  if (status === "soon") return "Coming soon"
  if (status === "sample") return "Sample"
  return "In development"
}

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page cpx">
        <section className="cpx-hero" aria-labelledby="cpx-title">
          <div className="sky-container cpx-hero__inner">
            <p className="hx-eyebrow hx-eyebrow--dark">Career OS · Merit-Gated Proof-of-Work Workspace</p>
            <h1 id="cpx-title" className="cpx-h1">
              Your learning, projects and profile, <em>in one place.</em>
            </h1>
            <p className="cpx-lead">
              Bring your course capstones, verified certificates, and target role into a single workspace—unlocked through real execution (60% module completion + 1 graded capstone) rather than empty placement promises.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
                Create free account
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary hx-btn" to="/login" state={{ returnTo: "/career-os" }}>
                Sign in
              </Link>
              <Link className="sk-btn sk-btn-secondary hx-btn" to="/verify">
                Inspect sample dossiers
              </Link>
            </div>
            <ul className="cpx-pillars" aria-label="How you unlock Career OS in 3 steps">
              {PILLARS.map((item) => (
                <li key={item.step} className="cpx-pillar">
                  <span className="cpx-pillar__step">{item.step}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CareerJourney eyebrow="Interactive Walkthrough" showLink={false} />

        <section className="cpx-parts" aria-labelledby="cpx-parts-title">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">Workspace Capabilities</p>
                <h2 id="cpx-parts-title" className="hx-h2">
                  What is live today, <em>and how it unlocks.</em>
                </h2>
              </div>
              <p className="hx-head__aside">
                Every feature below reads its live status from the platform manifest. Career OS unlocks for learners who complete their proof-of-work milestone (or hold an institutional entitlement) and never fabricates scores or placement claims.
              </p>
            </div>
            <ul className="cpx-grid">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </ul>
          </div>
        </section>

        <section className="cpx-flow" aria-labelledby="cpx-flow-title">
          <div className="sky-container">
            <h2 id="cpx-flow-title" className="hx-h2 hx-h2--sm">
              How your work connects <em>to the profile you write.</em>
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
                <span>Target role · Verified capstones · Application tracker</span>
              </div>
            </div>
            <p className="cpx-note">Career OS organises your verified work and applications. It does not promise interviews or guaranteed placement outcomes.</p>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="cpx-close-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="cpx-close-title" className="hx-close__title">
              Start building work <em>you can show.</em>
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
