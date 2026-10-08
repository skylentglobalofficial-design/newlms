import { Link } from "react-router-dom"
import { useState } from "react"
import { C, T } from "../../tokens"
import { useApplications } from "../../hooks/useApplications"
import ApplicationPipeline from "../../components/career/ApplicationPipeline"
import { createApplication } from "../../lib/career-api"
import { EmptyBlock, FeedbackBanner, Field, LoadingBlock, PageHead, fieldInputStyle, primaryButtonStyle, secondaryButtonStyle } from "../../components/career/section-ui"

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
    <div className="cos-work" style={{ maxWidth: 900, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <PageHead
        eyebrow="Career OS · Applications"
        title="Applications"
        lead="Track every role you apply to and where each application stands."
        action={
          <button type="button" onClick={() => setShowAdd(v => !v)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
            {showAdd ? "Cancel" : "Track application"}
          </button>
        }
      />

      {addFeedback && <FeedbackBanner tone={addFeedback.tone} message={addFeedback.message} />}

      {showAdd && (
        <form
          onSubmit={e => void handleAddApplication(e)}
          style={{
            marginBottom: 20,
            padding: "16px 18px",
            borderRadius: T.rCard,
            border: `1px solid ${T.lineDark}`,
            background: C.cream,
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
          <p style={{ margin: "10px 0 0", color: C.slate, fontSize: 12.5 }}>
            Use this to track applications you submit. Roles applied from Opportunities appear here automatically.
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
          <EmptyBlock message="Nothing here yet. When a partner publishes a role, you can apply from Opportunities." />
          <Link
            to="/career-os/jobs"
            style={{
              ...secondaryButtonStyle,
              display: "inline-flex",
              alignItems: "center",
              marginTop: 12,
              textDecoration: "none",
            }}
          >
            Open opportunities
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
