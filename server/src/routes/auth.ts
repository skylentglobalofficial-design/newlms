import { Router } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { recordAdminAudit } from "../lib/admin-audit.js"
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
import { ConsentOutdatedError, GoogleEmailLinkBlockedError } from "../lib/google-link.js"
import {
  clearOAuthStateCookie,
  createOAuthState,
  readOAuthStateCookie,
  setOAuthStateCookie,
  verifySignedOAuthState,
} from "../lib/oauth-state.js"
import { readConsent, recordPolicyAcceptance } from "../lib/policy.js"
import {
  isMissingSchemaError,
  PolicyStorageUnavailableError,
  readSchemaCapabilities,
  UNAVAILABLE_MESSAGES,
  unavailableBody,
  userCredentialSelect,
} from "../lib/schema-capabilities.js"
import { ConsentRequiredError } from "../lib/google-oauth.js"
import {
  oauthErrorRedirect,
  oauthSuccessRedirect,
  parseEnrollTarget,
  sanitizeReturnTo,
} from "../lib/safe-redirect.js"
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  resetPasswordWithToken,
  PasswordResetError,
  genericPasswordResetRequestResponse,
  isValidPasswordResetTokenFormat,
} from "../lib/password-reset.js"
import {
  isEmailConfigured,
  sendEmail,
  buildPasswordResetEmail,
} from "../lib/email.js"
import rateLimit from "express-rate-limit"

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
  // Re-issuing a new value here invalidates a token the browser already stored
  // and cannot re-read from a cross-site Set-Cookie. Keep the proved value.
  const existing = parseCookies(req)[CSRF_COOKIE]
  const csrfToken = existing || generateCsrfToken()
  res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions(req))
  res.json({ csrfToken })
})

authRouter.get("/google", (req, res) => {
  const config = getGoogleOAuthConfig(req)
  if (!config) {
    return res.status(503).json({ error: "Google OAuth is not configured" })
  }

  try {
    const returnTo = sanitizeReturnTo(req.query.returnTo)
    const enrollTarget = parseEnrollTarget(req.query.enrollKind, req.query.enrollSlug)
    // Carry the version the browser sent. The account is created only if it is still current.
    const rawConsent = typeof req.query.consent === "string" ? req.query.consent.trim() : ""
    const policyVersion = rawConsent.length > 0 && rawConsent.length <= 40 ? rawConsent : null
    const { state, nonce, signed } = createOAuthState({ returnTo, enrollTarget, policyVersion })
    setOAuthStateCookie(res, req, signed)
    const authorizationUrl = buildGoogleAuthorizationUrl({ state, nonce, req })
    return res.redirect(authorizationUrl)
  } catch (error) {
    console.error("Google OAuth start failed:", error instanceof Error ? error.message : error)
    return res.redirect(oauthErrorRedirect("oauth_start", req))
  }
})

authRouter.get("/google/callback", async (req, res) => {
  const oauthError = typeof req.query.error === "string" ? req.query.error : null
  if (oauthError) {
    return res.redirect(oauthErrorRedirect("oauth_denied", req))
  }

  const code = typeof req.query.code === "string" ? req.query.code : null
  const state = typeof req.query.state === "string" ? req.query.state : null
  const signedState = readOAuthStateCookie(req)
  const payload = verifySignedOAuthState(signedState)

  clearOAuthStateCookie(res, req)

  if (!code || !state || !payload || payload.state !== state) {
    return res.redirect(oauthErrorRedirect("oauth_state", req))
  }

  try {
    const { idToken } = await exchangeGoogleAuthorizationCode(code, req)
    const claims = await verifyGoogleIdToken(idToken, payload.nonce)
    const user = await resolveGoogleAccount(claims, { policyVersion: payload.policyVersion ?? null })
    const { sessionToken, csrfToken } = await createSession(user.id)
    setSessionCookies(res, req, sessionToken, csrfToken)

    return res.redirect(oauthSuccessRedirect({
      returnTo: payload.returnTo ?? null,
      enrollTarget: payload.enrollTarget ?? null,
    }, req))
  } catch (error) {
    if (error instanceof ConsentRequiredError) {
      return res.redirect(oauthErrorRedirect("consent_required", req))
    }
    if (error instanceof ConsentOutdatedError) {
      return res.redirect(oauthErrorRedirect("consent_outdated", req))
    }
    if (error instanceof GoogleEmailLinkBlockedError) {
      return res.redirect(oauthErrorRedirect("oauth_email_in_use", req))
    }
    if (error instanceof PolicyStorageUnavailableError) {
      console.error("Google sign-up blocked: policy acceptance storage is unavailable")
      return res.redirect(oauthErrorRedirect("oauth_failed", req))
    }
    console.error("Google OAuth callback failed:", error instanceof Error ? error.message : error)
    return res.redirect(oauthErrorRedirect("oauth_failed", req))
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

  const consent = readConsent(req.body)
  if (!consent.ok) {
    return res.status(consent.status).json(consent.body)
  }

  const email = normalizeEmail(parsed.data.email)

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" })
    }

    let policyReady = false
    try {
      policyReady = (await readSchemaCapabilities()).policyAcceptance
    } catch (error) {
      console.error("Signup blocked: policy storage could not be checked:", error instanceof Error ? error.message : "schema check failed")
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    if (!policyReady) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }

    const displayName = (parsed.data.displayName ?? parsed.data.name)!.trim()
    const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS)
    const studentRole = await ensureRole(RoleName.STUDENT)
    // The account and the record of what was accepted are written together or not at all.
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
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
      await recordPolicyAcceptance(tx, { context: "signup", policyVersion: consent.policyVersion, userId: created.id })
      return created
    })

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)

    const roles = user.roles.map((entry) => entry.role)
    res.status(201).json({
      user: toSafeUser(user),
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: user.mustChangePassword,
      csrfToken: issuedCsrf,
    })
  } catch (error) {
    if (isMissingSchemaError(error)) {
      console.error("Signup rolled back: policy acceptance storage is unavailable")
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
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
  let mustChangePassword = false
  try {
    mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
  } catch (error) {
    console.error("Login blocked: account columns could not be checked")
    return res.status(503).json({ error: "Failed to sign in" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...userCredentialSelect(mustChangePassword),
        roles: { include: { role: true } },
      },
    })

    if (!user?.passwordHash) {
      return res.status(401).json(AUTH_FAILURE)
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!valid) {
      return res.status(401).json(AUTH_FAILURE)
    }

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)
    const roles = user.roles.map((entry) => entry.role)
    res.json({
      user: toSafeUser(user as Parameters<typeof toSafeUser>[0]),
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: "mustChangePassword" in user ? user.mustChangePassword : false,
      csrfToken: issuedCsrf,
    })
  } catch (error) {
    if (isMissingSchemaError(error)) {
      console.error("Login blocked: account columns are missing")
      return res.status(503).json({ error: "Failed to sign in" })
    }
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
    mustChangePassword: auth.user.mustChangePassword,
  })
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12).max(200),
})

authRouter.post("/change-password", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Use a new password of at least 12 characters" })
  }
  if (parsed.data.newPassword === parsed.data.currentPassword) {
    return res.status(400).json({ error: "Choose a password that is different from the current one" })
  }
  const user = req.auth!.user
  if (!user.passwordHash) {
    return res.status(400).json({ error: "This account has no password to change" })
  }
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return res.status(401).json({ error: "The current password is wrong" })
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  })
  await recordAdminAudit({
    actorId: user.id,
    action: "auth.password.changed",
    targetType: "User",
    targetId: user.id,
    summary: "Password changed",
  })
  res.json({ ok: true, mustChangePassword: false })
})

authRouter.patch("/me", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ displayName: displayNameSchema }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.auth!.user.id },
      data: { displayName: parsed.data.displayName },
      include: { roles: { include: { role: true } } },
    })
    const roles = user.roles.map((entry) => entry.role)
    res.json({
      user: toSafeUser(user),
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: user.mustChangePassword,
    })
  } catch (error) {
    console.error("Failed to update profile:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

const passwordResetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many password reset attempts. Try again later." })
  },
})

const passwordResetRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
})

authRouter.post("/password-reset/request", passwordResetRateLimit, async (req, res) => {
  const parsed = passwordResetRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  // Always return the same body shape for known and unknown accounts.
  // Never include token material in the HTTP response or logs.
  try {
    const result = await createPasswordResetToken(parsed.data.email)

    if (result && isEmailConfigured()) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8443"
      const resetUrl = `${frontendUrl}/reset-password?token=${result.token}`
      const emailContent = buildPasswordResetEmail(resetUrl)

      try {
        await sendEmail({
          to: normalizeEmail(parsed.data.email),
          ...emailContent,
        })
      } catch {
        // Do not log the reset URL or token. Do not change the response —
        // a send failure must not reveal whether the account exists.
        console.error("Failed to send password reset email")
      }
    }

    res.json(genericPasswordResetRequestResponse(isEmailConfigured()))
  } catch (error) {
    if (error instanceof PasswordResetError && error.code === "RATE_LIMITED") {
      return res.status(429).json({ error: "Too many password reset requests. Try again later." })
    }
    console.error("Password reset request failed")
    res.json(genericPasswordResetRequestResponse(isEmailConfigured()))
  }
})

const passwordResetVerifySchema = z.object({
  token: z.string().min(64).max(128),
})

authRouter.post("/password-reset/verify", passwordResetRateLimit, async (req, res) => {
  const parsed = passwordResetVerifySchema.safeParse(req.body)
  if (!parsed.success || !isValidPasswordResetTokenFormat(parsed.data.token)) {
    return res.status(400).json({ error: "Invalid token format", valid: false })
  }

  try {
    await validatePasswordResetToken(parsed.data.token)
    res.json({ valid: true })
  } catch (error) {
    if (error instanceof PasswordResetError) {
      return res.status(400).json({ error: error.message, code: error.code, valid: false })
    }
    res.status(400).json({ error: "Invalid or expired token", valid: false })
  }
})

const passwordResetCompleteSchema = z.object({
  token: z.string().min(64).max(128),
  password: passwordSchema,
})

authRouter.post("/password-reset/complete", passwordResetRateLimit, async (req, res) => {
  const parsed = passwordResetCompleteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  if (!isValidPasswordResetTokenFormat(parsed.data.token)) {
    return res.status(400).json({ error: "Invalid token format", code: "INVALID_TOKEN", success: false })
  }

  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password)
    res.json({ success: true, message: "Password has been reset. You can now sign in." })
  } catch (error) {
    if (error instanceof PasswordResetError) {
      return res.status(400).json({ error: error.message, code: error.code, success: false })
    }
    console.error("Password reset failed")
    res.status(500).json({ error: "Failed to reset password", success: false })
  }
})

authRouter.get("/password-reset/config", (_req, res) => {
  res.json({
    emailConfigured: isEmailConfigured(),
    message: isEmailConfigured()
      ? "Password reset emails are enabled."
      : "Password reset emails are not configured. Contact an administrator.",
  })
})
