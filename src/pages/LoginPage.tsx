import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { cataloguePathForTarget, fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { takeEnrolConsent } from '../lib/policy'
import { sanitizeReturnTo } from '../lib/safe-return'
import { buildGoogleOAuthStartUrl, checkGoogleOAuthAvailable, sendEmailOtpRequest } from '../lib/auth-api'
import { setNativeCsrfToken, setNativeSessionToken } from '../lib/native-app-bridge'
import { isNativeAppShell } from '../lib/api-base'
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
  if (returnTo && returnTo !== "/" && returnTo !== "/login" && returnTo !== "/signup" && returnTo !== "/preview/homepage") {
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
  const { login, signup, loginWithEmailOtp, refreshSession, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [authMethod, setAuthMethod] = useState<'password' | 'email_otp'>('password')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign-Up State with Mandatory 2-Step Email OTP Verification (Anti-Spam)
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suTerms, setSuTerms] = useState(false)
  const [suTermsTried, setSuTermsTried] = useState(false)
  const [suOtpSent, setSuOtpSent] = useState(false)
  const [suOtpCode, setSuOtpCode] = useState('')
  const [suOtpMessage, setSuOtpMessage] = useState<string | null>(null)

  // Sign-In via Email OTP State (No mobile number required)
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

  // If user is already authenticated, take them directly to their role dashboard
  useEffect(() => {
    if (ready && user && !location.search.includes("error=") && !location.search.includes("oauth=")) {
      const returnTo = sanitizeReturnTo(redirectState?.returnTo)
      if (returnTo && returnTo !== "/" && returnTo !== "/login" && returnTo !== "/signup" && returnTo !== "/preview/homepage") {
        navigate(returnTo, { replace: true })
      } else {
        navigate(roleRoute(user.role), { replace: true })
      }
    }
  }, [ready, user, redirectState, location.search, navigate])

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
      setError('Google sign-in is not enabled on this server yet. Please sign in with Email & Password or Email OTP.')
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
      reportError('Google sign-in is not enabled on this server yet. Please use Email & Password or Email OTP above.')
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

  async function handleSendEmailLoginOtp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      reportError('Enter a valid email address.', document.getElementById('otp-email'))
      return
    }
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const res = await sendEmailOtpRequest(otpEmail.trim(), 'login')
      setOtpEmail(res.email)
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

  async function handleVerifyEmailLoginOtp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    if (!/^\d{6}$/.test(otpCode.trim())) {
      reportError('Enter the 6-digit OTP sent to your email.', document.getElementById('otp-code'))
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
      const role = await loginWithEmailOtp({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
        name: otpName.trim() || undefined,
        acceptedTerms: otpExistingUser ? true : otpTerms,
      })
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please check your email inbox and try again.')
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

  async function handleSignUpStep1SendOtp(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return

    if (!suName.trim()) {
      reportError('Enter your full name.', document.getElementById('su-name'))
      return
    }
    if (!suEmail.trim() || !suEmail.includes('@')) {
      reportError('Enter a valid email address.', document.getElementById('su-email'))
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
      const res = await sendEmailOtpRequest(suEmail.trim(), 'signup')
      setSuEmail(res.email)
      setSuOtpMessage(res.message)
      setSuOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send verification OTP to this email.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleSignUpStep2VerifyAndCreate(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return

    if (!/^\d{6}$/.test(suOtpCode.trim())) {
      reportError('Enter the 6-digit verification code sent to your email.', document.getElementById('su-otp'))
      return
    }

    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const role = await signup(suName.trim(), suEmail.trim(), suPassword, suTerms, suOtpCode.trim())
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify OTP and create account.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const signingIn = tab === 'signin'
  const isNative = isNativeAppShell()

  return (
    <div className="entry">
      {!isNative ? (
        <div className="entry-top">
          <Link className="entry-back" to="/">← Back to Skylent</Link>
        </div>
      ) : null}

      <main className="entry-main">
        <div className="entry-col">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span className="entry-mark" style={{ margin: 0, cursor: 'default' }}>Skylent</span>
          </div>

          <div className="entry-frame">
            <div className="entry-pane">
              {/* Direct Sign In / Sign Up Top Switcher (Zero Page Reload) */}
              <div
                role="tablist"
                aria-label="Choose Sign In or Sign Up"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  padding: 5,
                  borderRadius: 12,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  marginBottom: 18,
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={signingIn}
                  onClick={() => {
                    setTab('signin')
                    setError(null)
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: signingIn ? '#1e1b4b' : 'transparent',
                    color: signingIn ? '#ffffff' : '#334155',
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!signingIn}
                  onClick={() => {
                    setTab('signup')
                    setError(null)
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: !signingIn ? '#1e1b4b' : 'transparent',
                    color: !signingIn ? '#ffffff' : '#334155',
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                  }}
                >
                  Sign Up
                </button>
              </div>

              <h1 className="entry-title">{signingIn ? 'Welcome back' : 'Create your account'}</h1>
              <div
                style={{
                  marginTop: 6,
                  marginBottom: 10,
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  color: '#4c1d95',
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                🔒 Single-Device Policy: One active login at a time across Website or Mobile App.
              </div>
              <p className="entry-lead">
                {signingIn
                  ? 'Sign in to access your courses, interactive labs, and certificates.'
                  : suOtpSent
                    ? `Enter the 6-digit verification code sent to ${suEmail} to activate your account.`
                    : 'Enter your details below. We will send a 6-digit verification code to your email.'}
              </p>

              {/* Sign-In Method Switcher: Email & Password vs Email OTP */}
              {signingIn ? (
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
                    aria-selected={authMethod === 'password'}
                    onClick={() => {
                      setAuthMethod('password')
                      setError(null)
                    }}
                    style={{
                      padding: '9px 10px',
                      borderRadius: 7,
                      border: 'none',
                      background: authMethod === 'password' ? '#5142b5' : 'transparent',
                      color: authMethod === 'password' ? '#ffffff' : '#334155',
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
                    aria-selected={authMethod === 'email_otp'}
                    onClick={() => {
                      setAuthMethod('email_otp')
                      setError(null)
                    }}
                    style={{
                      padding: '9px 10px',
                      borderRadius: 7,
                      border: 'none',
                      background: authMethod === 'email_otp' ? '#5142b5' : 'transparent',
                      color: authMethod === 'email_otp' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Email OTP
                  </button>
                </div>
              ) : null}

              {error ? (
                <div className="entry-error" role="alert" aria-live="polite" ref={errorRef} tabIndex={-1}>{error}</div>
              ) : null}

              {signingIn && authMethod === 'email_otp' ? (
                !otpSent ? (
                  <form className="entry-form" onSubmit={handleSendEmailLoginOtp} noValidate>
                    <div className="entry-field">
                      <label htmlFor="otp-email">YOUR EMAIL ADDRESS</label>
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
                      {submitting ? 'Sending 6-Digit OTP…' : 'Send 6-Digit OTP to Email'}
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

                    <p className="entry-alt">
                      New to Skylent?{' '}
                      <button type="button" onClick={() => { setTab('signup'); setError(null) }}>
                        Create an account →
                      </button>
                    </p>
                  </form>
                ) : (
                  <form className="entry-form" onSubmit={handleVerifyEmailLoginOtp} noValidate>
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
                      <label htmlFor="otp-code">ENTER 6-DIGIT OTP SENT TO {otpEmail.toUpperCase()}</label>
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
                      Didn&apos;t receive the email?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpCode('')
                          setOtpSentMessage(null)
                          setError(null)
                        }}
                      >
                        Change email or resend
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
              ) : !suOtpSent ? (
                <form className="entry-form" onSubmit={handleSignUpStep1SendOtp} noValidate>
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
                    <label htmlFor="su-password">CREATE PASSWORD</label>
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
                    {submitting ? 'Sending Verification OTP…' : 'Send Verification OTP to Email →'}
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
              ) : (
                <form className="entry-form" onSubmit={handleSignUpStep2VerifyAndCreate} noValidate>
                  {suOtpMessage ? (
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
                      ✓ {suOtpMessage}
                    </div>
                  ) : null}

                  <div className="entry-field">
                    <label htmlFor="su-otp">6-DIGIT VERIFICATION CODE SENT TO {suEmail.toUpperCase()}</label>
                    <input
                      id="su-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={suOtpCode}
                      onChange={(e) => setSuOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      disabled={submitting}
                      style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: 16 }}
                    />
                  </div>

                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? 'Verifying & Creating Account…' : 'Verify Email & Create Account →'}
                  </button>

                  <p className="entry-alt">
                    Wrong email or didn&apos;t receive code?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setSuOtpSent(false)
                        setSuOtpCode('')
                        setSuOtpMessage(null)
                        setError(null)
                      }}
                    >
                      Edit details or resend OTP
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
