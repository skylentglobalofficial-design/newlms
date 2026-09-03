import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../components/shared'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = ['Overview', 'Programs', 'Cohorts', 'Students', 'Faculty', 'Analytics', 'Reports']

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function handleLogout() { logout(); navigate('/login') }
  const displayName = user?.name || 'Apex College'
  const displayAvatar = user?.avatar || 'AC'
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>SKYLENT <span style={{ color: C.orange }}>OS</span></div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.08em' }}>ORGANISATION PORTAL</div>
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
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>{displayAvatar}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Organisation</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
      </div>
    </div>
  )
}

const cohorts = [
  { name: 'Data Science Batch 12', program: 'Data Science & AI', students: 52, completion: 74, atRisk: 4, status: 'On Track' },
  { name: 'Analytics Pro Cohort 8', program: 'Data Analytics with Gen AI', students: 38, completion: 58, atRisk: 9, status: 'Needs Attention' },
  { name: 'Full Stack Batch 5', program: 'Full Stack Development', students: 44, completion: 42, atRisk: 14, status: 'Critical' },
  { name: 'Gen AI Cohort 3', program: 'Generative AI', students: 61, completion: 81, atRisk: 2, status: 'On Track' },
  { name: 'PM Program Batch 2', program: 'Product Management', students: 29, completion: 63, atRisk: 6, status: 'Needs Attention' },
]

const facultyLoad = [
  { name: 'Dr. Priya Nair', load: 92 },
  { name: 'Arun Krishnamurthy', load: 74 },
  { name: 'Meghna Srivastava', load: 61 },
  { name: 'Ritesh Agarwal', load: 85 },
  { name: 'Sunita Menon', load: 48 },
]

const statusColor: Record<string, string> = {
  'On Track': '#22c55e',
  'Needs Attention': '#f59e0b',
  'Critical': '#ef4444',
}

const statusBg: Record<string, string> = {
  'On Track': 'rgba(34,197,94,0.1)',
  'Needs Attention': 'rgba(245,158,11,0.1)',
  'Critical': 'rgba(239,68,68,0.1)',
}

const statusBorder: Record<string, string> = {
  'On Track': 'rgba(34,197,94,0.25)',
  'Needs Attention': 'rgba(245,158,11,0.25)',
  'Critical': 'rgba(239,68,68,0.25)',
}

export default function DashboardOrgPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('Overview')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1012', fontFamily: 'var(--font-body)' }}>
      <Sidebar active={active} setActive={setActive} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,16,18,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>Organisation Overview</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Apex College · Academic Year 2025–26</div>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Demo banner */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>DEMO DATA — Cohorts, students and figures are illustrative only</span>
          </div>

          {/* Operational Alerts */}
          <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { msg: '42 learners inactive 7+ days', action: 'View & re-engage', severity: 'high' },
              { msg: '18 assignments overdue across 4 cohorts', action: 'Review assignments', severity: 'medium' },
              { msg: '3 cohorts below 60% completion target', action: 'View cohorts', severity: 'high' },
            ].map((alert, i) => (
              <div key={i} style={{ background: alert.severity === 'high' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)', border: `1px solid ${alert.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : '#f59e0b'}`, borderRadius: 10, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: C.white, fontSize: 13 }}>{alert.msg}</div>
                <button onClick={() => setActive(alert.action.includes('cohort') ? 'Cohorts' : alert.action.includes('assignment') ? 'Students' : 'Students')} style={{ background: 'transparent', border: `1px solid ${alert.severity === 'high' ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`, color: alert.severity === 'high' ? '#ef4444' : '#f59e0b', padding: '5px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {alert.action} →
                </button>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Learners', value: '1,240' },
              { label: 'Active Programs', value: '4' },
              { label: 'Avg Completion', value: '67%' },
              { label: 'Certificates Issued', value: '389' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>{stat.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.white }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Cohort Performance Table */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>COHORT PERFORMANCE</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Cohort', 'Program', 'Students', 'Completion', 'At Risk', 'Status'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left', padding: '0 0 12px', letterSpacing: '0.06em', paddingRight: 16 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px 12px 0', color: C.white, fontSize: 13, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{c.program}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.students}</td>
                    <td style={{ padding: '12px 16px 12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 5, width: 60 }}>
                          <div style={{ background: statusColor[c.status], width: `${c.completion}%`, height: '100%', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: statusColor[c.status] }}>{c.completion}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px 12px 0', color: c.atRisk > 8 ? '#ef4444' : c.atRisk > 4 ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.atRisk}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ background: statusBg[c.status], border: `1px solid ${statusBorder[c.status]}`, color: statusColor[c.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Faculty Utilization */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>FACULTY UTILIZATION</div>
              {facultyLoad.map((f, i) => (
                <div key={i} style={{ marginBottom: i < facultyLoad.length - 1 ? 16 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: C.white, fontSize: 13 }}>{f.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: f.load > 85 ? '#ef4444' : f.load > 70 ? '#f59e0b' : '#22c55e' }}>{f.load}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                    <div style={{ background: f.load > 85 ? '#ef4444' : f.load > 70 ? '#f59e0b' : '#22c55e', width: `${f.load}%`, height: '100%', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>QUICK ACTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Download Monthly Report', icon: '↓', action: 'Reports' },
                  { label: 'Schedule Cohort Review', icon: '+', action: 'Cohorts' },
                  { label: 'Send Announcement', icon: '✉', action: 'Students' },
                  { label: 'View At-Risk Dashboard', icon: '⚠', action: 'Students' },
                  { label: 'Export Certificate Data', icon: '↗', action: 'Reports' },
                ].map((qa, i) => (
                  <button key={i} onClick={() => setActive(qa.action)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', color: C.white, fontSize: 13, fontFamily: 'var(--font-body)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, fontSize: 13, flexShrink: 0 }}>{qa.icon}</span>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
