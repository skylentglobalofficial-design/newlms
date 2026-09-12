import { Link, useNavigate } from "react-router-dom"
import "../../design/auth.css"

type AuthPageShellProps = {
  children: React.ReactNode
}

export default function AuthPageShell({ children }: AuthPageShellProps) {
  const navigate = useNavigate()

  return (
    <div className="auth-page sk-auth">
      <a href="#auth-main" className="auth-skip-link">Skip to sign in</a>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="auth-back-link"
      >
        ← Back
      </button>

      <main id="auth-main" className="auth-page-main">
        <div className="auth-page-card">
          <Link to="/" className="auth-brand-link" aria-label="Skylent home">
            <span className="auth-brand">
              Skylent<span aria-hidden style={{ color: "#F97316" }}>.</span>
            </span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="auth-divider" aria-hidden>
      <span className="auth-divider-line" />
      <span className="auth-divider-label">or</span>
      <span className="auth-divider-line" />
    </div>
  )
}

export function AuthError({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="polite" className="auth-error">
      {message}
    </div>
  )
}

export function authFieldClass(focused: boolean, hasError?: boolean): string {
  return [
    "auth-field",
    focused ? "is-focused" : "",
    hasError ? "has-error" : "",
  ].filter(Boolean).join(" ")
}

export function AuthDevDemoAccounts() {
  if (!import.meta.env.DEV) return null

  const accounts = [
    { role: "Learner", email: "learner@demo.skylent.dev" },
    { role: "Mentor", email: "mentor@demo.skylent.dev" },
    { role: "Institution", email: "institution@demo.skylent.dev" },
    { role: "Recruiter", email: "recruiter@demo.skylent.dev" },
    { role: "Admin", email: "admin@demo.skylent.dev" },
  ]

  return (
    <div className="auth-dev-panel">
      <p className="auth-dev-label">Development demo accounts</p>
      <p className="auth-dev-copy">
        Run <code>npm run db:seed</code> to create demo users. Password is set via{" "}
        <code>DEMO_USER_PASSWORD</code> in your environment (see seed script).
      </p>
      <ul className="auth-dev-list">
        {accounts.map((account) => (
          <li key={account.email}>
            <span className="auth-dev-role">{account.role}</span>
            <span className="auth-dev-email">{account.email}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
