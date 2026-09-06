import { Link } from "react-router-dom"
import { C, T } from "../../tokens"

type LmsEmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  actionDisabled?: boolean
  variant?: "default" | "coming-soon"
}

export default function LmsEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  actionDisabled,
  variant = "default",
}: LmsEmptyStateProps) {
  return (
    <div className={`lms-empty-state${variant === "coming-soon" ? " lms-empty-state--soon" : ""}`}>
      {variant === "coming-soon" && (
        <div className="lms-empty-state__badge">Coming soon</div>
      )}
      <h2 className="lms-empty-state__title">{title}</h2>
      <p className="lms-empty-state__copy">{description}</p>
      {actionLabel && actionHref && (
        <Link to={actionHref} className="lms-empty-state__action">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
          className="lms-empty-state__action lms-empty-state__action--button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function LmsInlineEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
      {children}
    </p>
  )
}

export function LmsSectionShell({
  id,
  label,
  children,
}: {
  id?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="lms-section-shell">
      <div className="skylent-label lms-section-shell__label">{label}</div>
      {children}
    </section>
  )
}
