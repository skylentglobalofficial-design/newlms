import { Link } from 'react-router-dom'
import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonIcon from './LessonIcon'
import { computeCourseProgress, isLessonUnlocked, lessonTypeLabel, type LmsCourseView } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

export default function CurriculumRail({
  course,
  lessonStates,
  selectedLessonId,
  accent,
  onSelectLesson,
  homeHref = '/dashboard/student',
  titleId,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  selectedLessonId: string
  accent: Accent
  onSelectLesson: (id: string) => void
  homeHref?: string
  titleId?: string
}) {
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const { progressPct } = computeCourseProgress(allLessons, lessonStates)

  return (
    <div className="lms-curriculum-rail skylent-curriculum-rail">
      <div className="lms-curriculum-rail-header">
        <Link to={homeHref} className="lms-curriculum-home">
          <span className="lms-curriculum-brand">
            Skylent<span style={{ color: accent.primary }}>.</span>
          </span>
        </Link>
        <div id={titleId} className="lms-curriculum-course-title">
          {course.title}
        </div>
        {allLessons.length > 0 ? (
          <div className="lms-curriculum-progress" aria-label={`${progressPct}% of lessons complete`}>
            <div className="lms-curriculum-progress-row">
              <span>Course progress</span>
              <span className="lms-curriculum-progress-pct" style={{ color: accent.text }}>
                {progressPct}%
              </span>
            </div>
            <div className="lms-curriculum-progress-track">
              <div
                className="lms-curriculum-progress-fill"
                style={{ background: accent.primary, width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
      <nav className="skylent-curriculum-scroll" aria-label="Course modules">
        {course.modules.map((mod: CourseModule, mi: number) => (
          <div key={mod.id}>
            <div className="skylent-module-label">
              Module {mi + 1} · {mod.title}
            </div>
            {mod.lessons.map((lesson: CourseLesson) => {
              const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
              const state = lessonStates[lesson.id]
              const isActive = selectedLessonId === lesson.id
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => unlocked && onSelectLesson(lesson.id)}
                  disabled={!unlocked}
                  className={`lms-curriculum-lesson${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="lms-curriculum-lesson-icon" aria-hidden="true">
                    {state?.complete ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.primary} strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : !unlocked ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      <LessonIcon type={lesson.type} color={isActive ? accent.text : 'currentColor'} />
                    )}
                  </div>
                  <div className="lms-curriculum-lesson-copy">
                    <div className={`lms-curriculum-lesson-title${unlocked ? '' : ' is-locked'}${isActive ? ' is-active' : ''}`}>
                      {lesson.title}
                    </div>
                    <div className="lms-curriculum-lesson-meta">
                      {lessonTypeLabel(lesson.type)}
                      {lesson.duration ? ` · ${lesson.duration}` : ''}
                      {state?.complete ? ' · Complete' : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}
