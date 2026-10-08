import { randomBytes } from "node:crypto"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { resolveCourseEnrollment } from "../../lib/lms.js"

export const skylentCertificatesRouter = Router()

const verifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many verification attempts. Try again later." })
  },
})

function courseCode(slug: string) {
  return slug.split("-").map((part) => part[0] ?? "").join("").toUpperCase().slice(0, 4) || "SK"
}

/** A certificate name must be a real full name. Email is never acceptable. */
export function certificateLearnerName(user: { displayName: string | null; email: string }): string | null {
  const name = user.displayName?.trim() ?? ""
  if (!name || name.includes("@")) return null
  if (name.toLowerCase() === user.email.trim().toLowerCase()) return null
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null
  if (parts.some((part) => part.includes("@"))) return null
  return parts.join(" ")
}

function publicLearnerName(stored: string): string {
  if (!stored.trim() || stored.includes("@")) return "Learner"
  return stored
}

function issuedView(cert: { code: string; learnerName: string; courseTitle: string; issuedAt: Date }) {
  return {
    code: cert.code,
    learnerName: publicLearnerName(cert.learnerName),
    courseTitle: cert.courseTitle,
    issuedAt: cert.issuedAt,
  }
}

/** Learner claims a certificate. Server checks eligibility; never trusts the browser. */
skylentCertificatesRouter.post("/issue", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const body = z.object({ courseSlug: z.string().min(1).max(120) }).safeParse(req.body ?? {})
  if (!body.success) return void res.status(400).json({ error: "Invalid request" })
  const user = req.auth!.user
  const learnerName = certificateLearnerName(user)
  if (!learnerName) {
    return void res.status(400).json({ error: "Add your full name before a certificate can be issued." })
  }
  const course = await prisma.course.findFirst({ where: { slug: body.data.courseSlug } })
  if (!course) return void res.status(404).json({ error: "Course not found" })
  const enrollment = await resolveCourseEnrollment(user.id, course.id)
  if (!enrollment?.certificateEligible) return void res.status(403).json({ error: "Complete every lesson first." })

  const existing = await prisma.skylentCertificate.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  })
  if (existing) return void res.json({ data: issuedView(existing) })

  const code = `SKL-${new Date().getFullYear()}-${courseCode(course.slug)}-${randomBytes(3).toString("hex").toUpperCase()}`
  const cert = await prisma.skylentCertificate.create({
    data: { code, userId: user.id, courseId: course.id, learnerName, courseTitle: course.title },
  })
  res.status(201).json({ data: issuedView(cert) })
})

skylentCertificatesRouter.get("/mine", requireAuth, async (req: AuthenticatedRequest, res) => {
  const rows = await prisma.skylentCertificate.findMany({
    where: { userId: req.auth!.user.id },
    orderBy: { issuedAt: "desc" },
  })
  // The learner's own list also says whether a certificate was revoked, so the UI never offers
  // "Verify" for one the public check will reject. The public verify response is unchanged.
  res.json({ data: rows.map((row) => ({ ...issuedView(row), revoked: row.revoked })) })
})

/** Public check. Returns only name, course, and date. */
skylentCertificatesRouter.get("/verify/:code", verifyLimit, async (req, res) => {
  const rawCode = req.params.code
  const normalized = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.toUpperCase()
  const code = z.string().regex(/^SKL-\d{4}-[A-Z0-9]{1,6}-[A-Z0-9]{4,8}$/).safeParse(normalized)
  if (!code.success) return void res.status(400).json({ error: "Invalid certificate ID" })
  const cert = await prisma.skylentCertificate.findUnique({ where: { code: code.data } })
  if (!cert || cert.revoked) return void res.status(404).json({ data: { valid: false } })
  res.json({
    data: {
      valid: true,
      ...issuedView(cert),
    },
  })
})
