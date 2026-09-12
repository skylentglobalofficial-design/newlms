import { T } from "../../tokens"

type RoleSectionEmptyProps = {
  title: string
  description: string
}

export default function RoleSectionEmpty({ title, description }: RoleSectionEmptyProps) {
  return (
    <div className="role-section-empty">
      <div className="role-section-empty__title">{title}</div>
      <p className="role-section-empty__copy">{description}</p>
    </div>
  )
}

export function RoleSectionShell({
  id,
  label,
  children,
}: {
  id?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="role-section-shell">
      <div className="skylent-label role-section-shell__label">{label}</div>
      {children}
    </section>
  )
}

export const roleCanvasSectionStyle = {
  padding: "22px 24px",
  border: `1px solid ${T.lineDark}`,
  borderRadius: T.rCard,
} as const
