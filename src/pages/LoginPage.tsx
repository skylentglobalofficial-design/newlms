import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { buildGoogleOAuthStartUrl } from '../lib/auth-api'
import { courseBySlug } from '../lib/catalog-maturity'
import { programmeDiscoveryFor } from '../lib/programme-discovery'
import './LoginPage.css'

// Compile-time flag (Vite replaces import.meta.env.VITE_*). Production builds set
// VITE_DEMO_MODE=false via .env.production so the picker is tree-shaken out of dist.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true"

/** The workspace stages on the other side of this form. Must match Skylent OS. */
const WORKSPACE_STAGES = ['Learning', 'Practice', 'Projects', 'Evidence', 'Career'] as const

// ─── DEMO USERS (local development only; omitted from production builds) ──────
// Role identities only — no invented cohort sizes, progress, or tenant totals.

type DemoEntry = AuthUser & { label: string }

const DEMO_USERS: DemoEntry[] = DEMO_MODE
  ? [
      { id: 'demo-student', role: 'student', name: 'Demo Learner', email: 'learner@demo.skylent.in', avatar: 'DL', label: 'Learner' },
      { id: 'demo-faculty', role: 'faculty', name: 'Demo Faculty', email: 'faculty@demo.skylent.in', avatar: 'DF', label: 'Faculty' },
      { id: 'demo-org', role: 'organisation', name: 'Demo Institution', email: 'institution@demo.skylent.in', avatar: 'DI', label: 'Institution' },
      { id: 'demo-admin', role: 'superadmin', name: 'Demo Admin', email: 'admin@demo.skylent.in', avatar: 'DA', label: 'Admin' },
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

/** Real title for the thing the visitor was trying to open, so the seam stays continuous. */
function enrollTargetTitle(target: CatalogEnrollTarget | undefined): string | null {
  if (!target) return null
  if (target.kind === 'course') return courseBySlug(target.slug)?.title ?? null
  return programmeDiscoveryFor(target.slug)?.title ?? null
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

export default function LoginPage() {
  const { login, signup, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [oauthHandled, setOauthHandled] = useState(false)

  const redirectState = (location.state ?? null) as LoginRedirectState | null
  const pendingTitle = enrollTargetTitle(redirectState?.enrollTarget)

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

    void finishAuthNavigation(
      navigate,
      user.role,
      mergeRedirectState((location.state ?? null) as LoginRedirectState | null, params),
    )
  }, [location.pathname, location.search, location.state, navigate, oauthHandled, ready, user])

  function startGoogleAuth() {
    setError(null)
    setGoogleLoading(true)
    window.location.assign(buildGoogleOAuthStartUrl({
      returnTo: redirectState?.returnTo,
      enrollTarget: redirectState?.enrollTarget,
    }))
  }

  function handleDemoSelect(demo: DemoEntry) {
    if (!DEMO_MODE) return
    setError(null)
    setSubmitting(true)
    const { label: _label, ...demoUser } = demo
    loginDemo(demoUser)
    navigate(roleRoute(demo.role))
    setSubmitting(false)
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
    if (suPassword.trim().length < 8) {
      setError('Choose a password of at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const role = await signup(suName.trim(), suEmail.trim(), suPassword)
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  const signingIn = tab === 'signin'

  return (
    <div className="entry">
      <div className="entry-top">
        <Link className="entry-back" to="/">← Back to Skylent</Link>
      </div>

      <main className="entry-main">
        <div className="entry-col">
          <Link className="entry-mark" to="/">Skylent<span>.</span></Link>

          <div className="entry-frame">
            <div className="entry-frame-bar">
              <b>Skylent OS</b>
              <span>{signingIn ? 'Sign in' : 'New account'}</span>
            </div>

            <div className="entry-frame-body">
              {/* Context only. Nothing is marked current because you have not entered yet. */}
              <div className="entry-rail" aria-hidden="true">
                <p>Waiting inside</p>
                <ul>
                  {WORKSPACE_STAGES.map(stage => <li key={stage}>{stage}</li>)}
                </ul>
              </div>

              <div className="entry-pane">
                <h1 className="entry-title">{signingIn ? 'Welcome back.' : 'Create your account.'}</h1>
                <p className="entry-lead">
                  {signingIn
                    ? 'Continue where you left off in Skylent OS.'
                    : 'One account for your learning, your practice, and the work you keep.'}
                </p>

                {pendingTitle ? (
                  <div className="entry-context">
                    <span className="entry-context-label">Opening next</span>
                    <span className="entry-context-title">{pendingTitle}</span>
                  </div>
                ) : null}

                {error ? (
                  <div className="entry-error" role="alert" aria-live="polite">{error}</div>
                ) : null}

                {signingIn ? (
                <form className="entry-form" onSubmit={handleSignIn} noValidate>
                  <div className="entry-field">
                    <label htmlFor="si-email">EMAIL</label>
                    <input
                      id="si-email"
                      type="email"
                      autoComplete="email"
                      value={siEmail}
                      onChange={e => setSiEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                  </div>
                  <div className="entry-field">
                    <label htmlFor="si-password">PASSWORD</label>
                    <input
                      id="si-password"
                      type="password"
                      autoComplete="current-password"
                      value={siPassword}
                      onChange={e => setSiPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={submitting}
                    />
                  </div>
                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                  </button>

                  <div className="entry-or"><span>or</span></div>

                  <button
                    className="entry-google"
                    type="button"
                    onClick={startGoogleAuth}
                    disabled={submitting || googleLoading}
                  >
                    {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
                  </button>

                  <p className="entry-alt">
                    New to Skylent?{' '}
                    <button type="button" onClick={() => { setTab('signup'); setError(null) }}>
                      Create an account →
                    </button>
                  </p>
                </form>
                ) : (
                <form className="entry-form" onSubmit={handleSignUp} noValidate>
                  <div className="entry-field">
                    <label htmlFor="su-name">FULL NAME</label>
                    <input
                      id="su-name"
                      type="text"
                      autoComplete="name"
                      value={suName}
                      onChange={e => setSuName(e.target.value)}
                      placeholder="Your name"
                      disabled={submitting}
                    />
                  </div>
                  <div className="entry-field">
                    <label htmlFor="su-email">EMAIL</label>
                    <input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      value={suEmail}
                      onChange={e => setSuEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                  </div>
                  <div className="entry-field">
                    <label htmlFor="su-password">PASSWORD</label>
                    <input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      value={suPassword}
                      onChange={e => setSuPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={submitting}
                    />
                  </div>
                  <button className="entry-submit" type="submit" disabled={submitting || googleLoading}>
                    {submitting ? 'Creating account…' : 'Create account'}
                  </button>

                  <div className="entry-or"><span>or</span></div>

                  <button
                    className="entry-google"
                    type="button"
                    onClick={startGoogleAuth}
                    disabled={submitting || googleLoading}
                  >
                    {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
                  </button>

                  <p className="entry-alt">
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('signin'); setError(null) }}>
                      Sign in →
                    </button>
                  </p>
                </form>
                )}
              </div>
            </div>
          </div>

          <p className="entry-note">
            Signing in opens Skylent OS — your lessons, practice, projects, and the evidence you keep.
            Password resets are handled by hand for now, so <Link to="/contact">contact us</Link> if you
            cannot get in.
          </p>

          {DEMO_MODE ? (
            <div className="entry-demo">
              <p className="entry-demo-label">Open a workspace (local demo)</p>
              <div className="entry-demo-grid">
                {DEMO_USERS.map(demo => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoSelect(demo)}
                    disabled={submitting}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
