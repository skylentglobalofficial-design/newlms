import { useEffect, useState } from "react"
import { AuthDashboardShell } from "../components/AuthDashboardShell"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"

type CollegeDashboard = {
  college: { id: string; slug: string; name: string; sample: boolean }
  members: Array<{ id: string; name: string }>
  enrolments: Array<{ id: string; courseTitle: string | null; programName: string | null }>
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
            <p>{data.members.length} {data.members.length === 1 ? "person" : "people"} in this college.</p>
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
