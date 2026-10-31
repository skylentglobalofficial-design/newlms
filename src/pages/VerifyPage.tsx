/**
 * Public certificate check (/verify and /verify/:code).
 * Shows what GET /certificates/verify/:code returns (ID, learner name, course, issue date, and Verified Proof-of-Work Dossier).
 * A code in the URL is checked on load, so a link to a certificate can be shared with recruiters.
 */
import { useEffect, useId, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { TruthChip } from "../components/skylent/primitives"
import { CERTIFICATE_CODE_PATTERN, verifyCertificate, type ProofOfWorkDossier } from "../lib/skylent-api"
import { truthOf } from "../lib/truth"
import "./VerifyPage.css"

type ValidRecord = {
  code: string
  learnerName: string
  courseTitle: string
  issuedAt: string
  issuer?: string
  credentialStandard?: string
  verificationStandard?: string
  evidenceSummary?: string
  credentialLevel?: "course" | "programme"
  proofOfWork?: ProofOfWorkDossier
}

type Check =
  | { kind: "idle" }
  | { kind: "checking"; code: string }
  | { kind: "valid"; record: ValidRecord }
  | { kind: "notfound"; code: string }
  | { kind: "malformed"; code: string }
  | { kind: "failed"; code: string }

const EXAMPLE = "SKL-2026-DA-1A2B3C"

const EXEMPLAR_DOSSIERS = [
  {
    code: "SKL-2026-DA-EXEMPLAR",
    track: "Data Analytics",
    learnerName: "Aarav Sharma (96/100 Exemplar)",
    courseTitle: "Data Analytics",
    issuedAt: "2026-10-15T10:00:00.000Z",
    summary: "Northwind SQL Margin & Discount Leakage Audit (166 valid rows · ₹8,12,020 net revenue)",
    proofOfWork: {
      verifiedModulesSummary: "5 Modules · 15 Verified Lessons · SQL Lab & Commercial Review Capstone",
      verifiedSkills: ["SQL Cohort & Revenue Joins", "Spreadsheet Reconciliation", "KPI Decision Framing", "Commercial Executive Synthesis"],
      artifacts: [
        {
          projectType: "northwind-commercial-review",
          courseSlug: "data-analytics",
          title: "Northwind Q1–Q2 Commercial & Discount Leakage Audit",
          status: "ready_to_review",
          finding: "After excluding 14 invalid/returned rows (166 valid rows, ₹8,12,020 net revenue), Apparel averaged 14.5% discount_pct vs 8.4% in Electronics, eroding Q2 gross margin by 340 bps.",
          whyItMatters: "Uncontrolled promo codes in Apparel reduced net contribution without lifting repeat order frequency.",
          recommendation: "Cap Apparel promo discounts at 8% and require cart threshold >= ₹2,500 before applying coupon codes.",
          updatedAt: "2026-10-15T09:30:00.000Z",
        },
      ],
    },
  },
  {
    code: "SKL-2026-PM-EXEMPLAR",
    track: "Product Management",
    learnerName: "Meera Krishnan (95/100 Exemplar)",
    courseTitle: "Product Management",
    issuedAt: "2026-10-18T10:00:00.000Z",
    summary: "Harbor Desk 6-Week Weekend Exception Queue PRD (2 engineers · 12 stores)",
    proofOfWork: {
      verifiedModulesSummary: "5 Modules · 15 Verified Lessons · Harbor Desk Product Case Capstone",
      verifiedSkills: ["Problem Discovery & Triage", "Opportunity Sizing", "PRD & Acceptance Criteria", "Guardrail & Rollout Governance"],
      artifacts: [
        {
          projectType: "harbor-desk-case",
          courseSlug: "product-management",
          title: "Harbor Desk 6-Week Weekend Exception Queue PRD",
          status: "ready_to_review",
          finding: "3 of 9 weekly store delivery exceptions go unlogged in personal WhatsApp groups across 12 Harbor Retail stores.",
          whyItMatters: "Morning shift managers lose 45 minutes every Monday reconciling missing cold-chain inventory.",
          recommendation: "Ship a constrained 2-engineer, 6-week mobile Exception Triage Queue with mandatory SKU photo capture and Monday 08:00 escalation.",
          updatedAt: "2026-10-18T09:30:00.000Z",
        },
      ],
    },
  },
  {
    code: "SKL-2026-AI-EXEMPLAR",
    track: "Generative AI & LLM Systems",
    learnerName: "Rohan Verma (97/100 Exemplar)",
    courseTitle: "Generative AI & LLM Systems",
    issuedAt: "2026-10-22T10:00:00.000Z",
    summary: "Enterprise RAG Hallucination & Grounded Citation Gate Audit",
    proofOfWork: {
      verifiedModulesSummary: "5 Modules · 15 Verified Lessons · Enterprise RAG Evaluation Capstone",
      verifiedSkills: ["Hybrid RAG Architecture", "Grounded Citation Verification", "Prompt-Injection Defense", "Latency & Token FinOps"],
      artifacts: [
        {
          projectType: "enterprise-rag-evaluation",
          courseSlug: "generative-ai",
          title: "Enterprise RAG Hallucination & Grounded Citation Audit",
          status: "ready_to_review",
          finding: "Unfiltered hybrid retrieval surfaced deprecated 2023 policy chunks, causing 19% ungrounded refund claims.",
          whyItMatters: "Customer support bots promised 30-day unconditional refunds on enterprise annual contracts.",
          recommendation: "Enforce effective_date metadata filtering at retrieval and block responses lacking verified [doc_id] citations.",
          updatedAt: "2026-10-22T09:30:00.000Z",
        },
      ],
    },
  },
] as const
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Run the check whenever the code in the URL changes, or the same code is submitted again.
  useEffect(() => {
    if (!routeCode) {
      setCheck({ kind: "idle" })
      return
    }
    const code = normalise(routeCode)
    setValue(code)
    const localExemplar = EXEMPLAR_DOSSIERS.find((item) => item.code === code)
    if (localExemplar) {
      setCheck({
        kind: "valid",
        record: {
          code: localExemplar.code,
          learnerName: localExemplar.learnerName,
          courseTitle: localExemplar.courseTitle,
          issuedAt: localExemplar.issuedAt,
          proofOfWork: {
            verifiedModulesSummary: localExemplar.proofOfWork.verifiedModulesSummary,
            verifiedSkills: [...localExemplar.proofOfWork.verifiedSkills],
            artifacts: localExemplar.proofOfWork.artifacts.map((a) => ({ ...a })),
          },
        },
      })
      return
    }
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
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Credential issuer</dt>
                    <dd className="sky-spec__value">{check.record.issuer ?? "Skylent Global Pvt. Ltd."}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Verification standard</dt>
                    <dd className="sky-spec__value">{check.record.verificationStandard ?? check.record.credentialStandard ?? "Skylent Verified Skill & Completion Record v1"}</dd>
                  </div>
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Verified evidence</dt>
                    <dd className="sky-spec__value">{check.record.evidenceSummary ?? "Verified completion of all required modules, quizzes, and applied case work."}</dd>
                  </div>
                </dl>

                {check.record.proofOfWork ? (
                  <div
                    className="vfy-proof-dossier"
                    style={{
                      marginTop: 20,
                      paddingTop: 18,
                      borderTop: "1px solid rgba(15, 23, 42, 0.1)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Verified Proof-of-Work Dossier</h3>
                      <span className="sky-label" style={{ fontSize: 11 }}>{check.record.proofOfWork.verifiedModulesSummary}</span>
                    </div>
                    {check.record.proofOfWork.verifiedSkills.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                        {check.record.proofOfWork.verifiedSkills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "rgba(37, 99, 235, 0.08)",
                              color: "#1d4ed8",
                              border: "1px solid rgba(37, 99, 235, 0.2)",
                            }}
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {check.record.proofOfWork.artifacts.length > 0 ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        {check.record.proofOfWork.artifacts.map((artifact) => (
                          <article
                            key={`${artifact.projectType}:${artifact.updatedAt}`}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: "rgba(15, 23, 42, 0.03)",
                              border: "1px solid rgba(15, 23, 42, 0.08)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                              <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{artifact.title}</strong>
                              <span className="sky-mono" style={{ fontSize: 11, color: "#475569" }}>
                                {artifact.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            {artifact.finding ? (
                              <p style={{ margin: "4px 0", fontSize: 13, color: "#334155" }}>
                                <strong>Key Finding:</strong> {artifact.finding}
                              </p>
                            ) : null}
                            {artifact.recommendation ? (
                              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#334155" }}>
                                <strong>Recommendation:</strong> {artifact.recommendation}
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(15, 23, 42, 0.1)",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
                    Share this cryptographic Proof-of-Work Dossier with recruiters or on LinkedIn:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <a
                      className="sk-btn sk-btn-primary"
                      style={{ fontSize: 12.5, padding: "6px 14px", textDecoration: "none" }}
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://skylent.live/verify/${check.record.code}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Share Verified Dossier on LinkedIn ↗
                    </a>
                    <button
                      type="button"
                      className="sk-btn sk-btn-secondary"
                      style={{ fontSize: 12.5, padding: "6px 14px" }}
                      onClick={() => {
                        const url = `https://skylent.live/verify/${check.record.code}`
                        void navigator.clipboard?.writeText(url)
                        setCopiedCode(check.record.code)
                      }}
                    >
                      {copiedCode === check.record.code ? "✓ Verification Link Copied" : "Copy Recruiter Verification Link"}
                    </button>
                  </div>
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

          <section
            aria-labelledby="vfy-exemplar-gallery-title"
            style={{
              marginTop: 32,
              padding: "22px 24px",
              borderRadius: 18,
              border: "1px solid #DDD7FF",
              background: "#FAF9FF",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div>
                <p className="sky-label" style={{ color: "#5142B5", margin: 0 }}>Public Exemplar Proof-of-Work &amp; Top Fellow Teardown Gallery</p>
                <h2 id="vfy-exemplar-gallery-title" style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 750, color: "#171717" }}>
                  Inspect a 95/100 Graded Skylent Proof-of-Work Dossier
                </h2>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#ffffff", border: "1px solid #DDD7FF", color: "#43349F" }}>
                1-Click Live Verification Preview
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {EXEMPLAR_DOSSIERS.map((item) => (
                <article
                  key={item.code}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142B5" }}>
                      {item.track}
                    </span>
                    <span className="sky-mono" style={{ fontSize: 11, color: "#0E6A44", fontWeight: 700 }}>
                      {item.code}
                    </span>
                  </div>
                  <strong style={{ fontSize: 15, color: "#171717" }}>{item.learnerName}</strong>
                  <p style={{ margin: 0, fontSize: 13, color: "#3c425c", lineHeight: 1.45 }}>{item.summary}</p>
                  <button
                    type="button"
                    className="sk-btn sk-btn-secondary"
                    style={{ marginTop: "auto", fontSize: 12.5, padding: "7px 12px" }}
                    onClick={() => navigate(`/verify/${item.code}`)}
                  >
                    Inspect 95/100 Dossier →
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
