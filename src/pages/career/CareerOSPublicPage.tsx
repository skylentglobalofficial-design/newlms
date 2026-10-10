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
import { CAREER_OS_FEATURES, type ProductFeature } from "../../lib/product-manifest"
import { CareerJourney } from "../home/Repolish"
import "../HomePage.v2.css"
import "../HomeRepolish.css"
import "./CareerOSPublicRepolish.css"

type Part = { id: string; title: string; text: string }

const PARTS: Part[] = [
  { id: "profile", title: "Career profile", text: "Your target role, education, experience and links, written by you." },
  { id: "skills", title: "Skills", text: "The skills you can show, with the level you choose for each." },
  { id: "learning", title: "Learning", text: "Your programmes, progress and the next lesson, read from your enrolments." },
  { id: "projects", title: "Projects and evidence", text: "Capstones from your programmes, kept with what they show and your reflection." },
  { id: "certificates", title: "Certificates", text: "Issued when every lesson of a course is complete, with a code anyone can check." },
  { id: "opportunities", title: "Applications", text: "Track the roles you apply to and prepare for interviews." },
]

const SOURCES = [
  { title: "Degrees", text: "Add your UG or PG study to your profile.", to: "/education" },
  { title: "Programmes", text: "Lessons and progress flow in as you learn.", to: "/programmes" },
  { title: "Labs and projects", text: "Finished work becomes evidence.", to: "/programmes#professional" },
]

function statusOf(id: string): ProductFeature["status"] | null {
  return CAREER_OS_FEATURES.find((feature) => feature.id === id)?.status ?? null
}

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page cpx">
        <section className="cpx-hero" aria-labelledby="cpx-title">
          <div className="sky-container cpx-hero__inner">
            <p className="hx-eyebrow hx-eyebrow--dark">Career OS</p>
            <h1 id="cpx-title" className="cpx-h1">
              Your learning, projects and profile, <em>in one place.</em>
            </h1>
            <p className="cpx-lead">
              Career OS starts the day you enrol. It keeps what you learn and build, turns it into a profile you can show, and helps
              you prepare for what comes next.
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
          </div>
        </section>

        <CareerJourney eyebrow="How it works" showLink={false} />

        <section className="cpx-parts" aria-labelledby="cpx-parts-title">
          <div className="sky-container">
            <div className="hx-head">
              <div>
                <p className="hx-eyebrow hx-eyebrow--dark">What's inside</p>
                <h2 id="cpx-parts-title" className="hx-h2">
                  Everything about your progress, <em>together.</em>
                </h2>
              </div>
            </div>
            <ul className="cpx-grid">
              {PARTS.map((part) => {
                const status = statusOf(part.id)
                const soon = status !== null && status !== "live"
                return (
                  <li key={part.id} className="cpx-card">
                    <span className="cpx-card__icon" aria-hidden="true" />
                    <h3>{part.title}</h3>
                    <p>{part.text}</p>
                    {soon ? <span className="cpx-soon">{status === "development" ? "In development" : "Coming soon"}</span> : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="cpx-flow" aria-labelledby="cpx-flow-title">
          <div className="sky-container">
            <h2 id="cpx-flow-title" className="hx-h2 hx-h2--sm">
              Whatever you study, it feeds <em>one profile.</em>
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
                <span>Profile · Projects · Evidence · Applications</span>
              </div>
            </div>
            <p className="cpx-note">Career OS helps you prepare. It does not promise interviews, jobs or salaries.</p>
          </div>
        </section>

        <section className="hx-close" aria-labelledby="cpx-close-title">
          <div className="hx-hero__glow" aria-hidden="true" />
          <div className="sky-container hx-close__inner">
            <h2 id="cpx-close-title" className="hx-close__title">
              Enrol once. <em>Keep everything you build.</em>
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
