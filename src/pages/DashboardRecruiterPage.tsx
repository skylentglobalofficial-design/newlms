import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
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
  { id: 'jobs', label: 'Jobs', short: 'Jobs', sectionId: 'rec-jobs' },
  { id: 'applications', label: 'Applications', short: 'Apps', sectionId: 'rec-applications' },
]

const accent = getRoleAccent('recruiter')

const panelStyle = {
  padding: 16,
  background: 'var(--skylent-surface-elevated)',
  border: `1px solid ${T.lineLight}`,
  borderRadius: T.rCard,
} as const

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${T.lineLight}`,
  background: 'var(--skylent-surface-paper)',
  color: C.ink,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
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
    // Reload when the signed-in account changes. load closes over the latest setters.
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
      <div className="recruiter-workspace">
        <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
          {user.name ?? 'Recruiter'}
        </h1>
        <p style={{ color: C.slate, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6, maxWidth: 680 }}>
          Create roles for employers linked to this account. Learners appear here only after they choose to share an application.
        </p>

        {message ? <p className="os-error" role="alert">{message}</p> : null}
        {status === 'loading' ? <p style={{ color: C.slate }}>Loading your jobs…</p> : null}
        {status === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}

        {status === 'ready' && !linked ? (
          <div style={{ ...panelStyle, borderLeft: `3px solid ${accent.primary}` }}>
            <p style={{ color: C.ink, margin: '0 0 8px', fontWeight: 600 }}>No employer is linked to this account.</p>
            <p style={{ color: C.slate, margin: 0, lineHeight: 1.6 }}>
              An admin has to create an employer and link your user before you can post jobs. The recruiter role alone does not open another employer&apos;s roles.
            </p>
          </div>
        ) : null}

        {status === 'ready' && linked ? (
          <>
            <section id="rec-jobs" style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>Your jobs</h2>
                <span style={{ color: C.slate, fontSize: 12 }}>{openCount} published · {jobs.length} total</span>
              </div>

              {jobs.length === 0 ? (
                <div style={{ ...panelStyle, marginBottom: 16 }}>
                  <p style={{ color: C.slate, margin: 0, lineHeight: 1.6 }}>No jobs yet. A draft stays off the public board until you publish it.</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
                  {jobs.map((job) => (
                    <li key={job.id} style={{ ...panelStyle, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: C.ink, wordBreak: 'break-word' }}>{job.title}</strong>
                          <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>
                            {job.employer?.name ?? 'Employer'} · {job.status}{job.location ? ` · ${job.location}` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="os-btn os-btn-ghost" onClick={() => { setSelectedId(job.id); setActiveNav('applications') }}>Applications</button>
                          <button type="button" className="os-btn os-btn-ghost" onClick={() => { setSelectedId(job.id); setEditing(true); setDraft(draftFromJob(job)) }}>Edit</button>
                          {job.status !== 'OPEN' ? (
                            <button type="button" className="os-btn os-btn-primary" onClick={() => void setPublished(job, true)}>Publish</button>
                          ) : (
                            <button type="button" className="os-btn os-btn-ghost" onClick={() => void setPublished(job, false)}>Close</button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={(event) => void saveJob(event)} style={{ ...panelStyle, display: 'grid', gap: 10 }}>
                <h3 style={{ margin: 0, color: C.ink, fontSize: 16 }}>{editing ? 'Edit job' : 'New job'}</h3>
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
                  <textarea required maxLength={8000} rows={5} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} style={fieldStyle} />
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
                  <button type="submit" className="os-btn os-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}</button>
                  {editing ? (
                    <button type="button" className="os-btn os-btn-ghost" onClick={() => { setEditing(false); setDraft(emptyDraft()) }}>Cancel edit</button>
                  ) : null}
                </div>
              </form>
            </section>

            <section id="rec-applications">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 8px' }}>Shared applications</h2>
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                {selected ? `Applications learners shared for ${selected.title}.` : 'Choose Applications on a job to see who shared it with you.'}
              </p>
              {!selected ? (
                <div style={panelStyle}><p style={{ color: C.slate, margin: 0 }}>No job selected.</p></div>
              ) : null}
              {selected && applicationsStatus === 'loading' ? <p style={{ color: C.slate }}>Loading applications…</p> : null}
              {selected && applicationsStatus === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => setApplicationsAttempt((value) => value + 1)}>Try again</button> : null}
              {selected && applicationsStatus === 'ready' && applications.length === 0 ? (
                <div style={panelStyle}><p style={{ color: C.slate, margin: 0, lineHeight: 1.6 }}>No shared applications yet. Private learner tracker entries are not listed here.</p></div>
              ) : null}
              {selected && applicationsStatus === 'ready' && applications.length > 0 ? (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {applications.map((application) => (
                    <li key={application.id} style={{ ...panelStyle, marginBottom: 8 }}>
                      <strong style={{ color: C.ink }}>{application.applicantName}</strong>
                      <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>
                        Learner-reported status: {application.status}{application.roleTitle ? ` · ${application.roleTitle}` : ''}{application.appliedAt ? ` · ${new Date(application.appliedAt).toLocaleDateString()}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section id="rec-talent-verify" style={{ marginTop: 28, ...panelStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
                  Verified Proof-of-Work &amp; Credential Dossier Check
                </h2>
                <a href="/verify" className="os-btn os-btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>
                  Open Public Credential Verifier (/verify) →
                </a>
              </div>
              <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>
                Every Skylent candidate certificate ID (e.g. <code>SKL-2026-DA-...</code> or <code>SKL-2026-PGM...</code>) resolves a live Proof-of-Work Dossier across all 6 flagship Capstone Project Studios:
              </p>
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
                      background: 'var(--skylent-surface-paper)',
                      border: `1px solid ${T.lineLight}`,
                      color: C.ink,
                    }}
                  >
                    ✓ {label}
                  </span>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
      <style>{`
        .recruiter-workspace > * { min-width: 0; }
        .recruiter-workspace { overflow-x: hidden; }
      `}</style>
    </AuthDashboardShell>
  )
}
