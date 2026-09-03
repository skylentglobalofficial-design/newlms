import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../components/shared'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = ['Talent Pool', 'Jobs Posted', 'Applications', 'Interviews', 'Analytics']

type Candidate = {
  name: string
  initials: string
  role: string
  skills: string[]
  readiness: number
  certified: boolean
  experience: string
}

const candidates: Candidate[] = [
  { name: 'Arjun Sharma', initials: 'AS', role: 'Data Analyst', skills: ['SQL', 'Python', 'Power BI'], readiness: 87, certified: true, experience: 'Fresher' },
  { name: 'Meera Pillai', initials: 'MP', role: 'ML Engineer', skills: ['Python', 'TensorFlow', 'Scikit-learn'], readiness: 79, certified: true, experience: '1 yr' },
  { name: 'Rohan Mehta', initials: 'RM', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'PostgreSQL'], readiness: 92, certified: true, experience: '2 yrs' },
  { name: 'Sneha Iyer', initials: 'SI', role: 'Data Analyst', skills: ['SQL', 'Excel', 'Looker'], readiness: 68, certified: false, experience: 'Fresher' },
  { name: 'Karan Patel', initials: 'KP', role: 'AI/ML Engineer', skills: ['Python', 'PyTorch', 'LangChain'], readiness: 83, certified: true, experience: '1 yr' },
  { name: 'Ananya Krishnan', initials: 'AK', role: 'BI Developer', skills: ['Power BI', 'DAX', 'SQL'], readiness: 75, certified: false, experience: 'Fresher' },
]

const shortlisted: Candidate[] = [
  candidates[0],
  candidates[2],
  candidates[4],
]

const postedJobs = [
  { title: 'Junior Data Analyst', applications: 34, active: true, posted: '5 days ago' },
  { title: 'ML Engineer', applications: 18, active: true, posted: '2 days ago' },
]

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function handleLogout() { logout(); navigate('/login') }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>SKYLENT <span style={{ color: C.orange }}>OS</span></div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.08em' }}>RECRUITER PORTAL</div>
      </div>
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <button key={item} onClick={() => setActive(item)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 2, borderRadius: 8, border: 'none', background: active === item ? 'rgba(243,107,33,0.1)' : 'transparent', borderLeft: active === item ? `3px solid ${C.orange}` : '3px solid transparent', color: active === item ? C.orange : 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s', fontWeight: active === item ? 600 : 400 }}>
            {item}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>{user?.avatar || 'RC'}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Recruiter'}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Recruiter</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
      </div>
    </div>
  )
}

export default function DashboardRecruiterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('Talent Pool')
  const [shortlistedSet, setShortlistedSet] = useState<Set<string>>(new Set())
  const [skillFilter, setSkillFilter] = useState('All')
  const [readinessFilter, setReadinessFilter] = useState('All')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const skillOptions = ['All', 'SQL', 'Python', 'React', 'Power BI', 'ML']

  const filtered = candidates.filter(c => {
    const matchSkill = skillFilter === 'All' || c.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))
    const matchReadiness = readinessFilter === 'All'
      || (readinessFilter === '80%+' && c.readiness >= 80)
      || (readinessFilter === '60–80%' && c.readiness >= 60 && c.readiness < 80)
    return matchSkill && matchReadiness
  })

  function toggleShortlist(name: string) {
    setShortlistedSet(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1012', fontFamily: 'var(--font-body)' }}>
      <Sidebar active={active} setActive={setActive} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,16,18,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>Talent Pool</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Skylent Verified Candidates</div>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Header stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Candidates', value: '847' },
              { label: 'Shortlisted', value: '23' },
              { label: 'Interviews Scheduled', value: '8' },
              { label: 'Offers Made', value: '3' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>{stat.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.white }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>SKILLS:</span>
              {skillOptions.map(s => (
                <button key={s} onClick={() => setSkillFilter(s)} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${skillFilter === s ? C.orange : 'rgba(255,255,255,0.1)'}`, background: skillFilter === s ? 'rgba(243,107,33,0.15)' : 'transparent', color: skillFilter === s ? C.orange : 'rgba(255,255,255,0.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>READINESS:</span>
              {['All', '80%+', '60–80%'].map(r => (
                <button key={r} onClick={() => setReadinessFilter(r)} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${readinessFilter === r ? C.orange : 'rgba(255,255,255,0.1)'}`, background: readinessFilter === r ? 'rgba(243,107,33,0.15)' : 'transparent', color: readinessFilter === r ? C.orange : 'rgba(255,255,255,0.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}>{r}</button>
              ))}
            </div>
          </div>

          {/* Candidate cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {filtered.map((c, i) => {
              const isShortlisted = shortlistedSet.has(c.name)
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isShortlisted ? 'rgba(243,107,33,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}88, #ff9a3c88)`, border: `2px solid ${C.orange}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.white, flexShrink: 0 }}>{c.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{c.role} · {c.experience}</div>
                    </div>
                    {c.certified && (
                      <div style={{ background: 'rgba(243,107,33,0.12)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill={C.orange}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
                        <span style={{ color: C.orange, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CERT</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.skills.map(s => (
                      <span key={s} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>
                    ))}
                  </div>

                  {/* Readiness */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Career Readiness</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: c.readiness >= 80 ? '#22c55e' : c.readiness >= 65 ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>{c.readiness}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                      <div style={{ background: c.readiness >= 80 ? '#22c55e' : c.readiness >= 65 ? '#f59e0b' : C.orange, width: `${c.readiness}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                    >View Profile</button>
                    <button onClick={() => toggleShortlist(c.name)} style={{ flex: 1, padding: '8px', background: isShortlisted ? 'rgba(243,107,33,0.15)' : 'transparent', border: `1px solid ${isShortlisted ? C.orange : 'rgba(255,255,255,0.1)'}`, borderRadius: 7, color: isShortlisted ? C.orange : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s', fontWeight: isShortlisted ? 600 : 400 }}>
                      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Shortlisted candidates */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>SHORTLISTED CANDIDATES</div>
              {shortlisted.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottom: i < shortlisted.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}66, #ff9a3c66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white }}>{c.initials}</div>
                    <div>
                      <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{c.role}</div>
                    </div>
                  </div>
                  <button style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '6px 12px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                    Schedule Interview
                  </button>
                </div>
              ))}
            </div>

            {/* Posted Jobs */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>YOUR POSTED JOBS</div>
              {postedJobs.map((j, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px', marginBottom: i < postedJobs.length - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{j.title}</div>
                    <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono)' }}>Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{j.applications} applications · posted {j.posted}</span>
                    <button style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.25)', color: C.orange, padding: '6px 12px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>View →</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setActive('Jobs Posted')} style={{ width: '100%', marginTop: 12, padding: '10px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Post a New Job</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
