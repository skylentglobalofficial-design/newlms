import { createPublicKey, timingSafeEqual, verify } from "node:crypto"
import { AuthProvider, RoleName } from "@prisma/client"
import { prisma } from "./prisma.js"
import { ensureRole, normalizeEmail } from "./auth.js"

const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"])
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"

export type GoogleOAuthConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export type GoogleIdTokenClaims = {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  iss: string
  aud: string
  exp: number
  nonce?: string
}

type GoogleCertsResponse = Record<string, string>

let cachedCerts: { fetchedAt: number; keys: GoogleCertsResponse } | null = null

const CERT_CACHE_TTL_MS = 60 * 60 * 1000

export function resetGoogleCertificateCache(): void {
  cachedCerts = null
}

/** Seeds the in-memory certificate cache for integration tests. */
export function seedGoogleCertificateCache(keys: GoogleCertsResponse): void {
  cachedCerts = { fetchedAt: Date.now(), keys }
}

async function fetchGoogleCertificates(): Promise<GoogleCertsResponse> {
  const response = await fetch(GOOGLE_CERTS_URL)
  if (!response.ok) {
    throw new Error("Failed to fetch Google signing certificates")
  }

  return (await response.json()) as GoogleCertsResponse
}

async function getGoogleCertificates(options?: { forceRefresh?: boolean }): Promise<GoogleCertsResponse> {
  if (
    !options?.forceRefresh &&
    cachedCerts &&
    Date.now() - cachedCerts.fetchedAt < CERT_CACHE_TTL_MS
  ) {
    return cachedCerts.keys
  }

  const keys = await fetchGoogleCertificates()
  cachedCerts = { fetchedAt: Date.now(), keys }
  return keys
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim()
  if (!clientId || !clientSecret || !redirectUri) return null
  return { clientId, clientSecret, redirectUri }
}

export function buildGoogleAuthorizationUrl(input: {
  state: string
  nonce: string
}): string {
  const config = getGoogleOAuthConfig()
  if (!config) {
    throw new Error("Google OAuth is not configured")
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    nonce: input.nonce,
    prompt: "select_account",
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

function decodeJwtPart<T>(part: string): T {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T
}

export async function verifyGoogleIdToken(idToken: string, expectedNonce?: string): Promise<GoogleIdTokenClaims> {
  const config = getGoogleOAuthConfig()
  if (!config) {
    throw new Error("Google OAuth is not configured")
  }

  const segments = idToken.split(".")
  if (segments.length !== 3) {
    throw new Error("Invalid ID token format")
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments
  const header = decodeJwtPart<{ alg: string; kid: string }>(encodedHeader)
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported ID token header")
  }

  const certs = await getGoogleCertificates()
  let pem = certs[header.kid]
  if (!pem) {
    const refreshedCerts = await getGoogleCertificates({ forceRefresh: true })
    pem = refreshedCerts[header.kid]
  }
  if (!pem) {
    throw new Error("Unknown Google signing key")
  }

  const key = createPublicKey(pem)
  const signedData = Buffer.from(`${encodedHeader}.${encodedPayload}`)
  const signature = Buffer.from(encodedSignature, "base64url")
  const valid = verify("RSA-SHA256", signedData, key, signature)
  if (!valid) {
    throw new Error("Invalid ID token signature")
  }

  const claims = decodeJwtPart<GoogleIdTokenClaims>(encodedPayload)
  const now = Math.floor(Date.now() / 1000)
  if (!GOOGLE_ISSUERS.has(claims.iss)) {
    throw new Error("Invalid ID token issuer")
  }
  if (claims.aud !== config.clientId) {
    throw new Error("Invalid ID token audience")
  }
  if (claims.exp <= now) {
    throw new Error("Expired ID token")
  }
  if (!claims.email_verified) {
    throw new Error("Google email is not verified")
  }
  if (!claims.sub || !claims.email) {
    throw new Error("Google profile is incomplete")
  }
  if (expectedNonce) {
    if (!claims.nonce) {
      throw new Error("Missing ID token nonce")
    }
    const left = Buffer.from(claims.nonce)
    const right = Buffer.from(expectedNonce)
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new Error("Invalid ID token nonce")
    }
  }

  return claims
}

export async function exchangeGoogleAuthorizationCode(code: string): Promise<{ idToken: string }> {
  const config = getGoogleOAuthConfig()
  if (!config) {
    throw new Error("Google OAuth is not configured")
  }

  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  })

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const payload = (await response.json()) as { id_token?: string; error?: string }
  if (!response.ok || !payload.id_token) {
    throw new Error(payload.error ?? "Failed to exchange Google authorization code")
  }

  return { idToken: payload.id_token }
}

export async function resolveGoogleAccount(claims: GoogleIdTokenClaims) {
  const email = normalizeEmail(claims.email)
  const providerAccountId = claims.sub

  const existingIdentity = await prisma.userIdentity.findUnique({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.GOOGLE,
        providerAccountId,
      },
    },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
    },
  })

  if (existingIdentity) {
    return existingIdentity.user
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: { include: { role: true } },
      identities: true,
    },
  })

  if (existingUser) {
    const linkedGoogle = existingUser.identities.find((identity) => identity.provider === AuthProvider.GOOGLE)
    if (linkedGoogle && linkedGoogle.providerAccountId !== providerAccountId) {
      throw new Error("This email is already linked to a different Google account")
    }

    if (!linkedGoogle) {
      await prisma.userIdentity.create({
        data: {
          userId: existingUser.id,
          provider: AuthProvider.GOOGLE,
          providerAccountId,
        },
      })
    }

    return existingUser
  }

  const studentRole = await ensureRole(RoleName.STUDENT)
  const displayName = claims.name?.trim() || email.split("@")[0] || "User"

  return prisma.user.create({
    data: {
      email,
      displayName,
      identities: {
        create: {
          provider: AuthProvider.GOOGLE,
          providerAccountId,
        },
      },
      roles: {
        create: { roleId: studentRole.id },
      },
    },
    include: {
      roles: { include: { role: true } },
    },
  })
}
