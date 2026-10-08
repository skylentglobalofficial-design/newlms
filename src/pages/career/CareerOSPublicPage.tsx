import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import CareerOSSpecimen from "../../components/product/CareerOSSpecimen"
import { Action, SectionIndex, TruthChip } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { CAREER_OS_FEATURES, publicFeatures } from "../../lib/product-manifest"
import "./CareerOS.css"
import "./CareerOSPublic.css"
import "../cine.css"

/**
 * Public entry to Career OS (signed out). The workspace plate and the list of parts are drawn from
 * src/lib/product-manifest.ts, the same source the signed-in Career OS overview reads, with each
 * state read from src/lib/truth.ts. No sample profiles, jobs, employers or outcomes are shown.
 */
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"]

/** A route a signed-out visitor can open (the workspace routes all need an account). */
function publicRoute(route: string | null): string | null {
  if (!route || route.includes(":")) return null
  return /^\/(career-os|dashboard|learn|os)(\/|$)/.test(route) ? null : route
}

const THREE_THINGS: Array<{ name: string; copy: string }> = [
  { name: "A certificate", copy: "Confirms that every lesson of a course was completed." },
  { name: "Project evidence", copy: "Is your own work on a project." },
  { name: "An employment outcome", copy: "Is neither of these, and Career OS does not record or promise one." },
]

export default function CareerOSPublicPage() {
  const parts = publicFeatures(CAREER_OS_FEATURES)
  return (
    <PageShell aurora={false}>
      <div className="site-light cosp">
        <div className="sky-container">
          <CareerPublicSubnav current="overview" />
        </div>

        <section className="sky-container cosp-hero cop-hero" aria-labelledby="cosp-title">
          <div className="cosp-kicker cine-in cine-in--fade">
            <span className="sky-label">Career OS</span>
          </div>
          <h1 id="cosp-title" className="sky-display cop-h1 cine-in cine-d1">
            Turn learning into <em>evidence you can use.</em>
          </h1>
          <div className="cop-hero__row">
            <p className="cosp-lead cop-lead cine-in cine-d2">
              Career OS is the signed-in workspace that reads your career profile and your learning. It shows your target role, your skills,
              the work you have built and your next step. It is a workspace, not a placement service.
            </p>
            <div className="cosp-actions cop-actions cine-in cine-d3">
              <Action to="/login">Sign in to Career OS</Action>
              <Action to="/programmes" kind="secondary">
                Explore programmes
              </Action>
            </div>
          </div>
        </section>

        <section className="sky-stage sky-band-navy cop-stage" aria-labelledby="cop-stage-title">
          <div className="sky-container cop-stage__inner">
            <Reveal className="cop-stage__head">
              <div>
                <SectionIndex n="01" label="The workspace" />
                <h2 id="cop-stage-title" className="sky-display sky-display--md cop-h2">
                  Your role, your skills and the work you can show, <em>on one screen.</em>
                </h2>
              </div>
              <p className="cop-stage__side">
                Each part of the workspace states what it is: entered by you, read from your course, in development or coming soon.
              </p>
            </Reveal>

            <Reveal as="figure" variant="plate" delay={120} className="cop-stage__figure">
              <div className="sky-stage__plate cop-stage__plate cine-plate">
                <CareerOSSpecimen />
              </div>
              <figcaption className="sky-stage__caption">
                <span>FIG. 01 · Career OS overview</span>
                <span>Example labels. Not a learner's record. Yours starts empty.</span>
              </figcaption>
            </Reveal>
          </div>
        </section>

        <Reveal as="section" className="sky-container cosp-section cop-section" aria-labelledby="cosp-caps-title">
          <div className="cop-split">
            <div className="cop-split__lead">
              <SectionIndex n="02" label="What it holds today" />
              <h2 id="cosp-caps-title" className="sky-display sky-display--md cop-h2">
                {NUMBER_WORDS[parts.length] ?? parts.length} parts, each marked with its real state.
              </h2>
            </div>
            <ul className="cosp-caps cop-caps">
              {parts.map((item) => {
                const to = publicRoute(item.route)
                return (
                  <li key={item.id}>
                    <strong>{item.label}</strong>
                    <p>
                      {item.summary}
                      {to ? (
                        <>
                          {" "}
                          <Link to={to} aria-label={`Open ${item.label}`}>
                            Open
                          </Link>
                        </>
                      ) : null}
                    </p>
                    <TruthChip state={item.status} />
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>

        <section className="sky-band-proof cop-proof" aria-labelledby="cop-three-title">
          <Reveal className="sky-container">
            <SectionIndex n="03" label="Three different things" />
            <h2 id="cop-three-title" className="sky-display sky-display--md cop-h2">
              A certificate, project evidence and an employment outcome are three different things.
            </h2>
            <ul className="cop-three">
              {THREE_THINGS.map((item, index) => (
                <li key={item.name}>
                  <span className="sky-label">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.name}</strong>
                  <p>{item.copy}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="sky-stage sky-band-navy cop-close" aria-labelledby="cop-close-title">
          <Reveal className="sky-container cop-close__inner">
            <div className="cop-close__lead">
              <p className="sky-label">Next step · Sign in</p>
              <h2 id="cop-close-title" className="sky-display sky-display--lg cop-close__title">
                Every area opens after you sign in. <em>None is filled with example data.</em>
              </h2>
            </div>
            <Reveal delay={180} className="cosp-actions cop-actions">
              <Action to="/login">Sign in to Career OS</Action>
              <Action to="/programmes" kind="secondary">
                Explore programmes
              </Action>
            </Reveal>
          </Reveal>
        </section>
      </div>
    </PageShell>
  )
}
