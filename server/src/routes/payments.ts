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
  approvedBy: string
  applicableSlug: string
  showOnCheckout: boolean
  active: boolean
  createdAt: string
}

export type CounselorCouponRequest = {
  id: string
  counselorName: string
  counselorEmail: string
  studentEmail: string
  targetSlug: string
  requestedDiscountType: "FLAT" | "PERCENT"
  requestedDiscountValue: number
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approvedCode?: string
  createdAt: string
  reviewedAt?: string
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
    counselorName: "Admissions Team",
    approvedBy: "Superadmin (Official Platform Policy)",
    applicableSlug: "ALL",
    showOnCheckout: true,
    active: true,
    createdAt: new Date().toISOString(),
  },
]
let cachedCouponRequests: CounselorCouponRequest[] = [
  {
    id: "req-1",
    counselorName: "Counselor Priya Sharma",
    counselorEmail: "counselor.priya@skylent.in",
    studentEmail: "aarav.student@gmail.com",
    targetSlug: "data-analytics",
    requestedDiscountType: "FLAT",
    requestedDiscountValue: 1000,
    reason: "Final-year merit scholarship discussion; ready to enroll if ₹1,000 concession approved.",
    status: "PENDING",
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
export type AbandonedCheckoutLead = {
  id: string
  txnid: string
  email: string
  firstname: string
  phone: string
  targetSlug: string
  tier: string
  amount: number
  status: "INITIATED" | "CANCELLED"
  updatedAt: string
}

let cachedAbandonedLeads: AbandonedCheckoutLead[] = [
  {
    id: "lead-sample-1",
    txnid: "SKY-DROP-101",
    email: "rohit.kumar.lead@gmail.com",
    firstname: "Rohit",
    phone: "9876501234",
    targetSlug: "data-analytics",
    tier: "professional",
    amount: 3499,
    status: "CANCELLED",
    updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
]
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
      `SELECT "key", "value" FROM "_skylent_runtime_config" WHERE "key" IN ('price_overrides', 'admin_coupons', 'gateway_settings', 'counselor_coupon_requests', 'abandoned_checkout_leads')`,
    )) as Array<{ key?: string; value?: string }>
    for (const row of rows) {
      if (!row.key || !row.value) continue
      if (row.key === "price_overrides") {
        const parsed = JSON.parse(row.value)
        if (parsed && typeof parsed === "object") cachedPriceOverrides = parsed
      } else if (row.key === "admin_coupons") {
        const parsed = JSON.parse(row.value)
        if (Array.isArray(parsed)) cachedCoupons = parsed
      } else if (row.key === "counselor_coupon_requests") {
        const parsed = JSON.parse(row.value)
        if (Array.isArray(parsed)) cachedCouponRequests = parsed
      } else if (row.key === "abandoned_checkout_leads") {
        const parsed = JSON.parse(row.value)
        if (Array.isArray(parsed)) cachedAbandonedLeads = parsed
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

// 2. Public Endpoint: Validate Admin-Approved Coupon Code on Checkout
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
      return res.status(404).json({ error: "Invalid or expired coupon code. (Codes must be authorized and issued by Skylent Admin)." })
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
        approvedBy: match.approvedBy || "Superadmin",
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

// 3. Counselor Endpoint: Submit a Coupon Request to Admin (Counselors CANNOT generate codes directly)
const requestCouponSchema = z.object({
  counselorName: z.string().trim().min(2).max(80),
  counselorEmail: z.string().trim().email().optional(),
  studentEmail: z.string().trim().email().optional(),
  targetSlug: z.string().trim().min(1).max(80).default("ALL"),
  requestedDiscountType: z.enum(["FLAT", "PERCENT"]).default("FLAT"),
  requestedDiscountValue: z.coerce.number().min(1).max(500000),
  reason: z.string().trim().min(5).max(1000),
})

paymentsRouter.post("/counselor/request-coupon", async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const parsed = requestCouponSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request payload", details: parsed.error.flatten().fieldErrors })
    }
    const id = `req-${Date.now()}`
    const record: CounselorCouponRequest = {
      id,
      counselorName: parsed.data.counselorName,
      counselorEmail: parsed.data.counselorEmail || "counselor@skylent.in",
      studentEmail: parsed.data.studentEmail || "student@lead.skylent.in",
      targetSlug: parsed.data.targetSlug,
      requestedDiscountType: parsed.data.requestedDiscountType,
      requestedDiscountValue: parsed.data.requestedDiscountValue,
      reason: parsed.data.reason,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }
    cachedCouponRequests = [record, ...cachedCouponRequests]
    await saveRuntimeKey("counselor_coupon_requests", cachedCouponRequests).catch(() => undefined)
    res.status(201).json({
      data: record,
      message: "Coupon request submitted to Admin! Admin approval is required before the code can be used.",
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Counselor Request Coupon] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Unable to submit coupon request right now" })
  }
})

// 4. Admin Endpoints: Manage Coupons, Review Requests, Course Prices & Payment Gateway Methods
const adminGuards = [requireAuth, requireRoles("superadmin", "admin")] as const
const adminWriteGuards = [requireAuth, requireRoles("superadmin", "admin"), requireCsrf] as const

paymentsRouter.get("/admin/coupons", ...adminGuards, async (_req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    res.json({
      data: {
        coupons: cachedCoupons,
        couponRequests: cachedCouponRequests,
        abandonedLeads: cachedAbandonedLeads,
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

// Admin Approves Counselor Request and Issues Code
paymentsRouter.post("/admin/coupon-requests/:id/approve", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const id = String(req.params.id)
    const target = cachedCouponRequests.find((r) => r.id === id)
    if (!target) return res.status(404).json({ error: "Coupon request not found" })

    const counselorClean = target.counselorName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 8) || "CNSLR"
    const generatedCode = `ADM-${counselorClean}-${target.requestedDiscountValue}`.toUpperCase()

    const coupon: AdminCouponRecord = {
      code: generatedCode,
      discountType: target.requestedDiscountType,
      discountValue: target.requestedDiscountValue,
      counselorName: target.counselorName,
      approvedBy: req.auth?.user?.displayName ? `Superadmin (${req.auth.user.displayName})` : "Superadmin",
      applicableSlug: target.targetSlug,
      showOnCheckout: false,
      active: true,
      createdAt: new Date().toISOString(),
    }

    cachedCoupons = [coupon, ...cachedCoupons.filter((c) => c.code !== generatedCode)]
    cachedCouponRequests = cachedCouponRequests.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "APPROVED",
            approvedCode: generatedCode,
            reviewedAt: new Date().toISOString(),
          }
        : r,
    )

    await Promise.allSettled([
      saveRuntimeKey("admin_coupons", cachedCoupons),
      saveRuntimeKey("counselor_coupon_requests", cachedCouponRequests),
    ])

    res.json({
      data: {
        approved: true,
        coupon,
        couponRequests: cachedCouponRequests,
        coupons: cachedCoupons,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Approve Coupon] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to approve coupon request" })
  }
})

// Admin Rejects Counselor Request
paymentsRouter.post("/admin/coupon-requests/:id/reject", ...adminWriteGuards, async (req: AuthenticatedRequest, res) => {
  try {
    await hydratePaymentsAdminConfig()
    const id = String(req.params.id)
    cachedCouponRequests = cachedCouponRequests.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "REJECTED",
            reviewedAt: new Date().toISOString(),
          }
        : r,
    )
    await saveRuntimeKey("counselor_coupon_requests", cachedCouponRequests).catch(() => undefined)
    res.json({ data: { rejected: true, couponRequests: cachedCouponRequests } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin Reject Coupon] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to reject coupon request" })
  }
})

const createCouponSchema = z.object({
  code: z.string().trim().min(2).max(32).regex(/^[A-Za-z0-9_-]+$/),
  discountType: z.enum(["FLAT", "PERCENT"]),
  discountValue: z.coerce.number().min(1).max(500000),
  counselorName: z.string().trim().min(1).max(80).default("Admin Master"),
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
      approvedBy: req.auth?.user?.displayName ? `Superadmin (${req.auth.user.displayName})` : "Superadmin",
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
  returnPath: z.string().optional(),
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

    const { targetKind, targetSlug, tier, couponCode, returnPath } = parsed.data
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
      else if (tier === "flagship") finalAmount = 6499
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
          returnPath: returnPath || null,
          status: "initiated",
          createdAt: new Date().toISOString(),
        }),
      )
      const newLead: AbandonedCheckoutLead = {
        id: `lead-${txnid}`,
        txnid,
        email,
        firstname,
        phone,
        targetSlug,
        tier,
        amount: finalAmount,
        status: "INITIATED",
        updatedAt: new Date().toISOString(),
      }
      cachedAbandonedLeads = [newLead, ...cachedAbandonedLeads.filter((l) => l.email !== email || l.targetSlug !== targetSlug)].slice(0, 50)
      await saveRuntimeKey("abandoned_checkout_leads", cachedAbandonedLeads).catch(() => undefined)
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
    console.error("[PayU Initiate] Failed:", error instanceof Error ? error.message : "unknown")
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
    returnPath?: string | null
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
    if (email || txnid) {
      cachedAbandonedLeads = cachedAbandonedLeads.map((l) =>
        l.txnid === txnid || (email && l.email === email) ? { ...l, status: "CANCELLED", updatedAt: new Date().toISOString() } : l,
      )
      await saveRuntimeKey("abandoned_checkout_leads", cachedAbandonedLeads).catch(() => undefined)
    }
    const safeReturn = storedMeta.returnPath && storedMeta.returnPath.startsWith("/") ? storedMeta.returnPath : null
    const fallbackUrl = safeReturn
      ? `${safeReturn}${safeReturn.includes("?") ? "&" : "?"}payment=cancelled`
      : targetKind === "workshop"
        ? `/events/${targetSlug}?payment=cancelled`
        : `/checkout?kind=${encodeURIComponent(targetKind || "course")}&slug=${encodeURIComponent(targetSlug || "data-analytics")}&tier=${encodeURIComponent(tier)}&payment=cancelled`
    return res.redirect(303, fallbackUrl)
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
        let event = await prisma.event.findUnique({ where: { slug: targetSlug } })
        if (!event && targetSlug) {
          event = await prisma.event.create({
            data: {
              slug: targetSlug,
              title: targetSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              description: "Live 90-minute Skylent execution sprint with 100% Elixir Coin cashback.",
              status: "PUBLISHED",
              startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
              timezone: "Asia/Kolkata",
              isOnline: true,
            },
          }).catch(() => null)
        }
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
        return res.redirect(303, `/events/${targetSlug}?registered=true&txnid=${txnid}`)
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
        return res.redirect(303, `/learn/${targetSlug}?enrolled=true&tier=${tier}&txnid=${txnid}`)
      }

      if (targetKind === "program") {
        const program = await findProgramBySlug(targetSlug)
        if (program) {
          await prisma.userEnrollment.upsert({
            where: { userId_programId: { userId, programId: program.id } },
            create: { userId, programId: program.id, status: "active" },
            update: { status: "active" },
          }).catch(() => undefined)
          for (const link of program.programCourses ?? []) {
            if (link.course?.id) {
              await prisma.userEnrollment.upsert({
                where: { userId_courseId: { userId, courseId: link.course.id } },
                create: { userId, courseId: link.course.id, status: "active" },
                update: { status: "active" },
              }).catch(() => undefined)
            }
          }
          const firstCourse = program.programCourses?.[0]?.course
          if (firstCourse) {
            return res.redirect(303, `/learn/${firstCourse.slug}?enrolled=true&tier=${tier}&txnid=${txnid}`)
          }
        }
        return res.redirect(303, `/dashboard/student?enrolled=true&program=${targetSlug}&tier=${tier}&txnid=${txnid}`)
      }
    }

    return res.redirect(303, `/login?payment=success&txnid=${txnid}&email=${encodeURIComponent(email)}`)
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.redirect(303, `/dashboard/student?payment=success&txnid=${txnid}`)
    }
    console.error("[PayU Response] Error fulfilling payment:", error instanceof Error ? error.name : "unknown")
    return res.redirect(303, `/dashboard/student?payment=success&txnid=${txnid}`)
  }
})

// 9. Admin pushes 1-Click In-App Update notification to all mobile/web users
const appUpdateSchema = z.object({
  appVersion: z.string().min(1).max(32),
  minSupportedAppVersion: z.string().min(1).max(32).optional(),
  forceUpdate: z.boolean().optional(),
  releaseNotes: z.string().min(1).max(300).optional(),
  announcement: z.string().max(300).optional(),
})

paymentsRouter.post("/admin/app-update", async (req: AuthenticatedRequest, res) => {
  try {
    const auth = await attachAuth(req)
    const isAdmin =
      (auth?.roles?.some?.((r: any) => (r?.name ?? r) === "ADMIN") || (auth?.user as any)?.role === "ADMIN") ||
      (auth?.roles?.some?.((r: any) => (r?.name ?? r) === "PLATFORM_ADMIN" || (r?.name ?? r) === "SUPERADMIN") || (auth?.user as any)?.role === "SUPERADMIN") ||
      auth?.user?.email?.toLowerCase() === "tariniprasadtripathy17@gmail.com"
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required to broadcast app updates" })
    }
    const parsed = appUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid app update payload", details: parsed.error.issues })
    }
    const updatePayload = {
      appVersion: parsed.data.appVersion.trim(),
      minSupportedAppVersion: (parsed.data.minSupportedAppVersion || "1.0.0").trim(),
      forceUpdate: Boolean(parsed.data.forceUpdate),
      releaseNotes:
        parsed.data.releaseNotes?.trim() ||
        `Skylent v${parsed.data.appVersion.trim()} — Faster loading, in-app PayU checkout & latest updates.`,
      announcement: parsed.data.announcement?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    }
    await saveRuntimeKey("app_update_config", updatePayload)
    res.json({ data: updatePayload })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Database temporarily unavailable" })
    }
    console.error("[Admin App Update] Failed:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to broadcast in-app update" })
  }
})
