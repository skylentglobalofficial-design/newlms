import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { workspaceErrorMessage } from "../lib/http"
import {
  fetchNorthwindLab,
  fetchNorthwindLabWork,
  listNorthwindLabWork,
  northwindLabPath,
  runNorthwindLab,
  saveNorthwindLabWork,
  type LabRunResult,
  type LabWorkspace,
  type SavedLabWorkSummary,
} from "../lib/labs-api"
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

export default function NorthwindLabPage() {
  const [params, setParams] = useSearchParams()
  const lessonKey = params.get("lesson")
  const workId = params.get("work")
  const [workspace, setWorkspace] = useState<LabWorkspace | null>(null)
  const [saved, setSaved] = useState<SavedLabWorkSummary[]>([])
  const [result, setResult] = useState<LabRunResult | null>(null)
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
        setResult(work.result)
        setSavedNotice(null)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(workspaceErrorMessage(err) || "Could not open that saved work.")
      })
    return () => controller.abort()
  }, [workId, status])

  const sampleHeaders = useMemo(() => workspace?.dataset.columns.map((col) => col.name) ?? [], [workspace])

  async function onRun() {
    setBusy("run")
    setError(null)
    setSavedNotice(null)
    try {
      const next = await runNorthwindLab({ operation, lessonKey })
      setResult(next)
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not run that analysis.")
    } finally {
      setBusy(null)
    }
  }

  async function onSave() {
    setBusy("save")
    setError(null)
    try {
      const work = await saveNorthwindLabWork({ operation, lessonKey })
      setResult(work.result)
      setSaved((current) => [work, ...current.filter((row) => row.id !== work.id)].slice(0, 20))
      setSavedNotice("Saved to your lab work.")
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.set("work", work.id)
        return next
      }, { replace: true })
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not save that work.")
    } finally {
      setBusy(null)
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

  return (
    <div className="lab-shell">
      <header className="lab-top">
        <Link className="lab-brand" to={northwindLabPath(lessonKey)}>
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
        <div className="lab-grid">
          <aside className="lab-panel">
            <p className="os-eyebrow">Dataset</p>
            <h2>{workspace.dataset.filename}</h2>
            <p className="lab-filename">{workspace.dataset.totalRows} order lines</p>
            <p>{workspace.dataset.description}</p>
            <ul className="lab-columns">
              {workspace.dataset.columns.map((column) => (
                <li key={column.name}>
                  {column.name}
                  <span>{column.type}</span>
                </li>
              ))}
            </ul>
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

          <section className="lab-panel">
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
              <p className="lab-formula">{workspace.operations[0] ? "net_revenue = units × unit_price × (1 − discount_pct / 100)" : ""}</p>
              <button type="button" className="os-btn os-btn-primary" onClick={() => void onRun()} disabled={busy !== null}>
                {busy === "run" ? "Running…" : "Run"}
              </button>
            </div>
            {error ? <p className="lab-error" role="alert">{error}</p> : null}
            {savedNotice ? <p className="lab-note">{savedNotice}</p> : null}
          </section>

          <section className="lab-panel">
            <p className="os-eyebrow">Results</p>
            <h2>Output</h2>
            {result ? (
              <>
                <div className="lab-metrics">
                  <div className="lab-metric">
                    <span>Valid rows</span>
                    <strong>{result.validRows}</strong>
                  </div>
                  <div className="lab-metric">
                    <span>Net revenue</span>
                    <strong>{result.netRevenueLabel}</strong>
                  </div>
                  <div className="lab-metric">
                    <span>Category</span>
                    <strong>{result.topCategory}</strong>
                  </div>
                </div>
                <p>{result.explanation}</p>
                <p>Rule: {result.validRowRule.join("; ")}. {result.excludedRows} rows excluded from {result.totalRows}.</p>
                {result.categoryMapping.length ? (
                  <p>
                    Mapping logged:{" "}
                    {result.categoryMapping.map((item) => `${item.from} → ${item.to}`).join("; ")}.
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
                      {result.categories.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.validRows}</td>
                          <td>{row.netRevenueLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="os-btn os-btn-primary" onClick={() => void onSave()} disabled={busy !== null}>
                  {busy === "save" ? "Saving…" : "Save work"}
                </button>
              </>
            ) : (
              <p>Run the analysis to see totals calculated from the dataset.</p>
            )}

            <div className="lab-saved">
              <p className="os-eyebrow">Saved work</p>
              {saved.length === 0 ? <p>Nothing saved yet. Results stay in this lab; they are not a certificate.</p> : null}
              {saved.map((item) => (
                <article key={item.id}>
                  <h3>{item.title}</h3>
                  <p>Dataset: {item.dataset}</p>
                  <p>Operation: {item.operationLabel}</p>
                  <p>
                    Result: {item.validRows ?? "—"} valid rows
                    {item.netRevenueLabel ? ` · ${item.netRevenueLabel}` : ""}
                  </p>
                  <p>Saved: {savedWhen(item.createdAt)}</p>
                  <Link className="os-link" to={northwindLabPath(lessonKey, item.id)}>
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
