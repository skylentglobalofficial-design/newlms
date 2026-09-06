import { Link } from "react-router-dom"
import { useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { useApplications } from "../../hooks/useApplications"
import ApplicationPipeline from "../../components/career/ApplicationPipeline"
import { createApplication } from "../../lib/career-api"
import { EmptyBlock, FeedbackBanner, Field, LoadingBlock, fieldInputStyle, primaryButtonStyle, secondaryButtonStyle } from "../../components/career/section-ui"

const accent = getDomainAccent("career")

export default function CareerOSApplicationsPage() {
  const { applications, filtered, loading, error, statusFilter, setStatusFilter, reload } = useApplications()
  const [showAdd, setShowAdd] = useState(false)
  const [roleTitle, setRoleTitle] = useState("")
  const [addPending, setAddPending] = useState(false)
  const [addFeedback, setAddFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  async function handleAddApplication(e: React.FormEvent) {
    e.preventDefault()
    if (!roleTitle.trim()) return
    setAddPending(true)
    setAddFeedback(null)
    try {
      await createApplication({
        roleTitle: roleTitle.trim(),
        source: "manual",
        status: "APPLIED",
      })
      setRoleTitle("")
      setShowAdd(false)
      await reload()
      setAddFeedback({ tone: "success", message: "Application added." })
    } catch (err) {
      setAddFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to add application" })
    } finally {
      setAddPending(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
            Applications
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
            Track every role you apply to and where each application stands.
          </p>
        </div>
        <button type="button" onClick={() => setShowAdd(v => !v)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
          {showAdd ? "Cancel" : "Track application"}
        </button>
      </div>

      {addFeedback && <FeedbackBanner tone={addFeedback.tone} message={addFeedback.message} />}

      {showAdd && (
        <form
          onSubmit={e => void handleAddApplication(e)}
          style={{
            marginBottom: 20,
            padding: "16px 18px",
            borderRadius: T.rControl,
            border: `1px solid ${T.lineDark}`,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <Field label="Role title">
            <input
              value={roleTitle}
              onChange={e => setRoleTitle(e.target.value)}
              style={fieldInputStyle}
              placeholder="e.g. Data Analyst"
              maxLength={200}
            />
          </Field>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>
            Use this to track applications outside the job board. Roles applied from Jobs are added automatically.
          </p>
          <button type="submit" disabled={addPending || !roleTitle.trim()} style={{ ...primaryButtonStyle, marginTop: 14 }}>
            {addPending ? "Adding…" : "Add application"}
          </button>
        </form>
      )}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <FeedbackBanner tone="error" message={error} />
          <button type="button" onClick={() => void reload()} style={{ ...secondaryButtonStyle, marginTop: 10 }}>
            Retry
          </button>
        </div>
      )}

      {loading && <LoadingBlock label="Loading applications…" />}

      {!loading && applications.length === 0 && (
        <>
          <EmptyBlock message="Nothing here yet. Apply to a role from Jobs and your application will appear here." />
          <Link
            to="/career-os/app/jobs"
            style={{
              display: "inline-block",
              marginTop: 14,
              padding: "10px 16px",
              borderRadius: T.rControl,
              background: accent.primary,
              color: C.white,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Browse jobs
          </Link>
        </>
      )}

      {!loading && applications.length > 0 && (
        <ApplicationPipeline
          applications={filtered}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      )}
    </div>
  )
}
