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

paymentsRouter.post("/payu/initiate", async (req: AuthenticatedRequest, res) => {
  await ensurePayuConfigHydrated()
  const auth = await attachAuth(req)
  const parsed = initiateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payment request payload", details: parsed.error.issues })
  }

  const { targetKind, targetSlug, tier } = parsed.data
  const user = auth?.user
  const email = (user?.email || parsed.data.email || "").trim()
  const firstname = (user?.name || parsed.data.firstname || "Learner").trim().split(/\s+/)[0] || "Learner"
  const phone = (parsed.data.phone || "9999999999").trim()

  if (!email) {
    return res.status(400).json({ error: "Email address is required for checkout" })
  }

  let finalAmount = parsed.data.amount ?? 0
  let productInfo = `${targetKind}:${targetSlug}:${tier}`

  if (targetKind === "workshop") {
    finalAmount = finalAmount > 0 ? finalAmount : 99
    productInfo = `Workshop: ${targetSlug}`
  } else {
    if (!finalAmount || finalAmount <= 0) {
      if (tier === "certificate") finalAmount = 999
      else if (tier === "flagship") finalAmount = 3499
      else finalAmount = 1999
    }
  }

  const payu = getPayuConfig()
  const txnid = `SKL_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
  const amountStr = Number(finalAmount).toFixed(2)

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
    udf1: user?.id || "",
    udf2: targetKind,
    udf3: targetSlug,
    udf4: tier,
    udf5: "skylent",
    salt: payu.salt,
  })

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      `payu_txn_${txnid}`,
      JSON.stringify({
        txnid,
        userId: user?.id || null,
        email,
        amount: finalAmount,
        targetKind,
        targetSlug,
        tier,
        status: "initiated",
        createdAt: new Date().toISOString(),
      }),
    )
  } catch {
    // ignore
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
      udf1: user?.id || "",
      udf2: targetKind,
      udf3: targetSlug,
      udf4: tier,
      udf5: "skylent",
    },
  })
})

paymentsRouter.post("/payu/response", async (req, res) => {
  await ensurePayuConfigHydrated()
  const payu = getPayuConfig()
  const body = req.body as Record<string, string>

  const isValid = verifyPayuResponseHash(body, payu.salt)
  const status = body.status
  const txnid = body.txnid || ""
  const userId = body.udf1 || ""
  const targetKind = body.udf2 || ""
  const targetSlug = body.udf3 || ""
  const tier = body.udf4 || "professional"
  const amountStr = body.amount || "0"

  if (!isValid || status !== "success") {
    console.warn(`[PayU Response] Payment failed or unverified: status=${status}, txnid=${txnid}`)
    const reason = encodeURIComponent(body.error_Message || body.unmappedstatus || "Payment was not completed")
    return res.redirect(`/dashboard/student?payment=failed&reason=${reason}&txnid=${txnid}`)
  }

  console.log(`[PayU Response] Verified successful payment: txnid=${txnid}, amount=₹${amountStr}, target=${targetKind}:${targetSlug}`)

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_skylent_runtime_config" ("key", "value", "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      `payu_txn_${txnid}`,
      JSON.stringify({
        txnid,
        userId,
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
        return res.redirect(`/events?registered=true&txnid=${txnid}`)
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
        return res.redirect(`/dashboard/student?enrolled=true&course=${targetSlug}&tier=${tier}&txnid=${txnid}`)
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
          }
        }
        return res.redirect(`/dashboard/student?enrolled=true&program=${targetSlug}&tier=${tier}&txnid=${txnid}`)
      }
    }

    return res.redirect(`/dashboard/student?payment=success&txnid=${txnid}`)
  } catch (error) {
    console.error("[PayU Response] Error fulfilling payment:", error instanceof Error ? error.message : "unknown")
    return res.redirect(`/dashboard/student?payment=success&txnid=${txnid}`)
  }
})
