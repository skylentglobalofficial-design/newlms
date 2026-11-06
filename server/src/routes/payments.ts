import { Router } from "express"
import { z } from "zod"
import { ensurePayuConfigHydrated, generatePayuHash, getPayuConfig, verifyPayuResponseHash } from "../lib/payu.js"
import { attachAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { prisma } from "../lib/prisma.js"
import { findCourseBySlug, findProgramBySlug } from "../lib/lms.js"
import { awardCourseEnrolmentElixir, awardWorkshopRegistrationCashback } from "../lib/elixir.js"
import { EventRegistrationStatus } from "@prisma/client"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"

export const paymentsRouter = Router()

const initiateSchema = z.object({
  targetKind: z.enum(["course", "program", "workshop"]),
  targetSlug: z.string().min(1),
  tier: z.string().optional().default("professional"),
  amount: z.number().min(1).optional(),
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
    await ensurePayuConfigHydrated()
    const auth = await attachAuth(req)
    const parsed = initiateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment request payload", details: parsed.error.issues })
    }

    const { targetKind, targetSlug, tier } = parsed.data
    const user = auth?.user
    const email = (user?.email || parsed.data.email || "").trim()
    const firstname = cleanFirstName(user?.displayName || parsed.data.firstname || email.split("@")[0] || "Learner")
    const phone = (parsed.data.phone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210"

    if (!email) {
      return res.status(400).json({ error: "Please enter your email address to proceed to payment." })
    }

    let finalAmount = parsed.data.amount ?? 0
    if (targetKind === "workshop") {
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
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "_skylent_runtime_config" (
          "key" TEXT PRIMARY KEY,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      )
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
    console.error("[PayU Response] Error fulfilling payment:", error instanceof Error ? error.message : "unknown")
    return res.redirect(`/dashboard/student?payment=success&txnid=${txnid}`)
  }
})
