import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { JobListing } from "../../lib/career-api"
import { jobMetaLine, jobSecondaryLine } from "./job-utils"

const accent = getDomainAccent("career")

type Props = {
  job: JobListing
  selected: boolean
  onSelect: () => void
  onToggleSave: () => void
  savePending?: boolean
}

export default function JobResultRow({ job, selected, onSelect, onToggleSave, savePending }: Props) {
  const meta = jobMetaLine(job)
  const secondary = jobSecondaryLine(job)

  return (
    <article
      className="job-result-row"
      style={{
        padding: "16px 18px",
        borderRadius: T.rControl,
        border: `1px solid ${selected ? accent.border : T.lineDark}`,
        background: selected ? accent.subtle : "rgba(255,255,255,0.02)",
        marginBottom: 10,
        cursor: "pointer",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onSelect}
          style={{
            flex: "1 1 200px",
            minWidth: 0,
            background: "none",
            border: "none",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          <h3 style={{
            margin: "0 0 6px",
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 600,
            color: C.white,
            wordBreak: "break-word",
          }}>
            {job.title}
          </h3>
          {meta && (
            <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
              {meta}
            </p>
          )}
          {secondary && (
            <p style={{ margin: 0, color: "rgba(255,255,255,0.38)", fontSize: 12.5, lineHeight: 1.5 }}>
              {secondary}
            </p>
          )}
          {job.skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {job.skills.slice(0, 4).map(skill => (
                <span key={skill} style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 100,
                  border: `1px solid ${T.lineDark}`,
                  color: "rgba(255,255,255,0.45)",
                }}>
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", alignSelf: "center" }}>
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleSave() }}
          disabled={savePending}
          aria-label={job.saved ? "Unsave job" : "Save job"}
          style={{
            flexShrink: 0,
            padding: "8px 12px",
            borderRadius: T.rControl,
            border: `1px solid ${job.saved ? accent.border : T.lineDark}`,
            background: job.saved ? accent.subtle : "transparent",
            color: job.saved ? accent.text : "rgba(255,255,255,0.55)",
            fontSize: 12,
            fontWeight: 500,
            cursor: savePending ? "wait" : "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {savePending ? "…" : job.saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  )
}
