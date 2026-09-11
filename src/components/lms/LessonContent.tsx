import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonVideoPlayer from './LessonVideoPlayer'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import AssignmentBrief from './AssignmentBrief'
import { lessonTypeLabel } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

export function LessonContentView({
  lesson,
  lessonState,
  accent,
  onComplete,
  quizQuestions,
  quizStatus = 'idle',
  onQuizSubmit,
  onAssignmentSubmit,
  lessonMedia,
  courseSlug,
}: {
  lesson: CourseLesson
  lessonState: LessonState
  accent: Accent
  onComplete: () => void
  quizQuestions?: QuizQuestion[]
  quizStatus?: 'idle' | 'loading' | 'ready'
  onQuizSubmit?: (answers: Record<number, number>) => Promise<boolean>
  onAssignmentSubmit?: (text: string, file: File | null) => Promise<void>
  lessonMedia?: VideoPlaybackSource
  courseSlug?: string
}) {
  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-video lms-activity-surface lms-activity-video">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
            <h2 style={{ color: C.white, fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{lesson.title}</h2>
          </div>
          {lesson.duration && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{lesson.duration}</span>}
        </div>
        <LessonVideoPlayer
          media={lessonMedia}
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
    return (
      <div className="lms-lesson-notes lms-activity-surface lms-activity-reading">
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)', maxWidth: 720 }}>
          <div style={{ color: C.white, fontSize: 20, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>{lesson.title}</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7 }}>
            Reading for this lesson. A slide deck and practice set are not published here yet — mark complete when you have gone through the accompanying video.
          </p>
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
    const questions = quizQuestions ?? []
    return (
      <div className="lms-lesson-quiz lms-activity-surface lms-activity-quiz" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)' }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        {quizStatus !== 'ready' ? (
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Quiz questions are loading…</div>
        ) : questions.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            Quiz questions are not published for this lesson yet. This node cannot be auto-scored until a question bank is authored.
          </div>
        ) : (
          <AssessmentSurface
            mode="timed"
            title={lesson.title}
            subtitle="Answer all questions correctly to complete this lesson."
            questions={questions}
            accent={accent}
            passed={lessonState.complete || lessonState.quizPassed}
            onPass={onComplete}
            onSubmitAnswers={onQuizSubmit}
          />
        )}
      </div>
    )
  }

  return (
    <div className="lms-lesson-assignment lms-activity-surface lms-activity-assignment" style={{ borderLeft: `3px solid ${accent.primary}`, paddingLeft: 20 }}>
      <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
      <AssignmentBrief courseSlug={courseSlug} lessonId={lesson.id} />
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle="Submit the work in the brief. There is no automated score on this surface."
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={(text, file) => { void onAssignmentSubmit?.(text, file) }}
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
