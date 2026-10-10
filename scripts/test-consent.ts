/**
 * Terms & Conditions / Privacy Policy acceptance, enforced and recorded by the server.
 * Needs a running API and its database (QA only). Sends requests the way a browser would,
 * and also the way someone calling the API directly would, without the checkbox.
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { ConsentRequiredError, resolveGoogleAccount } from "../server/src/lib/google-oauth.ts"
import { createOAuthState, verifySignedOAuthState } from "../server/src/lib/oauth-state.ts"
import { CURRENT_POLICY_VERSION, readConsent } from "../server/src/lib/policy.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3099/api/v1"
const COURSE = "data-analytics"

type CookieJar = Map<string, string>
type Body = { error?: string; code?: string; data?: unknown; user?: { id: string } }

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  let data: Body = {}
  try {
    data = text ? (JSON.parse(text) as Body) : {}
  } catch {
    data = { error: text }
  }
  return { status: response.status, data }
}

function uniqueEmail(label: string) {
  return `consent-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
}

const PASSWORD = "test-password-123"

async function main() {
  console.log("1. readConsent accepts only an explicit acceptance of the current version")
  assert(!readConsent({}).ok, "missing consent must be refused")
  assert(!readConsent({ consent: { accepted: false, policyVersion: CURRENT_POLICY_VERSION } }).ok, "accepted:false must be refused")
  assert(!readConsent({ consent: { accepted: "true", policyVersion: CURRENT_POLICY_VERSION } }).ok, "a string is not an acceptance")
  assert(!readConsent({ consent: true }).ok, "a bare true is not an acceptance")
  const outdated = readConsent({ consent: { accepted: true, policyVersion: "2020-01-01" } })
  assert(!outdated.ok && outdated.status === 409 && outdated.body.code === "consent_outdated", "an old version must be refused as outdated")
  assert(readConsent({ consent: TEST_CONSENT }).ok, "the current version must pass")

  console.log("2. Sign-up without consent is refused and creates no account")
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const email = uniqueEmail("signup")
  for (const [label, consent] of [
    ["no consent field", undefined],
    ["accepted false", { accepted: false, policyVersion: CURRENT_POLICY_VERSION }],
    ["missing version", { accepted: true }],
  ] as const) {
    const refused = await request(jar, "/auth/signup", {
      method: "POST",
      csrf: true,
      body: { displayName: "Consent Test", email, password: PASSWORD, ...(consent ? { consent } : {}) },
    })
    assert(refused.status === 400 && refused.data.code === "consent_required", `signup (${label}) should be 400 consent_required, got ${refused.status} ${JSON.stringify(refused.data)}`)
  }
  const old = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: "Consent Test", email, password: PASSWORD, consent: { accepted: true, policyVersion: "2020-01-01" } },
  })
  assert(old.status === 409 && old.data.code === "consent_outdated", `signup with an old version should be 409, got ${old.status}`)
  assert((await prisma.user.findUnique({ where: { email } })) === null, "a refused sign-up must not create a user")

  console.log("3. Sign-up with consent creates the account and one acceptance row")
  const before = new Date(Date.now() - 5_000)
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: "Consent Test", email, password: PASSWORD, consent: TEST_CONSENT },
  })
  assert(created.status === 201, `signup with consent failed: ${created.status} ${JSON.stringify(created.data)}`)
  const user = await prisma.user.findUnique({ where: { email } })
  assert(user, "user row missing after sign-up")
  const signupRows = await prisma.policyAcceptance.findMany({ where: { userId: user.id, context: "signup" } })
  assert(signupRows.length === 1, `expected one signup acceptance, found ${signupRows.length}`)
  assert(signupRows[0].policyVersion === CURRENT_POLICY_VERSION, "signup acceptance has the wrong policy version")
  assert(signupRows[0].acceptedAt >= before && signupRows[0].acceptedAt <= new Date(Date.now() + 5_000), "acceptedAt must be the time of the request")

  console.log("4. Enrolment without consent is refused and creates no enrolment")
  const refusedEnrol = await request(jar, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: COURSE } })
  assert(refusedEnrol.status === 400 && refusedEnrol.data.code === "consent_required", `enrol without consent should be 400, got ${refusedEnrol.status} ${JSON.stringify(refusedEnrol.data)}`)
  assert((await prisma.userEnrollment.count({ where: { userId: user.id } })) === 0, "a refused enrolment must not create a row")
  assert((await prisma.policyAcceptance.count({ where: { userId: user.id, context: "enrolment" } })) === 0, "a refused enrolment must not record an acceptance")

  console.log("5. Enrolment with consent is recorded against the enrolment it created")
  const enrolled = await request(jar, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: COURSE, consent: TEST_CONSENT } })
  assert(enrolled.status === 201, `enrol with consent failed: ${enrolled.status} ${JSON.stringify(enrolled.data)}`)
  const enrolment = await prisma.userEnrollment.findFirst({ where: { userId: user.id } })
  assert(enrolment, "enrolment row missing")
  const enrolRows = await prisma.policyAcceptance.findMany({ where: { userId: user.id, context: "enrolment" } })
  assert(enrolRows.length === 1 && enrolRows[0].reference === enrolment.id, "the enrolment acceptance must reference the enrolment")

  console.log("6. Opening an existing enrolment needs no new consent and records nothing new")
  const reopened = await request(jar, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: COURSE } })
  assert(reopened.status === 200, `re-opening an enrolment should be 200, got ${reopened.status}`)
  assert((await prisma.policyAcceptance.count({ where: { userId: user.id, context: "enrolment" } })) === 1, "re-opening must not add an acceptance")

  console.log("7. Enquiry without consent is refused; with consent it is recorded against the enquiry")
  const enquiryEmail = uniqueEmail("enquiry")
  const refusedEnquiry = await request(new Map(), "/enquiries", { method: "POST", body: { name: "Consent Test", email: enquiryEmail, message: "hello" } })
  assert(refusedEnquiry.status === 400 && refusedEnquiry.data.code === "consent_required", `enquiry without consent should be 400, got ${refusedEnquiry.status}`)
  assert((await prisma.skylentEnquiry.count({ where: { email: enquiryEmail } })) === 0, "a refused enquiry must not be stored")
  const sent = await request(new Map(), "/enquiries", { method: "POST", body: { name: "Consent Test", email: enquiryEmail, message: "hello", consent: TEST_CONSENT } })
  assert(sent.status === 201, `enquiry with consent failed: ${sent.status} ${JSON.stringify(sent.data)}`)
  const enquiry = await prisma.skylentEnquiry.findFirst({ where: { email: enquiryEmail } })
  assert(enquiry, "enquiry row missing")
  const enquiryRows = await prisma.policyAcceptance.findMany({ where: { enquiryId: enquiry.id } })
  assert(enquiryRows.length === 1 && enquiryRows[0].context === "enquiry" && enquiryRows[0].userId === null, "the enquiry acceptance must reference the enquiry only")

  console.log("8. Google sign-in carries consent in the signed state and never creates an account without it")
  const withConsent = createOAuthState({ policyVersion: CURRENT_POLICY_VERSION })
  assert(verifySignedOAuthState(withConsent.signed)?.policyVersion === CURRENT_POLICY_VERSION, "signed state must carry the accepted version")
  assert(verifySignedOAuthState(createOAuthState({}).signed)?.policyVersion === undefined, "state without consent must not carry a version")
  const tampered = withConsent.signed.replace(/^[^.]+/, Buffer.from(JSON.stringify({ state: "x", nonce: "y", exp: Date.now() + 60_000, policyVersion: CURRENT_POLICY_VERSION })).toString("base64url"))
  assert(verifySignedOAuthState(tampered) === null, "a state with a forged body must be rejected")

  const googleEmail = uniqueEmail("google")
  const claims = { sub: `consent-test-${Date.now()}`, email: googleEmail, email_verified: true, name: "Consent Google", iss: "accounts.google.com", aud: "test", exp: Math.floor(Date.now() / 1000) + 600 }
  let refusedGoogle = false
  try {
    await resolveGoogleAccount(claims)
  } catch (error) {
    refusedGoogle = error instanceof ConsentRequiredError
  }
  assert(refusedGoogle, "a new Google account without consent must throw ConsentRequiredError")
  assert((await prisma.user.findUnique({ where: { email: googleEmail } })) === null, "a refused Google sign-up must not create a user")

  const googleUser = await resolveGoogleAccount(claims, { policyVersion: CURRENT_POLICY_VERSION })
  const googleRows = await prisma.policyAcceptance.findMany({ where: { userId: googleUser.id } })
  assert(googleRows.length === 1 && googleRows[0].context === "google_signup", "a Google sign-up must record one google_signup acceptance")

  console.log("9. An existing account signs in with Google without a new acceptance")
  const again = await resolveGoogleAccount(claims)
  assert(again.id === googleUser.id, "the existing Google account should be returned")
  assert((await prisma.policyAcceptance.count({ where: { userId: googleUser.id } })) === 1, "signing in again must not add an acceptance")

  console.log("10. Accounts created before this feature have no acceptance invented for them")
  assert((await prisma.policyAcceptance.count({ where: { userId: null, enquiryId: null } })) === 0, "every acceptance must belong to a user or an enquiry")

  console.log("Consent checks passed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
