import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { JobApplication } from "../../lib/career-api"
import {
  applicationEmployerName,
  applicationLocation,
  applicationRoleTitle,
  applicationWorkMode,
  formatApplicationDate,
  formatStatusLabel,
} from "./application-utils"

const accent = getDomainAccent("career")

type Props = {
  application: JobApplication
  selected?: boolean
}

export default function ApplicationCard({ application, selected }: Props) {
  const role = applicationRoleTitle(application)
  const employer = applicationEmployerName(application)
  const location = applicationLocation(application)
  const workMode = applicationWorkMode(application)
  const applied = formatApplicationDate(application.appliedAt)
  const nextAction = formatApplicationDate(application.nextActionAt)

  const meta = [employer, location, workMode].filter(Boolean).join(" · ")

  return (
    <Link
      to={`/career-os/applications/${application.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "14px 16px",
        borderRadius: T.rControl,
        border: `1px solid ${selected ? accent.border : T.lineDark}`,
        background: selected ? accent.subtle : "rgba(255,255,255,0.02)",
        marginBottom: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0, flex: "1 1 180px" }}>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 15, wordBreak: "break-word", marginBottom: 4 }}>
            {role}
          </div>
          {meta && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
              {meta}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
            {applied && <span>Applied {applied}</span>}
            {nextAction && <span>Next action {nextAction}</span>}
            {application.source && <span>Source: {application.source}</span>}
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 100,
          border: `1px solid ${accent.border}`,
          color: accent.text,
          background: accent.subtle,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          {formatStatusLabel(application.status)}
        </span>
      </div>
    </Link>
  )
}
