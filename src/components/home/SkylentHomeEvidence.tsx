import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import "./SkylentHomeEvidence.css"

const STEPS = [
  { id: "draft", label: "Draft", state: "done" as const },
  { id: "tested", label: "Tested", state: "now" as const },
  { id: "ready", label: "Ready", state: "next" as const },
]

function HarborEvidenceWorkspace({ active }: { active: boolean }) {
  return (
    <div className={active ? "hp-ev-work is-in" : "hp-ev-work"} aria-label="Harbor Desk project case">
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
        <p className="hp-ev-title" id="home-ev-case-title">
          Harbor Desk
        </p>

        <dl className="hp-ev-fields">
          <div>
            <dt>Problem</dt>
            <dd>Late inbound has no owner before open.</dd>
          </div>
          <div>
            <dt>Decision</dt>
            <dd>Weekend exception queue.</dd>
          </div>
          <div>
            <dt>Specification</dt>
            <dd>Ready for review.</dd>
          </div>
        </dl>

        <div className="hp-ev-progress-block">
          <p className="hp-ev-progress-label">Progress</p>
          <ol className="hp-ev-progress" aria-label="Evidence progress">
            {STEPS.map((step) => (
              <li key={step.id} className={`is-${step.state}`}>
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="hp-ev-work-foot">
          <Link className="hp-ev-keep" to="/career-os">
            Add to portfolio
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </div>
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
          <h2 id="home-evidence-heading">Learning becomes something you can show.</h2>
          <p className="hp-ev-lead">
            Turn what you learn into projects, cases, analyses, products and other evidence of what you can
            actually do.
          </p>
        </header>

        <HarborEvidenceWorkspace active={inView} />
      </div>

      <div className="hp-rail hp-ev-foot">
        <p>Build something worth showing.</p>
        <Link to="/career-os/projects">Explore projects →</Link>
      </div>
    </section>
  )
}
