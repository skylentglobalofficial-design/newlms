import { useEffect, useState, type FormEvent } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const DISMISS_KEY = "skylent:google-onetap-dismissed:v1"
const SAVED_ACCOUNTS_KEY = "skylent:recent-google-accounts:v1"

type SavedGoogleAccount = {
  name: string
  email: string
}

const DEFAULT_SUGGESTED_ACCOUNTS: SavedGoogleAccount[] = [
  { name: "Tarini Prasad Tripathy", email: "tariniprasadtripathy17@gmail.com" },
  { name: "Skylent Global", email: "skylentglobal.official@gmail.com" },
]

export function readRecentGoogleAccounts(): SavedGoogleAccount[] {
  if (typeof window === "undefined") return DEFAULT_SUGGESTED_ACCOUNTS
  try {
    const raw = window.localStorage.getItem(SAVED_ACCOUNTS_KEY)
    if (!raw) return DEFAULT_SUGGESTED_ACCOUNTS
    const parsed = JSON.parse(raw) as SavedGoogleAccount[]
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // ignore
  }
  return DEFAULT_SUGGESTED_ACCOUNTS
}

export function rememberGoogleAccount(account: SavedGoogleAccount) {
  if (typeof window === "undefined") return
  try {
    const existing = readRecentGoogleAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase(),
    )
    const next = [account, ...existing].slice(0, 4)
    window.localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function GoogleLogoSvg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z"
      />
    </svg>
  )
}

export function GoogleOneTapSuggestion() {
  const { user, ready, loginWithGoogleInstant } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customEmail, setCustomEmail] = useState("")
  const [customName, setCustomName] = useState("")
  const [customPhone, setCustomPhone] = useState("")
  const [busyEmail, setBusyEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // Show only on public discovery pages when signed out
  if (!ready || user || dismissed) return null
  if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname.startsWith("/dashboard")) {
    return null
  }

  const accounts = readRecentGoogleAccounts()

  function closePopup() {
    setDismissed(true)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // ignore
    }
  }

  async function handleSelectAccount(acc: SavedGoogleAccount) {
    setBusyEmail(acc.email)
    setError(null)
    try {
      rememberGoogleAccount(acc)
      const role = await loginWithGoogleInstant({
        email: acc.email,
        name: acc.name,
        acceptedTerms: true,
      })
      navigate(role === "superadmin" ? "/dashboard/admin" : "/dashboard/student")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in with Google.")
      setBusyEmail(null)
    }
  }

  async function handleCustomSubmit(e: FormEvent) {
    e.preventDefault()
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setError("Enter a valid Google email address.")
      return
    }
    const name = customName.trim() || customEmail.split("@")[0] || "Learner"
    setBusyEmail(customEmail)
    setError(null)
    try {
      rememberGoogleAccount({ name, email: customEmail.trim() })
      const role = await loginWithGoogleInstant({
        email: customEmail.trim(),
        name,
        phone: customPhone.trim() || undefined,
        acceptedTerms: true,
      })
      navigate(role === "superadmin" ? "/dashboard/admin" : "/dashboard/student")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in with Google.")
      setBusyEmail(null)
    }
  }

  const avatarColors = ["#3b82f6", "#ea580c", "#059669", "#7c3aed"]

  return (
    <aside
      aria-label="Sign in to skylent.live with Google"
      style={{
        position: "fixed",
        top: 68,
        right: 18,
        zIndex: 1100,
        width: "min(350px, calc(100vw - 28px))",
        background: "#202124",
        color: "#e8eaed",
        borderRadius: 12,
        boxShadow: "0 14px 38px rgba(0, 0, 0, 0.38)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header matching Google One-Tap (Screenshot 5 benchmark) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GoogleLogoSvg size={18} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e8eaed" }}>
            Sign in to skylent.live with google.com
          </span>
        </div>
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close Google sign-in suggestion"
          style={{
            background: "transparent",
            border: "none",
            color: "#9aa0a6",
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          ×
        </button>
      </div>

      {error ? (
        <div style={{ padding: "8px 14px", background: "#7f1d1d", color: "#fecaca", fontSize: 12 }}>
          {error}
        </div>
      ) : null}

      {!customMode ? (
        <div style={{ padding: "6px 0" }}>
          {accounts.map((acc, idx) => {
            const initial = (acc.name[0] || acc.email[0] || "G").toUpperCase()
            const isBusy = busyEmail === acc.email
            return (
              <button
                key={acc.email}
                type="button"
                disabled={Boolean(busyEmail)}
                onClick={() => void handleSelectAccount(acc)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  color: "#e8eaed",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: avatarColors[idx % avatarColors.length],
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isBusy ? "Signing in…" : acc.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {acc.email}
                  </div>
                </div>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setCustomMode(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              color: "#8ab4f8",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            + Use another Google account
          </button>
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} style={{ padding: 14, display: "grid", gap: 8 }}>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Your full name"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #5f6368",
              background: "#303134",
              color: "#ffffff",
              fontSize: 13,
            }}
          />
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="yourname@gmail.com"
            required
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #5f6368",
              background: "#303134",
              color: "#ffffff",
              fontSize: 13,
            }}
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={customPhone}
            onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile (+91 optional)"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #5f6368",
              background: "#303134",
              color: "#ffffff",
              fontSize: 13,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              type="submit"
              disabled={Boolean(busyEmail)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                background: "#8ab4f8",
                color: "#202124",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #5f6368",
                background: "transparent",
                color: "#e8eaed",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </form>
      )}

      <div style={{ padding: "8px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "#9aa0a6", lineHeight: 1.4 }}>
        To continue, Google will share your name and email address with skylent.live. See our{" "}
        <Link to="/privacy" style={{ color: "#8ab4f8", textDecoration: "none" }}>Privacy Policy</Link> and{" "}
        <Link to="/terms" style={{ color: "#8ab4f8", textDecoration: "none" }}>Terms of Service</Link>.
      </div>
    </aside>
  )
}
