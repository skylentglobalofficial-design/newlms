import { Link } from "react-router-dom"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import "./SkylentHomeCareerOS.css"

const DESTINATIONS = CAREER_OS_IA.filter((item) => item.label !== "Support")

const HARBOR_EVIDENCE = [
  { label: "Problem", value: "Late inbound has no owner before open." },
  { label: "Decision", value: "Weekend exception queue." },
  { label: "Specification", value: "Ready for review." },
] as const

const HARBOR_SKILLS = ["Product thinking", "User research", "Prioritisation", "Specification"] as const

const NEXT_ACTIONS = [
  {
    label: "Update profile",
    to: "/career-os/profile",
    sub: "Identity, skills, evidence",
  },
  {
    label: "Explore opportunities",
    to: "/career-os/jobs",
    sub: "Roles when partners publish them",
  },
  {
    label: "Track applications",
    to: "/career-os/applications",
    sub: "Track what you submitted",
  },
  {
    label: "Prepare for interviews",
    to: "/career-os/interviews",
    sub: "Rounds and practice",
  },
] as const

function NavGlyph({ label }: { label: string }) {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 }
  if (label === "Projects") {
    return (
      <svg {...s} aria-hidden="true">
        <path d="M4 7h16v12H4z" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    )
  }
  if (label === "Profile") {
    return (
      <svg {...s} aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
  if (label === "Opportunities") {
    return (
      <svg {...s} aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    )
  }
  if (label === "Applications") {
    return (
      <svg {...s} aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    )
  }
  if (label === "Interviews") {
    return (
      <svg {...s} aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
      </svg>
    )
  }
  return (
    <svg {...s} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CareerOSWorkspace() {
  return (
    <div className="hp-cos-work" aria-label="Career OS workspace">
      <header className="hp-cos-work-bar">
        <p className="hp-cos-brand">Skylent OS</p>
        <p className="hp-cos-work-kicker">Career OS</p>
      </header>

      <div className="hp-cos-work-grid">
        <nav className="hp-cos-shell-nav" aria-label="Career OS">
          <p className="hp-cos-shell-title">Career OS</p>
          <ul>
            {CAREER_OS_IA.map((item) => (
              <li key={item.to}>
                <Link className={item.label === "Projects" ? "is-active" : undefined} to={item.to}>
                  <NavGlyph label={item.label} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hp-cos-main">
          <div className="hp-cos-project">
            <div className="hp-cos-project-head">
              <p className="hp-cos-project-kicker">Project</p>
              <Link className="hp-cos-project-view" to="/career-os/projects">
                View project
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
            <p className="hp-cos-project-title">Harbor Desk</p>
            <p className="hp-cos-project-meta">Product Management · Case project</p>
            <p className="hp-cos-project-file">harbor-desk-case.md</p>
          </div>

          <dl className="hp-cos-fields">
            {HARBOR_EVIDENCE.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="hp-cos-skills">
            <p className="hp-cos-skills-label">Skills demonstrated</p>
            <ul>
              {HARBOR_SKILLS.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="hp-cos-next">
            <p className="hp-cos-next-label">Next</p>
            <ol>
              {NEXT_ACTIONS.map((action, index) => (
                <li key={action.to}>
                  <Link to={action.to}>
                    <span>{action.label}</span>
                    <em>{action.sub}</em>
                  </Link>
                  {index < NEXT_ACTIONS.length - 1 ? <i aria-hidden="true">→</i> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkylentHomeCareerOS() {
  return (
    <section className="hp-section hp-cos" aria-labelledby="home-career-os-heading">
      <div className="hp-rail hp-cos-stage">
        <header className="hp-cos-copy">
          <p className="hp-cos-kicker">
            <i aria-hidden="true" />
            Career OS
          </p>
          <h2 id="home-career-os-heading">
            From learning
            <br />
            {"to what's next."}
          </h2>
          <p className="hp-cos-lead">
            {
              "Keep the work you build, the skills it demonstrates, and the career activity that follows — in one place."
            }
          </p>
          <ol className="hp-cos-dest" aria-label="Career OS destinations">
            {DESTINATIONS.map((item, index) => (
              <li key={item.to}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Link to={item.to}>
                  <strong>{item.label}</strong>
                  <em>{item.sub}</em>
                </Link>
              </li>
            ))}
          </ol>
        </header>

        <CareerOSWorkspace />
      </div>

      <div className="hp-rail hp-cos-foot">
        <p>Your work should open doors.</p>
        <Link to="/career-os">Explore Career OS →</Link>
      </div>
    </section>
  )
}
