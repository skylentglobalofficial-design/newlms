import { useState } from 'react'
import { C, FadeIn, JobDrawer, ApplyModal, PageShell } from '../components/shared'
import { jobs } from '../data'

export default function CareerPage() {
  const [filter, setFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [drawerJob, setDrawerJob] = useState<typeof jobs[0] | null>(null)
  const [applyJob, setApplyJob] = useState<typeof jobs[0] | null>(null)

  const filtered = jobs.filter(j => {
    const q = filter.toLowerCase()
    const matchesQ = !q || j.role.toLowerCase().includes(q) || j.skills.some(s => s.toLowerCase().includes(q))
    const matchesMode = modeFilter === 'All' || j.mode === modeFilter
    return matchesQ && matchesMode
  })

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>SKYLENT CAREER</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Where learning<br /><span style={{ color: C.orange }}>becomes opportunity.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.44)', fontSize: 18, lineHeight: 1.75, maxWidth: 520, margin: 0 }}>800+ hiring partners. Verified portfolios. A career pipeline built into your learning.</p>
          </FadeIn>

          {/* Pipeline */}
          <FadeIn delay={100}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 64, overflowX: 'auto', paddingBottom: 4 }}>
              {['Learn', 'Projects', 'Portfolio', 'Resume', 'Mock Interview', 'Interview', 'Job'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 6 ? C.orange : 'rgba(255,255,255,0.07)', border: `1px solid ${i === 6 ? C.orange : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, margin: '0 auto 8px' }}>
                      {['📚', '🛠️', '🗂️', '📄', '🎙️', '🏢', '✅'][i]}
                    </div>
                    <div style={{ color: i === 6 ? C.orange : 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{s}</div>
                  </div>
                  {i < 6 && <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.12)', margin: '0 4px', marginBottom: 22, flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Job Board */}
      <section id="jobs" style={{ background: C.warmWhite, padding: '72px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.025em' }}>Skylent Jobs</h2>
              <div style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.18)', borderRadius: 7, padding: '7px 14px' }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 1 }}>SAMPLE LISTINGS</div>
                <div style={{ color: C.slate, fontSize: 11 }}>Real jobs will appear here when partners are onboarded.</div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={40}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search roles, skills..."
                style={{ flex: '1 1 200px', minWidth: 0, background: C.white, border: '1px solid rgba(11,13,15,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: C.ink, fontFamily: 'var(--font-body)', outline: 'none' }}
              />
              {['All', 'Remote', 'Hybrid', 'On-site'].map(m => (
                <button key={m} onClick={() => setModeFilter(m)} style={{ padding: '9px 18px', borderRadius: 7, border: `1px solid ${modeFilter === m ? C.ink : 'rgba(11,13,15,0.15)'}`, background: modeFilter === m ? C.ink : C.white, color: modeFilter === m ? C.white : C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>{m}</button>
              ))}
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: C.slate, fontSize: 15 }}>No jobs matching your filters.</div>
            )}
            {filtered.map((job, i) => (
              <FadeIn key={job.id} delay={i * 40}>
                <div onClick={() => setDrawerJob(job)} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.1)', borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(11,13,15,0.08)'; e.currentTarget.style.borderColor = 'rgba(11,13,15,0.22)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(11,13,15,0.1)' }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: C.ink, fontSize: 16, fontWeight: 600, marginBottom: 3 }}>{job.role}</div>
                    <div style={{ color: C.slate, fontSize: 13, marginBottom: 10 }}>{job.company} · {job.location} · {job.exp}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {job.skills.map(s => <span key={s} style={{ background: C.sand, borderRadius: 4, padding: '3px 8px', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{ background: `rgba(11,13,15,0.05)`, borderRadius: 5, padding: '3px 9px', fontSize: 11, color: C.slate, fontFamily: 'var(--font-mono)' }}>{job.mode}</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: C.ink }}>{job.salary}</div>
                    <button onClick={e => { e.stopPropagation(); setDrawerJob(job) }} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 7, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={ev => (ev.currentTarget.style.opacity = '1')}
                    >Apply Now</button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {drawerJob && !applyJob && <JobDrawer job={drawerJob} onClose={() => setDrawerJob(null)} onApply={() => setApplyJob(drawerJob)} />}
      {applyJob && <ApplyModal job={applyJob} onClose={() => { setApplyJob(null); setDrawerJob(null) }} />}
    </PageShell>
  )
}
