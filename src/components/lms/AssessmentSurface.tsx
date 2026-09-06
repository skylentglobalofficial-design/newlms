import { useEffect, useState } from 'react'
import { C, T } from '../../tokens'

export type QuizQuestion = { q: string; options: string[]; correct: number }

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
}: {
  mode: 'mcq' | 'timed' | 'assignment'
  title: string
  subtitle?: string
  questions?: QuizQuestion[]
  accent: Accent
  passed?: boolean
  onPass?: () => void
  onSubmitAssignment?: (text: string) => void
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [text, setText] = useState('')
  const [assignmentDone, setAssignmentDone] = useState(false)

  const qs = questions ?? []
  const answeredCount = Object.keys(answers).length
  const correct = qs.filter((q, i) => answers[i] === q.correct).length
  const timed = mode === 'timed'

  useEffect(() => {
    if (mode === 'assignment' || passed) return
    const id = window.setInterval(() => setElapsed(s => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [mode, passed])

  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  if (mode === 'assignment') {
    if (assignmentDone || passed) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Submission recorded</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Awaiting faculty review</div>
        </div>
      )
    }
    return (
      <div>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
        {subtitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{subtitle}</div>}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 16, marginBottom: 16 }}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Submission workspace</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7 }}>
            Document your approach, include queries or calculations, and explain assumptions.
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your response..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: 14, color: C.white, fontSize: 13, lineHeight: 1.7, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
        />
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => { setAssignmentDone(true); onSubmitAssignment?.(text) }}
          style={{
            background: !text.trim() ? 'rgba(255,255,255,0.05)' : accent.primary,
            border: 'none', color: !text.trim() ? 'rgba(255,255,255,0.25)' : C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: !text.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Submit assignment →
        </button>
      </div>
    )
  }

  if (passed) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Assessment passed</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Continue to the next lesson</div>
      </div>
    )
  }

  function handleSubmit() {
    setSubmitted(true)
    if (correct === qs.length) onPass?.()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{title}</div>
          {subtitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
        </div>
        {timed && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text, background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rPill, padding: '5px 12px' }}>
            {timerLabel}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, maxWidth: 280 }}>
          <div style={{ width: `${qs.length ? (answeredCount / qs.length) * 100 : 0}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{answeredCount}/{qs.length}</span>
      </div>
      {submitted && (
        <div style={{ background: correct === qs.length ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${correct === qs.length ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: T.rControl, padding: '12px 18px', marginBottom: 16, color: correct === qs.length ? '#22c55e' : '#ef4444', fontSize: 13 }}>
          {correct === qs.length ? `All ${correct} correct` : `${correct} of ${qs.length} correct. Try again.`}
        </div>
      )}
      {qs.filter((_, qi) => qi === currentQ).map((q) => {
        const qi = currentQ
        return (
          <div key={qi} style={{ marginBottom: 20 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>Question {qi + 1} of {qs.length}</div>
            <div style={{ color: C.white, fontSize: 16, fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const isCorrect = submitted && oi === q.correct
                const isWrong = submitted && selected && oi !== q.correct
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
                      background: isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : selected ? accent.subtle : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : selected ? accent.border : T.lineDark}`,
                      borderRadius: T.rControl, color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : selected ? accent.text : 'rgba(255,255,255,0.6)',
                      fontSize: 13, cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={answeredCount < qs.length}
          style={{
            background: answeredCount < qs.length ? 'rgba(255,255,255,0.05)' : accent.primary,
            border: 'none', color: answeredCount < qs.length ? 'rgba(255,255,255,0.25)' : C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: answeredCount < qs.length ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Submit
        </button>
      ) : correct < qs.length ? (
        <button type="button" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0) }} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, color: C.white, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try again</button>
      ) : null}
    </div>
  )
}
