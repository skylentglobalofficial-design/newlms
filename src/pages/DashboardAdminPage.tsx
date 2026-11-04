import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { useRequireRole } from '../hooks/useRequireRole'
import { useAuth } from '../context/AuthContext'
import {
  assignAdminUserRole,
  createAdminOrganisation,
  createAdminEmployer,
  linkAdminEmployerMember,
  listAdminEmployerMembers,
  listAdminEmployers,
  listAdminEnquiries,
  listAdminOrganisations,
  listAdminUsers,
  removeAdminEmployerMember,
  resetAdminUserToStudent,
  actOnAdminPracticeWorkspace,
  configureAdminPracticeWorkspace,
  createAdminPracticeWorkspace,
  listAdminPracticeWorkspaces,
  updateLessonPlayback,
  type AdminPracticeWorkspace,
  type AdminEmployer,
  type AdminEmployerMember,
  type AdminEnquiry,
  type AdminOrganisation,
  type AdminRole,
  type AdminUser,
} from '../lib/admin-api'
import AdminPlatform from '../components/admin/AdminPlatform'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'admin-overview' },
  { id: 'users', label: 'Users & Roles', short: 'Users', sectionId: 'admin-users' },
  { id: 'orgs', label: 'Organisations', short: 'Orgs', sectionId: 'admin-orgs' },
  { id: 'employers', label: 'Employers', short: 'Hire', sectionId: 'admin-employers' },
  { id: 'enquiries', label: 'Enquiries', short: 'Mail', sectionId: 'admin-enquiries' },
  { id: 'practice', label: 'Practice Studios', short: 'Labs', sectionId: 'admin-practice' },
  { id: 'courses', label: 'Lesson Media', short: 'Video', sectionId: 'admin-courses' },
  { id: 'payments', label: 'Elixir & Economics', short: 'Pay', sectionId: 'admin-payments' },
  { id: 'system', label: 'System & AI', short: 'System', sectionId: 'admin-system' },
  { id: 'curriculum', label: 'Course Builder', short: 'Builder', href: '/dashboard/curriculum' },
  { id: 'student-view', label: 'Learner View', short: 'Learner', href: '/dashboard/student' },
]

const cardBoxStyle = {
  padding: '24px 26px',
  borderRadius: 18,
  background: '#FFFFFF',
  border: '1.5px solid #DDD7FF',
  borderTop: '4px solid #5142B5',
  boxShadow: '0 10px 26px -14px rgba(81, 66, 181, 0.14)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 14,
} as const

const adminFieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid #CBD5E1',
  background: '#F8FAFC',
  color: '#0F172A',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5,
} as const

const primaryBtnStyle = {
  padding: '9px 16px',
  borderRadius: 10,
  border: '1px solid #5142B5',
  background: '#5142B5',
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
} as const

const ghostBtnStyle = {
  padding: '9px 14px',
  borderRadius: 10,
  border: '1.5px solid #DDD7FF',
  background: '#F5F3FF',
  color: '#5142B5',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
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
    <div style={{
      background: 'linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)',
      border: '1.5px solid rgba(196, 184, 255, 0.45)',
      borderRadius: 20,
      padding: 'clamp(24px, 3.5vw, 34px)',
      color: '#ffffff',
      boxShadow: '0 20px 44px -18px rgba(59, 45, 150, 0.42)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <p style={{ margin: 0, color: '#E9D5FF', font: '700 11px/1.4 var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          SUPERADMIN C-SUITE COMMAND OS · CEO / CFO / CCRO / CAO TELEMETRY
        </p>
        <span style={{ padding: '4px 12px', borderRadius: 999, background: '#DCFCE7', color: '#15803D', fontSize: 11.5, fontWeight: 800 }}>
          ✓ All 6 Flagship Tracks &amp; 90 Lessons Live
        </span>
      </div>
      <h1 className="skylent-display-sm" style={{ color: '#ffffff', margin: '0 0 8px', fontWeight: 800 }}>
        Skylent Platform Command Center
      </h1>
      <p style={{ color: '#E2E8F0', fontSize: 14.5, lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
        Manage user roles, partner colleges &amp; organisations, employer pipelines, practice sandboxes, and Elixir Coin unit economics from one central console.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
        <Link to="/dashboard/curriculum" style={{ padding: '10px 18px', borderRadius: 10, background: '#FFFFFF', color: '#5142B5', fontWeight: 800, fontSize: 13.5, textDecoration: 'none', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)' }}>
          Open Course Builder →
        </Link>
        <Link to="/dashboard/student" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', color: '#ffffff', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
          Open Learner Dashboard
        </Link>
        <Link to="/dashboard/faculty" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', color: '#ffffff', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
          Faculty TA Queue (20m SLA)
        </Link>
        <Link to="/os/labs/data-analytics/northwind" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', color: '#ffffff', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
          Northwind SQL Lab
        </Link>
        <Link to="/verify/SKL-2026-DA-EXEMPLAR" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', color: '#ffffff', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
          Verify Exemplar Dossier
        </Link>
      </div>
    </div>
  )
}

const ASSIGNABLE_ROLES: AdminRole[] = ["student", "faculty", "organisation", "recruiter", "superadmin"]

function AdminUsersSection({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [organisations, setOrganisations] = useState<AdminOrganisation[]>([])
  const [pendingRole, setPendingRole] = useState<Record<string, AdminRole>>({})
  const [pendingOrg, setPendingOrg] = useState<Record<string, string>>({})

  async function load(nextQuery = query) {
    setStatus("loading")
    setMessage(null)
    try {
      const [userResult, orgResult] = await Promise.all([listAdminUsers(nextQuery), listAdminOrganisations()])
      setUsers(userResult.data)
      setOrganisations(orgResult.data)
      setStatus("ready")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Users could not be loaded.")
    }
  }

  useEffect(() => { void load("") }, [])

  async function saveRole(user: AdminUser) {
    const role = pendingRole[user.id] ?? user.role
    const organisationId = pendingOrg[user.id]
    setMessage(null)
    try {
      if (role === "organisation" && !organisationId) {
        setMessage("Choose an existing organisation before assigning the organisation role.")
        return
      }
      const updated = await assignAdminUserRole(user.id, role, role === "organisation" ? organisationId : undefined)
      setUsers((current) => current.map((row) => (row.id === user.id ? updated.data : row)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The role could not be changed.")
    }
  }

  async function makeStudent(user: AdminUser) {
    setMessage(null)
    try {
      const updated = await resetAdminUserToStudent(user.id)
      setUsers((current) => current.map((row) => (row.id === user.id ? updated.data : row)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The role could not be changed.")
    }
  }

  return (
    <section id="admin-users" style={cardBoxStyle} aria-labelledby="admin-users-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            01 · IDENTITY &amp; RBAC ACCESS CONTROL
          </span>
          <h2 id="admin-users-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            Users &amp; Role Assignments
          </h2>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#F5F3FF', border: '1px solid #DDD7FF', color: '#5142B5', fontSize: 11.5, fontWeight: 700 }}>
          {users.length} Loaded
        </span>
      </div>

      <form
        onSubmit={(event) => { event.preventDefault(); void load(query) }}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search user by name or email..."
          aria-label="Search users"
          style={{ ...adminFieldStyle, flex: "1 1 240px" }}
        />
        <button type="submit" style={primaryBtnStyle}>Search Users</button>
      </form>

      {message ? <p className="os-error" role="alert" style={{ margin: 0 }}>{message}</p> : null}
      {status === "loading" ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Loading users…</p> : null}
      {status === "error" ? <button type="button" style={ghostBtnStyle} onClick={() => void load(query)}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
          {users.map((user) => {
            const self = user.id === currentUserId
            const role = pendingRole[user.id] ?? user.role
            return (
              <li key={user.id} style={{ padding: "14px 16px", borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: "grid", gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: 14.5 }}>{user.displayName}</strong>
                    <div style={{ color: '#475569', fontSize: 12.5 }}>{user.email}</div>
                    <code style={{ color: '#64748B', fontSize: 11 }}>ID: {user.id}</code>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: user.role === 'superadmin' ? '#DCFCE7' : '#EDE9FE', color: user.role === 'superadmin' ? '#15803D' : '#5142B5', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                    {user.role}
                  </span>
                </div>
                {self ? (
                  <span style={{ color: '#64748B', fontSize: 12 }}>Active Superadmin session (role locked).</span>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      aria-label={`Role for ${user.displayName}`}
                      value={role}
                      onChange={(event) => setPendingRole((current) => ({ ...current, [user.id]: event.target.value as AdminRole }))}
                      style={{ ...adminFieldStyle, width: 'auto', padding: '7px 10px' }}
                    >
                      {ASSIGNABLE_ROLES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    {role === "organisation" ? (
                      <select
                        aria-label={`Organisation for ${user.displayName}`}
                        value={pendingOrg[user.id] ?? ""}
                        onChange={(event) => setPendingOrg((current) => ({ ...current, [user.id]: event.target.value }))}
                        style={{ ...adminFieldStyle, width: 'auto', padding: '7px 10px' }}
                      >
                        <option value="">Choose organisation</option>
                        {organisations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                      </select>
                    ) : null}
                    <button type="button" style={primaryBtnStyle} onClick={() => void saveRole(user)}>Save role</button>
                    {user.role !== "student" ? (
                      <button type="button" style={ghostBtnStyle} onClick={() => void makeStudent(user)}>Reset to student</button>
                    ) : null}
                  </div>
                )}
              </li>
            )
          })}
          {users.length === 0 ? <li style={{ color: '#64748B', fontSize: 13 }}>No users match that search.</li> : null}
        </ul>
      ) : null}
    </section>
  )
}

function AdminOrganisationsSection() {
  const [rows, setRows] = useState<AdminOrganisation[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setStatus("loading")
    try {
      const result = await listAdminOrganisations()
      setRows(result.data)
      setStatus("ready")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Organisations could not be loaded.")
    }
  }

  useEffect(() => { void load() }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      const created = await createAdminOrganisation(name.trim(), slug.trim())
      setRows((current) => [...current, created.data].sort((a, b) => a.name.localeCompare(b.name)))
      setName("")
      setSlug("")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The organisation could not be created.")
    }
  }

  return (
    <section id="admin-orgs" style={cardBoxStyle} aria-labelledby="admin-orgs-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            02 · PARTNER COLLEGES &amp; L&amp;D TENANTS
          </span>
          <h2 id="admin-orgs-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            Organisations &amp; Institutions
          </h2>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#DCFCE7', color: '#15803D', fontSize: 11.5, fontWeight: 700 }}>
          {rows.length} Active
        </span>
      </div>

      {message ? <p className="os-error" role="alert" style={{ margin: 0 }}>{message}</p> : null}
      {status === "loading" ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Loading organisations…</p> : null}
      {status === "error" ? <button type="button" style={ghostBtnStyle} onClick={() => void load()}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {rows.map((org) => (
            <li key={org.id} style={{ padding: "12px 14px", borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <strong style={{ color: '#0F172A', fontSize: 14 }}>{org.name}</strong>
                <div style={{ color: '#64748B', fontSize: 12 }}>Slug: <code>{org.slug}</code></div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 999, background: '#F5F3FF', border: '1px solid #DDD7FF', color: '#5142B5', fontSize: 11.5, fontWeight: 700 }}>
                {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
              </span>
            </li>
          ))}
          {rows.length === 0 ? <li style={{ color: '#64748B', fontSize: 13 }}>No organisations created yet.</li> : null}
        </ul>
      ) : null}

      <form onSubmit={(event) => void create(event)} style={{ display: "grid", gap: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
        <strong style={{ fontSize: 13.5, color: '#0F172A' }}>Provision New Organisation / College Tenant</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Organisation name (e.g. IITM Partner College)" aria-label="Organisation name" required style={adminFieldStyle} />
          <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="tenant-slug" aria-label="Organisation slug" required style={adminFieldStyle} />
        </div>
        <button type="submit" style={{ ...primaryBtnStyle, justifySelf: "start" }}>Create organisation</button>
      </form>
    </section>
  )
}

function AdminEmployersSection() {
  const [rows, setRows] = useState<AdminEmployer[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [location, setLocation] = useState('')
  const [employerId, setEmployerId] = useState('')
  const [userId, setUserId] = useState('')
  const [openEmployerId, setOpenEmployerId] = useState<string | null>(null)
  const [members, setMembers] = useState<AdminEmployerMember[]>([])
  const [membersStatus, setMembersStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  async function loadMembers(id: string) {
    setOpenEmployerId(id)
    setMembersStatus('loading')
    try {
      const result = await listAdminEmployerMembers(id)
      setMembers(result.data)
      setMembersStatus('ready')
    } catch {
      setMembersStatus('error')
    }
  }

  async function removeMember(id: string, member: AdminEmployerMember) {
    if (!window.confirm(`Remove ${member.displayName || member.email} from this employer? They lose access to its jobs and shared applications.`)) return
    setMessage(null)
    try {
      await removeAdminEmployerMember(id, member.userId)
      await load()
      await loadMembers(id)
      setMessage('Recruiter removed. They no longer see this employer’s jobs.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The recruiter could not be removed.')
    }
  }

  async function load() {
    setStatus('loading')
    setMessage(null)
    try {
      const result = await listAdminEmployers()
      setRows(result.data)
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Employers could not be loaded.')
    }
  }

  useEffect(() => { void load() }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      await createAdminEmployer({
        name: name.trim(),
        slug: slug.trim(),
        ...(location.trim() ? { location: location.trim() } : {}),
      })
      setName('')
      setSlug('')
      setLocation('')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The employer could not be created.')
    }
  }

  async function linkMember(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      await linkAdminEmployerMember(employerId, userId.trim())
      setUserId('')
      await load()
      setMessage('Recruiter linked. They can now create jobs for that employer.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The recruiter could not be linked.')
    }
  }

  return (
    <section id="admin-employers" style={cardBoxStyle} aria-labelledby="admin-employers-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            03 · HIRING PARTNERS &amp; RECRUITER SEATS
          </span>
          <h2 id="admin-employers-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            Employers &amp; Recruiter Access
          </h2>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#F5F3FF', border: '1px solid #DDD7FF', color: '#5142B5', fontSize: 11.5, fontWeight: 700 }}>
          {rows.length} Employers
        </span>
      </div>
      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
        Create hiring partner profiles and link recruiter user accounts so they can post skill-matched openings in Career OS.
      </p>
      {message ? <p role="status" style={{ color: '#0F172A', fontSize: 13, margin: 0, fontWeight: 600 }}>{message}</p> : null}
      {status === 'loading' ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Loading employers…</p> : null}
      {status === 'error' ? <button type="button" style={ghostBtnStyle} onClick={() => void load()}>Try again</button> : null}
      {status === 'ready' && rows.length === 0 ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>No employers registered yet.</p> : null}
      {status === 'ready' && rows.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {rows.map((employer) => (
            <li key={employer.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <strong>{employer.name}</strong>
                  <div style={{ color: '#64748B', fontSize: 12 }}>{employer.slug} · {employer.memberCount} linked · {employer.jobCount} jobs</div>
                </div>
                <button
                  type="button"
                  style={ghostBtnStyle}
                  aria-expanded={openEmployerId === employer.id}
                  onClick={() => (openEmployerId === employer.id ? setOpenEmployerId(null) : void loadMembers(employer.id))}
                >
                  {openEmployerId === employer.id ? 'Hide recruiters' : 'Show recruiters'}
                </button>
              </div>
              {openEmployerId === employer.id ? (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0' }}>
                  {membersStatus === 'loading' ? <p style={{ color: '#64748B', fontSize: 13 }}>Loading recruiters…</p> : null}
                  {membersStatus === 'error' ? (
                    <p role="alert" style={{ color: '#0F172A', fontSize: 13 }}>
                      Recruiters could not be loaded.{' '}
                      <button type="button" style={ghostBtnStyle} onClick={() => void loadMembers(employer.id)}>Try again</button>
                    </p>
                  ) : null}
                  {membersStatus === 'ready' && members.length === 0 ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>No recruiters linked.</p> : null}
                  {membersStatus === 'ready' && members.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                      {members.map((member) => (
                        <li key={member.userId} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>{member.displayName || member.email} <span style={{ color: '#64748B' }}>· {member.email}</span></span>
                          <button type="button" style={ghostBtnStyle} onClick={() => void removeMember(employer.id, member)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
        <form onSubmit={(event) => void create(event)} style={{ display: 'grid', gap: 8 }}>
          <strong style={{ fontSize: 13, color: '#0F172A' }}>Create New Employer</strong>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Employer name" aria-label="Employer name" required minLength={2} style={adminFieldStyle} />
          <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="employer-slug" aria-label="Employer slug" required style={adminFieldStyle} />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location (e.g. Bengaluru / Remote)" aria-label="Employer location" style={adminFieldStyle} />
          <button type="submit" style={{ ...primaryBtnStyle, justifySelf: 'start' }}>Create employer</button>
        </form>
        <form onSubmit={(event) => void linkMember(event)} style={{ display: 'grid', gap: 8 }}>
          <strong style={{ fontSize: 13, color: '#0F172A' }}>Link Recruiter User ID</strong>
          <select aria-label="Employer to link" required value={employerId} onChange={(event) => setEmployerId(event.target.value)} style={adminFieldStyle}>
            <option value="">Choose employer</option>
            {rows.map((employer) => <option key={employer.id} value={employer.id}>{employer.name}</option>)}
          </select>
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID from Users list" aria-label="User id" required style={adminFieldStyle} />
          <button type="submit" style={{ ...ghostBtnStyle, justifySelf: 'start' }}>Link recruiter</button>
        </form>
      </div>
    </section>
  )
}

function AdminEnquiriesSection() {
  const [rows, setRows] = useState<AdminEnquiry[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void listAdminEnquiries()
      .then((result) => { if (!cancelled) { setRows(result.data); setStatus("ready") } })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus("error")
          setMessage(error instanceof Error ? error.message : "Enquiries could not be loaded.")
        }
      })
    return () => { cancelled = true }
  }, [])

  return (
    <section id="admin-enquiries" style={cardBoxStyle} aria-labelledby="admin-enquiries-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            04 · INBOUND LEADS &amp; INSTITUTIONAL REQUESTS
          </span>
          <h2 id="admin-enquiries-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            Learner &amp; University Enquiries
          </h2>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#F5F3FF', border: '1px solid #DDD7FF', color: '#5142B5', fontSize: 11.5, fontWeight: 700 }}>
          {rows.length} Messages
        </span>
      </div>
      {message ? <p className="os-error" role="alert" style={{ margin: 0 }}>{message}</p> : null}
      {status === "loading" ? <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Loading enquiries…</p> : null}
      {status === "ready" && rows.length === 0 ? (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: 13.5 }}>
          No inbound enquiries recorded yet. Submissions from <code>/contact</code>, <code>/education</code>, and the Site Assistant appear here automatically.
        </div>
      ) : null}
      {status === "ready" && rows.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: 'grid', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
          {rows.map((row) => (
            <li key={row.id} style={{ padding: "12px 14px", borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#0F172A', fontSize: 14 }}>{row.name}</strong>
              <div style={{ color: '#5142B5', fontSize: 12, fontWeight: 600 }}>{row.kind} · {row.email}{row.programSlug ? ` · ${row.programSlug}` : ""}</div>
              {row.message ? <p style={{ color: '#334155', fontSize: 13, lineHeight: 1.5, margin: "6px 0 0" }}>{row.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AdminPracticeSection() {
  const [rows, setRows] = useState<AdminPracticeWorkspace[]>([])
  const [slug, setSlug] = useState("")
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function reload() {
    const result = await listAdminPracticeWorkspaces()
    setRows(result.data)
  }

  useEffect(() => {
    void reload().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Practice workspaces could not be loaded."))
  }, [])

  async function createWorkspace(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    try {
      const created = await createAdminPracticeWorkspace({
        courseSlug: slug.trim(),
        title: title.trim(),
        outcomes: ["Frame the problem from the course notes"],
        tools: ["case notes"],
        lessons: [{ id: "l1", title: "Read the notes", type: "notes", exercise: "case" }],
      })
      const configured = await configureAdminPracticeWorkspace(created.data.id, {
        adapterId: "case-studio",
        lessonIds: ["l1"],
        caseTitle: title.trim(),
        caseNotes: notes.trim(),
      })
      setMessage(`${configured.data.courseSlug} is ${configured.data.status}.`)
      setSlug("")
      setTitle("")
      setNotes("")
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The workspace could not be created.")
    } finally {
      setPending(false)
    }
  }

  async function act(id: string, action: "test" | "approve" | "publish" | "unpublish" | "revalidate") {
    setMessage(null)
    try {
      const result = await actOnAdminPracticeWorkspace(id, action)
      const detail = result.data && "detail" in result.data ? result.data.detail : null
      setMessage(detail ?? "Updated.")
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The workspace could not be updated.")
    }
  }

  return (
    <section id="admin-practice" style={cardBoxStyle} aria-labelledby="admin-practice-title">
      <div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          05 · IN-BROWSER LAB &amp; CASE STUDIO GOVERNANCE
        </span>
        <h2 id="admin-practice-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
          Practice Workspaces &amp; Lab Validation
        </h2>
      </div>
      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
        Configure and validate custom case studios for authored courses. Publication requires automated server validation and approval.
      </p>
      <form onSubmit={(event) => void createWorkspace(event)} style={{ display: "grid", gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="course-slug" aria-label="Practice course slug" required style={adminFieldStyle} />
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Case studio title" aria-label="Case title" required style={adminFieldStyle} />
        </div>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Case scenario and operational constraints (min 40 chars)..." aria-label="Case notes" required minLength={40} rows={3} style={adminFieldStyle} />
        <button type="submit" style={{ ...primaryBtnStyle, justifySelf: "start" }} disabled={pending}>Recommend &amp; Configure Workspace</button>
      </form>
      {message ? <p style={{ color: '#5142B5', fontSize: 13, margin: 0, fontWeight: 600 }}>{message}</p> : null}
      {rows.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <li key={row.id} style={{ padding: "14px 16px", border: '1px solid #E2E8F0', borderRadius: 12, background: "#F8FAFC" }}>
              <strong style={{ color: '#0F172A', fontSize: 14.5 }}>{row.courseSlug}</strong>
              <div style={{ color: '#5142B5', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{row.status}{row.adapterId ? ` · ${row.adapterId}` : ""} · revision {row.revision}</div>
              <p style={{ color: '#334155', fontSize: 13, lineHeight: 1.5, margin: "6px 0" }}>{row.manifest.learnerNote}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <button type="button" style={ghostBtnStyle} onClick={() => void act(row.id, "test")}>Test</button>
                <button type="button" style={ghostBtnStyle} onClick={() => void act(row.id, "approve")}>Approve</button>
                <button type="button" style={primaryBtnStyle} onClick={() => void act(row.id, "publish")}>Publish</button>
                <button type="button" style={ghostBtnStyle} onClick={() => void act(row.id, "unpublish")}>Unpublish</button>
                <button type="button" style={ghostBtnStyle} onClick={() => void act(row.id, "revalidate")}>Revalidate</button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AdminLessonMediaSection() {
  const [courseSlug, setCourseSlug] = useState('data-analytics')
  const [lessonKey, setLessonKey] = useState('')
  const [playbackId, setPlaybackId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function save(nextId: string | null) {
    setPending(true)
    setMessage(null)
    try {
      const result = await updateLessonPlayback(courseSlug.trim(), lessonKey.trim(), nextId)
      const media = result.data.media
      setMessage(media?.provider === 'mux' && media.playbackId
        ? `Playback id saved for ${result.data.lessonKey}.`
        : `Playback cleared for ${result.data.lessonKey}.`)
      if (nextId === null) setPlaybackId('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The lesson video could not be updated.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="admin-courses" style={cardBoxStyle} aria-labelledby="admin-courses-title">
      <div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#5142B5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          06 · LESSON VIDEO &amp; MUX STREAMING BINDING
        </span>
        <h2 id="admin-courses-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
          Lesson Media Playback Manager
        </h2>
      </div>
      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
        Attach or clear a public Mux playback ID on any video lesson node across the 6 flagship courses.
      </p>
      {message ? <p role="status" style={{ color: '#5142B5', fontSize: 13, margin: 0, fontWeight: 600 }}>{message}</p> : null}
      <form
        onSubmit={(event) => { event.preventDefault(); void save(playbackId.trim() || null) }}
        style={{ display: 'grid', gap: 10 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          <input value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} aria-label="Course slug" required style={adminFieldStyle} />
          <input value={lessonKey} onChange={(event) => setLessonKey(event.target.value)} aria-label="Lesson key" placeholder="Lesson key (e.g. l1)" required style={adminFieldStyle} />
        </div>
        <input value={playbackId} onChange={(event) => setPlaybackId(event.target.value)} aria-label="Mux playback id" placeholder="Public Mux playback ID" style={adminFieldStyle} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" style={primaryBtnStyle} disabled={pending}>{pending ? 'Saving…' : 'Save playback id'}</button>
          <button type="button" style={ghostBtnStyle} disabled={pending} onClick={() => void save(null)}>Clear playback id</button>
        </div>
      </form>
    </section>
  )
}

export default function DashboardAdminPage() {
  const { user, ready, authorized } = useRequireRole('superadmin')
  const { user: authUser } = useAuth()
  const [activeNav, setActiveNav] = useState('overview')

  if (!ready || !authorized || !user) return null

  return (
    <AuthDashboardShell
      themeId="superadmin"
      workspaceLabel="Platform Admin"
      roleLabel="Super Admin"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'users', 'employers', 'courses', 'payments'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="admin-overview" style={{ display: 'grid', gap: 24, maxWidth: 1200 }}>
        <AdminOverview />

        {/* C-Suite Unit Economics, Elixir Rules & Payment Ledger */}
        <AdminPlatform />

        {/* 2-Column Structured Admin Operations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20, alignItems: 'start' }}>
          <AdminUsersSection currentUserId={authUser?.id ?? user.id} />
          <div style={{ display: 'grid', gap: 20 }}>
            <AdminOrganisationsSection />
            <AdminEnquiriesSection />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20, alignItems: 'start' }}>
          <AdminEmployersSection />
          <div style={{ display: 'grid', gap: 20 }}>
            <AdminPracticeSection />
            <AdminLessonMediaSection />
          </div>
        </div>
      </div>
    </AuthDashboardShell>
  )
}
