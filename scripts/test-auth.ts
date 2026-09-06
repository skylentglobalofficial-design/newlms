import "dotenv/config"
import crypto from "node:crypto"
import { AuthProvider, RoleName, PrismaClient } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.js"
import { resolveGoogleAccount, type GoogleIdTokenClaims } from "../server/src/lib/google-oauth.js"
import {
  createOAuthState,
  verifySignedOAuthState,
} from "../server/src/lib/oauth-state.js"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

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
    redirect: "manual",
  })

  const setCookie = response.headers.getSetCookie?.() ?? []
  parseSetCookie(setCookie, jar)

  const text = await response.text()
  let data: unknown = null
  if (text) {
    const contentType = response.headers.get("content-type") ?? ""
    if (contentType.includes("application/json")) {
      data = JSON.parse(text)
    } else {
      data = text
    }
  }
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

function googleClaims(sub: string, email: string, name?: string): GoogleIdTokenClaims {
  return {
    sub,
    email,
    email_verified: true,
    name,
    iss: "https://accounts.google.com",
    aud: process.env.GOOGLE_CLIENT_ID ?? "test-client-id",
    exp: Math.floor(Date.now() / 1000) + 3600,
  }
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
    where: { secretHash: hashSessionToken(activeSid) },
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

  console.log("7. Google OAuth start route")
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID
    && process.env.GOOGLE_CLIENT_SECRET
    && process.env.GOOGLE_REDIRECT_URI,
  )
  const googleStart = await request(new Map(), "/auth/google")
  if (googleConfigured) {
    assert(googleStart.response.status === 302, "Google OAuth start should redirect")
    const location = googleStart.response.headers.get("location") ?? ""
    assert(location.includes("accounts.google.com/o/oauth2"), "Google OAuth redirect URL missing")
  } else {
    assert(googleStart.response.status === 503, "Google OAuth start should report missing config")
  }

  console.log("8. Invalid OAuth state rejected")
  const badCallback = await request(new Map(), "/auth/google/callback?code=fake-code&state=invalid-state")
  assert(badCallback.response.status === 302, "Invalid OAuth callback should redirect")
  const badLocation = badCallback.response.headers.get("location") ?? ""
  assert(badLocation.includes("error=oauth_state"), "Invalid OAuth state should redirect with oauth_state error")

  console.log("9. OAuth callback provider error handled")
  const deniedCallback = await request(new Map(), "/auth/google/callback?error=access_denied")
  assert(deniedCallback.response.status === 302, "OAuth provider error should redirect")
  const deniedLocation = deniedCallback.response.headers.get("location") ?? ""
  assert(deniedLocation.includes("error=oauth_denied"), "OAuth provider error should redirect with oauth_denied")

  console.log("10. OAuth state signing helpers")
  const signed = createOAuthState({ returnTo: "/courses/data-analytics" })
  const verified = verifySignedOAuthState(signed.signed)
  assert(verified?.state === signed.state, "Signed OAuth state should verify")
  assert(verified?.returnTo === "/courses/data-analytics", "OAuth returnTo should round-trip")

  console.log("11. Google identity links existing email account")
  const linkEmail = `google-link-${Date.now()}@example.com`
  const studentRole = await ensureRole(RoleName.STUDENT)
  const passwordUser = await prisma.user.create({
    data: {
      email: linkEmail,
      displayName: "Password User",
      passwordHash: "hashed-placeholder",
      roles: { create: { roleId: studentRole.id } },
    },
  })
  const linkedUser = await resolveGoogleAccount(googleClaims(`google-sub-${Date.now()}`, linkEmail, "Google User"))
  assert(linkedUser.id === passwordUser.id, "Google identity should link to existing email account")
  const identityCount = await prisma.userIdentity.count({
    where: { userId: passwordUser.id, provider: AuthProvider.GOOGLE },
  })
  assert(identityCount === 1, "Google identity should be linked once")

  console.log("12. Duplicate Google identity cannot create duplicate users")
  const googleEmail = `google-only-${Date.now()}@example.com`
  const googleSub = `google-sub-dup-${Date.now()}`
  const firstGoogleUser = await resolveGoogleAccount(googleClaims(googleSub, googleEmail, "Google Only"))
  const secondGoogleUser = await resolveGoogleAccount(googleClaims(googleSub, googleEmail, "Google Only"))
  assert(firstGoogleUser.id === secondGoogleUser.id, "Same Google subject should resolve to one user")
  const googleUserCount = await prisma.user.count({ where: { email: googleEmail } })
  assert(googleUserCount === 1, "Duplicate Google login should not create duplicate users")

  console.log("All auth lifecycle checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
