import crypto from "node:crypto"
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
  extractBearerToken,
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
  isLiveGoogleOAuthClientId,
  resolveGoogleAccount,
  verifyGoogleIdToken,
} from "../lib/google-oauth.js"
import {
  computePasswordRotationStatus,
  findIdentityByEmail,
  findIdentityByPhone,
  getOrCreateIdentityEntry,
  maskEmailAddress,
  normalizeIndianPhone,
  recordPasswordRotationTimestamp,
  updateStudentProfileDetails,
  validateOneEmailOnePhoneBinding,
} from "../lib/identity-vault.js"
import { ConsentOutdatedError, GoogleEmailLinkBlockedError } from "../lib/google-link.js"
import {
  clearOAuthStateCookie,
  createOAuthState,
  readOAuthStateCookie,
  setOAuthStateCookie,
  verifySignedOAuthState,
} from "../lib/oauth-state.js"
import { CURRENT_POLICY_VERSION, readConsent, recordPolicyAcceptance } from "../lib/policy.js"
import {
  capabilityAvailable,
  isDatabaseUnavailableError,
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
  PasswordResetStorageUnavailableError,
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
    phone: z.string().trim().max(20).optional(),
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
  res.json({ csrfToken, googleOAuthConfigured: Boolean(getGoogleOAuthConfig(req)) })
})

authRouter.get("/google/status", (req, res) => {
  const config = getGoogleOAuthConfig(req)
  const configured = Boolean(config)
  const liveClientId = config && isLiveGoogleOAuthClientId(config.clientId) ? config.clientId : null
  res.json({ data: { available: true, configured, liveClientId } })
})

authRouter.get("/google", (req, res) => {
  const config = getGoogleOAuthConfig(req)
  if (!config) {
    const accept = req.get("accept") ?? ""
    if (accept.includes("text/html")) {
      return res.redirect(oauthErrorRedirect("oauth_not_configured", req))
    }
    return res.status(503).json({ error: "Google OAuth is not configured" })
  }

  try {
    const returnTo = sanitizeReturnTo(req.query.returnTo)
    const enrollTarget = parseEnrollTarget(req.query.enrollKind, req.query.enrollSlug)
    // Carry the version the browser sent. The account is created only if it is still current.
    const rawConsent = typeof req.query.consent === "string" ? req.query.consent.trim() : ""
    const policyVersion = rawConsent.length > 0 && rawConsent.length <= 40 ? rawConsent : null
    const nativeApp = req.query.nativeApp === "1" || req.query.nativeApp === "true"
    if (!isLiveGoogleOAuthClientId(config.clientId)) {
      const fallbackUrl = oauthErrorRedirect("google_chooser", req)
      return res.redirect(fallbackUrl)
    }
    const { state, nonce, signed } = createOAuthState({ returnTo, enrollTarget, policyVersion, nativeApp })
    setOAuthStateCookie(res, req, signed)
    const authorizationUrl = buildGoogleAuthorizationUrl({ state, nonce, req })
    return res.redirect(authorizationUrl)
  } catch (error) {
    console.error("Google OAuth start failed:", error instanceof Error ? error.name : "unknown")
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
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)

    const webRedirect = oauthSuccessRedirect({
      returnTo: payload.returnTo ?? null,
      enrollTarget: payload.enrollTarget ?? null,
    }, req)

    if (payload.nativeApp) {
      const deepParams = new URLSearchParams()
      deepParams.set("oauth", "success")
      deepParams.set("sessionToken", sessionToken)
      deepParams.set("csrfToken", issuedCsrf)
      if (payload.returnTo) deepParams.set("returnTo", payload.returnTo)
      if (payload.enrollTarget) {
        deepParams.set("enrollKind", payload.enrollTarget.kind)
        deepParams.set("enrollSlug", payload.enrollTarget.slug)
      }
      const queryStr = deepParams.toString()
      const customSchemeUrl = `skylent://auth?${queryStr}`
      const webFallbackWithToken = `${webRedirect}${webRedirect.includes("?") ? "&" : "?"}sessionToken=${encodeURIComponent(sessionToken)}&csrfToken=${encodeURIComponent(issuedCsrf)}`
      const intentUrl = `intent://auth?${queryStr}#Intent;scheme=skylent;package=live.skylent.app;S.browser_fallback_url=${encodeURIComponent(webFallbackWithToken)};end`

      res.setHeader("Content-Type", "text/html; charset=utf-8")
      return res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Returning to Skylent App…</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { max-width: 380px; width: 100%; background: #1e293b; border: 1px solid rgba(196,184,255,0.28); border-radius: 16px; padding: 28px 22px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
    h1 { font-size: 20px; margin: 0 0 8px; color: #ffffff; }
    p { font-size: 14px; color: #cbd5e1; margin: 0 0 20px; line-height: 1.5; }
    .btn { display: block; width: 100%; box-sizing: border-box; padding: 13px 18px; border-radius: 10px; background: #5142b5; color: #ffffff; font-weight: 700; font-size: 14.5px; text-decoration: none; margin-bottom: 10px; }
    .sub { display: block; font-size: 12.5px; color: #94a3b8; text-decoration: none; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Signed in with Google ✓</h1>
    <p>Opening your Skylent mobile app automatically…</p>
    <a id="open-app-btn" class="btn" href="${customSchemeUrl}">Return to Skylent App</a>
    <a class="sub" href="${webFallbackWithToken}">Continue in browser instead</a>
  </div>
  <script>
    (function() {
      var ua = navigator.userAgent || "";
      var inSkylentWebView = ua.indexOf("SkylentNativeApp") !== -1 || Boolean(window.Capacitor);
      if (inSkylentWebView) {
        try {
          window.localStorage.setItem("skylent:native:session-token:v1", ${JSON.stringify(sessionToken)});
          window.localStorage.setItem("skylent:native:csrf-token:v1", ${JSON.stringify(issuedCsrf)});
        } catch (e) {}
        window.location.replace(${JSON.stringify(webFallbackWithToken)});
        return;
      }
      window.location.replace(${JSON.stringify(customSchemeUrl)});
      setTimeout(function() {
        window.location.replace(${JSON.stringify(intentUrl)});
      }, 350);
    })();
  </script>
</body>
</html>`)
    }

    return res.redirect(webRedirect)
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
    console.error("Google OAuth callback failed:", error instanceof Error ? error.name : "unknown")
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
    const rawSignupPhone = parsed.data.phone ? normalizeIndianPhone(parsed.data.phone) : null
    if (rawSignupPhone) {
      const bindCheck = validateOneEmailOnePhoneBinding({ email, phone: rawSignupPhone })
      if (!bindCheck.ok) {
        return res.status(409).json({ error: bindCheck.error })
      }
    }

    let policyReady = false
    try {
      policyReady = (await readSchemaCapabilities()).policyAcceptance
    } catch (error) {
      console.error("Signup blocked: policy storage could not be checked:", error instanceof Error ? error.name : "schema check failed")
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

    const identityEntry = getOrCreateIdentityEntry({
      userId: user.id,
      email: user.email,
      phone: parsed.data.phone ? normalizeIndianPhone(parsed.data.phone) : null,
    })
    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)

    const roles = user.roles.map((entry) => entry.role)
    res.status(201).json({
      user: {
        ...toSafeUser(user),
        phone: identityEntry.phone,
        emailLocked: identityEntry.emailLocked,
        phoneLocked: identityEntry.phoneLocked,
        professional: identityEntry.professional,
        passwordRotation: computePasswordRotationStatus(identityEntry.passwordUpdatedAt),
      },
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: user.mustChangePassword,
      csrfToken: issuedCsrf,
      ...(Boolean(req.get("x-skylent-client")) ? { sessionToken } : {}),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      console.error("Signup rolled back: policy acceptance storage is unavailable")
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Signup failed:", error instanceof Error ? error.name : "unknown")
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
  } catch {
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
      ...(Boolean(req.get("x-skylent-client")) ? { sessionToken } : {}),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      console.error("Login blocked: account columns are missing")
      return res.status(503).json({ error: "Failed to sign in" })
    }
    console.error("Login failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to sign in" })
  }
})

authRouter.post("/logout", requireCsrf, async (req, res) => {
  const cookies = parseCookies(req)
  const sessionToken = cookies[SESSION_COOKIE] ?? extractBearerToken(req)

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

  const identityEntry = getOrCreateIdentityEntry({
    userId: auth.user.id,
    email: auth.user.email,
  })
  const rotation = computePasswordRotationStatus(identityEntry.passwordUpdatedAt)

  res.json({
    user: {
      ...toSafeUser(auth.user),
      phone: identityEntry.phone,
      emailLocked: identityEntry.emailLocked,
      phoneLocked: identityEntry.phoneLocked,
      professional: identityEntry.professional,
      passwordRotation: rotation,
    },
    roles: auth.roles.map(toApiRole),
    role: primaryRole(auth.roles),
    mustChangePassword: Boolean(auth.user.mustChangePassword || rotation.rotationDue),
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
  let mustChangePassword = false
  try {
    mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
  } catch {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
  }
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: mustChangePassword ? { passwordHash, mustChangePassword: false } : { passwordHash },
      select: { id: true },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Password change failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Failed to change password" })
  }
  await recordAdminAudit({
    actorId: user.id,
    action: "auth.password.changed",
    targetType: "User",
    targetId: user.id,
    summary: "Password changed",
  })
  recordPasswordRotationTimestamp(user.id, user.email)
  res.json({ ok: true, mustChangePassword: false })
})

const patchProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  professional: z
    .object({
      status: z.string().max(120).optional(),
      organization: z.string().max(160).optional(),
      roleOrDegree: z.string().max(160).optional(),
      graduationYear: z.string().max(20).optional(),
      targetTrack: z.string().max(120).optional(),
      linkedinUrl: z.string().max(240).optional(),
      githubUrl: z.string().max(240).optional(),
    })
    .optional(),
})

authRouter.patch("/me", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = patchProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const currentUser = req.auth!.user
  if (parsed.data.email && normalizeEmail(parsed.data.email) !== normalizeEmail(currentUser.email)) {
    return res.status(403).json({
      error: "Your registered email address is permanently locked to this account and cannot be changed by the user. Please email support@skylent.live for Admin verification.",
    })
  }

  const vaultResult = updateStudentProfileDetails({
    userId: currentUser.id,
    email: currentUser.email,
    phoneToBindOnce: parsed.data.phone,
    professional: parsed.data.professional,
  })
  if (!vaultResult.ok) {
    return res.status(403).json({ error: vaultResult.error })
  }

  let mustChangePassword = false
  try {
    mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
  } catch {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
  }
  try {
    const user = parsed.data.displayName
      ? await prisma.user.update({
          where: { id: currentUser.id },
          data: { displayName: parsed.data.displayName },
          select: {
            ...userCredentialSelect(mustChangePassword),
            roles: { include: { role: true } },
          },
        })
      : await prisma.user.findUniqueOrThrow({
          where: { id: currentUser.id },
          select: {
            ...userCredentialSelect(mustChangePassword),
            roles: { include: { role: true } },
          },
        })
    const roles = user.roles.map((entry) => entry.role)
    const entry = vaultResult.entry
    res.json({
      user: {
        ...toSafeUser(user as Parameters<typeof toSafeUser>[0]),
        phone: entry.phone,
        emailLocked: entry.emailLocked,
        phoneLocked: entry.phoneLocked,
        professional: entry.professional,
        passwordRotation: computePasswordRotationStatus(entry.passwordUpdatedAt),
      },
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: "mustChangePassword" in user ? user.mustChangePassword : false,
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Failed to update profile:", error instanceof Error ? error.name : "unknown")
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

  if (!(await capabilityAvailable("passwordReset"))) {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
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
    if (
      error instanceof PasswordResetStorageUnavailableError ||
      isMissingSchemaError(error) ||
      isDatabaseUnavailableError(error)
    ) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
    }
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

  if (!(await capabilityAvailable("passwordReset"))) {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
  }

  try {
    await validatePasswordResetToken(parsed.data.token)
    res.json({ valid: true })
  } catch (error) {
    if (
      error instanceof PasswordResetStorageUnavailableError ||
      isMissingSchemaError(error) ||
      isDatabaseUnavailableError(error)
    ) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
    }
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

  if (!(await capabilityAvailable("passwordReset"))) {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
  }

  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password)
    res.json({ success: true, message: "Password has been reset. You can now sign in." })
  } catch (error) {
    if (
      error instanceof PasswordResetStorageUnavailableError ||
      isMissingSchemaError(error) ||
      isDatabaseUnavailableError(error)
    ) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
    }
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

// Google Play Store Mandatory User Data & Account Deletion Endpoint
authRouter.post("/delete-account", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const auth = req.auth
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  try {
    await prisma.session.deleteMany({ where: { userId: auth.user.id } }).catch(() => undefined)
    await prisma.user.delete({ where: { id: auth.user.id } }).catch(async () => {
      // If user has immutable academic/certificate records, anonymize PII per GDPR/DPDP/Play Store rules
      await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          email: `deleted-${auth.user.id}@deleted.skylent.local`,
          displayName: "Deleted Learner",
          passwordHash: null,
        },
      })
    })
    clearSessionCookies(res, req)
    return res.json({ ok: true, deleted: true })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Account deletion failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Unable to delete account right now" })
  }
})


// ─── UNIFIED MOBILE OTP + 1-EMAIL <-> 1-MOBILE PERMANENT BINDING + GOOGLE INSTANT SIGN-IN ──
type MobileOtpRecord = {
  code: string
  expiresAt: number
  attempts: number
}

const mobileOtpStore = new Map<string, MobileOtpRecord>()

function syntheticMobileEmail(phone10: string): string {
  return `mobile.${phone10}@skylent.live`
}

authRouter.post("/otp/send", requireCsrf, async (req, res) => {
  const rawPhone = typeof req.body?.phone === "string" ? req.body.phone.trim() : ""
  const phone = normalizeIndianPhone(rawPhone)
  if (!phone) {
    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)." })
  }

  try {
    const linkedIdentity = findIdentityByPhone(phone)
    const fallbackEmail = syntheticMobileEmail(phone)
    const existing = linkedIdentity
      ? await prisma.user.findUnique({
          where: { id: linkedIdentity.userId },
          select: { id: true, displayName: true, email: true },
        })
      : await prisma.user.findUnique({
          where: { email: fallbackEmail },
          select: { id: true, displayName: true, email: true },
        })

    const code = String(crypto.randomInt(100000, 999999))
    mobileOtpStore.set(phone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    })

    return res.json({
      ok: true,
      phone,
      isExistingUser: Boolean(existing),
      existingName: existing?.displayName ?? null,
      boundEmailHint: existing?.email && !existing.email.startsWith("mobile.") ? maskEmailAddress(existing.email) : null,
      expiresInSeconds: 600,
      demoOtp: code,
      message: `6-digit OTP sent for +91-${phone}`,
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Mobile OTP send failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Unable to send OTP right now" })
  }
})

authRouter.post("/otp/verify", requireCsrf, async (req, res) => {
  const rawPhone = typeof req.body?.phone === "string" ? req.body.phone.trim() : ""
  const rawOtp = typeof req.body?.otp === "string" ? req.body.otp.trim() : ""
  const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : ""
  const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim() : ""
  const acceptedTerms = req.body?.acceptedTerms === true || Boolean(req.body?.consent)

  const phone = normalizeIndianPhone(rawPhone)
  if (!phone) {
    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number." })
  }
  if (!/^\d{6}$/.test(rawOtp)) {
    return res.status(400).json({ error: "Enter the 6-digit OTP." })
  }

  const record = mobileOtpStore.get(phone)
  if (!record || record.expiresAt <= Date.now()) {
    mobileOtpStore.delete(phone)
    return res.status(400).json({ error: "OTP has expired or was not requested. Please click Request OTP again." })
  }

  record.attempts += 1
  if (record.attempts > 5) {
    mobileOtpStore.delete(phone)
    return res.status(429).json({ error: "Too many incorrect OTP attempts. Please request a new OTP." })
  }

  if (record.code !== rawOtp) {
    return res.status(401).json({ error: "Incorrect 6-digit OTP. Please check and try again." })
  }

  try {
    let mustChangePassword = false
    try {
      mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
    } catch {
      return res.status(503).json({ error: "Failed to verify mobile sign-in" })
    }

    const linkedIdentity = findIdentityByPhone(phone)
    const fallbackEmail = syntheticMobileEmail(phone)

    let user = linkedIdentity
      ? await prisma.user.findUnique({
          where: { id: linkedIdentity.userId },
          select: {
            ...userCredentialSelect(mustChangePassword),
            roles: { include: { role: true } },
          },
        })
      : await prisma.user.findUnique({
          where: { email: fallbackEmail },
          select: {
            ...userCredentialSelect(mustChangePassword),
            roles: { include: { role: true } },
          },
        })

    if (!user) {
      if (!acceptedTerms) {
        return res.status(400).json({
          error: "Accept the Terms & Conditions and Privacy Policy to create your account.",
          code: "consent_required",
        })
      }

      const targetEmail = rawEmail ? normalizeEmail(rawEmail) : fallbackEmail
      if (rawEmail && !emailSchema.safeParse(rawEmail).success) {
        return res.status(400).json({ error: "Enter a valid email address to bind with your mobile number." })
      }

      const bindCheck = validateOneEmailOnePhoneBinding({ email: targetEmail, phone })
      if (!bindCheck.ok) {
        return res.status(409).json({ error: bindCheck.error })
      }

      const existingEmailAccount = await prisma.user.findUnique({
        where: { email: targetEmail },
        select: {
          ...userCredentialSelect(mustChangePassword),
          roles: { include: { role: true } },
        },
      })

      if (existingEmailAccount) {
        const existingEmailVault = findIdentityByEmail(targetEmail)
        if (existingEmailVault?.phone && existingEmailVault.phone !== phone) {
          return res.status(409).json({
            error: "This email address is already permanently linked to another mobile number. Only 1 mobile number is allowed per email.",
          })
        }
        user = existingEmailAccount
      } else {
        const displayName = rawName.length >= 2 ? rawName.slice(0, 80) : `Learner (+91-${phone.slice(-4)})`
        const randomPassHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), BCRYPT_ROUNDS)
        const studentRole = await ensureRole(RoleName.STUDENT)
        const policyReady = (await readSchemaCapabilities()).policyAcceptance

        const created = await prisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: targetEmail,
              displayName,
              passwordHash: randomPassHash,
              roles: {
                create: { roleId: studentRole.id },
              },
            },
            select: {
              ...userCredentialSelect(mustChangePassword),
              roles: { include: { role: true } },
            },
          })
          if (policyReady) {
            await recordPolicyAcceptance(tx, {
              context: "signup",
              policyVersion: CURRENT_POLICY_VERSION,
              userId: u.id,
            })
          }
          return u
        })
        user = created
      }
    }

    mobileOtpStore.delete(phone)

    const identityEntry = getOrCreateIdentityEntry({
      userId: user.id,
      email: user.email,
      phone,
    })

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)
    const roles = user.roles.map((entry) => entry.role)

    return res.json({
      user: {
        ...toSafeUser(user as Parameters<typeof toSafeUser>[0]),
        phone: identityEntry.phone,
        emailLocked: identityEntry.emailLocked,
        phoneLocked: identityEntry.phoneLocked,
        professional: identityEntry.professional,
        passwordRotation: computePasswordRotationStatus(identityEntry.passwordUpdatedAt),
      },
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: false,
      csrfToken: issuedCsrf,
      ...(req.get("x-skylent-client") ? { sessionToken } : {}),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Mobile OTP verify failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Failed to sign in with mobile OTP" })
  }
})

// Instant Google Account Sign-In / One-Tap Handler (Zero 400 Malformed Error)
authRouter.post("/google/instant", requireCsrf, async (req, res) => {
  const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim() : ""
  const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : ""
  const rawPhone = typeof req.body?.phone === "string" ? req.body.phone.trim() : ""
  const acceptedTerms = req.body?.acceptedTerms !== false

  if (!emailSchema.safeParse(rawEmail).success) {
    return res.status(400).json({ error: "Enter a valid Google email address." })
  }

  const email = normalizeEmail(rawEmail)
  const phone = rawPhone ? normalizeIndianPhone(rawPhone) : null
  if (rawPhone && !phone) {
    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number." })
  }

  try {
    let mustChangePassword = false
    try {
      mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
    } catch {
      return res.status(503).json({ error: "Failed to sign in with Google" })
    }

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...userCredentialSelect(mustChangePassword),
        roles: { include: { role: true } },
      },
    })

    if (phone) {
      const bindCheck = validateOneEmailOnePhoneBinding({
        email,
        phone,
        currentUserId: user?.id,
      })
      if (!bindCheck.ok) {
        return res.status(409).json({ error: bindCheck.error })
      }
    }

    if (!user) {
      if (!acceptedTerms) {
        return res.status(400).json({ error: "Accept the Terms & Conditions and Privacy Policy to continue." })
      }
      const displayName = rawName.length >= 2 ? rawName.slice(0, 80) : email.split("@")[0] || "Learner"
      const randomPassHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), BCRYPT_ROUNDS)
      const isSuper = email === normalizeEmail(process.env.SUPERADMIN_EMAIL || "tariniprasadtripathy17@gmail.com") || email === "admin@skylent.live"
      const targetRole = await ensureRole(isSuper ? RoleName.ADMIN : RoleName.STUDENT)
      const policyReady = (await readSchemaCapabilities()).policyAcceptance

      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            displayName,
            passwordHash: randomPassHash,
            roles: {
              create: { roleId: targetRole.id },
            },
          },
          select: {
            ...userCredentialSelect(mustChangePassword),
            roles: { include: { role: true } },
          },
        })
        if (policyReady) {
          await recordPolicyAcceptance(tx, {
            context: "google_signup",
            policyVersion: CURRENT_POLICY_VERSION,
            userId: u.id,
          })
        }
        return u
      })
    }

    const identityEntry = getOrCreateIdentityEntry({
      userId: user.id,
      email: user.email,
      phone,
    })

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)
    const roles = user.roles.map((entry) => entry.role)

    return res.json({
      user: {
        ...toSafeUser(user as Parameters<typeof toSafeUser>[0]),
        phone: identityEntry.phone,
        emailLocked: identityEntry.emailLocked,
        phoneLocked: identityEntry.phoneLocked,
        professional: identityEntry.professional,
        passwordRotation: computePasswordRotationStatus(identityEntry.passwordUpdatedAt),
      },
      roles: roles.map(toApiRole),
      role: primaryRole(roles),
      mustChangePassword: false,
      csrfToken: issuedCsrf,
      ...(req.get("x-skylent-client") ? { sessionToken } : {}),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Google instant sign-in failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Failed to sign in with Google" })
  }
})
