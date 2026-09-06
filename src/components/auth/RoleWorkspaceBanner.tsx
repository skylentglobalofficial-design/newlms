import type { RoleAccent } from "../../role-themes"

type RoleWorkspaceBannerProps = {
  title: string
  description: string
  variant?: "functional" | "fixture" | "unavailable"
  accent: RoleAccent
}

export default function RoleWorkspaceBanner({
  title,
  description,
  variant = "fixture",
  accent,
}: RoleWorkspaceBannerProps) {
  const label =
    variant === "functional"
      ? "Live data"
      : variant === "unavailable"
        ? "Not available yet"
        : "Development preview"

  return (
    <div
      className={`role-workspace-banner role-workspace-banner--${variant}`}
      style={{ borderLeftColor: accent.border, background: accent.subtle }}
    >
      <div className="role-workspace-banner__label" style={{ color: accent.text }}>{label}</div>
      <div className="role-workspace-banner__title">{title}</div>
      <p className="role-workspace-banner__copy">{description}</p>
    </div>
  )
}
