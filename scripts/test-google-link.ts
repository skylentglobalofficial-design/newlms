import { CURRENT_POLICY_VERSION } from "../server/src/lib/policy.ts"
import { decideGoogleSignIn } from "../server/src/lib/google-link.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const subject = "google-subject-1"

const blocked = decideGoogleSignIn({
  hasMatchingGoogleIdentity: false,
  hasUserWithSameEmail: true,
  linkedGoogleSubject: null,
  incomingSubject: subject,
  policyVersion: CURRENT_POLICY_VERSION,
})
assert(blocked.action === "blocked_email_link", "a password account must not be linked from a matching email")

const existing = decideGoogleSignIn({
  hasMatchingGoogleIdentity: true,
  hasUserWithSameEmail: true,
  linkedGoogleSubject: subject,
  incomingSubject: subject,
  policyVersion: null,
})
assert(existing.action === "existing_google", "an existing Google identity signs in without new consent")

const missingConsent = decideGoogleSignIn({
  hasMatchingGoogleIdentity: false,
  hasUserWithSameEmail: false,
  linkedGoogleSubject: null,
  incomingSubject: subject,
  policyVersion: null,
})
assert(missingConsent.action === "consent_required", "a new Google account without consent is refused")

const outdated = decideGoogleSignIn({
  hasMatchingGoogleIdentity: false,
  hasUserWithSameEmail: false,
  linkedGoogleSubject: null,
  incomingSubject: subject,
  policyVersion: "2020-01-01",
})
assert(outdated.action === "consent_outdated", "an outdated policy version is rejected when the account would be created")

const created = decideGoogleSignIn({
  hasMatchingGoogleIdentity: false,
  hasUserWithSameEmail: false,
  linkedGoogleSubject: null,
  incomingSubject: subject,
  policyVersion: CURRENT_POLICY_VERSION,
})
assert(created.action === "create" && created.policyVersion === CURRENT_POLICY_VERSION, "current consent allows a new Google account")

const different = decideGoogleSignIn({
  hasMatchingGoogleIdentity: false,
  hasUserWithSameEmail: true,
  linkedGoogleSubject: "other-subject",
  incomingSubject: subject,
  policyVersion: CURRENT_POLICY_VERSION,
})
assert(different.action === "different_google", "an email already linked to another Google account stays blocked")

console.log("Google link policy checks passed")
