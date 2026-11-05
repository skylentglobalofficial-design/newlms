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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 999,
        background: '#10b981',
        color: '#ffffff',
        flexShrink: 0,
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
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

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.18s ease',
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/**
 * Course outline: collapsible Module 01, Module 02... accordions with green completion checkmarks and lesson durations.
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
        <p className="os-eyebrow">Course Modules</p>
      </div>
      <nav className="os-rail-scroll" aria-label="Course outline">
        {course.modules.map((mod: CourseModule, mi: number) => {
          const mp = computeModuleProgress(mod, lessonStates)
          const isCurrent = mod.id === currentModuleId
          const open = Boolean(openModules[mod.id])
          const firstLesson = mod.lessons[0]
          const ahead = !mp.complete && !isCurrent && Boolean(firstLesson) && !isLessonUnlocked(firstLesson.id, allLessons, lessonStates)
          const panelId = `os-module-${mod.id}`
          const modNum = String(mi + 1).padStart(2, '0')
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
                <span className="os-module-name" style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#5142b5', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Module {modNum} · {mp.completed}/{mp.total} Done
                  </span>
                  <span className="os-module-label" style={{ fontWeight: 700 }}>{mod.title}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {mp.complete ? <CheckGlyph label="Module complete" /> : null}
                  <ChevronGlyph open={open} />
                </span>
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
                          {state?.complete ? (
                            <CheckGlyph />
                          ) : !unlocked ? (
                            <span className="os-state-glyph"><LockGlyph /></span>
                          ) : (
                            <span className="os-lesson-num" aria-hidden="true">L{number}</span>
                          )}
                          <span className="os-lesson-title" style={{ flex: 1, textAlign: 'left' }}>{lesson.title}</span>
                          {lesson.duration ? (
                            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)', marginLeft: 6 }}>
                              {lesson.duration}
                            </span>
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
