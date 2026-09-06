import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { CareerSupportRequest } from "../../lib/career-api"
import {
  formatPriority,
  formatRequestStatus,
  formatRequestType,
  formatSupportDateTime,
  isActiveRequest,
} from "./support-utils"

const accent = getDomainAccent("career")

type Props = {
  requests: CareerSupportRequest[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function CareerSupportRequestList({ requests, selectedId, onSelect }: Props) {
  const active = requests.filter(isActiveRequest)
  const other = requests.filter(r => !isActiveRequest(r))

  if (requests.length === 0) {
    return (
      <div style={{
        padding: "18px 16px",
        borderRadius: T.rControl,
        border: `1px dashed ${T.lineDark}`,
        background: "rgba(255,255,255,0.02)",
      }}>
        <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>
          No support requests yet.
        </p>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.6 }}>
          Use the form to request help with your resume, interviews, or job search.
        </p>
      </div>
    )
  }

  return (
    <nav className="support-request-list" aria-label="Support requests" style={{ minWidth: 0 }}>
      <div className="support-request-list-scroll" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {active.length > 0 && (
          <RequestGroup label="Active" requests={active} selectedId={selectedId} onSelect={onSelect} />
        )}
        {other.length > 0 && (
          <RequestGroup label={active.length > 0 ? "Past requests" : "All requests"} requests={other} selectedId={selectedId} onSelect={onSelect} />
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .support-request-list-scroll {
            flex-direction: row !important;
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }
          .support-request-group { min-width: min(100%, 260px); flex-shrink: 0; }
        }
      `}</style>
    </nav>
  )
}

function RequestGroup({
  label,
  requests,
  selectedId,
  onSelect,
}: {
  label: string
  requests: CareerSupportRequest[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="support-request-group" style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
        {label}
      </div>
      {requests.map(request => {
        const active = request.id === selectedId
        const updated = formatSupportDateTime(request.updatedAt)
        const openTasks = request.tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS").length
        return (
          <button
            key={request.id}
            type="button"
            onClick={() => onSelect(request.id)}
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
            <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{request.subject}</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginTop: 4 }}>
              {formatRequestType(request.type)} · {formatRequestStatus(request.status)}
            </div>
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 4 }}>
              {[formatPriority(request.priority), updated, openTasks > 0 ? `${openTasks} open task${openTasks === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ")}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function SupportRequestRowLink({ request }: { request: CareerSupportRequest }) {
  const updated = formatSupportDateTime(request.updatedAt)
  return (
    <Link
      to={`/career-os/app/support/${request.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: T.rControl,
        border: `1px solid ${T.lineDark}`,
        background: "rgba(255,255,255,0.02)",
        minWidth: 0,
      }}
    >
      <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{request.subject}</div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginTop: 4 }}>
        {formatRequestType(request.type)} · {formatRequestStatus(request.status)}
      </div>
      {updated && (
        <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 4 }}>Updated {updated}</div>
      )}
    </Link>
  )
}
