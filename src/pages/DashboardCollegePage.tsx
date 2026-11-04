import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthDashboardShell } from "../components/AuthDashboardShell"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"

type CollegeDashboard = {
  college: { id: string; slug: string; name: string; sample: boolean }
  members: Array<{ id: string; name: string }>
  enrolments: Array<{ id: string; courseTitle: string | null; programName: string | null }>
  cohortSummary?: {
    totalMembers: number
    totalEnrolments: number
    activeEnrolments: number
    completedEnrolments: number
    completionRatePercent: number
  }
  note: string
}

export default function DashboardCollegePage() {
  const { user, ready } = useAuth()
  const [data, setData] = useState<CollegeDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !user) return
    const controller = new AbortController()
    void fetch(`${apiV1()}/college/dashboard`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({})) as { error?: string; data?: CollegeDashboard }
        if (!response.ok) throw new Error(body.error || "The college dashboard could not be loaded")
        setData(body.data ?? null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "The college dashboard could not be loaded")
      })
    return () => controller.abort()
  }, [ready, user])

  if (!ready || !user) return null

  return (
    <AuthDashboardShell
      themeId="institution"
      workspace="learning"
      workspaceLabel="College"
      roleLabel="College"
      navItems={[{ id: "home", label: "College", short: "Home" }]}
      activeNav="home"
      onNavChange={() => undefined}
      renderNavIcon={() => null}
    >
      <div className="sh" style={{ display: "grid", gap: 20, maxWidth: 1080 }}>
        <section
          style={{
            background: "linear-gradient(145deg, #10263d 0%, #183750 100%)",
            border: "1px solid rgba(196, 184, 255, 0.38)",
            borderRadius: 18,
            padding: "28px 30px",
            color: "#ffffff",
            boxShadow: "0 18px 42px rgba(10, 14, 34, 0.22)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 8px", color: "#c4b8ff", font: "700 11px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                NEP 2020 · ACADEMIC BANK OF CREDITS (ABC) &amp; NAAC COHORT COMMAND CENTER
              </p>
              <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px, 3vw, 34px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
                {data?.college.name ?? "College Institutional Workspace"}
              </h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 14.5, maxWidth: 680, lineHeight: 1.55 }}>
                {data?.note ?? "Track student lab execution, 20-minute Faculty TA SLA compliance, and NCrF skill-credit equivalency across your institution."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="os-btn os-btn-primary"
                href={`${apiV1()}/college/dashboard/export.csv`}
                download
                style={{ background: "#5142b5", color: "#ffffff", fontWeight: 700, borderColor: "#c4b8ff", textDecoration: "none" }}
              >
                Export Cohort CSV
              </a>
              <Link
                className="os-btn os-btn-ghost"
                to="/verify"
                style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.28)", textDecoration: "none" }}
              >
                Verify Student Dossiers →
              </Link>
            </div>
          </div>
          {data?.college.sample ? (
            <p style={{ margin: "14px 0 0", padding: "6px 12px", borderRadius: 999, background: "rgba(16, 185, 129, 0.16)", border: "1px solid rgba(52, 211, 153, 0.4)", color: "#34d399", display: "inline-block", fontSize: 12, fontFamily: "var(--font-mono)" }}>
              ✓ Institutional Preview Mode · 60-Hour NCrF-Aligned Workload Ledger (Academic Credit Award Subject to Partner HEI Approval under UGC Rules)
            </p>
          ) : null}
        </section>

        {error ? <p role="alert" className="os-error">{error}</p> : null}

        {data ? (
          <>
            {data.cohortSummary ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }} aria-label="College cohort summary">
                <div style={{ padding: 18, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block" }}>Members</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.totalMembers}</strong>
                  <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>APAAR / ABC Mapped</span>
                </div>
                <div style={{ padding: 18, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block" }}>Active enrolments</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.activeEnrolments}</strong>
                  <span style={{ fontSize: 12, color: "#475569" }}>In Simulated Lab Sprints</span>
                </div>
                <div style={{ padding: 18, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block" }}>Completed</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.completedEnrolments}</strong>
                  <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Capstones Red-Line Verified</span>
                </div>
                <div style={{ padding: 18, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", display: "block" }}>Completion rate</span>
                  <strong style={{ fontSize: 28, color: "#5142b5", display: "block", marginTop: 4 }}>{data.cohortSummary.completionRatePercent}%</strong>
                  <span style={{ fontSize: 12, color: "#475569" }}>NAAC Criterion-1 Audit Ready</span>
                </div>
              </div>
            ) : null}

            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                    Active Cohort &amp; NCrF Skill-Credit Ledger
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#475569" }}>
                    {data.members.length} {data.members.length === 1 ? "person" : "people"} enrolled under this institution.
                  </p>
                </div>
                <span style={{ padding: "5px 12px", borderRadius: 999, background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                  2–4 Credits / Completed Track (45–60 Notional Hrs)
                </span>
              </div>

              {data.enrolments.length === 0 ? (
                <p style={{ margin: 0, color: "#64748b" }}>No enrolments are recorded for this college yet.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                  {data.enrolments.map((row) => (
                    <li
                      key={row.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      <span>{row.courseTitle ?? row.programName ?? "Enrolment"}</span>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#059669" }}>
                        ✓ Browser Lab + 20m TA SLA Active
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : error ? null : <p>Loading college records…</p>}
      </div>
    </AuthDashboardShell>
  )
}
