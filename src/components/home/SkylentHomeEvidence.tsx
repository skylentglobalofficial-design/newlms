import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import "./SkylentHomeEvidence.css"

const STEPS = [
  { id: "draft", label: "Draft", state: "done" as const },
  { id: "tested", label: "Tested", state: "now" as const },
  { id: "ready", label: "Ready", state: "next" as const },
]

const STORY = [
  { label: "Problem", value: "Late inbound has no owner before open." },
  { label: "Decision", value: "Weekend exception queue." },
  { label: "Specification", value: "Ready for review." },
] as const

const PROOF = ["Case notes", "Specification", "Feedback"] as const

const THREAD = [
  { label: "Project", copy: "Make something real." },
  { label: "Evidence", copy: "Show how you got there." },
  { label: "Opportunity", copy: "Take the work forward." },
] as const

function HarborEvidenceWorkspace({ active }: { active: boolean }) {
  return (
    <article className={active ? "hp-ev-work is-in" : "hp-ev-work"} aria-labelledby="home-ev-case-title">
      <header className="hp-ev-work-bar">
        <p className="hp-ev-brand">Skylent OS</p>
        <p className="hp-ev-work-kicker">Project case</p>
        <p className="hp-ev-status">
          <i aria-hidden="true" />
          In progress
        </p>
      </header>

      <div className="hp-ev-work-body">
        <p className="hp-ev-file">harbor-desk-case.md</p>
        <h3 className="hp-ev-title" id="home-ev-case-title">
          Harbor Desk
        </h3>

        <dl className="hp-ev-story">
          {STORY.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="hp-ev-proof">
          <p className="hp-ev-proof-label">Evidence</p>
          <ul>
            {PROOF.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <ol className="hp-ev-progress" aria-label="Project maturity">
          {STEPS.map((step) => (
            <li key={step.id} className={`is-${step.state}`}>
              <i aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          ))}
        </ol>

        <div className="hp-ev-work-foot">
          <Link className="hp-ev-keep" to="/os/projects/product-management/harbor-desk-case">
            View the work
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function SkylentHomeEvidence() {
  const stageRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.32 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hp-section hp-ev" aria-labelledby="home-evidence-heading" ref={stageRef}>
      <div className="hp-rail hp-ev-stage">
        <header className="hp-ev-copy">
          <p className="hp-ev-kicker">
            <i aria-hidden="true" />
            Real work
          </p>
          <h2 id="home-evidence-heading">
            Learning becomes
            <br />
            something you can show.
          </h2>
          <p className="hp-ev-lead">
            Turn what you learn into projects, cases, analyses, products and other evidence of what you can
            actually do.
          </p>
          <dl className="hp-ev-thread">
            {THREAD.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.copy}</dd>
              </div>
            ))}
          </dl>
        </header>

        <HarborEvidenceWorkspace active={inView} />
      </div>

      <div className="hp-rail hp-ev-foot">
        <p>Good work should have somewhere to go.</p>
        <Link to="/career-os/projects">Explore projects →</Link>
      </div>
    </section>
  )
}
