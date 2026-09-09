import { useState } from 'react'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useRequireRole } from '../hooks/useRequireRole'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'admin-overview' },
  { id: 'users', label: 'Users', short: 'Users', sectionId: 'admin-users' },
  { id: 'orgs', label: 'Organisations', short: 'Orgs', sectionId: 'admin-orgs' },
  { id: 'courses', label: 'Courses', short: 'Courses', sectionId: 'admin-courses' },
  { id: 'payments', label: 'Payments', short: 'Pay', sectionId: 'admin-payments' },
  { id: 'system', label: 'System', short: 'System', sectionId: 'admin-system' },
]

const accent = getRoleAccent('superadmin')

const canvasRow = {
  padding: '22px 0',
  borderBottom: `1px solid ${T.lineLight}`,
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

function AdminOverview() {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <AuroraBand themeId="superadmin" />
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 3.5vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px' }}>Platform overview</h1>
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 640 }}>
          The Super Admin workspace is connected to the authenticated platform role. Live platform metrics are shown only when backed by the admin API.
        </p>
        <div style={{ padding: '18px 0', borderTop: `1px solid ${T.lineLight}`, borderBottom: `1px solid ${T.lineLight}` }}>
          <div style={{ color: accent.text, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Live data boundary</div>
          <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.7 }}>
            No fabricated enrollment, revenue, organisation, uptime, or course-ranking figures are rendered here. Once the corresponding APIs are connected, this surface can display verified data without changing the workspace structure.
          </div>
        </div>
      </div>
    </GlassSurface>
  )
}

function AdminSection({
  id,
  title,
  description,
  last,
}: {
  id: string
  title: string
  description: string
  last?: boolean
}) {
  return (
    <div id={id} style={last ? { paddingTop: 22 } : canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>{title}</div>
      <div style={{ padding: '18px 20px', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, background: 'rgba(11,13,15,0.02)' }}>
        <div style={{ color: C.ink, fontSize: 13, marginBottom: 6 }}>{title} API not connected</div>
        <p style={{ color: C.slate, fontSize: 12, lineHeight: 1.7, margin: 0, maxWidth: 620 }}>{description}</p>
      </div>
    </div>
  )
}

export default function DashboardAdminPage() {
  const { user, ready, authorized } = useRequireRole('superadmin')
  const [activeNav, setActiveNav] = useState('overview')

  if (!ready || !authorized || !user) return null

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
        <div style={{ color: C.slate, fontSize: 11, marginBottom: 20, padding: '10px 14px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rControl }}>
          Development preview — live platform data appears only when the admin APIs are connected. This workspace does not invent operational metrics or business activity.
        </div>

        <AdminOverview />

        <div style={{ marginTop: 32 }}>
          <AdminSection id="admin-users" title="Users" description="User administration, audit data, and account activity require the corresponding protected admin API." />
          <AdminSection id="admin-orgs" title="Organisations" description="Organisation records, memberships, programs, and billing summaries require connected organisation administration APIs." />
          <AdminSection id="admin-courses" title="Courses" description="Course administration and enrollment rankings require verified catalog and enrollment data." />
          <AdminSection id="admin-payments" title="Payments" description="Revenue reporting, refunds, and payment gateway operations require the protected payments API." />
          <AdminSection id="admin-system" title="System" description="Service health and uptime must come from live monitoring rather than placeholder values." last />
        </div>
      </div>
    </AuthDashboardShell>
  )
}
