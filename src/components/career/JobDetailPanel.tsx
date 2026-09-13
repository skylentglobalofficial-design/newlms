import { useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import type { JobListing } from "../../lib/career-api"
import { createApplication } from "../../lib/career-api"
import { FeedbackBanner } from "./section-ui"
import { formatEmploymentType, formatExperience, formatPostedDate, formatSalary, formatWorkMode, jobMetaLine } from "./job-utils"

const accent = getDomainAccent("career")

type Props = {
  job: JobListing
  onToggleSave: () => void
  savePending?: boolean
  alreadyApplied?: boolean
  onApplied?: () => void
}

export default function JobDetailPanel({ job, onToggleSave, savePending, alreadyApplied, onApplied }: Props) {
  const [applyPending, setApplyPending] = useState(false)
  const [applyFeedback, setApplyFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const experience = formatExperience(job)
  const salary = formatSalary(job)
  const posted = formatPostedDate(job.postedAt)

  async function handleApply() {
    setApplyPending(true)
    setApplyFeedback(null)
    try {
      await createApplication({
        jobId: job.id,
        employerId: job.employerId,
        roleTitle: job.title,
        source: "career-os-jobs",
      })
      setApplyFeedback({ tone: "success", message: "Application recorded." })
      onApplied?.()
    } catch (err) {
      setApplyFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to apply" })
    } finally {
      setApplyPending(false)
    }
  }

  return (
    <GlassSurface level={2} padding="0" className="job-detail-panel" style={{ overflow: "hidden", minWidth: 0 }}>
      <div style={{ padding: "20px 22px", borderBottom: `1px solid ${T.lineDark}` }}>
        <h2 style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(18px, 2.2vw, 22px)",
          fontWeight: 700,
          color: C.ink,
          wordBreak: "break-word",
        }}>
          {job.title}
        </h2>
        <p style={{ margin: 0, color: C.slate, fontSize: 13.5, lineHeight: 1.6, wordBreak: "break-word" }}>
          {jobMetaLine(job)}
        </p>
      </div>

      <div style={{ padding: "18px 22px", maxHeight: "min(60vh, 520px)", overflowY: "auto" }}>
        {applyFeedback && <FeedbackBanner tone={applyFeedback.tone} message={applyFeedback.message} />}

        <dl style={{ margin: "0 0 18px", display: "grid", gap: 10 }}>
          {formatWorkMode(job.workMode) && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Work mode</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{formatWorkMode(job.workMode)}</dd>
            </div>
          )}
          {formatEmploymentType(job.employmentType) && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Employment type</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{formatEmploymentType(job.employmentType)}</dd>
            </div>
          )}
          {job.location && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Location</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{job.location}</dd>
            </div>
          )}
          {experience && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Experience</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{experience}</dd>
            </div>
          )}
          {salary && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Compensation range</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{salary}</dd>
            </div>
          )}
          {posted && (
            <div>
              <dt style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Posted</dt>
              <dd style={{ margin: 0, color: C.ink, fontSize: 13.5 }}>{posted}</dd>
            </div>
          )}
        </dl>

        {job.employer && (
          <div style={{ marginBottom: 18, padding: "12px 14px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: C.cream }}>
            <div style={{ fontSize: 11, color: accent.text, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Employer</div>
            <div style={{ color: C.ink, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{job.employer.name}</div>
            {job.employer.location && (
              <div style={{ color: C.slate, fontSize: 12.5, marginTop: 4 }}>{job.employer.location}</div>
            )}
            {job.employer.description && (
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, margin: "10px 0 0", wordBreak: "break-word" }}>
                {job.employer.description}
              </p>
            )}
            {job.employer.website && (
              <a href={job.employer.website} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 12.5, textDecoration: "none", wordBreak: "break-all" }}>
                Employer website
              </a>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.slate, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Role description</div>
          <p style={{ margin: 0, color: C.slate, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {job.description}
          </p>
        </div>

        {job.skills.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.slate, marginBottom: 8 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {job.skills.map(skill => (
                <span key={skill} style={{
                  fontSize: 11.5,
                  padding: "4px 10px",
                  borderRadius: 100,
                  border: `1px solid ${accent.border}`,
                  color: accent.text,
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: "14px 22px",
        borderTop: `1px solid ${T.lineDark}`,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <button
          type="button"
          onClick={onToggleSave}
          disabled={savePending}
          style={{
            padding: "10px 16px",
            borderRadius: T.rControl,
            border: `1px solid ${job.saved ? accent.border : T.lineDark}`,
            background: job.saved ? accent.subtle : "transparent",
            color: job.saved ? accent.text : C.white,
            fontSize: 13,
            fontWeight: 500,
            cursor: savePending ? "wait" : "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {savePending ? "Updating…" : job.saved ? "Unsave" : "Save job"}
        </button>

        {job.applicationUrl ? (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 16px",
              borderRadius: T.rControl,
              background: accent.primary,
              color: C.white,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "var(--font-body)",
            }}
          >
            Apply on employer site
          </a>
        ) : (
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={applyPending || alreadyApplied}
            style={{
              padding: "10px 16px",
              borderRadius: T.rControl,
              border: "none",
              background: alreadyApplied ? C.cream : accent.primary,
              color: C.ink,
              fontSize: 13,
              fontWeight: 600,
              cursor: applyPending || alreadyApplied ? "default" : "pointer",
              fontFamily: "var(--font-body)",
              opacity: alreadyApplied ? 0.7 : 1,
            }}
          >
            {applyPending ? "Applying…" : alreadyApplied ? "Applied" : "Apply"}
          </button>
        )}

        {alreadyApplied && (
          <Link to="/career-os/applications" style={{ alignSelf: "center", color: accent.text, fontSize: 12.5, textDecoration: "none" }}>
            View applications →
          </Link>
        )}
      </div>
    </GlassSurface>
  )
}
