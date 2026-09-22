import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { harborDeskProjectPath } from "../../lib/projects-api"
import "./SkylentHomeEvidence.css"

const HARBOR_DESK_PROJECT_IMAGE = "/content/product-management/harbor-desk-project.svg"

const STEPS = [
  { id: "draft", label: "Draft", state: "done" as const },
  { id: "tested", label: "Tested", state: "now" as const },
  { id: "ready", label: "Ready", state: "next" as const },
]

const SYSTEM_CHAIN = [
  { label: "Learn", detail: "Structured lessons and teaching in Skylent OS.", to: "/courses" },
  { label: "Practice", detail: "Quizzes, labs, and checks after you learn.", to: "/labs" },
  { label: "Build", detail: "Projects and applied work on real briefs.", to: "/career-os/projects" },
  { label: "Evidence", detail: "Artifacts you keep and can showcase.", to: "/career-os/projects" },
  { label: "Career", detail: "Profile, opportunities, and applications when published.", to: "/career-os" },
] as const

function HarborEvidenceWorkspace({ active }: { active: boolean }) {
  return (
    <div className={active ? "hp-ev-work is-in" : "hp-ev-work"} aria-label="Harbor Desk project case">
      <header className="hp-ev-work-bar">
        <p className="hp-ev-brand">Skylent OS</p>
        <p className="hp-ev-work-kicker">Project case</p>
      </header>

      <div className="hp-ev-work-body">
        <p className="hp-ev-title" id="home-ev-case-title">
          Harbor Desk
        </p>

        <figure className="hp-ev-artifact">
          <img
            src={HARBOR_DESK_PROJECT_IMAGE}
            alt="Harbor Desk weekend exception queue, a product-case artifact"
          />
        </figure>

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

        <div className="hp-ev-evidence-block">
          <p className="hp-ev-evidence-label">Evidence</p>
          <p className="hp-ev-evidence">Case notes · Specification · Feedback</p>
        </div>

        <div className="hp-ev-work-foot">
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
          <Link className="hp-ev-keep" to={harborDeskProjectPath()}>
            View the work
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
            How Skylent works
          </p>
          <h2 id="home-evidence-heading">One connected system from learning to career.</h2>
          <p className="hp-ev-lead">
            Skylent is not a catalogue of videos — it is Learn → Practice → Build → Evidence → Career, wired
            together in Skylent OS.
          </p>
          <ol className="hp-ev-chain" aria-label="Skylent learning system">
            {SYSTEM_CHAIN.map((step, index) => (
              <li key={step.label}>
                <Link to={step.to}>
                  <span className="hp-ev-chain-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="hp-ev-chain-copy">
                    <strong>{step.label}</strong>
                    <em>{step.detail}</em>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="hp-ev-specimen-label">Evidence in practice — Harbor Desk</p>
        </header>

        <HarborEvidenceWorkspace active={inView} />
      </div>

      <div className="hp-rail hp-ev-foot">
        <p>Keep work that proves what you can do.</p>
        <Link to="/career-os">Open Career OS →</Link>
      </div>
    </section>
  )
}
