import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeSchool.css"

const SCHOOLING_HREF = "/education/schooling"

const STAGES = [
  { id: "foundation", label: "Foundation", note: "Early learning" },
  { id: "exploration", label: "Exploration", note: "Broader work" },
  { id: "progression", label: "Progression", note: "What comes next" },
] as const

function FoundationStairs() {
  return (
    <svg className="hp-sch-stairs" viewBox="0 0 420 320" aria-hidden="true">
      <polygon className="is-ground" points="36,268 168,304 384,244 252,208" />
      <polygon className="is-left" points="72,214 168,240 168,276 72,250" />
      <polygon className="is-right" points="168,240 248,218 248,254 168,276" />
      <polygon className="is-top" points="72,214 168,190 248,218 168,240" />
      <polygon className="is-left" points="148,158 228,184 228,220 148,194" />
      <polygon className="is-right" points="228,184 300,164 300,200 228,220" />
      <polygon className="is-top" points="148,158 228,134 300,164 228,184" />
      <polygon className="is-left" points="220,104 292,128 292,164 220,140" />
      <polygon className="is-right" points="292,128 356,110 356,146 292,164" />
      <polygon className="is-top" points="220,104 292,80 356,110 292,128" />
      <path className="is-stroke" d="M72 214l96-24 80 28-96 22z" />
      <path className="is-stroke" d="M72 214v36l96 26v-36" />
      <path className="is-stroke" d="M168 240l80-22v36l-80 22z" />
      <path className="is-stroke" d="M148 158l80-24 72 30-80 20z" />
      <path className="is-stroke" d="M148 158v36l80 26v-36" />
      <path className="is-stroke" d="M228 184l72-20v36l-72 20z" />
      <path className="is-stroke" d="M220 104l72-24 64 30-72 20z" />
      <path className="is-stroke" d="M220 104v36l72 24v-36" />
      <path className="is-stroke" d="M292 128l64-18v36l-64 18z" />
    </svg>
  )
}

export default function SkylentHomeSchool() {
  return (
    <section className="hp-ch hp-school" aria-labelledby="home-school-heading">
      <div className="hp-rail hp-ch-split hp-school-stage">
        <header className="hp-ch-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            12 School
          </p>
          <h2 id="home-school-heading" className="hp-ch-title">
            A foundation for what comes next.
          </h2>
          <p className="hp-ch-lead">
            A grade-and-subject pathway designed to build strong foundations for future learning.
          </p>
          <p className="hp-ch-soon-pill">{MATURITY_LABEL.coming_soon}</p>
          <Link className="hp-ch-cta" to={SCHOOLING_HREF}>
            Explore education
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-sch-visual" aria-label="School as a foundation pathway">
          <FoundationStairs />
          <ol className="hp-sch-legend">
            {STAGES.map((stage) => (
              <li key={stage.id}>
                <b>{stage.label}</b>
                <span>{stage.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
