import { Link } from "react-router-dom"
import "./SkylentHomeCatalogue.css"

type IconId = "code" | "data" | "exam" | "design" | "business" | "tech" | "growth"

const RAIL = [
  {
    id: "code" as const,
    title: "Coding & Development",
    copy: "Build interfaces, APIs and systems from the engineering catalogue.",
    to: "/courses/full-stack-web",
  },
  {
    id: "data" as const,
    title: "Data & Analytics",
    copy: "SQL, spreadsheets, and a dashboard you keep — on Northwind.",
    to: "/courses/data-analytics",
  },
  {
    id: "exam" as const,
    title: "Competitive Exams",
    copy: "Named paths for JEE, NEET, CAT, GATE and government papers.",
    to: "/education/exams",
  },
  {
    id: "design" as const,
    title: "Design & Creative",
    copy: "Start from a skill, then follow it into a course.",
    to: "/skills",
  },
] as const

const AREAS = [
  {
    id: "data" as const,
    title: "Data & Analytics",
    copy: "Learn to work with data",
    to: "/courses/data-analytics",
  },
  {
    id: "business" as const,
    title: "Business & Management",
    copy: "Work a product case",
    to: "/programs",
  },
  {
    id: "tech" as const,
    title: "Tech & Development",
    copy: "Start building",
    to: "/skills?intent=software",
  },
  {
    id: "design" as const,
    title: "Design & Creative",
    copy: "Bring ideas to life",
    to: "/skills",
  },
  {
    id: "exam" as const,
    title: "Exams & Academics",
    copy: "Prepare with structure",
    to: "/education/exams",
  },
  {
    id: "growth" as const,
    title: "Personal Growth",
    copy: "Learn something new",
    to: "/skills",
  },
] as const

function LineIcon({ id }: { id: IconId }) {
  const s = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  }
  if (id === "code") {
    return (
      <svg {...s}>
        <polyline points="8 6 3 12 8 18" />
        <polyline points="16 6 21 12 16 18" />
      </svg>
    )
  }
  if (id === "data") {
    return (
      <svg {...s}>
        <path d="M4 19V10" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V8" />
      </svg>
    )
  }
  if (id === "exam") {
    return (
      <svg {...s}>
        <rect x="6" y="4" width="12" height="16" rx="1.5" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h3.5" />
      </svg>
    )
  }
  if (id === "design") {
    return (
      <svg {...s}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
      </svg>
    )
  }
  if (id === "business") {
    return (
      <svg {...s}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5" />
        <path d="M12 12v9" />
        <path d="M12 12L4 7.5" />
      </svg>
    )
  }
  if (id === "tech") {
    return (
      <svg {...s}>
        <polyline points="9 8 5 12 9 16" />
        <polyline points="15 8 19 12 15 16" />
        <line x1="13" y1="7" x2="11" y2="17" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <path d="M12 3a6 6 0 0 0-3 11c.5 1 1 2 1 3h4c0-1 .5-2 1-3a6 6 0 0 0-3-11z" />
      <path d="M9 21h6" />
    </svg>
  )
}

function HarborCaseSpecimen() {
  return (
    <div className="hp-cat-specimen" aria-hidden="true">
      <p className="hp-cat-specimen-file">
        <span>harbor-desk-case.md</span>
        <span>Harbor Retail</span>
      </p>
      <blockquote className="hp-cat-quote">
        <p>“I need someone at HQ who is actually looking before 7am.”</p>
        <footer>Priya · store lead, T. Nagar</footer>
      </blockquote>
      <dl className="hp-cat-facts">
        <div>
          <dt>Problem</dt>
          <dd>Late inbound has no owner before open.</dd>
        </div>
        <div>
          <dt>Constraint</dt>
          <dd>2 engineers · 6 weeks · no ERP</dd>
        </div>
        <div>
          <dt>One bet</dt>
          <dd>Weekend exception queue</dd>
        </div>
      </dl>
    </div>
  )
}

export default function SkylentHomeCatalogue() {
  return (
    <section className="hp-section hp-cat" aria-labelledby="home-discover-heading">
      <div className="hp-rail hp-cat-stage">
        <header className="hp-cat-copy">
          <p className="hp-cat-kicker">
            <i aria-hidden="true" />
            Catalogue
          </p>
          <h2 id="home-discover-heading">{"Explore what's worth learning."}</h2>
          <p className="hp-cat-lead">
            Practical skills, real projects and structured learning — everything you need to grow, in one
            place.
          </p>
          <Link className="hp-cat-cta" to="/programs">
            Browse all programs
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <article className="hp-cat-feature" aria-labelledby="home-cat-feature-title">
          <p className="hp-cat-feature-kicker">Featured</p>
          <HarborCaseSpecimen />
          <div className="hp-cat-feature-body">
            <p id="home-cat-feature-title" className="hp-cat-feature-title">
              Product Management
            </p>
            <p className="hp-cat-feature-lead">
              Decide what to build when engineering time is limited, and write the specification for it.
            </p>
            <div className="hp-cat-feature-foot">
              <ul className="hp-cat-tags">
                <li>Harbor Desk case</li>
                <li>Evidence</li>
                <li>Specification</li>
              </ul>
              <Link className="hp-cat-explore" to="/programs/product-management">
                <span className="hp-cat-explore-go" aria-hidden="true">
                  →
                </span>
                Explore programme
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </article>

        <ul className="hp-cat-rail" aria-label="Catalogue areas">
          {RAIL.map((item) => (
            <li key={item.id}>
              <Link className="hp-cat-rail-item" to={item.to}>
                <span className="hp-cat-thumb">
                  <LineIcon id={item.id} />
                </span>
                <span className="hp-cat-rail-copy">
                  <b>{item.title}</b>
                  <em>{item.copy}</em>
                </span>
                <span className="hp-cat-go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="hp-rail hp-cat-areas">
        <header className="hp-cat-areas-head">
          <div>
            <p className="hp-cat-kicker">
              <i aria-hidden="true" />
              Browse by area
            </p>
            <h3 id="home-cat-areas-heading">Find your next skill.</h3>
          </div>
          <Link className="hp-cat-all" to="/courses">
            View all categories →
          </Link>
        </header>
        <ul className="hp-cat-area-list" aria-labelledby="home-cat-areas-heading">
          {AREAS.map((item) => (
            <li key={item.id}>
              <Link className="hp-cat-area" to={item.to}>
                <span className="hp-cat-area-icon">
                  <LineIcon id={item.id} />
                </span>
                <b>{item.title}</b>
                <em>{item.copy}</em>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
