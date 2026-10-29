import { useEffect, useState } from "react"
import { apiV1 } from "../../lib/api-base"
import { ensureCsrfToken } from "../../lib/auth-api"

type RiseRow = {
  kind: "course" | "program"
  slug: string
  title: string
  percent: number
  eligible: boolean
  enrolled: boolean
  completedModules: number
  totalModules: number
  thresholdPercent: number
}

export default function CareerRiseCard() {
  const [rows, setRows] = useState<RiseRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void fetch(`${apiV1()}/career-rise`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({})) as { data?: RiseRow[]; error?: string }
        if (!response.ok) throw new Error(body.error || "Career Rise could not be loaded")
        setRows(body.data ?? [])
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : "Career Rise could not be loaded")
      })
    return () => controller.abort()
  }, [])

  async function enrol(row: RiseRow) {
    setPending(row.slug)
    setError(null)
    try {
      const token = await ensureCsrfToken()
      const response = await fetch(`${apiV1()}/career-rise/enrolments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify(row.kind === "course" ? { courseSlug: row.slug } : { programSlug: row.slug }),
      })
      const body = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(body.error || "Career Rise enrolment was refused")
      setRows((current) => current?.map((item) => item.slug === row.slug && item.kind === row.kind ? { ...item, enrolled: true } : item) ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Career Rise enrolment was refused")
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="sh-card" aria-labelledby="career-rise-title">
      <header className="sh-card-head">
        <h2 id="career-rise-title">Career Rise</h2>
      </header>
      <p className="sh-note">Career Rise opens after you complete 60% of a course or programme and choose to enrol. It does not unlock Career OS.</p>
      {error ? <p className="sh-empty">{error}</p> : null}
      {rows == null ? <p className="sh-note">Checking eligibility…</p> : rows.length === 0 ? (
        <p className="sh-empty">No enrolled curriculum yet, so Career Rise is not available.</p>
      ) : (
        <ul className="sh-rows">
          {rows.map((row) => (
            <li key={`${row.kind}:${row.slug}`} className="sh-row">
              <div className="sh-row-main">
                <strong>{row.title}</strong>
                <span className="sh-note">{row.completedModules} of {row.totalModules} modules · {row.percent}%</span>
              </div>
              {row.enrolled ? <span className="os-status is-done">Enrolled</span> : row.eligible ? (
                <button type="button" className="os-link" disabled={pending === row.slug} onClick={() => void enrol(row)}>
                  {pending === row.slug ? "Enrolling…" : "Enrol in Career Rise"}
                </button>
              ) : <span className="sh-note">Available at {row.thresholdPercent}%</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
