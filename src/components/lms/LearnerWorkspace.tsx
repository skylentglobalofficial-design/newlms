import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { LessonState } from '../../demo/types'
import type { LmsCourseView } from './lms-utils'
import { computeModuleProgress, lessonTypeLabel } from './lms-utils'
import LessonIcon from './LessonIcon'

type Accent = { primary: string; secondary: string; subtle: string; subtleStrong: string; border: string; text: string }

export function LearnerContextPanel({
  courseTitle,
  moduleTitle,
  moduleIndex,
  moduleTotal,
  lessonTitle,
  lessonType,
  completedCount,
  totalLessons,
  progressPct,
  accent,
}: {
  courseTitle: string
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  lessonTitle: string
  lessonType: string
  completedCount: number
  totalLessons: number
  progressPct: number
  accent: Accent
}) {
  return (
    <section className="learner-context" aria-labelledby="learner-context-heading">
      <p className="learner-kicker">Current learning</p>
      <p className="learner-course">{courseTitle}</p>
      <h1 id="learner-context-heading" className="learner-lesson-title">{lessonTitle}</h1>
      <p className="learner-meta">
        <span>
          Module {moduleIndex} of {moduleTotal}
          {moduleTitle ? ` · ${moduleTitle}` : ''}
        </span>
        <span className="learner-meta-sep" aria-hidden="true">·</span>
        <span>{lessonTypeLabel(lessonType as 'video' | 'notes' | 'quiz' | 'assignment') || lessonType}</span>
      </p>
      {totalLessons > 0 ? (
        <div className="learner-progress" aria-label={`Course progress ${progressPct}%`}>
          <div className="learner-progress-track">
            <div className="learner-progress-fill" style={{ width: `${progressPct}%`, background: accent.primary }} />
          </div>
          <span>
            {completedCount} of {totalLessons} lessons complete
          </span>
        </div>
      ) : (
        <p className="learner-empty-line">Lesson progress will appear here once this course has curriculum nodes.</p>
      )}
    </section>
  )
}

export function LearnerContinueAction({
  href,
  label,
  nextLabel,
  accent,
}: {
  href: string
  label: string
  nextLabel: string | null
  accent: Accent
}) {
  return (
    <section className="learner-continue" aria-labelledby="learner-continue-heading">
      <h2 id="learner-continue-heading" className="learner-section-label">What to do now</h2>
      <Link
        to={href}
        className="learner-continue-btn"
        style={{ background: accent.primary, color: C.black }}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
      {nextLabel && (
        <p className="learner-continue-next">
          After this: <strong>{nextLabel}</strong>
        </p>
      )}
    </section>
  )
}

export function LearnerProgrammeStructure({
  course,
  lessonStates,
  learnSlug,
  currentLessonId,
  accent,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  learnSlug: string
  currentLessonId: string | null
  accent: Accent
}) {
  return (
    <section className="learner-structure" id="learner-structure" aria-labelledby="learner-structure-heading">
      <h2 id="learner-structure-heading" className="learner-section-label">Course structure</h2>
      <p className="learner-section-support">Where you are in this course — from live enrollment curriculum.</p>
      <ol className="learner-module-list">
        {course.modules.map((mod, mi) => {
          const mp = computeModuleProgress(mod, lessonStates)
          const containsResume = currentLessonId
            ? mod.lessons.some(l => l.id === currentLessonId)
            : false
          const isFirstIncompleteModule =
            !currentLessonId
            && course.modules.findIndex(m => m.lessons.some(l => !lessonStates[l.id]?.complete)) === mi
          const isCurrent = containsResume || isFirstIncompleteModule
          const focusLesson = containsResume
            ? mod.lessons.find(l => l.id === currentLessonId) ?? mp.current
            : isCurrent
              ? mp.current
              : null
          return (
            <li key={mod.id} className={isCurrent ? 'is-current' : undefined}>
              <div className="learner-module-head">
                <div>
                  <span className="learner-module-index">{String(mi + 1).padStart(2, '0')}</span>
                  <strong>{mod.title}</strong>
                </div>
                <span className="learner-module-count">
                  {mp.total > 0 ? `${mp.completed}/${mp.total}` : '—'}
                </span>
              </div>
              {isCurrent && focusLesson && (
                <div className="learner-module-current">
                  <LessonIcon type={focusLesson.type} size={14} color={accent.text} />
                  <span style={{ color: accent.text }}>{focusLesson.title}</span>
                  <Link to={`/learn/${learnSlug}/${focusLesson.id}`}>Open</Link>
                </div>
              )}
              {mp.total > 0 && (
                <div className="learner-module-track" aria-hidden="true">
                  <div style={{ width: `${mp.pct}%`, background: isCurrent ? accent.primary : 'rgba(11,13,15,0.18)' }} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function LearnerRecentWork({
  items,
}: {
  items: Array<{ label: string; detail: string; href: string }>
}) {
  return (
    <section className="learner-work" id="learner-work" aria-labelledby="learner-work-heading">
      <h2 id="learner-work-heading" className="learner-section-label">Recent work</h2>
      {items.length === 0 ? (
        <p className="learner-empty-line">
          Your work will appear here as you complete lessons and projects.
        </p>
      ) : (
        <ul className="learner-work-list">
          {items.map(item => (
            <li key={item.label + item.detail}>
              <Link to={item.href}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function LearnerEmptyEnrollment({
  enrolling,
  onEnroll,
  accent,
}: {
  enrolling: boolean
  onEnroll: () => void
  accent: Accent
}) {
  return (
    <section className="learner-empty" aria-labelledby="learner-empty-heading">
      <p className="learner-kicker">Learning workspace</p>
      <h1 id="learner-empty-heading">Your learning progress will appear here once you begin a programme.</h1>
      <p>
        Enroll in a course to open your curriculum, resume point, and recent work. No fabricated progress is shown here.
      </p>
      <div className="learner-empty-actions">
        <button
          type="button"
          disabled={enrolling}
          onClick={onEnroll}
          className="learner-continue-btn"
          style={{ background: accent.primary, color: C.black }}
        >
          {enrolling ? 'Enrolling…' : 'Start with Data Analytics'}
        </button>
        <Link to="/programs" className="learner-secondary-link">Browse programmes</Link>
        <Link to="/courses" className="learner-secondary-link">Browse courses</Link>
      </div>
      <p className="learner-disclaimer">
        “Data Analytics” maps to the seeded course <code>data-analytics</code> linked from Skills programmes such as Data Analytics with Gen AI.
      </p>
    </section>
  )
}

export function LearnerPhaseNote() {
  return (
    <aside className="learner-phase-note" aria-label="Later LMS phases">
      <p>
        Practice, projects, and evidence workflows expand in later LMS phases. This screen establishes your current learning context and next action.
      </p>
    </aside>
  )
}
