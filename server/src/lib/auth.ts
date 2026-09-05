import crypto from "node:crypto"
import type { Request, Response, NextFunction } from "express"
import type { Role, User } from "@prisma/client"
import { prisma } from "./prisma.js"

export const SESSION_COOKIE = "sid"
export const CSRF_COOKIE = "csrf"
export const BCRYPT_ROUNDS = 12
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type AuthContext = {
  user: User
  roles: Role[]
  sessionId: string
}

export type AuthenticatedRequest = Request & {
  auth?: AuthContext
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function hashSessionToken(token: string): string {
  // Stored in Session.tokenHash (session secret hash).
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

export function initialsAvatar(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie
  if (!header) return {}

  return header.split(";").reduce<Record<string, string>>((cookies, part) => {
    const index = part.indexOf("=")
    if (index === -1) return cookies
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
    return cookies
  }, {})
}

function shouldUseSecureCookies(req?: Request): boolean {
  if (process.env.COOKIE_SECURE === "true") return true
  if (process.env.COOKIE_SECURE === "false") return false
  if (process.env.NODE_ENV === "production") return true
  const forwarded = req?.headers["x-forwarded-proto"]
  if (typeof forwarded === "string" && forwarded.split(",")[0]?.trim() === "https") return true
  return false
}

export function sessionCookieOptions(req?: Request, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  const secure = shouldUseSecureCookies(req)
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  }
}

export function csrfCookieOptions(req?: Request, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  const secure = shouldUseSecureCookies(req)
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  }
}

export function clearSessionCookies(res: Response, req?: Request) {
  const secure = shouldUseSecureCookies(req)
  res.clearCookie(SESSION_COOKIE, { path: "/", secure })
  res.clearCookie(CSRF_COOKIE, { path: "/", secure })
}

export function setSessionCookies(
  res: Response,
  req: Request,
  sessionToken: string,
  csrfToken: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
) {
  res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOptions(req, maxAgeSeconds))
  res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions(req, maxAgeSeconds))
}

export function toSafeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.name,
    name: user.name,
    avatar: user.avatar ?? initialsAvatar(user.name),
  }
}

export async function createSession(userId: string) {
  const sessionToken = generateSessionToken()
  const csrfToken = generateCsrfToken()
  const tokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  })

  return { session, sessionToken, csrfToken }
}

export async function resolveSession(sessionToken: string | undefined) {
  if (!sessionToken) return null

  const tokenHash = hashSessionToken(sessionToken)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: true,
        },
      },
    },
  })

  if (!session) return null
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return {
    sessionId: session.id,
    user: session.user,
    roles: session.user.roles.map((entry) => entry.role),
  }
}

export async function attachAuth(req: AuthenticatedRequest) {
  const cookies = parseCookies(req)
  const auth = await resolveSession(cookies[SESSION_COOKIE])
  if (auth) req.auth = auth
  return auth
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = await attachAuth(req)
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req)
  const headerToken = req.get("x-csrf-token")
  const cookieToken = cookies[CSRF_COOKIE]

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: "Invalid CSRF token" })
  }

  next()
}

export function primaryRole(roles: Role[]): Role {
  const priority: Role[] = ["superadmin", "organisation", "recruiter", "faculty", "student"]
  for (const role of priority) {
    if (roles.includes(role)) return role
  }
  return roles[0] ?? "student"
}
