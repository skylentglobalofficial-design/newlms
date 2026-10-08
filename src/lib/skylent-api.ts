/**
 * Clients for the Skylent additions on the existing backend (server/src/routes/skylent/*):
 *   /api/v1/certificates  — issue (learner), mine (learner), verify (public)
 *   /api/v1/enquiries     — public enquiry / counselling / degree enquiry
 *   /api/v1/reva/chat     — site-wide assistant (legacy internal route name; the UI name is "Skylent AI")
 * No mock data and no fallbacks: a failed request throws, and the caller shows an honest error state.
 */
import { ensureCsrfToken } from "./auth-api"
import { API_ROOT, parseApiJson } from "./http"

const API_BASE = API_ROOT

/* ── Certificates ──────────────────────────────────────────────────────────── */

export type SkylentCertificate = {
  id: string
  code: string
  userId: string
  courseId: string
  learnerName: string
  courseTitle: string
  issuedAt: string
  revoked: boolean
}

export type CertificateVerification =
  | { valid: true; code: string; learnerName: string; courseTitle: string; issuedAt: string }
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

/**
 * GET /certificates/verify/:code — public. Returns only name, course and date.
 * 404 with { data: { valid: false } } means "no such certificate, or revoked"; 400 means a malformed ID.
 */
export async function verifyCertificate(code: string, signal?: AbortSignal): Promise<CertificateVerification> {
  const response = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(code.trim().toUpperCase())}`, { signal })
  if (response.status === 404) return { valid: false }
  if (response.status === 400) throw new Error("That does not look like a Skylent certificate ID.")
  const parsed = await parseApiJson<{ data: CertificateVerification }>(response)
  return parsed.data
}

/* ── Enquiries ─────────────────────────────────────────────────────────────── */

export type EnquiryKind = "enquiry" | "counselling" | "degree"

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
}

/** POST /enquiries — public, rate limited (10 per 15 minutes). Returns the new enquiry id. */
export async function sendEnquiry(input: EnquiryInput): Promise<{ id: string }> {
  const body: Record<string, string> = { kind: input.kind, name: input.name.trim(), email: input.email.trim() }
  if (input.phone?.trim()) body.phone = input.phone.trim()
  if (input.programSlug) body.programSlug = input.programSlug
  if (input.preferredDate) body.preferredDate = input.preferredDate
  if (input.preferredSlot) body.preferredSlot = input.preferredSlot
  if (input.message?.trim()) body.message = input.message.trim()
  const response = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
