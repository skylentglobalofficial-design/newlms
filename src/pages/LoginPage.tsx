import { useState, useEffect, type CSSProperties, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { safeReturnTo } from '../lib/auth-routing'
import { buildGoogleOAuthStartUrl } from '../lib/auth-api'
import { C, T } from '../tokens'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('general')

// Compile-time flag (Vite replaces import.meta.env.VITE_*). Production builds set
// VITE_DEMO_MODE=false via .env.production so the picker is tree-shaken out of dist.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true"

// ─── DEMO USERS (local development only; omitted from production builds) ──────

type DemoEntry = AuthUser & { desc: string }

const DEMO_USERS: DemoEntry[] = DEMO_MODE
  ? [
      { id: 'demo-student', role: 'student', name: 'Arjun Sharma', email: 'arjun@demo.skylent.in', avatar: 'AS', program: 'Data Science & AI', progress: 72, desc: 'Learning dashboard' },
      { id: 'demo-faculty', role: 'faculty', name: 'Dr. Priya Nair', email: 'priya@demo.skylent.in', avatar: 'PN', course: 'Data Science & AI', students: 128, desc: 'Faculty tools' },
      { id: 'demo-org', role: 'organisation', name: 'Apex College', email: 'admin@apex.edu.in', avatar: 'AC', students: 1240, institution: 'Apex College', desc: 'Admin & analytics' },
      { id: 'demo-recruiter', role: 'recruiter', name: 'Riya Menon', email: 'riya@recruit.in', avatar: 'RM', desc: 'Talent pipeline' },
      { id: 'demo-admin', role: 'superadmin', name: 'Skylent Admin', email: 'admin@skylent.in', avatar: 'SA', totalUsers: 12450, desc: 'System overview' },
    ]
  : []

function roleRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

async function finishAuthNavigation(
  navigate: NavigateFunction,
  role: UserRole,
  redirectState: LoginRedirectState | null,
) {
  if (redirectState?.enrollTarget) {
    try {
      const workspace = await fulfillCatalogEnrollment(redirectState.enrollTarget)
      navigate(learnPathForWorkspace(workspace))
      return
    } catch {
      // Fall through to returnTo or role dashboard.
    }
  }
  if (redirectState?.returnTo) {
    navigate(redirectState.returnTo)
    return
  }
  navigate(roleRoute(role))
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  organisation: 'Organisation',
  recruiter: 'Recruiter',
  superadmin: 'Super Admin',
}

// ─── ENTRY VISUAL ─────────────────────────────────────────────────────────────

function EntryVisual() {
  return (
    <div style={{ position: 'relative', maxWidth: 420 }}>
      <div style={{
        padding: '28px 0',
        borderTop: `1px solid ${T.lineLight}`,
        borderBottom: `1px solid ${T.lineLight}`,
      }}>
        <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 380 }}>
          One account for learning, teaching, and institution operations. Sign in to continue where you left off.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
        {[
          { label: 'Programs', detail: 'Structured learning paths' },
          { label: 'Learning', detail: 'Courses, labs & assessments' },
          { label: 'Career OS', detail: 'Interview prep & opportunities' },
        ].map(item => (
          <div key={item.label} style={{ minWidth: 0 }}>
            <div style={{ color: C.ink, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: C.slate, fontSize: 11.5, lineHeight: 1.5 }}>{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── INPUT STYLES ─────────────────────────────────────────────────────────────

function fieldStyle(focused: boolean, hasError?: boolean): CSSProperties {
  return {
    width: '100%',
        background: C.white,
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.55)' : focused ? accent.primary : T.lineLight}`,
    borderRadius: T.rControl,
    padding: '12px 14px',
    color: C.ink,
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }
}

function readOAuthRedirectState(params: URLSearchParams): LoginRedirectState | null {
  const returnTo = params.get('returnTo') ?? undefined
  const enrollKind = params.get('enrollKind')
  const enrollSlug = params.get('enrollSlug')?.trim()
  let enrollTarget: CatalogEnrollTarget | undefined
  if (enrollKind === 'course' && enrollSlug) {
    enrollTarget = { kind: 'course', slug: enrollSlug }
  } else if (enrollKind === 'program' && enrollSlug) {
    enrollTarget = { kind: 'program', slug: enrollSlug }
  }

  if (!returnTo && !enrollTarget) return null
  return { returnTo: safeReturnTo(returnTo), enrollTarget }
}

function mergeRedirectState(
  locationState: LoginRedirectState | null,
  searchParams: URLSearchParams,
): LoginRedirectState | null {
  const queryState = readOAuthRedirectState(searchParams)
  const returnTo = safeReturnTo(queryState?.returnTo) ?? safeReturnTo(locationState?.returnTo)
  const enrollTarget = queryState?.enrollTarget ?? locationState?.enrollTarget
  if (!returnTo && !enrollTarget) return null
  return { returnTo, enrollTarget }
}

function googleButtonStyle(disabled: boolean): CSSProperties {
  return {
    width: '100%',
    background: 'transparent',
    border: `1px solid ${T.lineLight}`,
    color: C.ink,
    borderRadius: T.rControl,
    padding: '12px',
    fontSize: 13,
    cursor: disabled ? 'wait' : 'pointer',
    fontFamily: 'var(--font-body)',
    opacity: disabled ? 0.7 : 1,
  }
}

export default function LoginPage() {
  const { login, signup, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const demoMode = DEMO_MODE

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPhone, setSuPhone] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suGoal, setSuGoal] = useState<string | null>(null)

  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [oauthHandled, setOauthHandled] = useState(false)

  useEffect(() => {
    if (location.pathname === '/signup') setTab('signup')
    else if (location.pathname === '/login') setTab('signin')
  }, [location.pathname])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorParam = params.get('error')
    if (errorParam?.startsWith('oauth')) {
      setError('Google sign-in failed. Please try again or use email and password.')
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    if (params.get('oauth') !== 'success' || !ready || oauthHandled) return

    setOauthHandled(true)
    if (!user) {
      setError('Google sign-in could not restore your session. Please try again.')
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    const redirectState = mergeRedirectState(
      (location.state ?? null) as LoginRedirectState | null,
      params,
    )

    void finishAuthNavigation(navigate, user.role, redirectState)
  }, [location.pathname, location.search, location.state, navigate, oauthHandled, ready, user])

  function startGoogleAuth() {
    setError(null)
    setGoogleLoading(true)
    const redirectState = mergeRedirectState(
      (location.state ?? null) as LoginRedirectState | null,
      new URLSearchParams(location.search),
    )
    const url = buildGoogleOAuthStartUrl({
      returnTo: redirectState?.returnTo,
      enrollTarget: redirectState?.enrollTarget,
    })
    window.location.assign(url)
  }

  function handleDemoSelect(demo: DemoEntry) {
    if (!demoMode) return
    setError(null)
    setActiveRole(demo.id)
    setSiEmail(demo.email)
    setSiPassword('demo1234')
    if (tab !== 'signin') setTab('signin')
    setSubmitting(true)

    setTimeout(() => {
      const { desc: _d, ...user } = demo
      loginDemo(user)
      const redirectState = mergeRedirectState(
        (location.state ?? null) as LoginRedirectState | null,
        new URLSearchParams(location.search),
      )
      void finishAuthNavigation(navigate, demo.role, redirectState)
      setSubmitting(false)
    }, 80)
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!siEmail.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!siPassword.trim()) {
      setError('Enter your password.')
      return
    }

    setSubmitting(true)

    try {
      const role = await login(siEmail.trim(), siPassword)
      const redirectState = mergeRedirectState(
        (location.state ?? null) as LoginRedirectState | null,
        new URLSearchParams(location.search),
      )
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!suName.trim()) {
      setError('Enter your full name.')
      return
    }
    if (!suEmail.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!suPassword.trim()) {
      setError('Enter a password.')
      return
    }
    if (suPassword.trim().length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)

    try {
      const role = await signup(suName.trim(), suEmail.trim(), suPassword)
      const redirectState = mergeRedirectState(
        (location.state ?? null) as LoginRedirectState | null,
        new URLSearchParams(location.search),
      )
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  const goals = ['Get a job', 'Build skills', 'Switch career', 'Professional growth']

  const submitStyle: CSSProperties = {
    width: '100%',
    background: submitting ? `${accent.primary}99` : accent.primary,
    border: 'none',
    color: C.black,
    borderRadius: T.rControl,
    padding: '13px',
    fontSize: 14,
    fontWeight: 600,
    cursor: submitting ? 'wait' : 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'opacity 0.2s, background 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, color: C.ink, position: 'relative', overflow: 'hidden' }}>

      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          zIndex: 2,
          background: 'none',
          border: 'none',
          color: C.slate,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
        }}
      >
        ← Back to Skylent
      </button>

      <div
        className="login-page-grid"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: T.maxW,
          margin: '0 auto',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 'clamp(32px, 5vw, 72px)',
          alignItems: 'center',
          padding: `clamp(88px, 12vh, 120px) ${T.gutter} clamp(48px, 6vh, 72px)`,
        }}
      >
        {/* Editorial */}
        <div className="login-page-editorial">
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: C.ink, letterSpacing: '-0.02em' }}>
              Skylent<span style={{ color: accent.primary }}>.</span>
            </span>
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            <span style={{ width: 20, height: 1, background: 'currentColor', opacity: 0.5 }} />
            Sign in
          </div>

          <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '0 0 16px', maxWidth: 520 }}>
            Sign in to Skylent
          </h1>
          <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: '0 0 32px' }}>
            Access your learner, faculty, or institution workspace — programs, learning, and Career OS where your account includes them.
          </p>

          <EntryVisual />
        </div>

        {/* Auth surface */}
        <div className="login-page-auth">
          <GlassSurface level={2} padding="clamp(24px, 4vw, 32px)">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                {tab === 'signin' ? 'Sign in' : 'Create account'}
              </div>
              <p style={{ color: C.slate, fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
                {tab === 'signin' ? 'Use your Skylent account to continue.' : 'Register for a learner workspace.'}
              </p>
            </div>

            <div style={{ display: 'flex', background: C.sand, borderRadius: T.rControl, padding: 3, marginBottom: 24, gap: 3, border: `1px solid ${T.lineLight}` }}>
              {(['signin', 'signup'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setError(null) }}
                  aria-selected={tab === t}
                  style={{
                    flex: 1,
                    background: tab === t ? accent.subtle : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 0',
                    color: tab === t ? C.ink : C.slate,
                    fontSize: 13,
                    fontWeight: tab === t ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.28)',
                  borderRadius: T.rControl,
                  padding: '12px 14px',
                  color: C.ink,
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 18,
                }}
              >
                {error}
              </div>
            )}

            {tab === 'signin' && (
              <form onSubmit={handleSignIn} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="si-email" style={{ display: 'block', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    EMAIL
                  </label>
                  <input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    value={siEmail}
                    onChange={e => setSiEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    style={fieldStyle(focusedField === 'si-email')}
                    onFocus={() => setFocusedField('si-email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="si-password" style={{ display: 'block', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    PASSWORD
                  </label>
                  <input
                    id="si-password"
                    type="password"
                    autoComplete="current-password"
                    value={siPassword}
                    onChange={e => setSiPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={submitting}
                    style={fieldStyle(focusedField === 'si-pw')}
                    onFocus={() => setFocusedField('si-pw')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <p style={{ textAlign: 'right', marginBottom: 20, color: C.slate, fontSize: 12 }}>
                  Password reset is not available yet. Contact Skylent if you are locked out.
                </p>
                <button type="submit" disabled={submitting} style={submitStyle}>
                  {submitting ? 'Continuing…' : 'Continue'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: T.lineLight }} />
                  <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: T.lineLight }} />
                </div>

                <button
                  type="button"
                  disabled={submitting || googleLoading}
                  onClick={startGoogleAuth}
                  style={googleButtonStyle(submitting || googleLoading)}
                >
                  {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 20, color: C.slate, fontSize: 13 }}>
                  New to Skylent?{' '}
                  <button type="button" onClick={() => { setTab('signup'); setError(null) }} style={{ background: 'none', border: 'none', color: accent.text, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
                    Create account →
                  </button>
                </p>
              </form>
            )}

            {tab === 'signup' && (
              <form onSubmit={handleSignUp} noValidate>
                {[
                  { id: 'su-name', label: 'FULL NAME', type: 'text', value: suName, set: setSuName, placeholder: 'Your name', auto: 'name' },
                  { id: 'su-email', label: 'EMAIL', type: 'email', value: suEmail, set: setSuEmail, placeholder: 'you@example.com', auto: 'email' },
                  { id: 'su-phone', label: 'PHONE', type: 'tel', value: suPhone, set: setSuPhone, placeholder: '+91 98765 43210', auto: 'tel' },
                  { id: 'su-pw', label: 'PASSWORD', type: 'password', value: suPassword, set: setSuPassword, placeholder: '••••••••', auto: 'new-password' },
                ].map(field => (
                  <div key={field.id} style={{ marginBottom: 16 }}>
                    <label htmlFor={field.id} style={{ display: 'block', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      autoComplete={field.auto}
                      value={field.value}
                      onChange={e => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      disabled={submitting}
                      style={fieldStyle(focusedField === field.id)}
                      onFocus={() => setFocusedField(field.id)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'block', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.06em' }}>
                    YOUR GOAL
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {goals.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSuGoal(g === suGoal ? null : g)}
                        style={{
                          background: suGoal === g ? accent.subtle : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${suGoal === g ? accent.border : T.lineLight}`,
                          borderRadius: T.rControl,
                          padding: '8px 14px',
                          color: suGoal === g ? accent.text : C.slate,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting || googleLoading} style={submitStyle}>
                  {submitting ? 'Creating account…' : 'Create Account'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: T.lineLight }} />
                  <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: T.lineLight }} />
                </div>

                <button
                  type="button"
                  disabled={submitting || googleLoading}
                  onClick={startGoogleAuth}
                  style={googleButtonStyle(submitting || googleLoading)}
                >
                  {googleLoading ? 'Redirecting to Google…' : 'Sign up with Google'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 20, color: C.slate, fontSize: 13 }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setTab('signin'); setError(null) }} style={{ background: 'none', border: 'none', color: accent.text, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}>
                    Sign in →
                  </button>
                </p>
              </form>
            )}
          </GlassSurface>

          {/* Demo mode — development only */}
          {demoMode && (
          <div style={{ marginTop: 24, padding: '18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 12 }}>
              Explore workspaces (demo mode)
            </div>
            <div className="login-demo-grid" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEMO_USERS.map(demo => {
                const isActive = activeRole === demo.id
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoSelect(demo)}
                    disabled={submitting}
                    style={{
                      flex: '1 1 calc(20% - 8px)',
                      minWidth: 88,
                      background: isActive ? accent.subtle : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? accent.border : T.lineLight}`,
                      borderRadius: T.rControl,
                      padding: '10px 6px',
                      cursor: submitting ? 'wait' : 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isActive ? accent.primary : 'rgba(255,255,255,0.08)', color: isActive ? C.black : 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontFamily: 'var(--font-mono)' }}>
                      {demo.avatar}
                    </div>
                    <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{ROLE_LABELS[demo.role]}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{demo.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-page-grid {
            grid-template-columns: 1fr !important;
            align-items: start !important;
          }
          .login-page-auth { order: 1; }
          .login-page-editorial { order: 2; }
        }
        ${DEMO_MODE ? `
        @media (max-width: 480px) {
          .login-demo-grid button {
            flex: 1 1 calc(33.33% - 8px) !important;
            min-width: 80px !important;
          }
        }
        ` : ''}
      `}</style>
    </div>
  )
}
