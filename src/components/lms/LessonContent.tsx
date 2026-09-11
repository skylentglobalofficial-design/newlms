import { Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import LessonVideoPlayer from './LessonVideoPlayer'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { lessonTypeLabel } from './lms-utils'
import type { AssignmentStatePayload } from '../../lib/lms-api'

const ProjectExperience = lazy(() => import('./ProjectExperience'))

type Accent = { primary: string; subtle: string; border: string; text: string }

export function LessonContentView({
  lesson,
  lessonState,
  accent,
  onComplete,
  completing = false,
  quizQuestions,
  onQuizSubmit,
  onAssignmentSubmit,
  assignmentState,
  onProjectSubmitted,
  courseSlug,
  lessonMedia,
}: {
  lesson: CourseLesson
  lessonState: LessonState
  accent: Accent
  onComplete: () => void
  completing?: boolean
  quizQuestions?: QuizQuestion[]
  onQuizSubmit?: (answers: Record<number, number>) => Promise<boolean>
  onAssignmentSubmit?: (text: string) => Promise<void>
  assignmentState?: AssignmentStatePayload | null
  onProjectSubmitted?: () => Promise<void>
  courseSlug: string
  lessonMedia?: VideoPlaybackSource
}) {
  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-body lms-lesson-body--video">
        <LessonVideoPlayer
          media={lessonMedia}
          title={lesson.title}
          duration={lesson.duration}
          watched={lessonState.complete || lessonState.videoWatched}
          accent={accent}
          onMarkWatched={lessonState.complete || completing ? undefined : () => onComplete()}
        />
        {lessonState.complete ? (
          <p className="lms-lesson-status is-complete" role="status">
            Lesson complete
          </p>
        ) : (
          <div className="lms-lesson-actions">
            <button
              type="button"
              className="lms-mark-complete"
              style={{ background: accent.primary }}
              onClick={onComplete}
              disabled={completing}
            >
              {completing ? 'Saving…' : 'Mark lesson complete'}
            </button>
            <p className="lms-lesson-hint">Use this when you have finished the video lesson.</p>
          </div>
        )}
      </div>
    )
  }

  if (lesson.type === 'notes') {
    return (
      <div className="lms-lesson-body lms-lesson-body--notes">
        <div className="lms-lesson-unavailable" role="status">
          <p className="lms-lesson-kicker">{lessonTypeLabel(lesson.type)}</p>
          <h2>Lesson content isn't available yet.</h2>
          <p>
            This reading lesson exists in the curriculum, but attached reading materials are not stored in the LMS yet.
            You can still mark it complete to unlock the next lesson when you are ready to continue.
          </p>
        </div>
        {lessonState.complete ? (
          <p className="lms-lesson-status is-complete" role="status">
            Lesson complete
          </p>
        ) : (
          <div className="lms-lesson-actions">
            <button
              type="button"
              className="lms-mark-complete"
              style={{ background: accent.primary }}
              onClick={onComplete}
              disabled={completing}
            >
              {completing ? 'Saving…' : 'Mark lesson complete'}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (lesson.type === 'quiz') {
    const questions = quizQuestions ?? []
    return (
      <div className="lms-lesson-body lms-lesson-body--quiz">
        <p className="lms-lesson-kicker">{lessonTypeLabel(lesson.type)}</p>
        <p className="lms-lesson-defer-note">
          This curriculum node uses the existing quiz completion path so you can continue the course. A dedicated Practice
          phase is not part of this lesson experience.
        </p>
        {questions.length === 0 ? (
          <p className="lms-lesson-hint">Quiz questions are loading, or none are attached to this lesson yet.</p>
        ) : (
          <AssessmentSurface
            mode="timed"
            title={lesson.title}
            subtitle="Answer the questions to complete this lesson."
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

  if (assignmentState?.brief) {
    return (
      <div className="lms-lesson-body lms-lesson-body--assignment lms-lesson-body--project">
        <Suspense fallback={<p className="lms-lesson-hint">Loading project brief…</p>}>
          <ProjectExperience
            courseSlug={courseSlug}
            lessonKey={lesson.id}
            brief={assignmentState.brief}
            accent={accent}
            status={assignmentState.status}
            initialResponseText={assignmentState.responseText}
            initialAttachments={assignmentState.attachments}
            onSubmitted={async () => {
              await onProjectSubmitted?.()
            }}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="lms-lesson-body lms-lesson-body--assignment">
      <p className="lms-lesson-kicker">{lessonTypeLabel(lesson.type)}</p>
      <p className="lms-lesson-defer-note">
        This curriculum node uses the existing assignment submission path so you can continue the course. A dedicated
        project brief is not authored for this node yet.
      </p>
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle="Submit work for this assignment node when you are ready."
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={(text) => {
          void onAssignmentSubmit?.(text)
        }}
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
  nextUnlocked,
  complete,
  dashboardHref = '/dashboard/student',
}: {
  prev: CourseLesson | null
  next: CourseLesson | null
  courseSlug: string
  accent: Accent
  onNavigate: (id: string) => void
  nextUnlocked: boolean
  complete: boolean
  dashboardHref?: string
}) {
  return (
    <nav className="lms-lesson-nav" aria-label="Lesson navigation">
      {prev ? (
        <button type="button" className="lms-nav-prev" onClick={() => onNavigate(prev.id)}>
          <span>Previous</span>
          <strong>{prev.title}</strong>
        </button>
      ) : (
        <span className="lms-nav-spacer" aria-hidden="true" />
      )}

      {next ? (
        nextUnlocked ? (
          <Link
            className={`lms-nav-next${complete ? ' is-primary' : ''}`}
            to={`/learn/${courseSlug}/${next.id}`}
            onClick={() => onNavigate(next.id)}
            style={
              complete
                ? { borderColor: accent.border, background: accent.subtle, color: accent.text }
                : undefined
            }
          >
            <span>{complete ? 'Next lesson' : 'Next'}</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <div className="lms-nav-next is-locked" aria-disabled="true">
            <span>Next lesson locked</span>
            <strong>{next.title}</strong>
          </div>
        )
      ) : complete ? (
        <Link
          className="lms-nav-next is-primary"
          to={dashboardHref}
          style={{ borderColor: accent.border, background: accent.subtle, color: accent.text }}
        >
          <span>Course map</span>
          <strong>Return to learning workspace</strong>
        </Link>
      ) : null}
    </nav>
  )
}
