import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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
  mockDefenseHref?: string
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
        <h2 id="career-rise-title">Career Rise · 60% Milestone Tracker</h2>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#ede9fe", color: "#4f46e5" }}>
          Merit Gate: 60%
        </span>
      </header>
      <p className="sh-empty" style={{ paddingBottom: 8 }}>
        Complete 60% of your active course (3 of 5 modules) to unlock Career Rise — including mock interview practice, verified project linking, and role skill-gap matching in Career OS.
      </p>
      {error ? <p className="sh-empty">{error}</p> : null}
      {rows == null ? <p className="sh-empty">Checking eligibility…</p> : rows.length === 0 ? (
        <p className="sh-empty">No enrolled curriculum yet, so Career Rise is not available.</p>
      ) : (
        <ul className="sh-rows">
          {rows.map((row) => (
            <li key={`${row.kind}:${row.slug}`} className="sh-row">
              <div className="sh-row-main">
                <strong>{row.title}</strong>
                <span className="sh-note">{row.completedModules} of {row.totalModules} modules complete · {row.percent}% progress</span>
                <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${row.title} Career Rise progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.percent}>
                  <span style={{ width: `${row.percent}%` }} />
                </div>
                {row.enrolled ? (
                  <span className="sh-note" style={{ display: "block", marginTop: 4, color: "#047857", fontWeight: 600 }}>
                    ✓ 60% Curriculum Gate · ✓ Case Evidence · ✓ Mock Interview Defense
                  </span>
                ) : null}
              </div>
              {row.enrolled ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span className="os-status is-done">Unlocked</span>
                  <Link
                    className="os-link"
                    to={row.mockDefenseHref ?? `/career-os/interviews?track=${encodeURIComponent(row.slug)}`}
                  >
                    Start Mock Defense →
                  </Link>
                </div>
              ) : row.eligible ? (
                <button type="button" className="os-btn os-btn-primary" disabled={pending === row.slug} onClick={() => void enrol(row)}>
                  {pending === row.slug ? "Unlocking…" : "Unlock Career Rise →"}
                </button>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "#f1f5f9", color: "#475569" }}>
                  Unlocks at {row.thresholdPercent}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
