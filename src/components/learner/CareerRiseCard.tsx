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
        const body = (await response.json().catch(() => ({}))) as { data?: RiseRow[]; error?: string }
        if (!response.ok) throw new Error(body.error || "Unable to load milestones")
        setRows(body.data ?? [])
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setRows([])
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
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(body.error || "Unable to activate interview prep")
      setRows((current) =>
        current?.map((item) => (item.slug === row.slug && item.kind === row.kind ? { ...item, enrolled: true } : item)) ?? null,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate interview prep")
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="sh-card" aria-labelledby="career-rise-title">
      <header className="sh-card-head">
        <h2 id="career-rise-title">Mock Interview &amp; Portfolio Milestones</h2>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#f3f0ff", color: "#5142b5" }}>
          Career Prep
        </span>
      </header>
      <p className="sh-empty" style={{ paddingBottom: 8 }}>
        Track your module milestones to unlock AI &amp; Faculty mock interview practice and verified portfolio linking.
      </p>
      {error ? <p className="sh-empty">{error}</p> : null}
      {rows == null ? (
        <p className="sh-empty">Loading course milestones…</p>
      ) : rows.length === 0 ? (
        <p className="sh-empty">Enrol in a course to track your mock interview and portfolio readiness.</p>
      ) : (
        <ul className="sh-rows">
          {rows.map((row) => (
            <li key={`${row.kind}:${row.slug}`} className="sh-row">
              <div className="sh-row-main">
                <strong>{row.title}</strong>
                <span className="sh-note">
                  {row.completedModules} of {row.totalModules} modules completed · {row.percent}% progress
                </span>
                <div
                  className="os-progress-bar sh-row-bar"
                  role="progressbar"
                  aria-label={`${row.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={row.percent}
                >
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
                  <span className="os-status is-done">Active</span>
                  <Link
                    className="os-link"
                    to={row.mockDefenseHref ?? `/career-os/interviews?track=${encodeURIComponent(row.slug)}`}
                  >
                    Start Mock Defense →
                  </Link>
                </div>
              ) : row.eligible ? (
                <button
                  type="button"
                  className="os-btn os-btn-primary"
                  disabled={pending === row.slug}
                  onClick={() => void enrol(row)}
                >
                  {pending === row.slug ? "Activating…" : "Unlock Mock Interviews →"}
                </button>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "#f1f5f9", color: "#475569" }}>
                  {row.percent}% / {row.thresholdPercent}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
