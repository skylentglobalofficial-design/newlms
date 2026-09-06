import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { courses } from '../data'
import type { CourseLesson, CourseModule } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState, EMPTY_LESSON_STATE } from '../demo/DemoStateContext'
import { getLmsRoleAccent, getLmsTabAccent, type LmsTabId } from '../role-themes'

// ─── LESSON STATE ──────────────────────────────────────────────────────────────

type LessonState = {
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  complete: boolean
}

type AllLessonState = Record<string, LessonState>

function defaultState(): LessonState {
  return { ...EMPTY_LESSON_STATE }
}

const quizQuestions = [
  { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'Structured Queue List', 'Standard Query Link'], correct: 0 },
  { q: 'Which SQL clause filters rows after grouping?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correct: 1 },
  { q: 'What type of JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correct: 3 },
]

function LessonIcon({ type, size = 14, color = 'rgba(255,255,255,0.35)' }: { type: CourseLesson['type']; size?: number; color?: string }) {
  const s = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8 }
  if (type === 'video') return <svg {...s}><polygon points="5 3 19 12 5 21 5 3"/></svg>
  if (type === 'notes') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  if (type === 'quiz') return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}

function VideoTab({ lesson, lessonState, onWatched, tabAccent, roleAccent }: {
  lesson: CourseLesson
  lessonState: LessonState
  onWatched: () => void
  tabAccent: ReturnType<typeof getLmsTabAccent>
  roleAccent: ReturnType<typeof getLmsRoleAccent>
}) {
  const statusLabel = lessonState.videoWatched ? 'Watched' : 'Not started'
  const statusColor = lessonState.videoWatched ? '#22c55e' : tabAccent.primary

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ color: C.white, fontSize: 18, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.3 }}>{lesson.title}</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {lesson.duration && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{lesson.duration}</span>
            )}
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: T.rPill,
              background: lessonState.videoWatched ? 'rgba(34,197,94,0.1)' : tabAccent.subtle,
              border: `1px solid ${lessonState.videoWatched ? 'rgba(34,197,94,0.3)' : tabAccent.border}`,
              color: statusColor,
            }}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 4 }}>Next step</div>
          <div style={{ color: lessonState.videoWatched ? '#22c55e' : 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            {lessonState.videoWatched ? 'Quiz unlocked' : 'Watch to unlock quiz'}
          </div>
        </div>
      </div>

      <div className="lms-media-frame" style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: T.rCard,
        aspectRatio: '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${T.lineDark}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 30% 20%, ${tabAccent.subtle} 0%, transparent 70%)` }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: tabAccent.subtle, border: `2px solid ${tabAccent.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={tabAccent.primary}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          {lesson.duration && (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 14, fontFamily: 'var(--font-mono)' }}>{lesson.duration}</div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div className="skylent-label" style={{ color: tabAccent.primary, marginBottom: 10 }}>Lesson overview</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 640, marginBottom: 16 }}>
          In this lesson, you will learn the core concepts behind {lesson.title.replace(/\?$/, '').toLowerCase()}. Follow along with the examples and practice with the provided exercises before moving on to the quiz.
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, maxWidth: 320 }}>
          <div style={{ width: lessonState.videoWatched ? '100%' : '0%', height: '100%', background: tabAccent.primary, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
      </div>
      {!lessonState.videoWatched ? (
        <button
          type="button"
          onClick={onWatched}
          style={{
            background: roleAccent.primary, border: 'none', color: C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Mark as watched →
        </button>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: T.rControl, padding: '10px 18px', color: '#22c55e', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Video watched — Quiz is now unlocked
        </div>
      )}
    </div>
  )
}

function NotesTab({ lesson, tabAccent }: { lesson: CourseLesson; tabAccent: ReturnType<typeof getLmsTabAccent> }) {
  const [copied, setCopied] = useState(false)
  const notes = `# ${lesson.title}\n\n## Key Concepts\n\nThis lesson covers foundational material for ${lesson.title}. Pay attention to the following:\n\n- **Core concept 1**: Understanding the fundamentals and how they apply in real-world scenarios\n- **Core concept 2**: Practical application using industry-standard tools\n- **Core concept 3**: Common patterns and best practices used by professionals\n\n## Summary\n\nBy the end of this lesson, you should be comfortable explaining the concepts above and applying them to sample problems.\n\n## References\n\n- Course slides\n- Skylent resource library\n- Practice exercises`

  function handleCopy() {
    navigator.clipboard.writeText(notes).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{lesson.title} — Notes</div>
        <button type="button" onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: '7px 14px', color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          {copied ? 'Copied!' : 'Copy notes'}
        </button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rCard, padding: 'clamp(20px, 3vw, 28px)', maxWidth: 720 }}>
        {notes.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <div key={i} style={{ color: C.white, fontSize: 20, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>{line.slice(2)}</div>
          if (line.startsWith('## ')) return <div key={i} style={{ color: C.white, fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 10 }}>{line.slice(3)}</div>
          if (line.startsWith('- ')) {
            const parts = line.slice(2).split('**')
            return (
              <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 8, paddingLeft: 16, borderLeft: `2px solid ${tabAccent.border}` }}>
                {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: C.white }}>{p}</strong> : p)}
              </div>
            )
          }
          if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
          return <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{line}</div>
        })}
      </div>
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 10 }}>References</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Course slides (PDF)', 'Skylent resource library', 'Practice exercise set'].map(ref => (
            <span key={ref} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, paddingLeft: 12, borderLeft: `2px solid ${tabAccent.border}` }}>{ref}</span>
          ))}
        </div>
        <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          Read through the notes before attempting the quiz.
        </div>
      </div>
    </div>
  )
}

function QuizTab({ lesson, lessonState, onPass, tabAccent, roleAccent }: {
  lesson: CourseLesson
  lessonState: LessonState
  onPass: () => void
  tabAccent: ReturnType<typeof getLmsTabAccent>
  roleAccent: ReturnType<typeof getLmsRoleAccent>
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)
  const answeredCount = Object.keys(answers).length
  const correct = quizQuestions.filter((q, i) => answers[i] === q.correct).length

  useEffect(() => {
    if (lessonState.quizPassed) return
    const id = window.setInterval(() => setElapsed(s => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [lessonState.quizPassed])

  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  function handleSubmit() {
    setSubmitted(true)
    if (correct === quizQuestions.length) onPass()
  }

  if (lessonState.quizPassed) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Quiz passed</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Assignment tab is now unlocked</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{lesson.title} — Quiz</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: tabAccent.primary,
          background: tabAccent.subtle, border: `1px solid ${tabAccent.border}`,
          borderRadius: T.rPill, padding: '5px 12px', letterSpacing: '0.04em',
        }}>
          {timerLabel}
        </div>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 12 }}>Answer all {quizQuestions.length} questions correctly to unlock the assignment.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, maxWidth: 280 }}>
          <div style={{ width: `${(answeredCount / quizQuestions.length) * 100}%`, height: '100%', background: tabAccent.primary, borderRadius: 2 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{answeredCount}/{quizQuestions.length} answered</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {quizQuestions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !submitted && setCurrentQ(i)}
            style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: T.rPill,
            background: currentQ === i ? tabAccent.subtle : answers[i] !== undefined ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            color: currentQ === i ? tabAccent.primary : answers[i] !== undefined ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${currentQ === i ? tabAccent.border : answers[i] !== undefined ? T.lineDark : T.lineDark}`,
            cursor: submitted ? 'default' : 'pointer',
          }}>
            Q{i + 1}
          </button>
        ))}
      </div>
      {submitted && (
        <div style={{ background: correct === quizQuestions.length ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${correct === quizQuestions.length ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: T.rControl, padding: '12px 18px', marginBottom: 20, color: correct === quizQuestions.length ? '#22c55e' : '#ef4444', fontSize: 13 }}>
          {correct === quizQuestions.length ? `All ${correct} correct — quiz passed!` : `${correct} of ${quizQuestions.length} correct. Try again.`}
        </div>
      )}
      {quizQuestions.filter((_, qi) => qi === currentQ).map((q, _) => {
        const qi = currentQ
        return (
        <div key={qi} style={{ marginBottom: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>Question {qi + 1} of {quizQuestions.length}</div>
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
                    background: isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : selected ? tabAccent.subtle : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : selected ? tabAccent.border : T.lineDark}`,
                    borderRadius: T.rControl, color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : selected ? tabAccent.primary : 'rgba(255,255,255,0.6)',
                    fontSize: 13, cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {qi > 0 && !submitted && (
              <button type="button" onClick={() => setCurrentQ(qi - 1)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, color: C.white, padding: '10px 18px', borderRadius: T.rControl, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Previous</button>
            )}
            {qi < quizQuestions.length - 1 && !submitted && (
              <button type="button" onClick={() => setCurrentQ(qi + 1)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, color: C.white, padding: '10px 18px', borderRadius: T.rControl, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Next question</button>
            )}
          </div>
        </div>
        )
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < quizQuestions.length}
          style={{
            background: Object.keys(answers).length < quizQuestions.length ? 'rgba(255,255,255,0.05)' : tabAccent.primary,
            border: 'none', color: Object.keys(answers).length < quizQuestions.length ? 'rgba(255,255,255,0.25)' : C.black,
            padding: '12px 28px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: Object.keys(answers).length < quizQuestions.length ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Submit quiz
        </button>
      ) : correct < quizQuestions.length ? (
        <button type="button" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0) }} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.lineDark}`, color: C.white, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try again</button>
      ) : null}
    </div>
  )
}

function AssignmentTab({ lesson, lessonState, onSubmit, tabAccent }: {
  lesson: CourseLesson
  lessonState: LessonState
  onSubmit: () => void
  tabAccent: ReturnType<typeof getLmsTabAccent>
}) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(lessonState.assignmentSubmitted)

  function handleSubmit() {
    if (!text.trim()) return
    setSubmitted(true)
    onSubmit()
  }

  if (submitted || lessonState.assignmentSubmitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: tabAccent.subtle, border: `2px solid ${tabAccent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tabAccent.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ color: C.white, fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Assignment submitted</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 320, margin: '0 auto 24px' }}>Your submission has been recorded. The next lesson is now unlocked.</div>
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: '12px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Submitted · Awaiting review
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{lesson.title} — Assignment</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Complete the task below and submit. Your faculty will review and provide feedback.</div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>Objective</div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 640 }}>
          Apply the concepts from this lesson to a practical exercise and document your approach clearly.
        </p>
      </div>

      <div style={{ padding: '16px 0', marginBottom: 20, borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}` }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 10 }}>Requirements</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.8 }}>
          <li>Explain your approach step by step</li>
          <li>Include any code, queries, or calculations used</li>
          <li>State assumptions where the brief is ambiguous</li>
        </ul>
      </div>

      <div style={{ padding: '0 0 18px', marginBottom: 20 }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 10 }}>Brief</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, maxWidth: 640 }}>
          Apply the concepts from this lesson to complete the following exercise. Document your approach, show your work, and explain your reasoning in the text box below.
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>Your response</div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your assignment response here..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: '14px', color: C.white, fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.7, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim()}
        style={{
          background: !text.trim() ? 'rgba(255,255,255,0.05)' : tabAccent.primary,
          border: 'none', color: !text.trim() ? 'rgba(255,255,255,0.2)' : C.black,
          padding: '12px 28px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
          cursor: !text.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
        }}
      >
        Submit assignment →
      </button>
    </div>
  )
}

function LabTab({ slug, labLaunched, labComplete, onLaunch, onMarkComplete, tabAccent }: {
  slug: string
  labLaunched: boolean
  labComplete: boolean
  onLaunch: () => void
  onMarkComplete: () => void
  tabAccent: ReturnType<typeof getLmsTabAccent>
}) {
  const labMap: Record<string, { labId: string; labTitle: string; labDesc: string; expCount: number }> = {
    'data-analytics': { labId: 'data-centric-ai-preprocessing', labTitle: 'Data Preprocessing Lab', labDesc: 'Hands-on experiments in data cleaning, encoding, scaling, and feature engineering.', expCount: 5 },
    'python-programming': { labId: 'data-centric-ai-python', labTitle: 'Python for Data Science Lab', labDesc: 'Practical Python exercises with NumPy, pandas, matplotlib, and EDA workflows.', expCount: 5 },
    'generative-ai': { labId: 'mcom-fintech-blockchain', labTitle: 'Applied AI & Blockchain Lab', labDesc: 'Experiments exploring AI logic and decentralised system simulations.', expCount: 2 },
    'full-stack-web': { labId: 'bca-fullstack-react', labTitle: 'React & Frontend Lab', labDesc: 'Build real components, manage state with hooks, and implement JWT auth in React.', expCount: 5 },
    'power-bi': { labId: 'mba-business-analytics', labTitle: 'Business Analytics Lab', labDesc: 'Case-driven analytics experiments covering regression, segmentation, and dashboards.', expCount: 5 },
    'product-management': { labId: 'mba-operations-research', labTitle: 'Operations Research Lab', labDesc: 'Monte Carlo simulations, LP optimisation, and supply chain network design.', expCount: 4 },
  }
  const lab = labMap[slug] ?? { labId: 'data-centric-ai-python', labTitle: 'Python for Data Science Lab', labDesc: 'Hands-on Python exercises with NumPy, pandas, and EDA workflows.', expCount: 5 }

  if (labComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Lab complete</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Your next step is now unlocked.</div>
      </div>
    )
  }

  const experiments = Array.from({ length: lab.expCount }, (_, i) => ({
    num: i + 1,
    title: i === 0 ? 'Setup & environment' : i === lab.expCount - 1 ? 'Capstone exercise' : `Exercise ${i + 1}`,
    status: labLaunched && i === 0 ? 'in_progress' : 'not_started',
  }))
  const workspaceStatus = labComplete ? 'Complete' : labLaunched ? 'In progress' : 'Not started'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{lab.labTitle}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, maxWidth: 520 }}>{lab.labDesc}</div>
        </div>
        <span style={{ background: tabAccent.subtle, border: `1px solid ${tabAccent.border}`, color: tabAccent.primary, fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 100, flexShrink: 0 }}>
          {workspaceStatus}
        </span>
      </div>

      <div className="lms-lab-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 200px) 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, padding: '12px 0', overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>EXPERIMENTS</div>
          {experiments.map(exp => (
            <div key={exp.num} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: `2px solid ${exp.status === 'in_progress' ? tabAccent.primary : 'transparent'}` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: exp.status === 'in_progress' ? tabAccent.primary : 'transparent', border: `1px solid ${exp.status === 'in_progress' ? tabAccent.primary : 'rgba(255,255,255,0.2)'}`, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>Exp {String(exp.num).padStart(2, '0')}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tabAccent.border}`, borderRadius: T.rCard, padding: '20px', minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 12 }}>WORKSPACE</div>
          <div style={{ background: C.ink, border: `1px solid ${T.lineDark}`, borderRadius: T.rControl, aspectRatio: '16/10', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tabAccent.primary} strokeWidth="1.5" style={{ marginBottom: 10, opacity: 0.7 }}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Lab environment opens in a separate workspace</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 6 }}>{lab.expCount} experiments · local demo — no live execution</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={`/labs/${lab.labId}`} target="_blank" rel="noopener noreferrer" onClick={onLaunch} style={{ background: tabAccent.primary, border: 'none', color: C.black, padding: '11px 20px', borderRadius: T.rControl, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'inline-block' }}>
              Launch lab →
            </a>
            {labLaunched && (
              <button type="button" onClick={onMarkComplete} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '11px 20px', borderRadius: T.rControl, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Mark lab complete
              </button>
            )}
          </div>
          {!labLaunched && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 12 }}>Launch the lab first, then return here to mark it complete.</div>}
        </div>
      </div>
    </div>
  )
}

function dashRoute(role: string | undefined): string {
  switch (role) {
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'superadmin': return '/dashboard/admin'
    default: return '/dashboard/student'
  }
}

export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const demo = useDemoState()
  const roleAccent = getLmsRoleAccent(user?.role)

  const course = courses.find(c => c.slug === slug)
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : []
  const firstLessonId = allLessons[0]?.id ?? ''

  const lessonStates = slug ? demo.getLessonStates(slug) : {}

  const labMapEntry = slug ? ({
    'data-analytics': 'data-centric-ai-preprocessing',
    'python-programming': 'data-centric-ai-python',
    'generative-ai': 'mcom-fintech-blockchain',
    'full-stack-web': 'bca-fullstack-react',
    'power-bi': 'mba-business-analytics',
    'product-management': 'mba-operations-research',
  } as Record<string, string>)[slug] ?? 'data-centric-ai-python' : ''
  const labProgress = labMapEntry ? demo.getLabProgress(labMapEntry) : { launched: false, complete: false, experiments: {} }
  const labLaunched = labProgress.launched
  const labComplete = labProgress.complete

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [activeTab, setActiveTab] = useState<LmsTabId>('video')
  const [showCertificate, setShowCertificate] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabAccent = getLmsTabAccent(activeTab)

  useEffect(() => {
    if (selectedLessonId && slug) navigate(`/learn/${slug}/${selectedLessonId}`, { replace: true })
  }, [selectedLessonId, slug, navigate])

  useEffect(() => {
    if (lessonId && allLessons.some(l => l.id === lessonId)) setSelectedLessonId(lessonId)
  }, [])

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-body)' }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Course not found</div>
        <Link to="/courses" style={{ color: roleAccent.text, textDecoration: 'none', fontSize: 14 }}>← Back to courses</Link>
      </div>
    )
  }

  function isLessonUnlocked(id: string): boolean {
    const idx = allLessons.findIndex(l => l.id === id)
    if (idx === 0) return true
    const prev = allLessons[idx - 1]
    return prev ? (lessonStates[prev.id]?.complete ?? false) : false
  }

  const selectedLesson = allLessons.find(l => l.id === selectedLessonId)
  const selectedState = selectedLessonId ? (lessonStates[selectedLessonId] ?? defaultState()) : defaultState()

  const tabsAvailable = {
    video: true,
    notes: selectedLesson?.type === 'notes' || selectedState.videoWatched,
    quiz: selectedState.videoWatched,
    assignment: selectedState.quizPassed,
  }
  const tabsAvailableWithLab = { ...tabsAvailable, lab: tabsAvailable.assignment }

  const totalLessons = allLessons.length
  const completedCount = allLessons.filter(l => lessonStates[l.id]?.complete).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const allComplete = completedCount === totalLessons

  function updateLesson(id: string, patch: Partial<LessonState>) {
    if (!slug) return
    demo.updateLesson(slug, id, patch)
  }

  function handleVideoWatched() {
    updateLesson(selectedLessonId, { videoWatched: true })
    setActiveTab(selectedLesson?.type === 'notes' ? 'notes' : 'quiz')
  }

  function handleQuizPass() {
    updateLesson(selectedLessonId, { quizPassed: true })
    setTimeout(() => setActiveTab('assignment'), 600)
  }

  function handleAssignmentSubmit() {
    updateLesson(selectedLessonId, { assignmentSubmitted: true, complete: true })
    const remaining = allLessons.filter(l => l.id !== selectedLessonId && !lessonStates[l.id]?.complete)
    if (remaining.length === 0) setTimeout(() => setShowCertificate(true), 800)
  }

  function handleLessonSelect(id: string) {
    if (!isLessonUnlocked(id)) return
    setSelectedLessonId(id)
    setActiveTab('video')
    setSidebarOpen(false)
  }

  const tabs: Array<{ key: LmsTabId; label: string }> = [
    { key: 'video', label: 'Video' },
    { key: 'notes', label: 'Notes' },
    { key: 'quiz', label: 'Quiz' },
    { key: 'assignment', label: 'Assignment' },
    { key: 'lab', label: 'Lab' },
  ]

  const sidebar = (
    <>
      <div style={{ padding: '20px', borderBottom: `1px solid ${T.lineDark}` }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: C.white }}>
            Skylent<span style={{ color: roleAccent.primary }}>.</span>
          </span>
        </Link>
        <div style={{ color: C.white, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{course.title}</div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: roleAccent.text }}>{progressPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, height: 4 }}>
            <div style={{ background: roleAccent.primary, width: `${progressPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {course.modules.map((mod: CourseModule, mi: number) => (
          <div key={mod.id}>
            <div style={{ padding: '12px 16px 6px', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.06em' }}>
              Module {mi + 1} · {mod.title}
            </div>
            {mod.lessons.map((lesson: CourseLesson) => {
              const isUnlocked = isLessonUnlocked(lesson.id)
              const state = lessonStates[lesson.id] ?? defaultState()
              const isActive = selectedLessonId === lesson.id
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => handleLessonSelect(lesson.id)}
                  disabled={!isUnlocked}
                  style={{
                    display: 'flex', width: '100%', textAlign: 'left', padding: '9px 16px', gap: 10, alignItems: 'center',
                    background: isActive ? roleAccent.subtle : 'transparent',
                    borderLeft: isActive ? `2px solid ${roleAccent.primary}` : '2px solid transparent',
                    border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div style={{ flexShrink: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {state.complete ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={roleAccent.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : !isUnlocked ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : (
                      <LessonIcon type={lesson.type} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ color: isUnlocked ? (isActive ? C.white : 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.2)', fontSize: 12, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lesson.title}
                    </div>
                    {lesson.duration && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{lesson.duration}</div>}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="lms-shell" style={{ display: 'flex', height: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div className="lms-sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200 }} />
      )}
      <aside className={`lms-sidebar${sidebarOpen ? ' open' : ''}`} style={{
        width: 280, flexShrink: 0, background: 'rgba(5,5,5,0.94)', borderRight: `1px solid ${T.lineDark}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto', backdropFilter: 'blur(20px)',
      }}>
        {sidebar}
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{
          height: 56, background: 'rgba(5,5,5,0.92)', borderBottom: `1px solid ${T.lineDark}`,
          display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 3vw, 28px)', gap: 12, flexShrink: 0,
        }}>
          <button type="button" className="lms-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open curriculum" style={{ background: 'none', border: 'none', color: C.white, padding: 8, cursor: 'pointer', display: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <button type="button" onClick={() => navigate(dashRoute(user?.role))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <span className="lms-header-course" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</span>
          {selectedLesson && (
            <>
              <span className="lms-header-lesson-sep" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span className="lms-header-lesson" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLesson.title}</span>
            </>
          )}
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: roleAccent.text, flexShrink: 0 }}>{progressPct}%</div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(20px, 3vw, 36px)' }}>
          {(allComplete || showCertificate) && (
            <div style={{ background: roleAccent.subtle, border: `1px solid ${roleAccent.border}`, borderRadius: T.rCard, padding: '28px', marginBottom: 28, textAlign: 'center' }}>
              <div style={{ color: roleAccent.text, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>CERTIFICATE UNLOCKED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>You have completed all lessons in this course.</div>
              <button type="button" style={{ background: roleAccent.primary, border: 'none', color: C.black, padding: '12px 28px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Download certificate →
              </button>
            </div>
          )}

          {selectedLesson ? (
            <>
              <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${T.lineDark}`, overflowX: 'auto', flexWrap: 'nowrap' }}>
                {tabs.map(tab => {
                  const available = tab.key === 'lab' ? tabsAvailableWithLab.lab : tabsAvailable[tab.key as keyof typeof tabsAvailable]
                  if (!available && tab.key !== 'video') return null
                  const accent = getLmsTabAccent(tab.key)
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => available && setActiveTab(tab.key)}
                      disabled={!available}
                      style={{
                        padding: '10px 18px', background: isActive ? accent.subtle : 'none', border: 'none', flexShrink: 0,
                        borderBottom: `2px solid ${isActive ? accent.primary : 'transparent'}`,
                        borderRadius: isActive ? '6px 6px 0 0' : 0,
                        color: isActive ? accent.primary : available ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', marginBottom: -1,
                      }}
                    >
                      {tab.label}
                      {!available && tab.key !== 'video' && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>🔒</span>}
                    </button>
                  )
                })}
              </div>

              <div style={{
                border: `1px solid ${tabAccent.border}`,
                borderLeft: `3px solid ${tabAccent.primary}`,
                borderRadius: T.rCard,
                background: 'rgba(255,255,255,0.015)',
                padding: 'clamp(20px, 3vw, 28px)',
              }}>
              {activeTab === 'video' && <VideoTab lesson={selectedLesson} lessonState={selectedState} onWatched={handleVideoWatched} tabAccent={tabAccent} roleAccent={roleAccent} />}
              {activeTab === 'notes' && tabsAvailable.notes && <NotesTab lesson={selectedLesson} tabAccent={tabAccent} />}
              {activeTab === 'quiz' && tabsAvailable.quiz && <QuizTab lesson={selectedLesson} lessonState={selectedState} onPass={handleQuizPass} tabAccent={tabAccent} roleAccent={roleAccent} />}
              {activeTab === 'assignment' && tabsAvailable.assignment && <AssignmentTab lesson={selectedLesson} lessonState={selectedState} onSubmit={handleAssignmentSubmit} tabAccent={tabAccent} />}
              {activeTab === 'lab' && tabsAvailableWithLab.lab && slug && (
                <LabTab slug={slug} labLaunched={labLaunched} labComplete={labComplete} onLaunch={() => demo.setLabLaunched(labMapEntry)} onMarkComplete={() => demo.setLabComplete(labMapEntry)} tabAccent={tabAccent} />
              )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Select a lesson from the curriculum to begin.</div>
          )}
        </div>
      </div>

      <style>{`
        .lms-shell { overflow-x: hidden; }
        @media (max-width: 900px) {
          .lms-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0; z-index: 210;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .lms-sidebar.open { transform: translateX(0); }
          .lms-menu-btn { display: flex !important; }
          .lms-header-lesson { display: none; }
          .lms-header-lesson-sep { display: none; }
        }
        @media (max-width: 768px) {
          .lms-lab-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 375px) {
          .lms-header-course { max-width: 120px; }
        }
      `}</style>
    </div>
  )
}
