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
  ensureEmailConfigHydrated,
  isEmailConfigured,
  isSmsGatewayConfigured,
  sendEmail,
  sendSmsOtp,
  buildLoginOtpEmail,
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
    emailOtp: z.string().trim().optional(),
    requireEmailOtp: z.boolean().optional(),
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

// ─── Email & Mobile OTP Store (HMAC-SHA256 hashed, 10-min expiry) ──
type OtpRecord = {
  codeHash: string
  email: string
  expiresAt: number
  attempts: number
}

const emailOtpStore = new Map<string, OtpRecord>()
const mobileOtpStore = new Map<string, OtpRecord>()

function hashOtpCode(target: string, code: string): string {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "skylent-otp-secret")
    .update(`${target.toLowerCase()}:${code}`)
    .digest("hex")
}

authRouter.get("/csrf", (req, res) => {
  const existing = parseCookies(req)[CSRF_COOKIE]
  const csrfToken = existing || generateCsrfToken()
  res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions(req))
  res.json({ csrfToken, googleOAuthConfigured: Boolean(getGoogleOAuthConfig(req)) })
})

authRouter.get("/google/status", (req, res) => {
  const configured = Boolean(getGoogleOAuthConfig(req))
  res.json({ data: { available: configured, configured } })
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
    const rawConsent = typeof req.query.consent === "string" ? req.query.consent.trim() : ""
    const policyVersion = rawConsent.length > 0 && rawConsent.length <= 40 ? rawConsent : null
    const nativeApp = req.query.nativeApp === "1" || req.query.nativeApp === "true"
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

// ─── Send 6-Digit Email OTP (For Signup Verification or Passwordless Login) ──
authRouter.post("/email-otp/send", requireCsrf, async (req, res) => {
  const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim() : ""
  const purpose = req.body?.purpose === "signup" ? "signup" : "login"
  const parsedEmail = emailSchema.safeParse(rawEmail)
  if (!parsedEmail.success) {
    return res.status(400).json({ error: "Enter a valid email address." })
  }
  const email = normalizeEmail(parsedEmail.data)

  try {
    await ensureEmailConfigHydrated()
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, displayName: true },
    })

    if (purpose === "signup" && existing) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in instead.",
      })
    }

    const code = String(crypto.randomInt(100000, 999999))
    emailOtpStore.set(email, {
      codeHash: hashOtpCode(email, code),
      email,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    })

    if (!isEmailConfigured()) {
      return res.status(503).json({
        error: "Email OTP service is not configured on this server yet. Please sign in with Email & Password or Google.",
      })
    }

    const otpMail = buildLoginOtpEmail(code, email)
    await sendEmail({
      to: email,
      ...otpMail,
    })

    return res.json({
      ok: true,
      email,
      isExistingUser: Boolean(existing),
      existingName: existing?.displayName ?? null,
      expiresInSeconds: 600,
      message: `6-digit verification code sent to ${email} from Skylent <noreply@skylent.live>.`,
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
    }
    console.error("Email OTP send failed:", error instanceof Error ? error.name : "unknown")
    return res.status(502).json({
      error: "Unable to send verification email right now. Please check your email address and try again.",
    })
  }
})

// ─── Verify 6-Digit Email OTP for Sign-In ──
authRouter.post("/email-otp/verify", requireCsrf, async (req, res) => {
  const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim() : ""
  const rawOtp = typeof req.body?.otp === "string" ? req.body.otp.trim() : ""
  const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : ""
  const acceptedTerms = req.body?.acceptedTerms === true || Boolean(req.body?.consent)

  const parsedEmail = emailSchema.safeParse(rawEmail)
  if (!parsedEmail.success) {
    return res.status(400).json({ error: "Enter a valid email address." })
  }
  if (!/^\d{6}$/.test(rawOtp)) {
    return res.status(400).json({ error: "Enter the 6-digit OTP sent to your email." })
  }

  const email = normalizeEmail(parsedEmail.data)
  const record = emailOtpStore.get(email)
  if (!record || record.expiresAt <= Date.now()) {
    emailOtpStore.delete(email)
    return res.status(400).json({ error: "OTP has expired or was not requested. Please request a new OTP." })
  }

  record.attempts += 1
  if (record.attempts > 5) {
    emailOtpStore.delete(email)
    return res.status(429).json({ error: "Too many incorrect OTP attempts. Please request a new OTP." })
  }

  if (record.codeHash !== hashOtpCode(email, rawOtp)) {
    return res.status(401).json({ error: "Incorrect 6-digit OTP. Please check your email inbox and try again." })
  }

  emailOtpStore.delete(email)

  try {
    let mustChangePassword = false
    try {
      mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
    } catch {
      return res.status(503).json({ error: "Failed to verify email sign-in" })
    }

    let user = await prisma.user.findUnique({
      where: { email },
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
      const displayName = rawName.length >= 2 ? rawName.slice(0, 80) : email.split("@")[0] || "Learner"
      const randomPassHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), BCRYPT_ROUNDS)
      const studentRole = await ensureRole(RoleName.STUDENT)
      const policyReady = (await readSchemaCapabilities()).policyAcceptance

      const created = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
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

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)
    const roles = user.roles.map((entry) => entry.role)

    return res.json({
      user: toSafeUser(user as Parameters<typeof toSafeUser>[0]),
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
    console.error("Email OTP verify failed:", error instanceof Error ? error.name : "unknown")
    return res.status(500).json({ error: "Failed to sign in with email OTP" })
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

  // Verify Email OTP when required by the Signup UI (anti-spam email verification)
  if (parsed.data.requireEmailOtp || parsed.data.emailOtp !== undefined) {
    const rawOtp = (parsed.data.emailOtp ?? "").trim()
    if (!/^\d{6}$/.test(rawOtp)) {
      return res.status(400).json({ error: "Enter the 6-digit verification OTP sent to your email." })
    }
    const record = emailOtpStore.get(email)
    if (!record || record.expiresAt <= Date.now()) {
      emailOtpStore.delete(email)
      return res.status(400).json({ error: "Email verification OTP has expired. Please click Send OTP again." })
    }
    record.attempts += 1
    if (record.attempts > 5) {
      emailOtpStore.delete(email)
      return res.status(429).json({ error: "Too many incorrect OTP attempts. Please request a new OTP." })
    }
    if (record.codeHash !== hashOtpCode(email, rawOtp)) {
      return res.status(400).json({ error: "Incorrect 6-digit OTP. Please check your email inbox and try again." })
    }
    emailOtpStore.delete(email)
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" })
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

  let mustChangePassword = false
  try {
    mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
  } catch {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.accounts))
  }
  try {
    const user = await prisma.user.update({
      where: { id: req.auth!.user.id },
      data: { displayName: parsed.data.displayName },
      select: {
        ...userCredentialSelect(mustChangePassword),
        roles: { include: { role: true } },
      },
    })
    const roles = user.roles.map((entry) => entry.role)
    res.json({
      user: toSafeUser(user as Parameters<typeof toSafeUser>[0]),
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
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many password reset attempts. Try again later." })
  },
})

const passwordResetRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
})

function resolveResetFrontendOrigin(req: import("express").Request): string {
  const configured = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "")
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured
  }
  const host = (req.hostname || "").toLowerCase()
  if (host === "skylent.live" || host === "www.skylent.live" || process.env.NODE_ENV === "production") {
    return "https://skylent.live"
  }
  return configured || "http://localhost:8443"
}

authRouter.post("/password-reset/request", passwordResetRateLimit, async (req, res) => {
  const parsed = passwordResetRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  if (!(await capabilityAvailable("passwordReset"))) {
    return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.passwordReset))
  }

  try {
    await ensureEmailConfigHydrated()
    const result = await createPasswordResetToken(parsed.data.email)

    if (result && isEmailConfigured()) {
      const frontendUrl = resolveResetFrontendOrigin(req)
      const resetUrl = `${frontendUrl}/reset-password?token=${result.token}`
      const emailContent = buildPasswordResetEmail(resetUrl)

      try {
        await sendEmail({
          to: normalizeEmail(parsed.data.email),
          ...emailContent,
        })
      } catch {
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

authRouter.get("/password-reset/config", async (_req, res) => {
  await ensureEmailConfigHydrated()
  res.json({
    emailConfigured: isEmailConfigured(),
    message: isEmailConfigured()
      ? "Password reset emails are enabled."
      : "Password reset emails are not configured. Contact an administrator.",
  })
})

authRouter.post("/delete-account", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const auth = req.auth
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  try {
    await prisma.session.deleteMany({ where: { userId: auth.user.id } }).catch(() => undefined)
    await prisma.user.delete({ where: { id: auth.user.id } }).catch(async () => {
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

function normalizeIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    return digits.slice(2)
  }
  return null
}

function syntheticMobileEmail(phone10: string): string {
  return `mobile.${phone10}@skylent.live`
}

authRouter.post("/otp/send", requireCsrf, async (req, res) => {
  const rawPhone = typeof req.body?.phone === "string" ? req.body.phone.trim() : ""
  const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
  const phone = normalizeIndianMobile(rawPhone)
  if (!phone) {
    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number." })
  }

  try {
    await ensureEmailConfigHydrated()
    const mobileEmail = syntheticMobileEmail(phone)
    const existing = await prisma.user.findUnique({
      where: { email: rawEmail || mobileEmail },
      select: { id: true, displayName: true, email: true },
    })

    const code = String(crypto.randomInt(100000, 999999))
    const deliveryEmail = rawEmail || (existing && !existing.email.endsWith("@skylent.live") ? existing.email : "")

    mobileOtpStore.set(phone, {
      codeHash: hashOtpCode(phone, code),
      email: deliveryEmail || mobileEmail,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    })

    const channels: string[] = []
    if (isSmsGatewayConfigured()) {
      try {
        const smsRes = await sendSmsOtp(phone, code)
        if (smsRes.sent) channels.push(`SMS (+91-${phone})`)
      } catch {
        // fallback to email
      }
    }
    if (deliveryEmail && isEmailConfigured()) {
      try {
        const otpMail = buildLoginOtpEmail(code, deliveryEmail)
        await sendEmail({ to: deliveryEmail, ...otpMail })
        channels.push(`Email (${deliveryEmail})`)
      } catch {
        // ignore
      }
    }

    if (channels.length === 0) {
      return res.status(503).json({
        error: "Unable to deliver OTP right now. Please use Email OTP or Email & Password.",
      })
    }

    return res.json({
      ok: true,
      phone,
      isExistingUser: Boolean(existing),
      existingName: existing?.displayName ?? null,
      expiresInSeconds: 600,
      channels,
      message: `6-digit OTP sent to ${channels.join(" and ")}.`,
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
  const acceptedTerms = req.body?.acceptedTerms === true || Boolean(req.body?.consent)

  const phone = normalizeIndianMobile(rawPhone)
  if (!phone || !/^\d{6}$/.test(rawOtp)) {
    return res.status(400).json({ error: "Enter a valid mobile number and 6-digit OTP." })
  }

  const record = mobileOtpStore.get(phone)
  if (!record || record.expiresAt <= Date.now()) {
    mobileOtpStore.delete(phone)
    return res.status(400).json({ error: "OTP has expired. Please request a new OTP." })
  }

  record.attempts += 1
  if (record.attempts > 5) {
    mobileOtpStore.delete(phone)
    return res.status(429).json({ error: "Too many incorrect OTP attempts." })
  }

  if (record.codeHash !== hashOtpCode(phone, rawOtp)) {
    return res.status(401).json({ error: "Incorrect 6-digit OTP." })
  }

  const verifiedEmail = record.email || syntheticMobileEmail(phone)
  mobileOtpStore.delete(phone)

  try {
    let mustChangePassword = false
    try {
      mustChangePassword = (await readSchemaCapabilities()).userMustChangePassword
    } catch {
      return res.status(503).json({ error: "Failed to verify sign-in" })
    }

    let user = await prisma.user.findUnique({
      where: { email: verifiedEmail },
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
      const displayName = rawName.length >= 2 ? rawName.slice(0, 80) : `Learner (+91-${phone.slice(-4)})`
      const randomPassHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), BCRYPT_ROUNDS)
      const studentRole = await ensureRole(RoleName.STUDENT)
      const policyReady = (await readSchemaCapabilities()).policyAcceptance

      const created = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email: verifiedEmail,
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

    const { sessionToken, csrfToken } = await createSession(user.id)
    const issuedCsrf = setSessionCookies(res, req, sessionToken, csrfToken)
    const roles = user.roles.map((entry) => entry.role)

    return res.json({
      user: toSafeUser(user as Parameters<typeof toSafeUser>[0]),
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
    return res.status(500).json({ error: "Failed to sign in with OTP" })
  }
})
