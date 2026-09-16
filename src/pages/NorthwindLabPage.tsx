import { useEffect, useMemo, useState, type KeyboardEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { workspaceErrorMessage } from "../lib/http"
import {
  fetchNorthwindLab,
  fetchNorthwindLabWork,
  isGuidedRunResult,
  isSqlRunResult,
  listNorthwindLabWork,
  northwindLabPath,
  runNorthwindLab,
  runNorthwindSql,
  saveNorthwindLabWork,
  type LabGuidedRunResult,
  type LabSqlCell,
  type LabSqlRunResult,
  type LabWorkspace,
  type SavedLabWorkSummary,
} from "../lib/labs-api"
import LabSqlChart from "../components/labs/LabSqlChart"
import "./LearnWorkspace.css"
import "./LabsWorkspace.css"

function savedWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Saved"
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return "Today"
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function lessonReturnTo(lessonKey?: string | null) {
  return lessonKey ? `/learn/data-analytics/${lessonKey}` : "/learn/data-analytics"
}

function formatColumnName(name: string) {
  const cleaned = name.replace(/_/g, " ").trim()
  if (!cleaned) return name
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function columnIsNumeric(rows: LabSqlCell[][], index: number) {
  return rows.some((row) => typeof row[index] === "number") && rows.every((row) => {
    const value = row[index]
    return value == null || value === "" || typeof value === "number"
  })
}

function formatSqlCell(column: string, value: LabSqlCell) {
  if (value == null || value === "") return ""
  if (typeof value === "number") {
    const formatted = Number.isInteger(value)
      ? value.toLocaleString("en-US")
      : value.toLocaleString("en-US", { maximumFractionDigits: 2 })
    if (/revenue|amount/i.test(column)) return `₹${formatted}`
    return formatted
  }
  return value
}

export default function NorthwindLabPage() {
  const [params, setParams] = useSearchParams()
  const lessonKey = params.get("lesson")
  const workId = params.get("work")
  const mode = params.get("mode") === "sql" ? "sql" : "analysis"
  const [workspace, setWorkspace] = useState<LabWorkspace | null>(null)
  const [saved, setSaved] = useState<SavedLabWorkSummary[]>([])
  const [guidedResult, setGuidedResult] = useState<LabGuidedRunResult | null>(null)
  const [sqlResult, setSqlResult] = useState<LabSqlRunResult | null>(null)
  const [query, setQuery] = useState("")
  const [resultView, setResultView] = useState<"table" | "chart">("table")
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "forbidden">("loading")
  const [busy, setBusy] = useState<"run" | "save" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  const operation = workspace?.operations[0]?.id ?? "valid_net_revenue"

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    setError(null)
    void Promise.all([
      fetchNorthwindLab(lessonKey, controller.signal),
      listNorthwindLabWork(controller.signal),
    ])
      .then(([nextWorkspace, nextSaved]) => {
        setWorkspace(nextWorkspace)
        setSaved(nextSaved)
        setStatus("ready")
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        const message = workspaceErrorMessage(err)
        if (/enrol/i.test(message) || /403/.test(message)) {
          setStatus("forbidden")
          setError("Enrol in Data Analytics to practise in this lab.")
          return
        }
        setStatus("error")
        setError(message || "Could not open this lab.")
      })
    return () => controller.abort()
  }, [lessonKey])

  useEffect(() => {
    if (!workId || status !== "ready") return
    const controller = new AbortController()
    void fetchNorthwindLabWork(workId, controller.signal)
      .then((work) => {
        setSavedNotice(null)
        setError(null)
        if (isSqlRunResult(work.result)) {
          setSqlResult(work.result)
          setQuery(work.query || work.result.query)
          if (!work.result.chart.chartable) setResultView("table")
          setParams((current) => {
            const next = new URLSearchParams(current)
            next.set("mode", "sql")
            return next
          }, { replace: true })
          return
        }
        if (isGuidedRunResult(work.result)) {
          setGuidedResult(work.result)
          setParams((current) => {
            const next = new URLSearchParams(current)
            next.delete("mode")
            return next
          }, { replace: true })
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(workspaceErrorMessage(err) || "Could not open that saved work.")
      })
    return () => controller.abort()
  }, [workId, status, setParams])

  const sampleHeaders = useMemo(() => workspace?.dataset.columns.map((col) => col.name) ?? [], [workspace])
  const sqlColumns = workspace?.sql.columns.length ? workspace.sql.columns : workspace?.dataset.columns ?? []

  function setMode(nextMode: "analysis" | "sql") {
    setError(null)
    setSavedNotice(null)
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (nextMode === "sql") next.set("mode", "sql")
      else next.delete("mode")
      return next
    }, { replace: true })
  }

  async function onRunAnalysis() {
    setBusy("run")
    setError(null)
    setSavedNotice(null)
    try {
      const next = await runNorthwindLab({ operation, lessonKey })
      setGuidedResult(next)
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not run that analysis.")
    } finally {
      setBusy(null)
    }
  }

  async function onRunSql() {
    if (busy) return
    setBusy("run")
    setError(null)
    setSavedNotice(null)
    try {
      const next = await runNorthwindSql({ query, lessonKey })
      setSqlResult(next)
      if (!next.chart.chartable) setResultView("table")
    } catch (err) {
      setSqlResult(null)
      setError(workspaceErrorMessage(err) || "That query could not be run.")
    } finally {
      setBusy(null)
    }
  }

  async function onSave() {
    setBusy("save")
    setError(null)
    try {
      const work =
        mode === "sql"
          ? await saveNorthwindLabWork({ operation: "sql", query, lessonKey })
          : await saveNorthwindLabWork({ operation, lessonKey })
      if (isSqlRunResult(work.result)) setSqlResult(work.result)
      if (isGuidedRunResult(work.result)) setGuidedResult(work.result)
      setSaved((current) => [work, ...current.filter((row) => row.id !== work.id)].slice(0, 20))
      setSavedNotice("Saved to your lab work.")
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.set("work", work.id)
        if (mode === "sql") next.set("mode", "sql")
        return next
      }, { replace: true })
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not save that work.")
    } finally {
      setBusy(null)
    }
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void onRunSql()
    }
  }

  if (status === "loading") {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Skylent Labs</p>
          <p>Loading the Northwind lab…</p>
        </div>
      </div>
    )
  }

  if (status === "forbidden") {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Skylent Labs</p>
          <h1>Practice this from Data Analytics.</h1>
          <p>{error}</p>
          <div className="os-actions">
            <Link className="os-btn os-btn-primary" to="/learn/data-analytics">
              Open Data Analytics
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === "error" || !workspace) {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Skylent Labs</p>
          <h1>This lab could not load.</h1>
          <p>{error ?? "Try returning to the lesson."}</p>
          <div className="os-actions">
            <Link className="os-btn os-btn-primary" to={lessonReturnTo(lessonKey)}>
              Return to lesson
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeResult = mode === "sql" ? sqlResult : guidedResult
  const canSave = mode === "sql" ? Boolean(sqlResult) : Boolean(guidedResult)

  return (
    <div className="lab-shell">
      <header className="lab-top">
        <Link className="lab-brand" to={northwindLabPath(lessonKey, null, mode)}>
          <strong>Skylent Labs</strong>
          <span>Northwind Lab</span>
        </Link>
        <p className="lab-top-course">{workspace.courseTitle}</p>
        <div className="lab-top-actions">
          <Link className="os-btn os-btn-ghost" to={lessonReturnTo(workspace.lesson?.lessonKey ?? lessonKey)}>
            Return to lesson
          </Link>
        </div>
      </header>

      <div className="lab-context">
        <p>
          You are practising:{" "}
          <strong>{workspace.lesson?.lessonTitle ?? "Data Analytics"}</strong>
        </p>
        <p>
          Dataset: <strong>{workspace.dataset.filename}</strong>
        </p>
      </div>

      <div className="lab-body">
        <div className={`lab-grid${mode === "sql" ? " lab-grid-sql" : ""}`}>
          <aside className="lab-rail">
            <p className="os-eyebrow">Dataset</p>
            <h2>{workspace.dataset.filename}</h2>
            <p className="lab-filename">{workspace.dataset.totalRows} order lines</p>
            <p>{workspace.dataset.description}</p>
            <div className="lab-schema">
              <p className="os-eyebrow">SQL schema</p>
              <p className="lab-filename">{workspace.sql.table}</p>
              <ul className="lab-columns">
                {sqlColumns.map((column) => (
                  <li key={column.name}>
                    {column.name}
                    <span>{column.type}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p>Valid-row rule: {workspace.dataset.validRowRule.join("; ")}.</p>
            <div className="lab-table-wrap">
              <table className="lab-table">
                <thead>
                  <tr>
                    {sampleHeaders.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workspace.dataset.sampleRows.map((row, index) => (
                    <tr key={`${row.order_id ?? index}-${index}`}>
                      {sampleHeaders.map((header) => (
                        <td key={header}>{row[header] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="lab-meta-list">
              {workspace.dataset.qualityNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </aside>

          <section className="lab-workspace">
            <div className="lab-modes" role="tablist" aria-label="Lab mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "analysis"}
                className={mode === "analysis" ? "is-active" : undefined}
                onClick={() => setMode("analysis")}
              >
                Quick analysis
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "sql"}
                className={mode === "sql" ? "is-active" : undefined}
                onClick={() => setMode("sql")}
              >
                Northwind SQL
              </button>
            </div>

            {mode === "analysis" ? (
              <>
                <p className="os-eyebrow">Workspace</p>
                <h2>Analysis</h2>
                <div className="lab-run-box">
                  <div>
                    <label htmlFor="lab-operation">Operation</label>
                    <select id="lab-operation" value={operation} disabled>
                      {workspace.operations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p>{workspace.operations[0]?.summary}</p>
                  <p className="lab-formula">net_revenue = units × unit_price × (1 − discount_pct / 100)</p>
                  <button type="button" className="os-btn os-btn-primary" onClick={() => void onRunAnalysis()} disabled={busy !== null}>
                    {busy === "run" ? "Running…" : "Run"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="os-eyebrow">{workspace.sql.dialect}</p>
                <h2>Write a query against this dataset.</h2>
                <p>Read-only SELECT on <span className="lab-filename">{workspace.sql.table}</span>. This is not PostgreSQL and not the application database.</p>
                <label className="lab-sr" htmlFor="lab-sql-editor">SQL query</label>
                <textarea
                  id="lab-sql-editor"
                  className="lab-sql-editor"
                  spellCheck={false}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onEditorKeyDown}
                  placeholder={"SELECT category, SUM(units)\nFROM northwind_sales\nGROUP BY category;"}
                  disabled={busy !== null}
                />
                <div className="lab-sql-actions">
                  <button type="button" className="os-btn os-btn-primary" onClick={() => void onRunSql()} disabled={busy !== null}>
                    {busy === "run" ? "Running…" : "Run query"}
                  </button>
                  <p>Ctrl or Cmd + Enter runs the query.</p>
                </div>
                <div className="lab-examples">
                  <p className="os-eyebrow">Examples</p>
                  <div className="lab-example-row">
                    {workspace.sql.examples.map((example) => (
                      <button
                        key={example.id}
                        type="button"
                        className="lab-example"
                        onClick={() => {
                          setQuery(example.sql)
                          setError(null)
                          setSavedNotice(null)
                        }}
                        disabled={busy !== null}
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lab-prompts">
                  <p className="os-eyebrow">Try it yourself</p>
                  <ul>
                    {workspace.sql.prompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {error ? (
              <div className="lab-error" role="alert">
                {mode === "sql" ? <strong>Query error</strong> : null}
                <p>{error}</p>
              </div>
            ) : null}
            {savedNotice ? <p className="lab-note">{savedNotice}</p> : null}
          </section>

          <section className="lab-results">
            <p className="os-eyebrow">Results</p>
            <h2>Output</h2>
            {mode === "analysis" && guidedResult ? (
              <>
                <div className="lab-metrics">
                  <div className="lab-metric">
                    <span>Valid rows</span>
                    <strong>{guidedResult.validRows}</strong>
                  </div>
                  <div className="lab-metric">
                    <span>Net revenue</span>
                    <strong>{guidedResult.netRevenueLabel}</strong>
                  </div>
                  <div className="lab-metric">
                    <span>Category</span>
                    <strong>{guidedResult.topCategory}</strong>
                  </div>
                </div>
                <p>{guidedResult.explanation}</p>
                <p>Rule: {guidedResult.validRowRule.join("; ")}. {guidedResult.excludedRows} rows excluded from {guidedResult.totalRows}.</p>
                {guidedResult.categoryMapping.length ? (
                  <p>
                    Mapping logged:{" "}
                    {guidedResult.categoryMapping.map((item) => `${item.from} → ${item.to}`).join("; ")}.
                  </p>
                ) : null}
                <div className="lab-table-wrap">
                  <table className="lab-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Valid rows</th>
                        <th>Net revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guidedResult.categories.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.validRows}</td>
                          <td>{row.netRevenueLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}

            {mode === "sql" && sqlResult ? (
              <>
                <p className="lab-sql-status">
                  {sqlResult.rowCount} row{sqlResult.rowCount === 1 ? "" : "s"} returned
                  {sqlResult.truncated ? " · showing the first 500 rows" : ""}
                </p>
                {sqlResult.chart.chartable ? (
                  <div className="lab-result-views" role="tablist" aria-label="Result view">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={resultView === "table"}
                      className={resultView === "table" ? "is-active" : undefined}
                      onClick={() => setResultView("table")}
                    >
                      Table
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={resultView === "chart"}
                      className={resultView === "chart" ? "is-active" : undefined}
                      onClick={() => setResultView("chart")}
                    >
                      Chart
                    </button>
                  </div>
                ) : sqlResult.rowCount >= 2 ? (
                  <p className="lab-chart-hint">Chart view is available for results with a clear label and numeric value.</p>
                ) : null}
                {resultView === "chart" && sqlResult.chart.chartable ? (
                  <LabSqlChart chart={sqlResult.chart} />
                ) : (
                  <>
                    <div className="lab-table-wrap lab-sql-table">
                      <table className="lab-table">
                        <thead>
                          <tr>
                            {sqlResult.columns.map((column) => (
                              <th
                                key={column}
                                className={columnIsNumeric(sqlResult.rows, sqlResult.columns.indexOf(column)) ? "is-num" : undefined}
                              >
                                {formatColumnName(column)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlResult.rows.map((row, index) => (
                            <tr key={`sql-${index}`}>
                              {sqlResult.columns.map((column, colIndex) => (
                                <td
                                  key={`${column}-${colIndex}`}
                                  className={columnIsNumeric(sqlResult.rows, colIndex) ? "is-num" : undefined}
                                >
                                  {formatSqlCell(column, row[colIndex] ?? null)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {sqlResult.rows.length === 0 ? <p>The query ran and returned no rows.</p> : null}
                  </>
                )}
              </>
            ) : null}

            {!activeResult ? (
              <p>
                {mode === "sql"
                  ? "Run a SELECT to inspect rows calculated from northwind_sales."
                  : "Run the analysis to see totals calculated from the dataset."}
              </p>
            ) : null}

            {canSave ? (
              <button type="button" className="os-btn os-btn-primary" onClick={() => void onSave()} disabled={busy !== null}>
                {busy === "save" ? "Saving…" : "Save work"}
              </button>
            ) : null}

            <div className="lab-saved">
              <p className="os-eyebrow">Saved work</p>
              {saved.length === 0 ? <p>Nothing saved yet. Results stay in this lab; they are not a certificate.</p> : null}
              {saved.map((item) => (
                <article key={item.id}>
                  <h3>{item.title}</h3>
                  <p>Dataset: {item.dataset}</p>
                  <p>Operation: {item.operationLabel}</p>
                  <p>
                    {item.operation === "sql"
                      ? `Rows returned: ${item.rowCount ?? "—"}`
                      : `Result: ${item.validRows ?? "—"} valid rows${item.netRevenueLabel ? ` · ${item.netRevenueLabel}` : ""}`}
                  </p>
                  <p>Saved: {savedWhen(item.createdAt)}</p>
                  <Link className="os-link" to={northwindLabPath(lessonKey, item.id, item.operation === "sql" ? "sql" : "analysis")}>
                    Open
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
        <p className="lab-disclaimer">{workspace.disclaimer}</p>
      </div>
    </div>
  )
}
