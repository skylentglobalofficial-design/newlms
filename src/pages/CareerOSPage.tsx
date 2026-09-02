import { useState } from 'react'
import { C, FadeIn, PageShell, JobDrawer, ApplyModal } from '../components/shared'
import { GridField, Glow, Badge, FlowStrip } from '../components/ui'
import { jobs } from '../data'
import type { Job } from '../data'

type OSTab = 'dashboard' | 'resume' | 'interview' | 'mock' | 'jobs' | 'tracker'

const readinessItems = [
  { label: 'Resume', pct: 85, color: '#16a34a' },
  { label: 'Portfolio', pct: 70, color: C.orange },
  { label: 'Interview', pct: 62, color: C.orange },
  { label: 'Profile', pct: 90, color: '#16a34a' },
  { label: 'Overall', pct: 72, color: C.orange },
]

const mockQuestions = [
  'Tell me about yourself and your experience with data analytics.',
  'Describe a time you turned raw data into a business decision.',
  'How do you handle missing or inconsistent data in a dataset?',
  'Walk me through a project where you used Python for data analysis.',
  'Where do you see yourself in 3 years in the data domain?',
]

const applications = [
  { role: 'Data Analyst', company: 'Infosys BPM', stage: 'Interview', days: 3 },
  { role: 'Business Analyst', company: 'Capgemini', stage: 'Shortlisted', days: 7 },
  { role: 'Jr. Data Scientist', company: 'Mu Sigma', stage: 'Screening', days: 12 },
  { role: 'Analyst – Risk', company: 'HDFC Bank', stage: 'Applied', days: 15 },
]

const stageColors: Record<string, string> = {
  Applied: '#64748b', Screening: '#d97706', Shortlisted: '#2563eb', Interview: '#7c3aed', Selected: '#16a34a', Rejected: '#dc2626',
}

function ProgressRing({ pct, size = 80, stroke = 7, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(11,13,15,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fill={C.ink} fontSize={size * 0.22} fontFamily="var(--font-mono)" fontWeight="700">{pct}%</text>
    </svg>
  )
}

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
    { id: 'resume', label: 'Resume' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'mock', label: 'Mock Interview' },
    { id: 'jobs', label: 'Job Board' },
    { id: 'tracker', label: 'Application Tracker' },
  ]

  const interviewTopics: Record<'technical' | 'hr' | 'managerial', string[]> = {
    technical: ['SQL and database querying', 'Python for data analysis', 'Statistical concepts & probability', 'Machine learning fundamentals', 'Power BI / Tableau dashboards'],
    hr: ['Tell me about yourself', 'Strengths and weaknesses', 'Why this company?', 'Situational behaviour questions', 'Salary expectations'],
    managerial: ['Leadership and team dynamics', 'Conflict resolution', 'Project planning and prioritization', 'Stakeholder communication', 'Decision making under ambiguity'],
  }

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '96px 32px 0', position: 'relative', overflow: 'hidden' }}>
        <GridField />
        <Glow x="86%" y="10%" size={560} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <FadeIn>
            <div style={{ marginBottom: 22 }}><Badge tone="dark" accent>Pillar 03 — Career OS</Badge></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.6vw, 76px)', fontWeight: 600, color: C.white, letterSpacing: '-0.035em', lineHeight: 0.98, margin: '0 0 22px' }}>
              Your career,<br /><span style={{ color: C.orange }}>operating system.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.72, maxWidth: 540, margin: '0 0 34px' }}>Interview preparation and a curated job board, working as one product. Career OS unlocks the moment you complete a Professional Program.</p>
          </FadeIn>
          {/* Unlock journey */}
          <FadeIn delay={120}>
            <div style={{ maxWidth: 760, marginBottom: 44 }}>
              <FlowStrip tone="dark" steps={[
                { label: 'Professional Program', sub: 'Complete' },
                { label: 'Access Granted', sub: 'Automatic', highlight: true },
                { label: 'Career OS', sub: 'Interview + Job Board' },
              ]} />
            </div>
          </FadeIn>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.warmWhite : 'transparent', border: 'none', borderRadius: '8px 8px 0 0', padding: '11px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', color: tab === t.id ? C.ink : 'rgba(255,255,255,0.45)', fontWeight: tab === t.id ? 600 : 400, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{t.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Content area */}
      <section style={{ background: C.warmWhite, padding: '48px 32px 80px', minHeight: 600 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }} className="two-col">
                {/* Overall readiness */}
                <div style={{ background: C.white, borderRadius: 16, padding: 32, border: '1px solid rgba(11,13,15,0.08)' }}>
                  <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>CAREER READINESS SCORE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <ProgressRing pct={72} size={100} stroke={9} color={C.orange} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 6 }}>You are 72% ready.</div>
                      <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.6 }}>Complete 2 mock interviews and finish your portfolio to increase your score.</div>
                    </div>
                  </div>
                </div>
                {/* Breakdown */}
                <div style={{ background: C.white, borderRadius: 16, padding: 32, border: '1px solid rgba(11,13,15,0.08)' }}>
                  <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>READINESS BREAKDOWN</div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    {readinessItems.filter(r => r.label !== 'Overall').map(r => (
                      <div key={r.label} style={{ textAlign: 'center' }}>
                        <ProgressRing pct={r.pct} size={64} stroke={6} color={r.color} />
                        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 6 }}>{r.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Next actions */}
              <div style={{ background: C.white, borderRadius: 16, padding: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>RECOMMENDED NEXT ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
                  {[
                    { action: 'Complete 2 mock interviews', tab: 'mock' as OSTab, urgency: 'High' },
                    { action: 'Finish your portfolio projects section', tab: 'resume' as OSTab, urgency: 'Medium' },
                    { action: 'Practice HR interview questions', tab: 'interview' as OSTab, urgency: 'Medium' },
                  ].map(a => (
                    <div key={a.action} onClick={() => setTab(a.tab)} style={{ background: C.sand, borderRadius: 10, padding: 18, cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = C.orange)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <div style={{ background: a.urgency === 'High' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)', color: a.urgency === 'High' ? '#dc2626' : '#d97706', fontSize: 9, fontFamily: 'var(--font-mono)', display: 'inline-block', borderRadius: 4, padding: '2px 8px', marginBottom: 8 }}>{a.urgency.toUpperCase()}</div>
                      <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.45 }}>{a.action}</div>
                      <div style={{ color: C.orange, fontSize: 12, marginTop: 8, fontWeight: 600 }}>Start →</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* RESUME */}
          {tab === 'resume' && (
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }} className="two-col">
                <div style={{ background: C.white, borderRadius: 16, padding: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                  <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>YOUR RESUME</div>
                  <div style={{ background: C.sand, borderRadius: 10, padding: '28px 24px', marginBottom: 16, minHeight: 200 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 2 }}>Arjun Sharma</div>
                    <div style={{ color: C.slate, fontSize: 13, marginBottom: 16 }}>Data Analyst · Bengaluru · arjun@email.com</div>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {['Python', 'SQL', 'Power BI', 'Excel', 'Data Visualisation'].map(s => <span key={s} style={{ background: C.white, borderRadius: 4, padding: '4px 10px', fontSize: 12, color: C.ink, fontFamily: 'var(--font-mono)' }}>{s}</span>)}
                    </div>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>SKYLENT PROGRAM</div>
                    <div style={{ color: C.ink, fontSize: 13 }}>Data Science & AI · 72% complete</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ flex: 1, background: C.orange, border: 'none', color: C.white, borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Download PDF</button>
                    <button style={{ flex: 1, background: C.sand, border: 'none', color: C.ink, borderRadius: 8, padding: '11px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Edit Resume</button>
                  </div>
                </div>
                <div>
                  <div style={{ background: C.white, borderRadius: 16, padding: 24, border: '1px solid rgba(11,13,15,0.08)', marginBottom: 20 }}>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>ATS SCORE</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <ProgressRing pct={85} size={72} stroke={7} color="#16a34a" />
                      <div>
                        <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Resume is ATS-ready</div>
                        <div style={{ color: C.slate, fontSize: 13 }}>Add 2 more keywords to improve to 95%</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: C.white, borderRadius: 16, padding: 24, border: '1px solid rgba(11,13,15,0.08)' }}>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>PORTFOLIO PROJECTS</div>
                    {['Sales Dashboard (Power BI)', 'Customer Churn Analysis (Python)', 'HR Analytics Report'].map((p, i) => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(11,13,15,0.06)' : 'none' }}>
                        <span style={{ color: C.ink, fontSize: 13 }}>{p}</span>
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontFamily: 'var(--font-mono)', borderRadius: 4, padding: '2px 8px' }}>LIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* INTERVIEW PREP */}
          {tab === 'interview' && (
            <FadeIn>
              <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                {(['technical', 'hr', 'managerial'] as const).map(r => (
                  <button key={r} onClick={() => setInterviewRound(r)} style={{ padding: '9px 22px', borderRadius: 8, border: `1px solid ${interviewRound === r ? C.ink : 'rgba(11,13,15,0.15)'}`, background: interviewRound === r ? C.ink : 'transparent', color: interviewRound === r ? C.white : C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s', textTransform: 'capitalize' }}>{r} Round</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="two-col">
                {interviewTopics[interviewRound].map((topic, i) => (
                  <div key={topic} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: '20px 22px' }}>
                    <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>TOPIC {String(i + 1).padStart(2, '0')}</div>
                    <div style={{ color: C.ink, fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{topic}</div>
                    <button style={{ color: C.orange, background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 12, padding: 0, fontWeight: 600, fontFamily: 'var(--font-body)' }}>Practice questions →</button>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          {/* MOCK INTERVIEW */}
          {tab === 'mock' && (
            <FadeIn>
              {!mockStarted && !mockDone && (
                <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
                    <span style={{ color: C.white, fontFamily: 'var(--font-mono)', fontSize: 20 }}>AI</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 12px' }}>AI Mock Interview</h2>
                  <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.75, margin: '0 0 28px' }}>5 questions. 20 minutes. Get instant feedback on your responses.</p>
                  <button onClick={() => setMockStarted(true)} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 10, padding: '14px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Start Mock Interview →</button>
                </div>
              )}
              {mockStarted && !mockDone && (
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
                    {mockQuestions.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= mockQ ? C.orange : 'rgba(11,13,15,0.1)', transition: 'background 0.3s' }} />)}
                  </div>
                  <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>QUESTION {mockQ + 1} OF {mockQuestions.length}</div>
                  <div style={{ background: C.white, borderRadius: 16, padding: 32, border: '1px solid rgba(11,13,15,0.08)', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{mockQuestions[mockQ]}</div>
                  </div>
                  <textarea rows={5} placeholder="Type your answer here..." style={{ width: '100%', background: C.white, border: '1px solid rgba(11,13,15,0.12)', borderRadius: 10, padding: '16px', fontSize: 14, color: C.ink, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }}
                    onFocus={e => (e.target.style.borderColor = C.orange)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(11,13,15,0.12)')}
                  />
                  <button onClick={() => { if (mockQ < mockQuestions.length - 1) setMockQ(q => q + 1); else setMockDone(true) }} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 8, padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{mockQ < mockQuestions.length - 1 ? 'Next Question →' : 'Submit Interview →'}</button>
                </div>
              )}
              {mockDone && (
                <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #ff9a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24, color: 'white' }}>✓</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.ink, margin: '0 0 12px' }}>Interview Complete</h2>
                  <p style={{ color: C.slate, fontSize: 15, margin: '0 0 24px' }}>Demo feedback: Strong domain knowledge. Improve structuring of answers using STAR method. Communication score: 78%.</p>
                  <button onClick={() => { setMockDone(false); setMockStarted(false); setMockQ(0) }} style={{ background: C.ink, border: 'none', color: C.white, borderRadius: 8, padding: '13px 28px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try Again</button>
                </div>
              )}
            </FadeIn>
          )}

          {/* JOBS */}
          {tab === 'jobs' && (
            <FadeIn>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jobs.map(job => (
                  <div key={job.id} onClick={() => setDrawerJob(job)} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.09)', borderRadius: 12, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(11,13,15,0.08)'; e.currentTarget.style.borderColor = 'rgba(11,13,15,0.18)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(11,13,15,0.09)' }}
                  >
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ color: C.ink, fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{job.role}</div>
                      <div style={{ color: C.slate, fontSize: 13, marginBottom: 8 }}>{job.company} · {job.location}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {job.skills.slice(0, 4).map(s => <span key={s} style={{ background: C.sand, borderRadius: 4, padding: '3px 8px', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: C.ink }}>{job.salary}</div>
                      <button onClick={e => { e.stopPropagation(); setApplyJob(job) }} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Apply Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          {/* TRACKER */}
          {tab === 'tracker' && (
            <FadeIn>
              <div style={{ background: C.white, borderRadius: 16, padding: 28, border: '1px solid rgba(11,13,15,0.08)' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>APPLICATION TRACKER</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Role', 'Company', 'Stage', 'Days Ago', 'Action'].map(h => (
                          <th key={h} style={{ textAlign: 'left', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', padding: '0 16px 12px 0', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((a, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(11,13,15,0.06)' }}>
                          <td style={{ padding: '14px 16px 14px 0', color: C.ink, fontSize: 14, fontWeight: 500 }}>{a.role}</td>
                          <td style={{ padding: '14px 16px 14px 0', color: C.slate, fontSize: 14 }}>{a.company}</td>
                          <td style={{ padding: '14px 16px 14px 0' }}>
                            <span style={{ background: `${stageColors[a.stage]}18`, color: stageColors[a.stage], fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 5, padding: '3px 10px' }}>{a.stage.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '14px 16px 14px 0', color: C.slate, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{a.days}d ago</td>
                          <td style={{ padding: '14px 0' }}>
                            <button style={{ color: C.orange, background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' }}>View →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
