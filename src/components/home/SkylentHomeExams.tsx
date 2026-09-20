import { Link } from "react-router-dom"
import { EXAMS_NAV, MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeExams.css"

const PREP = [
  { id: "goal", label: "Goal" },
  { id: "syllabus", label: "Syllabus" },
  { id: "learning", label: "Learning" },
  { id: "practice", label: "Practice" },
  { id: "mock", label: "Mock / Revision" },
  { id: "readiness", label: "Readiness" },
] as const

const FAMILIES = [
  {
    id: "engineering",
    title: "Engineering",
    items: [{ label: "JEE", to: "/programs/jee-advanced-prep" }],
  },
  {
    id: "medical",
    title: "Medical",
    items: [{ label: "NEET", to: "/exams/neet" }],
  },
  {
    id: "higher",
    title: "Higher education",
    items: [
      { label: "IIT JAM", to: "/exams/iit-jam" },
      { label: "GATE", to: "/exams/gate" },
      { label: "CAT", to: "/programs/cat-prep" },
    ],
  },
  {
    id: "government",
    title: "Government / Civil services",
    items: [
      { label: "SSC", to: "/exams/ssc" },
      { label: "UPSC", to: "/exams/upsc" },
    ],
  },
] as const

function PrepMark({ id }: { id: (typeof PREP)[number]["id"] }) {
  const common = { viewBox: "0 0 24 24", className: "hp-exam-mark", "aria-hidden": true as const }
  if (id === "goal") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  }
  if (id === "syllabus") {
    return (
      <svg {...common}>
        <rect x="6" y="4" width="12" height="16" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    )
  }
  if (id === "learning") {
    return (
      <svg {...common}>
        <path d="M4 8l8-3 8 3-8 3-8-3z" />
        <path d="M7 10v5c2.2 1.2 7.8 1.2 10 0v-5" />
      </svg>
    )
  }
  if (id === "practice") {
    return (
      <svg {...common}>
        <path d="M8 16l-3-3 3-3" />
        <path d="M16 10l3 3-3 3" />
        <path d="M13 8l-2 8" />
      </svg>
    )
  }
  if (id === "mock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v4l3 2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M12 5l2.2 4.4 4.8.7-3.5 3.4.8 4.8L12 16.2 7.7 18.3l.8-4.8L5 10.1l4.8-.7z" />
    </svg>
  )
}

export default function SkylentHomeExams() {
  const navCount = EXAMS_NAV.items.length

  return (
    <section className="hp-ch hp-examx" aria-labelledby="home-exams-heading">
      <div className="hp-rail hp-exam-stage">
        <header className="hp-exam-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            14 Exams
          </p>
          <h2 id="home-exams-heading" className="hp-ch-title">
            Prepare with purpose.
          </h2>
          <p className="hp-ch-lead">
            Structured preparation for competitive exams, with learning, practice and revision working together.
          </p>
          <p className="hp-exam-soon">{MATURITY_LABEL.coming_soon}</p>
          <p className="hp-exam-note">
            {navCount} named paths are specified. There is no live question bank, mock engine, or score on this page.
          </p>
        </header>

        <div className="hp-exam-constellation">
          <aside className="hp-exam-cluster is-left" aria-label="Exam destinations">
            {FAMILIES.slice(0, 2).map((family) => (
              <div key={family.id}>
                <p>{family.title}</p>
                <ul>
                  {family.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <ol className="hp-exam-system" aria-label="Preparation system">
            {PREP.map((step, index) => (
              <li key={step.id}>
                <PrepMark id={step.id} />
                <b>{step.label}</b>
                {index < PREP.length - 1 ? <i aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>

          <aside className="hp-exam-cluster is-right" aria-label="More exam destinations">
            {FAMILIES.slice(2).map((family) => (
              <div key={family.id}>
                <p>{family.title}</p>
                <ul>
                  {family.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  )
}
