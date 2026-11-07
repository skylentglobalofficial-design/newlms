import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C } from '../tokens'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { useAuth } from '../context/AuthContext'
import {
  closeEmployerJob,
  createEmployerJob,
  listEmployerJobApplications,
  listEmployerJobs,
  publishEmployerJob,
  updateEmployerJob,
  type EmployerSummary,
  type JobListing,
  type SharedJobApplication,
} from '../lib/career-api'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'jobs', label: 'Jobs & Postings', short: 'Jobs' },
  { id: 'applications', label: 'Candidate Applications', short: 'Apps' },
  { id: 'verify', label: 'Verify Dossiers (/verify)', short: 'Verify' },
]

const panelStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderTop: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: '20px 24px',
  boxShadow: '0 10px 28px -12px rgba(15, 23, 42, 0.08)',
} as const

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5,
}

type JobDraft = {
  title: string
  description: string
  location: string
  workMode: '' | 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE'
  employmentType: '' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'OTHER'
  applicationUrl: string
  employerId: string
}

const emptyDraft = (): JobDraft => ({
  title: '',
  description: '',
  location: '',
  workMode: '',
  employmentType: '',
  applicationUrl: '',
  employerId: '',
})

function draftFromJob(job: JobListing): JobDraft {
  return {
    title: job.title,
    description: job.description,
    location: job.location ?? '',
    workMode: job.workMode ?? '',
    employmentType: job.employmentType ?? '',
    applicationUrl: job.applicationUrl ?? '',
    employerId: job.employerId,
  }
}

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }
  if (id === 'jobs') return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}

export default function DashboardRecruiterPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('jobs')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [linked, setLinked] = useState(false)
  const [employers, setEmployers] = useState<EmployerSummary[]>([])
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<JobDraft>(emptyDraft)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applications, setApplications] = useState<SharedJobApplication[]>([])
  const [applicationsStatus, setApplicationsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [applicationsAttempt, setApplicationsAttempt] = useState(0)
  const [verifyCodeInput, setVerifyCodeInput] = useState('SKL-2026-DA-EXEMPLAR')

  async function load() {
    setStatus('loading')
    setMessage(null)
    try {
      const board = await listEmployerJobs()
      setLinked(board.linked)
      setEmployers(board.employers)
      setJobs(board.jobs)
      setDraft((current) => ({
        ...current,
        employerId: current.employerId || (board.employers.length === 1 ? board.employers[0].id : ''),
      }))
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Jobs could not be loaded.')
    }
  }

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (ready && user) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id])

  useEffect(() => {
    if (!selectedId) {
      setApplications([])
      setApplicationsStatus('idle')
      return
    }
    let cancelled = false
    setApplicationsStatus('loading')
    void listEmployerJobApplications(selectedId)
      .then((rows) => {
        if (!cancelled) {
          setApplications(rows)
          setApplicationsStatus('ready')
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setApplicationsStatus('error')
          setMessage(error instanceof Error ? error.message : 'Applications could not be loaded.')
        }
      })
    return () => { cancelled = true }
  }, [selectedId, applicationsAttempt])

  if (!ready || !user) return null

  const selected = jobs.find((job) => job.id === selectedId) ?? null
  const openCount = jobs.filter((job) => job.status === 'OPEN').length

  function payloadFromDraft() {
    return {
      title: draft.title.trim(),
      description: draft.description.trim(),
      location: draft.location.trim() || null,
      workMode: draft.workMode || null,
      employmentType: draft.employmentType || null,
      applicationUrl: draft.applicationUrl.trim() || null,
      ...(employers.length > 1 ? { employerId: draft.employerId } : {}),
    }
  }

  async function saveJob(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const saved = editing && selected
        ? await updateEmployerJob(selected.id, payloadFromDraft())
        : await createEmployerJob(payloadFromDraft())
      setJobs((current) => {
        const next = current.filter((job) => job.id !== saved.id)
        return [saved, ...next]
      })
      setSelectedId(saved.id)
      setEditing(false)
      setDraft(emptyDraft())
      if (employers.length === 1) setDraft((current) => ({ ...current, employerId: employers[0].id }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The job could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function setPublished(job: JobListing, publish: boolean) {
    setMessage(null)
    try {
      const updated = publish ? await publishEmployerJob(job.id) : await closeEmployerJob(job.id)
      setJobs((current) => current.map((row) => (row.id === updated.id ? updated : row)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The job status could not be changed.')
    }
  }

  return (
    <AuthDashboardShell
      themeId="career"
      workspaceLabel="Recruiter"
      roleLabel="Recruiter"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div className="recruiter-workspace" style={{ display: 'grid', gap: 20 }}>
        {/* Multi-Tab Switcher Bar */}
        <div
          role="tablist"
          aria-label="Recruiter Workspace Tabs"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 14,
            background: '#f6f4ff',
            border: '1px solid #ddd6fe',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveNav(item.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid #5142b5' : '1px solid #cbd5e1',
                  background: active ? '#5142b5' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <section style={{
          background: 'linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)',
          border: '1px solid rgba(196, 184, 255, 0.42)',
          borderRadius: 18,
          padding: '26px 28px',
          color: '#ffffff',
          boxShadow: '0 18px 40px -14px rgba(59, 45, 150, 0.35)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 8px', color: '#e9d5ff', font: '700 11px/1.4 var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                RECRUITER TALENT TERMINAL · 15-MIN ROLE MICRO-AUDITIONS &amp; FLIGHT RECORDER VERIFIER
              </p>
              <h1 className="skylent-display-sm" style={{ color: '#ffffff', margin: '0 0 8px' }}>
                {employers.length > 0 ? employers.map((employer) => employer.name).join(', ') : 'Employer workspace'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14.5, lineHeight: 1.6, margin: 0, maxWidth: 680 }}>
                {linked
                  ? `${jobs.length} ${jobs.length === 1 ? 'posting' : 'postings'} · ${openCount} open in the learner job board`
                  : 'Inspect verified candidate Proof-of-Work Dossiers immediately or link your account to an Employer profile to publish jobs.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveNav('verify')}
                style={{
                  background: '#ffffff',
                  color: '#5142b5',
                  border: '1px solid #ffffff',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
                }}
              >
                Verify Candidate Dossier →
              </button>
              <Link
                to="/dashboard/admin"
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.34)',
                  padding: '10px 16px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                Link Employer in Admin OS →
              </Link>
            </div>
          </div>
        </section>

        {message ? <p className="os-error" role="alert">{message}</p> : null}
        {status === 'loading' ? <p style={{ color: C.slate }}>Loading employer jobs…</p> : null}
        {status === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}

        {status === 'ready' && !linked && activeNav !== 'verify' ? (
          <div style={panelStyle}>
            <span style={{ display: "inline-block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              EMPLOYER LINKING GUIDE · 2-CLICK SETUP
            </span>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>Link an Employer Profile to Post Jobs</h2>
            <p style={{ color: '#475569', margin: '0 0 14px', lineHeight: 1.6, fontSize: 13.5 }}>
              To publish jobs to the Career OS board, open <strong>Admin OS → Employers &amp; Hiring</strong>, create an Employer profile, and link your user UUID (<code>{user.id}</code>). Meanwhile, you can verify any candidate&apos;s Proof-of-Work Dossier below!
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/dashboard/admin" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5', textDecoration: 'none', fontWeight: 700 }}>
                Open Admin Employer Linker →
              </Link>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => setActiveNav('verify')}>
                Open Candidate Dossier Verifier →
              </button>
            </div>
          </div>
        ) : null}

        {status === 'ready' && linked && activeNav === 'jobs' ? (
          <section id="rec-jobs" style={{ display: 'grid', gap: 16 }}>
            <div style={panelStyle}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                ACTIVE JOB POSTINGS ({jobs.length})
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '2px 0 12px' }}>Jobs</h2>
              {jobs.length === 0 ? (
                <p style={{ color: C.slate, margin: 0 }}>No jobs posted for this employer yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                  {jobs.map((job) => (
                    <li key={job.id} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ color: C.ink, fontSize: 15 }}>{job.title}</strong>
                        <span style={{ color: '#5142b5', fontSize: 12, fontWeight: 700 }}>{job.status}</span>
                      </div>
                      <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>
                        {job.company}{job.location ? ` · ${job.location}` : ''}{job.workMode ? ` · ${job.workMode}` : ''}{job.employmentType ? ` · ${job.employmentType}` : ''}
                      </div>
                      <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.5, margin: '8px 0 10px' }}>{job.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <button
                          type="button"
                          className="os-btn os-btn-ghost"
                          onClick={() => {
                            setSelectedId(job.id)
                            setDraft(draftFromJob(job))
                            setEditing(true)
                          }}
                        >
                          Edit
                        </button>
                        {job.status === 'OPEN' ? (
                          <button type="button" className="os-btn os-btn-ghost" onClick={() => void setPublished(job, false)}>Close</button>
                        ) : (
                          <button type="button" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }} onClick={() => void setPublished(job, true)}>Publish</button>
                        )}
                        <button
                          type="button"
                          className="os-btn os-btn-ghost"
                          onClick={() => {
                            setSelectedId(job.id)
                            setActiveNav('applications')
                          }}
                        >
                          Applications →
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={(event) => void saveJob(event)} style={{ ...panelStyle, display: 'grid', gap: 10 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                SKILL-GAP MATCHED JOB PUBLISHER
              </span>
              <h3 style={{ margin: 0, color: C.ink, fontSize: 17 }}>{editing ? 'Edit job' : 'New job'}</h3>
              {employers.length > 1 ? (
                <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                  Employer
                  <select
                    required
                    value={draft.employerId}
                    onChange={(event) => setDraft((current) => ({ ...current, employerId: event.target.value }))}
                    style={fieldStyle}
                  >
                    <option value="">Choose employer</option>
                    {employers.map((employer) => <option key={employer.id} value={employer.id}>{employer.name}</option>)}
                  </select>
                </label>
              ) : null}
              <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                Title
                <input required minLength={2} maxLength={160} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} style={fieldStyle} />
              </label>
              <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                Description
                <textarea required maxLength={8000} rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} style={fieldStyle} />
              </label>
              <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                Location
                <input maxLength={120} value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} style={fieldStyle} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                  Work mode
                  <select value={draft.workMode} onChange={(event) => setDraft((current) => ({ ...current, workMode: event.target.value as JobDraft['workMode'] }))} style={fieldStyle}>
                    <option value="">Not set</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                  Employment type
                  <select value={draft.employmentType} onChange={(event) => setDraft((current) => ({ ...current, employmentType: event.target.value as JobDraft['employmentType'] }))} style={fieldStyle}>
                    <option value="">Not set</option>
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
              </div>
              <label style={{ display: 'grid', gap: 4, color: C.slate, fontSize: 12 }}>
                Application URL
                <input type="url" inputMode="url" placeholder="https://" value={draft.applicationUrl} onChange={(event) => setDraft((current) => ({ ...current, applicationUrl: event.target.value }))} style={fieldStyle} />
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="submit" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}</button>
                {editing ? (
                  <button type="button" className="os-btn os-btn-ghost" onClick={() => { setEditing(false); setDraft(emptyDraft()) }}>Cancel edit</button>
                ) : null}
              </div>
            </form>
          </section>
        ) : null}

        {activeNav === 'applications' ? (
          <section id="rec-applications" style={panelStyle}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
              CANDIDATE APPLICATIONS &amp; SKILL-MATCH DOSSIERS
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.ink, margin: '2px 0 8px' }}>Shared applications</h2>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
              {selected ? `Applications learners shared for ${selected.title}.` : 'Choose Applications on a job in the Jobs tab to see who shared it with you.'}
            </p>
            {!selected ? (
              <p style={{ color: C.slate, margin: 0 }}>No job selected.</p>
            ) : null}
            {selected && applicationsStatus === 'loading' ? <p style={{ color: C.slate }}>Loading applications…</p> : null}
            {selected && applicationsStatus === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => setApplicationsAttempt((value) => value + 1)}>Try again</button> : null}
            {selected && applicationsStatus === 'ready' && applications.length === 0 ? (
              <p style={{ color: C.slate, margin: 0, lineHeight: 1.6 }}>No shared applications yet. Private learner tracker entries are not listed here.</p>
            ) : null}
            {selected && applicationsStatus === 'ready' && applications.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {applications.map((application) => (
                  <li key={application.id} style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: C.ink }}>{application.applicantName}</strong>
                    <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>
                      Learner-reported status: {application.status}{application.roleTitle ? ` · ${application.roleTitle}` : ''}{application.appliedAt ? ` · ${new Date(application.appliedAt).toLocaleDateString()}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {activeNav === 'verify' || activeNav === 'jobs' ? (
          <section id="rec-talent-verify" style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                  INSTANT CANDIDATE FLIGHT RECORDER LOOKUP
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: C.ink, margin: '2px 0 0' }}>
                  Verified Proof-of-Work &amp; Credential Dossier Check
                </h2>
              </div>
              <a href="/verify" className="os-btn os-btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>
                Open Public Credential Verifier (/verify) →
              </a>
            </div>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
              Every Skylent candidate certificate ID (e.g. <code>SKL-2026-DA-...</code> or <code>SKL-2026-PGM...</code>) resolves a live Proof-of-Work Dossier across all 6 flagship Capstone Project Studios:
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <input
                value={verifyCodeInput}
                onChange={(e) => setVerifyCodeInput(e.target.value)}
                placeholder="Enter Certificate Code (e.g. SKL-2026-DA-EXEMPLAR)"
                style={{ ...fieldStyle, flex: '1 1 240px', width: 'auto' }}
              />
              <Link
                to={`/verify/${encodeURIComponent(verifyCodeInput.trim())}`}
                className="os-btn os-btn-primary"
                style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5', textDecoration: 'none', fontWeight: 700 }}
              >
                Inspect Candidate Dossier →
              </Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                'Data Analytics · Northwind Commercial Review',
                'Product Management · Harbor Desk Product Case',
                'Python · Settlement Pipeline & Anomaly Audit',
                'Data Science & AI · Out-of-Time Churn Validation',
                'Generative AI · Enterprise Policy RAG Evaluation',
                'Full Stack Web · Idempotent Wallet & Webhook Spec',
              ].map((label) => (
                <span
                  key={label}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#f6f4ff',
                    border: '1px solid #ddd6fe',
                    color: '#5142b5',
                    fontWeight: 600,
                  }}
                >
                  ✓ {label}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <style>{`
        .recruiter-workspace > * { min-width: 0; }
        .recruiter-workspace { overflow-x: hidden; }
      `}</style>
    </AuthDashboardShell>
  )
}
