import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, T } from '../components/ui'
import { searchJobs, type JobBoardJob } from '../api/jobs'
import { fetchCareerOsAccess, saveCareerOsJob } from '../api/careerOs'
import { useAuth } from '../context/AuthContext'
import { CO, coMonoLabel, statusColor } from '../components/careerOs/careerOsStyles'
import { Breadcrumbs } from '../components/contextual/Breadcrumbs'
import { jobBoardBreadcrumbs } from '../lib/breadcrumbs'
import { JobDiscoveryRail, domainLabel } from '../components/careerOs/JobBoardProductVisuals'
import { VS } from '../lib/visualSystem'

const WORK_MODES = ['Hybrid', 'Remote', 'On-site'] as const

function appStateLabel(status: string) {
  if (status === 'DRAFT') return 'SAVED'
  return status.replace(/_/g, ' ')
}

function JobMarketplaceCard({
  job,
  canSave,
  onSaved,
}: {
  job: JobBoardJob
  canSave: boolean
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSaving(true)
    try {
      await saveCareerOsJob(job.id)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const isSaved = job.applicationState?.status === 'DRAFT'
  const hasApplication = !!job.applicationState && !isSaved

  return (
    <article className="job-list-row">
      <Link to={`/jobs/${job.slug}`} className="job-list-row-main" style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 16, alignItems: 'start', padding: '22px 0', borderBottom: `1px solid ${VS.hairline}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginBottom: 8, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: VS.textMuted }}>{job.employmentType} · {job.workMode}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: VS.textMuted }}>{domainLabel(job.careerDomain)}</span>
            {job.isSample && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: C.orange }}>Sample</span>}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 6px' }}>{job.role}</h2>
          <div style={{ color: VS.textSecondary, fontSize: 14, marginBottom: 10 }}>{job.company} · {job.location}</div>
          <p style={{ color: VS.textSecondary, fontSize: 13, lineHeight: 1.65, margin: '0 0 10px', maxWidth: 640 }}>{job.description}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textMuted, margin: 0 }}>{job.skills.slice(0, 6).join(' · ')}</p>
        </div>
        <div className="job-list-row-aside" style={{ textAlign: 'right', minWidth: 108, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: VS.textSecondary, marginBottom: 4 }}>{job.experience}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: VS.textMuted, marginBottom: 10 }}>
            Updated {new Date(job.updatedAt).toLocaleDateString()}
          </div>
          {job.applicationState && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: statusColor(job.applicationState.status), marginBottom: 10 }}>
              {appStateLabel(job.applicationState.status)}
            </div>
          )}
          {isSaved && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: C.orange, fontWeight: 600, marginBottom: 8 }}>Saved</div>}
          <span style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>{hasApplication ? 'View application →' : 'Open role →'}</span>
        </div>
      </Link>
      {canSave && !job.applicationState && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 16, marginTop: -8, borderBottom: `1px solid ${VS.hairline}` }}>
          <Button variant="ghost" size="sm" disabled={saving} onClick={e => void handleSave(e)}>{saving ? 'Saving…' : 'Save for later'}</Button>
        </div>
      )}
    </article>
  )
}

export default function JobBoardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobBoardJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasCareerAccess, setHasCareerAccess] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const location = searchParams.get('location') ?? ''
  const skill = searchParams.get('skill') ?? ''
  const workMode = searchParams.get('workMode') ?? ''
  const type = searchParams.get('type') ?? ''

  useEffect(() => {
    setLoading(true)
    searchJobs({ q: q || undefined, location: location || undefined, skill: skill || undefined, workMode: workMode || undefined, type: type || undefined })
      .then(({ jobs: rows, meta }) => { setJobs(rows); setTotal(meta.total) })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [q, location, skill, workMode, type, refreshKey])

  useEffect(() => {
    if (!user) { setHasCareerAccess(false); return }
    fetchCareerOsAccess().then(a => setHasCareerAccess(a.allowed)).catch(() => setHasCareerAccess(false))
  }, [user])

  const filterForm = useMemo(() => ({ q, location, skill, workMode, type }), [q, location, skill, workMode, type])

  function applyFilters(next: Partial<typeof filterForm>) {
    const params = new URLSearchParams()
    const merged = { ...filterForm, ...next }
    if (merged.q) params.set('q', merged.q)
    if (merged.location) params.set('location', merged.location)
    if (merged.skill) params.set('skill', merged.skill)
    if (merged.workMode) params.set('workMode', merged.workMode)
    if (merged.type) params.set('type', merged.type)
    setSearchParams(params)
  }

  return (
    <PageShell>
      <section className="job-board-hero vs-accent-job_board" style={{ background: CO.auroraJobBoard, padding: 'clamp(72px, 9vw, 96px) clamp(16px, 4vw, 32px) clamp(28px, 4vw, 36px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ marginBottom: 14 }}>
            <Breadcrumbs items={jobBoardBreadcrumbs()} tone="dark" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)', gap: 32, alignItems: 'center' }} className="two-col-sm">
            <div>
              <div style={coMonoLabel('dark')}>Open roles</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 600, color: C.white, margin: '10px 0 12px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                Find work that fits what you've built.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 520, lineHeight: 1.7, margin: '0 0 16px' }}>
                Search by role, company, or skill. Sign in to save roles and apply through Career OS.
              </p>
              <JobDiscoveryRail />
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                applyFilters({ q: String(fd.get('q') ?? ''), location: String(fd.get('location') ?? ''), skill: String(fd.get('skill') ?? '') })
              }}
              style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 20 }}
            >
              <div style={{ ...coMonoLabel('dark'), marginBottom: 12 }}>Search roles</div>
              <input name="q" defaultValue={q} placeholder="Role or company" aria-label="Search jobs" style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: C.white, marginBottom: 10, fontSize: 14 }} />
              <input name="location" defaultValue={location} placeholder="Location" aria-label="Location" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: C.white, marginBottom: 10, fontSize: 13 }} />
              <input name="skill" defaultValue={skill} placeholder="Skill (SQL, React…)" aria-label="Skill filter" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: C.white, marginBottom: 14, fontSize: 13 }} />
              <Button variant="primary" type="submit" style={{ width: '100%' }}>Search jobs</Button>
            </form>
          </div>
        </div>
      </section>

      <section style={{ background: VS.pageBg, padding: '32px clamp(16px, 4vw, 32px) 80px', overflowX: 'hidden', color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textMuted }}>{jobs.length} of {total} open roles</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="job-board-filters-toggle" onClick={() => setFiltersOpen(o => !o)} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: VS.textPrimary }} aria-expanded={filtersOpen}>
                Filters
              </button>
              {!user && <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in to apply</Button>}
              {user && <Button variant="ghost" size="sm" onClick={() => navigate('/career-os')}>Career OS</Button>}
            </div>
          </div>

          <div className={`job-board-filters-panel${filtersOpen ? ' is-open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setFiltersOpen(false) }}>
            <div className="job-board-filters-drawer">
              <form
                className="job-board-filters"
                onSubmit={e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  applyFilters({ workMode: String(fd.get('workMode') ?? ''), type: String(fd.get('type') ?? ''), location: String(fd.get('location') ?? ''), skill: String(fd.get('skill') ?? '') })
                  setFiltersOpen(false)
                }}
                style={{ marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, alignItems: 'end', padding: '20px 0', borderBottom: `1px solid ${VS.hairline}` }}
              >
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>LOCATION</span>
                  <input name="location" defaultValue={location} aria-label="Filter location" style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${VS.hairline}`, background: VS.surfaceElevated, color: VS.textPrimary }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>SKILL</span>
                  <input name="skill" defaultValue={skill} aria-label="Filter skill" style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${VS.hairline}`, background: VS.surfaceElevated, color: VS.textPrimary }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>WORK MODE</span>
                  <select name="workMode" defaultValue={workMode} aria-label="Work mode" style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${VS.hairline}`, background: VS.surfaceElevated, color: VS.textPrimary }}>
                    <option value="">Any</option>
                    {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>EMPLOYMENT</span>
                  <input name="type" defaultValue={type} placeholder="Full-time" aria-label="Employment type" style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${VS.hairline}`, background: VS.surfaceElevated, color: VS.textPrimary }} />
                </label>
                <Button variant="dark" type="submit" size="sm">Apply filters</Button>
                <Button variant="ghost" type="button" size="sm" className="job-board-filters-toggle" onClick={() => setFiltersOpen(false)}>Close</Button>
              </form>
            </div>
          </div>

          {loading && <div style={{ color: VS.textSecondary }}>Loading jobs…</div>}
          {error && <div style={{ color: VS.textSecondary, padding: '16px 0' }}>{error}</div>}

          {!loading && !error && (
            <FadeIn>
              {jobs.length === 0 ? (
                <p style={{ color: VS.textSecondary, padding: '24px 0' }}>No roles match your filters.</p>
              ) : (
                <div className="job-list">
                  {jobs.map(job => (
                    <JobMarketplaceCard key={job.id} job={job} canSave={hasCareerAccess} onSaved={() => setRefreshKey(k => k + 1)} />
                  ))}
                </div>
              )}
            </FadeIn>
          )}
        </div>
      </section>
    </PageShell>
  )
}
