import { CONSENT_OUTDATED_MESSAGE, CONSENT_REQUIRED_MESSAGE, CURRENT_POLICY_VERSION } from "./policy.js"

/** A verified Google login must not be attached to a password account just because the email text matches. */
export class GoogleEmailLinkBlockedError extends Error {
  constructor() {
    super("This email already has a Skylent account. Google was not connected.")
    this.name = "GoogleEmailLinkBlockedError"
  }
}

export class ConsentRequiredError extends Error {
  constructor() {
    super(CONSENT_REQUIRED_MESSAGE)
    this.name = "ConsentRequiredError"
  }
}

export class ConsentOutdatedError extends Error {
  constructor() {
    super(CONSENT_OUTDATED_MESSAGE)
    this.name = "ConsentOutdatedError"
  }
}

export type GoogleSignInDecision =
  | { action: "existing_google" }
  | { action: "blocked_email_link" }
  | { action: "different_google" }
  | { action: "consent_required" }
  | { action: "consent_outdated" }
  | { action: "create"; policyVersion: string }

/** Pure account decision. Existing Google identities sign in. Email text alone never links a new identity. */
export function decideGoogleSignIn(input: {
  hasMatchingGoogleIdentity: boolean
  hasUserWithSameEmail: boolean
  linkedGoogleSubject: string | null
  incomingSubject: string
  policyVersion: string | null | undefined
}): GoogleSignInDecision {
  if (input.hasMatchingGoogleIdentity) return { action: "existing_google" }
  if (input.hasUserWithSameEmail) {
    if (input.linkedGoogleSubject && input.linkedGoogleSubject !== input.incomingSubject) {
      return { action: "different_google" }
    }
    if (input.linkedGoogleSubject === input.incomingSubject) return { action: "existing_google" }
    return { action: "blocked_email_link" }
  }
  if (!input.policyVersion) return { action: "consent_required" }
  if (input.policyVersion !== CURRENT_POLICY_VERSION) return { action: "consent_outdated" }
  return { action: "create", policyVersion: input.policyVersion }
}
