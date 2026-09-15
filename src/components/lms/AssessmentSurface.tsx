import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, T } from '../../tokens'

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
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Submission recorded</div>
          <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            {completionNote ?? 'There is no grading in this pilot. Record the artifact on Career OS → Projects if you want portfolio evidence.'}
          </div>
          <Link className="os-link" to="/career-os/profile" style={{ display: 'inline-block', marginTop: 14 }}>
            Open Career OS Projects
          </Link>
        </div>
      )
    }
    return (
      <div className="lms-assignment-workspace">
        <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
        {subtitle && <div style={{ color: C.slate, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{subtitle}</div>}
        <div className="os-note">
          <p className="os-rail-kicker">Submission workspace</p>
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '8px 0 0' }}>
            Document your approach, include queries or calculations, and explain assumptions.
          </p>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your response..."
          style={{ width: '100%', background: C.white, border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: 14, color: C.ink, fontSize: 13, lineHeight: 1.7, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
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
      <div style={{ padding: '12px 0 8px' }}>
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{ color: C.success, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Assessment passed</div>
          <div style={{ color: C.slate, fontSize: 13 }}>Read the explanations, then continue to the next lesson</div>
        </div>
        {qs.some((q) => q.explanation) && (
          <div className="lms-quiz-review">
            {qs.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 16 }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Question {qi + 1}</div>
                <div style={{ color: C.ink, fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>{q.q}</div>
                {q.explanation && (
                  <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, background: C.cream, border: `1px solid ${T.lineLight}`, borderRadius: T.rControl, padding: '10px 12px' }}>
                    {q.explanation}
                  </div>
                )}
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
      {subtitle ? (
        <p style={{ color: C.slate, fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>{subtitle}</p>
      ) : title ? (
        <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="os-progress-bar" style={{ flex: 1, maxWidth: 280, marginTop: 0 }} aria-hidden="true">
          <span style={{ width: `${qs.length ? (answeredCount / qs.length) * 100 : 0}%`, background: accent.primary }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate }}>{answeredCount} of {qs.length} answered</span>
      </div>
      {submitted && !submitting && (
        <div style={{ background: allCorrect ? 'rgba(21,128,61,0.08)' : 'rgba(185,28,28,0.08)', border: `1px solid ${allCorrect ? 'rgba(21,128,61,0.28)' : 'rgba(185,28,28,0.28)'}`, borderRadius: T.rControl, padding: '12px 18px', marginBottom: 16, color: allCorrect ? C.success : C.danger, fontSize: 13 }}>
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
          <div key={qi} style={{ marginBottom: 24 }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Question {qi + 1} of {qs.length}</div>
            <div style={{ color: C.ink, fontSize: 16, fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
            <div role="radiogroup" aria-label={`Answers for question ${qi + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    onClick={() => !submitted && !submitting && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    style={{
                      textAlign: 'left', padding: '12px 16px', minHeight: 44,
                      background: isCorrect ? 'rgba(21,128,61,0.08)' : isWrong ? 'rgba(185,28,28,0.08)' : selected ? accent.subtle : C.cream,
                      border: `1.5px solid ${isCorrect ? 'rgba(21,128,61,0.45)' : isWrong ? 'rgba(185,28,28,0.45)' : selected ? accent.primary : T.lineDark}`,
                      borderRadius: T.rControl, color: isCorrect ? C.success : isWrong ? C.danger : C.ink,
                      fontSize: 14, cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <span className="sr-only">{status}</span>
                    {opt}
                    {isCorrect ? <span style={{ display: 'block', marginTop: 4, fontSize: 12, fontWeight: 600 }}>Correct</span> : null}
                    {isWrong ? <span style={{ display: 'block', marginTop: 4, fontSize: 12, fontWeight: 600 }}>Your answer</span> : null}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div style={{ marginTop: 10, color: C.slate, fontSize: 13, lineHeight: 1.65, background: C.cream, border: `1px solid ${T.lineLight}`, borderRadius: T.rControl, padding: '10px 12px' }}>
                {q.explanation}
              </div>
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
