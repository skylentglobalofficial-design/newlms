import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../components/shared'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = ['Dashboard', 'My Courses', 'Students', 'Assignments', 'Analytics', 'Announcements']

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const displayName = user?.name || 'Dr. Priya Nair'
  const displayAvatar = user?.avatar || 'PN'

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>SKYLENT <span style={{ color: C.orange }}>OS</span></div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.08em' }}>FACULTY PORTAL</div>
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
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #667078, #8899a4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>{displayAvatar}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Faculty</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
      </div>
    </div>
  )
}

const courses = [
  { name: 'Data Science & AI', students: 52, completion: 71, lastActivity: '2h ago' },
  { name: 'Machine Learning Fundamentals', students: 44, completion: 58, lastActivity: '1d ago' },
  { name: 'Python for Data Science', students: 32, completion: 83, lastActivity: '5h ago' },
]

const submissions = [
  { student: 'Arjun Sharma', assignment: 'SQL Query Assignment', submitted: 'Today 9:41 AM', status: 'Pending' },
  { student: 'Meera Pillai', assignment: 'EDA Project', submitted: 'Yesterday 6:12 PM', status: 'Reviewed' },
  { student: 'Rohan Mehta', assignment: 'Feature Engineering', submitted: '2 days ago', status: 'Reviewed' },
  { student: 'Sneha Iyer', assignment: 'SQL Query Assignment', submitted: 'Today 11:03 AM', status: 'Pending' },
  { student: 'Karan Patel', assignment: 'Regression Model', submitted: '3 days ago', status: 'Reviewed' },
]

const atRisk = [
  { name: 'Vikram Nair', course: 'Data Science & AI', issue: 'No activity for 8 days', severity: 'high' },
  { name: 'Aditi Reddy', course: 'ML Fundamentals', issue: 'Failed quiz twice — needs support', severity: 'medium' },
  { name: 'Sameer Khan', course: 'Python for Data Science', issue: 'Assignment overdue by 5 days', severity: 'high' },
]

export default function DashboardFacultyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('Dashboard')
  const [nudgeSent, setNudgeSent] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const displayName = user?.name || 'Dr. Priya Nair'
  const firstName = displayName.split(' ').pop() || 'Nair'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1012', fontFamily: 'var(--font-body)' }}>
      <Sidebar active={active} setActive={setActive} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,16,18,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>Faculty Dashboard</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}> — Dr. {firstName}</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Alert banner */}
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderLeft: '4px solid #f59e0b', borderRadius: 12, padding: '16px 24px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: '#f59e0b', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>ACTION REQUIRED</div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>12 assignments pending review — <span style={{ color: '#ef4444' }}>3 overdue</span></div>
            </div>
            <button onClick={() => setActive('Assignments')} style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Review Now →</button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Active Students', value: '128' },
              { label: 'My Courses', value: '3' },
              { label: 'Avg Completion', value: '68%' },
              { label: 'Satisfaction', value: '4.6/5' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>{stat.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.white }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* At Risk Students */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>AT-RISK STUDENTS</div>
              {atRisk.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px', background: 'rgba(239,68,68,0.05)', border: `1px solid ${s.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 10, marginBottom: i < atRisk.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: s.severity === 'high' ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>
                      {s.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{s.issue}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setNudgeSent(prev => ({ ...prev, [s.name]: true }))}
                    style={{ background: nudgeSent[s.name] ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${nudgeSent[s.name] ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: nudgeSent[s.name] ? '#22c55e' : 'rgba(255,255,255,0.5)', padding: '6px 12px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {nudgeSent[s.name] ? 'Nudge sent' : 'Send nudge'}
                  </button>
                </div>
              ))}
            </div>

            {/* Course quick view */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>MY COURSES</div>
              {courses.map((c, i) => (
                <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < courses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{c.lastActivity}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{c.students} students</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: c.completion >= 70 ? '#22c55e' : c.completion >= 50 ? '#f59e0b' : '#ef4444' }}>{c.completion}% completion</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 4 }}>
                    <div style={{ background: c.completion >= 70 ? '#22c55e' : c.completion >= 50 ? '#f59e0b' : '#ef4444', width: `${c.completion}%`, height: '100%', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>RECENT SUBMISSIONS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student', 'Assignment', 'Submitted', 'Status'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left', padding: '0 0 12px', letterSpacing: '0.08em' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 0', color: C.white, fontSize: 13 }}>{row.student}</td>
                    <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{row.assignment}</td>
                    <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{row.submitted}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ background: row.status === 'Reviewed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${row.status === 'Reviewed' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, color: row.status === 'Reviewed' ? '#22c55e' : '#f59e0b', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
