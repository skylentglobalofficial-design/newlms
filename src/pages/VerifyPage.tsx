/**
 * Public certificate check (/verify and /verify/:code).
 * Shows exactly what GET /certificates/verify/:code returns (ID, learner name, course, issue date) and nothing more.
 * A code in the URL is checked on load, so a link to a certificate can be shared.
 */
import { useEffect, useId, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { JourneyLocator, TruthChip } from "../components/skylent/primitives"
import { CERTIFICATE_CODE_PATTERN, verifyCertificate } from "../lib/skylent-api"
import { truthOf } from "../lib/truth"
import "./VerifyPage.css"

type ValidRecord = { code: string; learnerName: string; courseTitle: string; issuedAt: string }

type Check =
  | { kind: "idle" }
  | { kind: "checking"; code: string }
  | { kind: "valid"; record: ValidRecord }
  | { kind: "notfound"; code: string }
  | { kind: "malformed"; code: string }
  | { kind: "failed"; code: string }

const EXAMPLE = "SKL-2026-DA-1A2B3C"
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })

function normalise(value: string): string {
  return value.trim().toUpperCase()
}

function formatIssued(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

export default function VerifyPage() {
  const { code: routeCode } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const inputId = useId()
  const [value, setValue] = useState(routeCode ? normalise(routeCode) : "")
  const [check, setCheck] = useState<Check>({ kind: "idle" })
  const [attempt, setAttempt] = useState(0)

  // Run the check whenever the code in the URL changes, or the same code is submitted again.
  useEffect(() => {
    if (!routeCode) {
      setCheck({ kind: "idle" })
      return
    }
    const code = normalise(routeCode)
    setValue(code)
    if (!CERTIFICATE_CODE_PATTERN.test(code)) {
      setCheck({ kind: "malformed", code })
      return
    }
    const controller = new AbortController()
    setCheck({ kind: "checking", code })
    verifyCertificate(code, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return
        setCheck(result.valid ? { kind: "valid", record: result } : { kind: "notfound", code })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        const malformed = error instanceof Error && /does not look like/i.test(error.message)
        setCheck(malformed ? { kind: "malformed", code } : { kind: "failed", code })
      },
    )
    return () => controller.abort()
  }, [routeCode, attempt])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const code = normalise(value)
    if (!CERTIFICATE_CODE_PATTERN.test(code)) {
      setCheck({ kind: "malformed", code })
      return
    }
    if (routeCode && normalise(routeCode) === code) setAttempt((n) => n + 1)
    else navigate(`/verify/${encodeURIComponent(code)}`)
  }

  const checking = check.kind === "checking"
  const invalid = check.kind === "malformed"

  return (
    <PageShell aurora={false}>
      <div className="site-light vfy">
        <JourneyLocator current="Prove" />
        <div className="sky-container vfy-wrap">
          <div className="vfy-intro">
            <div className="vfy-kicker">
              <span className="sky-label">Certificates</span>
              <TruthChip state={truthOf("certificates")} />
            </div>
            <h1>Check a Skylent certificate</h1>
            <p className="vfy-lead">
              Enter the certificate ID printed on the certificate. The check returns the learner name, the course and the issue date held
              by Skylent.
            </p>

            <form className="vfy-form" onSubmit={onSubmit} noValidate>
              <label className="sky-label" htmlFor={inputId}>
                Certificate ID
              </label>
              <div className="vfy-form__row">
                <input
                  id={inputId}
                  className="sk-input vfy-input"
                  name="code"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={EXAMPLE}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={40}
                  aria-invalid={invalid || undefined}
                  aria-describedby={`${inputId}-help`}
                />
                <button type="submit" className="sk-btn sk-btn-primary" disabled={checking || value.trim() === ""}>
                  {checking ? "Checking" : "Check certificate"}
                </button>
              </div>
              <p className="sk-help" id={`${inputId}-help`}>
                Format: <span className="sky-mono">{EXAMPLE}</span>
              </p>
            </form>

            <p className="vfy-what">
              A Skylent certificate confirms that the named learner completed every lesson of a course. It is not project evidence and it
              is not an employment outcome.
            </p>
          </div>

          <div className="vfy-result" aria-live="polite" aria-busy={checking}>
            {checking ? <div className="vfy-progress" aria-hidden="true" /> : null}

            {check.kind === "idle" ? (
              <div className="sky-empty vfy-state">
                <strong>No certificate checked yet.</strong>
                The result appears here after you enter an ID.
              </div>
            ) : null}

            {check.kind === "checking" ? (
              <div className="vfy-state vfy-state--plain">
                <div className="sky-label">Checking {check.code}</div>
                <div className="vfy-skeleton" aria-hidden="true">
                  <span className="sky-skeleton" style={{ width: "70%" }} />
                  <span className="sky-skeleton" style={{ width: "52%" }} />
                  <span className="sky-skeleton" style={{ width: "60%" }} />
                </div>
              </div>
            ) : null}

            {check.kind === "valid" ? (
              <section className="sky-panel-proof vfy-record" aria-labelledby="vfy-record-title">
                <div className="vfy-record__head">
                  <h2 id="vfy-record-title">Valid certificate</h2>
                  <span className="sky-label">Record held by Skylent</span>
                </div>
                <dl className="sky-spec">
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Certificate ID</dt>
                    <dd className="sky-spec__value sky-mono">{check.record.code}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Learner name</dt>
                    <dd className="sky-spec__value">{check.record.learnerName}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Course</dt>
                    <dd className="sky-spec__value">{check.record.courseTitle}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Issue date</dt>
                    <dd className="sky-spec__value">{formatIssued(check.record.issuedAt)}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            {check.kind === "notfound" ? (
              <div className="sky-empty vfy-state" role="status">
                <strong>No valid certificate has this ID.</strong>
                It may have been mistyped or revoked.
                <div className="sky-mono vfy-state__code">{check.code}</div>
              </div>
            ) : null}

            {check.kind === "malformed" ? (
              <div className="sky-empty vfy-state" role="alert">
                <strong>That does not look like a Skylent certificate ID.</strong>
                An ID has four parts separated by hyphens, for example <span className="sky-mono">{EXAMPLE}</span>.
              </div>
            ) : null}

            {check.kind === "failed" ? (
              <div className="sky-empty vfy-state" role="alert">
                <strong className="sky-error">The check could not be completed. Try again.</strong>
                Nothing was confirmed or rejected for <span className="sky-mono">{check.code}</span>.
                <div>
                  <button type="button" className="sk-btn sk-btn-secondary vfy-retry" onClick={() => setAttempt((n) => n + 1)}>
                    Try again
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
