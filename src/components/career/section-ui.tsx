import { type ReactNode } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"

const accent = getDomainAccent("career")

/** Career OS sits on the light AuthDashboardShell canvas. Use ink, not white, for text. */
const ink = C.ink
const muted = C.slate
const line = T.lineLight
const surface = C.white
const surface2 = "#F5F3ED"

export function SectionShell({
  id,
  title,
  description,
  children,
  action,
}: {
  id?: string
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section id={id} style={{ marginBottom: 32, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: ink }}>{title}</h2>
          {description && (
            <p style={{ margin: "6px 0 0", color: muted, fontSize: 13.5, lineHeight: 1.5 }}>{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function EmptyBlock({ message, onAction, actionLabel }: { message: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div style={{
      padding: "20px 18px",
      borderRadius: T.rControl,
      border: `1px dashed ${line}`,
      background: surface2,
    }}>
      <p style={{ margin: 0, color: muted, fontSize: 14 }}>{message}</p>
      {onAction && actionLabel && (
        <button type="button" onClick={onAction} style={secondaryButtonStyle}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return <div style={{ color: muted, fontSize: 14, padding: "12px 0" }}>{label}</div>
}

export function FeedbackBanner({ tone, message }: { tone: "success" | "error"; message: string }) {
  const bg = tone === "success" ? "rgba(16,185,129,0.12)" : "rgba(185,28,28,0.08)"
  const border = tone === "success" ? "rgba(16,185,129,0.35)" : "rgba(185,28,28,0.28)"
  const color = tone === "success" ? "#047857" : "#B91C1C"
  return (
    <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: T.rControl, background: bg, border: `1px solid ${border}`, color, fontSize: 13 }}>
      {message}
    </div>
  )
}

export const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: muted,
  fontSize: 12,
  fontWeight: 500,
}

export const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: T.rControl,
  border: `1px solid ${line}`,
  background: surface,
  color: ink,
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
}

export const primaryButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: T.rControl,
  border: "none",
  background: accent.primary,
  color: C.white,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export const secondaryButtonStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "9px 16px",
  borderRadius: T.rControl,
  border: `1px solid ${line}`,
  background: "transparent",
  color: accent.text,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export const dangerButtonStyle: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: T.rControl,
  border: "1px solid rgba(185,28,28,0.35)",
  background: "transparent",
  color: "#B91C1C",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export function EntryCard({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{
      padding: "16px 18px",
      borderRadius: T.rControl,
      border: `1px solid ${line}`,
      background: surface,
      marginBottom: 10,
    }}>
      <div style={{ minWidth: 0 }}>{children}</div>
      {actions && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>{actions}</div>
      )}
    </div>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14 }}>
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  )
}
