import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { InterviewRound } from "../../lib/career-api"
import { formatInterviewDateTime, formatRoundStatus, formatRoundType, isUpcomingRound } from "./interview-utils"

const accent = getDomainAccent("career")

type Props = {
  rounds: InterviewRound[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function InterviewRoundRail({ rounds, selectedId, onSelect }: Props) {
  const upcoming = rounds.filter(isUpcomingRound)
  const other = rounds.filter(r => !isUpcomingRound(r))

  if (rounds.length === 0) {
    return (
      <div style={{
        padding: "18px 16px",
        borderRadius: T.rControl,
        border: `1px dashed ${T.lineDark}`,
        background: "rgba(255,255,255,0.02)",
      }}>
        <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>
          Your interview rounds will appear here.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/career-os/app/applications" style={{ color: accent.text, fontSize: 13, textDecoration: "none" }}>View applications →</Link>
          <Link to="/career-os/app/jobs" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>Browse jobs →</Link>
        </div>
      </div>
    )
  }

  return (
    <nav className="interview-round-rail" aria-label="Interview rounds" style={{ minWidth: 0 }}>
      <div
        className="interview-round-rail-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {upcoming.length > 0 && (
          <RoundGroup label="Upcoming & active" rounds={upcoming} selectedId={selectedId} onSelect={onSelect} />
        )}
        {other.length > 0 && (
          <RoundGroup label={upcoming.length > 0 ? "Other rounds" : "All rounds"} rounds={other} selectedId={selectedId} onSelect={onSelect} />
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .interview-round-rail-scroll {
            flex-direction: row !important;
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }
          .interview-round-group { min-width: min(100%, 260px); flex-shrink: 0; }
        }
      `}</style>
    </nav>
  )
}

function RoundGroup({
  label,
  rounds,
  selectedId,
  onSelect,
}: {
  label: string
  rounds: InterviewRound[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="interview-round-group" style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
        {label}
      </div>
      {rounds.map(round => {
        const active = round.id === selectedId
        const scheduled = formatInterviewDateTime(round.scheduledAt)
        return (
          <button
            key={round.id}
            type="button"
            onClick={() => onSelect(round.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 14px",
              marginBottom: 6,
              borderRadius: T.rControl,
              border: `1px solid ${active ? accent.border : T.lineDark}`,
              background: active ? accent.subtle : "rgba(255,255,255,0.02)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{round.title}</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginTop: 4 }}>
              {formatRoundType(round.type)} · {formatRoundStatus(round.status)}
            </div>
            {scheduled && (
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 4 }}>{scheduled}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
