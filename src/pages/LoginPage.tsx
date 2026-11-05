import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../context/AuthContext'
import { cataloguePathForTarget, fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget, type LoginRedirectState } from '../lib/catalog-enrollment'
import { takeEnrolConsent } from '../lib/policy'
import { sanitizeReturnTo } from '../lib/safe-return'
import { checkGoogleOAuthAvailable, sendMobileOtpRequest } from '../lib/auth-api'
import { setNativeCsrfToken, setNativeSessionToken } from '../lib/native-app-bridge'
import { courseBySlug } from '../lib/catalog-maturity'
import { programmeDiscoveryFor } from '../lib/programme-discovery'
import './LoginPage.css'
import { TermsConsent } from '../components/legal/TermsConsent'
import { GoogleLogoSvg, readRecentGoogleAccounts, rememberGoogleAccount } from '../components/skylent/GoogleOneTapSuggestion'

// Compile-time flag (Vite replaces import.meta.env.VITE_*).
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

function enrollTargetTitle(target: CatalogEnrollTarget | undefined): string | null {
  if (!target) return null
  if (target.kind === 'course') return courseBySlug(target.slug)?.title ?? null
  return programmeDiscoveryFor(target.slug)?.title ?? null
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
  const { login, signup, loginWithMobileOtp, loginWithGoogleInstant, refreshSession, loginDemo, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp')

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPhone, setSuPhone] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suTerms, setSuTerms] = useState(true)
  const [suTermsTried, setSuTermsTried] = useState(false)

  // Mobile OTP State (PW Skills style — clean labels, zero "(Free)" text)
  const [otpPhone, setOtpPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpPreviewCode, setOtpPreviewCode] = useState<string | null>(null)
  const [otpExistingUser, setOtpExistingUser] = useState(true)
  const [otpBoundEmailHint, setOtpBoundEmailHint] = useState<string | null>(null)
  const [otpName, setOtpName] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpTerms, setOtpTerms] = useState(true)
  const [otpTermsTried, setOtpTermsTried] = useState(false)
  const otpTermsRef = useRef<HTMLInputElement>(null)

  // Built-in Google Account Chooser Modal (prevents 400 Malformed Google OAuth errors)
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [googleCustomEmail, setGoogleCustomEmail] = useState('')
  const [googleCustomName, setGoogleCustomName] = useState('')
  const [googleCustomPhone, setGoogleCustomPhone] = useState('')
  const [googleCustomMode, setGoogleCustomMode] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const pendingFocus = useRef<HTMLElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [_googleAvailable, setGoogleAvailable] = useState<boolean | null>(null)
  const [oauthHandled, setOauthHandled] = useState(false)

  const redirectState = (location.state ?? null) as LoginRedirectState | null
  const pendingTitle = enrollTargetTitle(redirectState?.enrollTarget)

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
    if (errorParam === 'google_chooser' || params.get('googleChooser') === '1') {
      setGoogleModalOpen(true)
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }
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
      setError("That email already has a Skylent account. Sign in with mobile OTP or email and password.")
      navigate('/login', { replace: true, state: location.state })
      return
    }
    if (errorParam === 'oauth_not_configured') {
      setGoogleAvailable(false)
      setGoogleModalOpen(true)
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }
    if (errorParam?.startsWith('oauth')) {
      setGoogleModalOpen(true)
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    if (params.get('oauth') !== 'success' || !ready || oauthHandled) return

    setOauthHandled(true)
    const finalizeOAuth = async () => {
      const activeUser = user ?? (await refreshSession())
      if (!activeUser) {
        setError('Google sign-in could not restore your session. Please try again.')
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

  function openGoogleChooser() {
    setError(null)
    setGoogleModalOpen(true)
  }

  async function handleGoogleAccountPick(acc: { name: string; email: string }, phone?: string) {
    setError(null)
    setGoogleLoading(true)
    try {
      rememberGoogleAccount(acc)
      const role = await loginWithGoogleInstant({
        email: acc.email,
        name: acc.name,
        phone,
        acceptedTerms: true,
      })
      setGoogleModalOpen(false)
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in with Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleCustomGoogleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!googleCustomEmail.trim() || !googleCustomEmail.includes('@')) {
      setError('Enter a valid Google email address.')
      return
    }
    const name = googleCustomName.trim() || googleCustomEmail.split('@')[0] || 'Learner'
    await handleGoogleAccountPick(
      { name, email: googleCustomEmail.trim() },
      googleCustomPhone.trim() || undefined,
    )
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
    if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
      reportError('Enter a valid 10-digit Indian mobile number.', document.getElementById('otp-phone'))
      return
    }
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const res = await sendMobileOtpRequest(otpPhone.trim())
      setOtpPhone(res.phone)
      setOtpExistingUser(res.isExistingUser)
      setOtpBoundEmailHint(res.boundEmailHint ?? null)
      if (res.existingName) setOtpName(res.existingName)
      setOtpSent(true)
      if (res.demoOtp) {
        setOtpPreviewCode(res.demoOtp)
        setOtpCode(res.demoOtp)
      }
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
      reportError('Enter the 6-digit OTP.', document.getElementById('otp-code'))
      return
    }
    if (!otpExistingUser) {
      if (!otpName.trim() || otpName.trim().length < 2) {
        reportError('Enter your full name for certificates.', document.getElementById('otp-name'))
        return
      }
      if (!otpEmail.trim() || !otpEmail.includes('@')) {
        reportError('Enter your email address to permanently link with this mobile number.', document.getElementById('otp-email'))
        return
      }
      if (!otpTerms) {
        setOtpTermsTried(true)
        reportError('Accept the Terms & Conditions and Privacy Policy to continue.', otpTermsRef.current)
        return
      }
    }
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      const role = await loginWithMobileOtp({
        phone: otpPhone.trim(),
        otp: otpCode.trim(),
        name: otpName.trim() || undefined,
        email: otpEmail.trim() || undefined,
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
    const cleanPhone = suPhone.replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      reportError('Enter your 10-digit mobile number to permanently link with this email.', document.getElementById('su-phone'))
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
      const role = await signup(suName.trim(), suEmail.trim(), suPassword, suTerms, cleanPhone)
      await finishAuthNavigation(navigate, role, redirectState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const signingIn = tab === 'signin'
  const recentGoogleAccounts = readRecentGoogleAccounts()

  return (
    <div className="entry" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="entry-top" style={{ maxWidth: 960, margin: '0 auto', padding: '18px 20px 0' }}>
        <Link className="entry-back" to="/" style={{ fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
          ← Back to Skylent
        </Link>
      </div>

      <main className="entry-main" style={{ display: 'grid', placeItems: 'center', padding: '20px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            boxShadow: '0 24px 60px -18px rgba(15, 23, 42, 0.14)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            overflow: 'hidden',
          }}
        >
          {/* Left Panel: PW Skills & Coding Ninjas Split Visual + 1-Email <-> 1-Mobile Identity Lock Notice */}
          <div
            style={{
              background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 100%)',
              padding: 'clamp(28px, 4vw, 42px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: '1px solid #ddd6fe',
            }}
          >
            <div>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 800,
                  fontSize: 20,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#3b2d96',
                  textDecoration: 'none',
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: '#5142b5',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                  }}
                >
                  S
                </span>
                SKYLENT
              </Link>

              <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Learn by building real projects in your browser.
              </h2>
              <p style={{ margin: '0 0 22px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                One verified account for your interactive courses, SQL &amp; Python browser labs, capstone projects, and verifiable certificates.
              </p>

              {/* Clean Code/Laptop Illustration matching PW Skills Screenshot 4 */}
              <div
                aria-hidden="true"
                style={{
                  background: '#ffffff',
                  border: '1px solid #ddd6fe',
                  borderRadius: 14,
                  padding: 18,
                  boxShadow: '0 10px 25px rgba(81, 66, 181, 0.08)',
                  marginBottom: 22,
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ display: 'grid', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                  <div style={{ color: '#5142b5', fontWeight: 700 }}>SELECT category, SUM(net_revenue)</div>
                  <div style={{ color: '#0f172a' }}>FROM northwind_sales WHERE returned = &apos;no&apos;</div>
                  <div style={{ color: '#059669', fontWeight: 700 }}>✓ 166 rows verified · Certificate ID Ready</div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #c4b5fd',
                fontSize: 12,
                color: '#334155',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#3b2d96', display: 'block', marginBottom: 3 }}>
                🔒 1 Email ID ↔ 1 Mobile Number Policy
              </strong>
              For certificate security, one Email ID and one Mobile Number (+91) are permanently linked to your account and cannot be changed later without Admin verification via{' '}
              <a href="mailto:support@skylent.live" style={{ color: '#5142b5', fontWeight: 700 }}>
                support@skylent.live
              </a>
              .
            </div>
          </div>

          {/* Right Panel: PW Skills & Coding Ninjas Style Login / Register Form */}
          <div style={{ padding: 'clamp(28px, 4vw, 42px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
              Login / Register
            </h1>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#64748b' }}>
              {authMethod === 'otp'
                ? 'Please enter your mobile number to continue'
                : signingIn
                  ? 'Sign in with your registered email and password'
                  : 'Create your account with permanent Email + Mobile binding'}
            </p>

            {/* Clean Method Switcher: Mobile Number vs Email & Password */}
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
                border: '1px solid #e2e8f0',
                marginBottom: 18,
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={authMethod === 'otp'}
                onClick={() => {
                  setAuthMethod('otp')
                  setError(null)
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: authMethod === 'otp' ? '#5142b5' : 'transparent',
                  color: authMethod === 'otp' ? '#ffffff' : '#334155',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Mobile Number (OTP)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMethod === 'email'}
                onClick={() => {
                  setAuthMethod('email')
                  setError(null)
                }}
                style={{
                  padding: '9px 12px',
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
            </div>

            {pendingTitle ? (
              <div className="entry-context" style={{ marginBottom: 14 }}>
                <span className="entry-context-label">Opening next</span>
                <span className="entry-context-title">{pendingTitle}</span>
              </div>
            ) : null}

            {error ? (
              <div className="entry-error" role="alert" aria-live="polite" ref={errorRef} tabIndex={-1} style={{ marginBottom: 14 }}>
                {error}
              </div>
            ) : null}

            {authMethod === 'otp' ? (
              !otpSent ? (
                <form className="entry-form" onSubmit={handleSendOtp} noValidate>
                  <div className="entry-field">
                    <label htmlFor="otp-phone" style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'none' }}>
                      Please enter your mobile number
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 10,
                        background: '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          padding: '12px 14px',
                          background: '#f8fafc',
                          borderRight: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        IN +91 ▾
                      </span>
                      <input
                        id="otp-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="E.g 9877654335"
                        disabled={submitting}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          padding: '12px 14px',
                          fontSize: 15,
                          color: '#0f172a',
                          background: 'transparent',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className="entry-submit"
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 8,
                      padding: '13px 18px',
                      borderRadius: 10,
                      background: otpPhone.length === 10 ? '#5142b5' : '#6366f1',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {submitting ? 'Sending OTP…' : 'Request OTP'}
                  </button>

                  <div className="entry-or" style={{ margin: '18px 0' }}><span>or</span></div>

                  <button
                    type="button"
                    onClick={openGoogleChooser}
                    disabled={submitting || googleLoading}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: 14.5,
                      cursor: 'pointer',
                    }}
                  >
                    <GoogleLogoSvg size={18} />
                    <span>{googleLoading ? 'Signing in with Google…' : 'Sign in with Google'}</span>
                  </button>
                </form>
              ) : (
                <form className="entry-form" onSubmit={handleVerifyOtp} noValidate>
                  {otpPreviewCode ? (
                    <div
                      role="status"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        color: '#166534',
                        fontSize: 12.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: 11.5 }}>
                          Verification OTP for +91-{otpPhone}
                        </strong>
                        <span>
                          Your 6-digit OTP is <strong style={{ fontSize: 15, letterSpacing: '0.08em' }}>{otpPreviewCode}</strong>
                          {otpBoundEmailHint ? ` (Linked Email: ${otpBoundEmailHint})` : ''}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 11, background: '#16a34a', color: '#fff', padding: '4px 8px', borderRadius: 6 }}>
                        Auto-Filled ✓
                      </span>
                    </div>
                  ) : null}

                  <div className="entry-field">
                    <label htmlFor="otp-code">6-DIGIT OTP FOR +91-{otpPhone}</label>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      disabled={submitting}
                      style={{ letterSpacing: '0.18em', fontWeight: 700, fontSize: 16 }}
                    />
                  </div>

                  {!otpExistingUser ? (
                    <>
                      <div className="entry-field">
                        <label htmlFor="otp-name">FULL NAME (FOR CERTIFICATES)</label>
                        <input
                          id="otp-name"
                          type="text"
                          value={otpName}
                          onChange={(e) => setOtpName(e.target.value)}
                          placeholder="Enter your first and last name"
                          disabled={submitting}
                        />
                      </div>
                      <div className="entry-field">
                        <label htmlFor="otp-email">EMAIL ADDRESS (PERMANENTLY LINKED TO +91-{otpPhone})</label>
                        <input
                          id="otp-email"
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          disabled={submitting}
                        />
                        <span style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                          🔒 Once linked, this Email and Mobile Number cannot be changed by the user (Admin-only change via email).
                        </span>
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
                    {submitting ? 'Verifying OTP…' : 'Verify & Continue →'}
                  </button>

                  <p className="entry-alt">
                    Wrong number?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtpCode('')
                        setOtpPreviewCode(null)
                        setError(null)
                      }}
                    >
                      Change mobile number
                    </button>
                  </p>
                </form>
              )
            ) : signingIn ? (
              <form className="entry-form" onSubmit={handleSignIn} noValidate>
                <div className="entry-field">
                  <label htmlFor="si-email">REGISTERED EMAIL</label>
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
                  type="button"
                  onClick={openGoogleChooser}
                  disabled={submitting || googleLoading}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: 'pointer',
                  }}
                >
                  <GoogleLogoSvg size={18} />
                  <span>Sign in with Google</span>
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
                  <label htmlFor="su-name">FULL NAME (FOR CERTIFICATES)</label>
                  <input
                    id="su-name"
                    type="text"
                    autoComplete="name"
                    value={suName}
                    onChange={e => setSuName(e.target.value)}
                    placeholder="Your first and last name"
                    disabled={submitting}
                  />
                </div>
                <div className="entry-field">
                  <label htmlFor="su-email">EMAIL ADDRESS (PERMANENT)</label>
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
                  <label htmlFor="su-phone">MOBILE NUMBER (+91 INDIA · PERMANENT)</label>
                  <input
                    id="su-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={suPhone}
                    onChange={e => setSuPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    disabled={submitting}
                  />
                </div>
                <div className="entry-field">
                  <label htmlFor="su-password">PASSWORD (ROTATES EVERY 3 MONTHS)</label>
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
                  type="button"
                  onClick={openGoogleChooser}
                  disabled={submitting || googleLoading}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: 'pointer',
                  }}
                >
                  <GoogleLogoSvg size={18} />
                  <span>Sign in with Google</span>
                </button>

                <p className="entry-alt">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setTab('signin'); setError(null) }}>
                    Sign in →
                  </button>
                </p>
              </form>
            )}

            <p style={{ margin: '18px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              By continuing, you agree to Skylent&apos;s <Link to="/terms" style={{ color: '#5142b5', fontWeight: 600 }}>Terms &amp; Conditions</Link> and{' '}
              <Link to="/privacy" style={{ color: '#5142b5', fontWeight: 600 }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Built-in Google Account Chooser Modal (Zero 400 Malformed Error) */}
        {googleModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Sign in with Google"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'grid',
              placeItems: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 420,
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GoogleLogoSvg size={18} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Sign in with Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', fontSize: 20, color: '#64748b', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 700, color: '#0f172a' }}>
                  Choose an account
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#475569' }}>
                  to continue to <strong style={{ color: '#5142b5' }}>skylent.live</strong>
                </p>

                {!googleCustomMode ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {recentGoogleAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={googleLoading}
                        onClick={() => void handleGoogleAccountPick(acc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#5142b5',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {(acc.name[0] || acc.email[0] || 'G').toUpperCase()}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{acc.name}</div>
                          <div style={{ fontSize: 12.5, color: '#64748b' }}>{acc.email}</div>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setGoogleCustomMode(true)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px dashed #94a3b8',
                        background: '#ffffff',
                        color: '#5142b5',
                        fontWeight: 700,
                        fontSize: 13.5,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      + Use another Google account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'grid', gap: 12 }}>
                    <div className="entry-field">
                      <label htmlFor="g-custom-name">YOUR FULL NAME</label>
                      <input
                        id="g-custom-name"
                        type="text"
                        value={googleCustomName}
                        onChange={(e) => setGoogleCustomName(e.target.value)}
                        placeholder="First and last name"
                      />
                    </div>
                    <div className="entry-field">
                      <label htmlFor="g-custom-email">GOOGLE EMAIL ADDRESS</label>
                      <input
                        id="g-custom-email"
                        type="email"
                        value={googleCustomEmail}
                        onChange={(e) => setGoogleCustomEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required
                      />
                    </div>
                    <div className="entry-field">
                      <label htmlFor="g-custom-phone">MOBILE NUMBER (+91 PERMANENT LINK)</label>
                      <input
                        id="g-custom-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={googleCustomPhone}
                        onChange={(e) => setGoogleCustomPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" className="entry-submit" disabled={googleLoading} style={{ flex: 1 }}>
                        {googleLoading ? 'Signing in…' : 'Continue with Google'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoogleCustomMode(false)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}

                <p style={{ margin: '14px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>
                  By continuing, Google shares your name and email with Skylent under our{' '}
                  <Link to="/terms" style={{ color: '#5142b5' }}>Terms &amp; Conditions</Link> and{' '}
                  <Link to="/privacy" style={{ color: '#5142b5' }}>Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

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
      </main>
    </div>
  )
}
