import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import { createPasswordResetToken } from "../server/src/lib/password-reset.ts"
import {
  PASSWORD_RESET_GENERIC_MESSAGE,
  responseContainsTokenMaterial,
} from "../server/src/lib/password-reset-crypto.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

type CookieJar = Map<string, string>

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
}

async function request(jar: CookieJar, path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

async function main() {
  const email = `reset-http-${Date.now()}@example.com`
  const password = "test-password-123"
  const nextPassword = "replacement-password-123"
  const jar: CookieJar = new Map()

  console.log("1. Request does not reveal whether the account exists")
  const unknown = await request(jar, "/auth/password-reset/request", {
    method: "POST",
    body: { email: `missing-${Date.now()}@example.com` },
  })
  assert(unknown.response.ok, `Unknown email request failed: ${unknown.response.status}`)
  assert(unknown.data.message === PASSWORD_RESET_GENERIC_MESSAGE, "Unknown email used a different message")
  assert(!responseContainsTokenMaterial(unknown.data, "a".repeat(64)), "Response included token-shaped material")

  console.log("2. Signup, request, then complete with the stored token")
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: "Reset HTTP", email, password },
  })
  assert(signup.response.status === 201, `Signup failed: ${signup.response.status} ${JSON.stringify(signup.data)}`)

  const known = await request(new Map(), "/auth/password-reset/request", {
    method: "POST",
    body: { email },
  })
  assert(known.response.ok, `Known email request failed: ${known.response.status}`)
  assert(known.data.message === unknown.data.message, "Known and unknown accounts must share the request message")
  assert(typeof known.data.emailConfigured === "boolean", "Request should say whether mail is configured")

  const issued = await createPasswordResetToken(email)
  assert(issued, "A password account should receive a reset token")
  assert(!JSON.stringify(known.data).includes(issued.token), "The HTTP response included the reset token")

  const verified = await request(new Map(), "/auth/password-reset/verify", {
    method: "POST",
    body: { token: issued.token },
  })
  assert(verified.response.ok && verified.data.valid === true, "A fresh token should verify")

  const completed = await request(new Map(), "/auth/password-reset/complete", {
    method: "POST",
    body: { token: issued.token, password: nextPassword },
  })
  assert(completed.response.ok && completed.data.success === true, `Complete failed: ${JSON.stringify(completed.data)}`)

  const reused = await request(new Map(), "/auth/password-reset/complete", {
    method: "POST",
    body: { token: issued.token, password: "another-password-123" },
  })
  assert(reused.response.status === 400 && reused.data.success === false, "A used token must not reset the password again")

  const oldJar: CookieJar = new Map()
  await request(oldJar, "/auth/csrf")
  const oldAttempt = await request(oldJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password },
  })
  assert(oldAttempt.response.status === 401, "The previous password must stop working")

  const newJar: CookieJar = new Map()
  await request(newJar, "/auth/csrf")
  const newAttempt = await request(newJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: nextPassword },
  })
  assert(newAttempt.response.ok, `Login with the new password failed: ${newAttempt.response.status} ${JSON.stringify(newAttempt.data)}`)

  console.log("Password reset HTTP checks passed.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
