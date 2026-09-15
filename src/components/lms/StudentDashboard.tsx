import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'
import { computeModuleProgress, isLessonUnlocked, lessonTypeLabel, type LmsCourseView } from './lms-utils'
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
  started,
}: {
  courseTitle: string
  programName: string | null
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
  started: boolean
}) {
  return (
    <section className="dash-continue" id="student-learning">
      <p className="os-rail-kicker">Continue learning</p>
      <h1>{lessonTitle}</h1>
      <p>
        {courseTitle}
        {programName ? ` · Opened through ${programName}` : ''}
      </p>
      <p>
        Module {moduleIndex} of {moduleTotal} · {moduleTitle}
        {lessonType ? ` · ${lessonType}` : ''}
      </p>
      <div className="os-progress" style={{ maxWidth: 420, marginTop: 18 }}>
        <div className="os-progress-meta">
          <span>{completedCount} of {totalLessons} lessons complete</span>
        </div>
        <div className="os-progress-bar" aria-hidden="true">
          <span style={{ width: `${progressPct}%`, background: accent.primary }} />
        </div>
      </div>
      {programName ? (
        <p>This workspace is the linked course, not a separate taught programme.</p>
      ) : null}
      <p style={{ marginTop: 12 }}>
        {nextLessonTitle ? `After this: ${nextLessonTitle}` : 'Finish the current lesson, then continue.'}
      </p>
      <div className="os-actions">
        <Link className="os-btn os-btn-primary" to={lessonId ? `/learn/${learnSlug}/${lessonId}` : `/learn/${learnSlug}`}>
          {started ? 'Continue' : 'Start'}
        </Link>
      </div>
    </section>
  )
}

export function CurriculumProgressRail({
  course,
  lessonStates,
  accent,
  learnSlug,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  accent: Accent
  learnSlug: string
}) {
  const allLessons = course.modules.flatMap((module) => module.lessons)
  return (
    <div id="student-curriculum" style={{ marginTop: 28 }}>
      <p className="os-rail-kicker">Where you are</p>
      {course.modules.map((mod: CourseModule, mi: number) => {
        const mp = computeModuleProgress(mod, lessonStates)
        const currentUnlocked = Boolean(mp.current && isLessonUnlocked(mp.current.id, allLessons, lessonStates))
        return (
          <div key={mod.id} style={{ padding: '16px 0', borderTop: mi === 0 ? 'none' : `1px solid ${T.lineLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.ink, fontSize: 15, fontWeight: currentUnlocked ? 600 : 500 }}>
                  Module {mi + 1} · {mod.title}
                </div>
                {currentUnlocked && mp.current ? (
                  <div style={{ color: C.slate, fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LessonIcon type={mp.current.type} size={12} color={accent.text} />
                    {mp.current.title} · {lessonTypeLabel(mp.current.type, mp.current.title)}
                  </div>
                ) : mp.complete ? (
                  <div style={{ color: C.success, fontSize: 13, marginTop: 6 }}>Completed</div>
                ) : (
                  <div style={{ color: C.slate, fontSize: 13, marginTop: 6 }}>Locked until earlier lessons are complete</div>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate }}>
                {mp.completed}/{mp.total}
              </span>
            </div>
            {currentUnlocked && mp.current ? (
              <Link className="os-link" to={`/learn/${learnSlug}/${mp.current.id}`} style={{ display: 'inline-block', marginTop: 10 }}>
                Continue this module
              </Link>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function StudentActionRail({
  pendingTasks,
  recentActivity,
  evidenceTitle,
  evidenceDetail,
  accent,
}: {
  pendingTasks: Array<{ title: string; detail: string; href: string; label: string }>
  recentActivity: Array<{ label: string; detail: string; href: string }>
  evidenceTitle: string
  evidenceDetail: string
  accent: Accent
}) {
  return (
    <div id="student-rail">
      <div style={{ marginBottom: 24 }}>
        <p className="os-rail-kicker">Up next</p>
        {pendingTasks.length === 0 ? (
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6 }}>No practice waiting. Continue from your current lesson.</p>
        ) : (
          pendingTasks.map((item, i) => (
            <Link key={item.label + item.title} to={item.href} style={{ display: 'block', padding: '14px 0', borderBottom: i < pendingTasks.length - 1 ? `1px solid ${T.lineLight}` : 'none', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ color: accent.text, fontSize: 11, letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{item.label}</div>
              <div style={{ color: C.ink, fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
              <div style={{ color: C.slate, fontSize: 12 }}>{item.detail}</div>
            </Link>
          ))
        )}
      </div>
      <div style={{ marginBottom: 24, paddingTop: 20, borderTop: `1px solid ${T.lineLight}` }}>
        <p className="os-rail-kicker">Recent learning</p>
        {recentActivity.length === 0 ? (
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6 }}>No completed work yet. It will appear here as you finish lessons.</p>
        ) : (
          recentActivity.map((item, i) => (
            <Link key={item.label} to={item.href} style={{ display: 'block', padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${T.lineLight}` : 'none', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ color: C.slate, fontSize: 13 }}>{item.label}</div>
              <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>{item.detail}</div>
            </Link>
          ))
        )}
      </div>
      <div style={{ paddingTop: 20, borderTop: `1px solid ${T.lineLight}` }}>
        <p className="os-rail-kicker">Learning evidence</p>
        <div style={{ color: C.ink, fontSize: 14, fontWeight: 500, margin: '8px 0 6px' }}>{evidenceTitle}</div>
        <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{evidenceDetail}</div>
        <Link className="os-link" to="/career-os">View in Career OS</Link>
      </div>
    </div>
  )
}
