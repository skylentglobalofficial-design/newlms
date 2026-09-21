import { Link } from "react-router-dom"
import { EXAMS_NAV, MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeExams.css"

const EXAMS_HREF = "/exams"

const RING = [
  { id: "goal", label: "Goal", x: 50, y: 8 },
  { id: "prep", label: "Preparation", x: 86, y: 50 },
  { id: "practice", label: "Practice", x: 50, y: 92 },
  { id: "ready", label: "Readiness", x: 14, y: 50 },
] as const

export default function SkylentHomeExams() {
  return (
    <section className="hp-ch hp-examx" aria-labelledby="home-exams-heading">
      <div className="hp-rail hp-ch-split hp-exam-stage">
        <header className="hp-ch-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            14 Exams
          </p>
          <h2 id="home-exams-heading" className="hp-ch-title">
            Prepare for what comes next.
          </h2>
          <p className="hp-ch-lead">
            Structured preparation for competitive exams, with learning, practice and revision working together.
          </p>
          <p className="hp-ch-soon-pill">{MATURITY_LABEL.coming_soon}</p>
          <Link className="hp-ch-cta" to={EXAMS_HREF}>
            Explore exams
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-exam-visual">
          <div className="hp-exam-orbit" aria-label="Goal to readiness">
            <svg className="hp-exam-ring" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="72" />
            </svg>
            <p className="hp-exam-core">
              Your
              <br />
              preparation
            </p>
            {RING.map((node) => (
              <span
                key={node.id}
                className={`hp-exam-node is-${node.id}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {node.label}
              </span>
            ))}
          </div>
          <p className="hp-exam-quiet">
            Competitive exams · {MATURITY_LABEL.coming_soon}
          </p>
          <p className="hp-exam-tiny" aria-label="Named exam families">
            {EXAMS_NAV.items.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
