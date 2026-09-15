import { Link } from 'react-router-dom'
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
  lessonDuration,
  nextLessonTitle,
  learnSlug,
  lessonId,
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
  lessonDuration?: string
  nextLessonTitle: string | null
  learnSlug: string
  lessonId: string
  accent: Accent
  started: boolean
}) {
  return (
    <section className="dash-continue" id="student-learning">
      <p className="os-eyebrow">Continue learning</p>
      <h2>{courseTitle}</h2>
      {programName ? (
        <p className="dash-continue-meta">Opened through {programName}</p>
      ) : null}
      <div className="os-progress">
        <div className="os-progress-meta">
          <span>{completedCount} of {totalLessons} lessons</span>
          <span>{progressPct}%</span>
        </div>
        <div className="os-progress-bar" aria-hidden="true">
          <span style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <div className="dash-continue-lesson">
        <p className="os-eyebrow">Current lesson</p>
        <h3>{lessonTitle}</h3>
        <p className="dash-continue-meta">
          Module {moduleIndex} of {moduleTotal} · {moduleTitle}
          {lessonType ? ` · ${lessonType}` : ''}
          {lessonDuration ? ` · ${lessonDuration}` : ''}
        </p>
      </div>
      {nextLessonTitle ? (
        <p className="dash-continue-meta" style={{ marginTop: 12 }}>Next: {nextLessonTitle}</p>
      ) : (
        <p className="dash-continue-meta" style={{ marginTop: 12 }}>Finish this lesson, then continue.</p>
      )}
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
  learnSlug,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  accent: Accent
  learnSlug: string
}) {
  const allLessons = course.modules.flatMap((module) => module.lessons)
  return (
    <div className="dash-modules" id="student-curriculum">
      <p className="os-eyebrow" style={{ marginBottom: 10 }}>Course map</p>
      {course.modules.map((mod: CourseModule, mi: number) => {
        const mp = computeModuleProgress(mod, lessonStates)
        const currentUnlocked = Boolean(mp.current && isLessonUnlocked(mp.current.id, allLessons, lessonStates))
        return (
          <div key={mod.id} className="dash-module">
            <div className="dash-module-row">
              <div style={{ minWidth: 0 }}>
                <div className="dash-module-title">
                  {String(mi + 1).padStart(2, '0')} · {mod.title}
                </div>
                {currentUnlocked && mp.current ? (
                  <div className="dash-continue-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <LessonIcon type={mp.current.type} size={12} color="#4f46e5" />
                    {mp.current.title} · {lessonTypeLabel(mp.current.type, mp.current.title)}
                  </div>
                ) : mp.complete ? (
                  <div className="dash-continue-meta" style={{ marginTop: 6, color: '#15803d' }}>Completed</div>
                ) : (
                  <div className="dash-continue-meta" style={{ marginTop: 6 }}>Locked until earlier lessons are complete</div>
                )}
              </div>
              <span className="dash-continue-meta">{mp.completed}/{mp.total}</span>
            </div>
            <div className="os-progress-bar" aria-hidden="true">
              <span style={{ width: `${mp.pct}%` }} />
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
  practiceTasks,
  recentActivity,
  evidenceTitle,
  evidenceDetail,
}: {
  pendingTasks: Array<{ title: string; detail: string; href: string; label: string; locked?: boolean }>
  practiceTasks?: Array<{ title: string; detail: string; href: string; label: string; locked?: boolean }>
  recentActivity: Array<{ label: string; detail: string; href: string }>
  evidenceTitle: string
  evidenceDetail: string
  accent: Accent
}) {
  const practice = practiceTasks ?? pendingTasks.filter((item) => item.label === 'Quiz' || item.label === 'Assignment' || item.label === 'Capstone')
  const upcoming = pendingTasks.filter((item) => !practice.some((row) => row.href === item.href && row.title === item.title))

  return (
    <div id="student-rail">
      <section className="dash-card">
        <h2>Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="dash-empty-copy">No further unlocked lessons yet. Continue from your current lesson.</p>
        ) : (
          upcoming.map((item) => {
            const body = (
              <>
                <div className="dash-item-label">{item.locked ? `${item.label} · Locked` : item.label}</div>
                <div className="dash-item-title">{item.title}</div>
                <div className="dash-item-detail">{item.detail}</div>
              </>
            )
            return item.locked ? (
              <div key={item.label + item.title} className="dash-item">{body}</div>
            ) : (
              <Link key={item.label + item.title} to={item.href} className="dash-item">{body}</Link>
            )
          })
        )}
      </section>
      <section className="dash-card">
        <h2>Practice and work</h2>
        {practice.length === 0 ? (
          <p className="dash-empty-copy">Quizzes and assignments appear here when they unlock.</p>
        ) : (
          practice.map((item) => (
            <Link key={`practice-${item.title}`} to={item.href} className="dash-item">
              <div className="dash-item-label">{item.label}</div>
              <div className="dash-item-title">{item.title}</div>
              <div className="dash-item-detail">{item.detail}</div>
            </Link>
          ))
        )}
      </section>
      <section className="dash-card">
        <h2>Recent learning</h2>
        {recentActivity.length === 0 ? (
          <p className="dash-empty-copy">Completed lessons will appear here.</p>
        ) : (
          recentActivity.map((item) => (
            <Link key={item.label} to={item.href} className="dash-item">
              <div className="dash-item-title">{item.label}</div>
              <div className="dash-item-detail">{item.detail}</div>
            </Link>
          ))
        )}
      </section>
      <section className="dash-card">
        <h2>Learning evidence</h2>
        <div className="dash-item-title">{evidenceTitle}</div>
        <p className="dash-empty-copy" style={{ margin: '6px 0 12px' }}>{evidenceDetail}</p>
        <Link className="os-link" to="/career-os">View in Career OS</Link>
      </section>
    </div>
  )
}
