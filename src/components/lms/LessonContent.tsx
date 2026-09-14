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
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.scenario}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Objective</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.objective}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Dataset</div>
        <a href={brief.datasetHref} download style={{ color: '#93c5fd', fontSize: 14 }}>{brief.datasetName}</a>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Instructions</div>
        <ol style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
          {brief.instructions.map((item) => <li key={item} style={{ marginBottom: 8 }}>{item}</li>)}
        </ol>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Required output</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
          {brief.requiredOutput.map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Submission format</div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{brief.submissionFormat}</p>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Evaluation criteria</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Criterion', 'Weight', 'What a reviewer looks for'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', color: C.white, padding: '8px 10px', borderBottom: `1px solid ${accent.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brief.evaluationCriteria.map((row) => (
                <tr key={row.criterion}>
                  <td style={{ color: C.white, padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top' }}>{row.criterion}</td>
                  <td style={{ color: 'rgba(255,255,255,0.5)', padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.weight}</td>
                  <td style={{ color: 'rgba(255,255,255,0.62)', padding: '8px 10px', borderBottom: `1px solid ${T.lineDark}`, verticalAlign: 'top' }}>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Common mistakes</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
          {brief.commonMistakes.map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      </section>
      <section>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Extension</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief.extension}</p>
      </section>
      <section style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 16 }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Career OS evidence</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>
          <strong style={{ color: C.white }}>Learning →</strong> {brief.careerEvidence.learning}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>
          <strong style={{ color: C.white }}>Artifact →</strong> {brief.careerEvidence.artifact}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>
          <strong style={{ color: C.white }}>Skill →</strong> {brief.careerEvidence.skill}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: C.white }}>Evidence →</strong> {brief.careerEvidence.evidence} Add it yourself under Career OS Projects — this product does not create the entry automatically.
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
    const fallback = `Written teaching material has not been authored for this lesson yet.\n\nThis is not the Data Analytics flagship, and a title is not a lesson. Mark complete only to record progress — not competence.`
    const notes = material?.body ?? fallback
    return (
      <div className="lms-lesson-notes lms-activity-surface lms-activity-reading">
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)', maxWidth: 760 }}>
            <LessonDocument markdown={notes} accent={accent} />
          </div>
          <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 16 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Resources</div>
            {material?.datasets.length ? material.datasets.map((dataset) => (
              <a key={dataset.filename} href={dataset.href} download style={{ display: 'block', color: '#93c5fd', fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${T.lineDark}`, textDecoration: 'none' }}>
                {dataset.filename}
              </a>
            )) : (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>No downloadable dataset is attached to this lesson.</div>
            )}
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
    const questions = quizQuestions ?? []
    return (
      <div className="lms-lesson-quiz lms-activity-surface lms-activity-quiz" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)' }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{lessonTypeLabel(lesson.type)}</div>
        {material?.body && (
          <div style={{ marginBottom: 20, maxWidth: 720 }}>
            <LessonDocument markdown={material.body} accent={accent} />
          </div>
        )}
        {quizStatus === 'loading' ? (
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Quiz questions are loading…</div>
        ) : questions.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>No quiz is configured for this lesson. Questions are course-specific and are not copied from Data Analytics.</div>
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
      {material?.body && (
        <div style={{ marginBottom: 16, maxWidth: 720 }}>
          <LessonDocument markdown={material.body} accent={accent} />
        </div>
      )}
      {material?.assignment && <AssignmentBriefView brief={material.assignment} accent={accent} />}
      {!material?.assignment && (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>
          A structured brief has not been authored for this assignment. Paste the work you can defend. There is no faculty grading in this pilot.
        </p>
      )}
      <AssessmentSurface
        mode="assignment"
        title={lesson.title}
        subtitle={material?.assignment ? 'Paste your work below. Submission records progress; it is not a grade.' : 'Apply concepts from this module. Submission records progress; it is not a faculty grade.'}
        accent={accent}
        passed={lessonState.complete || lessonState.assignmentSubmitted}
        onSubmitAssignment={(text) => { void onAssignmentSubmit?.(text) }}
        completionNote={
          evidence
            ? `Submission recorded. There is no faculty grading in this pilot. Add “${evidence.artifact}” to Career OS → Projects yourself if you want it as portfolio evidence.`
            : 'Submission recorded. There is no faculty grading in this pilot. Add a project to Career OS yourself if you want portfolio evidence.'
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
