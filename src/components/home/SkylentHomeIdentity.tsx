import { Link } from "react-router-dom"
import { programmeDiscoveryFor } from "../../lib/programme-discovery"
import "./SkylentHomeIdentity.css"

const PROFILE = {
  name: "Written by you",
  headline: "Professional direction you keep",
  role: "The role you are aiming at",
} as const

const PROFILE_LINKS = ["LinkedIn", "GitHub", "Portfolio"] as const

const SKILLS = ["Product thinking", "User research", "Prioritisation", "Specification"] as const

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const

const SURFACE_NAV = ["Learning", "Projects", "Evidence", "Identity"] as const

const HARBOR_NAV = ["Inbox", "Exceptions", "Customers", "Reports"] as const

const HARBOR_TABS = ["Overview", "Issues", "Customers", "Settings"] as const

const HARBOR_ISSUES = ["Late inbound", "Delivery failed", "Weekend exception"] as const

function IconBook() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 2.5h8.2A1.8 1.8 0 0 1 13 4.3v9.2H4.2A1.2 1.2 0 0 1 3 12.3V2.5z" />
      <path d="M3 12.4h9.8" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.5" y="2.5" width="4.4" height="4.4" rx="0.8" />
      <rect x="9.1" y="2.5" width="4.4" height="4.4" rx="0.8" />
      <rect x="2.5" y="9.1" width="4.4" height="4.4" rx="0.8" />
      <rect x="9.1" y="9.1" width="4.4" height="4.4" rx="0.8" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5h5.2L12.5 6v7.5H4V2.5z" />
      <path d="M9.1 2.5V6h3.4" />
    </svg>
  )
}

function IconPerson() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5.4" r="2.3" />
      <path d="M3.4 13.2c.7-2.4 2.3-3.6 4.6-3.6s3.9 1.2 4.6 3.6" />
    </svg>
  )
}

function surfaceIcon(label: string) {
  if (label === "Learning") return <IconBook />
  if (label === "Projects") return <IconGrid />
  if (label === "Evidence") return <IconFile />
  return <IconPerson />
}

function HarborDeskPreview() {
  return (
    <div className="hp-id-desk" aria-hidden="true">
      <div className="hp-id-desk-tabs">
        <span className="hp-id-desk-mark">Harbor Desk</span>
        {HARBOR_TABS.map((tab) => (
          <span key={tab} className={tab === "Overview" ? "is-on" : undefined}>
            {tab}
          </span>
        ))}
      </div>
      <div className="hp-id-desk-body">
        <div className="hp-id-desk-nav">
          {HARBOR_NAV.map((item) => (
            <span key={item} className={item === "Exceptions" ? "is-on" : undefined}>
              {item}
            </span>
          ))}
        </div>
        <div className="hp-id-desk-issues">
          <p>Open issues</p>
          <ul>
            {HARBOR_ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function SkylentHomeIdentity() {
  const programme = programmeDiscoveryFor("product-management")

  return (
    <section className="hp-ch hp-id" aria-labelledby="home-identity-heading">
      <div className="hp-rail hp-id-stage">
        <header className="hp-id-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            06 Identity
          </p>
          <h2 id="home-identity-heading" className="hp-ch-title">
            Your work becomes your story.
          </h2>
          <p className="hp-ch-lead">
            Projects, skills and learning evidence come together to form a professional identity.
          </p>
          <Link className="hp-id-cta" to="/career-os">
            Explore Career OS
            <span aria-hidden="true"> →</span>
          </Link>
          <ol className="hp-id-chain" aria-label="How learning becomes identity">
            {CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </header>

        <article className="hp-id-artifact" aria-labelledby="home-id-artifact-title">
          <header className="hp-id-artifact-head">
            <div>
              <h3 id="home-id-artifact-title">Your Professional Identity</h3>
              <p>Built from your learning, projects and evidence.</p>
            </div>
            <Link className="hp-id-edit" to="/career-os/profile">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M11.4 2.6l1.9 1.9-8.2 8.2H3.2v-1.9l8.2-8.2z" />
                <path d="M10.4 3.6l1.9 1.9" />
              </svg>
              Edit profile
            </Link>
          </header>

          <div className="hp-id-top">
            <section className="hp-id-profile" aria-labelledby="home-id-profile-label">
              <p id="home-id-profile-label" className="hp-id-label">
                Profile
              </p>
              <div className="hp-id-person">
                <span className="hp-id-avatar" aria-hidden="true">
                  <IconPerson />
                </span>
                <dl>
                  <div>
                    <dt>Display name</dt>
                    <dd>{PROFILE.name}</dd>
                  </div>
                  <div>
                    <dt>Headline</dt>
                    <dd>{PROFILE.headline}</dd>
                  </div>
                  <div>
                    <dt>Preferred role</dt>
                    <dd>{PROFILE.role}</dd>
                  </div>
                </dl>
              </div>
              <ul className="hp-id-links" aria-label="Links">
                {PROFILE_LINKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <blockquote className="hp-id-quote">
              <p>Career OS holds a professional identity you write. Nothing is published automatically.</p>
            </blockquote>

            <ol className="hp-id-ia" aria-label="Identity surface">
              {SURFACE_NAV.map((item) => (
                <li key={item} className={item === "Identity" ? "is-on" : undefined}>
                  {surfaceIcon(item)}
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="hp-id-bottom">
            <section className="hp-id-project" aria-labelledby="home-id-project-label">
              <div className="hp-id-project-bar">
                <p id="home-id-project-label" className="hp-id-label">
                  Featured project
                </p>
                <Link className="hp-ch-link" to="/career-os/projects">
                  View all →
                </Link>
              </div>
              <div className="hp-id-project-body">
                <div className="hp-id-project-copy">
                  <p className="hp-id-project-name">Harbor Desk</p>
                  <p className="hp-id-project-meta">Product Management · Case project</p>
                  <p className="hp-id-blurb">
                    Late inbound has no owner before open. The work is a weekend exception queue, specified for
                    review.
                  </p>
                  <Link className="hp-id-project-cta" to="/career-os/projects">
                    View project
                    <span aria-hidden="true"> →</span>
                  </Link>
                </div>
                <HarborDeskPreview />
              </div>
            </section>

            <section className="hp-id-skills" aria-labelledby="home-id-skills-label">
              <p id="home-id-skills-label" className="hp-id-label">
                Skills demonstrated
              </p>
              <ul>
                {SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <p className="hp-id-note">Marked by the Harbor Desk case — not a score.</p>
            </section>

            <section className="hp-id-learn" aria-labelledby="home-id-learn-label">
              <p id="home-id-learn-label" className="hp-id-label">
                Learning evidence
              </p>
              <p className="hp-id-learn-title">{programme?.courseTitle ?? "Product Management"}</p>
              {programme ? (
                <ul className="hp-id-facts">
                  <li>{programme.taughtModules} modules</li>
                  <li>{programme.taughtLessons} lessons</li>
                  {programme.capstone ? <li>{programme.capstone}</li> : null}
                </ul>
              ) : null}
              <Link className="hp-ch-link" to={programme?.href ?? "/programs/product-management"}>
                View programme →
              </Link>
            </section>
          </div>

          <p className="hp-id-foot">Everything here is created and managed in Career OS. Nothing is published automatically.</p>
        </article>
      </div>
    </section>
  )
}
