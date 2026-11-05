import { useCallback, useEffect, useState } from "react"
import { C, T } from "../../tokens"
import { careerAccent } from "../../components/career/career-accent"
import { useJobBoard } from "../../hooks/useJobBoard"
import { saveJob, unsaveJob, listApplications, fetchJob, type JobListing } from "../../lib/career-api"
import JobSearchSurface from "../../components/career/JobSearchSurface"
import JobResultRow from "../../components/career/JobResultRow"
import JobDetailPanel from "../../components/career/JobDetailPanel"
import { CURATED_RECRUITER_JOBS } from "./CareerOSOverviewPage"
import { FeedbackBanner, LoadingBlock, PageHead, secondaryButtonStyle } from "../../components/career/section-ui"

const accent = careerAccent

export default function CareerOSJobsPage() {
  const board = useJobBoard()
  const [savePendingId, setSavePendingId] = useState<string | null>(null)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [sharedJobIds, setSharedJobIds] = useState<Set<string>>(new Set())
  const [detailJob, setDetailJob] = useState(board.selectedJob)
  const [curatedApplied, setCuratedApplied] = useState<Set<string>>(() => new Set())
  const [trackFilter, setTrackFilter] = useState<string>("all")

  useEffect(() => {
    void listApplications()
      .then(apps => {
        setAppliedJobIds(new Set(apps.filter(a => a.jobId).map(a => a.jobId!)))
        setSharedJobIds(new Set(apps.filter(a => a.jobId && a.sharedWithEmployer).map(a => a.jobId!)))
      })
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

  const filteredPartnerJobs = CURATED_RECRUITER_JOBS.filter(
    (j) => trackFilter === "all" || j.trackSlug === trackFilter,
  )

  return (
    <div className="career-jobs-page cos-work" style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <PageHead
        eyebrow="Career OS · Recruiter Job Board"
        title="Recruiter Job Board & Verified Shortlists"
        lead="Apply directly to hiring partners using your verified Skylent Proof-of-Work Dossier, SQL/Python lab evidence, and graded capstones."
      />

      {/* Curated Partner Job Board Grid */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <strong style={{ fontSize: 15, color: "#0f172a" }}>
            Featured Recruiter Openings ({filteredPartnerJobs.length} Active Roles)
          </strong>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Tracks" },
              { id: "data-analytics", label: "Data Analytics" },
              { id: "data-science-ai", label: "Data Science" },
              { id: "product-management", label: "Product Mgmt" },
              { id: "python-programming", label: "Python" },
              { id: "generative-ai", label: "GenAI" },
              { id: "full-stack-web", label: "Full-Stack" },
            ].map((flt) => {
              const active = trackFilter === flt.id
              return (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => setTrackFilter(flt.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                    background: active ? "#5142b5" : "#ffffff",
                    color: active ? "#ffffff" : "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {flt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: 16,
          }}
        >
          {filteredPartnerJobs.map((job) => {
            const applied = curatedApplied.has(job.id)
            return (
              <article
                key={job.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "16px 18px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "0 6px 18px -12px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "#dcfce7",
                        color: "#166534",
                      }}
                    >
                      {job.matchPct}% Skill Match
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{job.postedAgo}</span>
                  </div>

                  <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>{job.title}</h3>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                    {job.company} · {job.location}
                  </div>

                  <div style={{ display: "flex", gap: 10, fontSize: 12.5, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                    <span style={{ color: "#5142b5" }}>💰 {job.ctcRange}</span>
                    <span>·</span>
                    <span>🏢 {job.workMode}</span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "#f1f5f9",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{job.badge}</span>
                  {applied ? (
                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        background: "#ecfdf5",
                        color: "#047857",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      ✓ Applied with Dossier
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCuratedApplied((prev) => new Set(prev).add(job.id))}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#5142b5",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Apply with Dossier →
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {board.displayedJobs.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["browse", "saved"] as const).map(tab => {
              const active = board.view === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => board.setView(tab)}
                  aria-pressed={active}
                  style={{
                    minHeight: 40,
                    padding: "0 16px",
                    borderRadius: T.rControl,
                    border: `1px solid ${active ? C.ink : T.lineDark}`,
                    background: C.cream,
                    color: active ? C.ink : C.slate,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {tab === "browse" ? "Employer Portal Listings" : "Saved jobs"}
                </button>
              )
            })}
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
                style={{ ...secondaryButtonStyle, marginTop: 10 }}
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
                <LoadingBlock label="Loading roles…" />
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
                        background: C.cream,
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
                  alreadyShared={sharedJobIds.has(detailJob.id)}
                  onApplied={() => setAppliedJobIds(prev => new Set(prev).add(detailJob.id))}
                  onShared={() => setSharedJobIds(prev => new Set(prev).add(detailJob.id))}
                />
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </div>
  )
}
