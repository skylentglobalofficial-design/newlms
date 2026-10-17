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

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'admin-overview' },
  { id: 'users', label: 'Users', short: 'Users', sectionId: 'admin-users' },
  { id: 'orgs', label: 'Organisations', short: 'Orgs', sectionId: 'admin-orgs' },
  { id: 'employers', label: 'Employers', short: 'Hire', sectionId: 'admin-employers' },
  { id: 'enquiries', label: 'Enquiries', short: 'Mail', sectionId: 'admin-enquiries' },
  { id: 'practice', label: 'Practice', short: 'Labs', sectionId: 'admin-practice' },
  { id: 'courses', label: 'Lesson video', short: 'Video', sectionId: 'admin-courses' },
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
                  <div style={{ color: C.slate, fontSize: 11, wordBreak: 'break-all' }}>User id {user.id}</div>
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

const adminFieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${T.lineLight}`,
  background: 'var(--skylent-surface-paper)',
  color: C.ink,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
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
    <div id="admin-employers" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Employers</div>
      <p style={{ color: C.slate, fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>
        Linking a user does not publish jobs. The user needs the recruiter or superadmin role first.
      </p>
      {message ? <p role="status" style={{ color: C.ink, fontSize: 13 }}>{message}</p> : null}
      {status === 'loading' ? <p style={{ color: C.slate, fontSize: 13 }}>Loading employers…</p> : null}
      {status === 'error' ? <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Try again</button> : null}
      {status === 'ready' && rows.length === 0 ? <p style={{ color: C.slate, fontSize: 13 }}>No employers yet.</p> : null}
      {status === 'ready' ? (
        <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
          {rows.map((employer) => (
            <li key={employer.id} style={{ padding: '10px 0', borderTop: `1px solid ${T.lineLight}`, color: C.ink, fontSize: 14 }}>
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
      <form onSubmit={(event) => void create(event)} style={{ display: 'grid', gap: 8, maxWidth: 480, marginBottom: 18 }}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Employer name" aria-label="Employer name" required minLength={2} style={adminFieldStyle} />
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="employer-slug" aria-label="Employer slug" required style={adminFieldStyle} />
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" aria-label="Employer location" style={adminFieldStyle} />
        <button type="submit" className="os-btn os-btn-primary" style={{ justifySelf: 'start' }}>Create employer</button>
      </form>
      <form onSubmit={(event) => void linkMember(event)} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <select aria-label="Employer to link" required value={employerId} onChange={(event) => setEmployerId(event.target.value)} style={adminFieldStyle}>
          <option value="">Choose employer</option>
          {rows.map((employer) => <option key={employer.id} value={employer.id}>{employer.name}</option>)}
        </select>
        <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User id from the Users list" aria-label="User id" required style={adminFieldStyle} />
        <button type="submit" className="os-btn os-btn-ghost" style={{ justifySelf: 'start' }}>Link recruiter</button>
      </form>
    </div>
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
    <div id="admin-practice" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Practice workspaces</div>
      <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, marginTop: 0, maxWidth: 680 }}>
        A syllabus is classified on the server. Publication happens only after validation and approval. Another course&apos;s dataset or case is refused.
      </p>
      <form onSubmit={(event) => void createWorkspace(event)} style={{ display: "grid", gap: 8, maxWidth: 640, marginTop: 12 }}>
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="course-slug" aria-label="Practice course slug" required style={adminFieldStyle} />
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Case title" aria-label="Case title" required style={adminFieldStyle} />
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Case notes for this course" aria-label="Case notes" required minLength={40} rows={4} style={{ ...adminFieldStyle, minHeight: 96 }} />
        <button type="submit" className="os-btn os-btn-primary" disabled={pending} style={{ justifySelf: "start" }}>Recommend workspace</button>
      </form>
      {message ? <p style={{ color: C.slate, fontSize: 13 }}>{message}</p> : null}
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 10 }}>
        {rows.map((row) => (
          <li key={row.id} style={{ minWidth: 0, padding: "14px 16px", border: `1px solid ${T.lineLight}`, borderRadius: 12, background: "var(--skylent-surface-elevated)" }}>
            <strong style={{ color: C.ink, fontSize: 15 }}>{row.courseSlug}</strong>
            <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>{row.status}{row.adapterId ? ` · ${row.adapterId}` : ""} · revision {row.revision}</div>
            <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.5, margin: "8px 0" }}>{row.manifest.learnerNote}</p>
            <p style={{ color: C.slate, fontSize: 12, margin: "0 0 8px" }}>{row.scores.map((score) => `${score.label} ${score.score}`).join(" · ")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "test")}>Test</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "approve")}>Approve</button>
              <button type="button" className="os-btn os-btn-primary" onClick={() => void act(row.id, "publish")}>Publish</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "unpublish")}>Unpublish</button>
              <button type="button" className="os-btn os-btn-ghost" onClick={() => void act(row.id, "revalidate")}>Revalidate</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
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
    <div id="admin-courses" style={canvasRow}>
      <div style={{ color: C.slate, fontSize: 11, marginBottom: 12 }}>Lesson video</div>
      <p style={{ color: C.slate, fontSize: 12, lineHeight: 1.6, marginTop: 0, maxWidth: 640 }}>
        Attach a public Mux playback id to an existing video lesson. Signed playback and direct upload are not available. A saved id is not the same as a successful playback test.
      </p>
      {message ? <p role="status" style={{ color: C.ink, fontSize: 13, maxWidth: 640 }}>{message}</p> : null}
      <form
        onSubmit={(event) => { event.preventDefault(); void save(playbackId.trim() || null) }}
        style={{ display: 'grid', gap: 8, maxWidth: 480 }}
      >
        <input value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} aria-label="Course slug" required style={adminFieldStyle} />
        <input value={lessonKey} onChange={(event) => setLessonKey(event.target.value)} aria-label="Lesson key" placeholder="Lesson key" required style={adminFieldStyle} />
        <input value={playbackId} onChange={(event) => setPlaybackId(event.target.value)} aria-label="Mux playback id" placeholder="Public playback id" style={adminFieldStyle} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" className="os-btn os-btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save playback id'}</button>
          <button type="button" className="os-btn os-btn-ghost" disabled={pending} onClick={() => void save(null)}>Clear playback id</button>
        </div>
      </form>
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
      <div style={{ padding: '18px 20px', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, background: 'var(--skylent-surface-elevated)' }}>
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
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'users', 'employers', 'courses', 'payments'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="admin-overview">
        <AdminOverview />

        <div style={{ marginTop: 32 }}>
          <AdminUsersSection currentUserId={authUser?.id ?? user.id} />
          <AdminOrganisationsSection />
          <AdminEmployersSection />
          <AdminEnquiriesSection />
          <AdminPracticeSection />
          <AdminLessonMediaSection />
          <AdminSection id="admin-payments" title="Payments" description="Revenue reporting, refunds, and payment gateway operations require the protected payments API." />
          <AdminSection id="admin-system" title="System" description="Service health and uptime must come from live monitoring rather than placeholder values." last />
        </div>
      </div>
    </AuthDashboardShell>
  )
}
