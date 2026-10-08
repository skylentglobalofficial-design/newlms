import { type ReactNode } from "react"
import { C, T, dsClass } from "../../tokens"
import { Button, LoadingState, EmptyState } from "../ui"
import { careerAccent } from "./career-accent"

const accent = careerAccent

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
    <section id={id} style={{ marginBottom: 32, paddingTop: 22, borderTop: "1px solid hsl(var(--site-border))", minWidth: 0, scrollMarginTop: 72 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--sk-font-heading)", fontSize: 19, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, color: C.ink }}>{title}</h2>
          {description && (
            <p style={{ margin: "6px 0 0", color: "hsl(var(--site-muted))", fontSize: 14, lineHeight: 1.5 }}>{description}</p>
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
    <EmptyState
      message={message}
      action={
        onAction && actionLabel ? (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  )
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return <LoadingState label={label} />
}

export function FeedbackBanner({ tone, message }: { tone: "success" | "error"; message: string }) {
  const panelClass = tone === "success" ? dsClass.stateSuccessPanel : dsClass.stateErrorPanel
  return (
    <div className={panelClass} role={tone === "error" ? "alert" : "status"} style={{ marginBottom: 12, textAlign: "left" }}>
      <p style={{ margin: 0, fontSize: 13 }}>{message}</p>
    </div>
  )
}

export const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: "hsl(var(--site-dim))",
  fontFamily: "var(--sk-font-mono)",
  fontSize: 10.5,
  fontWeight: 400,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
}

export const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: T.rControl,
  border: "1px solid hsl(var(--site-border-strong))",
  background: "hsl(var(--site-white))",
  color: C.ink,
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
}

export const primaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: "0 18px",
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
  marginTop: 0,
  minHeight: 44,
  padding: "0 16px",
  borderRadius: T.rControl,
  border: "1px solid hsl(var(--site-border-strong))",
  background: "hsl(var(--site-white))",
  color: C.ink,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export const dangerButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: "0 14px",
  borderRadius: T.rControl,
  border: "1px solid hsl(var(--site-border))",
  background: "hsl(var(--site-white))",
  color: "hsl(var(--site-muted))",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export function EntryCard({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{
      padding: "16px 18px",
      borderRadius: 12,
      border: "1px solid hsl(var(--site-border))",
      background: "hsl(var(--site-white))",
      marginBottom: 10,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px 20px",
    }}>
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>{children}</div>
      {actions && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>
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
