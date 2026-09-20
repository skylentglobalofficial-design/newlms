import { Link } from "react-router-dom"
import { programmeDiscoveryFor } from "../../lib/programme-discovery"
import "./SkylentHomeIdentity.css"

const PROFILE_FIELDS = [
  { label: "Display name", value: "Written by you" },
  { label: "Headline", value: "Professional direction you keep" },
  { label: "Preferred role", value: "The role you are aiming at" },
  { label: "Links", value: "LinkedIn \u00b7 GitHub \u00b7 portfolio" },
] as const

const SKILLS = ["Product thinking", "User research", "Prioritisation", "Specification"] as const

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const

export default function SkylentHomeIdentity() {
  const programme = programmeDiscoveryFor("product-management")

  return (
    <section className="hp-ch hp-id" aria-labelledby="home-identity-heading">
      <div className="hp-rail">
        <header className="hp-id-open">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            Identity
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
        </header>

        <div className="hp-id-sheet">
          <section className="hp-id-profile" aria-labelledby="home-id-profile-label">
            <p id="home-id-profile-label" className="hp-id-label">
              Profile
            </p>
            <p className="hp-id-profile-lead">
              Career OS holds a professional identity you write: headline, preferred role, skills you keep, and
              links you add.
            </p>
            <dl className="hp-id-fields">
              {PROFILE_FIELDS.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="hp-id-projects" aria-labelledby="home-id-projects-label">
            <p id="home-id-projects-label" className="hp-id-label">
              Projects
            </p>
            <p className="hp-id-project-name">Harbor Desk</p>
            <p className="hp-id-project-meta">Product Management · Case project</p>
            <p className="hp-id-copy">
              A capstone you can add to Career OS. Nothing is published automatically.
            </p>
            <Link className="hp-ch-link" to="/career-os/projects">
              Open projects →
            </Link>
          </section>

          <section className="hp-id-skills" aria-labelledby="home-id-skills-label">
            <p id="home-id-skills-label" className="hp-id-label">
              Skills
            </p>
            <p className="hp-id-copy">Demonstrated by the Harbor Desk case — not a score.</p>
            <ul>
              {SKILLS.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>

          <section className="hp-id-learn" aria-labelledby="home-id-learn-label">
            <p id="home-id-learn-label" className="hp-id-label">
              Learning evidence
            </p>
            <p className="hp-id-project-name">{programme?.courseTitle ?? "Product Management"}</p>
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

        <ol className="hp-id-chain" aria-label="How learning becomes identity">
          {CHAIN.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  )
}
