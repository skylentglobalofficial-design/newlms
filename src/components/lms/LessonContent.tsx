import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import { getCareerEvidence } from '../../content/course-lookups'
import { getCourseLessonContent } from '../../content/course-material'
import type { AssignmentBrief } from '../../content/data-analytics/assignments'
import LessonVideoPlayer from './LessonVideoPlayer'
import LessonDocument from './LessonDocument'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { lessonTypeLabel } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

function AssignmentBriefView({ brief }: { brief: AssignmentBrief; accent: Accent }) {
  return (
    <div className="as-brief">
      <section className="as-block">
        <h3>Context</h3>
        <p>{brief.scenario}</p>
      </section>
      <section className="as-block">
        <h3>Objective</h3>
        <p>{brief.objective}</p>
      </section>
      {brief.datasetHref && brief.datasetName ? (
      <section className="as-block">
        <h3>Dataset</h3>
        <p>
          <a href={brief.datasetHref} download className="lx-file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {brief.datasetName}
          </a>
        </p>
      </section>
      ) : null}
      {brief.caseHref && brief.caseName ? (
      <section className="as-block">
        <h3>Case notes</h3>
        <p>
          <a href={brief.caseHref} download className="lx-file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {brief.caseName}
          </a>
        </p>
      </section>
      ) : null}
      <section className="as-block">
        <h3>Deliverables</h3>
        <ul>
          {brief.requiredOutput.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="as-block">
        <h3>Instructions</h3>
        <ol>
          {brief.instructions.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
      <section className="as-block">
        <h3>Rubric</h3>
        <p className="as-fine" style={{ marginBottom: 10 }}>What complete work shows. This is not a grade.</p>
        <div className="lx-table-wrap" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                {['Criterion', 'Weight', 'What complete work shows'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brief.evaluationCriteria.map((row) => (
                <tr key={row.criterion}>
                  <td>{row.criterion}</td>
                  <td>{row.weight}</td>
                  <td>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="as-block">
        <h3>Submission</h3>
        <p>{brief.submissionFormat}</p>
      </section>
      <section className="as-block">
        <h3>Common mistakes</h3>
        <ul>
          {brief.commonMistakes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      {brief.extension ? (
        <section className="as-block">
          <h3>Extension</h3>
          <p>{brief.extension}</p>
        </section>
      ) : null}
      <section className="as-block as-evidence">
        <h3>Career OS evidence</h3>
        <p style={{ marginBottom: 8 }}><strong>Learning.</strong> {brief.careerEvidence.learning}</p>
        <p style={{ marginBottom: 8 }}><strong>Artifact.</strong> {brief.careerEvidence.artifact}</p>
        <p style={{ marginBottom: 8 }}><strong>Skill.</strong> {brief.careerEvidence.skill}</p>
        <p>{brief.careerEvidence.evidence} Add it yourself under Career OS Projects — this product does not create the entry automatically.</p>
      </section>
    </div>
  )
}

export function LessonContentView({
  lesson,
  lessonState,
  accent,
  onComplete,
  quizQuestions,
  quizStatus = 'ready',
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
  quizStatus?: 'loading' | 'ready'
  onQuizSubmit?: (answers: Record<number, number>) => Promise<boolean>
  onAssignmentSubmit?: (text: string) => Promise<void>
  lessonMedia?: VideoPlaybackSource
  courseSlug?: string
}) {
  const material = getCourseLessonContent(courseSlug, lesson.id)
  const evidence = getCareerEvidence(courseSlug, lesson.id)

  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-video lms-activity-surface lms-activity-video">
        <LessonVideoPlayer
          media={lessonMedia}
          title={lesson.title}
          duration={lesson.duration}
          watched={lessonState.complete || lessonState.videoWatched}
          accent={accent}
          onMarkWatched={lessonState.complete ? undefined : () => onComplete()}
        />
        {(lessonState.complete || lessonState.videoWatched) && (
          <p className="os-status is-done">Lesson complete</p>
        )}
      </div>
    )
  }

  if (lesson.type === 'notes') {
    const fallback = `Written teaching material has not been authored for this lesson yet.\n\nA title is not a lesson. Mark complete only to record progress — not competence.`
    const notes = material?.body ?? fallback
    return (
      <div className="lms-lesson-notes">
        <LessonDocument markdown={notes} accent={accent} skipHeading={lesson.title} />
        {material?.datasets.length ? (
          <div className="os-resources">
            <p className="os-eyebrow">Practice files</p>
            {material.datasets.map((dataset) => (
              <a key={dataset.filename} href={dataset.href} download className="lx-file">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {dataset.filename}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (lesson.type === 'quiz') {
    const questions = quizQuestions ?? []
    return (
      <div className="lms-lesson-quiz">
        {material?.body && (
          <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
        )}
        {quizStatus === 'loading' ? (
          <div className="os-state-skeleton" role="status" aria-label="Loading the questions">
            <span className="os-skeleton" style={{ width: '40%' }} />
            <span className="os-skeleton" style={{ height: 96 }} />
            <span className="os-skeleton" style={{ height: 96 }} />
          </div>
        ) : questions.length === 0 ? (
          <p className="dash-empty-copy">No questions are available for this check right now.</p>
        ) : (
          <AssessmentSurface
            mode="mcq"
            title={lesson.title}
            subtitle={`${questions.length} questions. Your answers are checked when you submit.`}
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
      {material?.body && (
        <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
      )}
      {material?.assignment && <AssignmentBriefView brief={material.assignment} accent={accent} />}
      {!material?.assignment && (
        <p className="dash-empty-copy" style={{ marginBottom: 16 }}>
          A structured brief has not been authored for this assignment. Paste the work you can defend. There is no grading in this pilot.
        </p>
      )}
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle={material?.assignment ? 'Paste your work below. Submission records progress; it is not a grade.' : 'Apply concepts from this module. Submission records progress; it is not a grade.'}
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={(text) => { void onAssignmentSubmit?.(text) }}
        completionNote={
          evidence
            ? `Submission recorded. There is no grading in this pilot. Add “${evidence.artifact}” to Career OS → Projects yourself if you want it as portfolio evidence.`
            : 'Submission recorded. There is no grading in this pilot. Add a project to Career OS yourself if you want portfolio evidence.'
        }
      />
    </div>
  )
}

export function LessonNavigation({
  prev,
  next,
  nextPreview,
  onNavigate,
  primaryAction,
  hint,
}: {
  prev: CourseLesson | null
  /** The next lesson when it is already unlocked. */
  next: CourseLesson | null
  /** The next lesson in the course, unlocked or not (for the "Next:" label). */
  nextPreview?: CourseLesson | null
  onNavigate: (id: string) => void
  /** The one primary action for this lesson (complete and continue, or continue). */
  primaryAction?: { label: string; onClick: () => void; busy?: boolean }
  /** Plain sentence shown when there is no primary action (e.g. a check that must be passed first). */
  hint?: string
}) {
  const upcoming = next ?? nextPreview ?? null
  return (
    <div className="lx-footer">
      {prev ? (
        <button type="button" className="lx-prev" onClick={() => onNavigate(prev.id)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
      ) : null}
      <div className="lx-footer-next">
        <p className="lx-next-label">
          {upcoming ? `Next: ${upcoming.title}` : 'This is the last activity in the course.'}
          {hint ? ` · ${hint}` : ''}
        </p>
        {primaryAction ? (
          <button
            type="button"
            className="os-btn os-btn-primary os-btn-lg"
            onClick={primaryAction.onClick}
            disabled={primaryAction.busy}
          >
            {primaryAction.busy ? 'Saving…' : primaryAction.label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  )
}
