import { randomBytes } from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"

export const skylentCertificatesRouter = Router()

function courseCode(slug: string) {
  return slug.split("-").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 4) || "SK"
}

/** Learner claims a certificate. Server checks 100% eligibility; never trusts the browser. */
skylentCertificatesRouter.post("/issue", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const body = z.object({ courseSlug: z.string().min(1).max(120) }).safeParse(req.body ?? {})
  if (!body.success) return void res.status(400).json({ error: "Invalid request" })
  const user = req.auth!.user
  const course = await prisma.course.findFirst({ where: { slug: body.data.courseSlug } })
  if (!course) return void res.status(404).json({ error: "Course not found" })
  const enrollment = await prisma.userEnrollment.findFirst({ where: { userId: user.id, courseId: course.id } })
  if (!enrollment?.certificateEligible) return void res.status(403).json({ error: "Complete every lesson first." })

  const existing = await prisma.skylentCertificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })
  if (existing) return void res.json({ data: existing })

  const code = `SKL-${new Date().getFullYear()}-${courseCode(course.slug)}-${randomBytes(3).toString("hex").toUpperCase()}`
  const cert = await prisma.skylentCertificate.create({
    data: { code, userId: user.id, courseId: course.id, learnerName: user.displayName ?? user.email, courseTitle: course.title },
  })
  res.status(201).json({ data: cert })
})

skylentCertificatesRouter.get("/mine", requireAuth, async (req: AuthenticatedRequest, res) => {
  const rows = await prisma.skylentCertificate.findMany({ where: { userId: req.auth!.user.id }, orderBy: { issuedAt: "desc" } })
  res.json({ data: rows })
})

/** Public check. Returns only name, course, date — nothing else about the learner. */
skylentCertificatesRouter.get("/verify/:code", async (req, res) => {
  const code = z.string().regex(/^SKL-\d{4}-[A-Z0-9]{1,6}-[A-Z0-9]{4,8}$/).safeParse(req.params.code?.toUpperCase())
  if (!code.success) return void res.status(400).json({ error: "Invalid certificate ID" })
  const cert = await prisma.skylentCertificate.findUnique({ where: { code: code.data } })
  if (!cert || cert.revoked) return void res.status(404).json({ data: { valid: false } })
  res.json({ data: { valid: true, code: cert.code, learnerName: cert.learnerName, courseTitle: cert.courseTitle, issuedAt: cert.issuedAt } })
})
