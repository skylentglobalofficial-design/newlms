import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import { MaturityMark } from "../../components/product/Architecture"
import { programmeDiscoveryCards } from "../../lib/programme-discovery"
import "./CareerOS.css"

/**
 * How a finished piece of coursework reaches the career side of the product.
 * Each stage describes behaviour the workspace already implements; the job board
 * stage stays explicit that it is empty until roles are published.
 */
const EVIDENCE_CHAIN = [
  {
    step: "01",
    label: "Learning",
    copy: "You work through an authored course in Skylent OS and finish its capstone.",
  },
  {
    step: "02",
    label: "Project",
    copy: "The capstone is assembled in the project workspace, where the finished artefact lives.",
  },
  {
    step: "03",
    label: "Evidence",
    copy: "You add that artefact to Career OS as a work sample attached to your profile.",
  },
  {
    step: "04",
    label: "Career activity",
    copy: "Your profile, applications and interview rounds are tracked in one place alongside it.",
  },
] as const

/** Real state of each workspace area for someone who has not signed in yet. */
const IA_STATE: Record<string, string> = {
  Opportunities: "Empty until roles are published",
  Projects: "Filled from your finished work",
  Profile: "Yours to write",
  Applications: "Filled from what you submit",
  Interviews: "Filled from scheduled rounds",
  Support: "Request help on the workflow",
}

export default function CareerOSPublicPage() {
  const programmes = programmeDiscoveryCards()

  return (
    <PageShell aurora={false}>
      <div className="cos-public-page">
        <section className="cos-public" aria-labelledby="cos-public-title">
          <div className="sk-rail cos-public-split">
            <div className="cos-public-copy">
              <div className="cos-kicker">
                <span>Career OS</span>
                <MaturityMark maturity="live" />
              </div>
              <h1 id="cos-public-title">Keep your learning evidence in one place.</h1>
              <p className="cos-public-lead">
                Career OS is the workspace for your profile and the work you build while learning. It holds what
                you actually produced &mdash; nothing on this page is a sample feed.
              </p>
              <div className="cos-public-actions">
                <Link to="/login">Sign in to Career OS</Link>
              </div>
              <p className="cos-public-fine">
                Career OS is a workspace, not a placement service. If Opportunities is empty, that is the real
                state.
              </p>
            </div>
            <div className="cos-public-visual">
              <p className="cos-public-caption">Named capstones this chain currently produces</p>
              <ul className="cos-hero-sources">
                {programmes.map((programme) =>
                  programme.capstone ? (
                    <li key={programme.slug}>
                      <strong>{programme.capstone}</strong>
                      <span>
                        from {programme.title} &middot; <code>{programme.material}</code>
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="cos-chain" aria-labelledby="cos-chain-title">
          <div className="sk-rail">
            <p className="cos-eyebrow">FROM COURSEWORK TO CAREER</p>
              <h2 id="cos-chain-title">Here is what happens to the work you produced.</h2>
            <ol className="cos-chain-steps">
              {EVIDENCE_CHAIN.map((stage) => (
                <li key={stage.step}>
                  <p className="cos-chain-step">{stage.step}</p>
                  <p className="cos-chain-label">{stage.label}</p>
                  <p className="cos-chain-copy">{stage.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cos-areas" aria-labelledby="cos-areas-title">
          <div className="sk-rail">
            <p className="cos-eyebrow">IN THE WORKSPACE</p>
            <h2 id="cos-areas-title">What Career OS holds.</h2>
            <ul className="cos-area-list">
              {CAREER_OS_IA.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span className="cos-area-sub">{item.sub}</span>
                  <span className="cos-area-state">{IA_STATE[item.label] ?? "Opens after sign in"}</span>
                </li>
              ))}
            </ul>
            <p className="cos-public-fine">
              Every area above opens after you sign in. None of them are populated with example data.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
