import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiV1 } from "../lib/api-base"
import { ensureCsrfToken } from "../lib/auth-api"
import { roleRoute } from "../lib/auth-routing"

export default function ChangePasswordPage() {
  const { user, ready, markPasswordChanged } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const token = await ensureCsrfToken()
      const response = await fetch(`${apiV1()}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const body = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(body.error || "The password could not be changed")
      markPasswordChanged()
      navigate(user ? roleRoute(user.role) : "/login", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "The password could not be changed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) return null
  if (!user) return null

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: 24 }}>
      <h1>Change your password</h1>
      <p>This account must set a new password before the rest of Skylent opens.</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Current password
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        <label>
          New password
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={12} required />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save password"}</button>
      </form>
    </main>
  )
}
