import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonIcon from './LessonIcon'
import { computeCourseProgress, isLessonUnlocked, type LmsCourseView } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

export default function CurriculumRail({
  course,
  lessonStates,
  selectedLessonId,
  accent,
  onSelectLesson,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  selectedLessonId: string
  accent: Accent
  onSelectLesson: (id: string) => void
}) {
  const allLessons = course.modules.flatMap(m => m.lessons)
  const { progressPct } = computeCourseProgress(allLessons, lessonStates)

  return (
    <div className="lms-curriculum-rail">
      <div style={{ padding: '20px', borderBottom: `1px solid ${T.lineDark}` }}>
        <Link to="/dashboard/student" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: C.white }}>
            Skylent<span style={{ color: accent.primary }}>.</span>
          </span>
        </Link>
        <div style={{ color: C.white, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{course.title}</div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Course progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text }}>{progressPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, height: 4 }}>
            <div style={{ background: accent.primary, width: `${progressPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {course.modules.map((mod: CourseModule, mi: number) => (
          <div key={mod.id}>
            <div style={{ padding: '12px 16px 6px', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.06em' }}>
              Module {mi + 1} · {mod.title}
            </div>
            {mod.lessons.map((lesson: CourseLesson) => {
              const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
              const state = lessonStates[lesson.id]
              const isActive = selectedLessonId === lesson.id
              const isCurrent = unlocked && !state?.complete
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => unlocked && onSelectLesson(lesson.id)}
                  disabled={!unlocked}
                  className={`lms-curriculum-lesson${isActive ? ' active' : ''}`}
                  style={{
                    display: 'flex', width: '100%', textAlign: 'left', padding: '9px 16px', gap: 10, alignItems: 'center',
                    background: isActive ? accent.subtle : isCurrent ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderLeft: isActive ? `2px solid ${accent.primary}` : '2px solid transparent',
                    border: 'none', cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div style={{ flexShrink: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {state?.complete ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : !unlocked ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : (
                      <LessonIcon type={lesson.type} color={isActive ? accent.text : 'rgba(255,255,255,0.35)'} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ color: unlocked ? (isActive ? C.white : 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.2)', fontSize: 12, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lesson.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, textTransform: 'uppercase' }}>
                      {lesson.type}{lesson.duration ? ` · ${lesson.duration}` : ''}
                    </div>
                  </div>
                  {isCurrent && !isActive && (
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, flexShrink: 0 }}>NOW</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
