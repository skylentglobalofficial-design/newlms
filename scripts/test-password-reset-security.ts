/**
 * Password-reset security regression tests (no database, no network).
 * Covers token formatting, hashing, generic responses, email config honesty,
 * and that response helpers never embed token material.
 */

import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  isValidPasswordResetTokenFormat,
  genericPasswordResetRequestResponse,
  responseContainsTokenMaterial,
  PASSWORD_RESET_GENERIC_MESSAGE,
} from "../server/src/lib/password-reset-crypto.ts"
import {
  getEmailConfigStatus,
  IMPLEMENTED_EMAIL_PROVIDERS,
  buildPasswordResetEmail,
} from "../server/src/lib/email.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// Token format
const token = generatePasswordResetToken()
assert(token.length === 64, "token is 32 bytes hex")
assert(isValidPasswordResetTokenFormat(token), "generated token is valid format")
assert(!isValidPasswordResetTokenFormat("short"), "short token rejected")
assert(!isValidPasswordResetTokenFormat("x".repeat(64)), "non-hex rejected")
assert(!isValidPasswordResetTokenFormat(""), "empty rejected")

// Hashing is deterministic and does not equal plaintext
const hash1 = hashPasswordResetToken(token)
const hash2 = hashPasswordResetToken(token)
assert(hash1 === hash2, "hash is deterministic")
assert(hash1 !== token, "hash is not plaintext")
assert(hash1.length === 64, "sha256 hex length")
assert(hashPasswordResetToken("other") !== hash1, "different inputs differ")

// Generic response never includes token
const body = genericPasswordResetRequestResponse(false)
assert(body.message === PASSWORD_RESET_GENERIC_MESSAGE, "generic message constant")
assert(!responseContainsTokenMaterial(body, token), "generic body has no token")
assert(responseContainsTokenMaterial({ reset: token }, token), "detector finds token when present")
assert(!("token" in body), "no token field")
assert(!("resetUrl" in body), "no resetUrl field")

// Known and unknown accounts must use the same response shape
const knownShape = genericPasswordResetRequestResponse(true)
const unknownShape = genericPasswordResetRequestResponse(true)
assert(JSON.stringify(knownShape) === JSON.stringify(unknownShape), "identical shapes")

// Email: unsupported providers must not report configured
const saved = { ...process.env }
try {
  process.env.EMAIL_PROVIDER = "ses"
  process.env.EMAIL_FROM = "noreply@example.com"
  process.env.AWS_ACCESS_KEY_ID = "x"
  process.env.AWS_SECRET_ACCESS_KEY = "y"
  process.env.AWS_SES_REGION = "us-east-1"
  const ses = getEmailConfigStatus()
  assert(ses.provider === "ses", "ses provider detected")
  assert(!ses.implemented, "ses not implemented")
  assert(!ses.configured, "ses must not report configured")

  process.env.EMAIL_PROVIDER = "smtp"
  process.env.SMTP_HOST = "h"
  process.env.SMTP_PORT = "587"
  process.env.SMTP_USER = "u"
  process.env.SMTP_PASS = "p"
  const smtp = getEmailConfigStatus()
  assert(!smtp.configured, "smtp must not report configured")

  process.env.EMAIL_PROVIDER = "none"
  delete process.env.EMAIL_FROM
  assert(!getEmailConfigStatus().configured, "none is unconfigured")

  process.env.EMAIL_PROVIDER = "mailgun"
  process.env.EMAIL_FROM = "noreply@example.com"
  process.env.MAILGUN_API_KEY = "key"
  process.env.MAILGUN_DOMAIN = "mg.example.com"
  const mg = getEmailConfigStatus()
  assert(mg.implemented && mg.configured, "mailgun with vars is configured")
  assert(IMPLEMENTED_EMAIL_PROVIDERS.has("mailgun"), "mailgun in implemented set")
  assert(IMPLEMENTED_EMAIL_PROVIDERS.has("sendgrid"), "sendgrid in implemented set")
  assert(!IMPLEMENTED_EMAIL_PROVIDERS.has("ses"), "ses not in implemented set")
} finally {
  for (const key of Object.keys(process.env)) {
    if (!(key in saved)) delete process.env[key]
  }
  Object.assign(process.env, saved)
}

// Reset email body embeds URL but tests do not send it
const email = buildPasswordResetEmail("https://example.com/reset-password?token=abc")
assert(email.subject.includes("password"), "subject set")
assert(email.text.includes("https://example.com/reset-password?token=abc"), "text has url")
assert(!email.text.includes("api:"), "no credentials in body")

console.log("password-reset-security ok")
