import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import { AuroraBand, GlassSurface } from '../foundation'
import type { Course, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import { computeModuleProgress } from './lms-utils'
import LessonIcon from './LessonIcon'

type Accent = { primary: string; secondary: string; subtle: string; subtleStrong: string; border: string; text: string }

export function LearningWorkspacePanel({
  courseTitle,
  programName,
  progressPct,
  completedCount,
  totalLessons,
  moduleTitle,
  moduleIndex,
  moduleTotal,
  lessonTitle,
  lessonType,
  nextLessonTitle,
  learnSlug,
  lessonId,
  accent,
}: {
  courseTitle: string
  programName: string
  progressPct: number
  completedCount: number
  totalLessons: number
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  lessonTitle: string
  lessonType: string
  nextLessonTitle: string | null
  learnSlug: string
  lessonId: string
  accent: Accent
}) {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }} className="student-learning-workspace">
      <AuroraBand themeId="data-science" />
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 3.5vw, 36px)' }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Continue learning</div>
        <h1 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px', lineHeight: 1.1 }}>
          {lessonTitle}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 15, margin: '0 0 4px' }}>
          {courseTitle} · {programName}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px' }}>
          Module {moduleIndex} of {moduleTotal} · {moduleTitle} · <span style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{lessonType}</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, padding: '16px 0', marginBottom: 20, borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}` }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 6 }}>Course progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{progressPct}%</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginTop: 6 }}>{completedCount} of {totalLessons} lessons</div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>Next action</div>
            <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{nextLessonTitle ?? 'Finish current lesson'}</div>
          </div>
        </div>

        <Link
          to={lessonId ? `/learn/${learnSlug}/${lessonId}` : `/learn/${learnSlug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: accent.primary, color: C.black, textDecoration: 'none',
            padding: '13px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
          }}
        >
          Resume lesson
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>
    </GlassSurface>
  )
}

export function CurriculumProgressRail({
  course,
  lessonStates,
  accent,
  learnSlug,
}: {
  course: Course
  lessonStates: Record<string, LessonState>
  accent: Accent
  learnSlug: string
}) {
  return (
    <div id="student-curriculum" className="student-curriculum-rail" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 16 }}>Curriculum · current position</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {course.modules.map((mod: CourseModule, mi: number) => {
          const mp = computeModuleProgress(mod, lessonStates)
          const isCurrentModule = !!mp.current
          return (
            <div key={mod.id} style={{ padding: '16px 0', borderTop: mi === 0 ? 'none' : `1px solid ${T.lineDark}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: isCurrentModule ? C.white : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: isCurrentModule ? 600 : 400 }}>
                    Module {mi + 1} · {mod.title}
                  </div>
                  {mp.current && (
                    <div style={{ color: accent.text, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LessonIcon type={mp.current.type} size={12} color={accent.text} />
                      {mp.current.title}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {mp.total > 0 ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{mp.completed}/{mp.total}</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>—</span>
                  )}
                </div>
              </div>
              {mp.total > 0 && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ width: `${mp.pct}%`, height: '100%', background: isCurrentModule ? accent.primary : 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                </div>
              )}
              {isCurrentModule && mp.current && (
                <Link to={`/learn/${learnSlug}/${mp.current.id}`} style={{ display: 'inline-block', marginTop: 10, color: accent.text, fontSize: 12, textDecoration: 'none' }}>
                  Continue module →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StudentProgressSurface({
  course,
  lessonStates,
  accent,
  certificateReady,
}: {
  course: Course
  lessonStates: Record<string, LessonState>
  accent: Accent
  certificateReady: boolean
}) {
  const allLessons = course.modules.flatMap(m => m.lessons)
  const completed = allLessons.filter(l => lessonStates[l.id]?.complete).length
  const quizzes = allLessons.filter(l => l.type === 'quiz')
  const quizzesDone = quizzes.filter(l => lessonStates[l.id]?.complete).length
  const assignments = allLessons.filter(l => l.type === 'assignment')
  const assignmentsDone = assignments.filter(l => lessonStates[l.id]?.complete).length

  return (
    <div id="student-progress" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Progress</div>
      <div className="student-progress-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {[
          { label: 'Lessons', value: allLessons.length ? `${completed}/${allLessons.length}` : '—', sub: 'completed' },
          { label: 'Quizzes', value: quizzes.length ? `${quizzesDone}/${quizzes.length}` : '—', sub: 'passed' },
          { label: 'Assignments', value: assignments.length ? `${assignmentsDone}/${assignments.length}` : '—', sub: 'submitted' },
          { label: 'Certificate', value: certificateReady ? 'Ready' : '—', sub: certificateReady ? 'course complete' : 'not yet' },
        ].map(item => (
          <div key={item.label} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard }}>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.value === '—' ? 'rgba(255,255,255,0.25)' : C.white, fontFamily: 'var(--font-mono)', fontSize: 18, marginBottom: 4 }}>{item.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StudentActionRail({
  pendingTasks,
  recentActivity,
  projectTitle,
  projectWhat,
  accent,
}: {
  pendingTasks: Array<{ title: string; detail: string; href: string; label: string }>
  recentActivity: Array<{ label: string; detail: string; href: string }>
  projectTitle: string
  projectWhat: string
  accent: Accent
}) {
  return (
    <div id="student-rail" className="student-action-rail">
      <div style={{ marginBottom: 24 }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 12 }}>Up next</div>
        {pendingTasks.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.6 }}>No pending lessons — you are caught up on this course.</div>
        ) : (
          pendingTasks.map((item, i) => (
            <Link key={item.label + item.title} to={item.href} style={{ display: 'block', padding: '14px 0', borderBottom: i < pendingTasks.length - 1 ? `1px solid ${T.lineDark}` : 'none', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ color: accent.text, fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{item.detail}</div>
            </Link>
          ))
        )}
      </div>
      <div style={{ marginBottom: 24, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 12 }}>Recent activity</div>
        {recentActivity.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Complete a lesson to see activity here.</div>
        ) : (
          recentActivity.map((item, i) => (
            <Link key={item.label} to={item.href} style={{ display: 'block', padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${T.lineDark}` : 'none', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginTop: 2 }}>{item.detail}</div>
            </Link>
          ))
        )}
      </div>
      <div style={{ paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 8 }}>Project track</div>
        <div style={{ color: C.white, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{projectTitle}</div>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{projectWhat}</div>
        <Link to="/career-os" style={{ color: accent.text, fontSize: 12, textDecoration: 'none' }}>Career OS →</Link>
      </div>
    </div>
  )
}
