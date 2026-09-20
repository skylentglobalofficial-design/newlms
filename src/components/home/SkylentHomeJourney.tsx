import { Link } from "react-router-dom"
import "./SkylentHomeJourney.css"

const BEATS = [
  { id: "goal", label: "Goal", copy: "Start with what you want to achieve." },
  { id: "learning", label: "Learning", copy: "Learn what you need." },
  { id: "practice", label: "Practice", copy: "Practice it." },
  { id: "project", label: "Project", copy: "Build something you can keep." },
  { id: "evidence", label: "Evidence", copy: "Keep the evidence." },
  { id: "career", label: "Career", copy: "Move forward in Career OS." },
] as const

function BeatMark({ id }: { id: (typeof BEATS)[number]["id"] }) {
  const s = { className: "hp-line-mark", viewBox: "0 0 48 48", "aria-hidden": true as const }
  if (id === "goal") {
    return (
      <svg {...s}>
        <circle cx="24" cy="24" r="10" />
        <circle cx="24" cy="24" r="3" />
      </svg>
    )
  }
  if (id === "learning") {
    return (
      <svg {...s}>
        <path d="M8 20l16-7 16 7-16 7-16-7z" />
        <path d="M14 24v9c4 3 16 3 20 0v-9" />
      </svg>
    )
  }
  if (id === "practice") {
    return (
      <svg {...s}>
        <rect x="12" y="12" width="24" height="24" />
        <path d="M18 24h12M24 18v12" />
      </svg>
    )
  }
  if (id === "project") {
    return (
      <svg {...s}>
        <path d="M12 16h24v20H12z" />
        <path d="M18 16v-4h12v4" />
      </svg>
    )
  }
  if (id === "evidence") {
    return (
      <svg {...s}>
        <path d="M16 12h12l8 8v16H16z" />
        <path d="M28 12v8h8" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <rect x="10" y="18" width="28" height="18" />
      <path d="M18 18v-4h12v4" />
    </svg>
  )
}

export default function SkylentHomeJourney() {
  return (
    <section className="hp-ch hp-line" aria-labelledby="home-journey-heading">
      <div className="hp-rail hp-line-stage">
        <header className="hp-line-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            17 Journey
          </p>
          <h2 id="home-journey-heading" className="hp-ch-title">
            From a goal to work you can show.
          </h2>
          <p className="hp-ch-lead">
            Start with what you want to achieve. Learn what you need. Practice it. Build something. Keep the
            evidence. Move forward.
          </p>
        </header>

        <ol className="hp-line-path" aria-label="Learner journey">
          {BEATS.map((beat, index) => (
            <li key={beat.id} className={beat.id === "career" ? "is-career" : undefined}>
              <BeatMark id={beat.id} />
              <b>{beat.label}</b>
              <span>{beat.copy}</span>
              {index < BEATS.length - 1 ? <i aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <p className="hp-line-end">
          <Link className="hp-ch-link" to="/career-os">
            Career OS →
          </Link>
        </p>
      </div>
    </section>
  )
}
