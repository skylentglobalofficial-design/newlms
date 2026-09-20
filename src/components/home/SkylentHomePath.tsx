import { Link } from "react-router-dom"
import "./SkylentHomePath.css"

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const

const ARC = ["Learn", "Practice", "Build", "Prove"] as const

const HARBOR_ISSUES = ["Late inbound", "Weekend exception"] as const

const STAGES = [
  {
    id: "foundations",
    title: "Foundations",
    copy: "What the work is for, and the vocabulary it uses.",
    mark: "Lessons",
    kind: "foundations",
  },
  {
    id: "concepts",
    title: "Concepts",
    copy: "Users, evidence, jobs, constraints, and non-goals.",
    mark: "Framework",
    kind: "concepts",
  },
  {
    id: "practice",
    title: "Practice",
    copy: "Checks and written briefs against the Harbor Desk case.",
    mark: "Exercises",
    kind: "practice",
  },
  {
    id: "project",
    title: "Project",
    copy: "A priority memo: one bet under a stated constraint.",
    mark: "Work",
    kind: "project",
  },
  {
    id: "capstone",
    title: "Capstone",
    copy: "The Harbor Desk product case — a specification someone could implement.",
    mark: "Harbor Desk",
    kind: "capstone",
  },
  {
    id: "evidence",
    title: "Evidence",
    copy: "Keep the work sample. Carry it into Career OS yourself.",
    mark: "Work sample",
    kind: "evidence",
  },
] as const

function StageGlyph({ kind }: { kind: (typeof STAGES)[number]["kind"] }) {
  if (kind === "foundations") {
    return (
      <div className="hp-path-glyph is-foundations" aria-hidden="true">
        <span className="hp-path-layers">
          <i />
          <i />
          <i />
          <i />
        </span>
        <em>Lessons</em>
      </div>
    )
  }

  if (kind === "concepts") {
    return (
      <div className="hp-path-glyph is-concepts" aria-hidden="true">
        <span className="hp-path-doc">
          <b />
          <i />
          <i />
          <i />
        </span>
        <em>Framework</em>
      </div>
    )
  }

  if (kind === "practice") {
    return (
      <div className="hp-path-glyph is-practice" aria-hidden="true">
        <span className="hp-path-workbench">
          <i />
          <i />
          <i />
        </span>
        <em>Exercises</em>
      </div>
    )
  }

  if (kind === "project") {
    return (
      <div className="hp-path-glyph is-project" aria-hidden="true">
        <span className="hp-path-board">
          <i>
            <b />
            <b />
          </i>
          <i>
            <b />
          </i>
          <i>
            <b />
            <b />
          </i>
        </span>
        <em>Work</em>
      </div>
    )
  }

  if (kind === "capstone") {
    return (
      <div className="hp-path-glyph is-capstone" aria-hidden="true">
        <div className="hp-path-harbor">
          <p>Harbor Desk</p>
          <ul>
            {HARBOR_ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="hp-path-glyph is-evidence" aria-hidden="true">
      <span className="hp-path-stack">
        <i>Project</i>
        <i>Skills</i>
        <i>Evidence</i>
      </span>
    </div>
  )
}

export default function SkylentHomePath() {
  return (
    <section className="hp-ch hp-path" aria-labelledby="home-path-heading">
      <div className="hp-rail hp-path-stage">
        <header className="hp-path-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            08 Path
          </p>
          <h2 id="home-path-heading" className="hp-ch-title">
            See the journey before you start.
          </h2>
          <p className="hp-ch-lead">
            A clear progression from foundations to real work, with each stage building on the one before it.
          </p>
          <Link className="hp-path-cta" to="/programs">
            Explore programmes
            <span aria-hidden="true"> →</span>
          </Link>
          <ol className="hp-path-chain" aria-label="Chapter relationship">
            {CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
            <li className="is-here">Path</li>
          </ol>
        </header>

        <article className="hp-path-map" aria-labelledby="home-path-map-title">
          <header className="hp-path-map-head">
            <p className="hp-path-map-kicker">Learning path</p>
            <h3 id="home-path-map-title">The Skylent learning path</h3>
          </header>

          <ol className="hp-path-arc" aria-hidden="true">
            {ARC.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <ol className="hp-path-stages" aria-label="Skylent learning path">
            {STAGES.map((stage, index) => (
              <li key={stage.id} className={`is-${stage.kind}`}>
                <span className="hp-path-idx">{String(index + 1).padStart(2, "0")}</span>
                <b>{stage.title}</b>
                <p>{stage.copy}</p>
                <StageGlyph kind={stage.kind} />
              </li>
            ))}
          </ol>
        </article>
      </div>

      <div className="hp-rail">
        <div className="hp-path-close">
          <p className="hp-path-close-arc">Learn → Practice → Build → Prove</p>
          <p className="hp-path-close-copy">
            What you learn becomes more useful when you can apply it, build with it, and show the work.
          </p>
          <Link className="hp-ch-link" to="/programs">
            Explore programmes →
          </Link>
        </div>
      </div>
    </section>
  )
}
