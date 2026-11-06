import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { cataloguePathForTarget, fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { takeEnrolConsent } from '../lib/policy'
import { sanitizeReturnTo } from '../lib/safe-return'
import { buildGoogleOAuthStartUrl, checkGoogleOAuthAvailable, sendEmailOtpRequest } from '../lib/auth-api'
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
    case 'admin': return '/dashboard/admin'
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
  const { login, signup, loginWithEmailOtp, refreshSession, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [authMethod, setAuthMethod] = useState<'password' | 'email_otp'>('password')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [showSiPassword, setShowSiPassword] = useState(false)

  // Sign-Up State with Mandatory 2-Step Email OTP Verification (Anti-Spam)
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [showSuPassword, setShowSuPassword] = useState(false)
  const [suTerms, setSuTerms] = useState(true)
  const [suTermsTried, setSuTermsTried] = useState(false)
  const [suOtpSent, setSuOtpSent] = useState(false)
  const [suOtpCode, setSuOtpCode] = useState('')
  const [suOtpMessage, setSuOtpMessage] = useState<string | null>(null)

  // Sign-In via Email OTP State (Passwordless 1-step login/signup)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpExistingUser, setOtpExistingUser] = useState(true)
  const [otpName, setOtpName] = useState('')
  const [otpTerms, setOtpTerms] = useState(true)
  const [otpTermsTried, setOtpTermsTried] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
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

  // Live 30s countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown])

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

  // Auto-redirect already authenticated users straight to their dashboard
  // so logged-in learners/admins never see the Sign-In screen again.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!ready || !user || params.get('oauth') === 'success' || params.get('error')) return
    void finishAuthNavigation(
      navigate,
      user.role,
      mergeRedirectState((location.state ?? null) as LoginRedirectState | null, params),
    )
  }, [ready, user, location.search, location.state, navigate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const incomingSessionToken = params.get('sessionToken')
    const incomingCsrfToken = params.get('csrfToken')
    if (incomingSessionToken) setNativeSessionToken(incomingSessionToken)
    if (incomingCsrfToken) setNativeCsrfToken(incomingCsrfToken)

    const errorParam = params.get('error')
    if (errorParam === 'consent_required') {
      setTab('signup')
      setError("Accept the Terms & Conditions and Privacy Policy below, then continue with Google to create your account.")
      navigate('/signup', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'consent_outdated') {
      setTab('signup')
      setError("The terms have been updated. Accept the current version below, then continue with Google.")
      navigate('/signup', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'oauth_email_in_use') {
      setTab('signin')
      setError("That email already has a Skylent account. Please sign in with Email & Password or Email OTP.")
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
      setError('Google sign-in failed. Please try again or use Email & Password / Email OTP.')
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

  function startGoogleAuth(acceptedTerms = true) {
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

  async function handleSendEmailLoginOtp(e?: FormEvent) {
    if (e) e.preventDefault()
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
      setResendCooldown(30)
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

  async function handleSignUpStep1SendOtp(e?: FormEvent) {
    if (e) e.preventDefault()
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
      setResendCooldown(30)
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

  return (
    <div className="entry">
      <div className="entry-top">
        <Link className="entry-back" to="/">← Back to Skylent</Link>
      </div>

      <main className="entry-main">
        <div className="entry-col">
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <Link className="entry-mark" to="/" style={{ margin: 0 }}>Skylent</Link>
            <div className="entry-trust-pills" aria-label="Skylent Learner Benefits">
              <span>✓ Free SQL &amp; AI Labs</span>
              <span>✓ +50 Elixir Coins</span>
              <span>✓ 20-Min Mentor SLA</span>
            </div>
          </div>

          <div className="entry-frame">
            <div className="entry-pane">
              {/* Top Sign In / Create Account Tab Switcher */}
              <div className="entry-mode-tabs" role="tablist" aria-label="Account access mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={signingIn}
                  className={signingIn ? 'entry-mode-tab is-active' : 'entry-mode-tab'}
                  onClick={() => {
                    setTab('signin')
                    setError(null)
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!signingIn}
                  className={!signingIn ? 'entry-mode-tab is-active' : 'entry-mode-tab'}
                  onClick={() => {
                    setTab('signup')
                    setError(null)
                  }}
                >
                  Create Account
                </button>
              </div>

              <h1 className="entry-title">{signingIn ? 'Welcome back' : 'Start learning free'}</h1>
              <p className="entry-lead">
                {signingIn
                  ? 'Sign in to resume your courses, interactive labs, and certificates.'
                  : suOtpSent
                    ? `Enter the 6-digit verification code sent to ${suEmail} to activate your account.`
                    : 'Create your free Skylent account in 30 seconds and get +50 Elixir Coins.'}
              </p>

              {/* 1-Tap Google Sign-In/Sign-Up at the top (PW / Unacademy / Scaler / Coursera Benchmark) */}
              {googleAvailable !== false && !otpSent && !suOtpSent ? (
                <div style={{ marginTop: 16 }}>
                  <button
                    className="entry-google"
                    type="button"
                    onClick={() => startGoogleAuth(true)}
                    disabled={submitting || googleLoading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                      <path fill="#FBBC05" d="M5.27 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.4l3.98-3.09z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.09c.95-2.85 3.6-4.94 6.73-4.94z" />
                    </svg>
                    <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google (1-Click)'}</span>
                  </button>
                  <div className="entry-or"><span>or continue with email</span></div>
                </div>
              ) : null}

              {/* Sign-In Method Switcher: Email & Password vs Instant Email OTP */}
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
                    marginTop: 4,
                    marginBottom: 14,
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
                      padding: '8px 10px',
                      borderRadius: 7,
                      border: 'none',
                      background: authMethod === 'password' ? '#5142b5' : 'transparent',
                      color: authMethod === 'password' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: 12.5,
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
                      padding: '8px 10px',
                      borderRadius: 7,
                      border: 'none',
                      background: authMethod === 'email_otp' ? '#5142b5' : 'transparent',
                      color: authMethod === 'email_otp' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    Instant Email OTP
                  </button>
                </div>
              ) : null}

              {error ? (
                <div className="entry-error" role="alert" aria-live="polite" ref={errorRef} tabIndex={-1}>{error}</div>
              ) : null}

              {signingIn && authMethod === 'email_otp' ? (
                !otpSent ? (
                  <form method="post" className="entry-form" onSubmit={handleSendEmailLoginOtp} noValidate>
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
                      {submitting ? 'Sending 6-Digit OTP…' : 'Get 6-Digit Login OTP →'}
                    </button>

                    <p className="entry-alt">
                      New to Skylent?{' '}
                      <button type="button" onClick={() => { setTab('signup'); setError(null) }}>
                        Create an account →
                      </button>
                    </p>
                  </form>
                ) : (
                  <form method="post" className="entry-form" onSubmit={handleVerifyEmailLoginOtp} noValidate>
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
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        disabled={submitting}
                        style={{ letterSpacing: '0.24em', fontWeight: 800, fontSize: 17, textAlign: 'center' }}
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
                      {submitting ? 'Verifying OTP…' : 'Verify OTP & Sign In →'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12.5 }}>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || submitting}
                        onClick={() => void handleSendEmailLoginOtp()}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: resendCooldown > 0 ? '#94a3b8' : '#5142b5',
                          fontWeight: 700,
                          cursor: resendCooldown > 0 ? 'default' : 'pointer',
                        }}
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpCode('')
                          setOtpSentMessage(null)
                          setError(null)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#475569',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Change email
                      </button>
                    </div>
                  </form>
                )
              ) : signingIn ? (
                <form method="post" className="entry-form" onSubmit={handleSignIn} noValidate>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label htmlFor="si-password" style={{ margin: 0 }}>PASSWORD</label>
                      <Link to="/reset-password" style={{ fontSize: 12, fontWeight: 600, color: '#5142b5', textDecoration: 'none' }}>
                        Forgot password?
                      </Link>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="si-password"
                        type={showSiPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={siPassword}
                        onChange={e => setSiPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={submitting}
                        style={{ paddingRight: 64 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSiPassword((v) => !v)}
                        aria-label={showSiPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#5142b5',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '4px 6px',
                        }}
                      >
                        {showSiPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? 'Signing in…' : 'Sign In to Dashboard →'}
                  </button>

                  <p className="entry-alt">
                    New to Skylent?{' '}
                    <button type="button" onClick={() => { setTab('signup'); setError(null) }}>
                      Create a free account →
                    </button>
                  </p>
                </form>
              ) : !suOtpSent ? (
                <form method="post" className="entry-form" onSubmit={handleSignUpStep1SendOtp} noValidate>
                  <div className="entry-field">
                    <label htmlFor="su-name">FULL NAME (PRINTED ON CERTIFICATES)</label>
                    <input
                      id="su-name"
                      type="text"
                      autoComplete="name"
                      value={suName}
                      onChange={e => setSuName(e.target.value)}
                      placeholder="Enter your first and last name"
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
                    <div style={{ position: 'relative' }}>
                      <input
                        id="su-password"
                        type={showSuPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={suPassword}
                        onChange={e => setSuPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        disabled={submitting}
                        style={{ paddingRight: 64 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSuPassword((v) => !v)}
                        aria-label={showSuPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#5142b5',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '4px 6px',
                        }}
                      >
                        {showSuPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <TermsConsent inputRef={termsRef} checked={suTerms} onChange={setSuTerms} action="creating an account" showError={suTermsTried} />
                  <button className="entry-submit" type="submit" disabled={submitting || googleLoading}>
                    {submitting ? 'Sending Verification OTP…' : 'Send Verification OTP to Email →'}
                  </button>

                  <p className="entry-alt">
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('signin'); setError(null) }}>
                      Sign in →
                    </button>
                  </p>
                </form>
              ) : (
                <form method="post" className="entry-form" onSubmit={handleSignUpStep2VerifyAndCreate} noValidate>
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
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={suOtpCode}
                      onChange={(e) => setSuOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      disabled={submitting}
                      style={{ letterSpacing: '0.24em', fontWeight: 800, fontSize: 17, textAlign: 'center' }}
                    />
                  </div>

                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? 'Verifying & Creating Account…' : 'Verify Email & Create Account →'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12.5 }}>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || submitting}
                      onClick={() => void handleSignUpStep1SendOtp()}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: resendCooldown > 0 ? '#94a3b8' : '#5142b5',
                        fontWeight: 700,
                        cursor: resendCooldown > 0 ? 'default' : 'pointer',
                      }}
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSuOtpSent(false)
                        setSuOtpCode('')
                        setSuOtpMessage(null)
                        setError(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#475569',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Edit details
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="entry-note" style={{ textAlign: 'center', marginInline: 'auto' }}>
            By continuing, you agree to Skylent&apos;s <Link to="/terms">Terms</Link> &amp;{' '}
            <Link to="/privacy">Privacy Policy</Link>. Need help? <Link to="/reset-password">Reset password</Link> or{' '}
            <Link to="/contact">contact support</Link>.
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
