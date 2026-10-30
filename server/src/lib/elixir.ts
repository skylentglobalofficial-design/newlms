import { Prisma, type ElixirActivity, type ElixirTransactionType, type VerifiedPaymentStatus } from "@prisma/client"
import { prisma } from "./prisma.js"

/** Founder rule: every eligible ₹100 of net purchase value earns 10 Elixir. */
export const RUPEES_PER_ELIXIR = 10

/**
 * Founder Zero-to-One Workshop Flywheel rule:
 * Every ₹99 workshop/webinar awards 100% (1:1) Elixir Coin cashback (99 Elixir Coins)
 * redeemable for Case Studies and practical notes inside Skylent.
 */
export const DEFAULT_WORKSHOP_FEE_RUPEES = 99
export const WORKSHOP_ELIXIR_PER_RUPEE = 1

export const VERIFIED_ACADEMIC_ELIXIR_SCHEDULE = [
  { activity: "workshop_99_cashback", label: "₹99 Live Workshop / Webinar Registration", elixir: 99, rule: "100% 1:1 Elixir Coin cashback" },
  { activity: "lesson_complete", label: "Verified Lesson Completion", elixir: 5, rule: "First completion of an unlocked lesson" },
  { activity: "quiz_score", label: "Module Quiz High Score (>=80%)", elixir: 10, rule: "Server-graded quiz attempt >= 80%" },
  { activity: "assignment_complete", label: "Written Case / Assignment Submission", elixir: 15, rule: "Verified submission of course assignment" },
  { activity: "case_study_complete", label: "Elixir Case Study Completion", elixir: 25, rule: "Completion of an unlocked Case Study lesson" },
] as const


export type StarterElixirResource = {
  slug: string
  kind: "notes" | "case_study"
  title: string
  summary: string
  elixirPrice: number
  courseSlug: string
  lessonKey: string
}

export const STARTER_ELIXIR_CASE_STUDIES: readonly StarterElixirResource[] = [
  {
    slug: "northwind-discount-leakage-case",
    kind: "case_study",
    title: "Northwind Margin & Discount Leakage Case Study",
    summary: "SQL & commercial margin investigation: uncover why high-volume categories lose net revenue to promotional discounting.",
    elixirPrice: 49,
    courseSlug: "data-analytics",
    lessonKey: "l1",
  },
  {
    slug: "harbor-desk-weekend-triage-case",
    kind: "case_study",
    title: "Harbor Desk Weekend Exception Queue PRD Case",
    summary: "Product scoping & board memo case: scope a 2-engineer, 6-week solution for 9 retail stores hitting weekend support bottlenecks.",
    elixirPrice: 49,
    courseSlug: "product-management",
    lessonKey: "l1",
  },
  {
    slug: "saas-onboarding-churn-teardown",
    kind: "case_study",
    title: "Enterprise B2B SaaS Onboarding & Churn Case Study",
    summary: "Full 99-Elixir flagship case study: diagnose enterprise onboarding handoff delays, cohort retention, and 90-day churn.",
    elixirPrice: 99,
    courseSlug: "product-management",
    lessonKey: "l2",
  },
  {
    slug: "ecommerce-sql-cohort-playbook",
    kind: "notes",
    title: "E-Commerce SQL Cohort & Retention Playbook",
    summary: "Step-by-step SQL query patterns for repeat-purchase cohorts, category contribution, and executive reporting.",
    elixirPrice: 39,
    courseSlug: "data-analytics",
    lessonKey: "l2",
  },
] as const

export function workshopCoinCashbackForRupees(workshopFeeRupees: number): number {
  if (!Number.isInteger(workshopFeeRupees) || workshopFeeRupees <= 0) return 0
  return workshopFeeRupees * WORKSHOP_ELIXIR_PER_RUPEE
}

export function mergeStarterElixirResources<
  T extends {
    slug: string
    kind: string
    title: string
    summary: string | null
    elixirPrice: number
    courseSlug: string | null
    lessonKey: string | null
  },
>(dbResources: readonly T[], ownedSlugs: ReadonlySet<string>) {
  const bySlug = new Map<string, T & { owned: boolean }>()
  for (const r of dbResources) {
    bySlug.set(r.slug, { ...r, owned: ownedSlugs.has(r.slug) })
  }
  for (const starter of STARTER_ELIXIR_CASE_STUDIES) {
    if (!bySlug.has(starter.slug)) {
      bySlug.set(starter.slug, {
        ...(starter as unknown as T),
        owned: ownedSlugs.has(starter.slug),
      })
    }
  }
  return [...bySlug.values()]
}

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

export async function awardWorkshopRegistrationCashback(input: {
  userId: string
  eventId: string
  eventSlug: string
  eventTitle: string
  feeRupees?: number
}) {
  try {
    if (!(await elixirReady())) return { awarded: false as const, amount: 0 }
    const fee = input.feeRupees ?? DEFAULT_WORKSHOP_FEE_RUPEES
    const amount = workshopCoinCashbackForRupees(fee)
    if (amount <= 0) return { awarded: false as const, amount: 0 }
    const idempotencyKey = `workshop-cashback:${input.userId}:${input.eventId}`
    const written = await prisma.$transaction(async (tx) =>
      writeLedger(tx, {
        userId: input.userId,
        amount,
        type: "purchase_reward",
        idempotencyKey,
        sourceType: "workshop_registration",
        sourceId: input.eventId,
        note: `100% Elixir Coin cashback (${amount} Elixir) for workshop: ${input.eventTitle}`,
      }),
    )
    return {
      awarded: !written.duplicate,
      duplicate: written.duplicate,
      amount,
      balance: written.balance,
    }
  } catch (error) {
    if (isUniqueConflict(error)) return { awarded: false as const, duplicate: true, amount: 0 }
    return { awarded: false as const, amount: 0 }
  }
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
  let resource = await prisma.learningResource.findUnique({ where: { slug } })
  if (!resource) {
    const starter = STARTER_ELIXIR_CASE_STUDIES.find((item) => item.slug === slug)
    if (starter) {
      resource = await prisma.learningResource.upsert({
        where: { slug: starter.slug },
        create: {
          slug: starter.slug,
          kind: starter.kind,
          title: starter.title,
          summary: starter.summary,
          elixirPrice: starter.elixirPrice,
          courseSlug: starter.courseSlug,
          lessonKey: starter.lessonKey,
          published: true,
        },
        update: {},
      })
    }
  }
  if (!resource || !resource.published) return { error: "not_found" as const }
  const targetResource = resource
  try {
    return await prisma.$transaction(async (tx) => {
      const owned = await tx.learningResourceEntitlement.findUnique({
        where: { userId_resourceId: { userId, resourceId: targetResource.id } },
      })
      if (owned) return { error: "owned" as const }
      await ensureAccount(tx, userId)
      const locked = await tx.elixirAccount.update({
        where: { userId },
        data: { balance: { increment: 0 } },
      })
      if (locked.balance < targetResource.elixirPrice) throw new InsufficientElixirError()
      const balance = locked.balance - targetResource.elixirPrice
      await tx.elixirAccount.update({
        where: { userId },
        data: { balance: { decrement: targetResource.elixirPrice } },
      })
      const transaction = await tx.elixirTransaction.create({
        data: {
          userId,
          amount: -targetResource.elixirPrice,
          type: "resource_spend",
          idempotencyKey: `spend:${userId}:${targetResource.id}`,
          sourceType: "learning_resource",
          sourceId: targetResource.id,
          note: targetResource.title,
        },
      })
      await tx.learningResourceEntitlement.create({
        data: { userId, resourceId: targetResource.id, transactionId: transaction.id },
      })
      return { error: null, balance, price: targetResource.elixirPrice, title: targetResource.title }
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
