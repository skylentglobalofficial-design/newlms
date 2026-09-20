import { Link } from "react-router-dom"
import { DATA_ANALYTICS_DATASETS } from "../../content/data-analytics/datasets"
import { northwindLabPath } from "../../lib/labs-api"
import "./SkylentHomeLabs.css"

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const
const STAGES = ["Dataset", "Query", "Result", "Interpretation"] as const
const LOOP = [
  { id: "data", title: "Data", copy: "Explore the dataset" },
  { id: "query", title: "Query", copy: "Write and run SQL" },
  { id: "result", title: "Result", copy: "View the output" },
  { id: "read", title: "Interpretation", copy: "Turn data into insight" },
] as const

const EXAMPLES = [
  { id: "valid_rows", label: "Valid rows" },
  { id: "revenue_by_category", label: "Revenue by category" },
  { id: "monthly_revenue", label: "Monthly revenue" },
] as const

const NOTES = [
  { label: "Finding", copy: "What the query shows." },
  { label: "Why it matters", copy: "What changes if it is true." },
  { label: "Recommendation", copy: "One action you would take." },
] as const

const SQL_PLACEHOLDER = [
  "SELECT category, SUM(units)",
  "FROM northwind_sales",
  "GROUP BY category;",
] as const

const NUMERIC = new Set(["units", "unit_price", "discount_pct", "cost_per_unit"])
const DATE = new Set(["order_date"])

const SALES = DATA_ANALYTICS_DATASETS.find((item) => item.filename === "northwind_sales.csv")
const TABLE = "northwind_sales"
const COLUMNS = (SALES?.columns ?? []).map((column) => ({
  name: column.name,
  type: DATE.has(column.name) ? "date" : NUMERIC.has(column.name) ? "number" : "text",
}))

const LABS_HREF = "/labs"
const LAB_HREF = northwindLabPath(null, null, "sql")

function IconTable() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.2" y="3" width="11.6" height="10" rx="1.2" />
      <path d="M2.2 6.2h11.6M2.2 9.4h11.6M8 6.2v6.8" />
    </svg>
  )
}

function IconQuery() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5.2 4.2L2.8 8l2.4 3.8" />
      <path d="M10.8 4.2L13.2 8l-2.4 3.8" />
    </svg>
  )
}

function IconResult() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.2" />
      <path d="M4.4 6.2h7.2M4.4 8.4h7.2M4.4 10.6h4.6" />
    </svg>
  )
}

function IconNote() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.8h5.2L12.6 6.2V13.2H4V2.8z" />
      <path d="M9.1 2.8V6.2h3.5" />
      <path d="M5.8 8.6h4.4M5.8 10.8h3.2" />
    </svg>
  )
}

function LoopGlyph({ id }: { id: (typeof LOOP)[number]["id"] }) {
  if (id === "data") return <IconTable />
  if (id === "query") return <IconQuery />
  if (id === "result") return <IconResult />
  return <IconNote />
}

export default function SkylentHomeLabs() {
  return (
    <section className="hp-ch hp-lab" aria-labelledby="home-labs-heading">
      <div className="hp-rail hp-lab-stage">
        <header className="hp-lab-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            10 Labs
          </p>
          <h2 id="home-labs-heading" className="hp-ch-title">
            Learn by doing.
          </h2>
          <p className="hp-ch-lead">
            Practice becomes useful when you can work with real data, tools and problems.
          </p>
          <Link className="hp-lab-cta" to={LABS_HREF}>
            Explore labs
            <span aria-hidden="true"> →</span>
          </Link>
          <ol className="hp-lab-chain" aria-label="Chapter relationship">
            {CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
            <li className="is-here">Labs</li>
          </ol>
        </header>

        <article className="hp-lab-board" aria-labelledby="home-labs-board-title">
          <header className="hp-lab-board-head">
            <div>
              <p className="hp-lab-board-kicker">Northwind SQL Lab</p>
              <h3 id="home-labs-board-title">Write a query against this dataset.</h3>
              <p>Read-only SELECT on <code>{TABLE}</code>. Opened from Data Analytics — not a separate catalogue.</p>
            </div>
            <Link className="hp-lab-open" to={LAB_HREF}>
              Open in labs
              <span aria-hidden="true"> →</span>
            </Link>
          </header>

          <ol className="hp-lab-tabs" aria-label="Lab workflow">
            {STAGES.map((stage) => (
              <li key={stage} className={stage === "Query" ? "is-on" : undefined}>
                {stage}
              </li>
            ))}
          </ol>

          <div className="hp-lab-board-body">
            <section className="hp-lab-schema" aria-label="Dataset schema">
              <p>Tables</p>
              <div className="hp-lab-table is-on">
                <IconTable />
                <strong>{TABLE}</strong>
              </div>
              <p>Columns</p>
              <ul>
                {COLUMNS.map((column) => (
                  <li key={column.name}>
                    <span>{column.name}</span>
                    <em>{column.type}</em>
                  </li>
                ))}
              </ul>
            </section>

            <section className="hp-lab-editor" aria-label="SQL editor">
              <div className="hp-lab-editor-bar">
                <p>SQL editor</p>
                <Link className="hp-lab-run" to={LAB_HREF}>
                  Run query
                </Link>
              </div>
              <pre className="hp-lab-sql">
                {SQL_PLACEHOLDER.map((line, index) => (
                  <span key={line}>
                    <b>{index + 1}</b>
                    {line}
                  </span>
                ))}
              </pre>
              <p className="hp-lab-editor-note">Placeholder from the lab. This page does not run SQL.</p>
              <p className="hp-lab-ex-label">Examples</p>
              <ul className="hp-lab-examples">
                {EXAMPLES.map((example) => (
                  <li key={example.id}>
                    <Link to={northwindLabPath(null, null, "sql", { example: example.id })}>{example.label}</Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="hp-lab-out">
              <section className="hp-lab-result" aria-label="Query result">
                <p>Result</p>
                <div className="hp-lab-empty">
                  <IconResult />
                  <strong>Run a query to see the result.</strong>
                  <span>Run a SELECT to inspect rows calculated from {TABLE}.</span>
                </div>
                <div className="hp-lab-grid" aria-hidden="true">
                  <span>column</span>
                  <span>value</span>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </section>

              <section className="hp-lab-read" aria-label="Interpretation">
                <p>Interpretation</p>
                <strong>Turn the output into a commercial read.</strong>
                <ul>
                  {NOTES.map((note) => (
                    <li key={note.label}>
                      <b>{note.label}</b>
                      <span>{note.copy}</span>
                    </li>
                  ))}
                </ul>
                <p className="hp-lab-read-foot">The same three fields used in the Northwind commercial review.</p>
              </section>
            </div>
          </div>

          <ol className="hp-lab-loop" aria-label="How the lab is used">
            {LOOP.map((step) => (
              <li key={step.id}>
                <span className="hp-lab-glyph">
                  <LoopGlyph id={step.id} />
                </span>
                <b>{step.title}</b>
                <em>{step.copy}</em>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  )
}
