import { useState } from 'react'
import { Link } from 'react-router-dom'

export type QuizQuestion = { q: string; options: string[]; correct?: number; explanation?: string }

type Accent = { primary: string; subtle: string; border: string; text: string }

export function AssessmentSurface({
  mode,
  title,
  subtitle,
  questions,
  accent,
  passed,
  onPass,
  onSubmitAssignment,
  onSubmitAnswers,
  completionNote,
}: {
  mode: 'mcq' | 'timed' | 'assignment'
  title: string
  subtitle?: string
  questions?: QuizQuestion[]
  accent: Accent
  passed?: boolean
  onPass?: () => void
  onSubmitAssignment?: (text: string) => void | Promise<void>
  onSubmitAnswers?: (answers: Record<number, number>) => Promise<boolean>
  completionNote?: string
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [text, setText] = useState('')
  const [assignmentDone, setAssignmentDone] = useState(false)
  const [serverPassed, setServerPassed] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const qs = questions ?? []
  const answeredCount = Object.keys(answers).length
  const usesServerGrading = Boolean(onSubmitAnswers)
  const correct = usesServerGrading
    ? (serverPassed ? qs.length : 0)
    : qs.filter((q, i) => q.correct !== undefined && answers[i] === q.correct).length
  const allCorrect = usesServerGrading ? serverPassed === true : correct === qs.length

  if (mode === 'assignment') {
    if (assignmentDone || passed) {
      return (
        <div className="lx-submitted">
          <h2>Submission recorded</h2>
          <p className="dash-empty-copy">
            {completionNote ?? 'There is no grading in this pilot. Record the artifact on Career OS → Projects if you want portfolio evidence.'}
          </p>
          <Link className="os-link" to="/career-os/profile" style={{ display: 'inline-block', marginTop: 14 }}>
            Open Career OS Projects
          </Link>
        </div>
      )
    }
    return (
      <div className="lms-assignment-workspace as-block">
        <h3>Your submission</h3>
        <p className="dash-empty-copy">{subtitle}</p>
        <p className="dash-empty-copy" style={{ marginTop: 8 }}>
          Document your approach, include queries or calculations, and explain assumptions.
        </p>
        <label className="sr-only" htmlFor="assignment-response">Assignment response</label>
        <textarea
          id="assignment-response"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your work here"
        />
        <button
          type="button"
          className="os-btn os-btn-primary"
          disabled={!text.trim() || submitting}
          onClick={() => {
            if (!text.trim() || submitting) return
            setSubmitting(true)
            void Promise.resolve(onSubmitAssignment?.(text))
              .then(() => setAssignmentDone(true))
              .finally(() => setSubmitting(false))
          }}
        >
          {submitting ? 'Submitting…' : 'Submit assignment'}
        </button>
      </div>
    )
  }

  if (passed) {
    return (
      <div className="lx-quiz-passed">
        <h2>Assessment passed</h2>
        <p className="dash-empty-copy">Read the explanations, then continue to the next lesson.</p>
        {qs.some((q) => q.explanation) && (
          <div className="lms-quiz-review" style={{ marginTop: 16 }}>
            {qs.map((q, qi) => (
              <div key={qi} className="lx-question">
                <p className="lx-question-kicker">Question {qi + 1}</p>
                <p className="lx-question-text">{q.q}</p>
                {q.explanation && <div className="lx-explain">{q.explanation}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  async function handleSubmitAsync() {
    setSubmitting(true)
    try {
      if (onSubmitAnswers) {
        const passedResult = await onSubmitAnswers(answers)
        setServerPassed(passedResult)
        setSubmitted(true)
        if (passedResult) onPass?.()
        return
      }
      setSubmitted(true)
      if (correct === qs.length) onPass?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lms-quiz-workspace">
      <div className="lx-quiz-head">
        <p className="dash-empty-copy" style={{ margin: 0 }}>{subtitle ?? title}</p>
        <div className="lx-quiz-count">{answeredCount} of {qs.length} answered</div>
      </div>
      <div className="os-progress-bar" style={{ maxWidth: 280, margin: '0 0 16px' }} aria-hidden="true">
        <span style={{ width: `${qs.length ? (answeredCount / qs.length) * 100 : 0}%`, background: accent.primary }} />
      </div>
      {submitted && !submitting && (
        <div className={`lx-result ${allCorrect ? 'is-pass' : 'is-fail'}`}>
          {allCorrect
            ? `All ${qs.length} correct`
            : usesServerGrading
              ? 'Not all answers were correct. Try again.'
              : `${correct} of ${qs.length} correct. Try again.`}
        </div>
      )}
      {qs.map((q, qi) => {
        const reveal = submitted && !submitting && q.correct !== undefined
        return (
          <div key={qi} className="lx-question">
            <p className="lx-question-kicker">Question {qi + 1} of {qs.length}</p>
            <p className="lx-question-text">{q.q}</p>
            <div className="lx-options" role="radiogroup" aria-label={`Answers for question ${qi + 1}`}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const isCorrect = reveal && oi === q.correct
                const isWrong = reveal && selected && oi !== q.correct
                const status = isCorrect ? 'Correct. ' : isWrong ? 'Not correct. ' : selected ? 'Selected. ' : ''
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`lx-option${selected ? ' is-selected' : ''}${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
                    onClick={() => !submitted && !submitting && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  >
                    <span className="sr-only">{status}</span>
                    {opt}
                    {isCorrect ? <span className="lx-option-flag">Correct</span> : null}
                    {isWrong ? <span className="lx-option-flag">Your answer</span> : null}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div className="lx-explain">{q.explanation}</div>
            )}
          </div>
        )
      })}
      {!submitted ? (
        <button
          type="button"
          className="os-btn os-btn-primary"
          onClick={() => { void handleSubmitAsync() }}
          disabled={answeredCount < qs.length || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit quiz'}
        </button>
      ) : !allCorrect ? (
        <button type="button" className="os-btn os-btn-ghost" onClick={() => { setSubmitted(false); setAnswers({}); setServerPassed(null) }}>Try again</button>
      ) : null}
    </div>
  )
}
