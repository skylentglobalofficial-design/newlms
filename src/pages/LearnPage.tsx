import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C } from '../components/shared'
import { courses } from '../data'
import type { CourseLesson, CourseModule } from '../data'

// ─── LESSON STATE ──────────────────────────────────────────────────────────────
type LessonState = {
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  complete: boolean
}

type AllLessonState = Record<string, LessonState>

function defaultState(): LessonState {
  return { videoWatched: false, quizPassed: false, assignmentSubmitted: false, complete: false }
}

// ─── QUIZ QUESTIONS (generic) ──────────────────────────────────────────────────
const quizQuestions = [
  {
    q: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Logic', 'Structured Queue List', 'Standard Query Link'],
    correct: 0,
  },
  {
    q: 'Which SQL clause filters rows after grouping?',
    options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
    correct: 1,
  },
  {
    q: 'What type of JOIN returns all rows from both tables?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    correct: 3,
  },
]

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function LessonIcon({ type, size = 14 }: { type: CourseLesson['type']; size?: number }) {
  const color = 'rgba(255,255,255,0.35)'
  if (type === 'video') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  if (type === 'notes') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  if (type === 'quiz') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}

// Renders the video surface for a lesson. Today every lesson only has a
// placeholder (no real video hosting is wired up yet — see src/types/lms.ts
// `VideoLessonContent.videoUrl`). Keeping this as its own component means a
// future real player (e.g. an embed for a hosted video URL) can be swapped
// in here without touching VideoTab, the tab-unlock logic, or any other
// lesson type.
function LessonVideoPlayer({ lesson }: { lesson: CourseLesson }) {
  return (
    <div style={{ background: '#000', borderRadius: 12, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0c0e 0%, #141820 100%)' }} />
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(243,107,33,0.15)', border: '2px solid rgba(243,107,33,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', cursor: 'pointer' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={C.orange}><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div style={{ color: C.white, fontSize: 15, fontWeight: 600 }}>{lesson.title}</div>
        {lesson.duration && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6, fontFamily: 'var(--font-mono)' }}>{lesson.duration}</div>}
      </div>
    </div>
  )
}

function VideoTab({ lesson, lessonState, onWatched }: { lesson: CourseLesson; lessonState: LessonState; onWatched: () => void }) {
  return (
    <div>
      <LessonVideoPlayer lesson={lesson} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.white, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{lesson.title}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7 }}>
          In this lesson, you will learn the core concepts behind {lesson.title.toLowerCase()}. Follow along with the examples and practice with the provided exercises before moving on to the quiz.
        </div>
      </div>
      {!lessonState.videoWatched ? (
        <button onClick={onWatched} style={{ background: C.orange, border: 'none', color: C.white, padding: '12px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >Mark as Watched →</button>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 18px', color: '#22c55e', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Video watched — Quiz is now unlocked
        </div>
      )}
    </div>
  )
}

function NotesTab({ lesson }: { lesson: CourseLesson }) {
  const [copied, setCopied] = useState(false)
  const notes = `# ${lesson.title}\n\n## Key Concepts\n\nThis lesson covers foundational material for ${lesson.title}. Pay attention to the following:\n\n- **Core concept 1**: Understanding the fundamentals and how they apply in real-world scenarios\n- **Core concept 2**: Practical application using industry-standard tools\n- **Core concept 3**: Common patterns and best practices used by professionals\n\n## Summary\n\nBy the end of this lesson, you should be comfortable explaining the concepts above and applying them to sample problems. Revisit these notes before taking the quiz.\n\n## References\n\n- Course slides (available in student portal)\n- Skylent resource library\n- Practice exercises (attached to this lesson)`

  function handleCopy() {
    navigator.clipboard.writeText(notes).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{lesson.title} — Notes</div>
        <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '7px 14px', color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.2s' }}>
          {copied ? 'Copied!' : 'Copy Notes'}
        </button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '24px' }}>
        {notes.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <div key={i} style={{ color: C.white, fontSize: 20, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>{line.slice(2)}</div>
          if (line.startsWith('## ')) return <div key={i} style={{ color: C.white, fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 10 }}>{line.slice(3)}</div>
          if (line.startsWith('- ')) {
            const parts = line.slice(2).split('**')
            return <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 8, paddingLeft: 16, borderLeft: '2px solid rgba(243,107,33,0.3)' }}>
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: C.white }}>{p}</strong> : p)}
            </div>
          }
          if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
          return <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{line}</div>
        })}
      </div>
    </div>
  )
}

function QuizTab({ lesson, lessonState, onPass }: { lesson: CourseLesson; lessonState: LessonState; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const correct = quizQuestions.filter((q, i) => answers[i] === q.correct).length

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
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Quiz Passed!</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Assignment tab is now unlocked</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{lesson.title} — Quiz</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Answer all {quizQuestions.length} questions correctly to unlock the assignment.</div>
      {submitted && (
        <div style={{ background: correct === quizQuestions.length ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${correct === quizQuestions.length ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: correct === quizQuestions.length ? '#22c55e' : '#ef4444', fontSize: 13 }}>
          {correct === quizQuestions.length ? `All ${correct} correct — quiz passed!` : `${correct} of ${quizQuestions.length} correct. Try again.`}
        </div>
      )}
      {quizQuestions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 24 }}>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Q{qi + 1}. {q.q}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const isCorrect = submitted && oi === q.correct
              const isWrong = submitted && selected && oi !== q.correct
              return (
                <button
                  key={oi}
                  onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  style={{ textAlign: 'left', padding: '11px 16px', background: isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : selected ? 'rgba(243,107,33,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : selected ? 'rgba(243,107,33,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : selected ? C.orange : 'rgba(255,255,255,0.6)', fontSize: 13, cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} disabled={Object.keys(answers).length < quizQuestions.length} style={{ background: Object.keys(answers).length < quizQuestions.length ? 'rgba(255,255,255,0.05)' : C.orange, border: 'none', color: Object.keys(answers).length < quizQuestions.length ? 'rgba(255,255,255,0.25)' : C.white, padding: '12px 28px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: Object.keys(answers).length < quizQuestions.length ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
          Submit Quiz
        </button>
      ) : correct < quizQuestions.length ? (
        <button onClick={() => { setSubmitted(false); setAnswers({}) }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: C.white, padding: '12px 24px', borderRadius: 9, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try Again</button>
      ) : null}
    </div>
  )
}

function AssignmentTab({ lesson, lessonState, onSubmit }: { lesson: CourseLesson; lessonState: LessonState; onSubmit: () => void }) {
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
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #ff9a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ color: C.white, fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Assignment Submitted!</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 320, margin: '0 auto 24px' }}>Your submission has been recorded. The next lesson is now unlocked.</div>
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Submitted · Awaiting review
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{lesson.title} — Assignment</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Complete the task below and submit. Your faculty will review and provide feedback.</div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '18px', marginBottom: 20 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>TASK</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
          Apply the concepts from this lesson to complete the following exercise. Document your approach, show your work, and explain your reasoning in the text box below. Your submission should demonstrate understanding of the core concepts covered.
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>YOUR RESPONSE</div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your assignment response here..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '14px', color: C.white, fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.7, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <button onClick={handleSubmit} disabled={!text.trim()} style={{ background: !text.trim() ? 'rgba(255,255,255,0.05)' : C.orange, border: 'none', color: !text.trim() ? 'rgba(255,255,255,0.2)' : C.white, padding: '12px 28px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: !text.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
        Submit Assignment →
      </button>
    </div>
  )
}

// ─── LAB TAB ──────────────────────────────────────────────────────────────────
function LabTab({ slug, labLaunched, labComplete, onLaunch, onMarkComplete }: { slug: string; labLaunched: boolean; labComplete: boolean; onLaunch: () => void; onMarkComplete: () => void }) {
  // Map course slugs to lab subjects
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
        <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Lab Complete!</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Great work. Your next step is now unlocked.</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Connected Lab</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Complete the lab experiments linked to this lesson to reinforce your skills.</div>

      <div style={{ background: 'rgba(243,107,33,0.06)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(243,107,33,0.12)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.white, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{lab.labTitle}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{lab.labDesc}</div>
            <div style={{ color: C.orange, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{lab.expCount} Experiments</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a
          href={`/labs/${lab.labId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLaunch}
          style={{ background: C.orange, border: 'none', color: C.white, padding: '12px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'inline-block', transition: 'opacity 0.2s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
        >Launch Lab &rarr;</a>
        {labLaunched && (
          <button
            onClick={onMarkComplete}
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
          >Mark Lab Complete</button>
        )}
      </div>
      {!labLaunched && (
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 12 }}>Launch the lab first, then return here to mark it complete.</div>
      )}
    </div>
  )
}

// ─── MAIN LEARN PAGE ──────────────────────────────────────────────────────────
export default function LearnPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)

  // Flatten all lessons
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : []
  const firstLessonId = allLessons[0]?.id ?? ''

  // Lesson state
  const [lessonStates, setLessonStates] = useState<AllLessonState>(() => {
    const init: AllLessonState = {}
    if (course) {
      course.modules.forEach(m => {
        m.lessons.forEach(l => {
          init[l.id] = l.completed
            ? { videoWatched: true, quizPassed: true, assignmentSubmitted: true, complete: true }
            : defaultState()
        })
      })
    }
    return init
  })

  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? firstLessonId)
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'quiz' | 'assignment' | 'lab'>('video')
  const [showCertificate, setShowCertificate] = useState(false)
  const [labLaunched, setLabLaunched] = useState(false)
  const [labComplete, setLabComplete] = useState(false)

  // Sync URL when lesson changes
  useEffect(() => {
    if (selectedLessonId && slug) {
      navigate(`/learn/${slug}/${selectedLessonId}`, { replace: true })
    }
  }, [selectedLessonId, slug, navigate])

  // Auto-navigate to lessonId from URL on mount
  useEffect(() => {
    if (lessonId && allLessons.some(l => l.id === lessonId)) {
      setSelectedLessonId(lessonId)
    }
  }, [])

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-body)' }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Course not found</div>
        <Link to="/courses" style={{ color: C.orange, textDecoration: 'none', fontSize: 14 }}>← Back to Courses</Link>
      </div>
    )
  }

  // Determine which lessons are unlocked
  function isLessonUnlocked(lessonId: string): boolean {
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx === 0) return true
    const prev = allLessons[idx - 1]
    return prev ? (lessonStates[prev.id]?.complete ?? false) : false
  }

  const selectedLesson = allLessons.find(l => l.id === selectedLessonId)
  const selectedState = selectedLessonId ? (lessonStates[selectedLessonId] ?? defaultState()) : defaultState()

  // Tab availability
  const tabsAvailable = {
    video: true,
    notes: selectedLesson?.type === 'notes' || selectedState.videoWatched,
    quiz: selectedState.videoWatched,
    assignment: selectedState.quizPassed,
  }

  // Computed progress
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter(l => lessonStates[l.id]?.complete).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const allComplete = completedCount === totalLessons

  function updateLesson(lessonId: string, patch: Partial<LessonState>) {
    setLessonStates(prev => {
      const current = prev[lessonId] ?? defaultState()
      const updated = { ...current, ...patch }
      // Mark complete when assignment submitted (or for notes type when notes viewed)
      if (updated.assignmentSubmitted) updated.complete = true
      return { ...prev, [lessonId]: updated }
    })
  }

  function handleVideoWatched() {
    updateLesson(selectedLessonId, { videoWatched: true })
    if (selectedLesson?.type === 'notes') {
      setActiveTab('notes')
    } else {
      setActiveTab('quiz')
    }
  }

  function handleQuizPass() {
    updateLesson(selectedLessonId, { quizPassed: true })
    setTimeout(() => setActiveTab('assignment'), 600)
  }

  function handleAssignmentSubmit() {
    updateLesson(selectedLessonId, { assignmentSubmitted: true, complete: true })
    // Check if all complete
    const remaining = allLessons.filter(l => l.id !== selectedLessonId && !(lessonStates[l.id]?.complete))
    if (remaining.length === 0) {
      setTimeout(() => setShowCertificate(true), 800)
    }
  }

  function handleLessonSelect(lessonId: string) {
    if (!isLessonUnlocked(lessonId)) return
    setSelectedLessonId(lessonId)
    setActiveTab('video')
  }

  const tabs: Array<{ key: 'video' | 'notes' | 'quiz' | 'assignment' | 'lab'; label: string }> = [
    { key: 'video', label: 'Video' },
    { key: 'notes', label: 'Notes' },
    { key: 'quiz', label: 'Quiz' },
    { key: 'assignment', label: 'Assignment' },
    { key: 'lab', label: 'Lab' },
  ]

  const tabsAvailableWithLab = {
    ...tabsAvailable,
    lab: tabsAvailable.assignment,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0c0e', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>

      {/* Left sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Course title */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>COURSE</div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{course.title}</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Progress</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.orange }}>{progressPct}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, height: 4 }}>
              <div style={{ background: C.orange, width: `${progressPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Modules + Lessons */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {course.modules.map((mod: CourseModule, mi: number) => (
            <div key={mod.id}>
              <div style={{ padding: '12px 16px 6px', color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                M{mi + 1} · {mod.title.toUpperCase()}
              </div>
              {mod.lessons.map((lesson: CourseLesson) => {
                const isUnlocked = isLessonUnlocked(lesson.id)
                const state = lessonStates[lesson.id] ?? defaultState()
                const isActive = selectedLessonId === lesson.id
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    disabled={!isUnlocked}
                    style={{ display: 'flex', width: '100%', textAlign: 'left', padding: '9px 16px', gap: 10, alignItems: 'center', background: isActive ? 'rgba(243,107,33,0.1)' : 'transparent', borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent', border: 'none', cursor: isUnlocked ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                  >
                    <div style={{ flexShrink: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {state.complete ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : !isUnlocked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : (
                        <LessonIcon type={lesson.type} />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ color: isUnlocked ? (isActive ? C.white : 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.2)', fontSize: 12, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lesson.title}
                      </div>
                      {lesson.duration && (
                        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{lesson.duration}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 56, background: 'rgba(10,12,14,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0 }}>
          <button onClick={() => navigate('/dashboard/student')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <div style={{ color: 'rgba(255,255,255,0.15)' }}>·</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{course.title}</div>
          {selectedLesson && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.15)' }}>·</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{selectedLesson.title}</div>
            </>
          )}
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.orange }}>{progressPct}% complete</div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
          {/* Certificate banner */}
          {(allComplete || showCertificate) && (
            <div style={{ background: 'rgba(243,107,33,0.08)', border: '2px solid rgba(243,107,33,0.35)', borderRadius: 14, padding: '28px', marginBottom: 28, textAlign: 'center' }}>
              <div style={{ color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 12 }}>CERTIFICATE UNLOCKED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>Congratulations! You have completed all lessons in this course.</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: 'Skills Validated', value: `${course.outcomes.length}` },
                  { label: 'Projects', value: `${course.projects}` },
                  { label: 'Lessons', value: `${course.lessons}` },
                ].map(m => (
                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 20px', minWidth: 100 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: C.orange }}>{m.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <button style={{ background: C.orange, border: 'none', color: C.white, padding: '12px 28px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Download Certificate →</button>
            </div>
          )}

          {selectedLesson ? (
            <>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
                {tabs.map(tab => {
                  const available = tab.key === 'lab' ? tabsAvailableWithLab.lab : tabsAvailable[tab.key as keyof typeof tabsAvailable]
                  if (!available && tab.key !== 'video') return null
                  return (
                    <button
                      key={tab.key}
                      onClick={() => available && setActiveTab(tab.key)}
                      disabled={!available}
                      style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? C.orange : 'transparent'}`, color: activeTab === tab.key ? C.white : available ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', transition: 'all 0.15s', marginBottom: -1 }}
                    >
                      {tab.label}
                      {!available && tab.key !== 'video' && <span style={{ marginLeft: 6, fontSize: 10 }}>🔒</span>}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              {activeTab === 'video' && (
                <VideoTab lesson={selectedLesson} lessonState={selectedState} onWatched={handleVideoWatched} />
              )}
              {activeTab === 'notes' && tabsAvailable.notes && (
                <NotesTab lesson={selectedLesson} />
              )}
              {activeTab === 'quiz' && tabsAvailable.quiz && (
                <QuizTab lesson={selectedLesson} lessonState={selectedState} onPass={handleQuizPass} />
              )}
              {activeTab === 'assignment' && tabsAvailable.assignment && (
                <AssignmentTab lesson={selectedLesson} lessonState={selectedState} onSubmit={handleAssignmentSubmit} />
              )}
              {activeTab === 'lab' && tabsAvailableWithLab.lab && slug && (
                <LabTab
                  slug={slug}
                  labLaunched={labLaunched}
                  labComplete={labComplete}
                  onLaunch={() => setLabLaunched(true)}
                  onMarkComplete={() => setLabComplete(true)}
                />
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Select a lesson from the sidebar to begin.</div>
          )}
        </div>
      </div>
    </div>
  )
}
