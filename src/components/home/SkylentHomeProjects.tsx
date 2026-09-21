import { Link } from "react-router-dom"
import { harborDeskProjectPath, northwindProjectPath } from "../../lib/projects-api"
import { NORTHWIND_PREVIEW } from "../../lib/northwind-preview"
import "./SkylentHomeProjects.css"

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const

const HARBOR_NAV = ["Inbox", "Exceptions", "Customers", "Reports"] as const
const HARBOR_ISSUES = ["Late inbound", "Delivery failed", "Weekend exception"] as const
const HARBOR_SKILLS = ["Product thinking", "User research", "Prioritisation", "Specification"] as const

const NORTHWIND_TABS = ["Overview", "Queries", "Insights"] as const
const NORTHWIND_STEPS = ["Data", "Analysis", "Insight", "Review"] as const
const NORTHWIND_WORK = ["Data exploration", "SQL analysis", "Commercial review"] as const
const NORTHWIND_SKILLS = ["SQL", "Spreadsheets", "Data cleaning", "Commercial review"] as const
const NORTHWIND_COLUMNS = ["category", "product", "units", "channel"] as const

const MONTH_MAX = Math.max(...NORTHWIND_PREVIEW.months.map((month) => month.value))
const MONTH_BARS = NORTHWIND_PREVIEW.months.map((month) => ({
  name: month.name,
  height: Math.max(22, Math.round((month.value / MONTH_MAX) * 100)),
}))

const PROJECTS_HREF = "/career-os/projects"

function HarborDeskArtifact() {
  return (
    <div className="hp-proj-desk is-harbor" aria-hidden="true">
      <div className="hp-proj-desk-bar">
        <span>Harbor Desk</span>
        <em>Case project</em>
      </div>
      <div className="hp-proj-desk-body">
        <nav className="hp-proj-nav">
          {HARBOR_NAV.map((item) => (
            <span key={item} className={item === "Exceptions" ? "is-on" : undefined}>
              {item}
            </span>
          ))}
        </nav>
        <div className="hp-proj-issues">
          <p>Open issues</p>
          <ul>
            {HARBOR_ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hp-proj-spec">
        <p>Specification</p>
        <strong>Weekend exception queue</strong>
        <span>Late inbound has no owner before open.</span>
      </div>
    </div>
  )
}

function NorthwindArtifact() {
  return (
    <div className="hp-proj-desk is-wind" aria-hidden="true">
      <div className="hp-proj-desk-bar">
        <span>Northwind</span>
        <em>Analytics project</em>
      </div>
      <div className="hp-proj-wind-tabs">
        {NORTHWIND_TABS.map((tab) => (
          <span key={tab} className={tab === "Queries" ? "is-on" : undefined}>
            {tab}
          </span>
        ))}
      </div>
      <div className="hp-proj-wind-body">
        <div className="hp-proj-chart">
          <p>Sales by month</p>
          <div className="hp-proj-bars">
            {MONTH_BARS.map((bar) => (
              <span key={bar.name}>
                <i style={{ height: `${bar.height}%` }} />
                <em>{bar.name}</em>
              </span>
            ))}
          </div>
        </div>
        <div className="hp-proj-query">
          <p>
            SQL · <code>{NORTHWIND_PREVIEW.filename}</code>
          </p>
          <pre>
            <span>SELECT …</span>
            <span>FROM sales</span>
            <span>WHERE …</span>
          </pre>
          <ul>
            {NORTHWIND_WORK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <ol className="hp-proj-flow">
        {NORTHWIND_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="hp-proj-cols">
        {NORTHWIND_COLUMNS.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
    </div>
  )
}

export default function SkylentHomeProjects() {
  return (
    <section className="hp-ch hp-proj" aria-labelledby="home-projects-heading">
      <div className="hp-rail hp-proj-stage">
        <header className="hp-proj-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            09 Projects
          </p>
          <h2 id="home-projects-heading" className="hp-ch-title">
            Work you can actually point to.
          </h2>
          <p className="hp-ch-lead">
            Projects turn learning into something concrete — a case, a build, a decision, or a body of work.
          </p>
          <Link className="hp-proj-cta" to={PROJECTS_HREF}>
            Explore projects
            <span aria-hidden="true"> →</span>
          </Link>
          <ol className="hp-proj-chain" aria-label="Chapter relationship">
            {CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
            <li className="is-here">Projects</li>
          </ol>
        </header>

        <article className="hp-proj-archive" aria-labelledby="home-projects-archive-title">
          <header className="hp-proj-archive-head">
            <div>
              <p className="hp-proj-archive-kicker">Featured projects</p>
              <h3 id="home-projects-archive-title">A case and a review.</h3>
            </div>
            <p className="hp-proj-archive-aside">Two kinds of work.</p>
          </header>

          <div className="hp-proj-pair">
            <article className="hp-proj-card is-lead" aria-labelledby="home-harbor-title">
              <div className="hp-proj-card-copy">
                <p className="hp-proj-idx">01</p>
                <p className="hp-proj-kind">Case project</p>
                <h4 id="home-harbor-title">Harbor Desk</h4>
                <p className="hp-proj-meta">Product Management · Case project</p>
                <p className="hp-proj-blurb">
                  Late inbound has no owner before open. The bet is a weekend exception queue, specified for review.
                </p>
                <p className="hp-proj-file">
                  Against <code>harbor-desk-case.md</code>
                </p>
                <Link className="hp-proj-open" to={harborDeskProjectPath()}>
                  View case
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
              <HarborDeskArtifact />
              <ul className="hp-proj-skills" aria-label="Skills marked by the Harbor Desk case">
                {HARBOR_SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>

            <article className="hp-proj-card is-wind" aria-labelledby="home-northwind-title">
              <div className="hp-proj-card-copy">
                <p className="hp-proj-idx">02</p>
                <p className="hp-proj-kind">Analytics project</p>
                <h4 id="home-northwind-title">Northwind</h4>
                <p className="hp-proj-meta">Data Analytics · Commercial review</p>
                <p className="hp-proj-blurb">
                  A commercial read of a fictional Northwind sales extract — finding, why it matters, one
                  recommendation.
                </p>
                <p className="hp-proj-file">
                  Against <code>{NORTHWIND_PREVIEW.filename}</code>
                </p>
                <Link className="hp-proj-open" to={northwindProjectPath()}>
                  View project
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
              <NorthwindArtifact />
              <ul className="hp-proj-skills" aria-label="Skills marked by the Northwind review">
                {NORTHWIND_SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          </div>
        </article>
      </div>

      <div className="hp-rail">
        <div className="hp-proj-close">
          <p className="hp-proj-close-line">Good work deserves somewhere to be seen.</p>
          <Link className="hp-ch-link" to={PROJECTS_HREF}>
            Explore projects →
          </Link>
        </div>
      </div>
    </section>
  )
}
