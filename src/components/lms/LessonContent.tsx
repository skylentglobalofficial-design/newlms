import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonVideoPlayer from './LessonVideoPlayer'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { lessonTypeLabel } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

export type LessonNotesContent = {
  body: string
}

function renderNotesParagraphs(body: string): string[] {
  const trimmed = body.trim()
  if (!trimmed) return []
  return trimmed.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
}

export function LessonContentView({
  lesson,
  lessonState,
  accent,
  onComplete,
  quizQuestions,
  quizLoading,
  onQuizSubmit,
  onAssignmentSubmit,
  lessonMedia,
  notesContent,
  hasMaterials,
}: {
  lesson: CourseLesson
  lessonState: LessonState
  accent: Accent
  onComplete: () => void
  quizQuestions?: QuizQuestion[]
  quizLoading?: boolean
  onQuizSubmit?: (answers: Record<number, number>) => Promise<boolean>
  onAssignmentSubmit?: (text: string) => Promise<void>
  lessonMedia?: VideoPlaybackSource
  notesContent?: LessonNotesContent | null
  hasMaterials?: boolean
}) {
  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-video">
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
    const paragraphs = notesContent ? renderNotesParagraphs(notesContent.body) : []
    return (
      <div className="lms-lesson-notes">
        {paragraphs.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Reading</div>
            <h2 style={{ color: C.white, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 16px', lineHeight: 1.3 }}>
              {lesson.title}
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : !hasMaterials ? (
          <div className="lms-empty-state lms-empty-state--inline">
            <p className="lms-empty-state__copy">
              No notes published yet for this lesson. Instructor materials will appear below when available.
            </p>
          </div>
        ) : null}
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
      <div className="lms-lesson-quiz">
        {quizLoading ? (
          <div className="lms-empty-state lms-empty-state--inline">
            <p className="lms-empty-state__copy">Quiz questions are loading…</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="lms-empty-state lms-empty-state--inline">
            <p className="lms-empty-state__copy">
              {lessonState.complete || lessonState.quizPassed
                ? 'This quiz is complete.'
                : 'Quiz questions could not be loaded. Refresh the page or contact support if this persists.'}
            </p>
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
    <div className="lms-lesson-assignment">
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle="Apply concepts from this module. Faculty will review your submission."
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={(text) => { void onAssignmentSubmit?.(text) }}
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
