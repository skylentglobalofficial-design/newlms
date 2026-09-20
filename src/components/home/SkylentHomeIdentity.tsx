import { Link } from "react-router-dom"

export default function SkylentHomeIdentity() {
  return (
    <section className="hp-ch hp-id" aria-labelledby="home-identity-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Identity
        </p>
        <h2 id="home-identity-heading" className="hp-ch-title">
          Your work becomes part of your professional identity.
        </h2>
        <p className="hp-id-claim">{"I built this. This is what it demonstrates. This becomes part of my profile."}</p>

        <div className="hp-id-surface">
          <div className="hp-id-col">
            <p>Profile</p>
            <b>
              <Link className="hp-ch-link" to="/career-os/profile">
                Who you are
              </Link>
            </b>
            <span>Display name, headline, and the skills you choose to keep. Written by you.</span>
          </div>
          <div className="hp-id-col">
            <p>Projects</p>
            <b>
              <Link className="hp-ch-link" to="/career-os/projects">
                Harbor Desk
              </Link>
            </b>
            <em>Product Management · case project</em>
            <span>{"A capstone you can add to Career OS. Nothing is published automatically."}</span>
          </div>
          <div className="hp-id-col">
            <p>Skills</p>
            <b>Demonstrated by work</b>
            <span>Product discovery, problem framing, prioritisation, business communication.</span>
          </div>
          <div className="hp-id-col">
            <p>Learning evidence</p>
            <b>From enrolments</b>
            <span>{"Pulled from LMS enrolments. Submitted work is yours to keep."}</span>
          </div>
          <div className="hp-id-col">
            <p>Links</p>
            <b>Where you point</b>
            <span>LinkedIn, GitHub, portfolio, or other — only what you add.</span>
          </div>
        </div>

        <p className="hp-id-foot">
          Career OS holds profile, projects, opportunities, applications, interviews, and support.{" "}
          <Link className="hp-ch-link" to="/career-os">
            Open Career OS →
          </Link>
        </p>
      </div>
    </section>
  )
}
