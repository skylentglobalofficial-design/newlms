import { useCallback, useEffect, useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { useJobBoard } from "../../hooks/useJobBoard"
import { saveJob, unsaveJob, listApplications, fetchJob, type JobListing } from "../../lib/career-api"
import JobSearchSurface from "../../components/career/JobSearchSurface"
import JobResultRow from "../../components/career/JobResultRow"
import JobDetailPanel from "../../components/career/JobDetailPanel"
import { EmptyBlock, FeedbackBanner, LoadingBlock } from "../../components/career/section-ui"

const accent = getDomainAccent("career")

export default function CareerOSJobsPage() {
  const board = useJobBoard()
  const [savePendingId, setSavePendingId] = useState<string | null>(null)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [detailJob, setDetailJob] = useState(board.selectedJob)

  useEffect(() => {
    void listApplications()
      .then(apps => setAppliedJobIds(new Set(apps.filter(a => a.jobId).map(a => a.jobId!))))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!board.selectedJobId) {
      setDetailJob(null)
      return
    }
    if (board.selectedJob?.id === board.selectedJobId) {
      setDetailJob(board.selectedJob)
      return
    }
    void fetchJob(board.selectedJobId)
      .then(setDetailJob)
      .catch(() => setDetailJob(board.selectedJob))
  }, [board.selectedJobId, board.selectedJob])

  const toggleSave = useCallback(async (jobId: string, currentlySaved: boolean) => {
    const previousSaved = currentlySaved
    board.updateSavedState(jobId, !currentlySaved)
    setSavePendingId(jobId)
    try {
      if (currentlySaved) {
        await unsaveJob(jobId)
      } else {
        await saveJob(jobId)
      }
      if (detailJob?.id === jobId) {
        setDetailJob((prev: JobListing | null) => prev ? { ...prev, saved: !currentlySaved } : prev)
      }
    } catch (err) {
      board.updateSavedState(jobId, previousSaved)
      if (detailJob?.id === jobId) {
        setDetailJob((prev: JobListing | null) => prev ? { ...prev, saved: previousSaved } : prev)
      }
      throw err
    } finally {
      setSavePendingId(null)
    }
  }, [board, detailJob?.id])

  function handleToggleSaveForJob(jobId: string, saved: boolean) {
    void toggleSave(jobId, saved).catch(() => undefined)
  }

  const canLoadMore = board.view === "browse"
    && board.meta.offset + board.meta.limit < board.meta.total

  return (
    <div className="career-jobs-page" style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
          Job board
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
          Search open roles, save opportunities, and apply when you are ready.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["browse", "saved"] as const).map(tab => {
          const active = board.view === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => board.setView(tab)}
              style={{
                padding: "9px 16px",
                borderRadius: T.rControl,
                border: `1px solid ${active ? accent.border : T.lineDark}`,
                background: active ? accent.subtle : "transparent",
                color: active ? accent.text : "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {tab === "browse" ? "All jobs" : "Saved jobs"}
            </button>
          )
        })}
        {board.view === "browse" && board.meta.total > 0 && (
          <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.38)", fontSize: 12.5, marginLeft: 4 }}>
            {board.meta.total} open {board.meta.total === 1 ? "role" : "roles"}
          </span>
        )}
        {board.view === "saved" && !board.loading && (
          <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.38)", fontSize: 12.5, marginLeft: 4 }}>
            {board.savedEntries.length} saved
          </span>
        )}
      </div>

      {board.view === "browse" && (
        <JobSearchSurface
          filters={board.filters}
          onChange={board.setFilters}
          onSearch={() => void board.reload()}
          disabled={board.loading}
        />
      )}

      {board.error && (
        <div style={{ marginBottom: 16 }}>
          <FeedbackBanner tone="error" message={board.error} />
          <button
            type="button"
            onClick={() => void board.reload()}
            style={{
              marginTop: 10,
              padding: "9px 16px",
              borderRadius: T.rControl,
              border: `1px solid ${T.lineDark}`,
              background: "transparent",
              color: accent.text,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="career-jobs-layout" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)",
        gap: "clamp(16px, 2vw, 24px)",
        alignItems: "start",
      }}>
        <div className="career-jobs-results" style={{ minWidth: 0 }}>
          {board.loading ? (
            <LoadingBlock label={board.view === "browse" ? "Loading jobs…" : "Loading saved jobs…"} />
          ) : board.displayedJobs.length === 0 ? (
            <EmptyBlock
              message={board.view === "browse"
                ? "No open roles match your search. Try different filters or check back later."
                : "You have not saved any jobs yet. Browse open roles and save the ones you want to track."}
              onAction={board.view === "saved" ? () => board.setView("browse") : undefined}
              actionLabel={board.view === "saved" ? "Browse jobs" : undefined}
            />
          ) : (
            <>
              {board.displayedJobs.map(job => (
                <JobResultRow
                  key={job.id}
                  job={job}
                  selected={job.id === board.selectedJobId}
                  onSelect={() => board.setSelectedJobId(job.id)}
                  onToggleSave={() => handleToggleSaveForJob(job.id, Boolean(job.saved))}
                  savePending={savePendingId === job.id}
                />
              ))}
              {canLoadMore && (
                <button
                  type="button"
                  onClick={() => void board.loadMore()}
                  disabled={board.loadingMore}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "12px",
                    borderRadius: T.rControl,
                    border: `1px solid ${T.lineDark}`,
                    background: "rgba(255,255,255,0.02)",
                    color: accent.text,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {board.loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          )}
        </div>

        <aside className="career-jobs-detail" style={{ minWidth: 0, position: "sticky", top: 20 }}>
          {detailJob ? (
            <JobDetailPanel
              job={detailJob}
              onToggleSave={() => handleToggleSaveForJob(detailJob.id, Boolean(detailJob.saved))}
              savePending={savePendingId === detailJob.id}
              alreadyApplied={appliedJobIds.has(detailJob.id)}
              onApplied={() => setAppliedJobIds(prev => new Set(prev).add(detailJob.id))}
            />
          ) : !board.loading && (
            <div style={{
              padding: "24px 20px",
              borderRadius: T.rControl,
              border: `1px dashed ${T.lineDark}`,
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              textAlign: "center",
            }}>
              Select a job to view details
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .career-jobs-layout {
            grid-template-columns: 1fr !important;
          }
          .career-jobs-detail {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}
