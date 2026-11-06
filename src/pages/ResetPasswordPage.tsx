import { useEffect, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  completePasswordReset,
  requestPasswordReset,
  verifyPasswordResetToken,
} from "../lib/auth-api"
import "./LoginPage.css"

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get("token")?.trim() ?? ""
  const hasToken = token.length >0

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestNote, setRequestNote] = useState<string | null>(null)
  const [mailConfigured, setMailConfigured] = useState<boolean | null>(null)
  const [tokenState, setTokenState] = useState<"checking" | "ready" | "invalid">(
    hasToken ? "checking" : "ready",
  )
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!hasToken) return
    if (!TOKEN_PATTERN.test(token)) {
      setTokenState("invalid")
      setError("This reset link is invalid or has expired.")
      return
    }
    let cancelled = false
    setTokenState("checking")
    void verifyPasswordResetToken(token)
      .then(() => {
        if (!cancelled) setTokenState("ready")
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setTokenState("invalid")
        setError(err instanceof Error ? err.message : "This reset link is invalid or has expired.")
      })
    return () => {
      cancelled = true
    }
  }, [hasToken, token])

  async function submitRequest(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setRequestNote(null)
    if (!email.trim()) {
      setError("Enter your email address.")
      return
    }
    setSubmitting(true)
    try {
      const result = await requestPasswordReset(email.trim())
      setRequestNote(result.message)
      setMailConfigured(result.emailConfigured)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The reset request could not be sent. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function submitNewPassword(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Choose a password of at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("The two passwords do not match.")
      return
    }
    setSubmitting(true)
    try {
      await completePasswordReset(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The password could not be reset. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="entry">
      <div className="entry-top">
        <Link className="entry-back" to="/login">← Back to Sign In</Link>
      </div>
      <main className="entry-main">
        <div className="entry-col">
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <Link className="entry-mark" to="/" style={{ margin: 0 }}>Skylent</Link>
          </div>

          <div className="entry-frame">
            <div className="entry-pane" style={{ padding: "32px 28px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f5f3ff",
                    color: "#5142b5",
                    fontSize: 22,
                    marginBottom: 12,
                  }}
                >
                  
                </span>
                <h1 className="entry-title" style={{ fontSize: 24 }}>
                  {hasToken ? "Set New Password" : "Forgot Password?"}
                </h1>
                <p className="entry-lead" style={{ fontSize: 13.5 }}>
                  {hasToken
                    ? "Choose a strong password of at least 8 characters."
                    : "Enter your registered email address and we will send you a password reset link."}
                </p>
              </div>

              {error ? (
                <div className="entry-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>
              ) : null}

              {!hasToken && requestNote ? (
                <div
                  role="status"
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 14, color: "#166534", fontWeight: 600 }}>
                    ✓ {requestNote}
                  </p>
                  {mailConfigured === false ? (
                    <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#64748b" }}>
                      Note: Email provider is not configured on this server yet.{" "}
                      <Link to="/contact">Contact support</Link>if you need help.
                    </p>
                  ) : (
                    <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#475569" }}>
                      Please check your inbox (and spam folder) for the reset link.
                    </p>
                  )}
                  <p className="entry-alt" style={{ marginTop: 12 }}>
                    <Link to="/login" style={{ color: "#5142b5", fontWeight: 700 }}>← Return to Sign In</Link>
                  </p>
                </div>
              ) : null}

              {!hasToken && !requestNote ? (
                <form method="post" className="entry-form" onSubmit={(event) => { void submitRequest(event) }} noValidate style={{ margin: 0 }}>
                  <div className="entry-field">
                    <label htmlFor="reset-email">YOUR REGISTERED EMAIL</label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>setEmail(event.target.value)}
                      placeholder="you@gmail.com"
                      disabled={submitting}
                    />
                  </div>
                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? "Sending Reset Link…" : "Send Reset Link →"}
                  </button>
                  <p className="entry-alt">
                    Remember your password?{" "}
                    <Link to="/login" style={{ color: "#5142b5", fontWeight: 700 }}>
                      Sign In
                    </Link>
                  </p>
                </form>
              ) : null}

              {hasToken && tokenState === "checking" ? (
                <p className="entry-lead" role="status" style={{ textAlign: "center" }}>Verifying reset link…</p>
              ) : null}

              {hasToken && tokenState === "invalid" ? (
                <p className="entry-alt" style={{ textAlign: "center" }}>
                  <Link to="/reset-password" style={{ color: "#5142b5", fontWeight: 700 }}>Request a new link</Link>
                </p>
              ) : null}

              {hasToken && tokenState === "ready" && done ? (
                <div role="status" style={{ textAlign: "center" }}>
                  <p className="entry-lead" style={{ color: "#166534", fontWeight: 600 }}>
                    ✓ Password has been reset successfully!
                  </p>
                  <p className="entry-alt" style={{ marginTop: 14 }}>
                    <Link to="/login" className="entry-submit" style={{ display: "inline-block", textDecoration: "none" }}>
                      Sign In Now →
                    </Link>
                  </p>
                </div>
              ) : null}

              {hasToken && tokenState === "ready" && !done ? (
                <form method="post" className="entry-form" onSubmit={(event) => { void submitNewPassword(event) }} noValidate style={{ margin: 0 }}>
                  <div className="entry-field">
                    <label htmlFor="reset-password">NEW PASSWORD</label>
                    <input
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      disabled={submitting}
                    />
                  </div>
                  <div className="entry-field">
                    <label htmlFor="reset-confirm">CONFIRM PASSWORD</label>
                    <input
                      id="reset-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) =>setConfirm(event.target.value)}
                      placeholder="Re-enter password"
                      disabled={submitting}
                    />
                  </div>
                  <button className="entry-submit" type="submit" disabled={submitting}>
                    {submitting ? "Saving Password…" : "Save New Password"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          <p className="entry-note" style={{ textAlign: "center", marginInline: "auto" }}>
            Read our <Link to="/terms">Terms</Link> &amp; <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
