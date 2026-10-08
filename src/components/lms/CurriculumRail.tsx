import { useEffect, useState } from 'react'
import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import {
  computeModuleProgress,
  isLessonUnlocked,
  lessonStatusLabel,
  lessonTypeLabel,
  type LmsCourseView,
} from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

function CheckGlyph({ label }: { label?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  )
}

/**
 * Course outline: modules with real completion, lessons with real state.
 * The module that holds the open lesson is expanded; any other module can be opened from its row.
 */
export default function CurriculumRail({
  course,
  lessonStates,
  selectedLessonId,
  onSelectLesson,
  onClose,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  selectedLessonId: string
  /** Kept for call-site compatibility; the outline uses the system tokens. */
  accent?: Accent
  onSelectLesson: (id: string) => void
  onClose?: () => void
}) {
  const allLessons = course.modules.flatMap((module) => module.lessons)
  const currentModuleId =
    course.modules.find((module) => module.lessons.some((lesson) => lesson.id === selectedLessonId))?.id ?? null
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    currentModuleId ? { [currentModuleId]: true } : {},
  )

  useEffect(() => {
    if (!currentModuleId) return
    setOpenModules((current) => (current[currentModuleId] ? current : { ...current, [currentModuleId]: true }))
  }, [currentModuleId])

  return (
    <div className="os-curriculum">
      <div className="os-rail-head">
        {onClose ? (
          <button type="button" className="os-rail-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Close outline
          </button>
        ) : null}
        <p className="os-eyebrow">Outline</p>
      </div>
      <nav className="os-rail-scroll" aria-label="Course outline">
        {course.modules.map((mod: CourseModule, mi: number) => {
          const mp = computeModuleProgress(mod, lessonStates)
          const isCurrent = mod.id === currentModuleId
          const open = Boolean(openModules[mod.id])
          const firstLesson = mod.lessons[0]
          const ahead = !mp.complete && !isCurrent && Boolean(firstLesson) && !isLessonUnlocked(firstLesson.id, allLessons, lessonStates)
          const panelId = `os-module-${mod.id}`
          return (
            <div
              className={`os-module${isCurrent ? ' is-current' : ''}${ahead ? ' is-ahead' : ''}`}
              key={mod.id}
            >
              <button
                type="button"
                className="os-module-toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenModules((current) => ({ ...current, [mod.id]: !current[mod.id] }))}
              >
                <span className="os-module-name">
                  <span className="os-module-num">M{mi + 1}</span>
                  <span className="os-module-label">{mod.title}</span>
                </span>
                {mp.complete ? (
                  <span className="os-state-glyph"><CheckGlyph label="Module complete" /></span>
                ) : (
                  <span className="os-module-meta">{mp.completed} of {mp.total}</span>
                )}
              </button>
              <div className="os-module-track" aria-hidden="true">
                <span style={{ width: `${mp.pct}%` }} />
              </div>
              {open ? (
                <ul className="os-lessons" id={panelId}>
                  {mod.lessons.map((lesson: CourseLesson) => {
                    const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
                    const state = lessonStates[lesson.id]
                    const isActive = selectedLessonId === lesson.id
                    const status = lessonStatusLabel(state, isActive && unlocked && !state?.complete)
                    const number = allLessons.findIndex((item) => item.id === lesson.id) + 1
                    const classes = [
                      'os-lesson',
                      isActive ? 'is-current' : '',
                      state?.complete ? 'is-complete' : '',
                      !unlocked ? 'is-locked' : '',
                    ].filter(Boolean).join(' ')
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          className={classes}
                          onClick={() => unlocked && onSelectLesson(lesson.id)}
                          disabled={!unlocked}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={`Lesson ${number}: ${lesson.title}, ${lessonTypeLabel(lesson.type, lesson.title)}, ${status}${lesson.duration ? `, ${lesson.duration}` : ''}`}
                        >
                          <span className="os-lesson-num" aria-hidden="true">L{number}</span>
                          <span className="os-lesson-title">{lesson.title}</span>
                          {state?.complete ? (
                            <span className="os-state-glyph"><CheckGlyph /></span>
                          ) : !unlocked ? (
                            <span className="os-state-glyph"><LockGlyph /></span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
