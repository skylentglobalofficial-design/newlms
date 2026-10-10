import type { Prisma } from "@prisma/client"
import { z } from "zod"

/**
 * The version of the Terms & Conditions and Privacy Policy published at /terms and /privacy.
 * Keep it equal to POLICY_VERSION in src/lib/policy.ts. Change both when the published text changes:
 * a browser still showing the old text is then refused and asked to reload.
 */
export const CURRENT_POLICY_VERSION = "2026-10-09"

export type PolicyContext = "signup" | "google_signup" | "enrolment" | "enquiry"

export const CONSENT_REQUIRED_MESSAGE = "Accept the Terms & Conditions and Privacy Policy to continue."
export const CONSENT_OUTDATED_MESSAGE = "The terms have been updated. Reload the page and accept the current version."

const consentSchema = z.object({
  accepted: z.literal(true),
  policyVersion: z.string().min(1).max(40),
})

export type ConsentCheck =
  | { ok: true; policyVersion: string }
  | { ok: false; status: 400 | 409; body: { error: string; code: "consent_required" | "consent_outdated" } }

/** Reads `consent` from a request body. Only an explicit acceptance of the current version passes. */
export function readConsent(body: unknown): ConsentCheck {
  const raw = body && typeof body === "object" ? (body as { consent?: unknown }).consent : undefined
  const parsed = consentSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, status: 400, body: { error: CONSENT_REQUIRED_MESSAGE, code: "consent_required" } }
  }
  if (parsed.data.policyVersion !== CURRENT_POLICY_VERSION) {
    return { ok: false, status: 409, body: { error: CONSENT_OUTDATED_MESSAGE, code: "consent_outdated" } }
  }
  return { ok: true, policyVersion: parsed.data.policyVersion }
}

/** Writes the acceptance row. Call it inside the transaction that creates the thing being accepted for. */
export function recordPolicyAcceptance(
  tx: Prisma.TransactionClient,
  input: { context: PolicyContext; policyVersion: string; userId?: string; enquiryId?: string; reference?: string },
) {
  return tx.policyAcceptance.create({
    data: {
      context: input.context,
      policyVersion: input.policyVersion,
      userId: input.userId ?? null,
      enquiryId: input.enquiryId ?? null,
      reference: input.reference ?? null,
    },
  })
}
