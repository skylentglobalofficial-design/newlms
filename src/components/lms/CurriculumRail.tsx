import { Link } from 'react-router-dom'
import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import {
  computeCourseProgress,
  computeModuleProgress,
  isLessonUnlocked,
  lessonStatusLabel,
  lessonTypeLabel,
  type LmsCourseView,
} from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

function StateGlyph({
  complete,
  locked,
  current,
}: {
  complete?: boolean
  locked: boolean
  current: boolean
}) {
  if (complete) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (locked) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e737a" strokeWidth="2" aria-hidden="true">
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="16" r="1.2" fill="#6e737a" stroke="none" />
      </svg>
    )
  }
  if (current) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="4" fill="#4f46e5" />
      </svg>
    )
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="3.4" fill="none" stroke="#8a8f96" strokeWidth="1.4" />
    </svg>
  )
}

export default function CurriculumRail({
  course,
  lessonStates,
  selectedLessonId,
  accent,
  onSelectLesson,
  onClose,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  selectedLessonId: string
  accent: Accent
  onSelectLesson: (id: string) => void
  onClose?: () => void
}) {
  const allLessons = course.modules.flatMap((module) => module.lessons)
  const { completedCount, totalLessons, progressPct } = computeCourseProgress(allLessons, lessonStates)

  return (
    <div className="os-curriculum">
      <div className="os-rail-head">
        {onClose ? (
          <button type="button" className="os-rail-close" onClick={onClose} aria-label="Close curriculum">
            Close curriculum
          </button>
        ) : null}
        <Link to="/" className="os-rail-brand">
          Skylent<span>.</span>
        </Link>
        <p className="os-eyebrow">Course</p>
        <h2 className="os-rail-title">{course.title}</h2>
        <div className="os-progress" aria-label={`${completedCount} of ${totalLessons} lessons complete`}>
          <div className="os-progress-meta">
            <span>{completedCount} of {totalLessons} lessons complete</span>
          </div>
          <div className="os-progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPct}%`, background: accent.primary }} />
          </div>
        </div>
      </div>
      <nav className="os-rail-scroll" aria-label="Course curriculum">
        {course.modules.map((mod: CourseModule, mi: number) => {
          const mp = computeModuleProgress(mod, lessonStates)
          return (
            <div className="os-module" key={mod.id}>
              <div className="os-module-head">
                <span className="os-module-num">{String(mi + 1).padStart(2, '0')}</span>
                <div className="os-module-label">{mod.title}</div>
                <div className="os-module-meta">
                  {mod.lessons.length} {mod.lessons.length === 1 ? 'activity' : 'activities'} · {mp.completed}/{mp.total}
                </div>
                {mp.pct > 0 ? (
                  <div className="os-module-track" aria-hidden="true">
                    <span style={{ width: `${mp.pct}%` }} />
                  </div>
                ) : null}
              </div>
              {mod.lessons.map((lesson: CourseLesson) => {
                const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
                const state = lessonStates[lesson.id]
                const isActive = selectedLessonId === lesson.id
                const status = lessonStatusLabel(state, isActive && unlocked && !state?.complete)
                const classes = [
                  'os-lesson',
                  isActive ? 'is-current' : '',
                  state?.complete ? 'is-complete' : '',
                  !unlocked ? 'is-locked' : '',
                ].filter(Boolean).join(' ')
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className={classes}
                    onClick={() => unlocked && onSelectLesson(lesson.id)}
                    disabled={!unlocked}
                    aria-current={isActive ? 'page' : undefined}
                    aria-disabled={!unlocked}
                    aria-label={`${lesson.title}, ${lessonTypeLabel(lesson.type, lesson.title)}, ${status}${lesson.duration ? `, ${lesson.duration}` : ''}`}
                  >
                    <span className="os-state-glyph">
                      <StateGlyph complete={state?.complete} locked={!unlocked} current={isActive && unlocked && !state?.complete} />
                    </span>
                    <span>
                      <span className="os-lesson-title">{lesson.title}</span>
                      <span className="os-lesson-meta">
                        {lessonTypeLabel(lesson.type, lesson.title)}
                        {lesson.duration ? ` · ${lesson.duration}` : ''}
                        {!unlocked ? ' · Locked' : ''}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
