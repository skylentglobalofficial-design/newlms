import { useState } from 'react'
import { C, FadeIn, PageShell } from '../components/shared'
import { getDomainAccent } from '../aurora-themes'
import { demoUsers, courses } from '../data'

const accent = getDomainAccent('general')

type Role = 'student' | 'faculty' | 'organisation' | 'superadmin'
type LMSView = 'video' | 'notes' | 'quiz' | 'assignment' | 'certificate'

function StudentLMS({ onBack }: { onBack: () => void }) {
  const course = courses[0]
  const [activeModule, setActiveModule] = useState(course.modules[0])
  const [activeLesson, setActiveLesson] = useState(course.modules[0].lessons[2])
  const [view, setView] = useState<LMSView>('video')
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null)
  const [assignSubmitted, setAssignSubmitted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const allLessons = course.modules.flatMap(m => m.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id)

  function nextLesson() {
    const next = allLessons[currentIndex + 1]
    if (!next) return
    const mod = course.modules.find(m => m.lessons.some(l => l.id === next.id))
    if (mod) setActiveModule(mod)
    setActiveLesson(next)
    setView(next.type as LMSView)
    setQuizAnswered(null)
    setAssignSubmitted(false)
  }

  return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.ink, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>Back to Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{course.title}</span>
        </div>
        <button onClick={() => setSidebarOpen(s => !s)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: C.white, borderRadius: 5, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>{sidebarOpen ? 'Hide' : 'Show'} Curriculum</button>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarOpen && (
          <div style={{ width: 250, background: '#111318', overflowY: 'auto', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            {course.modules.map(mod => (
              <div key={mod.id}>
                <div style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.03)' }}>{mod.title.toUpperCase()}</div>
                {mod.lessons.map(lesson => {
                  const isActive = lesson.id === activeLesson.id
                  return (
                    <div key={lesson.id} onClick={() => { setActiveModule(mod); setActiveLesson(lesson); setView(lesson.type as LMSView); setQuizAnswered(null); setAssignSubmitted(false) }} style={{ padding: '10px 16px', cursor: 'pointer', background: isActive ? 'rgba(243,107,33,0.12)' : 'transparent', borderLeft: `2px solid ${isActive ? accent.primary : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: lesson.completed ? accent.primary : 'transparent', border: `1.5px solid ${lesson.completed ? accent.primary : 'rgba(255,255,255,0.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {lesson.completed && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.white }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.55)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginTop: 1 }}>{lesson.type}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', background: C.warmWhite }}>
          <div style={{ padding: '16px 24px', background: C.white, borderBottom: '1px solid rgba(11,13,15,0.08)', display: 'flex', gap: 6 }}>
            {(['video', 'notes', 'quiz', 'assignment'] as LMSView[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', borderRadius: 6, border: `1px solid ${view === v ? C.ink : 'rgba(11,13,15,0.12)'}`, background: view === v ? C.ink : 'transparent', color: view === v ? C.white : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', transition: 'all 0.2s' }}>{v}</button>
            ))}
            {assignSubmitted && currentIndex >= allLessons.length - 1 && <button onClick={() => setView('certificate')} style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #16a34a', background: view === 'certificate' ? '#16a34a' : 'transparent', color: view === 'certificate' ? C.white : '#16a34a', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>CERTIFICATE</button>}
          </div>
          <div style={{ padding: 28 }}>
            <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{activeModule.title} / {activeLesson.title}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 22px', letterSpacing: '-0.02em' }}>{activeLesson.title}</h3>

            {view === 'video' && (
              <div>
                <div style={{ background: C.ink, borderRadius: 12, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', border: `2px solid ${accent.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', cursor: 'pointer' }}>
                      <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: `16px solid ${accent.primary}`, marginLeft: 4 }} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{activeLesson.title} {activeLesson.duration ? `· ${activeLesson.duration}` : ''}</div>
                  </div>
                </div>
                <button onClick={() => setView('notes')} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Continue to Notes</button>
              </div>
            )}
            {view === 'notes' && (
              <div>
                <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: 24, marginBottom: 20, color: C.ink, fontSize: 15, lineHeight: 1.85 }}>
                  <p style={{ marginTop: 0 }}>This reading material accompanies the video on <strong>{activeLesson.title}</strong>. Review key concepts, definitions, and formulas that will be tested in the quiz.</p>
                  <div style={{ background: C.sand, borderLeft: `3px solid ${accent.primary}`, borderRadius: '0 8px 8px 0', padding: '14px 18px', margin: '16px 0', fontSize: 14 }}>
                    <strong>Key insight:</strong> Structured data analysis transforms raw information into decision-ready insights.
                  </div>
                  <p>Make sure you understand the core concepts before proceeding to the quiz.</p>
                </div>
                <button onClick={() => setView('quiz')} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Take Quiz</button>
              </div>
            )}
            {view === 'quiz' && (
              <div style={{ maxWidth: 500 }}>
                <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>KNOWLEDGE CHECK</div>
                <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: 22, marginBottom: 14 }}>
                  <div style={{ color: C.ink, fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginBottom: 18 }}>Which tool is best suited for building interactive business dashboards?</div>
                  {['Excel', 'Power BI', 'Notepad', 'Google Sheets'].map((opt, i) => (
                    <div key={opt} onClick={() => { if (quizAnswered === null) setQuizAnswered(i) }} style={{ padding: '11px 15px', borderRadius: 8, border: `1px solid ${quizAnswered === i ? (i === 1 ? '#16a34a' : '#dc2626') : 'rgba(11,13,15,0.12)'}`, background: quizAnswered === i ? (i === 1 ? '#f0fdf4' : '#fef2f2') : 'transparent', cursor: quizAnswered !== null ? 'default' : 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${quizAnswered === i ? (i === 1 ? '#16a34a' : '#dc2626') : 'rgba(11,13,15,0.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {quizAnswered === i && <div style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? '#16a34a' : '#dc2626' }} />}
                      </div>
                      <span style={{ color: C.ink, fontSize: 13 }}>{opt}</span>
                    </div>
                  ))}
                </div>
                {quizAnswered !== null && (
                  <div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: quizAnswered === 1 ? '#f0fdf4' : '#fef2f2', color: quizAnswered === 1 ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 14 }}>
                      {quizAnswered === 1 ? 'Correct! Power BI is purpose-built for dashboards.' : 'The correct answer is Power BI.'}
                    </div>
                    <button onClick={() => setView('assignment')} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Continue to Assignment</button>
                  </div>
                )}
              </div>
            )}
            {view === 'assignment' && (
              <div>
                <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
                  <div style={{ color: accent.primary, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>ASSIGNMENT</div>
                  <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Build a Sales Dashboard in Power BI</div>
                  <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.75, margin: '0 0 18px' }}>Use the sample dataset provided. Create a dashboard with monthly trends, regional breakdown, and top products. Submit as PDF.</p>
                  {!assignSubmitted ? (
                    <div>
                      <div style={{ background: C.sand, border: '2px dashed rgba(11,13,15,0.2)', borderRadius: 8, padding: '22px', textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ color: C.slate, fontSize: 14 }}>Drop your file here or browse</div>
                        <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 3 }}>PDF · PPTX · PBIX · Max 20 MB</div>
                      </div>
                      <button onClick={() => setAssignSubmitted(true)} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Submit Assignment</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', color: '#16a34a', fontSize: 13, marginBottom: 14 }}>Submitted — under review.</div>
                      {currentIndex < allLessons.length - 1 ? (
                        <button onClick={nextLesson} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Next Lesson</button>
                      ) : (
                        <button onClick={() => setView('certificate')} style={{ background: '#16a34a', border: 'none', color: C.white, borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Get Certificate</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {view === 'certificate' && (
              <div style={{ maxWidth: 560, margin: '0 auto' }}>
                {/* Credential */}
                <div style={{ background: C.white, border: '2px solid rgba(243,107,33,0.25)', borderRadius: 16, padding: 36, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 20 }}>SKYLENT GLOBAL — CERTIFICATE OF COMPLETION</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: C.ink, fontWeight: 700, marginBottom: 4 }}>Arjun Sharma</div>
                  <div style={{ color: C.slate, fontSize: 14, marginBottom: 6 }}>has successfully completed</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: accent.primary, fontWeight: 600, marginBottom: 14 }}>{course.title}</div>
                  <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 22 }}>August 2026 · SKY-CERT-DA-2408</div>
                  <button style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Download Certificate</button>
                </div>
                {/* Learning proof */}
                <div style={{ background: C.sand, borderRadius: 14, padding: 22 }}>
                  <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 16 }}>LEARNING PROOF — WHAT THIS CREDENTIAL REPRESENTS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[['Projects', '3'], ['Assessments', '5'], ['Final Score', '91%']].map(([l, v]) => (
                      <div key={l} style={{ background: C.white, borderRadius: 8, padding: '13px 14px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: C.ink, fontWeight: 700, marginBottom: 2 }}>{v}</div>
                        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{(l as string).toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>VERIFIED SKILLS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['SQL', 'Power BI', 'Python', 'Statistics', 'Data Visualisation', 'Excel'].map(s => (
                      <span key={s} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.1)', borderRadius: 5, padding: '4px 12px', fontSize: 12, color: C.ink, fontFamily: 'var(--font-mono)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentDash({ user, onOpenLMS }: { user: typeof demoUsers[0]; onOpenLMS: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>GOOD MORNING</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink }}>{user.name}</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 14, fontWeight: 700 }}>{user.avatar}</div>
      </div>

      {/* Next action — always visible */}
      <div style={{ background: `linear-gradient(135deg, ${accent.primary}18, ${accent.primary}08)`, border: `1px solid ${accent.primary}30`, borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: accent.primary, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>NEXT ACTION</div>
          <div style={{ color: C.ink, fontSize: 15, fontWeight: 600 }}>Complete the Foundations Quiz to unlock Module 2</div>
        </div>
        <button onClick={onOpenLMS} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 7, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>Take Quiz →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="three-col">
        {[['Program', user.program ?? 'N/A'], ['Progress', `${user.progress ?? 0}%`], ['Streak', '14 days']].map(([l, v]) => (
          <div key={l} style={{ background: C.sand, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: C.ink, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `linear-gradient(135deg, ${C.ink}, #1a1e22)`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>CONTINUE LEARNING</div>
        <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Data Analytics — Module 2: Excel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}><div style={{ width: `${user.progress ?? 0}%`, height: '100%', background: accent.primary, borderRadius: 2 }} /></div>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{user.progress ?? 0}%</span>
        </div>
        <button onClick={onOpenLMS} style={{ background: accent.primary, border: 'none', color: C.white, borderRadius: 7, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Open Course →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="two-col">
        {[['Next Live Class', 'Tomorrow · 10:00 AM', false], ['Pending Assignments', '2 due this week', true], ['Career Readiness', '72% — needs attention', true], ['Certificates Earned', '1 of 5', false]].map(([l, v, warn]) => (
          <div key={l as string} style={{ background: C.white, border: `1px solid ${warn ? 'rgba(243,107,33,0.2)' : 'rgba(11,13,15,0.08)'}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>{l as string}</div>
            <div style={{ color: warn ? accent.primary : C.ink, fontSize: 14, fontWeight: 600 }}>{v as string}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FacultyDash({ user }: { user: typeof demoUsers[0] }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>FACULTY DASHBOARD</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink }}>{user.name}</div>
        <div style={{ color: C.slate, fontSize: 13, marginTop: 2 }}>{user.course ?? 'N/A'}</div>
      </div>

      {/* Action alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }} className="two-col">
        {[
          { label: '12 assignments pending review', action: 'Review submissions', urgent: true },
          { label: 'Live class in 2 hours', action: 'Prepare session', urgent: false },
        ].map(a => (
          <div key={a.label} style={{ background: a.urgent ? `${accent.primary}10` : C.sand, border: `1px solid ${a.urgent ? `${accent.primary}30` : 'transparent'}`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ color: a.urgent ? accent.primary : C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 5 }}>{a.urgent ? 'NEEDS ATTENTION' : 'UPCOMING'}</div>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{a.label}</div>
            <button style={{ color: a.urgent ? accent.primary : C.slate, background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)' }}>{a.action} →</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="career-grid">
        {[['Students', user.students ?? 0], ['Live Sessions', '3'], ['Pending Reviews', '12'], ['Avg Score', '78%']].map(([l, v]) => (
          <div key={l} style={{ background: C.sand, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: C.ink, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, padding: 22 }}>
        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>STUDENT PROGRESS — AT-RISK FLAGGED</div>
        {[['Priya M.', 82, false], ['Rahul K.', 65, false], ['Sneha R.', 91, false], ['Amit D.', 48, true]].map(([s, pct, risk]) => (
          <div key={s as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(11,13,15,0.06)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: risk ? 'rgba(220,38,38,0.1)' : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: risk ? '#dc2626' : C.slate, flexShrink: 0 }}>{(s as string)[0]}</div>
            <div style={{ color: C.ink, fontSize: 13, width: 80, flexShrink: 0 }}>{s as string}</div>
            <div style={{ flex: 1, height: 4, background: C.sand, borderRadius: 2 }}><div style={{ width: `${pct as number}%`, height: '100%', background: (pct as number) < 60 ? '#dc2626' : (pct as number) > 80 ? '#16a34a' : accent.primary, borderRadius: 2 }} /></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: risk ? '#dc2626' : C.ink, width: 34, textAlign: 'right' }}>{pct as number}%</div>
            {risk && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#dc2626', background: 'rgba(220,38,38,0.08)', borderRadius: 4, padding: '2px 7px' }}>AT RISK</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function OrgDash({ user }: { user: typeof demoUsers[0] }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>ORGANISATION DASHBOARD</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink }}>{user.name}</div>
      </div>

      {/* Actionable alerts */}
      <div style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ color: '#dc2626', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>NEEDS ATTENTION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['42 learners inactive for 7+ days', '18 assignments overdue across Cohort 2024-B', '3 cohorts below 60% completion target'].map(alert => (
            <div key={alert} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.ink, fontSize: 13 }}>{alert}</span>
              <button style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', marginLeft: 12 }}>View →</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="career-grid">
        {[['Total Students', user.students ?? 0], ['Programs', user.programs ?? 0], ['Avg Completion', '78%'], ['Certificates', '942']].map(([l, v]) => (
          <div key={l} style={{ background: C.sand, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: C.ink, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, padding: 22 }}>
        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>COHORT COMPLETION</div>
        {[['Cohort 2024-A', 91, false], ['Cohort 2024-B', 58, true], ['Cohort 2025-A', 74, false]].map(([c, pct, warn]) => (
          <div key={c as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(11,13,15,0.06)' }}>
            <div style={{ color: warn ? '#dc2626' : C.ink, fontSize: 13, width: 120, flexShrink: 0, fontWeight: warn ? 600 : 400 }}>{c as string}</div>
            <div style={{ flex: 1, height: 5, background: C.sand, borderRadius: 3 }}><div style={{ width: `${pct as number}%`, height: '100%', background: (pct as number) < 65 ? '#dc2626' : accent.primary, borderRadius: 3 }} /></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: warn ? '#dc2626' : C.ink, width: 36, textAlign: 'right' }}>{pct as number}%</div>
            {warn && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#dc2626', background: 'rgba(220,38,38,0.08)', borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>BELOW TARGET</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminDash({ user }: { user: typeof demoUsers[0] }) {
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>SUPER ADMIN — DEMO ENVIRONMENT</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink }}>{user.name}</div>
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 5, padding: '4px 10px', display: 'inline-block', marginTop: 6, color: '#dc2626', fontSize: 10, fontFamily: 'var(--font-mono)' }}>DEMO DATA — NOT PRODUCTION</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }} className="three-col">
        {[['Total Users', user.totalUsers ?? 0], ['Organisations', user.totalOrgs ?? 0], ['Active Courses', '64'], ['Enrollments', '8,420'], ['Revenue', '₹1.2 Cr'], ['Certificates', '5,840']].map(([l, v]) => (
          <div key={l as string} style={{ background: C.sand, borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 5 }}>{(l as string).toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: C.ink, fontWeight: 600 }}>{typeof v === 'number' ? v.toLocaleString('en-IN') : v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, padding: 22, overflowX: 'auto' }}>
        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>RECENT ENROLLMENTS</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead><tr>{['Student', 'Program', 'Organisation', 'Amount', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', padding: '0 12px 10px 0' }}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {[['Priya S.', 'Data Science & AI', 'Apex College', '₹24,999', 'Active'], ['Rahul K.', 'Full Stack Dev', 'ITM Hyd', '₹29,999', 'Active'], ['Sneha N.', 'Data Analytics', 'Self-enroll', '₹4,999', 'Active']].map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(11,13,15,0.06)' }}>
                {r.map((cell, j) => <td key={j} style={{ padding: '11px 12px 11px 0', color: j === 4 ? '#16a34a' : C.ink, fontSize: 13 }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function OSPage() {
  const [activeRole, setActiveRole] = useState<Role | null>(null)
  const [lmsOpen, setLmsOpen] = useState(false)

  const roleUser = demoUsers.find(u => u.role === activeRole)

  if (activeRole && roleUser) {
    if (lmsOpen && activeRole === 'student') {
      return (
        <PageShell>
          <section style={{ background: C.warmWhite, padding: '40px 32px 60px' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              <StudentLMS onBack={() => setLmsOpen(false)} />
            </div>
          </section>
        </PageShell>
      )
    }
    return (
      <PageShell>
        <section style={{ background: C.warmWhite, padding: '60px 32px 80px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['student', 'faculty', 'organisation', 'superadmin'] as Role[]).map(r => (
                  <button key={r} onClick={() => setActiveRole(r)} style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${activeRole === r ? C.ink : 'rgba(11,13,15,0.15)'}`, background: activeRole === r ? C.ink : 'transparent', color: activeRole === r ? C.white : C.slate, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', textTransform: 'capitalize', transition: 'all 0.2s' }}>{r === 'superadmin' ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1)}</button>
                ))}
              </div>
              <button onClick={() => setActiveRole(null)} style={{ background: 'none', border: 'none', color: C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← Back to login</button>
            </div>
            {activeRole === 'student' && <StudentDash user={roleUser} onOpenLMS={() => setLmsOpen(true)} />}
            {activeRole === 'faculty' && <FacultyDash user={roleUser} />}
            {activeRole === 'organisation' && <OrgDash user={roleUser} />}
            {activeRole === 'superadmin' && <AdminDash user={roleUser} />}
          </div>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Full dark product gateway — the visual transition from public to product */}
      <section style={{ background: C.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Grid background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: `radial-gradient(circle, ${accent.primary}12 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 100, padding: '5px 16px', marginBottom: 28 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent.primary, animation: 'pulse 2s infinite' }} />
                <span style={{ color: accent.primary, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>SKYLENT OS — DEMO ENVIRONMENT</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>
                You are entering<br /><span style={{ color: accent.primary }}>Skylent OS.</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 16, lineHeight: 1.75, maxWidth: 440, margin: '0 auto' }}>A learning and career operating layer. Select a role to explore the full product experience.</p>
            </div>
          </FadeIn>

          {/* Role cards — glass style on dark */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="two-col">
            {demoUsers.map((u, i) => (
              <FadeIn key={u.role} delay={i * 70}>
                <div onClick={() => setActiveRole(u.role as Role)} style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(14px)', borderRadius: 16, padding: '24px 26px', cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${accent.primary}55`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.045)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div>
                    <div>
                      <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 5, padding: '3px 10px', display: 'inline-block', color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>{u.role === 'superadmin' ? 'SUPER ADMIN' : u.role.toUpperCase()}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.55, marginBottom: 14 }}>
                    {u.role === 'student' && `${u.program} · ${u.progress}% complete`}
                    {u.role === 'faculty' && `${u.course} · ${u.students} students`}
                    {u.role === 'organisation' && `${u.students?.toLocaleString('en-IN')} students · ${u.programs} programs`}
                    {u.role === 'superadmin' && `${(u.totalUsers ?? 0).toLocaleString('en-IN')} users · ${u.totalOrgs} organisations`}
                  </div>
                  <div style={{ color: accent.primary, fontSize: 12, fontWeight: 600 }}>Enter as this user →</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={320}>
            <div style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              Demo only — no real accounts, payments, or data are used.
            </div>
          </FadeIn>
        </div>
      </section>
    </PageShell>
  )
}
