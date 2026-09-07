import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { type CatalogEnrollTarget, type LoginRedirectState } from "../lib/catalog-enrollment"
import { buildGoogleOAuthStartUrl } from "../lib/auth-api"
import { finishAuthNavigation } from "../lib/auth-routing"
import AuthPageShell, {
  AuthDivider,
  AuthDevDemoAccounts,
  AuthEnrollNotice,
  AuthError,
  AuthGoogleIcon,
  AuthSubtitle,
  authFieldClass,
} from "../components/auth/AuthPageShell"
import { getDomainAccent } from "../aurora-themes"

const accent = getDomainAccent("general")

type AuthFormError = {
  title?: string
  message: string
}

function resolveOAuthErrorMessage(errorParam: string): AuthFormError {
  switch (errorParam) {
    case "oauth_config":
      return {
        title: "Google sign-in unavailable",
        message: "Google sign-in is not available right now. Use email and password, or try again later.",
      }
    case "oauth_denied":
      return {
        title: "Sign-in cancelled",
        message: "Google sign-in was cancelled. You can try again or use email and password.",
      }
    case "oauth_state":
      return {
        title: "Sign-in expired",
        message: "Your Google sign-in session expired. Please try again.",
      }
    case "oauth_start":
      return {
        title: "Could not start Google sign-in",
        message: "Google sign-in could not be started. Please try again.",
      }
    case "oauth_failed":
    default:
      return {
        title: "Google sign-in failed",
        message: "Google sign-in did not complete. Please try again or use email and password.",
      }
  }
}

function readOAuthRedirectState(params: URLSearchParams): LoginRedirectState | null {
  const returnTo = params.get("returnTo") ?? undefined
  const enrollKind = params.get("enrollKind")
  const enrollSlug = params.get("enrollSlug")?.trim()
  let enrollTarget: CatalogEnrollTarget | undefined
  if (enrollKind === "course" && enrollSlug) {
    enrollTarget = { kind: "course", slug: enrollSlug }
  } else if (enrollKind === "program" && enrollSlug) {
    enrollTarget = { kind: "program", slug: enrollSlug }
  }

  if (!returnTo && !enrollTarget) return null
  return { returnTo, enrollTarget }
}

function mergeRedirectState(
  locationState: LoginRedirectState | null,
  searchParams: URLSearchParams,
): LoginRedirectState | null {
  if (searchParams.get("oauth") !== "success") return locationState
  const oauthState = readOAuthRedirectState(searchParams)
  return {
    returnTo: oauthState?.returnTo ?? locationState?.returnTo,
    enrollTarget: oauthState?.enrollTarget ?? locationState?.enrollTarget,
  }
}

export default function LoginPage() {
  const { login, signup, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = location.pathname === "/signup"
  const redirectState = (location.state ?? null) as LoginRedirectState | null

  const [siEmail, setSiEmail] = useState("")
  const [siPassword, setSiPassword] = useState("")
  const [suName, setSuName] = useState("")
  const [suEmail, setSuEmail] = useState("")
  const [suPassword, setSuPassword] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState<AuthFormError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [oauthHandled, setOauthHandled] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorParam = params.get("error")
    if (errorParam?.startsWith("oauth")) {
      setError(resolveOAuthErrorMessage(errorParam))
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    if (params.get("oauth") !== "success" || !ready || oauthHandled) return

    setOauthHandled(true)
    if (!user) {
      setError({
        title: "Session not restored",
        message: "Google sign-in could not restore your session. Please try again.",
      })
      navigate(location.pathname, { replace: true, state: location.state })
      return
    }

    const mergedState = mergeRedirectState(redirectState, params)
    void finishAuthNavigation(navigate, user.role, mergedState)
  }, [location.pathname, location.search, location.state, navigate, oauthHandled, ready, user, redirectState])

  useEffect(() => {
    if (!ready || !user) return
    const params = new URLSearchParams(location.search)
    if (params.get("oauth") === "success") return
    void finishAuthNavigation(navigate, user.role, redirectState)
  }, [ready, user, navigate, redirectState, location.search])

  function startGoogleAuth() {
    setError(null)
    setGoogleLoading(true)
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
      setError({ message: "Enter your email address." })
      return
    }
    if (!siPassword.trim()) {
      setError({ message: "Enter your password." })
      return
    }

    setSubmitting(true)

    try {
      const role = await login(siEmail.trim(), siPassword)
      const enrollError = await finishAuthNavigation(navigate, role, redirectState)
      if (enrollError) {
        setError({
          title: "Signed in",
          message: `Enrollment could not be completed: ${enrollError}`,
        })
      }
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "Unable to sign in." })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!suName.trim()) {
      setError({ message: "Enter your full name." })
      return
    }
    if (!suEmail.trim()) {
      setError({ message: "Enter your email address." })
      return
    }
    if (!suPassword.trim()) {
      setError({ message: "Enter a password." })
      return
    }
    if (suPassword.trim().length < 8) {
      setError({ message: "Password must be at least 8 characters." })
      return
    }

    setSubmitting(true)

    try {
      const role = await signup(suName.trim(), suEmail.trim(), suPassword)
      const enrollError = await finishAuthNavigation(navigate, role, redirectState)
      if (enrollError) {
        setError({
          title: "Account created",
          message: `Enrollment could not be completed: ${enrollError}`,
        })
      }
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "Unable to create account." })
    } finally {
      setSubmitting(false)
    }
  }

  const switchPath = isSignup ? "/login" : "/signup"
  const switchLabel = isSignup ? "Sign in" : "Create an account"
  const switchPrompt = isSignup ? "Already have an account?" : "Don't have an account?"

  return (
    <AuthPageShell>
      <h1 className="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
      <AuthSubtitle>
        {isSignup
          ? "Join Skylent to learn, build skills, and move your career forward."
          : "Sign in to continue your learning journey across Education, Skills, and Career OS."}
      </AuthSubtitle>

      {redirectState?.enrollTarget && (
        <AuthEnrollNotice kind={redirectState.enrollTarget.kind} />
      )}

      {error && (
        <AuthError
          title={error.title ?? "Unable to sign in"}
          message={error.message}
        />
      )}

      {!isSignup ? (
        <form onSubmit={handleSignIn} noValidate className="auth-form">
          <div className="auth-field-group">
            <label htmlFor="si-email" className="auth-label">Email</label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              value={siEmail}
              onChange={(e) => setSiEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
              className={authFieldClass(focusedField === "si-email")}
              onFocus={() => setFocusedField("si-email")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div className="auth-field-group">
            <label htmlFor="si-password" className="auth-label">Password</label>
            <input
              id="si-password"
              type="password"
              autoComplete="current-password"
              value={siPassword}
              onChange={(e) => setSiPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className={authFieldClass(focusedField === "si-pw")}
              onFocus={() => setFocusedField("si-pw")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <AuthDivider />

          <button
            type="button"
            disabled={submitting || googleLoading}
            onClick={startGoogleAuth}
            className="auth-google-button"
          >
            <AuthGoogleIcon />
            <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
          </button>

          <p className="auth-switch">
            {switchPrompt}{" "}
            <Link to={switchPath} state={redirectState} style={{ color: accent.text }}>
              {switchLabel}
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} noValidate className="auth-form">
          {[
            { id: "su-name", label: "Name", type: "text", value: suName, set: setSuName, placeholder: "Your name", auto: "name" },
            { id: "su-email", label: "Email", type: "email", value: suEmail, set: setSuEmail, placeholder: "you@example.com", auto: "email" },
            { id: "su-pw", label: "Password", type: "password", value: suPassword, set: setSuPassword, placeholder: "At least 8 characters", auto: "new-password" },
          ].map((field) => (
            <div key={field.id} className="auth-field-group">
              <label htmlFor={field.id} className="auth-label">{field.label}</label>
              <input
                id={field.id}
                type={field.type}
                autoComplete={field.auto}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                disabled={submitting}
                className={authFieldClass(focusedField === field.id)}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          ))}

          <button type="submit" disabled={submitting || googleLoading} className="auth-submit">
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <AuthDivider />

          <button
            type="button"
            disabled={submitting || googleLoading}
            onClick={startGoogleAuth}
            className="auth-google-button"
          >
            <AuthGoogleIcon />
            <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
          </button>

          <p className="auth-switch">
            {switchPrompt}{" "}
            <Link to={switchPath} state={redirectState} style={{ color: accent.text }}>
              {switchLabel}
            </Link>
          </p>
        </form>
      )}

      <AuthDevDemoAccounts />
    </AuthPageShell>
  )
}
