import { Prisma, type ElixirActivity, type ElixirTransactionType, type VerifiedPaymentStatus } from "@prisma/client"
import { prisma } from "./prisma.js"

/** Founder rule: every eligible ₹100 of net purchase value earns 10 Elixir. */
export const RUPEES_PER_ELIXIR = 10

const READY_CACHE_MS = 20_000
let readyCache: { at: number; ready: boolean } | null = null

export class InsufficientElixirError extends Error {
  constructor() {
    super("Not enough Elixir")
    this.name = "InsufficientElixirError"
  }
}

export class ElixirRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ElixirRuleError"
  }
}

type Tx = Prisma.TransactionClient

export function elixirForNetRupees(eligibleNetRupees: number): number {
  if (!Number.isInteger(eligibleNetRupees) || eligibleNetRupees <= 0) return 0
  return Math.floor(eligibleNetRupees / RUPEES_PER_ELIXIR)
}

export function clearElixirReadyCache() {
  readyCache = null
}

export async function elixirReady(): Promise<boolean> {
  if (readyCache && Date.now() - readyCache.at < READY_CACHE_MS) return readyCache.ready
  const rows = await prisma.$queryRaw<Array<{ present: boolean }>>`
    SELECT to_regclass('"ElixirAccount"') IS NOT NULL AS present`
  const ready = Boolean(rows[0]?.present)
  readyCache = { at: Date.now(), ready }
  return ready
}

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

async function ensureAccount(tx: Tx, userId: string) {
  await tx.elixirAccount.upsert({
    where: { userId },
    create: { userId, balance: 0 },
    update: {},
  })
}

async function applyAmount(tx: Tx, userId: string, amount: number): Promise<number> {
  await ensureAccount(tx, userId)
  if (amount < 0) {
    const locked = await tx.elixirAccount.update({
      where: { userId },
      data: { balance: { increment: 0 } },
    })
    if (locked.balance + amount < 0) throw new InsufficientElixirError()
  }
  const row = await tx.elixirAccount.update({
    where: { userId },
    data: { balance: { increment: amount } },
  })
  return row.balance
}

type LedgerInput = {
  userId: string
  amount: number
  type: ElixirTransactionType
  idempotencyKey: string
  sourceType?: string | null
  sourceId?: string | null
  activity?: ElixirActivity | null
  note?: string | null
  actorId?: string | null
  reversalOfId?: string | null
  unrecovered?: number
}

async function writeLedger(tx: Tx, input: LedgerInput) {
  const existing = await tx.elixirTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } })
  if (existing) return { transaction: existing, duplicate: true, balance: null as number | null }
  const balance = await applyAmount(tx, input.userId, input.amount)
  const transaction = await tx.elixirTransaction.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      activity: input.activity ?? null,
      note: input.note ?? null,
      actorId: input.actorId ?? null,
      reversalOfId: input.reversalOfId ?? null,
      unrecovered: input.unrecovered ?? 0,
    },
  })
  return { transaction, duplicate: false, balance }
}

export async function reconcileElixir(userId: string) {
  const [account, sum] = await Promise.all([
    prisma.elixirAccount.findUnique({ where: { userId }, select: { balance: true } }),
    prisma.elixirTransaction.aggregate({ where: { userId }, _sum: { amount: true } }),
  ])
  const balance = account?.balance ?? 0
  const ledgerSum = sum._sum.amount ?? 0
  return { balance, ledgerSum, consistent: balance === ledgerSum }
}

export async function listElixirTransactions(userId: string, limit = 30) {
  return prisma.elixirTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      amount: true,
      type: true,
      activity: true,
      sourceType: true,
      sourceId: true,
      note: true,
      unrecovered: true,
      createdAt: true,
    },
  })
}

export async function recordVerifiedPayment(input: {
  userId: string
  externalRef: string
  eligibleNetRupees: number
  status: VerifiedPaymentStatus
  recordedById: string | null
}) {
  if (!Number.isInteger(input.eligibleNetRupees) || input.eligibleNetRupees < 0) {
    throw new ElixirRuleError("Eligible net rupees must be a non-negative whole number")
  }
  const existing = await prisma.verifiedPayment.findUnique({ where: { externalRef: input.externalRef } })
  if (existing) return { payment: existing, duplicate: true }

  const award = input.status === "succeeded" ? elixirForNetRupees(input.eligibleNetRupees) : 0
  try {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.verifiedPayment.create({
        data: {
          userId: input.userId,
          externalRef: input.externalRef,
          eligibleNetRupees: input.eligibleNetRupees,
          status: input.status,
          elixirAwarded: award,
          recordedById: input.recordedById,
        },
      })
      if (award > 0) {
        await writeLedger(tx, {
          userId: input.userId,
          amount: award,
          type: "purchase_reward",
          idempotencyKey: `purchase:${input.externalRef}`,
          sourceType: "verified_payment",
          sourceId: payment.id,
          actorId: input.recordedById,
          note: `Verified net purchase of ${input.eligibleNetRupees} rupees`,
        })
      }
      return { payment, duplicate: false }
    })
  } catch (error) {
    if (!isUniqueConflict(error)) throw error
    const payment = await prisma.verifiedPayment.findUnique({ where: { externalRef: input.externalRef } })
    if (!payment) throw error
    return { payment, duplicate: true }
  }
}

async function reverseAward(tx: Tx, idempotencyKey: string, actorId: string) {
  const original = await tx.elixirTransaction.findUnique({ where: { idempotencyKey } })
  if (!original || original.amount <= 0) return null
  const reversalKey = `reversal:${original.idempotencyKey}`
  const existing = await tx.elixirTransaction.findUnique({ where: { idempotencyKey: reversalKey } })
  if (existing) return existing
  await ensureAccount(tx, original.userId)
  const locked = await tx.elixirAccount.update({
    where: { userId: original.userId },
    data: { balance: { increment: 0 } },
  })
  const clawback = Math.min(original.amount, Math.max(0, locked.balance))
  const unrecovered = original.amount - clawback
  if (clawback > 0) {
    await tx.elixirAccount.update({
      where: { userId: original.userId },
      data: { balance: { decrement: clawback } },
    })
  }
  return tx.elixirTransaction.create({
    data: {
      userId: original.userId,
      amount: -clawback,
      type: "reversal",
      idempotencyKey: reversalKey,
      sourceType: original.sourceType,
      sourceId: original.sourceId,
      note: unrecovered > 0 ? `Reversed ${clawback} Elixir; ${unrecovered} was already spent` : `Reversed ${clawback} Elixir`,
      actorId,
      reversalOfId: original.id,
      unrecovered,
    },
  })
}

export async function refundVerifiedPayment(paymentId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.verifiedPayment.findUnique({ where: { id: paymentId } })
    if (!payment) return null
    if (payment.status === "refunded") {
      const reversal = await tx.elixirTransaction.findUnique({
        where: { idempotencyKey: `reversal:purchase:${payment.externalRef}` },
      })
      return { payment, reversal, duplicate: true }
    }
    if (payment.status !== "succeeded") {
      throw new ElixirRuleError("Only a succeeded payment can be refunded")
    }
    const reversal = await reverseAward(tx, `purchase:${payment.externalRef}`, actorId)
    const updated = await tx.verifiedPayment.update({
      where: { id: payment.id },
      data: { status: "refunded" },
    })
    return { payment: updated, reversal, duplicate: false }
  })
}

export async function adjustElixir(input: {
  userId: string
  amount: number
  reason: string
  actorId: string
  idempotencyKey: string
}) {
  if (!Number.isInteger(input.amount) || input.amount === 0) {
    throw new ElixirRuleError("Adjustment amount must be a non-zero whole number of Elixir")
  }
  const reason = input.reason.trim()
  if (reason.length < 8 || reason.length > 500) {
    throw new ElixirRuleError("An adjustment needs a reason between 8 and 500 characters")
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const written = await writeLedger(tx, {
        userId: input.userId,
        amount: input.amount,
        type: "admin_adjustment",
        idempotencyKey: input.idempotencyKey,
        sourceType: "admin_adjustment",
        sourceId: input.actorId,
        note: reason,
        actorId: input.actorId,
      })
      return written
    })
  } catch (error) {
    if (!isUniqueConflict(error)) throw error
    const transaction = await prisma.elixirTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } })
    if (!transaction) throw error
    return { transaction, duplicate: true, balance: null }
  }
}

export async function awardLearningActivity(input: {
  userId: string
  activity: ElixirActivity
  sourceId: string
  scorePercent?: number | null
}) {
  if (!(await elixirReady())) return { awarded: false as const, reason: "unavailable" as const }
  const rule = await prisma.elixirRewardRule.findUnique({ where: { activity: input.activity } })
  if (!rule || !rule.enabled || rule.amount <= 0) return { awarded: false as const, reason: "disabled" as const }
  if (input.activity === "quiz_score") {
    const threshold = rule.quizScorePercent
    if (threshold == null || input.scorePercent == null || input.scorePercent < threshold) {
      return { awarded: false as const, reason: "threshold" as const }
    }
  }
  const idempotencyKey = `learn:${input.userId}:${input.activity}:${input.sourceId}`
  try {
    const written = await prisma.$transaction(async (tx) => {
      if (rule.cooldownSeconds > 0) {
        await ensureAccount(tx, input.userId)
        await tx.elixirAccount.update({ where: { userId: input.userId }, data: { balance: { increment: 0 } } })
        const since = new Date(Date.now() - rule.cooldownSeconds * 1000)
        const recent = await tx.elixirTransaction.findFirst({
          where: {
            userId: input.userId,
            activity: input.activity,
            type: "learning_reward",
            createdAt: { gte: since },
          },
          select: { id: true },
        })
        if (recent) return null
      }
      return writeLedger(tx, {
        userId: input.userId,
        amount: rule.amount,
        type: "learning_reward",
        idempotencyKey,
        sourceType: "learning",
        sourceId: input.sourceId,
        activity: input.activity,
        note: input.activity,
      })
    })
    if (!written) return { awarded: false as const, reason: "cooldown" as const }
    if (written.duplicate) return { awarded: false as const, reason: "duplicate" as const }
    return { awarded: true as const, amount: rule.amount }
  } catch (error) {
    if (isUniqueConflict(error)) return { awarded: false as const, reason: "duplicate" as const }
    if (isMissingTable(error)) return { awarded: false as const, reason: "unavailable" as const }
    console.error("Elixir learning reward skipped:", error instanceof Error ? error.name : "unknown")
    return { awarded: false as const, reason: "unavailable" as const }
  }
}

function isMissingTable(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022")
}

export async function awardVerifiedLearning(input: {
  userId: string
  activity: ElixirActivity
  sourceId: string
  scorePercent?: number | null
  courseSlug?: string
  lessonKey?: string
}) {
  try {
    await awardLearningActivity(input)
    if (!input.courseSlug || !input.lessonKey) return
    if (!(await elixirReady())) return
    const linked = await prisma.learningResource.findFirst({
      where: {
        kind: "case_study",
        published: true,
        courseSlug: input.courseSlug,
        lessonKey: input.lessonKey,
      },
      select: { id: true },
    })
    if (!linked) return
    await awardLearningActivity({
      userId: input.userId,
      activity: "case_study_complete",
      sourceId: input.sourceId,
    })
  } catch (error) {
    if (isMissingTable(error)) return
    console.error("Elixir learning reward skipped:", error instanceof Error ? error.name : "unknown")
  }
}

export async function spendOnResource(userId: string, slug: string) {
  const resource = await prisma.learningResource.findUnique({ where: { slug } })
  if (!resource || !resource.published) return { error: "not_found" as const }
  try {
    return await prisma.$transaction(async (tx) => {
      const owned = await tx.learningResourceEntitlement.findUnique({
        where: { userId_resourceId: { userId, resourceId: resource.id } },
      })
      if (owned) return { error: "owned" as const }
      await ensureAccount(tx, userId)
      const locked = await tx.elixirAccount.update({
        where: { userId },
        data: { balance: { increment: 0 } },
      })
      if (locked.balance < resource.elixirPrice) throw new InsufficientElixirError()
      const balance = locked.balance - resource.elixirPrice
      await tx.elixirAccount.update({
        where: { userId },
        data: { balance: { decrement: resource.elixirPrice } },
      })
      const transaction = await tx.elixirTransaction.create({
        data: {
          userId,
          amount: -resource.elixirPrice,
          type: "resource_spend",
          idempotencyKey: `spend:${userId}:${resource.id}`,
          sourceType: "learning_resource",
          sourceId: resource.id,
          note: resource.title,
        },
      })
      await tx.learningResourceEntitlement.create({
        data: { userId, resourceId: resource.id, transactionId: transaction.id },
      })
      return { error: null, balance, price: resource.elixirPrice, title: resource.title }
    })
  } catch (error) {
    if (error instanceof InsufficientElixirError) return { error: "insufficient" as const }
    if (isUniqueConflict(error)) return { error: "owned" as const }
    throw error
  }
}

export async function updateRewardRule(input: {
  activity: ElixirActivity
  amount: number
  enabled: boolean
  quizScorePercent: number | null
  cooldownSeconds: number
  actorId: string
}) {
  if (!Number.isInteger(input.amount) || input.amount < 0 || input.amount > 100_000) {
    throw new ElixirRuleError("Reward amount must be a whole number from 0 to 100000")
  }
  if (!Number.isInteger(input.cooldownSeconds) || input.cooldownSeconds < 0 || input.cooldownSeconds > 86_400) {
    throw new ElixirRuleError("Cooldown must be a whole number of seconds up to one day")
  }
  if (input.quizScorePercent != null && (!Number.isInteger(input.quizScorePercent) || input.quizScorePercent < 0 || input.quizScorePercent > 100)) {
    throw new ElixirRuleError("Quiz score threshold must be a whole percent from 0 to 100")
  }
  return prisma.elixirRewardRule.update({
    where: { activity: input.activity },
    data: {
      amount: input.amount,
      enabled: input.enabled,
      quizScorePercent: input.activity === "quiz_score" ? input.quizScorePercent : null,
      cooldownSeconds: input.cooldownSeconds,
      updatedById: input.actorId,
    },
  })
}
