import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, JobDrawer, ApplyModal } from '../components/shared'
import { Section, Button, Eyebrow, CTABand, T, Heading, SectionHeader } from '../components/ui'
import { Aurora, GlassSurface, ContextualNavPanel, ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { jobs, programs } from '../data'
import type { Job } from '../data'
import { useDemoState } from '../demo/DemoStateContext'

const APPLY_STEPS = ['Profile', 'Resume', 'Screening', 'Review', 'Applied'] as const

const mockQuestions = [
  'Tell me about yourself and a project you are proud of.',
  'Describe how you would approach an unfamiliar dataset.',
  'How do you handle incomplete or inconsistent data?',
  'Walk through a project you would put on a portfolio.',
  'What would you want a hiring manager to know about how you work?',
]

const accent = getDomainAccent('career')
const careerPrograms = programs.filter(p => p.careerSupport)

const CAREER_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'profile', label: 'Profile & Resume', sub: 'Identity, skills, portfolio' },
  { id: 'interview', label: 'Interview Preparation', sub: 'Practice rounds & mocks' },
  { id: 'jobs', label: 'Job Board', sub: 'Open roles to apply' },
  { id: 'tracker', label: 'Applications', sub: 'Track submissions' },
  { id: 'career-support', label: 'Career Support', sub: 'Workflow & guidance' },
]

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function CareerHeroVisual() {
  const sampleJob = jobs[0]

  return (
    <div className="career-hero-visual" style={{ position: 'relative', minHeight: 400 }}>
      <GlassSurface level={2} padding="20px 22px" style={{ position: 'relative', zIndex: 2 }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Career OS workspace</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 14, padding: '14px 0', borderBottom: `1px solid ${T.lineDark}`, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: accent.subtle, border: `1px solid ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>
              —
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>PROFILE</div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>Your professional profile</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Identity · Skills · Portfolio</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 14, padding: '14px 0', borderBottom: `1px solid ${T.lineDark}`, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px dashed ${T.lineDarkStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
              PRJ
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>PROOF</div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>Program projects</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Portfolio links from coursework</div>
            </div>
          </div>

          {sampleJob && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '14px 0', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 4 }}>OPPORTUNITY</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{sampleJob.role}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{sampleJob.company} · {sampleJob.mode}</div>
              </div>
              <div style={{ background: accent.primary, color: C.white, borderRadius: 6, padding: '8px 14px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                Apply
              </div>
            </div>
          )}
        </div>
      </GlassSurface>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-8% -6%',
          border: `1px dashed ${accent.border}`,
          borderRadius: T.rCard,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  )
}

// ─── CAREER JOURNEY ───────────────────────────────────────────────────────────

function CareerJourneySection() {
  const steps = [
    { num: '01', label: 'Profile', desc: 'Structured professional identity' },
    { num: '02', label: 'Proof', desc: 'Projects and program work' },
    { num: '03', label: 'Application', desc: 'Submit from the job board' },
    { num: '04', label: 'Interview', desc: 'Prep rounds and mocks' },
    { num: '05', label: 'Outcome', desc: 'Offers and placement status' },
  ]

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Career journey"
          title="Profile to outcome — one workflow."
          lead="Career OS connects your program work to a structured job-search process. Each step builds on the last."
        />
      </FadeIn>

      <div className="career-journey" style={{ marginTop: 48, position: 'relative' }}>
        <div
          aria-hidden
          className="career-journey-line"
          style={{
            position: 'absolute',
            top: 18,
            left: '3%',
            right: '3%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, ${accent.border}, transparent)`,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
          {steps.map((step, i) => (
            <FadeIn key={step.label} delay={i * 40}>
              <div style={{ padding: '0 10px 0 0' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: accent.subtle,
                    border: `1px solid ${accent.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: accent.text,
                    marginBottom: 14,
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 1.4vw, 17px)', fontWeight: 600, color: C.white, margin: '0 0 5px' }}>
                  {step.label}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── PROFILE + RESUME ─────────────────────────────────────────────────────────

function ProfileResumeSection() {
  const profileSlots = ['Identity', 'Skills', 'Portfolio']

  return (
    <Section id="profile" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">Profile + Resume</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Your career identity, built from program work.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 480 }}>
            After a Professional Program, this space holds identity, skills from coursework, and portfolio links. Resume drafting and export live here — scores appear only when you have one.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
            {profileSlots.map((slot, i) => (
              <div
                key={slot}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 16,
                  padding: '16px 0',
                  borderBottom: i < profileSlots.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{slot}</span>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.55 }}>Waiting for your program data</span>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>Resume</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 16px' }}>
              Build and export a resume when you are ready. We do not invent ATS scores or sample CVs as if they were yours.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'var(--font-mono)', margin: 0 }}>
              Available with Professional Program access
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <GlassSurface level={2} padding="24px 26px">
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Career profile</div>
            <div style={{ borderBottom: `1px solid ${T.lineDark}`, paddingBottom: 18, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: accent.subtle, border: `1px solid ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, color: accent.text }}>
                  —
                </div>
                <div>
                  <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>Your name</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>Program · Outcome</div>
                </div>
              </div>
            </div>
            {profileSlots.map((slot, i) => (
              <div
                key={slot}
                style={{
                  padding: '12px 0',
                  borderBottom: i < profileSlots.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                }}
              >
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>{slot.toUpperCase()}</div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', width: '100%' }} />
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 6 }}>Empty until program completion</div>
              </div>
            ))}
          </GlassSurface>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── INTERVIEW PREPARATION ────────────────────────────────────────────────────

function InterviewPrepSection({
  interviewRound,
  setInterviewRound,
  mockQ,
  setMockQ,
  mockStarted,
  setMockStarted,
  mockDone,
  setMockDone,
}: {
  interviewRound: 'technical' | 'hr' | 'managerial'
  setInterviewRound: (r: 'technical' | 'hr' | 'managerial') => void
  mockQ: number
  setMockQ: (fn: (q: number) => number) => void
  mockStarted: boolean
  setMockStarted: (v: boolean) => void
  mockDone: boolean
  setMockDone: (v: boolean) => void
}) {
  const interviewTopics: Record<'technical' | 'hr' | 'managerial', string[]> = {
    technical: ['SQL and database querying', 'Python for analysis', 'Statistical concepts', 'Dashboarding (Power BI / Tableau)', 'System and problem walkthroughs'],
    hr: ['Tell me about yourself', 'Strengths and working style', 'Why this role?', 'Situational behaviour', 'Compensation conversations'],
    managerial: ['Prioritisation', 'Stakeholder communication', 'Conflict on a team', 'Planning under ambiguity', 'Decision quality'],
  }

  return (
    <Section id="interview" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Interview preparation"
          title="Practice before the real round."
          lead="Technical, HR, and managerial rounds with practice prompts. Mock interviews help you structure answers — feedback in this demo is illustrative, not a scored assessment."
        />
      </FadeIn>

      <div style={{ marginTop: 36, display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {(['technical', 'hr', 'managerial'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setInterviewRound(r)}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: `1px solid ${interviewRound === r ? accent.border : T.lineDark}`,
              background: interviewRound === r ? accent.subtle : 'transparent',
              color: interviewRound === r ? accent.text : 'rgba(255,255,255,0.45)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              textTransform: 'capitalize',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>
            {interviewRound} round topics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {interviewTopics[interviewRound].map((topic, i) => (
              <div
                key={topic}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < interviewTopics[interviewRound].length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.55 }}>{topic}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <GlassSurface level={2} padding="24px 26px">
            {!mockStarted && !mockDone && (
              <div>
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Mock interview</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: C.white, margin: '0 0 10px' }}>Five practice prompts</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 18px' }}>
                  Practice five prompts. Feedback in this demo is illustrative — not a scored assessment of you.
                </p>
                <Button variant="primary" onClick={() => setMockStarted(true)}>Start practice</Button>
              </div>
            )}
            {mockStarted && !mockDone && (
              <div>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>
                  Question {mockQ + 1} / {mockQuestions.length}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: C.white, marginBottom: 16, lineHeight: 1.35 }}>
                  {mockQuestions[mockQ]}
                </div>
                <textarea
                  rows={4}
                  placeholder="Draft an answer…"
                  style={{
                    width: '100%',
                    border: `1px solid ${T.lineDark}`,
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: 'var(--font-body)',
                    marginBottom: 14,
                    boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.03)',
                    color: C.white,
                    resize: 'vertical',
                  }}
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    if (mockQ < mockQuestions.length - 1) setMockQ(q => q + 1)
                    else setMockDone(true)
                  }}
                >
                  {mockQ < mockQuestions.length - 1 ? 'Next' : 'Finish practice'}
                </Button>
              </div>
            )}
            {mockDone && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: C.white, margin: '0 0 10px' }}>Practice complete</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 18px' }}>
                  Sample coaching note: structure answers with context, action, and result. This is not a personal score.
                </p>
                <Button variant="secondary" onClick={() => { setMockDone(false); setMockStarted(false); setMockQ(() => 0) }}>
                  Practice again
                </Button>
              </div>
            )}
          </GlassSurface>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── JOB BOARD ────────────────────────────────────────────────────────────────

function JobBoardSection({
  onInspect,
  onApply,
  hasApplied,
}: {
  onInspect: (job: Job) => void
  onApply: (job: Job) => void
  hasApplied: (jobId: string) => boolean
}) {
  return (
    <Section id="jobs" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Job board"
          title="Open roles you can inspect and apply to."
          lead={`${jobs.length} open roles in the board. Click a role to view details, or apply directly.`}
        />
      </FadeIn>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.5fr auto',
            gap: 16,
            padding: '10px 0 14px',
            borderBottom: `1px solid ${T.lineDark}`,
          }}
          className="career-job-header"
        >
          {['Role', 'Company', 'Location / Mode', 'Experience', ''].map(col => (
            <div key={col} className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)' }}>{col}</div>
          ))}
        </div>

        {jobs.map((job, i) => (
          <FadeIn key={job.id} delay={i * 30}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onInspect(job)}
              onKeyDown={e => { if (e.key === 'Enter') onInspect(job) }}
              className="career-job-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.5fr auto',
                gap: 16,
                padding: '18px 0',
                borderBottom: `1px solid ${T.lineDark}`,
                cursor: 'pointer',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: C.white, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{job.role}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{job.company}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{job.location}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{job.exp}</div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); if (!hasApplied(job.id)) onApply(job) }}
                disabled={hasApplied(job.id)}
                style={{
                  flexShrink: 0,
                  background: hasApplied(job.id) ? accent.subtle : accent.primary,
                  border: hasApplied(job.id) ? `1px solid ${accent.border}` : 'none',
                  color: hasApplied(job.id) ? accent.text : C.white,
                  borderRadius: T.rControl,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: hasApplied(job.id) ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {hasApplied(job.id) ? 'Applied' : 'Apply'}
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── APPLICATION TRACKING ─────────────────────────────────────────────────────

function ApplicationTrackingSection() {
  const demo = useDemoState()
  const scrollToJobs = () => {
    const el = document.getElementById('jobs')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (T.navH + 16), behavior: 'smooth' })
  }

  return (
    <Section id="tracker" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">Application tracking</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            {demo.applications.length === 0 ? 'Nothing submitted yet — by design.' : 'Your demo applications.'}
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 480 }}>
            {demo.applications.length === 0
              ? 'Applications you send from the job board will appear here. We do not invent companies, stages, or timelines.'
              : 'Local demo records only — status stays at Applied until a real backend exists.'}
          </p>

          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Application flow</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 28 }}>
            {APPLY_STEPS.map((s, i, arr) => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>{s}</span>
                {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
              </span>
            ))}
          </div>

          <Button variant="primary" onClick={scrollToJobs}>Open job board</Button>
        </FadeIn>

        <FadeIn delay={80}>
          <GlassSurface level={2} padding="24px 26px">
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 18 }}>Applications</div>
            {demo.applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>TRACKER</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: C.white, margin: '0 0 10px' }}>No applications yet</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 280 }}>
                Apply from the job board above. Your submissions will be tracked here.
              </p>
            </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {demo.applications.map((app, i) => (
                  <div key={app.jobId} style={{
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
                    padding: '12px 0', borderBottom: i < demo.applications.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  }}>
                    <div>
                      <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{app.role}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{app.company}</div>
                    </div>
                    <span style={{ color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
              <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Apply flow steps</div>
              {APPLY_STEPS.map((step, i) => (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < APPLY_STEPS.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${T.lineDark}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.35)',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{step}</span>
                </div>
              ))}
            </div>
          </GlassSurface>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── CAREER SUPPORT ─────────────────────────────────────────────────────────────

function CareerSupportSection() {
  const support = [
    { label: 'Profile review', desc: 'Structured professional profile fed by program work' },
    { label: 'Resume build', desc: 'Draft and export when you have program access' },
    { label: 'Interview prep', desc: 'Technical, HR, and managerial practice rounds' },
    { label: 'Mock interviews', desc: 'Practice prompts with illustrative coaching notes' },
    { label: 'Job board', desc: 'Open roles you can inspect and apply to' },
    { label: 'Application tracking', desc: 'Monitor submissions you send from the board' },
  ]

  return (
    <Section id="career-support" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Career support"
          title="Support built into the workflow."
          lead="Career OS is layered on Professional Programs. Recommended actions become personal after you enroll and complete a program."
        />
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {support.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: 'clamp(20px,4vw,40px)',
                padding: '18px 0',
                borderBottom: i < support.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                alignItems: 'start',
              }}
              className="career-support-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white }}>{item.label}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.55 }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── ECOSYSTEM CONNECTION ─────────────────────────────────────────────────────

function EcosystemSection() {
  const navigate = useNavigate()
  const chain = [
    { label: 'Learning', desc: 'Professional Program curriculum', to: '/programs' },
    { label: 'Projects', desc: 'Portfolio work from coursework', to: '/programs' },
    { label: 'Proof', desc: 'Certificates and project artifacts', to: '/skills' },
    { label: 'Career Profile', desc: 'Identity, skills, portfolio', to: '/career-os' },
    { label: 'Jobs', desc: 'Curated job board', to: '/career-os#jobs' },
    { label: 'Applications', desc: 'Apply and submit', to: '/career-os#jobs' },
    { label: 'Interviews', desc: 'Preparation and practice', to: '/career-os#interview' },
  ]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="How the system connects"
          title="What happens after learning."
          lead="Program work becomes proof. Career OS picks up at profile, applications, interviews, and outcomes."
        />
      </FadeIn>

      <div className="career-ecosystem" style={{ marginTop: 44, position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 14,
            left: '2%',
            right: '2%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, ${accent.border}, transparent)`,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {chain.map((item, i) => (
            <FadeIn key={item.label} delay={i * 35}>
              <button
                type="button"
                onClick={() => navigate(item.to)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '0 8px 0 0',
                  width: '100%',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent.text, marginBottom: 12 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 1.3vw, 16px)', fontWeight: 600, color: C.white, marginBottom: 5 }}>
                  {item.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      {careerPrograms.length > 0 && (
        <FadeIn delay={80}>
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${T.lineDark}` }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>
              Unlocks with Professional Programs
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
              {careerPrograms.map(p => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => navigate(`/programs/${p.slug}`)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'var(--font-body)' }}
                >
                  {p.name} →
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CareerOSPage() {
  const navigate = useNavigate()
  const demo = useDemoState()
  const [interviewRound, setInterviewRound] = useState<'technical' | 'hr' | 'managerial'>('technical')
  const [mockQ, setMockQ] = useState(0)
  const [mockStarted, setMockStarted] = useState(false)
  const [mockDone, setMockDone] = useState(false)
  const [drawerJob, setDrawerJob] = useState<Job | null>(null)
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const activeSection = useSectionSpy(CAREER_NAV_ITEMS.map(i => i.id))

  return (
    <PageShell auroraTheme="career">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="career" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' }} className="two-col skylent-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>Career OS</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                Your career,<br />as a product.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 28px' }}>
                Interview prep and a job board in one workspace. Unlocks after a Professional Program. Personal scores stay empty until they are yours.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Professional Programs</Button>
                <Button variant="secondary" size="lg" onClick={() => { const el = document.getElementById('jobs'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>
                  Browse Jobs
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ContextualNavPanel
                  items={CAREER_NAV_ITEMS}
                  themeId="career"
                  title="Career OS"
                  activeId={activeSection}
                />
                <div className="career-hero-visual-wrap">
                  <CareerHeroVisual />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <ContextualNavBar items={CAREER_NAV_ITEMS} themeId="career" activeId={activeSection} />

      <CareerJourneySection />
      <ProfileResumeSection />
      <InterviewPrepSection
        interviewRound={interviewRound}
        setInterviewRound={setInterviewRound}
        mockQ={mockQ}
        setMockQ={setMockQ}
        mockStarted={mockStarted}
        setMockStarted={setMockStarted}
        mockDone={mockDone}
        setMockDone={setMockDone}
      />
      <JobBoardSection
        onInspect={setDrawerJob}
        onApply={setApplyJob}
        hasApplied={demo.hasApplied}
      />
      <ApplicationTrackingSection />
      <CareerSupportSection />
      <EcosystemSection />

      <CTABand
        eyebrow="Get started"
        title={<>Learning is the start.<br />Career OS is what comes next.</>}
        lead="Complete a Professional Program to unlock Career OS — profile, interview prep, job board, and application tracking."
        primary={{ label: 'Explore Professional Programs', to: '/programs' }}
        secondary={{ label: 'See Skills', to: '/skills' }}
        auroraTheme="career"
      />

      {drawerJob && !applyJob && (
        <JobDrawer job={drawerJob} onClose={() => setDrawerJob(null)} onApply={() => setApplyJob(drawerJob)} />
      )}
      {applyJob && (
        <ApplyModal job={applyJob} onClose={() => { setApplyJob(null); setDrawerJob(null) }} />
      )}
    </PageShell>
  )
}
