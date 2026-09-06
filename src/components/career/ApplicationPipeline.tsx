import type { CSSProperties } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { JobApplication, JobApplicationStatus } from "../../lib/career-api"
import ApplicationCard from "./ApplicationCard"
import {
  APPLICATION_STATUS_ORDER,
  formatStatusLabel,
  groupApplicationsByStatus,
} from "./application-utils"

const accent = getDomainAccent("career")

type Props = {
  applications: JobApplication[]
  statusFilter: JobApplicationStatus | "ALL"
  onStatusFilterChange: (status: JobApplicationStatus | "ALL") => void
}

export default function ApplicationPipeline({ applications, statusFilter, onStatusFilterChange }: Props) {
  const groups = groupApplicationsByStatus(applications)
  const statusCounts = APPLICATION_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = groups[status].length
    return acc
  }, {} as Record<JobApplicationStatus, number>)

  const visibleStatuses = statusFilter === "ALL"
    ? APPLICATION_STATUS_ORDER.filter(status => groups[status].length > 0)
    : [statusFilter]

  return (
    <div className="application-pipeline" style={{ minWidth: 0 }}>
      <div
        className="application-status-strip"
        role="tablist"
        aria-label="Filter by status"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === "ALL"}
          onClick={() => onStatusFilterChange("ALL")}
          style={stripButtonStyle(statusFilter === "ALL")}
        >
          All ({applications.length})
        </button>
        {APPLICATION_STATUS_ORDER.map(status => {
          const count = statusCounts[status]
          if (count === 0) return null
          const active = statusFilter === status
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusFilterChange(status)}
              style={stripButtonStyle(active)}
            >
              {formatStatusLabel(status)} ({count})
            </button>
          )
        })}
      </div>

      {statusFilter === "ALL" ? (
        visibleStatuses.map(status => (
          <section key={status} style={{ marginBottom: 28, minWidth: 0 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}>
              <h2 style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 600,
                color: C.white,
              }}>
                {formatStatusLabel(status)}
              </h2>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                {groups[status].length} {groups[status].length === 1 ? "application" : "applications"}
              </span>
            </div>
            {groups[status].map(app => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </section>
        ))
      ) : (
        <section style={{ minWidth: 0 }}>
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </section>
      )}

      <style>{`
        .application-status-strip::-webkit-scrollbar { height: 4px; }
        .application-status-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @media (max-width: 600px) {
          .application-status-strip button { flex-shrink: 0; white-space: nowrap; }
        }
      `}</style>
    </div>
  )

  function stripButtonStyle(active: boolean): CSSProperties {
    return {
      flexShrink: 0,
      padding: "8px 14px",
      borderRadius: T.rControl,
      border: `1px solid ${active ? accent.border : T.lineDark}`,
      background: active ? accent.subtle : "transparent",
      color: active ? accent.text : "rgba(255,255,255,0.5)",
      fontSize: 12.5,
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      whiteSpace: "nowrap",
    }
  }
}
