import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import { Action, SectionIndex, TruthChip } from "../../components/skylent/primitives"
import { truthOf, type Capability } from "../../lib/truth"
import "./CareerOS.css"

/**
 * Public entry to Career OS (signed out). Four capabilities, each with the state recorded in
 * src/lib/truth.ts. No sample profiles, jobs, employers or outcomes are shown.
 */
const CAPABILITIES: Array<{ capability: Capability; name: string; copy: ReactNode }> = [
  {
    capability: "careerProfile",
    name: "Career profile",
    copy: "A target role you write yourself, your education, experience and links, and skills you enter with a proficiency you choose.",
  },
  {
    capability: "projectsAndEvidence",
    name: "Projects and evidence",
    copy: "Capstone projects from the courses you take, with their task progress. Evidence records you can share with a reviewer are not released yet.",
  },
  {
    capability: "certificates",
    name: "Certificates",
    copy: (
      <>
        Issued when every lesson of a course is complete. Anyone with the certificate ID can <Link to="/verify">check it</Link>.
      </>
    ),
  },
  {
    capability: "openings",
    name: "Openings",
    copy: "No openings are published. Saved jobs, applications and interviews stay empty until there are.",
  },
]

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light cosp">
        <div className="sky-container">
          <CareerPublicSubnav current="overview" />
        </div>

        <section className="sky-container cosp-hero" aria-labelledby="cosp-title">
          <div className="cosp-kicker">
            <span className="sky-label">Career OS</span>
          </div>
          <h1 id="cosp-title">Know where you stand, and what to do next.</h1>
          <p className="cosp-lead">
            Career OS is the signed-in workspace that reads your career profile and your learning. It shows your target role, your skills,
            the work you have built and your next step. It is a workspace, not a placement service.
          </p>
          <div className="cosp-actions">
            <Action to="/login">Sign in to Career OS</Action>
            <Action to="/programmes" kind="secondary">
              Explore programmes
            </Action>
          </div>
        </section>

        <section className="sky-container cosp-section" aria-labelledby="cosp-caps-title">
          <SectionIndex n="01" label="What it holds today" />
          <h2 id="cosp-caps-title">Four parts, each marked with its real state.</h2>
          <ul className="cosp-caps">
            {CAPABILITIES.map((item) => (
              <li key={item.capability}>
                <strong>{item.name}</strong>
                <p>{item.copy}</p>
                <TruthChip state={truthOf(item.capability)} />
              </li>
            ))}
          </ul>

          <div className="sky-panel-proof cosp-proof">
            <div className="sky-label">Three different things</div>
            <p>
              A certificate confirms that every lesson of a course was completed. Project evidence is your own work on a project. An
              employment outcome is neither of these, and Career OS does not record or promise one.
            </p>
          </div>
          <p className="cosp-fine">Every area opens after you sign in. None of them is filled with example data.</p>
        </section>
      </div>
    </PageShell>
  )
}
