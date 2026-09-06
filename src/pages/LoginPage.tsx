import { useState, useEffect, type CSSProperties, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import { fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { buildGoogleOAuthStartUrl } from '../lib/auth-api'
import { C, T } from '../tokens'
import { Aurora } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('general')

const DEV_DEMO_ACCOUNTS = [
  { role: 'Learner', email: 'learner@demo.skylent.dev' },
  { role: 'Mentor', email: 'mentor@demo.skylent.dev' },
  { role: 'Institution', email: 'institution@demo.skylent.dev' },
  { role: 'Recruiter', email: 'recruiter@demo.skylent.dev' },
  { role: 'Admin', email: 'admin@demo.skylent.dev' },
]

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
): Promise<string | null> {
  if (redirectState?.enrollTarget) {
    try {
      const workspace = await fulfillCatalogEnrollment(redirectState.enrollTarget)
      navigate(learnPathForWorkspace(workspace))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Enrollment failed'
    }
  }
  if (redirectState?.returnTo) {
    navigate(redirectState.returnTo)
    return null
  }
  navigate(roleRoute(role))
  return null
}

function fieldStyle(focused: boolean, hasError?: boolean): CSSProperties {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.55)' : focused ? accent.primary : T.lineDark}`,
    borderRadius: T.rControl,
    padding: '12px 14px',
    color: C.white,
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
  return { returnTo, enrollTarget }
}

function mergeRedirectState(
  locationState: LoginRedirectState | null,
  searchParams: URLSearchParams,
): LoginRedirectState | null {
  if (searchParams.get('oauth') !== 'success') return locationState
  const oauthState = readOAuthRedirectState(searchParams)
  return {
    returnTo: oauthState?.returnTo ?? locationState?.returnTo,
    enrollTarget: oauthState?.enrollTarget ?? locationState?.enrollTarget,
  }
}

function googleButtonStyle(disabled: boolean): CSSProperties {
  return {
    width: '100%',
    background: 'transparent',
    border: `1px solid ${T.lineDark}`,
    color: C.white,
    borderRadius: T.rControl,
    padding: '12px',
    fontSize: 13,
    cursor: disabled ? 'wait' : 'pointer',
    fontFamily: 'var(--font-body)',
    opacity: disabled ? 0.7 : 1,
  }
}

export default function LoginPage() {
  const { login, signup, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = location.pathname === '/signup'

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')

  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [oauthHandled, setOauthHandled] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorParam = params.get('error')
    if (errorParam?.startsWith('oauth')) {
      setError(
        errorParam === 'oauth_config'
          ? 'Google sign-in is misconfigured. Confirm GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your root .env match the OAuth client in Google Cloud Console, then restart the API.'
          : 'Google sign-in failed. Please try again or use email and password.',
      )
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
    const redirectState = (location.state ?? null) as LoginRedirectState | null
    const url = buildGoogleOAuthStartUrl({
      returnTo: redirectState?.returnTo,
      enrollTarget: redirectState?.enrollTarget,
    })
    window.location.assign(url)
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
      const redirectState = (location.state ?? null) as LoginRedirectState | null
      const enrollError = await finishAuthNavigation(navigate, role, redirectState)
      if (enrollError) {
        setError(`Signed in, but enrollment could not be completed: ${enrollError}`)
      }
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
      const redirectState = (location.state ?? null) as LoginRedirectState | null
      const enrollError = await finishAuthNavigation(navigate, role, redirectState)
      if (enrollError) {
        setError(`Account created, but enrollment could not be completed: ${enrollError}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

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
    <div className="login-page" style={{ minHeight: '100vh', background: C.canvas, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Aurora themeId="general" />

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
          color: 'rgba(255,255,255,0.45)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          padding: 0,
        }}
      >
        ← Back
      </button>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `clamp(88px, 14vh, 120px) ${T.gutter} clamp(48px, 8vh, 72px)`,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: C.white, letterSpacing: '-0.02em' }}>
              SKYLENT
            </span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: C.white, margin: '0 0 28px', letterSpacing: '-0.02em' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.28)',
                borderRadius: T.rControl,
                padding: '12px 14px',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          {!isSignup ? (
            <form onSubmit={handleSignIn} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="si-email" style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                  Email
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
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="si-password" style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                  Password
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
              <button type="submit" disabled={submitting} style={submitStyle}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: T.lineDark }} />
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: T.lineDark }} />
              </div>

              <button
                type="button"
                disabled={submitting || googleLoading}
                onClick={startGoogleAuth}
                style={googleButtonStyle(submitting || googleLoading)}
              >
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
                Don&apos;t have an account?{' '}
                <Link to="/signup" style={{ color: accent.text, fontSize: 13 }}>
                  Create an account
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} noValidate>
              {[
                { id: 'su-name', label: 'Name', type: 'text', value: suName, set: setSuName, placeholder: 'Your name', auto: 'name' },
                { id: 'su-email', label: 'Email', type: 'email', value: suEmail, set: setSuEmail, placeholder: 'you@example.com', auto: 'email' },
                { id: 'su-pw', label: 'Password', type: 'password', value: suPassword, set: setSuPassword, placeholder: 'At least 8 characters', auto: 'new-password' },
              ].map(field => (
                <div key={field.id} style={{ marginBottom: 16 }}>
                  <label htmlFor={field.id} style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 6 }}>
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

              <button type="submit" disabled={submitting || googleLoading} style={submitStyle}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: T.lineDark }} />
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: T.lineDark }} />
              </div>

              <button
                type="button"
                disabled={submitting || googleLoading}
                onClick={startGoogleAuth}
                style={googleButtonStyle(submitting || googleLoading)}
              >
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: accent.text, fontSize: 13 }}>
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {import.meta.env.DEV && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
              <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>
                Development demo accounts
              </div>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.6, margin: '0 0 10px' }}>
                Run <code style={{ fontFamily: 'var(--font-mono)' }}>npm run db:seed</code> to create demo users. Password: <code style={{ fontFamily: 'var(--font-mono)' }}>DemoSkylent2026!</code> (or <code style={{ fontFamily: 'var(--font-mono)' }}>DEMO_USER_PASSWORD</code>).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEV_DEMO_ACCOUNTS.map((account) => (
                  <div key={account.email} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.62)' }}>{account.role}</span>
                    {' · '}
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{account.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
