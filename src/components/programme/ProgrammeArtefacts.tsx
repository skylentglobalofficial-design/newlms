/**
 * Discipline artefacts for the programme pages, drawn in HTML.
 *
 * Two are real course material: the Northwind Lab query with its result
 * (Data Analytics) and the Harbor Desk exception log with the lesson 7 problem
 * statement (Product Management). The rest are ILLUSTRATIVE and are always
 * shown with that chip: they describe the discipline, not a course that exists.
 */
import type { ReactNode } from "react"
import type { CatalogProgramSummary } from "../../lib/catalog-api"
import {
  HARBOR,
  HARBOR_EXCEPTIONS,
  HARBOR_PROBLEM,
  NORTHWIND,
  NORTHWIND_CATEGORY_SQL,
  NORTHWIND_CATEGORY_SQL_EXCERPT,
  NORTHWIND_MONTHS,
  northwindMonthName,
  rupees,
} from "./programme-content"
import "./ProgrammeArtefacts.css"

/* ── SQL on the navy workbench ────────────────────────────────────────────── */

const SQL_TOKEN = /('[^']*')|\b(SELECT|CASE|WHEN|IN|THEN|ELSE|END|AS|FROM|WHERE|AND|GROUP BY|ORDER BY|DESC)\b/g

function SqlCode({ sql }: { sql: string }) {
  const parts: ReactNode[] = []
  let last = 0
  let key = 0
  for (const match of sql.matchAll(SQL_TOKEN)) {
    const at = match.index ?? 0
    if (at > last) parts.push(sql.slice(last, at))
    parts.push(
      <span key={key++} className={match[1] ? "str" : "kw"}>
        {match[0]}
      </span>,
    )
    last = at + match[0].length
  }
  if (last < sql.length) parts.push(sql.slice(last))
  return <>{parts}</>
}

/* ── Northwind: category chart ────────────────────────────────────────────── */

const CATEGORY_MAX = NORTHWIND.categories[0].value

function categoryChartLabel(): string {
  return `Bar chart. ${NORTHWIND.categories
    .map((row, index) => `${row.name} ${row.value.toLocaleString("en-US")}${index === 0 ? " rupees" : ""}`)
    .join(", ")}.`
}

function CategoryBars() {
  return (
    <div className="pa-bars" role="img" aria-label={categoryChartLabel()}>
      {NORTHWIND.categories.map((row, index) => (
        <div className="pa-bars__row" key={row.name}>
          <span className={index === 0 ? "pa-bars__name is-on" : "pa-bars__name"}>{row.name}</span>
          <span className="pa-bars__track">
            <span
              className={index === 0 ? "sky-bar sky-bar--on" : "sky-bar"}
              style={{ width: `${((row.value / CATEGORY_MAX) * 100).toFixed(1)}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

/** Six-month trend with the lowest month marked. Used on the capstone step rail. */
export function NorthwindTrend() {
  const max = Math.max(...NORTHWIND_MONTHS.map((month) => month.value))
  const low = NORTHWIND.lowestMonth
  const high = NORTHWIND_MONTHS.reduce((top, month) => (month.value > top.value ? month : top))
  return (
    <div className="pa-trend">
      <div
        className="pa-trend__bars"
        role="img"
        aria-label={`Monthly net revenue, January to June 2026. ${northwindMonthName(high.name)} is highest at ${high.value.toLocaleString("en-US")} rupees. ${northwindMonthName(low.name)} is lowest at ${low.value.toLocaleString("en-US")}.`}
      >
        {NORTHWIND_MONTHS.map((month) => (
          <span
            key={month.name}
            className={month.name === low.name ? "is-on" : undefined}
            style={{ height: `${((month.value / max) * 100).toFixed(1)}%` }}
          />
        ))}
      </div>
      <div className="pa-trend__axis" aria-hidden="true">
        {NORTHWIND_MONTHS.map((month) => (
          <span key={month.name} className={month.name === low.name ? "is-on" : undefined}>
            {month.name.charAt(0)}
          </span>
        ))}
      </div>
      <p className="pa-trend__note">
        {northwindMonthName(low.name)} lowest, {rupees(low.value)}
      </p>
    </div>
  )
}

/* ── Hero plates (real course material) ───────────────────────────────────── */

/** The Northwind Lab: the lab's own category query, its result and the chart. */
export function NorthwindLabPlate() {
  return (
    <div className="pa-lab">
      <div className="sky-workbench__bar pa-lab__bar">
        <div className="pa-lab__tabs" aria-hidden="true">
          <span className="is-on">Query</span>
          <span>Saved work</span>
          <span>Brief</span>
        </div>
        <div className="pa-lab__meta">
          <span className="sky-mono">
            {NORTHWIND.filename} · {NORTHWIND.rows} rows
          </span>
          <span className="pa-lab__run" aria-hidden="true">
            Run query
          </span>
        </div>
      </div>

      <div className="pa-lab__code">
        <div className="pa-lab__codehead">
          <span>Northwind SQL · northwind_sales</span>
          <span>Read-only SELECT</span>
        </div>
        <pre className="sky-workbench pa-lab__sql" tabIndex={0} aria-label="The lab's revenue by category query">
          <SqlCode sql={NORTHWIND_CATEGORY_SQL} />
        </pre>
      </div>

      <div className="pa-lab__out">
        <div className="pa-lab__result">
          <p className="sky-label">Result</p>
          <table className="pa-table">
            <thead>
              <tr>
                <th scope="col">category</th>
                <th scope="col" className="is-num">
                  net_revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {NORTHWIND.categories.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td className="is-num">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pa-lab__rows">
            {NORTHWIND.categories.length} rows · {NORTHWIND.validRows} of {NORTHWIND.rows} source rows valid
          </p>
        </div>

        <div className="pa-lab__chart">
          <p className="pa-lab__charttitle">Net revenue by category, {NORTHWIND.window}</p>
          <CategoryBars />
          <p className="pa-finding">
            <span className="pa-finding__mark" aria-hidden="true" />
            <span>
              <strong>
                {NORTHWIND.topCategory} is {rupees(NORTHWIND.topValue)}, {NORTHWIND.topShare}% of valid net revenue.
              </strong>{" "}
              What you advise next is the assignment.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** The Harbor Desk case: the weekend exception log and the lesson 7 problem statement. */
export function HarborDeskPlate() {
  const ids = HARBOR_EXCEPTIONS.filter((row) => row.delivery).map((row) => row.id)
  return (
    <div className="pa-lab pa-case">
      <div className="sky-workbench__bar pa-lab__bar">
        <div className="pa-lab__tabs" aria-hidden="true">
          <span>Case notes</span>
          <span className="is-on">Exception log</span>
          <span>Interviews</span>
        </div>
        <div className="pa-lab__meta">
          <span className="sky-mono">
            {HARBOR.filename} · {HARBOR.exceptions} exceptions
          </span>
        </div>
      </div>

      <div className="pa-case__log">
        <div className="pa-case__loghead">
          <span className="sky-label">Exception log · weekend of {HARBOR.weekend}</span>
          <span className="sky-label">Written down after the fact</span>
        </div>
        <div className="pa-scroll" tabIndex={0} role="group" aria-label="Harbor Desk weekend exception log">
          <table className="pa-table pa-case__table">
            <thead>
              <tr>
                <th scope="col">id</th>
                <th scope="col">store</th>
                <th scope="col">type</th>
                <th scope="col">where it lived</th>
              </tr>
            </thead>
            <tbody>
              {HARBOR_EXCEPTIONS.map((row) => (
                <tr key={row.id} className={row.delivery ? "is-on" : undefined}>
                  <td>
                    <span className="pa-case__id">
                      {row.delivery ? <span className="pa-finding__mark" aria-hidden="true" /> : null}
                      {row.id}
                    </span>
                  </td>
                  <td>{row.store}</td>
                  <td>{row.type}</td>
                  <td>{row.lived}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pa-lab__out">
        <div className="pa-lab__result">
          <p className="sky-label">Constraint</p>
          <ul className="pa-case__constraint">
            <li>2 engineers</li>
            <li>6 weeks</li>
            <li>No new warehouse system</li>
            <li>No ERP replacement</li>
          </ul>
        </div>
        <div className="pa-lab__chart">
          <p className="pa-lab__charttitle">Problem statement, lesson 7</p>
          <dl className="pa-problem">
            {HARBOR_PROBLEM.map((row) => (
              <div key={row.label} className={"check" in row ? "is-check" : undefined}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="pa-finding">
            <span className="pa-finding__mark" aria-hidden="true" />
            <span>
              <strong>
                {HARBOR.deliveryFailures} of {HARBOR.exceptions} exceptions were customer delivery failures ({ids.join(", ")}).
              </strong>{" "}
              Which bet fits the constraint is the assignment.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Catalogue thumbnails ─────────────────────────────────────────────────── */

function NorthwindThumb() {
  return (
    <div className="pa-thumb pa-thumb--split">
      <div className="pa-thumb__code">
        <p className="pa-thumb__label">Northwind SQL · excerpt</p>
        <pre className="pa-thumb__pre">
          <SqlCode sql={NORTHWIND_CATEGORY_SQL_EXCERPT} />
        </pre>
      </div>
      <div className="pa-thumb__panel">
        <p className="pa-thumb__title">Net revenue by category</p>
        <CategoryBars />
        <p className="pa-thumb__foot">
          {NORTHWIND.topCategory}, {rupees(NORTHWIND.topValue)}
        </p>
      </div>
    </div>
  )
}

function HarborThumb() {
  return (
    <div className="pa-thumb pa-thumb--sheet">
      <p className="pa-thumb__label pa-thumb__label--row">
        <span>Problem statement</span>
        <span>Harbor Desk case</span>
      </p>
      <dl className="pa-problem">
        {HARBOR_PROBLEM.map((row) => (
          <div key={row.label} className={"check" in row ? "is-check" : undefined}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function MarkupThumb() {
  return (
    <div className="pa-thumb pa-thumb--split">
      <div className="pa-thumb__code">
        <p className="pa-thumb__label">Markup</p>
        <pre className="pa-thumb__pre">
          <span className="kw">&lt;form&gt;</span>
          {"\n "}
          <span className="kw">&lt;label&gt;</span>Email<span className="kw">&lt;/label&gt;</span>
          {"\n "}
          <span className="kw">&lt;input</span> type=<span className="str">"email"</span>
          <span className="kw">&gt;</span>
          {"\n "}
          <span className="kw">&lt;button&gt;</span>Save<span className="kw">&lt;/button&gt;</span>
          {"\n"}
          <span className="kw">&lt;/form&gt;</span>
        </pre>
      </div>
      <div className="pa-thumb__panel" aria-hidden="true">
        <p className="pa-thumb__label">Preview</p>
        <p className="pa-form__label">Email</p>
        <span className="pa-form__input" />
        <span className="pa-form__button">Save</span>
      </div>
    </div>
  )
}

const WORKFLOW = ["input", "retrieve", "model", "check", "output"] as const

function WorkflowThumb() {
  return (
    <div className="pa-thumb pa-thumb--sheet">
      <p className="pa-thumb__label">Workflow</p>
      <ol className="pa-flow" aria-label={WORKFLOW.join(", ")}>
        {WORKFLOW.map((step) => (
          <li key={step} className={step === "model" ? "is-on" : undefined}>
            <span className="pa-flow__node" aria-hidden="true" />
            <span className="pa-flow__name">{step}</span>
          </li>
        ))}
      </ol>
      <p className="pa-thumb__foot pa-thumb__foot--ruled">check fails › retrieve again</p>
    </div>
  )
}

const SPLIT = [
  { name: "train", share: 70 },
  { name: "validate", share: 15 },
  { name: "test", share: 15 },
] as const

function NotebookThumb() {
  return (
    <div className="pa-thumb pa-thumb--stack">
      <div className="pa-thumb__code">
        <p className="pa-thumb__label">Notebook cell</p>
        <pre className="pa-thumb__pre">
          train, rest = train_test_split({"\n  "}rows, test_size=<span className="str">0.3</span>){"\n"}
          valid, test = train_test_split({"\n  "}rest, test_size=<span className="str">0.5</span>)
        </pre>
      </div>
      <div className="pa-thumb__panel">
        <div className="pa-split" role="img" aria-label="A data split: train, validate, test">
          {SPLIT.map((part, index) => (
            <span key={part.name} className={index === 0 ? "is-on" : undefined} style={{ flexGrow: part.share }} />
          ))}
        </div>
        <p className="pa-thumb__foot" aria-hidden="true">{SPLIT.map((part) => part.name).join(" · ")}</p>
      </div>
    </div>
  )
}

function QueryThumb() {
  return (
    <div className="pa-thumb pa-thumb--stack">
      <div className="pa-thumb__code">
        <p className="pa-thumb__label">Query</p>
        <pre className="pa-thumb__pre">
          <span className="kw">SELECT</span> region, <span className="kw">COUNT</span>(*) <span className="kw">AS</span> orders{"\n"}
          <span className="kw">FROM</span> orders{"\n"}
          <span className="kw">GROUP BY</span> region{"\n"}
          <span className="kw">ORDER BY</span> orders <span className="kw">DESC</span>
        </pre>
      </div>
      <div className="pa-thumb__panel">
        <ol className="pa-clauses" aria-label="Clauses in reading order">
          <li>FROM</li>
          <li>GROUP BY</li>
          <li className="is-on">SELECT</li>
          <li>ORDER BY</li>
        </ol>
      </div>
    </div>
  )
}

/** For a programme with no artefact of its own: the catalogue record itself, nothing drawn. */
function RecordThumb({ program }: { program: Pick<CatalogProgramSummary, "slug" | "format" | "level" | "moduleCount"> }) {
  const rows = [
    { label: "Record", value: program.slug },
    { label: "Format", value: program.format },
    { label: "Level", value: program.level },
    { label: "Modules", value: program.moduleCount > 0 ? String(program.moduleCount) : "" },
  ].filter((row) => row.value)
  return (
    <div className="pa-thumb pa-thumb--sheet">
      <p className="pa-thumb__label">Programme outline</p>
      <dl className="pa-problem pa-problem--record">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

type ThumbEntry = { illustrative: boolean; caption: string; render: () => ReactNode }

/** Keyed by programme slug. An unknown slug gets the plain catalogue record. */
const THUMBS: Record<string, ThumbEntry> = {
  "data-analytics-pro": { illustrative: false, caption: "Northwind Lab, from the course", render: () => <NorthwindThumb /> },
  "product-management": { illustrative: false, caption: "Harbor Desk case, from the course", render: () => <HarborThumb /> },
  "full-stack": { illustrative: true, caption: "A form and its markup", render: () => <MarkupThumb /> },
  "generative-ai-program": { illustrative: true, caption: "A retrieval workflow", render: () => <WorkflowThumb /> },
  "data-science-ai": { illustrative: true, caption: "A data split in a notebook", render: () => <NotebookThumb /> },
  "sql-certificate": { illustrative: true, caption: "A grouped query", render: () => <QueryThumb /> },
}

export function programmeThumbInfo(slug: string): { hasArtefact: boolean; illustrative: boolean; caption: string } {
  const entry = THUMBS[slug]
  return entry
    ? { hasArtefact: true, illustrative: entry.illustrative, caption: entry.caption }
    : { hasArtefact: false, illustrative: false, caption: "Programme outline" }
}

export function ProgrammeThumb({
  program,
}: {
  program: Pick<CatalogProgramSummary, "slug" | "format" | "level" | "moduleCount">
}) {
  const entry = THUMBS[program.slug]
  return <>{entry ? entry.render() : <RecordThumb program={program} />}</>
}


/* ── Additional Authored Discipline Plates (Data Science, Full-Stack, GenAI) ── */

export function DataSciencePlate() {
  const cohorts = [
    { cohort: "2026-Q1 · Enterprise", accounts: 420, retention90d: "88.4%", leakage: "0.0% (Verified)" },
    { cohort: "2026-Q1 · Mid-Market", accounts: 510, retention90d: "74.2%", leakage: "0.0% (Verified)" },
    { cohort: "2026-Q2 · SMB Promo", accounts: 310, retention90d: "51.6%", leakage: "Flagged: 14.5% discount" },
  ]
  return (
    <div className="pa-lab">
      <div className="sky-workbench__bar pa-lab__bar">
        <div className="pa-lab__tabs" aria-hidden="true">
          <span className="is-on">Cohort Pipeline (Python + SQL)</span>
          <span>Out-of-Time Split</span>
          <span>Brief</span>
        </div>
        <div className="pa-lab__meta">
          <span className="sky-mono">churn_cohort_audit.py · 1,240 accounts</span>
          <span className="pa-lab__run" aria-hidden="true"> Verified Split</span>
        </div>
      </div>

      <div className="pa-lab__code">
        <div className="pa-lab__codehead">
          <span>Python 3 + SQL · Out-of-Time Cohort Validator</span>
          <span>Zero Target Leakage</span>
        </div>
        <pre className="sky-workbench pa-lab__sql" tabIndex={0} aria-label="Out-of-time cohort retention validation">
{`def validate_cohort_split(df, cutoff="2026-04-01"):
    train = df[df["order_date"] < cutoff].query("returned == 'no'")
    holdout = df[df["order_date"] >= cutoff]
    assert set(train["tx_id"]).isdisjoint(holdout["tx_id"]), "Leakage blocked"
    return compute_net_retention_by_tier(train, holdout)`}
        </pre>
      </div>

      <div className="pa-lab__out">
        <div className="pa-lab__result">
          <p className="sky-label">Cohort Validation Output</p>
          <table className="pa-table">
            <thead>
              <tr>
                <th scope="col">cohort_segment</th>
                <th scope="col" className="is-num">90d_retention</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((row) => (
                <tr key={row.cohort}>
                  <td>{row.cohort}</td>
                  <td className="is-num">{row.retention90d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pa-lab__rows">3 segments · Out-of-time boundary verified · 0 post-event features</p>
        </div>

        <div className="pa-lab__chart">
          <p className="pa-lab__charttitle">90-Day Net Revenue Retention by Acquisition Tier</p>
          <div className="pa-bars">
            {[
              { name: "Enterprise", pct: 88.4, on: true },
              { name: "Mid-Market", pct: 74.2, on: false },
              { name: "SMB Promo", pct: 51.6, on: false },
            ].map((item) => (
              <div className="pa-bars__row" key={item.name}>
                <span className={item.on ? "pa-bars__name is-on" : "pa-bars__name"}>{item.name}</span>
                <span className="pa-bars__track">
                  <span className={item.on ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${item.pct}%` }} />
                </span>
              </div>
            ))}
          </div>
          <p className="pa-finding">
            <span className="pa-finding__mark" aria-hidden="true" />
            <span>
              <strong>SMB Promo retention drops to 51.6% when discount_pct exceeds 12%.</strong> Your capstone combines SQL margin joins with Python cohort validation.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function FullStackPlate() {
  return (
    <div className="pa-lab">
      <div className="sky-workbench__bar pa-lab__bar">
        <div className="pa-lab__tabs" aria-hidden="true">
          <span className="is-on">Ledger Transaction</span>
          <span>Outbox Worker</span>
          <span>RBAC Audit</span>
        </div>
        <div className="pa-lab__meta">
          <span className="sky-mono">ledger_service.ts · PostgreSQL ACID</span>
          <span className="pa-lab__run" aria-hidden="true">0 Double-Spends</span>
        </div>
      </div>

      <div className="pa-lab__code">
        <div className="pa-lab__codehead">
          <span>TypeScript + PostgreSQL · Idempotent Webhook Settlement</span>
          <span>Serializable Isolation</span>
        </div>
        <pre className="sky-workbench pa-lab__sql" tabIndex={0} aria-label="Idempotent payment ledger SQL transaction">
{`BEGIN ISOLATION LEVEL SERIALIZABLE;
INSERT INTO payment_ledger (gateway_tx_id, account_id, amount_paise, status)
VALUES ($1, $2, $3, 'SETTLED')
ON CONFLICT (gateway_tx_id) DO NOTHING
RETURNING ledger_id, created_at;
COMMIT;`}
        </pre>
      </div>

      <div className="pa-lab__out">
        <div className="pa-lab__result">
          <p className="sky-label">Concurrency Stress Suite (50 Parallel Retries)</p>
          <table className="pa-table">
            <thead>
              <tr>
                <th scope="col">invariant_check</th>
                <th scope="col" className="is-num">status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Duplicate webhook replay (x50)</td>
                <td className="is-num">1 Settled · 49 Ignored</td>
              </tr>
              <tr>
                <td>Transactional outbox dispatch</td>
                <td className="is-num">Atomic (p95: 18 ms)</td>
              </tr>
              <tr>
                <td>Cross-tenant IDOR guard</td>
                <td className="is-num">403 Blocked</td>
              </tr>
            </tbody>
          </table>
          <p className="pa-lab__rows">All 6 production architecture invariants verified in sandbox</p>
        </div>

        <div className="pa-lab__chart">
          <p className="pa-lab__charttitle">System Throughput &amp; Idempotency Guarantees</p>
          <div className="pa-bars">
            {[
              { name: "Ledger ACID", pct: 100, on: true },
              { name: "Outbox Sync", pct: 98, on: false },
              { name: "RBAC Guard", pct: 100, on: false },
            ].map((item) => (
              <div className="pa-bars__row" key={item.name}>
                <span className={item.on ? "pa-bars__name is-on" : "pa-bars__name"}>{item.name}</span>
                <span className="pa-bars__track">
                  <span className={item.on ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${item.pct}%` }} />
                </span>
              </div>
            ))}
          </div>
          <p className="pa-finding">
            <span className="pa-finding__mark" aria-hidden="true" />
            <span>
              <strong>Composite unique keys + row-level locking prevent duplicate payouts.</strong> You architect the schema, API route, and React state flow.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function GenAiRagPlate() {
  return (
    <div className="pa-lab">
      <div className="sky-workbench__bar pa-lab__bar">
        <div className="pa-lab__tabs" aria-hidden="true">
          <span className="is-on">Grounded RAG Evaluator</span>
          <span>Citation Gate</span>
          <span>Refusal Policy</span>
        </div>
        <div className="pa-lab__meta">
          <span className="sky-mono">rag_eval_harness.ts · Hybrid BM25 + Vector</span>
          <span className="pa-lab__run" aria-hidden="true">98.2% Faithfulness</span>
        </div>
      </div>

      <div className="pa-lab__code">
        <div className="pa-lab__codehead">
          <span>Enterprise RAG · Metadata Filter &amp; Citation Gate</span>
          <span>Strict Grounding</span>
        </div>
        <pre className="sky-workbench pa-lab__sql" tabIndex={0} aria-label="Grounded RAG retrieval and citation verification">
{`SELECT chunk_id, doc_title, effective_date, cosine_sim(embedding, $1) AS score
FROM policy_chunks
WHERE status = 'ACTIVE' AND effective_date >= '2026-01-01'
  AND cosine_sim(embedding, $1) >= 0.82
ORDER BY score DESC LIMIT 4;`}
        </pre>
      </div>

      <div className="pa-lab__out">
        <div className="pa-lab__result">
          <p className="sky-label">Golden Dataset Evaluation (120 Adversarial Prompts)</p>
          <table className="pa-table">
            <thead>
              <tr>
                <th scope="col">evaluation_metric</th>
                <th scope="col" className="is-num">verified_score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Citation Attribution ([chunk_id])</td>
                <td className="is-num">100.0%</td>
              </tr>
              <tr>
                <td>Deprecated 2023 Policy Leakage</td>
                <td className="is-num">0.0% (Filtered)</td>
              </tr>
              <tr>
                <td>Prompt-Injection Refusal Rate</td>
                <td className="is-num">99.2%</td>
              </tr>
            </tbody>
          </table>
          <p className="pa-lab__rows">p95 latency: 1,140 ms · Low-confidence queries cleanly abstain</p>
        </div>

        <div className="pa-lab__chart">
          <p className="pa-lab__charttitle">Faithfulness Before vs After Metadata Citation Gate</p>
          <div className="pa-bars">
            {[
              { name: "Grounded RAG", pct: 98.2, on: true },
              { name: "Naive Vector", pct: 64.0, on: false },
              { name: "Raw Prompt", pct: 41.5, on: false },
            ].map((item) => (
              <div className="pa-bars__row" key={item.name}>
                <span className={item.on ? "pa-bars__name is-on" : "pa-bars__name"}>{item.name}</span>
                <span className="pa-bars__track">
                  <span className={item.on ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${item.pct}%` }} />
                </span>
              </div>
            ))}
          </div>
          <p className="pa-finding">
            <span className="pa-finding__mark" aria-hidden="true" />
            <span>
              <strong>Filtering deprecated chunks eliminated 19% ungrounded refund claims.</strong> You design the retrieval schema, refusal gate, and evaluation rubric.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
