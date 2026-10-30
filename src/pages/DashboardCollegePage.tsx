import { useEffect, useState } from "react"
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
      <div className="sh" style={{ display: "grid", gap: 16, maxWidth: 760 }}>
        <p className="os-eyebrow">College</p>
        <h1>{data?.college.name ?? "College"}</h1>
        {data?.college.sample ? <p>This is a demo college. It is not a partner institution.</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {data ? (
          <>
            <p>{data.note}</p>
            {data.cohortSummary ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }} aria-label="College cohort summary">
                <div style={{ padding: 12, border: "1px solid var(--skylent-color-border, #e2e8f0)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, display: "block" }}>Members</span>
                  <strong style={{ fontSize: 20 }}>{data.cohortSummary.totalMembers}</strong>
                </div>
                <div style={{ padding: 12, border: "1px solid var(--skylent-color-border, #e2e8f0)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, display: "block" }}>Active enrolments</span>
                  <strong style={{ fontSize: 20 }}>{data.cohortSummary.activeEnrolments}</strong>
                </div>
                <div style={{ padding: 12, border: "1px solid var(--skylent-color-border, #e2e8f0)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, display: "block" }}>Completed</span>
                  <strong style={{ fontSize: 20 }}>{data.cohortSummary.completedEnrolments}</strong>
                </div>
                <div style={{ padding: 12, border: "1px solid var(--skylent-color-border, #e2e8f0)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, display: "block" }}>Completion rate</span>
                  <strong style={{ fontSize: 20 }}>{data.cohortSummary.completionRatePercent}%</strong>
                </div>
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0 }}>{data.members.length} {data.members.length === 1 ? "person" : "people"} in this college.</p>
              <a className="os-btn os-btn-ghost" href={`${apiV1()}/college/dashboard/export.csv`} download>
                Export Cohort CSV
              </a>
            </div>
            {data.enrolments.length === 0 ? <p>No enrolments are recorded for this college.</p> : (
              <ul>
                {data.enrolments.map((row) => (
                  <li key={row.id}>{row.courseTitle ?? row.programName ?? "Enrolment"}</li>
                ))}
              </ul>
            )}
          </>
        ) : error ? null : <p>Loading college records…</p>}
      </div>
    </AuthDashboardShell>
  )
}
