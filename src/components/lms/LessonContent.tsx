import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import { getCareerEvidence } from '../../content/course-lookups'
import { getCourseLessonContent } from '../../content/course-material'
import type { AssignmentBrief } from '../../content/data-analytics/assignments'
import LessonVideoPlayer from './LessonVideoPlayer'
import LessonDocument from './LessonDocument'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { AssignmentResponse, type AssignmentRecord } from './AssignmentResponse'
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
        <p className="as-fine" style={{ marginBottom: 10 }}>Evaluation Rubric — How your work is scored across each criterion.</p>
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
        <p>{brief.careerEvidence.evidence} Once submitted, you can showcase this verified artifact directly in your Career OS → Projects portfolio.</p>
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
  onQuizRetry,
  onQuizSubmit,
  onAssignmentSubmit,
  assignment,
  onAssignmentDraft,
  lessonMedia,
  courseSlug,
}: {
  lesson: CourseLesson
  lessonState: LessonState
  accent: Accent
  onComplete: () => void
  quizQuestions?: QuizQuestion[]
  quizStatus?: 'loading' | 'ready' | 'error'
  onQuizRetry?: () => void
  onQuizSubmit?: (answers: Record<number, number>) => Promise<boolean>
  /** Resolves true only once the server has recorded the submission. */
  onAssignmentSubmit?: (text: string) => Promise<boolean>
  /** Null while the assignment request is still loading. */
  assignment?: AssignmentRecord | null
  onAssignmentDraft?: (text: string) => void
  lessonMedia?: VideoPlaybackSource
  courseSlug?: string
}) {
  const material = getCourseLessonContent(courseSlug, lesson.id)
  const evidence = getCareerEvidence(courseSlug, lesson.id)

  if (lesson.type === 'video' && lessonMedia && (lessonMedia.status === 'ready' || lessonMedia.playbackUrl || lessonMedia.embedUrl)) {
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
        {material?.body ? (
          <div style={{ marginTop: 20 }}>
            <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
          </div>
        ) : null}
        {(lessonState.complete || lessonState.videoWatched) && (
          <p className="os-status is-done">Lesson complete</p>
        )}
      </div>
    )
  }

  if (lesson.type === 'notes' || lesson.type === 'video') {
    const customSummary = (lesson as { summary?: string | null }).summary
    const customRefUrl = (lesson as { referenceUrl?: string | null }).referenceUrl
    const fallback = `## ${lesson.title}\n\n${customSummary || `Complete the reading and applied exercises for ${lesson.title} to unlock the next milestone.`}`
    const notes = material?.body
      ? customSummary && !material.body.includes(customSummary)
        ? `${customSummary}\n\n---\n\n${material.body}`
        : material.body
      : fallback
    const hasAttachedVideo = Boolean(
      lessonMedia && (lessonMedia.status === 'ready' || lessonMedia.playbackUrl || lessonMedia.embedUrl)
    )
    const youtubeMatch = customRefUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
    const uploadedMaterials = (lesson as { materials?: Array<{ id: string; fileName: string; mimeType: string; byteSize: number }> }).materials ?? []
    const isDirectMp4 = Boolean(customRefUrl && (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(customRefUrl) || customRefUrl.startsWith("/api/v1/lms/materials/")))
    return (
      <div className="lms-lesson-notes">
        {hasAttachedVideo ? (
          <div style={{ marginBottom: 20 }}>
            <LessonVideoPlayer
              media={lessonMedia}
              title={lesson.title}
              duration={lesson.duration}
              watched={lessonState.complete || lessonState.videoWatched}
              accent={accent}
            />
          </div>
        ) : null}
        {youtubeMatch ? (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '16/9', background: '#0f172a' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`}
              title={lesson.title}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isDirectMp4 && customRefUrl ? (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a' }}>
            <video src={customRefUrl} controls style={{ width: '100%', display: 'block', maxHeight: 460 }} />
          </div>
        ) : null}
        <LessonDocument markdown={notes} accent={accent} skipHeading={lesson.title} />
        {uploadedMaterials.length > 0 ? (
          <div className="os-resources" style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <p className="os-eyebrow" style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
              Uploaded Lecture Materials, Slides &amp; Files
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {uploadedMaterials.map((mat) => (
                <a
                  key={mat.id}
                  href={`/api/v1/lms/materials/${mat.id}?download=1`}
                  download={mat.fileName}
                  className="lx-file"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}
                >
                  <span>📥 {mat.fileName}</span>
                  <span style={{ color: "#64748b", fontSize: 11 }}>({Math.max(1, Math.round(mat.byteSize / 1024))} KB)</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
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
    const passed = lessonState.complete || lessonState.quizPassed
    return (
      <div className="lms-lesson-quiz">
        {material?.body && (
          <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
        )}
        {passed ? (
          // Recorded by the server; the questions are not needed to show that.
          <AssessmentSurface mode="mcq" title={lesson.title} accent={accent} passed onSubmitAnswers={onQuizSubmit} />
        ) : quizStatus === 'error' ? (
          <div className="os-inline-state" role="status">
            <p className="dash-empty-copy">The questions for this check could not be loaded. Nothing has been recorded.</p>
            {onQuizRetry ? (
              <button type="button" className="os-btn os-btn-ghost" onClick={onQuizRetry}>Try again</button>
            ) : null}
          </div>
        ) : quizStatus === 'loading' ? (
          <div className="os-state-skeleton" role="status" aria-label="Loading the questions">
            <span className="os-skeleton" style={{ width: '40%' }} />
            <span className="os-skeleton" style={{ height: 96 }} />
            <span className="os-skeleton" style={{ height: 96 }} />
          </div>
        ) : questions.length === 0 ? (
          <p className="dash-empty-copy">This check has no questions published yet.</p>
        ) : (
          <AssessmentSurface
            mode="mcq"
            title={lesson.title}
            subtitle={`${questions.length} questions. Your answers are checked when you submit.`}
            questions={questions}
            accent={accent}
            passed={false}
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
          A structured brief has not been authored for this assignment. Paste the work you can defend. Evaluated against the structured course rubric.
        </p>
      )}
      <AssignmentResponse
        record={assignment === undefined ? null : assignment}
        subtitle={material?.assignment ? 'Paste your solution below to evaluate against the module rubric and record your progress.' : 'Apply concepts from this module and submit your work below.'}
        onDraft={onAssignmentDraft}
        onSubmit={onAssignmentSubmit ?? (async () => false)}
        completionNote={
          evidence
            ? `Submission recorded. Evaluated against the structured course rubric. Add “${evidence.artifact}” to Career OS → Projects yourself if you want it as portfolio evidence.`
            : 'Submission recorded. Evaluated against the structured course rubric. Add a project to Career OS yourself if you want portfolio evidence.'
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
