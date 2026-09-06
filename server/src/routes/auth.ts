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
