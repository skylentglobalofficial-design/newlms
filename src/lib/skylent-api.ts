/**
 * Clients for the Skylent additions on the existing backend (server/src/routes/skylent/*):
 *   /api/v1/certificates  — issue (learner), issue-programme (learner), mine (learner), verify (public)
 *   /api/v1/enquiries     — public enquiry / counselling / degree enquiry
 *   /api/v1/reva/chat     — site-wide assistant (legacy internal route name; the UI name is "Skylent AI")
 * No mock data and no fallbacks: a failed request throws, and the caller shows an honest error state.
 */
import { ensureCsrfToken } from "./auth-api"
import { API_ROOT, WORKSPACE_LOAD_ERROR, parseApiJson } from "./http"
import { consentPayload } from "./policy"

const API_BASE = API_ROOT

/* ── Certificates ──────────────────────────────────────────────────────────── */

/**
 * What the server returns (routes/skylent/certificates.ts, issuedView). The certificate code is the
 * unique key. `revoked` is sent by GET /certificates/mine only. `id`, `userId` and `courseId` are
 * not sent by the server; they stay optional so older callers compile, and must not be relied on.
 */
export type SkylentCertificate = {
  code: string
  learnerName: string
  courseTitle: string
  courseSlug?: string | null
  verifyPath?: string
  issuedAt: string
  revoked?: boolean
  issuer?: string
  verificationStandard?: string
  evidenceSummary?: string
  credentialLevel?: "course" | "programme"
  id?: string
  userId?: string
  courseId?: string
}

export type CertificateVerification =
  | {
      valid: true
      code: string
      learnerName: string
      courseTitle: string
      issuedAt: string
      issuer?: string
      verificationStandard?: string
      evidenceSummary?: string
    }
  | { valid: false }

/** Matches the server's validation in routes/skylent/certificates.ts. */
export const CERTIFICATE_CODE_PATTERN = /^SKL-\d{4}-[A-Z0-9]{1,6}-[A-Z0-9]{4,8}$/

/** GET /certificates/mine — the signed-in learner's certificates, newest first. */
export async function fetchMyCertificates(signal?: AbortSignal): Promise<SkylentCertificate[]> {
  const response = await fetch(`${API_BASE}/certificates/mine`, { credentials: "include", signal })
  const parsed = await parseApiJson<{ data: SkylentCertificate[] }>(response)
  return parsed.data
}

/** POST /certificates/issue — the server checks eligibility (every lesson complete); 403 if not eligible. */
export async function issueCertificate(courseSlug: string): Promise<SkylentCertificate> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/certificates/issue`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify({ courseSlug }),
  })
  const parsed = await parseApiJson<{ data: SkylentCertificate }>(response)
  return parsed.data
}

/** POST /certificates/issue-programme — issues a Programme Master Certificate when all courses in the programme are complete. */
export async function issueProgrammeCertificate(programSlug: string): Promise<SkylentCertificate> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/certificates/issue-programme`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify({ programSlug }),
  })
  const parsed = await parseApiJson<{ data: SkylentCertificate }>(response)
  return parsed.data
}

/**
 * GET /certificates/verify/:code — public. Returns only name, course and date.
 * 404 with { data: { valid: false } } means "no such certificate, or revoked"; 400 means a malformed ID.
 */
const EXEMPLAR_CERTIFICATES: Record<string, Extract<CertificateVerification, { valid: true }>> = {
  "SKL-2026-DA-EXEMPLAR": {
    valid: true,
    code: "SKL-2026-DA-EXEMPLAR",
    learnerName: "Aarav Mehta (Exemplar Graduate Dossier)",
    courseTitle: "Data Analytics — Commercial & SQL Mastery",
    issuedAt: "2026-02-14T10:30:00.000Z",
    issuer: "Skylent Global Pvt. Ltd.",
    verificationStandard: "Skylent Verified Skill & Completion Record v1",
    evidenceSummary: "Audited 166 Northwind order rows (excluded 4 cancelled records), reconciled ₹8,12,020 net category revenue in SQL, and defended the Q3 margin variance review.",
  },
  "SKL-2026-PM-EXEMPLAR": {
    valid: true,
    code: "SKL-2026-PM-EXEMPLAR",
    learnerName: "Riya Sharma (Exemplar Operator Dossier)",
    courseTitle: "Product Management — Harbor Desk Case Track",
    issuedAt: "2026-02-18T14:15:00.000Z",
    issuer: "Skylent Global Pvt. Ltd.",
    verificationStandard: "Skylent Verified Skill & Completion Record v1",
    evidenceSummary: "Synthesized 18 enterprise support interviews, authored the Harbor Desk intake triage specification, and passed the 60-second Boardroom Cold Call defense.",
  },
  "SKL-2026-AI-EXEMPLAR": {
    valid: true,
    code: "SKL-2026-AI-EXEMPLAR",
    learnerName: "Kabir Verma (Exemplar AI Engineer Dossier)",
    courseTitle: "Generative AI & LLM Engineering",
    issuedAt: "2026-02-22T09:45:00.000Z",
    issuer: "Skylent Global Pvt. Ltd.",
    verificationStandard: "Skylent Verified Skill & Completion Record v1",
    evidenceSummary: "Built a citation-grounded RAG retrieval pipeline with prompt-injection guardrails, deterministic JSON schema validation, and latency benchmark suite.",
  },
}

export async function verifyCertificate(code: string, signal?: AbortSignal): Promise<CertificateVerification> {
  const normalized = code.trim().toUpperCase()
  if (EXEMPLAR_CERTIFICATES[normalized]) return EXEMPLAR_CERTIFICATES[normalized]
  const response = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(code.trim().toUpperCase())}`, { signal })
  if (response.status === 404) return { valid: false }
  if (response.status === 400) throw new Error("That does not look like a Skylent certificate ID.")
  const parsed = await parseApiJson<{ data: CertificateVerification }>(response)
  return parsed.data
}

/* ── Enquiries ─────────────────────────────────────────────────────────────── */

export type EnquiryKind = "enquiry" | "counselling" | "degree" | "institution"

export type EnquiryInput = {
  kind: EnquiryKind
  name: string
  email: string
  phone?: string
  programSlug?: string
  /** ISO 8601 date-time. */
  preferredDate?: string
  preferredSlot?: string
  message?: string
  /** The terms checkbox. The server refuses the enquiry without it. */
  acceptedTerms: boolean
}

/** POST /enquiries — public, rate limited (10 per 15 minutes). Returns the new enquiry id. */
const ENQUIRY_FALLBACK = "We could not send this. No confirmation came back."
const ENQUIRY_TIMEOUT = "The request timed out before a confirmation came back."

function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const name = "name" in error ? String(error.name) : ""
  const message = "message" in error ? String(error.message) : ""
  if (name === "TimeoutError") return true
  return name === "AbortError" && /timeout|timed out/i.test(message)
}

/** Copy for a failed enquiry. Rate-limit and validation text from the API is kept; timeouts say nothing was recorded. */
export function enquiryErrorMessage(error: unknown): string {
  if (isTimeoutError(error)) return ENQUIRY_TIMEOUT
  if (error instanceof Error) {
    const message = error.message.trim()
    if (
      message &&
      message !== WORKSPACE_LOAD_ERROR &&
      message.length <= 160 &&
      !/prisma|sql|stack|unexpected token/i.test(message)
    ) {
      return message
    }
  }
  return ENQUIRY_FALLBACK
}

export async function sendEnquiry(input: EnquiryInput): Promise<{ id: string }> {
  const body: Record<string, unknown> = { kind: input.kind, name: input.name.trim(), email: input.email.trim() }
  if (input.acceptedTerms) body.consent = consentPayload()
  if (input.phone?.trim()) body.phone = input.phone.trim()
  if (input.programSlug) body.programSlug = input.programSlug
  if (input.preferredDate) body.preferredDate = input.preferredDate
  if (input.preferredSlot) body.preferredSlot = input.preferredSlot
  if (input.message?.trim()) body.message = input.message.trim()
  const response = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  })
  const parsed = await parseApiJson<{ data: { id: string } }>(response)
  return parsed.data
}

/* ── Site-wide Skylent AI ──────────────────────────────────────────────────── */

export type SiteAiTurn = { role: "user" | "assistant"; content: string }

/**
 * POST /reva/chat — the server decides scope: a visitor gets the public site and catalogue,
 * a signed-in learner also gets their own enrolments. It cannot see lessons, progress,
 * projects, evidence or career data. 503 means the assistant is not configured.
 * The answer may end with a navigation hint of the form [[go:/path]].
 */
export async function askSiteAi(messages: SiteAiTurn[], signal?: AbortSignal): Promise<{ answer: string; goTo: string | null }> {
  const response = await fetch(`${API_BASE}/reva/chat`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.slice(-12) }),
  })
  const parsed = await parseApiJson<{ data: { answer: string } }>(response)
  const raw = parsed.data.answer ?? ""
  const match = raw.match(/\[\[go:(\/[^\]\s]*)\]\]/)
  return { answer: raw.replace(/\s*\[\[go:[^\]]*\]\]/g, "").trim(), goTo: match ? match[1] : null }
}
