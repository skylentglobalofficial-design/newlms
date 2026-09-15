import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'
import type { CourseLesson } from '../../data'
import type { LessonState } from '../../demo/types'
import { getCareerEvidence, getCourseLessonContent } from '../../content/course-material'
import type { AssignmentBrief } from '../../content/data-analytics/assignments'
import LessonVideoPlayer from './LessonVideoPlayer'
import LessonDocument from './LessonDocument'
import type { VideoPlaybackSource } from '../../lib/media/types'
import { AssessmentSurface, type QuizQuestion } from './AssessmentSurface'
import { lessonTypeLabel } from './lms-utils'

type Accent = { primary: string; subtle: string; border: string; text: string }

function AssignmentBriefView({ brief, accent }: { brief: AssignmentBrief; accent: Accent }) {
  return (
    <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Scenario</div>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.scenario}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Objective</div>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.objective}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Dataset</div>
        <a href={brief.datasetHref} download style={{ color: C.blue, fontSize: 14 }}>{brief.datasetName}</a>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Instructions</div>
        <ol style={{ margin: 0, paddingLeft: 20, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
          {brief.instructions.map((item) => <li key={item} style={{ marginBottom: 8 }}>{item}</li>)}
        </ol>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Required output</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
          {brief.requiredOutput.map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Submission format</div>
        <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{brief.submissionFormat}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>What a complete submission includes</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Criterion', 'Weight', 'What complete work shows'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', color: C.ink, padding: '8px 10px', borderBottom: `1px solid ${accent.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brief.evaluationCriteria.map((row) => (
                <tr key={row.criterion}>
                  <td style={{ color: C.ink, padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top' }}>{row.criterion}</td>
                  <td style={{ color: C.slate, padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.weight}</td>
                  <td style={{ color: C.slate, padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top' }}>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Common mistakes</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
          {brief.commonMistakes.map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Extension</div>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.extension}</p>
      </section>
      <section className="os-note">
        <p className="os-rail-kicker">Keep this work</p>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '8px 0 8px' }}>
          <strong style={{ color: C.ink }}>Learning →</strong> {brief.careerEvidence.learning}
        </p>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>
          <strong style={{ color: C.ink }}>Artifact →</strong> {brief.careerEvidence.artifact}
        </p>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>
          <strong style={{ color: C.ink }}>Skill →</strong> {brief.careerEvidence.skill}
        </p>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: C.ink }}>Evidence →</strong> {brief.careerEvidence.evidence} Add it yourself under Career OS Projects — this product does not create the entry automatically.
        </p>
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
  const evidence = getCareerEvidence(lesson.id)

  if (lesson.type === 'video') {
    return (
      <div className="lms-lesson-video lms-activity-surface lms-activity-video">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type, lesson.title)}</div>
            <h2 style={{ color: C.ink, fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{lesson.title}</h2>
          </div>
          {lesson.duration && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate }}>{lesson.duration}</span>}
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
          <p className="os-status is-done">Lesson complete</p>
        )}
      </div>
    )
  }

  if (lesson.type === 'notes') {
    const fallback = `Written teaching material has not been authored for this lesson yet.\n\nThis is not the Data Analytics flagship, and a title is not a lesson. Mark complete only to record progress — not competence.`
    const notes = material?.body ?? fallback
    return (
      <div className="lms-lesson-notes">
        <LessonDocument markdown={notes} accent={accent} skipHeading={lesson.title} />
        {material?.datasets.length ? (
          <div className="os-resources">
            <p className="os-rail-kicker">Practice files</p>
            {material.datasets.map((dataset) => (
              <a key={dataset.filename} href={dataset.href} download>{dataset.filename}</a>
            ))}
          </div>
        ) : null}
        {!lessonState.complete && (
          <button type="button" className="os-btn os-btn-primary" onClick={onComplete} style={{ marginTop: 24 }}>
            Mark reading complete
          </button>
        )}
      </div>
    )
  }

  if (lesson.type === 'quiz') {
    const questions = quizQuestions ?? []
    return (
      <div className="lms-lesson-quiz">
        {material?.body && (
          <div style={{ marginBottom: 20, maxWidth: 720 }}>
            <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
          </div>
        )}
        {quizStatus === 'loading' ? (
          <div style={{ color: C.slate, fontSize: 14 }}>Quiz questions are loading…</div>
        ) : questions.length === 0 ? (
          <div style={{ color: C.slate, fontSize: 14, lineHeight: 1.6 }}>No quiz is configured for this lesson.</div>
        ) : (
          <AssessmentSurface
            mode="mcq"
            title={lesson.title}
            subtitle={`${questions.length} questions. Results appear after you submit.`}
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
        <div style={{ marginBottom: 16, maxWidth: 720 }}>
          <LessonDocument markdown={material.body} accent={accent} skipHeading={lesson.title} />
        </div>
      )}
      {material?.assignment && <AssignmentBriefView brief={material.assignment} accent={accent} />}
      {!material?.assignment && (
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
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
    <div className="os-actions">
      {prev ? (
        <button type="button" className="os-btn os-btn-ghost" onClick={() => onNavigate(prev.id)}>
          Previous: {prev.title}
        </button>
      ) : <div />}
      {next ? (
        <Link className="os-btn os-btn-primary" to={`/learn/${courseSlug}/${next.id}`} onClick={() => onNavigate(next.id)}>
          Next: {next.title}
        </Link>
      ) : null}
    </div>
  )
}
