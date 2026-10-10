/**
 * The terms-acceptance control used by every join flow: sign-up, enrolment and enquiries.
 * It is a real required checkbox; callers refuse to submit until it is ticked, then send
 * consentPayload() (src/lib/policy.ts). The server checks it again and records the acceptance
 * (server/src/lib/policy.ts, PolicyAcceptance), so a request without it is refused there too.
 */
import { useId } from "react"
import { Link } from "react-router-dom"
import "./TermsConsent.css"

export function TermsConsent({
  checked,
  onChange,
  variant = "light",
  action = "continuing",
  showError = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: "light" | "dark"
  /** Completes the sentence "By … you agree". */
  action?: string
  showError?: boolean
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={`tc tc--${variant}`}>
      <label className="tc__row" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className="tc__box"
          checked={checked}
          required
          aria-required="true"
          aria-invalid={showError && !checked ? true : undefined}
          aria-describedby={showError && !checked ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="tc__text">
          I agree to the{" "}
          <Link to="/terms" target="_blank" rel="noopener">Terms &amp; Conditions</Link> and{" "}
          <Link to="/privacy" target="_blank" rel="noopener">Privacy Policy</Link>
          <span className="tc__sr"> before {action}</span>.
        </span>
      </label>
      {showError && !checked ? (
        <p id={errorId} className="tc__error" role="alert">
          Please accept the Terms &amp; Conditions and Privacy Policy to continue.
        </p>
      ) : null}
    </div>
  )
}
