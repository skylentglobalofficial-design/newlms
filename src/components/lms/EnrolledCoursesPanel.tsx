import { Link } from "react-router-dom"
import { T } from "../../tokens"
import type { ApiEnrollment } from "../../lib/lms-api"
import { LmsInlineEmpty } from "./LmsEmptyState"

type Accent = { primary: string; text: string; border: string }

export default function EnrolledCoursesPanel({
  enrollments,
  activeCourseSlug,
  accent,
}: {
  enrollments: ApiEnrollment[]
  activeCourseSlug: string
  accent: Accent
}) {
  const courseEntries = enrollments.filter((entry) => entry.courseSlug)
  const programEntries = enrollments.filter((entry) => entry.programSlug && !entry.courseSlug)

  if (courseEntries.length === 0 && programEntries.length === 0) {
    return <LmsInlineEmpty>No enrollments yet. Browse the catalog to start learning.</LmsInlineEmpty>
  }

  return (
    <div className="lms-enrolled-courses">
      {courseEntries.map((entry) => {
        const isActive = entry.courseSlug === activeCourseSlug
        return (
          <Link
            key={entry.id}
            to={`/learn/${entry.courseSlug}`}
            className={`lms-enrolled-courses__card${isActive ? " is-active" : ""}`}
            style={{ borderColor: isActive ? accent.border : T.lineDark }}
          >
            <div className="lms-enrolled-courses__type">Course</div>
            <div className="lms-enrolled-courses__title">{entry.courseTitle}</div>
            <div className="lms-enrolled-courses__meta">
              {entry.status}
              {entry.certificateEligible ? ` · Certificate ${entry.certificateStatus}` : ""}
            </div>
            {isActive && <span className="lms-enrolled-courses__badge" style={{ color: accent.text }}>Current</span>}
          </Link>
        )
      })}

      {programEntries.map((entry) => (
        <div key={entry.id} className="lms-enrolled-courses__card lms-enrolled-courses__card--static">
          <div className="lms-enrolled-courses__type">Program</div>
          <div className="lms-enrolled-courses__title">{entry.programName}</div>
          <div className="lms-enrolled-courses__meta">{entry.status}</div>
        </div>
      ))}

      <Link to="/courses" className="lms-enrolled-courses__browse" style={{ color: accent.text }}>
        Browse catalog →
      </Link>
    </div>
  )
}
