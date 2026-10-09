/**
 * The version of the Terms & Conditions and Privacy Policy published at /terms and /privacy.
 * Keep it equal to CURRENT_POLICY_VERSION in server/src/lib/policy.ts: the server refuses any other value.
 * Change both when the published text changes.
 */
export const POLICY_VERSION = "2026-10-09"

export type ConsentPayload = { accepted: true; policyVersion: string }

/** What a request sends once the person has ticked the terms checkbox. Never call it for an unticked box. */
export function consentPayload(): ConsentPayload {
  return { accepted: true, policyVersion: POLICY_VERSION }
}

const ENROL_CONSENT_KEY = "skylent.enrolConsent"

type EnrolTarget = { kind: "course" | "program"; slug: string }

function token(target: EnrolTarget): string {
  return `${target.kind}:${target.slug}:${POLICY_VERSION}`
}

/**
 * The enrolment dialog asks for the terms before it sends a signed-out visitor to sign in.
 * This keeps that acceptance for the one enrolment it was given for, in this tab only,
 * so it survives the sign-in (including the Google round trip) and nothing else.
 */
export function rememberEnrolConsent(target: EnrolTarget): void {
  try {
    window.sessionStorage.setItem(ENROL_CONSENT_KEY, token(target))
  } catch {
    // Without storage the learner is simply asked again on the course page.
  }
}

/** True once, if the terms were accepted for exactly this enrolment and policy version. */
export function takeEnrolConsent(target: EnrolTarget): boolean {
  try {
    const stored = window.sessionStorage.getItem(ENROL_CONSENT_KEY)
    if (stored === null) return false
    window.sessionStorage.removeItem(ENROL_CONSENT_KEY)
    return stored === token(target)
  } catch {
    return false
  }
}
