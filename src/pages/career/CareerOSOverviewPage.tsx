import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../../components/foundation"
import { AuthDashboardLayout } from "../../components/AuthDashboardShell"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import { listApplications, type JobApplication } from "../../lib/career-api"
import { applicationEmployerName, applicationRoleTitle, formatStatusLabel } from "../../components/career/application-utils"
import { LoadingBlock, FeedbackBanner } from "../../components/career/section-ui"

const accent = getDomainAccent("career")

export default function CareerOSOverviewPage() {
  const { profile, loading, error, reload } = useCareerProfile()
  const [applicationCount, setApplicationCount] = useState<number | null>(null)
  const [recentApplications, setRecentApplications] = useState<Awaited<ReturnType<typeof listApplications>>>([])
  const [appsError, setAppsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void listApplications()
      .then(apps => {
        if (!cancelled) {
          setApplicationCount(apps.length)
          setRecentApplications(apps.slice(0, 3))
        }
      })
      .catch(err => {
        if (!cancelled) setAppsError(err instanceof Error ? err.message : "Failed to load applications")
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <LoadingBlock label="Loading your Career OS workspace…" />
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: 520 }}>
        <FeedbackBanner tone="error" message={error ?? "Workspace unavailable"} />
        <button type="button" onClick={() => void reload()} style={{ marginTop: 12, padding: "10px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "transparent", color: accent.text, cursor: "pointer" }}>
          Try again
        </button>
      </div>
    )
  }

  const displayName = profile.displayName || "Your profile"
  const nextAction = profile.completeness.nextRecommended

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
          Career OS
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
          Your profile, applications, and interview prep in one workspace.
        </p>
      </div>

      <AuthDashboardLayout
        primary={(
          <>
            <GlassSurface level={2} padding="22px" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: accent.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>Profile state</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 6 }}>{displayName}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
                    {profile.headline || "No headline yet"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>
                    {[profile.preferredRole, profile.location, profile.preferredWorkMode?.replace("_", " ")].filter(Boolean).join(" · ") || "Complete your basics to help employers understand your goals"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.white, fontFamily: "var(--font-display)", lineHeight: 1 }}>{profile.completeness.percent}%</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Profile completeness</div>
                </div>
              </div>
              <div style={{ marginTop: 18, height: 6, borderRadius: 100, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${profile.completeness.percent}%`, height: "100%", background: `linear-gradient(90deg, ${accent.primary}, ${accent.secondary})`, borderRadius: 100 }} />
              </div>
            </GlassSurface>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Education", value: profile.education.length },
                { label: "Experience", value: profile.experience.length },
                { label: "Skills", value: profile.skills.length },
                { label: "Projects", value: profile.projects.length },
                { label: "Links", value: profile.links.length },
              ].map(item => (
                <div key={item.label} style={{ padding: "14px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {nextAction && (
              <div style={{ padding: "16px 18px", borderRadius: T.rControl, border: `1px solid ${accent.border}`, background: accent.subtle, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: accent.text, marginBottom: 4 }}>Next action</div>
                <div style={{ color: C.white, fontSize: 15, marginBottom: 12 }}>{nextAction}</div>
                <Link to="/career-os/profile" style={{ color: accent.text, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                  Open profile workspace →
                </Link>
              </div>
            )}

            {profile.completeness.percent < 100 && profile.completeness.missing.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white, margin: "0 0 12px" }}>Still to complete</h2>
                <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.8 }}>
                  {profile.completeness.missing.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
        rail={(
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <GlassSurface level={2} padding="18px">
              <div style={{ fontSize: 12, color: accent.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/career-os/profile" style={{ color: C.white, fontSize: 13.5, textDecoration: "none", padding: "10px 12px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.03)" }}>
                  Edit profile
                </Link>
                <Link to="/career-os/jobs" style={{ color: C.white, fontSize: 13.5, textDecoration: "none", padding: "10px 12px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.03)" }}>
                  Browse jobs
                </Link>
                <Link to="/career-os/applications" style={{ color: C.white, fontSize: 13.5, textDecoration: "none", padding: "10px 12px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.03)" }}>
                  View applications
                </Link>
              </div>
            </GlassSurface>

            <GlassSurface level={2} padding="18px">
              <div style={{ fontSize: 12, color: accent.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Applications</div>
              {appsError ? (
                <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{appsError}</p>
              ) : (
                <div style={{ fontSize: 28, fontWeight: 700, color: C.white }}>{applicationCount ?? "—"}</div>
              )}
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>Tracked applications from Career OS</p>
              {recentApplications.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentApplications.map((app: JobApplication) => (
                    <Link
                      key={app.id}
                      to={`/career-os/applications/${app.id}`}
                      style={{
                        textDecoration: "none",
                        padding: "10px 12px",
                        borderRadius: T.rControl,
                        border: `1px solid ${T.lineDark}`,
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ color: C.white, fontSize: 13, fontWeight: 500, wordBreak: "break-word" }}>
                        {applicationRoleTitle(app)}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 2 }}>
                        {[applicationEmployerName(app), formatStatusLabel(app.status)].filter(Boolean).join(" · ")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassSurface>
          </div>
        )}
      />
    </div>
  )
}
