import { Router } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  BCRYPT_ROUNDS,
  clearSessionCookies,
  createSession,
  ensureRole,
  generateCsrfToken,
  hashSessionToken,
  normalizeEmail,
  parseCookies,
  primaryRole,
  requireAuth,
  requireCsrf,
  setSessionCookies,
  csrfCookieOptions,
  CSRF_COOKIE,
  SESSION_COOKIE,
  toApiRole,
  toSafeUser,
  type AuthenticatedRequest,
} from "../lib/auth.js"
import {
  buildGoogleAuthorizationUrl,
  exchangeGoogleAuthorizationCode,
  getGoogleOAuthConfig,
  resolveGoogleAccount,
  verifyGoogleIdToken,
} from "../lib/google-oauth.js"
import {
  clearOAuthStateCookie,
  createOAuthState,
  readOAuthStateCookie,
  setOAuthStateCookie,
  verifySignedOAuthState,
} from "../lib/oauth-state.js"
import {
  oauthErrorRedirect,
  oauthSuccessRedirect,
  parseEnrollTarget,
  sanitizeReturnTo,
} from "../lib/safe-redirect.js"

export const authRouter = Router()

const emailSchema = z.string().trim().email("Enter a valid email address")
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
const displayNameSchema = z.string().trim().min(1, "Display name is required").max(120, "Display name is too long")

const signupSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    name: displayNameSchema.optional(),
    email: emailSchema,
    password: passwordSchema,
  })
  .refine((data) => Boolean(data.displayName ?? data.name), {
    message: "Display name is required",
    path: ["displayName"],
  })

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
})

const AUTH_FAILURE = { error: "Invalid email or password" }

authRouter.get("/csrf", (req, res) => {
  const csrfToken = generateCsrfToken()
  res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions(req))
  res.json({ csrfToken })
})

authRouter.get("/google", (req, res) => {
  const config = getGoogleOAuthConfig()
  if (!config) {
    return res.status(503).json({ error: "Google OAuth is not configured" })
  }

  try {
    const returnTo = sanitizeReturnTo(req.query.returnTo)
    const enrollTarget = parseEnrollTarget(req.query.enrollKind, req.query.enrollSlug)
    const { state, nonce, signed } = createOAuthState({ returnTo, enrollTarget })
    setOAuthStateCookie(res, req, signed)
    const authorizationUrl = buildGoogleAuthorizationUrl({ state, nonce })
    return res.redirect(authorizationUrl)
  } catch (error) {
    console.error("Google OAuth start failed:", error instanceof Error ? error.message : error)
    return res.redirect(oauthErrorRedirect("oauth_start"))
  }
})

authRouter.get("/google/callback", async (req, res) => {
  const oauthError = typeof req.query.error === "string" ? req.query.error : null
  if (oauthError) {
    return res.redirect(oauthErrorRedirect("oauth_denied"))
  }

  const code = typeof req.query.code === "string" ? req.query.code : null
  const state = typeof req.query.state === "string" ? req.query.state : null
  const signedState = readOAuthStateCookie(req)
  const payload = verifySignedOAuthState(signedState)

  clearOAuthStateCookie(res, req)

  if (!code || !state || !payload || payload.state !== state) {
    return res.redirect(oauthErrorRedirect("oauth_state"))
  }

  try {
    const { idToken } = await exchangeGoogleAuthorizationCode(code)
    const claims = await verifyGoogleIdToken(idToken, payload.nonce)
    const user = await resolveGoogleAccount(claims)
    const { sessionToken, csrfToken } = await createSession(user.id)
    setSessionCookies(res, req, sessionToken, csrfToken)

    return res.redirect(oauthSuccessRedirect({
      returnTo: payload.returnTo ?? null,
      enrollTarget: payload.enrollTarget ?? null,
    }))
  } catch (error) {
    console.error("Google OAuth callback failed:", error instanceof Error ? error.message : error)
    return res.redirect(oauthErrorRedirect("oauth_failed"))
  }
})

authRouter.post("/signup", requireCsrf, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const email = normalizeEmail(parsed.data.email)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" })
  }

  try {
    const displayName = (parsed.data.displayName ?? parsed.data.name)!.trim()
    const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS)
    const studentRole = await ensureRole(RoleName.STUDENT)
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        roles: {
          create: { roleId: studentRole.id },
        },
      },
      include: { roles: { include: { role: true } } },
    })

    const { sessionToken, csrfToken } = await createSession(user.id)
    setSessionCookies(res, req, sessionToken, csrfToken)

    const roles = user.roles.map((entry) => entry.role)
    res.status(201).json({
      user: toSafeUser(user),
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
    })
  } catch (error) {
    console.error("Signup failed:", error)
    res.status(500).json({ error: "Failed to create account" })
  }
})

authRouter.post("/login", requireCsrf, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const email = normalizeEmail(parsed.data.email)
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  })

  if (!user?.passwordHash) {
    return res.status(401).json(AUTH_FAILURE)
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!valid) {
    return res.status(401).json(AUTH_FAILURE)
  }

  try {
    const { sessionToken, csrfToken } = await createSession(user.id)
    setSessionCookies(res, req, sessionToken, csrfToken)

    const roles = user.roles.map((entry) => entry.role)
    res.json({
      user: toSafeUser(user),
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
    })
  } catch (error) {
    console.error("Login failed:", error)
    res.status(500).json({ error: "Failed to sign in" })
  }
})

authRouter.post("/logout", requireCsrf, async (req, res) => {
  const cookies = parseCookies(req)
  const sessionToken = cookies[SESSION_COOKIE]

  if (sessionToken) {
    const secretHash = hashSessionToken(sessionToken)
    await prisma.session.deleteMany({ where: { secretHash } }).catch(() => undefined)
  }

  clearSessionCookies(res, req)
  res.json({ ok: true })
})

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const auth = req.auth
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  res.json({
    user: toSafeUser(auth.user),
    roles: auth.roles.map(toApiRole),
    role: primaryRole(auth.roles),
  })
})
