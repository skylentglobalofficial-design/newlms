import { Link } from 'react-router-dom'
import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonIcon from './LessonIcon'
import {
  computeCourseProgress,
  isLessonUnlocked,
  learningLoopLabel,
  lessonStatusLabel,
  lessonTypeLabel,
  type LmsCourseView,
} from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

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
  const { completedCount, totalLessons } = computeCourseProgress(allLessons, lessonStates)

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
        <p className="os-rail-kicker">Course</p>
        <h2 className="os-rail-title">{course.title}</h2>
        <div className="os-progress" aria-label="Course progress">
          <div className="os-progress-meta">
            <span>{completedCount} of {totalLessons} complete</span>
          </div>
          <div className="os-progress-bar" aria-hidden="true">
            <span style={{ width: `${totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0}%`, background: accent.primary }} />
          </div>
        </div>
      </div>
      <nav className="os-rail-scroll" aria-label="Course curriculum">
        {course.modules.map((mod: CourseModule, mi: number) => (
          <div className="os-module" key={mod.id}>
            <div className="os-module-label">Module {mi + 1} · {mod.title}</div>
            {mod.lessons.map((lesson: CourseLesson) => {
              const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
              const state = lessonStates[lesson.id]
              const isActive = selectedLessonId === lesson.id
                  const status = lessonStatusLabel(state, isActive && unlocked && !state?.complete)
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className={isActive ? 'os-lesson is-current' : 'os-lesson'}
                  onClick={() => unlocked && onSelectLesson(lesson.id)}
                  disabled={!unlocked}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={!unlocked}
                >
                  <span aria-hidden="true">
                    {state?.complete ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : !unlocked ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e737a" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : (
                      <LessonIcon type={lesson.type} color={isActive ? accent.text : '#5c6168'} />
                    )}
                  </span>
                  <span>
                    <span className="os-lesson-title">{lesson.title}</span>
                    <span className="os-lesson-meta">
                      {learningLoopLabel(lesson)} · {lessonTypeLabel(lesson.type, lesson.title)} · {status}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}
