import { Router } from "express"
import { z } from "zod"
import { ensurePayuConfigHydrated, generatePayuHash, getPayuConfig, savePayuConfigToDatabase, verifyPayuResponseHash } from "../lib/payu.js"
import { attachAuth, requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { prisma } from "../lib/prisma.js"
import { findCourseBySlug, findProgramBySlug } from "../lib/lms.js"
import { awardCourseEnrolmentElixir, awardWorkshopRegistrationCashback } from "../lib/elixir.js"
import { EventRegistrationStatus } from "@prisma/client"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"

export const paymentsRouter = Router()

export type AdminPriceOverride = {
  slug: string
  basePrice: number
  certPrice: number
  proPrice: number
  flagshipPrice: number
  mrp: number
  updatedAt: string
}

export type AdminCouponRecord = {
  code: string
  discountType: "FLAT" | "PERCENT"
  discountValue: number
  counselorName: string
  applicableSlug: string
  showOnCheckout: boolean
  active: boolean
  createdAt: string
}

export type AdminGatewaySettings = {
  payuEnabled: boolean
  upiEnabled: boolean
  cardsEnabled: boolean
  netbankingEnabled: boolean
  emiEnabled: boolean
  mode: "production" | "test"
  merchantKey: string
  mid: string
}

let cachedPriceOverrides: Record<string, AdminPriceOverride> = {}
let cachedCoupons: AdminCouponRecord[] = [
  {
    code: "SKYLENT10",
    discountType: "PERCENT",
    discountValue: 10,
    counselorName: "Skylent Admissions",
    applicableSlug: "ALL",
    showOnCheckout: true,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    code: "COUNSELOR20",
    discountType: "PERCENT",
    discountValue: 20,
    counselorName: "Senior Academic Counselor",
    applicableSlug: "ALL",
    showOnCheckout: false,
    active: true,
    createdAt: new Date().toISOString(),
  },
]
let cachedGatewaySettings: AdminGatewaySettings = {
  payuEnabled: true,
  upiEnabled: true,
  cardsEnabled: true,
  netbankingEnabled: true,
  emiEnabled: true,
  mode: "production",
  merchantKey: "jUkwLy",
  mid: "13843036",
}
let configLoadedFromDb = false

async function ensureRuntimeTable() {
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "_skylent_runtime_config" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  )
}

async function hydratePaymentsAdminConfig() {
  if (configLoadedFromDb) return
  try {
    await ensureRuntimeTable()
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "key", "value" FROM "_skylent_runtime_config" WHERE "key" IN ('price_overrides', 'admin_coupons', 'gateway_settings')`,
    )) as Array<{ key?: string; value?: string }>
    for (const row of rows) {
      if (!row.key || !row.value) continue
      if (row.key === "price_overrides") {
        const parsed = JSON.parse(row.value)
        if (parsed && typeof parsed === "object") cachedPriceOverrides = parsed
      } else if (row.key === "admin_coupons") {
        const parsed = JSON.parse(row.value)
        if (Array.isArray(parsed)) cachedCoupons = parsed
      } else if (row.key === "gateway_settings") {
        const parsed = JSON.parse(row.value)
        if (parsed && typeof parsed === "object") {
          cachedGatewaySettings = { ...cachedGatewaySettings, ...parsed }
        }
      }
    }
    configLoadedFromDb = true
  } catch {
    // non-fatal fallback to memory cache
  }
}

async function saveRuntimeKey(key: string, data: unknown) {
  await ensureRuntimeTable()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
    key,
    JSON.stringify(data),
  )
}

function computeCouponDiscount(coupon: AdminCouponRecord, subtotal: number): number {
  if (!coupon.active || subtotal <= 0) return 0
  if (coupon.discountType === "PERCENT") {
    const pct = Math.min(99, Math.max(1, coupon.discountValue))
    return Math.round((subtotal * pct) / 100)
  }
  return Math.min(Math.max(0, subtotal - 1), Math.round(coupon.discountValue))
}

// 1. Public Endpoint: Read Live Price Overrides, Payment Methods & Checkout-Visible Coupons
paymentsRouter.get("/catalog-config", async (_req, res) => {
  try {
    await hydratePaymentsAdminConfig()
    await ensurePayuConfigHydrated()
    const payu = getPayuConfig()
    res.json({
      data: {
        priceOverrides: cachedPriceOverrides,
        gatewaySettings: {
          ...cachedGatewaySettings,
          mode: payu.mode,
          merchantKey: payu.key,
          mid: payu.mid,
        },
        publicCoupons: cachedCoupons.filter((c) => c.active && c.showOnCheckout),
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Payment configuration service temporarily unavailable" })
    }
    console.error("[Payments Config] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Unable to load payment configuration" })
  }
})

// 2. Public Endpoint: Validate Admin / Counselor Coupon Code on Checkout
const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  slug: z.string().trim().optional().default("ALL"),
  subtotal: z.coerce.number().min(1),
})

paymentsRouter.post("/coupons/validate", async (req, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const parsed = validateCouponSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Please enter a valid coupon code" })
    }
    const cleanCode = parsed.data.code.toUpperCase()
    const match = cachedCoupons.find(
      (c) =>
        c.active &&
        c.code.toUpperCase() === cleanCode &&
        (c.applicableSlug === "ALL" || c.applicableSlug === parsed.data.slug),
    )
    if (!match) {
      return res.status(404).json({ error: "Invalid or expired Admin/Counselor coupon code." })
    }
    const discountAmount = computeCouponDiscount(match, parsed.data.subtotal)
    const finalPayable = Math.max(1, parsed.data.subtotal - discountAmount)
    res.json({
      data: {
        valid: true,
        code: match.code,
        discountType: match.discountType,
        discountValue: match.discountValue,
        discountAmount,
        finalPayable,
        counselorName: match.counselorName,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Coupon validation temporarily unavailable" })
    }
    console.error("[Coupon Validate] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Unable to validate coupon right now" })
  }
})

// 3. Admin Endpoints: Manage Coupons, Course Prices & Payment Gateway Methods
const adminGuards = [requireAuth, requireRoles("superadmin", "admin")] as const
const adminWriteGuards = [requireAuth, requireRoles("superadmin", "admin"), requireCsrf] as const

paymentsRouter.get("/admin/coupons", ...adminGuards, async (_req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    res.json({
      data: {
        coupons: cachedCoupons,
        priceOverrides: cachedPriceOverrides,
        gatewaySettings: cachedGatewaySettings,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Admin payment config temporarily unavailable" })
    }
    console.error("[Admin Coupons Get] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load admin coupons and pricing" })
  }
})

const createCouponSchema = z.object({
  code: z.string().trim().min(2).max(32).regex(/^[A-Za-z0-9_-]+$/),
  discountType: z.enum(["FLAT", "PERCENT"]),
  discountValue: z.coerce.number().min(1).max(500000),
  counselorName: z.string().trim().min(1).max(80).default("Admin"),
  applicableSlug: z.string().trim().min(1).max(80).default("ALL"),
  showOnCheckout: z.boolean().optional().default(false),
})

paymentsRouter.post("/admin/coupons", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const parsed = createCouponSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid coupon details", details: parsed.error.flatten().fieldErrors })
    }
    const cleanCode = parsed.data.code.toUpperCase()
    const record: AdminCouponRecord = {
      code: cleanCode,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      counselorName: parsed.data.counselorName,
      applicableSlug: parsed.data.applicableSlug,
      showOnCheckout: Boolean(parsed.data.showOnCheckout),
      active: true,
      createdAt: new Date().toISOString(),
    }
    cachedCoupons = [record, ...cachedCoupons.filter((c) => c.code.toUpperCase() !== cleanCode)]
    await saveRuntimeKey("admin_coupons", cachedCoupons).catch(() => undefined)
    res.status(201).json({ data: record, coupons: cachedCoupons })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Coupon Create] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to create coupon" })
  }
})

paymentsRouter.delete("/admin/coupons/:code", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const code = String(req.params.code || "").trim().toUpperCase()
    cachedCoupons = cachedCoupons.filter((c) => c.code.toUpperCase() !== code)
    await saveRuntimeKey("admin_coupons", cachedCoupons).catch(() => undefined)
    res.json({ data: { deleted: code, coupons: cachedCoupons } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Coupon Delete] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to delete coupon" })
  }
})

const priceOverrideSchema = z.object({
  slug: z.string().trim().min(2).max(80),
  basePrice: z.coerce.number().int().min(1).max(1000000),
  certPrice: z.coerce.number().int().min(1).max(1000000).optional(),
  proPrice: z.coerce.number().int().min(1).max(1000000).optional(),
  flagshipPrice: z.coerce.number().int().min(1).max(1000000).optional(),
  mrp: z.coerce.number().int().min(1).max(2000000).optional(),
})

paymentsRouter.post("/admin/price-override", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const parsed = priceOverrideSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid price override payload" })
    }
    const { slug, basePrice } = parsed.data
    const proPrice = parsed.data.proPrice ?? basePrice
    const certPrice = parsed.data.certPrice ?? Math.max(499, Math.round((proPrice * 0.45) / 100) * 100)
    const flagshipPrice = parsed.data.flagshipPrice ?? proPrice + 2500
    const mrp = parsed.data.mrp ?? proPrice * 2

    const override: AdminPriceOverride = {
      slug,
      basePrice: proPrice,
      certPrice,
      proPrice,
      flagshipPrice,
      mrp,
      updatedAt: new Date().toISOString(),
    }
    cachedPriceOverrides = {
      ...cachedPriceOverrides,
      [slug]: override,
    }
    await saveRuntimeKey("price_overrides", cachedPriceOverrides).catch(() => undefined)
    await prisma.course
      .updateMany({
        where: { slug },
        data: { price: proPrice, originalPrice: mrp },
      })
      .catch(() => undefined)

    res.json({ data: override, priceOverrides: cachedPriceOverrides })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Price Override] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to save course price" })
  }
})

const gatewaySettingsSchema = z.object({
  payuEnabled: z.boolean().optional(),
  upiEnabled: z.boolean().optional(),
  cardsEnabled: z.boolean().optional(),
  netbankingEnabled: z.boolean().optional(),
  emiEnabled: z.boolean().optional(),
  mode: z.enum(["production", "test"]).optional(),
  merchantKey: z.string().trim().optional(),
  merchantSalt: z.string().trim().optional(),
  mid: z.string().trim().optional(),
})

paymentsRouter.post("/admin/gateway-settings", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const parsed = gatewaySettingsSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid gateway settings" })
    }
    cachedGatewaySettings = {
      ...cachedGatewaySettings,
      ...(parsed.data.payuEnabled !== undefined ? { payuEnabled: parsed.data.payuEnabled } : {}),
      ...(parsed.data.upiEnabled !== undefined ? { upiEnabled: parsed.data.upiEnabled } : {}),
      ...(parsed.data.cardsEnabled !== undefined ? { cardsEnabled: parsed.data.cardsEnabled } : {}),
      ...(parsed.data.netbankingEnabled !== undefined ? { netbankingEnabled: parsed.data.netbankingEnabled } : {}),
      ...(parsed.data.emiEnabled !== undefined ? { emiEnabled: parsed.data.emiEnabled } : {}),
      ...(parsed.data.mode ? { mode: parsed.data.mode } : {}),
      ...(parsed.data.merchantKey ? { merchantKey: parsed.data.merchantKey } : {}),
      ...(parsed.data.mid ? { mid: parsed.data.mid } : {}),
    }
    await saveRuntimeKey("gateway_settings", cachedGatewaySettings).catch(() => undefined)
    if (parsed.data.merchantKey && parsed.data.merchantSalt) {
      await savePayuConfigToDatabase({
        key: parsed.data.merchantKey,
        salt: parsed.data.merchantSalt,
        mid: parsed.data.mid || cachedGatewaySettings.mid,
        mode: parsed.data.mode || cachedGatewaySettings.mode,
      }).catch(() => undefined)
    }
    res.json({ data: cachedGatewaySettings })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Gateway Settings] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to save payment gateway settings" })
  }
})

const initiateSchema = z.object({
  targetKind: z.enum(["course", "program", "workshop"]),
  targetSlug: z.string().min(1),
  tier: z.string().optional().default("professional"),
  amount: z.number().min(1).optional(),
  couponCode: z.string().optional(),
  firstname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

function cleanProductInfo(targetKind: string, targetSlug: string): string {
  const cleanSlug = targetSlug.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
  if (targetKind === "workshop") return `Skylent Workshop ${cleanSlug}`.slice(0, 90)
  return `Skylent ${cleanSlug}`.slice(0, 90)
}

function cleanFirstName(raw: string): string {
  const first = raw.trim().split(/\s+/)[0] || "Learner"
  const cleaned = first.replace(/[^a-zA-Z]/g, "")
  return cleaned.length >= 2 ? cleaned.slice(0, 40) : "Learner"
}

paymentsRouter.post("/payu/initiate", async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    await ensurePayuConfigHydrated()
    const auth = await attachAuth(req)
    const parsed = initiateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment request payload", details: parsed.error.issues })
    }

    const { targetKind, targetSlug, tier, couponCode } = parsed.data
    const user = auth?.user
    const email = (user?.email || parsed.data.email || "").trim()
    const firstname = cleanFirstName(user?.displayName || parsed.data.firstname || email.split("@")[0] || "Learner")
    const phone = (parsed.data.phone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210"

    if (!email) {
      return res.status(400).json({ error: "Please enter your email address to proceed to payment." })
    }

    let finalAmount = parsed.data.amount ?? 0
    const override = cachedPriceOverrides[targetSlug]
    if (override && targetKind !== "workshop") {
      const tierBase =
        tier === "certificate"
          ? override.certPrice
          : tier === "flagship"
            ? override.flagshipPrice
            : override.proPrice
      if (couponCode) {
        const cleanCode = couponCode.trim().toUpperCase()
        const matchedCoupon = cachedCoupons.find(
          (c) => c.active && c.code.toUpperCase() === cleanCode && (c.applicableSlug === "ALL" || c.applicableSlug === targetSlug),
        )
        const disc = matchedCoupon ? computeCouponDiscount(matchedCoupon, tierBase) : 0
        finalAmount = Math.max(1, tierBase - disc)
      } else if (!finalAmount || finalAmount <= 0) {
        finalAmount = tierBase
      }
    } else if (targetKind === "workshop") {
      finalAmount = finalAmount > 0 ? finalAmount : 99
    } else if (!finalAmount || finalAmount <= 0) {
      if (tier === "certificate") finalAmount = 1499
      else if (tier === "flagship") finalAmount = 6999
      else finalAmount = 3499
    }

    const payu = getPayuConfig()
    const txnid = `SKL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`
    const amountStr = Number(finalAmount).toFixed(2)
    const productInfo = cleanProductInfo(targetKind, targetSlug)

    const publicOrigin = (process.env.PUBLIC_ORIGIN || process.env.FRONTEND_URL || "https://skylent.live").replace(/\/+$/, "")
    const surl = `${publicOrigin}/api/v1/payments/payu/response`
    const furl = `${publicOrigin}/api/v1/payments/payu/response`

    const hash = generatePayuHash({
      key: payu.key,
      txnid,
      amount: amountStr,
      productinfo: productInfo,
      firstname,
      email,
      salt: payu.salt,
    })

    try {
      await ensureRuntimeTable()
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
        `payu_txn_${txnid}`,
        JSON.stringify({
          txnid,
          userId: user?.id || null,
          email,
          firstname,
          amount: finalAmount,
          couponCode: couponCode || null,
          targetKind,
          targetSlug,
          tier,
          status: "initiated",
          createdAt: new Date().toISOString(),
        }),
      )
    } catch {
      // non-fatal
    }

    res.json({
      actionUrl: payu.actionUrl,
      params: {
        key: payu.key,
        txnid,
        amount: amountStr,
        productinfo: productInfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Payment service is temporarily unavailable" })
    }
    console.error("[PayU Initiate] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Unable to initiate payment right now" })
  }
})

paymentsRouter.post("/payu/response", async (req, res) => {
  await ensurePayuConfigHydrated()
  const payu = getPayuConfig()
  const body = (req.body ?? {}) as Record<string, string>

  const isValid = verifyPayuResponseHash(body, payu.salt)
  const status = body.status
  const txnid = body.txnid || ""
  const amountStr = body.amount || "0"

  let storedMeta: {
    userId?: string | null
    email?: string
    targetKind?: string
    targetSlug?: string
    tier?: string
  } = {}

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "value" FROM "_skylent_runtime_config" WHERE "key" = $1 LIMIT 1`,
      `payu_txn_${txnid}`,
    )) as Array<{ value?: string }>
    if (rows?.[0]?.value) {
      storedMeta = JSON.parse(rows[0].value)
    }
  } catch {
    // ignore
  }

  let userId = storedMeta.userId || body.udf1 || ""
  const targetKind = storedMeta.targetKind || body.udf2 || ""
  const targetSlug = storedMeta.targetSlug || body.udf3 || ""
  const tier = storedMeta.tier || body.udf4 || "professional"
  const email = (storedMeta.email || body.email || "").trim().toLowerCase()

  if (!isValid || status !== "success") {
    console.warn(`[PayU Response] Payment not completed: status=${status}, txnid=${txnid}`)
    const fallbackUrl =
      targetKind === "workshop"
        ? `/events/${targetSlug}?payment=failed`
        : targetKind === "program"
          ? `/programmes/${targetSlug}?payment=failed`
          : targetKind === "course"
            ? `/courses/${targetSlug}?payment=failed`
            : `/programmes?payment=failed`
    return res.redirect(fallbackUrl)
  }

  try {
    if (!userId && email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) userId = existingUser.id
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      `payu_txn_${txnid}`,
      JSON.stringify({
        txnid,
        userId,
        email,
        amount: Number(amountStr),
        targetKind,
        targetSlug,
        tier,
        status: "success",
        payuMoneyId: body.payuMoneyId || null,
        bankRefNum: body.bank_ref_num || null,
        completedAt: new Date().toISOString(),
      }),
    )

    if (userId) {
      if (targetKind === "workshop") {
        const event = await prisma.event.findUnique({ where: { slug: targetSlug } })
        if (event) {
          await prisma.eventRegistration.upsert({
            where: { eventId_userId: { eventId: event.id, userId } },
            create: {
              eventId: event.id,
              userId,
              status: EventRegistrationStatus.REGISTERED,
            },
            update: {
              status: EventRegistrationStatus.REGISTERED,
              registeredAt: new Date(),
              cancelledAt: null,
            },
          })
          await awardWorkshopRegistrationCashback({
            userId,
            eventId: event.id,
            eventSlug: event.slug,
            eventTitle: event.title,
          }).catch(() => undefined)
        }
        return res.redirect(`/events/${targetSlug}?registered=true&txnid=${txnid}`)
      }

      if (targetKind === "course") {
        const course = await findCourseBySlug(targetSlug)
        if (course) {
          const enrollment = await prisma.userEnrollment.upsert({
            where: { userId_courseId: { userId, courseId: course.id } },
            create: { userId, courseId: course.id, status: "active" },
            update: { status: "active" },
          })
          await awardCourseEnrolmentElixir({
            userId,
            enrollmentId: enrollment.id,
            slug: course.slug,
            title: course.title,
            listedPriceRupees: course.price,
          }).catch(() => undefined)
        }
        return res.redirect(`/learn/${targetSlug}?enrolled=true&tier=${tier}&txnid=${txnid}`)
      }

      if (targetKind === "program") {
        const program = await findProgramBySlug(targetSlug)
        if (program) {
          const firstCourse = program.programCourses?.[0]?.course
          if (firstCourse) {
            await prisma.userEnrollment.upsert({
              where: { userId_courseId: { userId, courseId: firstCourse.id } },
              create: { userId, courseId: firstCourse.id, programId: program.id, status: "active" },
              update: { status: "active", programId: program.id },
            }).catch(() => undefined)
            return res.redirect(`/learn/${firstCourse.slug}?enrolled=true&tier=${tier}&txnid=${txnid}`)
          }
        }
        return res.redirect(`/dashboard/student?enrolled=true&program=${targetSlug}&tier=${tier}&txnid=${txnid}`)
      }
    }

    return res.redirect(`/login?payment=success&txnid=${txnid}&email=${encodeURIComponent(email)}`)
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.redirect(`/dashboard/student?payment=success&txnid=${txnid}`)
    }
    console.error("[PayU Response] Error fulfilling payment:", error instanceof Error ? error.name : "unknown")
    return res.redirect(`/dashboard/student?payment=success&txnid=${txnid}`)
  }
})
