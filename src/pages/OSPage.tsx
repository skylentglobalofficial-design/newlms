import { Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { T } from '../tokens'
import { getDomainAccent } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'

const accent = getDomainAccent('general')

const WORKSPACES: Array<{
  role: UserRole
  title: string
  href: string
  body: string
}> = [
  {
    role: 'student',
    title: 'Learner',
    href: '/dashboard/student',
    body: 'Enrolled courses, lesson progress, assignments, and issued completion certificates.',
  },
  {
    role: 'faculty',
    title: 'Faculty',
    href: '/dashboard/faculty',
    body: 'Submitted work and catalog overview. Course assignment to a faculty account is not modeled yet, so a standard faculty login sees an empty teaching scope.',
  },
  {
    role: 'organisation',
    title: 'Organisation',
    href: '/dashboard/organisation',
    body: 'Membership-scoped organisation dashboards. Unrelated tenants stay out of view.',
  },
  {
    role: 'recruiter',
    title: 'Recruiter',
    href: '/dashboard/recruiter',
    body: 'Recruiter workspace when that role is provisioned. Job listings are not invented here.',
  },
  {
    role: 'superadmin',
    title: 'Admin',
    href: '/dashboard/admin',
    body: 'Platform administration. Completion certificates and learner artifacts stay owner-scoped.',
  },
]

function workspaceHref(href: string, signedIn: boolean, role?: UserRole) {
  if (signedIn && role) {
    const match = WORKSPACES.find((item) => item.role === role)
    if (match && match.href === href) return href
  }
  return `/login?returnTo=${encodeURIComponent(href)}`
}

export default function OSPage() {
  const { user } = useAuth()

  return (
    <PageShell>
      <section style={{ background: C.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 100, padding: '5px 16px', marginBottom: 28 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent.primary }} />
                <span style={{ color: accent.primary, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>SKYLENT OS</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>
                Authenticated workspaces.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 16, lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
                Sign in to the dashboard that matches your role. This page does not show live tenant metrics, invented cohorts, or a simulated LMS.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="two-col">
            {WORKSPACES.map((item, i) => (
              <FadeIn key={item.role} delay={i * 40}>
                <Link
                  to={workspaceHref(item.href, Boolean(user), user?.role)}
                  style={{
                    display: 'block',
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 16,
                    padding: '24px 26px',
                    textDecoration: 'none',
                    minWidth: 0,
                  }}
                >
                  <div style={{ color: accent.primary, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
                    {item.title.toUpperCase()}
                  </div>
                  <div style={{ color: C.white, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{item.title} workspace</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={220}>
            <p style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.6 }}>
              Learning itself happens after enrolment, in <Link to="/skills" style={{ color: accent.text }}>the Learn catalogue</Link>
              {' '}and the live <code style={{ fontFamily: 'var(--font-mono)' }}>/learn</code> workspace. Video plays only when a real asset is published.
            </p>
          </FadeIn>
        </div>
      </section>
    </PageShell>
  )
}
