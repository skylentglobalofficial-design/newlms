import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { cataloguePathForTarget, fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { takeEnrolConsent } from '../lib/policy'
import { sanitizeReturnTo } from '../lib/safe-return'
import { buildGoogleOAuthStartUrl, checkGoogleOAuthAvailable, sendMobileOtpRequest } from '../lib/auth-api'
import { setNativeCsrfToken, setNativeSessionToken } from '../lib/native-app-bridge'
import './LoginPage.css'
import { TermsConsent } from '../components/legal/TermsConsent'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

type DemoEntry = AuthUser & { label: string }

const DEMO_USERS: DemoEntry[] = DEMO_MODE
  ? [
      { id: 'demo-student', role: 'student', name: 'Aarav Sharma', email: 'learner@demo.skylent.in', avatar: 'AS', label: 'Learner' },
      { id: 'demo-superadmin', role: 'superadmin', name: 'Chandan (Admin)', email: 'admin@demo.skylent.in', avatar: 'CA', label: 'Admin C-Suite' },
      { id: 'demo-faculty', role: 'faculty', name: 'Dr. Meera Krishnan', email: 'faculty@demo.skylent.in', avatar: 'MK', label: 'Faculty' },
      { id: 'demo-college', role: 'college', name: 'Dean Placement Cell', email: 'college@demo.skylent.in', avatar: 'TP', label: 'College TPO' },
      { id: 'demo-recruiter', role: 'recruiter', name: 'Rohan Verma', email: 'recruiter@demo.skylent.in', avatar: 'RV', label: 'Recruiter' },
      { id: 'demo-org', role: 'organisation', name: 'Enterprise L&D', email: 'institution@demo.skylent.in', avatar: 'EL', label: 'Enterprise' },
    ]
  : []

function roleRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'college': return '/dashboard/college'
    case 'recruiter': return '/dashboard/recruiter'
    case 'admin': return '/dashboard/curriculum'
    case 'superadmin': return '/dashboard/admin'
  }
}

async function finishAuthNavigation(
  navigate: NavigateFunction,
  role: UserRole,
  redirectState: LoginRedirectState | null,
) {
  if (redirectState?.enrollTarget) {
    const target = redirectState.enrollTarget
    const acceptedTerms = takeEnrolConsent(target)
    try {
      const workspace = await fulfillCatalogEnrollment(target, acceptedTerms)
      navigate(learnPathForWorkspace(workspace))
    } catch (error) {
      if (acceptedTerms) throw error
      navigate(cataloguePathForTarget(target))
    }
    return
  }
  const returnTo = sanitizeReturnTo(redirectState?.returnTo)
  if (returnTo) {
    navigate(returnTo)
    return
  }
  navigate(roleRoute(role))
}

function readOAuthRedirectState(params: URLSearchParams): LoginRedirectState | null {
  const returnTo = sanitizeReturnTo(params.get('returnTo')) ?? undefined
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
  const { login, signup, loginWithMobileOtp, refreshSession, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suTerms, setSuTerms] = useState(false)
  const [suTermsTried, setSuTermsTried] = useState(false)

  // Real Mobile & Email OTP State (zero fake on-screen OTP)
  const [otpPhone, setOtpPhone] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpExistingUser, setOtpExistingUser] = useState(true)
  const [otpName, setOtpName] = useState('')
  const [otpTerms, setOtpTerms] = useState(true)
  const [otpTermsTried, setOtpTermsTried] = useState(false)
  const otpTermsRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const pendingFocus = useRef<HTMLElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null)
  const [oauthHandled, setOauthHandled] = useState(false)

  const redirectState = (location.state ?? null) as LoginRedirectState | null

  useEffect(() => {
    let cancelled = false
    void checkGoogleOAuthAvailable().then((available) => {
      if (!cancelled) setGoogleAvailable(available)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/signup') setTab('signup')
    else if (location.pathname === '/login') setTab('signin')
  }, [location.pathname])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const incomingSessionToken = params.get('sessionToken')
    const incomingCsrfToken = params.get('csrfToken')
    if (incomingSessionToken) setNativeSessionToken(incomingSessionToken)
    if (incomingCsrfToken) setNativeCsrfToken(incomingCsrfToken)

    const errorParam = params.get('error')
    if (errorParam === 'consent_required') {
      setTab('signup')
      setError("There is no Skylent account for that Google address yet. Accept the Terms & Conditions and Privacy Policy below, then continue with Google to create one.")
      navigate('/signup', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'consent_outdated') {
      setTab('signup')
      setError("The terms have been updated. Reload the page and accept the current version, then continue with Google.")
      navigate('/signup', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'oauth_email_in_use') {
      setTab('signin')
      setError("That email already has a Skylent account. Google was not connected. Sign in with email and password.")
      navigate('/login', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'oauth_not_configured') {
      setGoogleAvailable(false)
      setError('Google sign-in is not enabled on this server yet. Please sign in with Email & Password or OTP.')
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }
    if (errorParam?.startsWith('oauth')) {
      setError('Google sign-in failed. Please try again or use Email & Password.')
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    if (params.get('oauth') !== 'success' || !ready || oauthHandled) return

    setOauthHandled(true)
    const finalizeOAuth = async () => {
      const activeUser = user ?? (await refreshSession())
      if (!activeUser) {
        setError('Google sign-in could not restore your session. Please try again or use Email & Password.')
        navigate(location.pathname, { replace: true, state: location.state })
        return
      }
      await finishAuthNavigation(
        navigate,
        activeUser.role,
        mergeRedirectState((location.state ?? null) as LoginRedirectState | null, params),
      )
    }

    void finalizeOAuth().catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to enrol right now.")
    })
  }, [location.pathname, location.search, location.state, navigate, oauthHandled, ready, refreshSession, user])

  useEffect(() => {
    if (!error) return
    const target = pendingFocus.current ?? errorRef.current
    pendingFocus.current = null
    target?.focus()
  }, [error])

  function startGoogleAuth(acceptedTerms = false) {
    if (googleAvailable === false) {
      reportError('Google sign-in is not enabled on this server yet. Please use Email & Password or OTP above.')
      return
    }
    setError(null)
    setGoogleLoading(true)
    window.location.assign(buildGoogleOAuthStartUrl({
      returnTo: sanitizeReturnTo(redirectState?.returnTo) ?? undefined,
      enrollTarget: redirectState?.enrollTarget,
      acceptedTerms,
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

  function reportError(message: string, field?: HTMLElement | null) {
    pendingFocus.current = field ?? null
    if (error === message) {
      const target = field ?? errorRef.current
      pendingFocus.current = null
      target?.focus()
      return
    }
    setError(message)
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    const digits = otpPhone.replace(/\D/g, '')
    if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
      reportError('Enter a valid 10-digit Indian mobile number.', document.getElementById('otp-phone'))
      return
    }
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const res = await sendMobileOtpRequest(otpPhone.trim(), otpEmail.trim() || undefined)
      setOtpPhone(res.phone)
      setOtpExistingUser(res.isExistingUser)
      if (res.existingName) setOtpName(res.existingName)
      setOtpSentMessage(res.message)
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP right now.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    if (!/^\d{6}$/.test(otpCode.trim())) {
      reportError('Enter the 6-digit OTP sent to your phone/email.', document.getElementById('otp-code'))
      return
    }
    if (!otpExistingUser && !otpTerms) {
      setOtpTermsTried(true)
      reportError('Accept the Terms & Conditions and Privacy Policy to continue.', otpTermsRef.current)
      return
    }
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const role = await loginWithMobileOtp({
        phone: otpPhone.trim(),
        otp: otpCode.trim(),
        name: otpName.trim() || undefined,
        acceptedTerms: otpExistingUser ? true : otpTerms,
      })
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please check and try again.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return

    if (!siEmail.trim()) {
      reportError('Enter your email address.', document.getElementById('si-email'))
      return
    }
    if (!siPassword.trim()) {
      reportError('Enter your password.', document.getElementById('si-password'))
      return
    }

    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const role = await login(siEmail.trim(), siPassword)
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return

    if (!suName.trim()) {
      reportError('Enter your full name.', document.getElementById('su-name'))
      return
    }
    if (!suEmail.trim()) {
      reportError('Enter your email address.', document.getElementById('su-email'))
      return
    }
    if (suPassword.trim().length < 8) {
      reportError('Choose a password of at least 8 characters.', document.getElementById('su-password'))
      return
    }
    if (!suTerms) {
      setSuTermsTried(true)
      reportError('Accept the Terms & Conditions and Privacy Policy to create an account.', termsRef.current)
      return
    }

    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const role = await signup(suName.trim(), suEmail.trim(), suPassword, suTerms)
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      submittingRef.current = false
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
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <Link className="entry-mark" to="/" style={{ margin: 0 }}>Skylent</Link>
          </div>

          <div className="entry-frame">
            <div className="entry-frame-bar">
              <b>Skylent Account</b>
              <span>{signingIn ? 'Sign in' : 'Create account'}</span>
            </div>

            <div className="entry-pane">
              <h1 className="entry-title">{signingIn ? 'Welcome back' : 'Create your account'}</h1>
              <p className="entry-lead">
                {signingIn
                  ? 'Sign in to access your courses, interactive labs, and certificates.'
                  : 'Create your account to start learning and building real projects.'}
              </p>

              {/* Clean Method Switcher: Email & Password vs Mobile / Email OTP */}
              <div
                role="tablist"
                aria-label="Sign-in method"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  padding: 4,
                  borderRadius: 10,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  marginTop: 18,
                  marginBottom: 16,
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMethod === 'email'}
                  onClick={() => {
                    setAuthMethod('email')
                    setError(null)
                  }}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 7,
                    border: 'none',
                    background: authMethod === 'email' ? '#5142b5' : 'transparent',
                    color: authMethod === 'email' ? '#ffffff' : '#334155',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Email &amp; Password
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMethod === 'otp'}
                  onClick={() => {
                    setAuthMethod('otp')
                    setError(null)
                  }}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 7,
                    border: 'none',
                    background: authMethod === 'otp' ? '#5142b5' : 'transparent',
                    color: authMethod === 'otp' ? '#ffffff' : '#334155',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Mobile OTP
                </button>
              </div>

              {error ? (
                <div className="entry-error" role="alert" aria-live="polite" ref={errorRef} tabIndex={-1}>{error}</div>
              ) : null}

              {authMethod === 'otp' ? (
                !otpSent ? (
                  <form className="entry-form" onSubmit={handleSendOtp} noValidate>
                    <div className="entry-field">
                      <label htmlFor="otp-phone">MOBILE NUMBER (+91 INDIA)</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 12px',
                            borderRadius: 8,
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          +91
                        </span>
                        <input
                          id="otp-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          disabled={submitting}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="entry-field">
                      <label htmlFor="otp-email">EMAIL ADDRESS (FOR INSTANT OTP DELIVERY)</label>
                      <input
                        id="otp-email"
                        type="email"
                        autoComplete="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        disabled={submitting}
                      />
                    </div>

                    <button className="entry-submit" type="submit" disabled={submitting}>
                      {submitting ? 'Sending 6-Digit OTP…' : 'Send 6-Digit OTP'}
                    </button>

                    <div className="entry-or"><span>or</span></div>

                    <button
                      className="entry-google"
                      type="button"
                      onClick={() => startGoogleAuth(true)}
                      disabled={submitting || googleLoading || googleAvailable === false}
                    >
                      {googleLoading
                        ? 'Redirecting to Google…'
                        : googleAvailable === false
                          ? 'Google sign-in unavailable'
                          : 'Continue with Google'}
                    </button>
                  </form>
                ) : (
                  <form className="entry-form" onSubmit={handleVerifyOtp} noValidate>
                    {otpSentMessage ? (
                      <div
                        role="status"
                        style={{
                          padding: '11px 14px',
                          borderRadius: 8,
                          background: '#f0fdf4',
                          border: '1px solid #86efac',
                          color: '#166534',
                          fontSize: 13,
                          marginBottom: 14,
                        }}
                      >
                        ✓ {otpSentMessage}
                      </div>
                    ) : null}

                    <div className="entry-field">
                      <label htmlFor="otp-code">ENTER 6-DIGIT OTP (+91-{otpPhone})</label>
                      <input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        disabled={submitting}
                        style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: 16 }}
                      />
                    </div>

                    {!otpExistingUser ? (
                      <>
                        <div className="entry-field">
                          <label htmlFor="otp-name">YOUR FULL NAME</label>
                          <input
                            id="otp-name"
                            type="text"
                            value={otpName}
                            onChange={(e) => setOtpName(e.target.value)}
                            placeholder="Enter your full name"
                            disabled={submitting}
                          />
                        </div>
                        <TermsConsent
                          inputRef={otpTermsRef}
                          checked={otpTerms}
                          onChange={setOtpTerms}
                          action="creating an account"
                          showError={otpTermsTried}
                        />
                      </>
                    ) : null}

                    <button className="entry-submit" type="submit" disabled={submitting}>
                      {submitting ? 'Verifying OTP…' : 'Verify OTP & Sign In'}
                    </button>

                    <p className="entry-alt">
                      Didn&apos;t receive the code?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpCode('')
                          setOtpSentMessage(null)
                          setError(null)
                        }}
                      >
                        Change number or resend
                      </button>
                    </p>
                  </form>
                )
              ) : signingIn ? (
                <form className="entry-form" onSubmit={handleSignIn} noValidate>
                  <div className="entry-field">
                    <label htmlFor="si-email">EMAIL ADDRESS</label>
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
                  <p className="entry-forgot">
                    <Link to="/reset-password">Forgot password?</Link>
                  </p>

                  <div className="entry-or"><span>or</span></div>

                  <button
                    className="entry-google"
                    type="button"
                    onClick={() => startGoogleAuth()}
                    disabled={submitting || googleLoading || googleAvailable === false}
                  >
                    {googleLoading
                      ? 'Redirecting to Google…'
                      : googleAvailable === false
                        ? 'Google sign-in unavailable — use email above'
                        : 'Continue with Google'}
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
                      placeholder="Your full name"
                      disabled={submitting}
                    />
                  </div>
                  <div className="entry-field">
                    <label htmlFor="su-email">EMAIL ADDRESS</label>
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
                  <TermsConsent inputRef={termsRef} checked={suTerms} onChange={setSuTerms} action="creating an account" showError={suTermsTried} />
                  <button className="entry-submit" type="submit" disabled={submitting || googleLoading}>
                    {submitting ? 'Creating account…' : 'Create account'}
                  </button>

                  <div className="entry-or"><span>or</span></div>

                  <button
                    className="entry-google"
                    type="button"
                    onClick={() => { if (!suTerms) { setSuTermsTried(true); reportError('Accept the Terms & Conditions and Privacy Policy to create an account.', termsRef.current); return } startGoogleAuth(true) }}
                    disabled={submitting || googleLoading || googleAvailable === false}
                  >
                    {googleLoading
                      ? 'Redirecting to Google…'
                      : googleAvailable === false
                        ? 'Google sign-in unavailable — use email above'
                        : 'Continue with Google'}
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

          <p className="entry-note" style={{ textAlign: 'center', marginInline: 'auto' }}>
            Need help signing in? <Link to="/reset-password">Reset password</Link> or{' '}
            <Link to="/contact">contact support</Link>. Read our <Link to="/terms">Terms</Link> &amp;{' '}
            <Link to="/privacy">Privacy Policy</Link>.
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
