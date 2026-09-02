import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../components/shared'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = ['Dashboard', 'Users', 'Organisations', 'Courses', 'Payments', 'Enrollments', 'Certificates', 'System']

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function handleLogout() { logout(); navigate('/login') }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>SKYLENT <span style={{ color: C.orange }}>OS</span></div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.08em' }}>SUPER ADMIN</div>
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
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #ff9a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>{user?.avatar || 'SA'}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Skylent Admin'}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Super Admin</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
      </div>
    </div>
  )
}

const recentEnrollments = [
  { user: 'Arjun Sharma', course: 'Data Science & AI — Pro', amount: '₹44,999', date: '11 Aug 2026', status: 'Confirmed' },
  { user: 'Meera Pillai', course: 'Full Stack Development — Career', amount: '₹54,999', date: '11 Aug 2026', status: 'Confirmed' },
  { user: 'Ravi Kumar', course: 'Data Analytics — Self-paced', amount: '₹19,999', date: '10 Aug 2026', status: 'Pending' },
  { user: 'Shruti Das', course: 'Generative AI — Pro', amount: '₹24,999', date: '10 Aug 2026', status: 'Confirmed' },
  { user: 'Karan Bhat', course: 'Power BI Masterclass', amount: '₹2,999', date: '9 Aug 2026', status: 'Confirmed' },
  { user: 'Pooja Singh', course: 'Product Management — Career', amount: '₹37,999', date: '9 Aug 2026', status: 'Refunded' },
  { user: 'Amit Verma', course: 'Python for Data Science', amount: '₹3,999', date: '8 Aug 2026', status: 'Confirmed' },
  { user: 'Nisha Mohan', course: 'Data Science & AI — Career', amount: '₹59,999', date: '8 Aug 2026', status: 'Confirmed' },
]

const topCourses = [
  { name: 'Data Science & AI', enrollments: 847 },
  { name: 'Data Analytics with Gen AI', enrollments: 712 },
  { name: 'Full Stack Development', enrollments: 589 },
  { name: 'Generative AI', enrollments: 421 },
  { name: 'Product Management', enrollments: 318 },
]

const orgs = [
  { name: 'Apex College', students: 1240, programs: 4, lastPayment: '₹8.4L — Jun 2026' },
  { name: 'TechBridge Institute', students: 880, programs: 3, lastPayment: '₹5.9L — Jul 2026' },
  { name: 'Innovate Academy', students: 640, programs: 2, lastPayment: '₹3.2L — Jul 2026' },
  { name: 'NovaTech University', students: 2100, programs: 6, lastPayment: '₹14.1L — Aug 2026' },
  { name: 'Horizon Skills', students: 310, programs: 2, lastPayment: '₹1.8L — Jun 2026' },
]

const systemHealth = [
  { name: 'API Gateway', status: 'Operational', uptime: '99.98%' },
  { name: 'Database', status: 'Operational', uptime: '99.99%' },
  { name: 'Payment Gateway', status: 'Operational', uptime: '99.95%' },
  { name: 'Storage / CDN', status: 'Operational', uptime: '100%' },
]

const statusColors: Record<string, string> = {
  Confirmed: '#22c55e',
  Pending: '#f59e0b',
  Refunded: '#ef4444',
}

const statusBgs: Record<string, string> = {
  Confirmed: 'rgba(34,197,94,0.1)',
  Pending: 'rgba(245,158,11,0.1)',
  Refunded: 'rgba(239,68,68,0.1)',
}

export default function DashboardAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('Dashboard')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const maxEnrollment = topCourses[0].enrollments

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1012', fontFamily: 'var(--font-body)' }}>
      <Sidebar active={active} setActive={setActive} />

      <div style={{ marginLeft: 220, flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,16,18,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>Admin Dashboard</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Skylent Global · Platform Admin</div>
        </div>

        <div style={{ padding: '32px' }}>

          {/* Demo banner */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>DEMO DATA — Figures are illustrative only</span>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Users', value: '12,450' },
              { label: 'Organisations', value: '48' },
              { label: 'Monthly Enrollments', value: '2,847' },
              { label: 'Revenue (MTD)', value: '₹42.8L' },
              { label: 'Certificates Issued', value: '3,891' },
              { label: 'Active Courses', value: '134' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>{stat.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: C.white }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 28 }}>
            {/* Recent Enrollments */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>RECENT ENROLLMENTS</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['User', 'Course / Plan', 'Amount', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left', padding: '0 12px 12px 0', letterSpacing: '0.06em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '11px 12px 11px 0', color: C.white, fontSize: 13 }}>{row.user}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.4)', fontSize: 12, maxWidth: 200 }}>{row.course}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{row.amount}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{row.date}</td>
                      <td style={{ padding: '11px 0' }}>
                        <span style={{ background: statusBgs[row.status], border: `1px solid ${statusColors[row.status]}33`, color: statusColors[row.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System Health */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>SYSTEM HEALTH</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {systemHealth.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 8 }}>
                    <div>
                      <div style={{ color: C.white, fontSize: 13 }}>{s.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.uptime} uptime</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                      <span style={{ color: '#22c55e', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Top Courses */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>TOP COURSES BY ENROLLMENT</div>
              {topCourses.map((c, i) => (
                <div key={i} style={{ marginBottom: i < topCourses.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: C.white, fontSize: 13 }}>{c.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{c.enrollments.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                    <div style={{ background: `linear-gradient(90deg, ${C.orange}, #ff9a3c)`, width: `${(c.enrollments / maxEnrollment) * 100}%`, height: '100%', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Org Overview */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>ORGANISATION OVERVIEW</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Organisation', 'Students', 'Programs', 'Last Payment'].map(h => (
                      <th key={h} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left', padding: '0 0 12px', letterSpacing: '0.05em', paddingRight: 12 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((o, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px 10px 0', color: C.white, fontSize: 13 }}>{o.name}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{o.students.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{o.programs}</td>
                      <td style={{ padding: '10px 0', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{o.lastPayment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
