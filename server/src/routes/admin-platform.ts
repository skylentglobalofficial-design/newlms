import { Router } from "express"
import { z } from "zod"
import { ElixirActivity, VerifiedPaymentStatus } from "@prisma/client"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { recordAdminAudit } from "../lib/admin-audit.js"
import { readAiDiagnostics } from "../lib/ai-diagnostics.js"
import {
  ElixirRuleError,
  InsufficientElixirError,
  adjustElixir,
  elixirReady,
  listElixirTransactions,
  reconcileElixir,
  recordVerifiedPayment,
  refundVerifiedPayment,
  updateRewardRule,
} from "../lib/elixir.js"
import { prisma } from "../lib/prisma.js"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"

export const adminPlatformRouter = Router()

export function computeExecutiveUnitEconomics(input: {
  users: number
  enrolments: number
  elixirIssued: number
  elixirSpent: number
  elixirUnrecovered: number
}) {
  const activationRatePercent = input.users > 0 ? Math.min(100, Math.round((input.enrolments / input.users) * 100)) : 0
  const elixirRedemptionRatePercent = input.elixirIssued > 0 ? Math.min(100, Math.round((input.elixirSpent / input.elixirIssued) * 100)) : 0
  const netUnredeemedElixirLiability = Math.max(0, input.elixirIssued - input.elixirSpent - input.elixirUnrecovered)
  return {
    activationRatePercent,
    elixirRedemptionRatePercent,
    netUnredeemedElixirLiability,
  }
}

const guards = [requireAuth, requireRoles("superadmin")] as const
const writeGuards = [...guards, requireCsrf] as const

const unavailable = { error: "Elixir is not available until the database update is applied.", code: "unavailable" as const }

const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const activitySchema = z.enum(["lesson_complete", "quiz_complete", "quiz_score", "assignment_complete", "case_study_complete"])
const paymentStatusSchema = z.enum(["pending", "succeeded", "failed", "cancelled", "refunded"])

function ruleError(res: import("express").Response, error: unknown) {
  if (error instanceof ElixirRuleError) return res.status(400).json({ error: error.message })
  if (error instanceof InsufficientElixirError) return res.status(409).json({ error: error.message })
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) return res.status(503).json(unavailable)
  console.error("Elixir admin action failed:", error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: "The Elixir action could not be completed" })
}

adminPlatformRouter.get("/ai", ...guards, (_req, res) => {
  res.json({ data: readAiDiagnostics() })
})

adminPlatformRouter.get("/audit", ...guards, async (_req, res) => {
  try {
    const rows = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { actor: { select: { email: true, displayName: true } } },
    })
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        summary: row.summary,
        createdAt: row.createdAt.toISOString(),
        actor: row.actor ? { email: row.actor.email, displayName: row.actor.displayName } : null,
      })),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Audit log is not available until the database update is applied.", code: "unavailable" })
    }
    console.error("Audit log read failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load audit log" })
  }
})

adminPlatformRouter.get("/catalogue", ...guards, async (_req, res) => {
  try {
    const [courses, programs, enrolmentCount] = await Promise.all([
      prisma.course.findMany({
        orderBy: { title: "asc" },
        select: { slug: true, title: true, _count: { select: { enrollments: true, curriculum: true } } },
      }),
      prisma.program.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true, enrollmentStatus: true, _count: { select: { enrollments: true, programCourses: true } } },
      }),
      prisma.userEnrollment.count(),
    ])
    res.json({
      data: {
        enrolmentCount,
        courses: courses.map((course) => ({
          slug: course.slug,
          title: course.title,
          enrolments: course._count.enrollments,
          modules: course._count.curriculum,
        })),
        programs: programs.map((program) => ({
          slug: program.slug,
          name: program.name,
          enrollmentStatus: program.enrollmentStatus,
          enrolments: program._count.enrollments,
          linkedCourses: program._count.programCourses,
        })),
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) return res.status(503).json(unavailable)
    console.error("Failed to load admin catalogue:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load catalogue summary" })
  }
})

adminPlatformRouter.get("/enrolments", ...guards, async (req, res) => {
  const parsedLimit = z.coerce.number().int().min(1).max(50).safeParse(req.query.limit)
  const limit = parsedLimit.success ? parsedLimit.data : 25
  try {
    const rows = await prisma.userEnrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, email: true, displayName: true } },
        course: { select: { slug: true, title: true } },
        program: { select: { slug: true, name: true } },
      },
    })
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        user: row.user,
        course: row.course,
        program: row.program,
      })),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) return res.status(503).json(unavailable)
    console.error("Failed to list admin enrolments:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to list enrolments" })
  }
})

adminPlatformRouter.get("/reports", ...guards, async (_req, res) => {
  try {
    if (!(await elixirReady().catch(() => false))) {
      const [users, enrolments] = await Promise.all([prisma.user.count(), prisma.userEnrollment.count()])
      return res.json({ data: { users, enrolments, elixir: null } })
    }
    const [users, enrolments, issued, spent, shortfall, payments] = await Promise.all([
      prisma.user.count(),
      prisma.userEnrollment.count(),
      prisma.elixirTransaction.aggregate({ where: { amount: { gt: 0 } }, _sum: { amount: true } }),
      prisma.elixirTransaction.aggregate({ where: { type: "resource_spend" }, _sum: { amount: true } }),
      prisma.elixirTransaction.aggregate({ _sum: { unrecovered: true } }),
      prisma.verifiedPayment.groupBy({ by: ["status"], _count: { _all: true }, _sum: { eligibleNetRupees: true, elixirAwarded: true } }),
    ])
    res.json({
      data: {
        users,
        enrolments,
        unitEconomics: computeExecutiveUnitEconomics({
          users,
          enrolments,
          elixirIssued: issued._sum.amount ?? 0,
          elixirSpent: Math.abs(spent._sum.amount ?? 0),
          elixirUnrecovered: shortfall._sum.unrecovered ?? 0,
        }),
        elixir: {
          issued: issued._sum.amount ?? 0,
          spent: Math.abs(spent._sum.amount ?? 0),
          unrecovered: shortfall._sum.unrecovered ?? 0,
          payments: payments.map((row) => ({
            status: row.status,
            count: row._count._all,
            eligibleNetRupees: row._sum.eligibleNetRupees ?? 0,
            elixirAwarded: row._sum.elixirAwarded ?? 0,
          })),
        },
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) return res.status(503).json(unavailable)
    console.error("Failed to load admin reports:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load reports" })
  }
})

adminPlatformRouter.use("/elixir", async (_req, res, next) => {
  if (await elixirReady().catch(() => false)) {
    next()
    return
  }
  res.status(503).json(unavailable)
})

adminPlatformRouter.get("/elixir/rules", ...guards, async (_req, res) => {
  try {
    const rules = await prisma.elixirRewardRule.findMany({ orderBy: { activity: "asc" } })
    res.json({ data: rules })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.patch("/elixir/rules/:activity", ...writeGuards, async (req: AuthenticatedRequest, res) => {
  const activity = activitySchema.safeParse(req.params.activity)
  const body = z.object({
    amount: z.number().int(),
    enabled: z.boolean(),
    quizScorePercent: z.number().int().nullable().optional(),
    cooldownSeconds: z.number().int().default(0),
  }).safeParse(req.body)
  if (!activity.success || !body.success) return res.status(400).json({ error: "Invalid reward rule" })
  try {
    const rule = await updateRewardRule({
      activity: activity.data as ElixirActivity,
      amount: body.data.amount,
      enabled: body.data.enabled,
      quizScorePercent: body.data.quizScorePercent ?? null,
      cooldownSeconds: body.data.cooldownSeconds,
      actorId: req.auth!.user.id,
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "elixir.rule.update",
      targetType: "ElixirRewardRule",
      targetId: rule.id,
      summary: `${rule.activity} amount ${rule.amount} enabled ${rule.enabled}`,
    })
    res.json({ data: rule })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.get("/elixir/users/:userId", ...guards, async (req, res) => {
  const userId = z.string().uuid().safeParse(req.params.userId)
  if (!userId.success) return res.status(400).json({ error: "Invalid user" })
  try {
    const user = await prisma.user.findUnique({ where: { id: userId.data }, select: { id: true, email: true, displayName: true } })
    if (!user) return res.status(404).json({ error: "User not found" })
    const [reconciliation, transactions] = await Promise.all([
      reconcileElixir(user.id),
      listElixirTransactions(user.id, 50),
    ])
    res.json({
      data: {
        user,
        ...reconciliation,
        transactions: transactions.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      },
    })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.post("/elixir/adjustments", ...writeGuards, async (req: AuthenticatedRequest, res) => {
  const body = z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string(),
    idempotencyKey: z.string().uuid(),
  }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: "Invalid adjustment" })
  try {
    const written = await adjustElixir({ ...body.data, actorId: req.auth!.user.id })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "elixir.adjust",
      targetType: "User",
      targetId: body.data.userId,
      summary: `${body.data.amount} Elixir. ${body.data.reason.trim()}`,
    })
    res.status(written.duplicate ? 200 : 201).json({
      data: { id: written.transaction.id, amount: written.transaction.amount, duplicate: written.duplicate, balance: written.balance },
    })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.post("/payments", ...writeGuards, async (req: AuthenticatedRequest, res) => {
  const body = z.object({
    userId: z.string().uuid(),
    externalRef: z.string().trim().min(4).max(120),
    eligibleNetRupees: z.number().int().nonnegative(),
    status: paymentStatusSchema,
  }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: "Invalid payment record" })
  if (!(await elixirReady().catch(() => false))) return res.status(503).json(unavailable)
  try {
    const learner = await prisma.user.findUnique({ where: { id: body.data.userId }, select: { id: true } })
    if (!learner) return res.status(404).json({ error: "User not found" })
    const result = await recordVerifiedPayment({
      ...body.data,
      status: body.data.status as VerifiedPaymentStatus,
      recordedById: req.auth!.user.id,
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "payment.record",
      targetType: "VerifiedPayment",
      targetId: result.payment.id,
      summary: `${result.payment.status} net ${result.payment.eligibleNetRupees} rupees, awarded ${result.payment.elixirAwarded}`,
    })
    res.status(result.duplicate ? 200 : 201).json({
      data: {
        id: result.payment.id,
        status: result.payment.status,
        eligibleNetRupees: result.payment.eligibleNetRupees,
        elixirAwarded: result.payment.elixirAwarded,
        duplicate: result.duplicate,
      },
    })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.post("/payments/:id/refund", ...writeGuards, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid payment" })
  if (!(await elixirReady().catch(() => false))) return res.status(503).json(unavailable)
  try {
    const result = await refundVerifiedPayment(id.data, req.auth!.user.id)
    if (!result) return res.status(404).json({ error: "Payment not found" })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "payment.refund",
      targetType: "VerifiedPayment",
      targetId: result.payment.id,
      summary: result.reversal
        ? `Refunded. Reversed ${Math.abs(result.reversal.amount)} Elixir, unrecovered ${result.reversal.unrecovered}`
        : "Refunded with no Elixir award to reverse",
    })
    res.json({
      data: {
        id: result.payment.id,
        status: result.payment.status,
        duplicate: result.duplicate,
        reversed: result.reversal ? Math.abs(result.reversal.amount) : 0,
        unrecovered: result.reversal?.unrecovered ?? 0,
      },
    })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.get("/resources", ...guards, async (_req, res) => {
  if (!(await elixirReady().catch(() => false))) return res.status(503).json(unavailable)
  try {
    const rows = await prisma.learningResource.findMany({ orderBy: { title: "asc" } })
    res.json({ data: rows })
  } catch (error) {
    ruleError(res, error)
  }
})

adminPlatformRouter.post("/resources", ...writeGuards, async (req: AuthenticatedRequest, res) => {
  const body = z.object({
    slug: slugSchema,
    kind: z.enum(["notes", "case_study"]),
    title: z.string().trim().min(2).max(160),
    summary: z.string().trim().max(500).optional(),
    elixirPrice: z.number().int().nonnegative(),
    published: z.boolean().default(false),
    courseSlug: slugSchema.optional(),
    lessonKey: slugSchema.optional(),
  }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: "Invalid resource" })
  if (!(await elixirReady().catch(() => false))) return res.status(503).json(unavailable)
  try {
    const resource = await prisma.learningResource.create({
      data: {
        slug: body.data.slug,
        kind: body.data.kind,
        title: body.data.title,
        summary: body.data.summary ?? null,
        elixirPrice: body.data.elixirPrice,
        published: body.data.published,
        courseSlug: body.data.courseSlug ?? null,
        lessonKey: body.data.lessonKey ?? null,
      },
    })
    await recordAdminAudit({
      actorId: req.auth!.user.id,
      action: "resource.create",
      targetType: "LearningResource",
      targetId: resource.id,
      summary: `${resource.kind} ${resource.slug} costs ${resource.elixirPrice} Elixir`,
    })
    res.status(201).json({ data: resource })
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      return res.status(409).json({ error: "A resource with that slug already exists" })
    }
    ruleError(res, error)
  }
})
