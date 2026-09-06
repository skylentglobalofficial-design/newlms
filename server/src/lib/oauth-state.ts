import crypto from "node:crypto"
import type { Request, Response } from "express"
import { csrfCookieOptions } from "./auth.js"
import type { OAuthEnrollTarget } from "./safe-redirect.js"

export const OAUTH_STATE_COOKIE = "oauth_state"
export const OAUTH_STATE_MAX_AGE_SECONDS = 600

export type OAuthStatePayload = {
  state: string
  nonce: string
  exp: number
  returnTo?: string
  enrollTarget?: OAuthEnrollTarget
}

function signingSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim()
  if (!secret) {
    throw new Error("SESSION_SECRET is required for OAuth state signing")
  }
  return secret
}

function signPayload(payload: OAuthStatePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", signingSecret()).update(body).digest("base64url")
  return `${body}.${signature}`
}

export function verifySignedOAuthState(token: string | undefined): OAuthStatePayload | null {
  if (!token) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  const expected = crypto.createHmac("sha256", signingSecret()).update(body).digest("base64url")
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (
    expectedBuffer.length !== signatureBuffer.length
    || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OAuthStatePayload
    if (!payload.state || !payload.nonce || typeof payload.exp !== "number") return null
    if (payload.exp <= Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function createOAuthState(input: {
  returnTo?: string | null
  enrollTarget?: OAuthEnrollTarget | null
}): { state: string; nonce: string; signed: string } {
  const state = crypto.randomBytes(32).toString("base64url")
  const nonce = crypto.randomBytes(32).toString("base64url")
  const payload: OAuthStatePayload = {
    state,
    nonce,
    exp: Date.now() + OAUTH_STATE_MAX_AGE_SECONDS * 1000,
    ...(input.returnTo ? { returnTo: input.returnTo } : {}),
    ...(input.enrollTarget ? { enrollTarget: input.enrollTarget } : {}),
  }
  return { state, nonce, signed: signPayload(payload) }
}

export function setOAuthStateCookie(res: Response, req: Request, signed: string) {
  const base = csrfCookieOptions(req, OAUTH_STATE_MAX_AGE_SECONDS)
  res.cookie(OAUTH_STATE_COOKIE, signed, { ...base, httpOnly: true })
}

export function clearOAuthStateCookie(res: Response, req: Request) {
  const base = csrfCookieOptions(req, OAUTH_STATE_MAX_AGE_SECONDS)
  res.clearCookie(OAUTH_STATE_COOKIE, { path: base.path, secure: base.secure })
}

export function readOAuthStateCookie(req: Request): string | undefined {
  const header = req.headers.cookie
  if (!header) return undefined
  for (const part of header.split(";")) {
    const index = part.indexOf("=")
    if (index === -1) continue
    const key = part.slice(0, index).trim()
    if (key === OAUTH_STATE_COOKIE) {
      return decodeURIComponent(part.slice(index + 1).trim())
    }
  }
  return undefined
}
