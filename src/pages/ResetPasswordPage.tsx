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
  const hasToken = token.length > 0

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
        <Link className="entry-back" to="/">← Back to Skylent</Link>
      </div>
      <main className="entry-main">
        <div className="entry-col">
          <Link className="entry-mark" to="/">Skylent</Link>
          <div className="entry-frame">
            <div className="entry-frame-bar">
              <b>My learning</b>
              <span>Reset password</span>
            </div>
            <div className="entry-frame-body">
              <div className="entry-rail" aria-hidden="true">
                <p>Waiting inside</p>
                <ul>
                  {["Learning", "Practice", "Projects", "Evidence", "Career"].map((stage) => (
                    <li key={stage}>{stage}</li>
                  ))}
                </ul>
              </div>
              <div className="entry-pane">
                <h1 className="entry-title">{hasToken ? "Choose a new password." : "Reset your password."}</h1>
                <p className="entry-lead">
                  {hasToken
                    ? "This link works once. After the password is saved, sign in with it."
                    : "Enter the email on your account. If it matches, a reset link is sent."}
                </p>
                {error ? (
                  <div className="entry-error" role="alert">{error}</div>
                ) : null}

                {!hasToken && requestNote ? (
                  <div role="status">
                    <p className="entry-lead">{requestNote}</p>
                    {mailConfigured === false ? (
                      <p className="entry-note">
                        Password reset email is not configured on this server, so the link may not arrive.{" "}
                        <Link to="/contact">Contact us</Link> if you still cannot sign in.
                      </p>
                    ) : null}
                    <p className="entry-alt">
                      <Link to="/login">Back to sign in</Link>
                    </p>
                  </div>
                ) : null}

                {!hasToken && !requestNote ? (
                  <form className="entry-form" onSubmit={(event) => { void submitRequest(event) }} noValidate>
                    <div className="entry-field">
                      <label htmlFor="reset-email">EMAIL</label>
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={submitting}
                      />
                    </div>
                    <button className="entry-submit" type="submit" disabled={submitting}>
                      {submitting ? "Sending…" : "Send reset link"}
                    </button>
                    <p className="entry-alt">
                      <Link to="/login">Back to sign in</Link>
                    </p>
                  </form>
                ) : null}

                {hasToken && tokenState === "checking" ? (
                  <p className="entry-lead" role="status">Checking this reset link.</p>
                ) : null}

                {hasToken && tokenState === "invalid" ? (
                  <p className="entry-alt">
                    <Link to="/reset-password">Request a new link</Link>
                  </p>
                ) : null}

                {hasToken && tokenState === "ready" && done ? (
                  <div role="status">
                    <p className="entry-lead">Password has been reset. You can now sign in.</p>
                    <p className="entry-alt">
                      <Link to="/login">Sign in</Link>
                    </p>
                  </div>
                ) : null}

                {hasToken && tokenState === "ready" && !done ? (
                  <form className="entry-form" onSubmit={(event) => { void submitNewPassword(event) }} noValidate>
                    <div className="entry-field">
                      <label htmlFor="reset-password">NEW PASSWORD</label>
                      <input
                        id="reset-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
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
                        onChange={(event) => setConfirm(event.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <button className="entry-submit" type="submit" disabled={submitting}>
                      {submitting ? "Saving…" : "Save password"}
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
          <p className="entry-note">
            Read the <Link to="/terms">Terms &amp; Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
