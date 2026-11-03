/**
 * Public entry to Career OS (signed out), repolish.
 *
 * Career OS is shown as the learner's journey after enrolment (the same walkthrough as the
 * homepage, home/Repolish.tsx), then what is inside it, then how degrees, programmes and labs all
 * feed it. Availability comes from src/lib/product-manifest.ts (states from src/lib/truth.ts):
 * anything not available yet says "Coming soon". No sample profiles, jobs, employers, scores or
 * outcomes are shown, and nothing promises a placement.
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

const SOURCES = [
  { title: "6 Live Courses & Programmes", text: "Complete 60% of any authored course to unlock Career Rise and carry graded capstones into your portfolio.", to: "/courses" },
  { title: "Verified Skill-Gap Match", text: "Compare your verified skills against target roles with live match percentages and missing-skill badges.", to: "/career-os/profile" },
  { title: "Verifiable Project Certificates", text: "Attach publicly verifiable Course and Programme Master certificates (/verify) with project summaries.", to: "/verify" },
]

const FEATURES = publicFeatures(CAREER_OS_FEATURES).filter((feature) => feature.id !== "next-step")

function statusLabel(status: ProductFeature["status"]): string {
  if (status === "live") return "Unlocks at 60% Course Progress"
  if (status === "soon") return "Coming soon"
  if (status === "sample") return "Interactive Preview"
  return "In development"
}

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page cpx">
        <section className="cpx-hero" aria-labelledby="cpx-title">
          <div className="sky-container cpx-hero__inner">
            <p className="hx-eyebrow hx-eyebrow--dark">Career OS · Verified Portfolio &amp; Role Matching</p>
            <h1 id="cpx-title" className="cpx-h1">
              Your learning, projects and profile, <em>in one place.</em>
            </h1>
            <p className="cpx-lead">
              Career OS is your workspace for building a recruiter-ready project portfolio, checking how your skills match open roles, and practising mock interview questions. It unlocks automatically once you complete 60% of any course.
            </p>
            <div className="hx-hero__actions">
              <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
                Create your account
                <ArrowRight />
              </Link>
              <Link className="sk-btn sk-btn-secondary hx-btn" to="/login" state={{ returnTo: "/career-os" }}>
                Sign in
              </Link>
            </div>
            <div className="cpx-pillars" aria-label="Career OS 3-Pillar Architecture">
              <div className="cpx-pillar">
                <span>01 · Build in Skylent OS</span>
                <p>Write real SQL queries, Python scripts, and Harbor Desk product specs inside graded browser labs.</p>
              </div>
              <div className="cpx-pillar">
                <span>02 · Keep Verified Proof</span>
                <p>Unlock Career Rise at 60% course progress and attach publicly verifiable project certificates (/verify).</p>
              </div>
              <div className="cpx-pillar">
                <span>03 · Apply with Confidence</span>
                <p>Check your skill-gap match against target roles and rehearse timed mock interview questions before you apply.</p>
              </div>
            </div>
          </div>
        </section>

        <CareerJourney eyebrow="Step-by-step career journey" showLink={false} />

        <section className="cpx-parts" aria-labelledby="cpx-parts-title">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What's inside</p>
                <h2 id="cpx-parts-title" className="hx-h2">
                  Verified portfolio tools <em>and career readiness.</em>
                </h2>
              </div>
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
