import { useState } from 'react'
import { C, FadeIn, PageShell, JobDrawer, ApplyModal } from '../components/shared'
import { Badge, FlowStrip, T } from '../components/ui'
import { jobs } from '../data'
import type { Job } from '../data'

type OSTab = 'dashboard' | 'profile' | 'resume' | 'interview' | 'jobs' | 'tracker'

const mockQuestions = [
  'Tell me about yourself and a project you are proud of.',
  'Describe how you would approach an unfamiliar dataset.',
  'How do you handle incomplete or inconsistent data?',
  'Walk through a project you would put on a portfolio.',
  'What would you want a hiring manager to know about how you work?',
]

export default function CareerOSPage() {
  const [tab, setTab] = useState<OSTab>('dashboard')
  const [interviewRound, setInterviewRound] = useState<'technical' | 'hr' | 'managerial'>('technical')
  const [mockQ, setMockQ] = useState(0)
  const [mockStarted, setMockStarted] = useState(false)
  const [mockDone, setMockDone] = useState(false)
  const [drawerJob, setDrawerJob] = useState<Job | null>(null)
  const [applyJob, setApplyJob] = useState<Job | null>(null)

  const tabs: { id: OSTab; label: string }[] = [
    { id: 'dashboard', label: 'Career Readiness' },
    { id: 'profile', label: 'Profile' },
    { id: 'resume', label: 'Resume' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'jobs', label: 'Job Board' },
    { id: 'tracker', label: 'Applications' },
  ]

  const interviewTopics: Record<'technical' | 'hr' | 'managerial', string[]> = {
    technical: ['SQL and database querying', 'Python for analysis', 'Statistical concepts', 'Dashboarding (Power BI / Tableau)', 'System and problem walkthroughs'],
    hr: ['Tell me about yourself', 'Strengths and working style', 'Why this role?', 'Situational behaviour', 'Compensation conversations'],
    managerial: ['Prioritisation', 'Stakeholder communication', 'Conflict on a team', 'Planning under ambiguity', 'Decision quality'],
  }

  const capabilities = [
    { title: 'Profile', desc: 'A structured professional profile fed by your program work.', tab: 'profile' as OSTab },
    { title: 'Resume', desc: 'Build and export a resume. Scores appear only when you have one.', tab: 'resume' as OSTab },
    { title: 'Interview Prep', desc: 'Technical, HR, and managerial rounds with practice prompts.', tab: 'interview' as OSTab },
    { title: 'Jobs', desc: 'Open roles you can inspect and apply to from this product.', tab: 'jobs' as OSTab },
  ]

  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '88px 32px 0' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'end', marginBottom: 36 }} className="two-col">
            <div>
              <Badge tone="dark" accent>Career OS</Badge>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 600, color: C.white, letterSpacing: '-0.035em', lineHeight: 0.98, margin: '16px 0 14px' }}>
                Your career,<br />as a product.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 16, lineHeight: 1.7, maxWidth: 500, margin: '0 0 24px' }}>
                Interview prep and a job board in one workspace. Unlocks after a Professional Program. Personal scores stay empty until they are yours.
              </p>
              <FlowStrip tone="dark" steps={[
                { label: 'Professional Program' },
                { label: 'Career OS', highlight: true },
                { label: 'Jobs' },
              ]} />
            </div>
            <div style={{ background: '#14181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16 }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>WORKSPACE</div>
              {['Career Readiness', 'Profile · Resume · Skills', 'Interview Preparation', 'Job Board · Applications'].map(row => (
                <div key={row} style={{ padding: '10px 12px', marginBottom: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 8, color: 'rgba(255,255,255,0.78)', fontSize: 13 }}>{row}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.warmWhite : 'transparent', border: 'none', borderRadius: '8px 8px 0 0', padding: '12px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', color: tab === t.id ? C.ink : 'rgba(255,255,255,0.5)', fontWeight: tab === t.id ? 600 : 400, whiteSpace: 'nowrap' }}>{t.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '40px 32px 80px', minHeight: 560 }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>

          {tab === 'dashboard' && (
            <FadeIn>
              <div style={{ background: C.sand, borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: C.slate }}>
                Product workspace. Recommended actions become personal after you enroll and complete a Professional Program.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }} className="two-col">
                {capabilities.map(c => (
                  <button key={c.title} type="button" onClick={() => setTab(c.tab)} style={{ textAlign: 'left', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '24px 22px', cursor: 'pointer' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{c.title}</div>
                    <div style={{ color: C.slate, fontSize: 14, lineHeight: 1.6 }}>{c.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '24px 26px' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>RECOMMENDED ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
                  {[
                    { label: 'Complete a Professional Program', tab: 'jobs' as OSTab, hint: 'Unlocks this OS' },
                    { label: 'Practice interview rounds', tab: 'interview' as OSTab, hint: 'No score stored yet' },
                    { label: 'Browse open roles', tab: 'jobs' as OSTab, hint: 'Live job board' },
                  ].map(a => (
                    <button key={a.label} type="button" onClick={() => setTab(a.tab)} style={{ textAlign: 'left', background: C.sand, border: 'none', borderRadius: 10, padding: 16, cursor: 'pointer' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: C.slate }}>{a.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {tab === 'profile' && (
            <FadeIn>
              <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '28px 28px' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>PROFILE</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: C.ink, margin: '0 0 12px' }}>Your professional profile</h2>
                <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: '0 0 24px', maxWidth: 560 }}>
                  After a Professional Program, this space holds identity, skills from coursework, and portfolio links. Nothing is filled in until you have data.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
                  {['Identity', 'Skills', 'Portfolio'].map(slot => (
                    <div key={slot} style={{ border: `1px dashed ${T.lineStrong}`, borderRadius: 12, padding: '28px 18px', textAlign: 'center', color: C.slate, fontSize: 13 }}>
                      {slot}<br /><span style={{ fontSize: 12, opacity: 0.7 }}>Waiting for your program data</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {tab === 'resume' && (
            <FadeIn>
              <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '28px 28px', maxWidth: 640 }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>RESUME</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: C.ink, margin: '0 0 10px' }}>Build when you are ready</h2>
                <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>
                  Resume drafting, export, and review live here. We do not invent ATS scores or sample CVs as if they were yours.
                </p>
                <button style={{ background: C.ink, color: C.white, border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Start resume (coming with program access)</button>
              </div>
            </FadeIn>
          )}

          {tab === 'interview' && (
            <FadeIn>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {(['technical', 'hr', 'managerial'] as const).map(r => (
                  <button key={r} onClick={() => setInterviewRound(r)} style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${interviewRound === r ? C.ink : T.lineStrong}`, background: interviewRound === r ? C.ink : 'transparent', color: interviewRound === r ? C.white : C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{r}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="two-col">
                {interviewTopics[interviewRound].map((topic, i) => (
                  <div key={topic} style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 12, padding: '20px 22px' }}>
                    <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>TOPIC {String(i + 1).padStart(2, '0')}</div>
                    <div style={{ color: C.ink, fontSize: 15, fontWeight: 600 }}>{topic}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '28px' }}>
                {!mockStarted && !mockDone && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 8px' }}>Mock interview</h3>
                    <p style={{ color: C.slate, fontSize: 14, margin: '0 0 16px' }}>Practice five prompts. Feedback in this demo is illustrative — not a scored assessment of you.</p>
                    <button onClick={() => setMockStarted(true)} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 8, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Start practice</button>
                  </div>
                )}
                {mockStarted && !mockDone && (
                  <div>
                    <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>QUESTION {mockQ + 1} / {mockQuestions.length}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: C.ink, marginBottom: 16 }}>{mockQuestions[mockQ]}</div>
                    <textarea rows={4} placeholder="Draft an answer…" style={{ width: '100%', border: `1px solid ${T.lineStrong}`, borderRadius: 8, padding: 12, fontFamily: 'var(--font-body)', marginBottom: 12, boxSizing: 'border-box' }} />
                    <button onClick={() => { if (mockQ < mockQuestions.length - 1) setMockQ(q => q + 1); else setMockDone(true) }} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{mockQ < mockQuestions.length - 1 ? 'Next' : 'Finish practice'}</button>
                  </div>
                )}
                {mockDone && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 8px' }}>Practice complete</h3>
                    <p style={{ color: C.slate, fontSize: 14, margin: '0 0 16px' }}>Sample coaching note: structure answers with context, action, and result. This is not a personal score.</p>
                    <button onClick={() => { setMockDone(false); setMockStarted(false); setMockQ(0) }} style={{ background: C.ink, border: 'none', color: C.white, borderRadius: 8, padding: '11px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Practice again</button>
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {tab === 'jobs' && (
            <FadeIn>
              <div style={{ marginBottom: 16, color: C.slate, fontSize: 13 }}>{jobs.length} open roles in the board</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jobs.map(job => (
                  <div key={job.id} onClick={() => setDrawerJob(job)} style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 12, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(11,13,15,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.lineLight }}
                  >
                    <div>
                      <div style={{ color: C.ink, fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{job.role}</div>
                      <div style={{ color: C.slate, fontSize: 13, marginBottom: 8 }}>{job.company} · {job.location}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {job.skills.slice(0, 4).map(s => <span key={s} style={{ background: C.sand, borderRadius: 4, padding: '3px 8px', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: C.ink }}>{job.salary}</div>
                      <button onClick={e => { e.stopPropagation(); setApplyJob(job) }} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          {tab === 'tracker' && (
            <FadeIn>
              <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '40px 28px', textAlign: 'center' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>APPLICATIONS</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: C.ink, margin: '0 0 10px' }}>Nothing submitted yet</h3>
                <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 20px' }}>
                  Applications you send from the job board will appear here. We do not invent companies, stages, or timelines.
                </p>
                <button onClick={() => setTab('jobs')} style={{ background: C.ink, color: C.white, border: 'none', borderRadius: 8, padding: '11px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Open job board</button>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {drawerJob && !applyJob && <JobDrawer job={drawerJob} onClose={() => setDrawerJob(null)} onApply={() => setApplyJob(drawerJob)} />}
      {applyJob && <ApplyModal job={applyJob} onClose={() => { setApplyJob(null); setDrawerJob(null) }} />}
    </PageShell>
  )
}
