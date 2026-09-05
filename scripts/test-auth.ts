import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3001/api/v1"

type CookieJar = Map<string, string>

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

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean; csrfToken?: string } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) {
    headers["X-CSRF-Token"] = options.csrfToken ?? jar.get("csrf") ?? ""
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const setCookie = response.headers.getSetCookie?.() ?? []
  parseSetCookie(setCookie, jar)

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function assertNoSecrets(payload: unknown) {
  const serialized = JSON.stringify(payload)
  assert(!serialized.includes("passwordHash"), "Response leaked passwordHash")
  assert(!serialized.includes("secretHash"), "Response leaked secretHash")
  assert(!serialized.includes("tokenHash"), "Response leaked tokenHash")
}

async function main() {
  const jar: CookieJar = new Map()
  const email = `auth-test-${Date.now()}@example.com`
  const password = "test-password-123"
  const displayName = "Auth Test User"

  console.log("1. Signup → me → logout → me rejected")
  const csrfBootstrap = await request(jar, "/auth/csrf")
  assert(csrfBootstrap.response.ok, "CSRF bootstrap failed")
  assert(jar.has("csrf"), "CSRF cookie missing")

  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName, email, password },
  })
  assert(signup.response.status === 201, `Signup failed: ${signup.response.status}`)
  assert(signup.data.user?.email === email, "Signup email mismatch")
  assertNoSecrets(signup.data)
  assert(jar.has("sid"), "Session cookie missing after signup")

  const meAfterSignup = await request(jar, "/auth/me")
  assert(meAfterSignup.response.ok, "/auth/me failed after signup")
  assertNoSecrets(meAfterSignup.data)

  const logout = await request(jar, "/auth/logout", { method: "POST", csrf: true, body: {} })
  assert(logout.response.ok, "Logout failed")

  const meAfterLogout = await request(jar, "/auth/me")
  assert(meAfterLogout.response.status === 401, "/auth/me should fail after logout")

  console.log("2. Duplicate signup rejected")
  const dupCsrf = await request(jar, "/auth/csrf")
  assert(dupCsrf.response.ok, "CSRF bootstrap failed for duplicate signup test")
  const duplicate = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName, email, password },
  })
  assert(duplicate.response.status === 409, "Duplicate signup should be rejected")

  console.log("3. Valid login")
  jar.clear()
  const loginCsrf = await request(jar, "/auth/csrf")
  assert(loginCsrf.response.ok, "CSRF bootstrap failed for login")
  const login = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password },
  })
  assert(login.response.ok, "Valid login failed")
  assertNoSecrets(login.data)
  assert(jar.has("sid"), "Session cookie missing after login")

  console.log("4. Invalid login rejected")
  const badLogin = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: "wrong-password" },
  })
  assert(badLogin.response.status === 401, "Invalid login should be rejected")
  assert(badLogin.data.error === "Invalid email or password", "Invalid login message mismatch")

  console.log("5. Invalid/expired session rejected")
  const meValid = await request(jar, "/auth/me")
  assert(meValid.response.ok, "/auth/me should work with valid session")

  jar.delete("sid")
  const meNoCookie = await request(jar, "/auth/me")
  assert(meNoCookie.response.status === 401, "/auth/me should fail without session cookie")

  const relogin = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password },
  })
  assert(relogin.response.ok, "Re-login failed for expiry test")
  const activeSid = jar.get("sid")
  assert(activeSid, "Missing session cookie before expiry test")

  await prisma.session.updateMany({
    where: { tokenHash: hashSessionToken(activeSid) },
    data: { expiresAt: new Date(Date.now() - 1000) },
  })
  const meExpired = await request(jar, "/auth/me")
  assert(meExpired.response.status === 401, "Expired session should be rejected")

  console.log("6. Invalid CSRF rejected")
  const csrfAgain = await request(jar, "/auth/csrf")
  assert(csrfAgain.response.ok, "CSRF bootstrap failed for CSRF rejection test")
  const badCsrf = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    csrfToken: "invalid-csrf-token",
    body: { email, password },
  })
  assert(badCsrf.response.status === 403, "Invalid CSRF should be rejected")

  console.log("All auth lifecycle checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
