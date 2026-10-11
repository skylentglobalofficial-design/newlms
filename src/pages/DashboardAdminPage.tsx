import { useEffect, useState, type FormEvent } from 'react'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useRequireRole } from '../hooks/useRequireRole'
import { useAuth } from '../context/AuthContext'
import {
  assignAdminUserRole,
  createAdminOrganisation,
  listAdminEnquiries,
  listAdminOrganisations,
  listAdminUsers,
  resetAdminUserToStudent,
  type AdminEnquiry,
  type AdminOrganisation,
  type AdminRole,
  type AdminUser,
} from '../lib/admin-api'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'admin-overview' },
  { id: 'users', label: 'Users', short: 'Users', sectionId: 'admin-users' },
  { id: 'orgs', label: 'Organisations', short: 'Orgs', sectionId: 'admin-orgs' },
  { id: 'enquiries', label: 'Enquiries', short: 'Mail', sectionId: 'admin-enquiries' },
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
        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
          Platform metrics appear here only when backed by connected admin APIs.
        </p>
      </div>
    </GlassSurface>
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
    <div id="admin-users" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Users</div>
      <form
        onSubmit={(event) => { event.preventDefault(); void load(query) }}
        style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or email"
          aria-label="Search users"
          style={{ flex: "1 1 220px", minWidth: 0, padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.lineLight}`, background: "transparent", color: C.ink }}
        />
        <button type="submit" className="os-btn os-btn-ghost">Search</button>
      </form>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading users…</p> : null}
      {status === "error" ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load(query)}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {users.map((user) => {
            const self = user.id === currentUserId
            const role = pendingRole[user.id] ?? user.role
            return (
              <li key={user.id} style={{ padding: "14px 0", borderTop: `1px solid ${T.lineLight}`, display: "grid", gap: 8 }}>
                <div>
                  <strong style={{ color: C.ink }}>{user.displayName}</strong>
                  <div style={{ color: C.slate, fontSize: 12 }}>{user.email} · {user.role}</div>
                </div>
                {self ? (
                  <span style={{ color: C.slate, fontSize: 12 }}>Your own role cannot be changed here.</span>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      aria-label={`Role for ${user.displayName}`}
                      value={role}
                      onChange={(event) => setPendingRole((current) => ({ ...current, [user.id]: event.target.value as AdminRole }))}
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.lineLight}`, background: "transparent", color: C.ink }}
                    >
                      {ASSIGNABLE_ROLES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    {role === "organisation" ? (
                      <select
                        aria-label={`Organisation for ${user.displayName}`}
                        value={pendingOrg[user.id] ?? ""}
                        onChange={(event) => setPendingOrg((current) => ({ ...current, [user.id]: event.target.value }))}
                        style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.lineLight}`, background: "transparent", color: C.ink }}
                      >
                        <option value="">Choose organisation</option>
                        {organisations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                      </select>
                    ) : null}
                    <button type="button" className="os-btn os-btn-primary" onClick={() => void saveRole(user)}>Save role</button>
                    {user.role !== "student" ? (
                      <button type="button" className="os-btn os-btn-ghost" onClick={() => void makeStudent(user)}>Set to student</button>
                    ) : null}
                  </div>
                )}
              </li>
            )
          })}
          {users.length === 0 ? <li style={{ color: C.slate, fontSize: 13 }}>No users match that search.</li> : null}
        </ul>
      ) : null}
    </div>
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
    <div id="admin-orgs" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Organisations</div>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading organisations…</p> : null}
      {status === "error" ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
          {rows.map((org) => (
            <li key={org.id} style={{ padding: "10px 0", borderTop: `1px solid ${T.lineLight}`, color: C.ink, fontSize: 14 }}>
              <strong>{org.name}</strong>
              <span style={{ color: C.slate }}> · {org.slug} · {org.memberCount} {org.memberCount === 1 ? "member" : "members"}</span>
            </li>
          ))}
          {rows.length === 0 ? <li style={{ color: C.slate, fontSize: 13 }}>No organisations yet.</li> : null}
        </ul>
      ) : null}
      <form onSubmit={(event) => void create(event)} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Organisation name" aria-label="Organisation name" required style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.lineLight}`, background: "transparent", color: C.ink }} />
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug" aria-label="Organisation slug" required style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.lineLight}`, background: "transparent", color: C.ink }} />
        <button type="submit" className="os-btn os-btn-primary" style={{ justifySelf: "start" }}>Create organisation</button>
      </form>
    </div>
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
    <div id="admin-enquiries" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Enquiries</div>
      <p style={{ color: C.slate, fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>Read only. There is no staff queue or status update yet.</p>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading enquiries…</p> : null}
      {status === "ready" && rows.length === 0 ? <p style={{ color: C.slate, fontSize: 13 }}>No enquiries yet.</p> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((row) => (
            <li key={row.id} style={{ padding: "12px 0", borderTop: `1px solid ${T.lineLight}` }}>
              <strong style={{ color: C.ink }}>{row.name}</strong>
              <div style={{ color: C.slate, fontSize: 12 }}>{row.kind} · {row.email}{row.programSlug ? ` · ${row.programSlug}` : ""}</div>
              {row.message ? <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.6, margin: "6px 0 0" }}>{row.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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
  const { user: authUser } = useAuth()
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
        <AdminOverview />

        <div style={{ marginTop: 32 }}>
          <AdminUsersSection currentUserId={authUser?.id ?? user.id} />
          <AdminOrganisationsSection />
          <AdminEnquiriesSection />
          <AdminSection id="admin-courses" title="Courses" description="Course administration and enrollment rankings require verified catalog and enrollment data." />
          <AdminSection id="admin-payments" title="Payments" description="Revenue reporting, refunds, and payment gateway operations require the protected payments API." />
          <AdminSection id="admin-system" title="System" description="Service health and uptime must come from live monitoring rather than placeholder values." last />
        </div>
      </div>
    </AuthDashboardShell>
  )
}
