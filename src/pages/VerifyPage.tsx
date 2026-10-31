/**
 * Public certificate check (/verify and /verify/:code).
 * Shows the visual Skylent Verified Diploma card alongside the cryptographic verification record.
 */
import { useEffect, useId, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { TruthChip } from "../components/skylent/primitives"
import { CERTIFICATE_CODE_PATTERN, verifyCertificate } from "../lib/skylent-api"
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

function VisualDiplomaPreview({
  learnerName,
  courseTitle,
  code,
  issuedAt,
  score,
  evidenceSummary,
  isSample = false,
}: {
  learnerName: string
  courseTitle: string
  code: string
  issuedAt: string
  score?: string
  evidenceSummary?: string
  isSample?: boolean
}) {
  return (
    <div className="vfy-diploma" aria-label="Visual Certificate Preview">
      <div className="vfy-diploma__frame">
        <div className="vfy-diploma__top">
          <div>
            <span className="vfy-diploma__brand">SKYLENT GLOBAL PVT. LTD.</span>
            <span className="vfy-diploma__sub">Execution &amp; Proof-of-Work Credential</span>
          </div>
          <span className="vfy-diploma__seal">
            {isSample ? "SAMPLE PREVIEW" : "✓ CRYPTOGRAPHICALLY VERIFIED"}
          </span>
        </div>
        <div className="vfy-diploma__body">
          <p className="vfy-diploma__certifies">This certifies that</p>
          <h3 className="vfy-diploma__name">{learnerName}</h3>
          <p className="vfy-diploma__completed">
            has completed all modules, browser lab evaluations, and the graded capstone defense for
          </p>
          <p className="vfy-diploma__course">{courseTitle}</p>
          {evidenceSummary ? (
            <p className="vfy-diploma__evidence">
              <strong>Verified Capstone Artifact:</strong> {evidenceSummary}
            </p>
          ) : null}
        </div>
        <div className="vfy-diploma__foot">
          <div>
            <span className="vfy-diploma__meta-k">Credential ID</span>
            <strong className="vfy-diploma__meta-v sky-mono">{code}</strong>
          </div>
          <div>
            <span className="vfy-diploma__meta-k">Evaluation Standing</span>
            <strong className="vfy-diploma__meta-v">{score ?? "Rubric Passed (100% Modules)"}</strong>
          </div>
          <div>
            <span className="vfy-diploma__meta-k">Issued</span>
            <strong className="vfy-diploma__meta-v">{issuedAt}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  const { code: routeCode } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const inputId = useId()
  const [value, setValue] = useState(routeCode ? normalise(routeCode) : "")
  const [check, setCheck] = useState<Check>({ kind: "idle" })
  const [attempt, setAttempt] = useState(0)
  const [copied, setCopied] = useState(false)

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
              <span className="sky-label">Certificates &amp; Proof-of-Work Dossiers</span>
              <TruthChip state="live" label="Public Verification" />
            </div>
            <h1>Verify a Skylent Certificate &amp; Capstone Dossier</h1>
            <p className="vfy-lead">
              Enter any certificate ID printed on a Skylent diploma, or click an exemplar record below to inspect the visual certificate, graded rubric score, and capstone artifact.
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
              A Skylent certificate confirms that the named learner completed every lesson, quiz check, and capstone project rubric of a course. It is verified against the tamper-evident cryptographic standard.
            </p>

            <section className="vfy-exemplars" aria-labelledby="vfy-exemplars-title">
              <h2 id="vfy-exemplars-title" className="vfy-exemplars__title">
                Exemplar Proof-of-Work Dossiers
              </h2>
              <p className="vfy-exemplars__lead">
                Click any exemplar below to preview the full visual certificate and 95+/100 graded capstone dossier:
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
              <div>
                <VisualDiplomaPreview
                  learnerName="Aarav Sharma"
                  courseTitle="Data Analytics with Gen AI"
                  code="SKL-2026-DA-EXEMPLAR"
                  issuedAt="15 October 2026"
                  score="96/100 · Exemplar Capstone Dossier"
                  evidenceSummary="Northwind Sales & Revenue Leakage Audit: Discovered 14.5% discount leakage in Apparel category across 166 validated order lines with SQL aggregation."
                  isSample
                />
                <div className="sky-empty vfy-state" style={{ marginTop: 14 }}>
                  <strong>Sample Diploma Preview Shown Above.</strong>
                  Enter a certificate ID on the left or click any Exemplar Dossier button to run a live cryptographic verification.
                </div>
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
              <div>
                <VisualDiplomaPreview
                  learnerName={check.record.learnerName}
                  courseTitle={check.record.courseTitle}
                  code={check.record.code}
                  issuedAt={formatIssued(check.record.issuedAt)}
                  score={check.record.score}
                  evidenceSummary={check.record.evidenceSummary}
                />
                <section className="sky-panel-proof vfy-record" aria-labelledby="vfy-record-title" style={{ marginTop: 16 }}>
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
              </div>
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
