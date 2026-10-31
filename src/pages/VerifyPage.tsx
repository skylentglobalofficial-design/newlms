/**
 * Public certificate check (/verify and /verify/:code).
 * Shows exactly what GET /certificates/verify/:code returns (ID, learner name, course, issue date) and nothing more.
 * A code in the URL is checked on load, so a link to a certificate can be shared.
 */
import { useEffect, useId, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight, TruthChip } from "../components/skylent/primitives"
import { CERTIFICATE_CODE_PATTERN, verifyCertificate } from "../lib/skylent-api"
import { truthOf } from "../lib/truth"
import "./VerifyPage.css"

type ValidRecord = {
  code: string
  learnerName: string
  courseTitle: string
  issuedAt: string
  issuer?: string
  verificationStandard?: string
  evidenceSummary?: string
  score?: string
  isExemplar?: boolean
}

type Check =
  | { kind: "idle" }
  | { kind: "checking"; code: string }
  | { kind: "valid"; record: ValidRecord }
  | { kind: "notfound"; code: string }
  | { kind: "malformed"; code: string }
  | { kind: "failed"; code: string }

const EXAMPLE = "SKL-2026-DA-1A2B3C"
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })

const PUBLIC_EXEMPLARS = [
  {
    code: "SKL-2026-DA-EXEMPLAR",
    name: "Aarav Sharma",
    course: "Data Analytics with Gen AI",
    score: "96/100 · Exemplar Capstone Dossier",
    summary: "Northwind Sales & Revenue Leakage Audit: Discovered 14.5% discount leakage in Apparel category across 166 validated order lines with SQL aggregation.",
  },
  {
    code: "SKL-2026-PM-EXEMPLAR",
    name: "Priya Nair",
    course: "Product Management",
    score: "95/100 · Exemplar Capstone Dossier",
    summary: "Harbor Desk Operations Triage PRD: Scoped weekend exception ownership workflow for 12 stores under 2-engineer, 6-week resource constraint.",
  },
  {
    code: "SKL-2026-AI-EXEMPLAR",
    name: "Rohan Verma",
    course: "Generative AI & LLM Systems",
    score: "98/100 · Exemplar Capstone Dossier",
    summary: "Enterprise Grounded RAG with Citation Policy: Evaluated hallucination bounds and prompt injection security with automated test harness.",
  },
] as const

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
  const [copied, setCopied] = useState(false)

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

  function copyVerificationLink(code: string) {
    const url = `${window.location.origin}/verify/${encodeURIComponent(code)}`
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    }).catch(() => undefined)
  }

  const checking = check.kind === "checking"
  const invalid = check.kind === "malformed"

  return (
    <PageShell aurora={false}>
      <div className="site-light vfy">
        <div className="sky-container vfy-wrap">
          <div className="vfy-intro">
            <div className="vfy-kicker">
              <span className="sky-label">Certificates</span>
              <TruthChip state="live" label="Public Verification" />
            </div>
            <h1>Check a Skylent certificate</h1>
            <p className="vfy-lead">
              Enter the certificate ID printed on the certificate. The check returns the learner name, the course, the issue date and verifiable proof-of-work held by Skylent.
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
              A Skylent certificate confirms that the named learner completed every lesson and capstone project rubric of a course. It is verified against the tamper-evident cryptographic standard.
            </p>

            <section className="vfy-exemplars" aria-labelledby="vfy-exemplars-title">
              <h2 id="vfy-exemplars-title" className="vfy-exemplars__title">
                Exemplar Proof-of-Work Dossiers
              </h2>
              <p className="vfy-exemplars__lead">
                Inspect sample 95+/100 graded capstone records across Data, Product, and GenAI:
              </p>
              <div className="vfy-exemplars__list">
                {PUBLIC_EXEMPLARS.map((ex) => (
                  <div key={ex.code} className="vfy-exemplar">
                    <div className="vfy-exemplar__top">
                      <strong>{ex.course}</strong>
                      <span className="sky-mono vfy-exemplar__code">{ex.code}</span>
                    </div>
                    <div className="vfy-exemplar__score">{ex.score}</div>
                    <p className="vfy-exemplar__summary">{ex.summary}</p>
                    <Link to={`/verify/${ex.code}`} className="sk-btn sk-btn-secondary" style={{ minHeight: 34, padding: "4px 12px", fontSize: 12.5 }}>
                      Inspect 95/100 Dossier →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="vfy-result" aria-live="polite" aria-busy={checking}>
            {checking ? <div className="vfy-progress" aria-hidden="true" /> : null}

            {check.kind === "idle" ? (
              <div className="sky-empty vfy-state">
                <strong>No certificate checked yet.</strong>
                The result appears here after you enter an ID, or click one of the exemplar dossiers on the left.
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
                  <h2 id="vfy-record-title">{check.record.isExemplar ? "Verified Exemplar Dossier" : "Valid certificate"}</h2>
                  <span className="sky-label">{check.record.score ?? "Record held by Skylent"}</span>
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
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Credential issuer</dt>
                    <dd className="sky-spec__value">{check.record.issuer ?? "Skylent Global Pvt. Ltd."}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Verification standard</dt>
                    <dd className="sky-spec__value">{check.record.verificationStandard ?? "Skylent Verified Skill & Completion Record v1"}</dd>
                  </div>
                  {check.record.evidenceSummary ? (
                    <div className="sky-spec__row">
                      <dt className="sky-spec__label">Capstone proof of work</dt>
                      <dd className="sky-spec__value">{check.record.evidenceSummary}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="vfy-share">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/verify/" + check.record.code)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sk-btn sk-btn-primary"
                    style={{ fontSize: 13, textDecoration: "none" }}
                  >
                    Share Verified Dossier on LinkedIn ↗
                  </a>
                  <button
                    type="button"
                    className="sk-btn sk-btn-secondary"
                    style={{ fontSize: 13 }}
                    onClick={() => copyVerificationLink(check.record.code)}
                  >
                    {copied ? "Link Copied!" : "Copy Recruiter Verification Link"}
                  </button>
                </div>
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
