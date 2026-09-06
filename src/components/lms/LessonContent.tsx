import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import MuxVideoPlaceholder from './MuxVideoPlaceholder'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { lessonTypeLabel } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

const DEFAULT_QUIZ: QuizQuestion[] = [
  { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'Structured Queue List', 'Standard Query Link'], correct: 0 },
  { q: 'Which SQL clause filters rows after grouping?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 1 },
  { q: 'What type of JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correct: 3 },
]

export function LessonContentView({
  lesson,
  lessonState,
  accent,
  onComplete,
}: {
  lesson: CourseLesson
  lessonState: LessonState
  accent: Accent
  onComplete: () => void
}) {
  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-video">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
            <h2 style={{ color: C.white, fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{lesson.title}</h2>
          </div>
          {lesson.duration && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{lesson.duration}</span>}
        </div>
        <MuxVideoPlaceholder
          title={lesson.title}
          duration={lesson.duration}
          watched={lessonState.complete || lessonState.videoWatched}
          accent={accent}
          onMarkWatched={lessonState.complete ? undefined : () => onComplete()}
        />
        {(lessonState.complete || lessonState.videoWatched) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: T.rControl, padding: '10px 18px', color: '#22c55e', fontSize: 13 }}>
            Lesson complete
          </div>
        )}
      </div>
    )
  }

  if (lesson.type === 'notes') {
    const notes = `# ${lesson.title}\n\n## Key concepts\n\n- Foundational ideas for ${lesson.title}\n- How this connects to the module curriculum\n- Practice checkpoints before the next lesson\n\n## Summary\n\nRead through and mark complete when ready to continue.`
    return (
      <div className="lms-lesson-notes">
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)', maxWidth: 720 }}>
            {notes.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <div key={i} style={{ color: C.white, fontSize: 20, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>{line.slice(2)}</div>
              if (line.startsWith('## ')) return <div key={i} style={{ color: C.white, fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 10 }}>{line.slice(3)}</div>
              if (line.startsWith('- ')) return <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 8, paddingLeft: 16, borderLeft: `2px solid ${accent.border}` }}>{line.slice(2)}</div>
              if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
              return <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>{line}</div>
            })}
          </div>
          <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 16 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Resources</div>
            {['Course slides', 'Reference sheet', 'Practice set'].map(r => (
              <div key={r} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${T.lineDark}` }}>{r}</div>
            ))}
          </div>
        </div>
        {!lessonState.complete && (
          <button type="button" onClick={onComplete} style={{ marginTop: 20, background: accent.primary, border: 'none', color: C.black, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Mark reading complete →
          </button>
        )}
      </div>
    )
  }

  if (lesson.type === 'quiz') {
    return (
      <div className="lms-lesson-quiz" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)' }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        <AssessmentSurface
          mode="timed"
          title={lesson.title}
          subtitle="Answer all questions correctly to complete this lesson."
          questions={DEFAULT_QUIZ}
          accent={accent}
          passed={lessonState.complete || lessonState.quizPassed}
          onPass={onComplete}
        />
      </div>
    )
  }

  return (
    <div className="lms-lesson-assignment" style={{ borderLeft: `3px solid ${accent.primary}`, paddingLeft: 20 }}>
      <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle="Apply concepts from this module. Faculty will review your submission."
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={() => onComplete()}
      />
    </div>
  )
}

export function LessonNavigation({
  prev,
  next,
  courseSlug,
  accent,
  onNavigate,
}: {
  prev: CourseLesson | null
  next: CourseLesson | null
  courseSlug: string
  accent: Accent
  onNavigate: (id: string) => void
}) {
  return (
    <div className="lms-lesson-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.lineDark}`, flexWrap: 'wrap' }}>
      {prev ? (
        <button type="button" onClick={() => onNavigate(prev.id)} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: '10px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', maxWidth: '48%' }}>
          ← {prev.title}
        </button>
      ) : <div />}
      {next ? (
        <Link to={`/learn/${courseSlug}/${next.id}`} onClick={() => onNavigate(next.id)} style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rControl, padding: '10px 16px', color: accent.text, fontSize: 13, textDecoration: 'none', textAlign: 'right', maxWidth: '48%' }}>
          {next.title} →
        </Link>
      ) : null}
    </div>
  )
}
