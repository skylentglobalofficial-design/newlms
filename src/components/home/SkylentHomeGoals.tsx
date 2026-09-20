import { useState } from "react"
import { Link } from "react-router-dom"
import "./SkylentHomeGoals.css"

type DestId = "career" | "exam" | "study" | "skill"

const DESTINATIONS: Array<{
  id: DestId
  index: string
  title: string
  copy: string
  node: string
  to: string
}> = [
  {
    id: "career",
    index: "01",
    title: "Build a career",
    copy: "Build practical skills, create real work, and move toward your next opportunity.",
    node: "Career",
    to: "/career-os",
  },
  {
    id: "exam",
    index: "02",
    title: "Prepare for an exam",
    copy: "Build understanding, practise deliberately, and prepare with structure.",
    node: "Exam",
    to: "/education/exams",
  },
  {
    id: "study",
    index: "03",
    title: "Study a subject",
    copy: "Go deeper into a subject with clear explanations, examples and practice.",
    node: "Subject",
    to: "/courses",
  },
  {
    id: "skill",
    index: "04",
    title: "Learn something new",
    copy: "Explore a new skill, experiment, and turn curiosity into capability.",
    node: "New skill",
    to: "/skills",
  },
]

const NODES: Record<DestId, { x: number; y: number }> = {
  career: { x: 200, y: 56 },
  exam: { x: 344, y: 200 },
  study: { x: 200, y: 344 },
  skill: { x: 56, y: 200 },
}

function DestIcon({ id }: { id: DestId }) {
  const s = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  }
  if (id === "career") {
    return (
      <svg {...s}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    )
  }
  if (id === "exam") {
    return (
      <svg {...s}>
        <path d="M3 10l9-5 9 5-9 5-9-5z" />
        <path d="M7 12.5v3.5c2.2 1.2 7.8 1.2 10 0v-3.5" />
        <path d="M20 12v4" />
      </svg>
    )
  }
  if (id === "study") {
    return (
      <svg {...s}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3 11c.5 1 1 2 1 3h4c0-1 .5-2 1-3a6 6 0 0 0-3-11z" />
    </svg>
  )
}

function Journey({ active, onPick }: { active: DestId; onPick: (id: DestId) => void }) {
  const node = NODES[active]
  return (
        <div className="hp-dir-orbit">
      <svg viewBox="0 0 400 400">
        <circle className="hp-dir-ring" cx="200" cy="200" r="168" />
        <circle className="hp-dir-ring" cx="200" cy="200" r="118" />
        <circle className="hp-dir-ring" cx="200" cy="200" r="68" />
        <circle className="hp-dir-core" cx="200" cy="200" r="54" />
        <line className="hp-dir-ray" x1="200" y1="200" x2={node.x} y2={node.y} />
        {DESTINATIONS.map((item) => {
          const p = NODES[item.id]
          const on = item.id === active
          return (
            <circle
              key={item.id}
              className={on ? "hp-dir-node is-on" : "hp-dir-node"}
              cx={p.x}
              cy={p.y}
              r="5"
            />
          )
        })}
      </svg>
      <p className="hp-dir-origin">Start</p>
      {DESTINATIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          tabIndex={-1}
          className={`hp-dir-pin is-${item.id}${item.id === active ? " is-on" : ""}`}
          onMouseEnter={() => onPick(item.id)}
          onClick={() => onPick(item.id)}
        >
          {item.node}
        </button>
      ))}
    </div>
  )
}

export default function SkylentHomeGoals() {
  const [active, setActive] = useState<DestId>("career")

  return (
    <section className="hp-section hp-dir" aria-labelledby="home-goals-heading">
      <div className="hp-rail hp-dir-stage">
        <header className="hp-dir-copy">
          <p className="hp-dir-kicker">Start with a goal</p>
          <h2 id="home-goals-heading">Where do you want to go?</h2>
          <p className="hp-dir-lead">
            Choose a direction.
            <br />
            {"We'll help you build the skills to get there."}
          </p>
        </header>

        <div className="hp-dir-visual">
          <Journey active={active} onPick={setActive} />
        </div>

        <div className="hp-dir-list" role="list">
          {DESTINATIONS.map((item) => {
            const on = item.id === active
            return (
              <Link
                key={item.id}
                className={on ? "hp-dir-item is-on" : "hp-dir-item"}
                to={item.to}
                role="listitem"
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
              >
                <span className="hp-dir-icon">
                  <DestIcon id={item.id} />
                </span>
                <span className="hp-dir-item-copy">
                  <b>{item.title}</b>
                  <em>{item.copy}</em>
                </span>
                <span className="hp-dir-go" aria-hidden="true">
                  →
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <ol className="hp-rail hp-dir-spine" aria-label="Choose a direction">
        <li className="hp-dir-spine-start">
          <span>Start</span>
        </li>
        {DESTINATIONS.map((item) => {
          const on = item.id === active
          return (
            <li key={item.id}>
              <Link
                className={on ? "hp-dir-spine-item is-on" : "hp-dir-spine-item"}
                to={item.to}
                onClick={() => setActive(item.id)}
              >
                <i aria-hidden="true" />
                <span>
                  <b>{item.title}</b>
                  <em>{item.copy}</em>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="hp-rail hp-dir-foot">
        <p>New goals. Real skills. A brighter tomorrow.</p>
        <Link to="/programs">Explore programs →</Link>
      </div>
    </section>
  )
}
