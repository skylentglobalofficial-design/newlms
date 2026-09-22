import { Link } from "react-router-dom"
import { EXAMS_NAV, MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeExams.css"

const EXAMS_HREF = "/exams"

const RING = [
  { id: "goal", label: "Goal", angle: -90 },
  { id: "prep", label: "Preparation", angle: 0 },
  { id: "practice", label: "Practice", angle: 90 },
  { id: "ready", label: "Readiness", angle: 180 },
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
            <svg className="hp-exam-ring" viewBox="0 0 220 220" aria-hidden="true">
              <circle className="is-outer" cx="110" cy="110" r="86" />
              <circle className="is-inner" cx="110" cy="110" r="52" />
              {RING.map((node) => {
                const rad = (node.angle * Math.PI) / 180
                const x = 110 + Math.cos(rad) * 86
                const y = 110 + Math.sin(rad) * 86
                const tx = 110 + Math.cos(rad) * 78
                const ty = 110 + Math.sin(rad) * 78
                return (
                  <g key={node.id}>
                    <line className="is-tick" x1={tx} y1={ty} x2={x} y2={y} />
                    <circle className="is-node" cx={x} cy={y} r="3.2" />
                  </g>
                )
              })}
            </svg>
            <p className="hp-exam-core">Preparation</p>
            {RING.map((node) => (
              <span key={node.id} className={`hp-exam-node is-${node.id}`}>
                {node.label}
              </span>
            ))}
          </div>
          <p className="hp-exam-quiet">Competitive exams · {MATURITY_LABEL.coming_soon}</p>
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
