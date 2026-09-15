import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import type { ApiEnrollmentSummary } from "../../lib/lms-api"

export function courseEnrollments(items: ApiEnrollmentSummary[]): ApiEnrollmentSummary[] {
  return items.filter((item) => item.courseSlug)
}

export default function EnrollmentEvidence({
  items,
  emptyHref = "/courses",
  emptyLabel = "Browse courses",
}: {
  items: ApiEnrollmentSummary[]
  emptyHref?: string
  emptyLabel?: string
}) {
  const rows = courseEnrollments(items)

  if (rows.length === 0) {
    return (
      <div>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, margin: "0 0 12px" }}>
          No courses yet. Choose something to learn and it will appear here.
        </p>
        <Link to={emptyHref} style={{ color: C.indigo, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          {emptyLabel} →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {rows.map((item, index) => {
        const href = `/learn/${item.courseSlug}`
        return (
          <Link
            key={item.id}
            to={href}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              padding: "14px 0",
              borderBottom: index < rows.length - 1 ? `1px solid ${T.lineDark}` : "none",
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
            className="learner-evidence-row"
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: C.ink }}>
                {item.courseTitle ?? item.courseSlug}
              </div>
              <div style={{ color: C.slate, fontSize: 12.5, marginTop: 4 }}>
                {[item.programName ? `Opened through ${item.programName}` : "Course", item.status].join(" · ")}
              </div>
            </div>
            <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600, alignSelf: "center" }}>Resume →</span>
          </Link>
        )
      })}
    </div>
  )
}
