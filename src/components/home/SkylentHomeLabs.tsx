import { Link } from "react-router-dom"

const COLUMNS = [
  "order_id",
  "order_date",
  "region",
  "city",
  "category",
  "product",
  "units",
  "unit_price",
  "discount_pct",
  "cost_per_unit",
  "returned",
  "channel",
] as const

export default function SkylentHomeLabs() {
  return (
    <section className="hp-ch hp-labx" aria-labelledby="home-labs-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Labs
        </p>
        <h2 id="home-labs-heading" className="hp-ch-title">
          Practice before the stakes are real.
        </h2>
        <p className="hp-ch-lead">
          Data Analytics includes a read-only SQL workbench on <code>northwind_sales.csv</code>. Product Management
          does not use it. The lab runs in the browser from the enrolled course.
        </p>
        <div className="hp-labx-bench">
          <div className="hp-labx-pane">
            <p>Input</p>
            <b>northwind_sales.csv</b>
            <span>180 order lines for fictional Northwind Retail, January–June 2026.</span>
            <ul className="hp-labx-cols">
              {COLUMNS.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </div>
          <div className="hp-labx-pane">
            <p>Query</p>
            <pre className="hp-labx-query">{`SELECT category, SUM(units)
FROM northwind_sales
GROUP BY category;`}</pre>
          </div>
          <div className="hp-labx-pane">
            <p>Result</p>
            <div className="hp-labx-head">
              <span>category</span>
              <span>SUM(units)</span>
            </div>
            <p className="hp-labx-note">
              Output is calculated from the authored extract when you run a SELECT. This page does not invent
              totals.
            </p>
            <p className="hp-labx-feedback">Practice, then feedback, then stronger work.</p>
          </div>
        </div>
        <p className="hp-labx-foot">
          <Link className="hp-ch-link" to="/courses/data-analytics">
            Open Data Analytics →
          </Link>
        </p>
      </div>
    </section>
  )
}
