import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { C, T } from '../tokens'
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
import AdminPricingAndCouponsPanel from '../components/admin/AdminPricingAndCouponsPanel'
import { CourseAuthoringStudio } from './CourseBuilderPage'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview & KPIs', short: 'Home' },
  { id: 'curriculum', label: 'Course & Lecture Studio', short: 'Builder' },
  { id: 'users', label: 'Users & Roles', short: 'Users' },
  { id: 'orgs', label: 'Colleges & Orgs', short: 'Orgs' },
  { id: 'employers', label: 'Employers & Hiring', short: 'Hire' },
  { id: 'enquiries', label: 'Inbound Enquiries', short: 'Mail' },
  { id: 'practice', label: 'Practice Sandboxes', short: 'Labs' },
  { id: 'courses', label: 'Upload Video & Study Material', short: 'Upload' },
  { id: 'payments', label: 'Pricing, Coupons & Gateway', short: 'Pay' },
  { id: 'system', label: 'System & Audit Log', short: 'Audit' },
  { id: 'all', label: 'All Modules (Stacked)', short: 'All' },
]

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderTop: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: '22px 24px',
  boxShadow: '0 10px 28px -12px rgba(15, 23, 42, 0.08)',
} as const

const adminFieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5,
}

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview' || id === 'all') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'curriculum') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'users') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
  if (id === 'orgs') return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  if (id === 'courses') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>
  if (id === 'payments') return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function AdminOverview({ onSelectTab }: { onSelectTab: (tabId: string) => void }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)',
      border: '1px solid rgba(196, 184, 255, 0.42)',
      borderRadius: 18,
      padding: 'clamp(24px, 3.5vw, 34px)',
      color: '#ffffff',
      boxShadow: '0 18px 40px -14px rgba(59, 45, 150, 0.35)',
    }}>
      <p style={{ margin: '0 0 8px', color: '#e9d5ff', font: '700 11px/1.4 var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        SUPERADMIN C-SUITE COMMAND OS · CEO / CFO / CCRO / CAO TELEMETRY
      </p>
      <h1 className="skylent-display-sm" style={{ color: '#ffffff', margin: '0 0 8px' }}>Platform overview &amp; Multi-Tab Command Center</h1>
      <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14.5, lineHeight: 1.6, margin: 0, maxWidth: 740 }}>
        Use the left sidebar or top workspace tabs to open any dedicated operational module (Course &amp; Lecture Studio, Users &amp; Roles, Colleges &amp; Orgs, Employers, Practice Labs, Payments &amp; Elixir, or Security Audit Log).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          onClick={() => onSelectTab('curriculum')}
          style={{
            background: '#ffffff',
            color: '#5142b5',
            fontWeight: 600,
            border: '1px solid #ffffff',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13.5,
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
          }}
        >
          Open Course &amp; Lecture Studio →
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('courses')}
          style={{
            background: '#ecfdf5',
            color: '#047857',
            fontWeight: 700,
            border: '1px solid #6ee7b7',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          📤 Upload Video / PDF / Slides →
        </button>
        <a href="/dashboard/curriculum" className="os-btn os-btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Full-Screen Course Builder</a>
        <a href="/dashboard/student" className="os-btn os-btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Open Learner Dashboard</a>
        <a href="/dashboard/faculty" className="os-btn os-btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Open Faculty TA View</a>
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
      if (role === "faculty") {
        try {
          const csrfRes = await fetch("/api/v1/auth/csrf", { credentials: "include" })
          const csrfJson = (await csrfRes.json().catch(() => ({}))) as { token?: string; csrfToken?: string }
          const token = csrfJson.csrfToken || csrfJson.token || ""
          const coursesRes = await fetch("/api/v1/admin/curriculum/courses", { credentials: "include" })
          const coursesJson = (await coursesRes.json().catch(() => ({}))) as { data?: Array<{ id: string }> }
          for (const c of coursesJson.data ?? []) {
            await fetch(`/api/v1/admin/curriculum/courses/${c.id}/faculty`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
              body: JSON.stringify({ userId: user.id }),
            }).catch(() => undefined)
          }
          setMessage(`Assigned Teacher (faculty) role to ${user.displayName} and linked all courses for lecture editing & upload access.`)
        } catch {
          // ignore
        }
      }
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
    <section id="admin-users" style={cardStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
        IDENTITY &amp; ROLE PROVISIONING
      </span>
      <h2 style={{ margin: '2px 0 12px', fontSize: 18, color: '#0f172a' }}>Users &amp; Role Management</h2>
      <form
        onSubmit={(event) => { event.preventDefault(); void load(query) }}
        style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or email"
          aria-label="Search users"
          style={{ ...adminFieldStyle, flex: "1 1 220px", width: 'auto' }}
        />
        <button type="submit" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5', fontWeight: 700 }}>Search</button>
      </form>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading users…</p> : null}
      {status === "error" ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load(query)}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {users.map((user) => {
            const self = user.id === currentUserId
            const role = pendingRole[user.id] ?? user.role
            return (
              <li key={user.id} style={{ padding: "14px 16px", borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: "grid", gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: 14.5 }}>{user.displayName}</strong>
                    <div style={{ color: '#475569', fontSize: 12.5 }}>{user.email}</div>
                    <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>UUID: {user.id}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#5142b5', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase' }}>
                    {user.role}
                  </span>
                </div>
                {self ? (
                  <span style={{ color: C.slate, fontSize: 12 }}>Your own role cannot be changed here.</span>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      aria-label={`Role for ${user.displayName}`}
                      value={role}
                      onChange={(event) => setPendingRole((current) => ({ ...current, [user.id]: event.target.value as AdminRole }))}
                      style={{ ...adminFieldStyle, width: 'auto' }}
                    >
                      {ASSIGNABLE_ROLES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    {role === "organisation" ? (
                      <select
                        aria-label={`Organisation for ${user.displayName}`}
                        value={pendingOrg[user.id] ?? ""}
                        onChange={(event) => setPendingOrg((current) => ({ ...current, [user.id]: event.target.value }))}
                        style={{ ...adminFieldStyle, width: 'auto' }}
                      >
                        <option value="">Choose organisation</option>
                        {organisations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                      </select>
                    ) : null}
                    <button type="button" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }} onClick={() => void saveRole(user)}>Save role</button>
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
    <section id="admin-orgs" style={cardStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
        MULTI-TENANT B2B &amp; CAMPUS ISOLATION
      </span>
      <h2 style={{ margin: '2px 0 12px', fontSize: 18, color: '#0f172a' }}>Organisations &amp; Colleges</h2>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading organisations…</p> : null}
      {status === "error" ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0, display: 'grid', gap: 8 }}>
          {rows.map((org) => (
            <li key={org.id} style={{ padding: "12px 14px", borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: C.ink, fontSize: 14 }}>
              <strong>{org.name}</strong>
              <span style={{ color: C.slate }}> · {org.slug} · {org.memberCount} {org.memberCount === 1 ? "member" : "members"}</span>
            </li>
          ))}
          {rows.length === 0 ? <li style={{ color: C.slate, fontSize: 13 }}>No organisations yet.</li> : null}
        </ul>
      ) : null}
      <form onSubmit={(event) => void create(event)} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Organisation name" aria-label="Organisation name" required style={adminFieldStyle} />
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug" aria-label="Organisation slug" required style={adminFieldStyle} />
        <button type="submit" className="os-btn os-btn-primary" style={{ justifySelf: "start", background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }}>Create organisation</button>
      </form>
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
    <section id="admin-enquiries" style={cardStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
        INBOUND ADMISSIONS &amp; INSTITUTIONAL LEADS
      </span>
      <h2 style={{ margin: '2px 0 8px', fontSize: 18, color: '#0f172a' }}>Enquiries</h2>
      <p style={{ color: C.slate, fontSize: 12.5, lineHeight: 1.6, marginTop: 0 }}>Read only. All public contact, university pathway, and Reva fallback enquiries appear below.</p>
      {message ? <p className="os-error" role="alert">{message}</p> : null}
      {status === "loading" ? <p style={{ color: C.slate, fontSize: 13 }}>Loading enquiries…</p> : null}
      {status === "ready" && rows.length === 0 ? <p style={{ color: C.slate, fontSize: 13 }}>No enquiries yet.</p> : null}
      {status === "ready" ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {rows.map((row) => (
            <li key={row.id} style={{ padding: "12px 14px", borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <strong style={{ color: C.ink }}>{row.name}</strong>
              <div style={{ color: C.slate, fontSize: 12 }}>{row.kind} · {row.email}{row.programSlug ? ` · ${row.programSlug}` : ""}</div>
              {row.message ? <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.6, margin: "6px 0 0" }}>{row.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
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
    <section id="admin-employers" style={cardStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
        CAREER OS HIRING PARTNERS &amp; RECRUITER LINKING
      </span>
      <h2 style={{ margin: '2px 0 8px', fontSize: 18, color: '#0f172a' }}>Employers</h2>
      <p style={{ color: C.slate, fontSize: 12.5, lineHeight: 1.6, marginTop: 0 }}>
        Linking a user does not publish jobs. The user needs the recruiter or superadmin role first.
      </p>
      {message ? <p role="status" style={{ color: C.ink, fontSize: 13 }}>{message}</p> : null}
      {status === 'loading' ? <p style={{ color: C.slate, fontSize: 13 }}>Loading employers…</p> : null}
      {status === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}
      {status === 'ready' && rows.length === 0 ? <p style={{ color: C.slate, fontSize: 13 }}>No employers yet.</p> : null}
      {status === 'ready' ? (
        <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'grid', gap: 10 }}>
          {rows.map((employer) => (
            <li key={employer.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: C.ink, fontSize: 14 }}>
              <strong>{employer.name}</strong>
              <div style={{ color: C.slate, fontSize: 12 }}>{employer.slug} · {employer.memberCount} linked · {employer.jobCount} jobs</div>
              <button
                type="button"
                className="os-btn os-btn-ghost"
                aria-expanded={openEmployerId === employer.id}
                onClick={() => (openEmployerId === employer.id ? setOpenEmployerId(null) : void loadMembers(employer.id))}
                style={{ marginTop: 6 }}
              >
                {openEmployerId === employer.id ? 'Hide recruiters' : 'Show recruiters'}
              </button>
              {openEmployerId === employer.id ? (
                <div style={{ marginTop: 8 }}>
                  {membersStatus === 'loading' ? <p style={{ color: C.slate, fontSize: 13 }}>Loading recruiters…</p> : null}
                  {membersStatus === 'error' ? (
                    <p role="alert" style={{ color: C.ink, fontSize: 13 }}>
                      Recruiters could not be loaded.{' '}
                      <button type="button" className="os-btn os-btn-ghost" onClick={() => void loadMembers(employer.id)}>Try again</button>
                    </p>
                  ) : null}
                  {membersStatus === 'ready' && members.length === 0 ? <p style={{ color: C.slate, fontSize: 13 }}>No recruiters linked.</p> : null}
                  {membersStatus === 'ready' && members.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {members.map((member) => (
                        <li key={member.userId} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                          <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{member.displayName || member.email} <span style={{ color: C.slate }}>· {member.email}</span></span>
                          <button type="button" className="os-btn os-btn-ghost" onClick={() => void removeMember(employer.id, member)}>Remove</button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <form onSubmit={(event) => void create(event)} style={{ display: 'grid', gap: 8 }}>
          <strong style={{ fontSize: 13.5, color: '#0f172a' }}>Create Employer Profile</strong>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Employer name" aria-label="Employer name" required minLength={2} style={adminFieldStyle} />
          <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="employer-slug" aria-label="Employer slug" required style={adminFieldStyle} />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" aria-label="Employer location" style={adminFieldStyle} />
          <button type="submit" className="os-btn os-btn-primary" style={{ justifySelf: 'start', background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }}>Create employer</button>
        </form>
        <form onSubmit={(event) => void linkMember(event)} style={{ display: 'grid', gap: 8 }}>
          <strong style={{ fontSize: 13.5, color: '#0f172a' }}>Link Recruiter User to Employer</strong>
          <select aria-label="Employer to link" required value={employerId} onChange={(event) => setEmployerId(event.target.value)} style={adminFieldStyle}>
            <option value="">Choose employer</option>
            {rows.map((employer) => <option key={employer.id} value={employer.id}>{employer.name}</option>)}
          </select>
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User id from the Users list" aria-label="User id" required style={adminFieldStyle} />
          <button type="submit" className="os-btn os-btn-ghost" style={{ justifySelf: 'start' }}>Link recruiter</button>
        </form>
      </div>
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
    <section id="admin-practice" style={cardStyle}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
        BROWSER EXECUTION SANDBOXES &amp; CASE WORKSPACES
      </span>
      <h2 style={{ margin: '2px 0 8px', fontSize: 18, color: '#0f172a' }}>Practice workspaces</h2>
      <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, marginTop: 0, maxWidth: 680 }}>
        A syllabus is classified on the server. Publication happens only after validation and approval. Another course&apos;s dataset or case is refused.
      </p>
      <form onSubmit={(event) => void createWorkspace(event)} style={{ display: "grid", gap: 10, maxWidth: 640, marginTop: 12 }}>
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="course-slug" aria-label="Practice course slug" required style={adminFieldStyle} />
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Case title" aria-label="Case title" required style={adminFieldStyle} />
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Case notes for this course" aria-label="Case notes" required minLength={40} rows={4} style={{ ...adminFieldStyle, minHeight: 96 }} />
        <button type="submit" className="os-btn os-btn-primary" disabled={pending} style={{ justifySelf: "start", background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }}>Recommend workspace</button>
      </form>
      {message ? <p style={{ color: C.slate, fontSize: 13 }}>{message}</p> : null}
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 10 }}>
        {rows.map((row) => (
          <li key={row.id} style={{ minWidth: 0, padding: "14px 16px", border: '1px solid #e2e8f0', borderRadius: 12, background: "#f8fafc" }}>
            <strong style={{ color: C.ink, fontSize: 15 }}>{row.courseSlug}</strong>
            <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>{row.status}{row.adapterId ? ` · ${row.adapterId}` : ""} · revision {row.revision}</div>
            <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.5, margin: "8px 0" }}>{row.manifest.learnerNote}</p>
            <p style={{ color: C.slate, fontSize: 12, margin: "0 0 8px" }}>{row.scores.map((score) => `${score.label} ${score.score}`).join(" · ")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "test")}>Test</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "approve")}>Approve</button>
              <button type="button" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }} onClick={() => void act(row.id, "publish")}>Publish</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "unpublish")}>Unpublish</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "revalidate")}>Revalidate</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdminLessonMediaSection() {
  const [courseSlug, setCourseSlug] = useState('data-analytics')
  const [lessonKey, setLessonKey] = useState('')
  const [playbackId, setPlaybackId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Direct Upload Studio State
  const [coursesList, setCoursesList] = useState<Array<{ id: string; slug: string; title: string }>>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [courseDetail, setCourseDetail] = useState<{
    id: string
    slug: string
    title: string
    coverFileName?: string | null
    modules: Array<{
      id: string
      position: number
      title: string
      lectures: Array<{
        id: string
        position: number
        title: string
        nodeType: string
        summary?: string | null
        referenceUrl?: string | null
        materials?: Array<{ id: string; fileName: string; mimeType: string; byteSize: number }>
      }>
    }>
  } | null>(null)
  const [selectedLectureId, setSelectedLectureId] = useState<string>('')
  const [videoUrlInput, setVideoUrlInput] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function getCsrf() {
    const r = await fetch('/api/v1/auth/csrf', { credentials: 'include' })
    const j = (await r.json().catch(() => ({}))) as { csrfToken?: string; token?: string }
    return j.csrfToken || j.token || ''
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const res = typeof reader.result === 'string' ? reader.result : ''
        resolve(res.includes(',') ? res.split(',')[1] ?? '' : res)
      }
      reader.onerror = () => reject(new Error('Could not read file'))
      reader.readAsDataURL(file)
    })
  }

  async function loadCourseDetail(cId: string) {
    if (!cId) return
    try {
      const res = await fetch(`/api/v1/admin/curriculum/courses/${cId}`, { credentials: 'include' })
      const json = (await res.json().catch(() => ({}))) as { data?: typeof courseDetail }
      if (json.data) {
        setCourseDetail(json.data)
        const allLecs = json.data.modules.flatMap((m) => m.lectures)
        if (allLecs[0] && (!selectedLectureId || !allLecs.some((l) => l.id === selectedLectureId))) {
          setSelectedLectureId(allLecs[0].id)
          setVideoUrlInput(allLecs[0].referenceUrl ?? '')
        }
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void fetch('/api/v1/admin/curriculum/courses', { credentials: 'include' })
      .then((r) => r.json())
      .then((j: { data?: Array<{ id: string; slug: string; title: string }> }) => {
        const rows = j.data ?? []
        setCoursesList(rows)
        if (rows[0]) {
          setSelectedCourseId(rows[0].id)
          void loadCourseDetail(rows[0].id)
        }
      })
      .catch(() => undefined)
  }, [])

  async function handleDirectFileUpload(lectureId: string, file: File | null) {
    if (!file || !lectureId || !selectedCourseId) return
    setUploading(true)
    setUploadStatus(null)
    setUploadError(null)
    try {
      const token = await getCsrf()
      const dataBase64 = await toBase64(file)
      const res = await fetch(`/api/v1/admin/curriculum/lectures/${lectureId}/materials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          dataBase64,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      setUploadStatus(`✓ Uploaded "${file.name}" (${Math.max(1, Math.round(file.size / 1024))} KB) to lecture! Students can now watch/download it in /learn/${courseDetail?.slug ?? ''}.`)
      await loadCourseDetail(selectedCourseId)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveVideoUrl(e: FormEvent) {
    e.preventDefault()
    if (!selectedLectureId || !selectedCourseId) return
    setUploading(true)
    setUploadStatus(null)
    setUploadError(null)
    try {
      const token = await getCsrf()
      const res = await fetch(`/api/v1/admin/curriculum/lectures/${selectedLectureId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify({ referenceUrl: videoUrlInput.trim() || null }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Could not save video URL')
      setUploadStatus('✓ Saved Video / Reference URL to lecture! It is now live in the Student Learning Player.')
      await loadCourseDetail(selectedCourseId)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not save video URL')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteMaterial(materialId: string, fileName: string) {
    if (!selectedCourseId) return
    setUploadStatus(null)
    setUploadError(null)
    try {
      const token = await getCsrf()
      const res = await fetch(`/api/v1/admin/curriculum/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-Token': token },
      })
      if (!res.ok) throw new Error('Could not remove file')
      setUploadStatus(`Removed "${fileName}".`)
      await loadCourseDetail(selectedCourseId)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not remove file')
    }
  }

  async function handleCoverUpload(file: File | null) {
    if (!file || !selectedCourseId) return
    setUploading(true)
    setUploadStatus(null)
    setUploadError(null)
    try {
      const token = await getCsrf()
      const dataBase64 = await toBase64(file)
      const res = await fetch(`/api/v1/admin/curriculum/courses/${selectedCourseId}/cover`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/png',
          dataBase64,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Cover upload failed')
      setUploadStatus(`✓ Uploaded course cover image "${file.name}".`)
      await loadCourseDetail(selectedCourseId)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Cover upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function save(nextId: string | null) {
    setPending(true)
    setMessage(null)
    try {
      const result = await updateLessonPlayback(courseSlug.trim(), lessonKey.trim(), nextId)
      const media = result.data.media
      setMessage(media?.provider === 'mux' && media.playbackId
        ? `Playback id saved for ${result.data.lessonKey}. This does not prove the asset plays.`
        : `Playback cleared for ${result.data.lessonKey}. The lesson shows unavailable until a valid public id is saved.`)
      if (nextId === null) setPlaybackId('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The lesson video could not be updated.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section id="admin-upload-studio" style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
              DIRECT VIDEO, PDF, SLIDES &amp; DATASET UPLOAD STUDIO (ADMIN &amp; TEACHER SYNCED)
            </span>
            <h2 style={{ margin: '2px 0 4px', fontSize: 20, color: '#0f172a' }}>Upload Lecture Videos (.mp4), PDFs, PPTX Slides &amp; Study Files</h2>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: 760 }}>
              Select any Course and Lecture below to directly upload a video file (<code>.mp4</code>, <code>.webm</code>), lecture notes (<code>.pdf</code>, <code>.pptx</code>, <code>.docx</code>), or dataset (<code>.csv</code>, <code>.xlsx</code>, <code>.zip</code>) up to 32 MB — or attach a YouTube / MP4 video stream link. Everything uploaded here appears immediately in the Student Learning Player (<code>/learn/:slug</code>).
            </p>
          </div>
          {courseDetail ? (
            <Link
              to={`/learn/${courseDetail.slug}`}
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                background: '#5142b5',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Preview in Student Player (/learn/{courseDetail.slug}) →
            </Link>
          ) : null}
        </div>

        {uploadStatus ? (
          <div role="status" style={{ marginBottom: 14, padding: '12px 16px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13.5, fontWeight: 700 }}>
            {uploadStatus}
          </div>
        ) : null}
        {uploadError ? (
          <div role="alert" style={{ marginBottom: 14, padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13.5, fontWeight: 700 }}>
            {uploadError}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155' }}>
            1. Select Course
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                void loadCourseDetail(e.target.value)
              }}
              style={adminFieldStyle}
            >
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155' }}>
            2. Select Target Module &amp; Lecture
            <select
              value={selectedLectureId}
              onChange={(e) => {
                const lId = e.target.value
                setSelectedLectureId(lId)
                const found = courseDetail?.modules.flatMap((m) => m.lectures).find((l) => l.id === lId)
                setVideoUrlInput(found?.referenceUrl ?? '')
              }}
              style={adminFieldStyle}
            >
              {(courseDetail?.modules ?? []).map((m) => (
                <optgroup key={m.id} label={`Module ${m.position}: ${m.title}`}>
                  {m.lectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      M{m.position}.{l.position} — {l.title} ({l.nodeType})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          {/* Box 1: Direct File Upload from Device */}
          <div style={{ padding: 16, borderRadius: 14, background: '#f5f3ff', border: '1.5px dashed #5142b5', display: 'grid', gap: 10 }}>
            <strong style={{ fontSize: 14, color: '#5142b5' }}>📤 Option A: Direct File Upload from Computer / Phone</strong>
            <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
              Upload a Lecture Video (<code>.mp4</code>, <code>.webm</code>), PDF Notes, PPTX Slides, Word Doc, or CSV Dataset directly to the selected lecture:
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 18px',
                borderRadius: 10,
                background: '#5142b5',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              {uploading ? 'Uploading File…' : '📤 Choose Video / PDF / PPTX / CSV & Upload'}
              <input
                type="file"
                accept=".mp4,.webm,.mov,.pdf,.ppt,.pptx,.doc,.docx,.csv,.xlsx,.zip,.txt,.md,.png,.jpg,.webp"
                style={{ display: 'none' }}
                onChange={(e) => void handleDirectFileUpload(selectedLectureId, e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Box 2: Video / YouTube URL */}
          <form onSubmit={(e) => void handleSaveVideoUrl(e)} style={{ padding: 16, borderRadius: 14, background: '#ffffff', border: '1px solid #cbd5e1', display: 'grid', gap: 10 }}>
            <strong style={{ fontSize: 14, color: '#0f172a' }}>🎬 Option B: Attach YouTube / Direct MP4 Video Link</strong>
            <input
              type="url"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://.../lecture.mp4"
              style={adminFieldStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={uploading}
                style={{ padding: '9px 16px', borderRadius: 10, background: '#0f172a', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Save Video Link to Lecture
              </button>
              {videoUrlInput ? (
                <button
                  type="button"
                  onClick={() => setVideoUrlInput('')}
                  style={{ padding: '9px 12px', borderRadius: 10, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: 12, cursor: 'pointer' }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </form>

          {/* Box 3: Course Cover Image Upload */}
          <div style={{ padding: 16, borderRadius: 14, background: '#ffffff', border: '1px solid #cbd5e1', display: 'grid', gap: 10 }}>
            <strong style={{ fontSize: 14, color: '#0f172a' }}>🖼️ Option C: Upload Course Cover Thumbnail</strong>
            <p style={{ margin: 0, fontSize: 12.5, color: '#475569' }}>
              Current Cover: <strong>{courseDetail?.coverFileName || 'Default Course Cover'}</strong>
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              📤 Upload Cover Image (PNG / JPG / WebP)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={(e) => void handleCoverUpload(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        {/* All Modules & Lectures Upload List for Selected Course */}
        {courseDetail ? (
          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
              All Modules &amp; Lectures in {courseDetail.title} (Click Upload on any row):
            </strong>
            {courseDetail.modules.map((m) => (
              <div key={m.id} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: 13, color: '#5142b5', display: 'block', marginBottom: 8 }}>
                  Module {m.position}: {m.title}
                </strong>
                <div style={{ display: 'grid', gap: 6 }}>
                  {m.lectures.map((lec) => (
                    <div
                      key={lec.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        fontSize: 12.5,
                      }}
                    >
                      <div>
                        <strong>M{m.position}.{lec.position} {lec.title}</strong>{' '}
                        <span style={{ color: '#64748b', fontSize: 11.5 }}>({lec.nodeType})</span>
                        {lec.referenceUrl ? (
                          <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                            🎬 Video/Link: {lec.referenceUrl}
                          </div>
                        ) : null}
                        {lec.materials && lec.materials.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {lec.materials.map((mat) => (
                              <span
                                key={mat.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: '#f5f3ff',
                                  border: '1px solid #ddd6fe',
                                  color: '#5142b5',
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                <a href={`/api/v1/lms/materials/${mat.id}?download=1`} target="_blank" rel="noopener noreferrer" style={{ color: '#5142b5', textDecoration: 'none' }}>
                                  📥 {mat.fileName} ({Math.max(1, Math.round(mat.byteSize / 1024))} KB)
                                </a>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteMaterial(mat.id, mat.fileName)}
                                  style={{ border: 'none', background: 'transparent', color: '#b91c1c', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <label
                        style={{
                          padding: '5px 11px',
                          borderRadius: 6,
                          background: '#5142b5',
                          color: '#ffffff',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📤 Upload File / Video
                        <input
                          type="file"
                          accept=".mp4,.webm,.mov,.pdf,.ppt,.pptx,.doc,.docx,.csv,.xlsx,.zip,.txt,.md,.png,.jpg,.webp"
                          style={{ display: 'none' }}
                          onChange={(e) => void handleDirectFileUpload(lec.id, e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section id="admin-courses" style={cardStyle}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5', textTransform: 'uppercase' }}>
          OPTIONAL · MUX VIDEO STREAM BINDING
        </span>
        <h2 style={{ margin: '2px 0 8px', fontSize: 18, color: '#0f172a' }}>Mux Playback ID Binding</h2>
        <p style={{ color: C.slate, fontSize: 12.5, lineHeight: 1.6, marginTop: 0, maxWidth: 640 }}>
          If you stream via Mux CDN, attach a public Mux playback ID to a video lesson key below (for direct MP4, YouTube, PDF, or PPTX upload, use the Upload Studio above).
        </p>
        {message ? <p role="status" style={{ color: C.ink, fontSize: 13, maxWidth: 640 }}>{message}</p> : null}
        <form
          onSubmit={(event) => { event.preventDefault(); void save(playbackId.trim() || null) }}
          style={{ display: 'grid', gap: 10, maxWidth: 480 }}
        >
          <input value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} aria-label="Course slug" required style={adminFieldStyle} />
          <input value={lessonKey} onChange={(event) => setLessonKey(event.target.value)} aria-label="Lesson key" placeholder="Lesson key (e.g. l1)" required style={adminFieldStyle} />
          <input value={playbackId} onChange={(event) => setPlaybackId(event.target.value)} aria-label="Mux playback id" placeholder="Public Mux playback id" style={adminFieldStyle} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="os-btn os-btn-primary" style={{ background: '#5142b5', color: '#ffffff', borderColor: '#5142b5' }} disabled={pending}>{pending ? 'Saving…' : 'Save playback id'}</button>
            <button type="button" className="os-btn os-btn-ghost" disabled={pending} onClick={() => void save(null)}>Clear playback id</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function DashboardAdminPage() {
  const { user, ready, authorized } = useRequireRole('superadmin', 'admin')
  const { user: authUser } = useAuth()
  const [activeNav, setActiveNav] = useState('overview')

  if (!ready || !authorized || !user) return null

  const currentUserId = authUser?.id ?? user.id

  const MODULE_LAUNCH_CARDS = [
    { id: 'curriculum', badge: 'STEP 01 · AUTHORING', title: 'Course, Module & Lecture Studio', desc: 'Create draft courses, structure modules, add Notes/Video/Labs/Quizzes, assign Faculty TAs & publish.' },
    { id: 'users', badge: 'STEP 02 · IDENTITY', title: 'Users & Role Provisioning', desc: 'Search accounts and assign Student, Faculty TA, College/Org, Recruiter, or Superadmin roles.' },
    { id: 'orgs', badge: 'STEP 03 · CAMPUS B2B', title: 'Colleges & Organisations', desc: 'Create isolated College and Enterprise tenants for cohort tracking & CSV reporting.' },
    { id: 'employers', badge: 'STEP 04 · CAREER OS', title: 'Employers & Recruiter Linking', desc: 'Create hiring partner companies and link Recruiter accounts to post jobs.' },
    { id: 'payments', badge: 'STEP 05 · ECONOMY', title: 'Payments, Refunds & Elixir Store', desc: 'Record verified payments, manage Elixir earning rules, and publish Case Studies.' },
    { id: 'practice', badge: 'STEP 06 · SANDBOXES', title: 'Practice Studios & Video Media', desc: 'Configure browser case workspaces and attach Mux video playback IDs.' },
  ]

  return (
    <AuthDashboardShell
      themeId="superadmin"
      workspaceLabel="Platform"
      roleLabel="Super Admin"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'curriculum', 'users', 'payments', 'system'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="admin-overview" style={{ display: 'grid', gap: 22 }}>
        {/* Horizontal Multi-Tab Workspace Switcher Bar */}
        <div
          role="tablist"
          aria-label="Superadmin Command Tabs"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 14,
            background: '#f6f4ff',
            border: '1px solid #ddd6fe',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveNav(item.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid #5142b5' : '1px solid #cbd5e1',
                  background: active ? '#5142b5' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: OVERVIEW (Hero + C-Suite KPIs + Module Launchpad Cards) */}
        {activeNav === 'overview' ? (
          <>
            <AdminOverview onSelectTab={setActiveNav} />
            <AdminPricingAndCouponsPanel />
            <AdminPlatform sectionFilter="overview" />
            <section style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#5142b5' }}>
                    DEDICATED WORKSPACE MODULES · CLICK ANY CARD OR LEFT SIDEBAR TAB
                  </span>
                  <h2 style={{ margin: '2px 0 0', fontSize: 19, color: '#0f172a' }}>Superadmin Operational Workspaces</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: '1px solid #5142b5',
                    background: '#ffffff',
                    color: '#5142b5',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Open All Modules on One Page →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {MODULE_LAUNCH_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveNav(card.id)}
                    style={{
                      ...cardStyle,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#5142b5' }}>
                        {card.badge}
                      </span>
                      <h3 style={{ margin: '4px 0 6px', fontSize: 17, color: '#0f172a' }}>{card.title}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{card.desc}</p>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#5142b5' }}>
                      Open {card.title} Tab →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {/* TAB 2: EMBEDDED COURSE, MODULE & LECTURE STUDIO */}
        {activeNav === 'curriculum' ? (<><CourseAuthoringStudio embedded /><AdminPricingAndCouponsPanel /></>) : null}

        {/* TAB 3: USERS & ROLES */}
        {activeNav === 'users' ? <AdminUsersSection currentUserId={currentUserId} /> : null}

        {/* TAB 4: ORGANISATIONS & COLLEGES */}
        {activeNav === 'orgs' ? <AdminOrganisationsSection /> : null}

        {/* TAB 5: EMPLOYERS & RECRUITER LINKING */}
        {activeNav === 'employers' ? <AdminEmployersSection /> : null}

        {/* TAB 6: INBOUND ENQUIRIES */}
        {activeNav === 'enquiries' ? <AdminEnquiriesSection /> : null}

        {/* TAB 7: PRACTICE WORKSPACES */}
        {activeNav === 'practice' ? <AdminPracticeSection /> : null}

        {/* TAB 8: LESSON VIDEO (MUX) */}
        {activeNav === 'courses' ? <AdminLessonMediaSection /> : null}

        {/* TAB 9: PAYMENTS, REFUNDS & ELIXIR */}
        {activeNav === 'payments' ? (<><AdminPricingAndCouponsPanel /><AdminPlatform sectionFilter="payments" /></>) : null}

        {/* TAB 10: SYSTEM & SECURITY AUDIT LOG */}
        {activeNav === 'system' ? (
          <>
            <AdminPlatform sectionFilter="overview" />
            <AdminPlatform sectionFilter="system" />
          </>
        ) : null}

        {/* TAB 11: ALL MODULES STACKED (2-Column Command Grid) */}
        {activeNav === 'all' ? (
          <>
            <AdminOverview onSelectTab={setActiveNav} />
            <AdminPlatform sectionFilter="overview" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', gap: 20, alignItems: 'start' }}>
              <AdminUsersSection currentUserId={currentUserId} />
              <AdminOrganisationsSection />
              <AdminEmployersSection />
              <AdminEnquiriesSection />
              <AdminPracticeSection />
              <AdminLessonMediaSection />
            </div>
            <AdminPlatform sectionFilter="payments" />
            <AdminPlatform sectionFilter="system" />
          </>
        ) : null}
      </div>
    </AuthDashboardShell>
  )
}
