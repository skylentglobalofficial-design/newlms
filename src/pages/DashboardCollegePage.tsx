import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthDashboardShell, type AuthNavItem } from "../components/AuthDashboardShell"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"
import { ensureCsrfToken } from "../lib/auth-api"

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

const COLLEGE_NAV: AuthNavItem[] = [
  { id: "overview", label: "Overview & KPIs", short: "Home" },
  { id: "cohort", label: "Cohort & Credit Ledger", short: "Cohort" },
  { id: "roster", label: "Campus Student Roster", short: "Roster" },
  { id: "compliance", label: "NAAC / NEP Audit Pack", short: "Audit" },
]

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderTop: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 10px 28px -12px rgba(15, 23, 42, 0.08)",
} as const

export default function DashboardCollegePage() {
  const { user, ready } = useAuth()
  const [activeNav, setActiveNav] = useState<string>("overview")
  const [data, setData] = useState<CollegeDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [collegeNameInput, setCollegeNameInput] = useState("")
  const [activatingCollege, setActivatingCollege] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    if (!ready || !user) return
    const controller = new AbortController()
    void fetch(`${apiV1()}/college/dashboard`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { error?: string; data?: CollegeDashboard }
        if (!response.ok) throw new Error(body.error || "The college dashboard could not be loaded")
        setData(body.data ?? null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "The college dashboard could not be loaded")
      })
    return () => controller.abort()
  }, [ready, user, reloadTick])

  if (!ready || !user) return null

  return (
    <AuthDashboardShell
      themeId="institution"
      workspace="learning"
      workspaceLabel="College"
      roleLabel="College"
      navItems={COLLEGE_NAV}
      bottomNavItems={COLLEGE_NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={() => null}
    >
      <div className="sh" style={{ display: "grid", gap: 20, maxWidth: 1120 }}>
        <section
          style={{
            background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 65%)",
            border: "1px solid #ddd6fe",
            borderTop: "3px solid #5142b5",
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 4px 16px -8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                {data?.college.name ?? "College Dashboard"}
              </h1>
              <p style={{ margin: 0, color: "#475569", fontSize: 13.5 }}>
                {data?.note ?? "View enrolled students, course progress, and export cohort reports."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="os-btn os-btn-primary"
                href={`${apiV1()}/college/dashboard/export.csv`}
                download
                style={{
                  background: "#5142b5",
                  color: "#ffffff",
                  fontWeight: 600,
                  borderColor: "#5142b5",
                  textDecoration: "none",
                }}
              >
                Export Cohort CSV
              </a>
              <Link
                className="os-btn os-btn-ghost"
                to="/verify"
                style={{ textDecoration: "none" }}
              >
                Verify Certificates
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <div style={cardStyle}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", display: "block", marginBottom: 4 }}>
              INSTITUTIONAL TENANT ACTIVATION · 1-CLICK SETUP
            </span>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#0f172a" }}>Link or Create Your College Workspace</h2>
            <p role="alert" style={{ color: "#475569", fontSize: 13.5, margin: "0 0 12px" }}>
              {error} — Enter your college or university name below to activate your NEP 2020 / NAAC Cohort Workspace immediately:
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={collegeNameInput}
                onChange={(e) => setCollegeNameInput(e.target.value)}
                placeholder={`${user.displayName || "Skylent"} Partner Institute of Technology`}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5, minWidth: 280 }}
              />
              <button
                type="button"
                disabled={activatingCollege}
                className="os-btn os-btn-primary"
                style={{ background: "#5142b5", color: "#ffffff", borderColor: "#5142b5", fontWeight: 700, cursor: activatingCollege ? "wait" : "pointer" }}
                onClick={async () => {
                  setActivatingCollege(true)
                  try {
                    const token = await ensureCsrfToken()
                    const res = await fetch(`${apiV1()}/college/onboarding`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                      body: JSON.stringify({ name: collegeNameInput.trim() || `${user.displayName || "Skylent"} Partner Institute` }),
                    })
                    if (res.ok) {
                      setError(null)
                      setReloadTick((t) => t + 1)
                    }
                  } finally {
                    setActivatingCollege(false)
                  }
                }}
              >
                {activatingCollege ? "Activating College Tenant…" : "⚡ Activate My College Workspace"}
              </button>
            </div>
          </div>
        ) : null}

        {data ? (
          <>
            {(activeNav === "overview" || activeNav === "compliance") && data.cohortSummary ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }} aria-label="College cohort summary">
                <div style={cardStyle}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142b5", fontWeight: 700, display: "block" }}>Members</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.totalMembers}</strong>
                  <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>APAAR / ABC Mapped</span>
                </div>
                <div style={cardStyle}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142b5", fontWeight: 700, display: "block" }}>Active enrolments</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.activeEnrolments}</strong>
                  <span style={{ fontSize: 12, color: "#475569" }}>In Simulated Lab Sprints</span>
                </div>
                <div style={cardStyle}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142b5", fontWeight: 700, display: "block" }}>Completed</span>
                  <strong style={{ fontSize: 28, color: "#0f172a", display: "block", marginTop: 4 }}>{data.cohortSummary.completedEnrolments}</strong>
                  <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Capstones Red-Line Verified</span>
                </div>
                <div style={cardStyle}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142b5", fontWeight: 700, display: "block" }}>Completion rate</span>
                  <strong style={{ fontSize: 28, color: "#5142b5", display: "block", marginTop: 4 }}>{data.cohortSummary.completionRatePercent}%</strong>
                  <span style={{ fontSize: 12, color: "#475569" }}>NAAC Criterion-1 Audit Ready</span>
                </div>
              </div>
            ) : null}

            {activeNav === "overview" || activeNav === "cohort" ? (
              <section style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                      NCrF SKILL-CREDIT &amp; LAB ENROLMENT LEDGER
                    </span>
                    <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a", fontFamily: "var(--font-display)" }}>
                      Active Cohort &amp; NCrF Skill-Credit Ledger
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#475569" }}>
                      {data.members.length} {data.members.length === 1 ? "person" : "people"} enrolled under this institution.
                    </p>
                  </div>
                  <span style={{ padding: "5px 12px", borderRadius: 999, background: "#f5f3ff", border: "1px solid #ddd6fe", fontSize: 12, fontWeight: 700, color: "#5142b5" }}>
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
                        <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Enrolled</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {activeNav === "roster" ? (
              <section style={cardStyle}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  ENROLLED CAMPUS MEMBERS ({data.members.length})
                </span>
                <h2 style={{ margin: "2px 0 12px", fontSize: 18, color: "#0f172a" }}>Campus Student Roster</h2>
                {data.members.length === 0 ? (
                  <p style={{ margin: 0, color: "#64748b" }}>No students linked to this college tenant yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                    {data.members.map((m) => (
                      <li key={m.id} style={{ padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: "#0f172a", fontSize: 14 }}>{m.name}</strong>
                        <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#5142b5" }}>ID: {m.id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {activeNav === "compliance" ? (
              <section style={cardStyle}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                  UGC SECTION 22 &amp; NEP 2020 STATUTORY GOVERNANCE
                </span>
                <h2 style={{ margin: "2px 0 8px", fontSize: 18, color: "#0f172a" }}>NAAC / NIRF Cohort Export &amp; Credit Mapping</h2>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                  Each flagship Skylent track represents 60 Notional Learning Hours (15 hrs First-Principles Notes, 20 hrs Browser Lab Execution, 15 hrs Capstone Studio, 10 hrs Faculty Red-Line &amp; Oral Defence) mapped for partner HEI Board of Studies review.
                </p>
                <a
                  className="os-btn os-btn-primary"
                  href={`${apiV1()}/college/dashboard/export.csv`}
                  download
                  style={{ background: "#5142b5", color: "#ffffff", borderColor: "#5142b5", fontWeight: 700, textDecoration: "none" }}
                >
                  Download NAAC Cohort CSV Report →
                </a>
              </section>
            ) : null}
          </>
        ) : error ? null : (
          <p>Loading college records…</p>
        )}
      </div>
    </AuthDashboardShell>
  )
}
