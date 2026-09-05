import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'admin-overview' },
  { id: 'users', label: 'Users', short: 'Users', sectionId: 'admin-users' },
  { id: 'orgs', label: 'Organisations', short: 'Orgs', sectionId: 'admin-orgs' },
  { id: 'courses', label: 'Courses', short: 'Courses', sectionId: 'admin-courses' },
  { id: 'payments', label: 'Payments', short: 'Pay', sectionId: 'admin-payments' },
  { id: 'system', label: 'System', short: 'System', sectionId: 'admin-system' },
]

const accent = getRoleAccent('superadmin')

const recentEnrollments = [
  { user: 'Arjun Sharma', course: 'Data Science & AI — Pro', amount: '₹44,999', date: '11 Aug 2026', status: 'Confirmed' },
  { user: 'Meera Pillai', course: 'Full Stack Development — Career', amount: '₹54,999', date: '11 Aug 2026', status: 'Confirmed' },
  { user: 'Ravi Kumar', course: 'Data Analytics — Self-paced', amount: '₹19,999', date: '10 Aug 2026', status: 'Pending' },
  { user: 'Shruti Das', course: 'Generative AI — Pro', amount: '₹24,999', date: '10 Aug 2026', status: 'Confirmed' },
  { user: 'Karan Bhat', course: 'Power BI Masterclass', amount: '₹2,999', date: '9 Aug 2026', status: 'Confirmed' },
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

const canvasRow = {
  padding: '22px 0',
  borderBottom: `1px solid ${T.lineDark}`,
} as const

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'users') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
  if (id === 'orgs') return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  if (id === 'courses') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>
  if (id === 'payments') return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function AdminWorkspace() {
  const keyMetrics = [
    { label: 'Total users', value: '12,450' },
    { label: 'Organisations', value: '48' },
    { label: 'Monthly enrollments', value: '2,847' },
    { label: 'Revenue (MTD)', value: '₹42.8L' },
  ]

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <AuroraBand themeId="superadmin" />
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 3.5vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px' }}>Platform overview</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 24px' }}>
          System-wide enrollment, revenue, and operational health.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 32px', padding: '16px 0', borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}` }}>
          {keyMetrics.map(m => (
            <div key={m.label} style={{ flex: '1 1 120px', minWidth: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: accent.text }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassSurface>
  )
}

export default function DashboardAdminPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  if (!ready || !user) return null

  const maxEnrollment = topCourses[0].enrollments

  return (
    <AuthDashboardShell
      themeId="superadmin"
      workspaceLabel="Platform"
      roleLabel="Super Admin"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'users', 'orgs', 'payments', 'system'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="admin-overview">
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 20, padding: '10px 14px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rControl }}>
          Demo data — figures are illustrative only.
        </div>

        <AdminWorkspace />

        <div id="admin-users" style={{ ...canvasRow, marginTop: 32 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 16 }}>Recent enrollments</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  {['User', 'Course', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'left', padding: '0 12px 12px 0', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '11px 12px 11px 0', color: C.white, fontSize: 13 }}>{row.user}</td>
                    <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{row.course}</td>
                    <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{row.amount}</td>
                    <td style={{ padding: '11px 12px 11px 0', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{row.date}</td>
                    <td style={{ padding: '11px 0' }}>
                      <span style={{ background: statusBgs[row.status], color: statusColors[row.status], padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="admin-system" style={{ ...canvasRow }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 16 }}>System health</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {systemHealth.map(s => (
              <div key={s.name} style={{ padding: '14px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ color: C.white, fontSize: 13, marginBottom: 4 }}>{s.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{s.status} · {s.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="admin-courses" style={{ ...canvasRow }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 16 }}>Top courses by enrollment</div>
          {topCourses.map((c, i) => (
            <div key={i} style={{ marginBottom: i < topCourses.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: C.white, fontSize: 13 }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{c.enrollments.toLocaleString()}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                <div style={{ background: accent.primary, width: `${(c.enrollments / maxEnrollment) * 100}%`, height: '100%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div id="admin-orgs" style={{ paddingTop: 22 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 16 }}>Organisation overview</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr>
                  {['Organisation', 'Students', 'Programs', 'Last payment'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'left', padding: '0 0 12px', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgs.map((o, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${T.lineDark}` }}>
                    <td style={{ padding: '12px 12px 12px 0', color: C.white, fontSize: 13 }}>{o.name}</td>
                    <td style={{ padding: '12px 12px 12px 0', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{o.students.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px 12px 0', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{o.programs}</td>
                    <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{o.lastPayment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="admin-payments" style={{ height: 1, marginTop: 32 }} aria-hidden />
      </div>
    </AuthDashboardShell>
  )
}
