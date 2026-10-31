import { randomBytes } from "node:crypto"
import { Prisma } from "@prisma/client"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { z } from "zod"
import { prisma } from "../../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../../lib/auth.js"
import { computeProgress, findCourseBySlug, loadLessonStates, resolveCourseEnrollment } from "../../lib/lms.js"
import { isDatabaseUnavailableError, isMissingSchemaError, readSchemaCapabilities } from "../../lib/schema-capabilities.js"

export const skylentCertificatesRouter = Router()

export const SKYLENT_CREDENTIAL_ISSUER = "Skylent Global Pvt. Ltd."
export const SKYLENT_CREDENTIAL_STANDARD = "Skylent Verified Skill & Completion Record v1"

export const EXEMPLAR_CERTIFICATES = [
  {
    code: "SKL-2026-DA-EXEMPLAR",
    learnerName: "Aarav Sharma",
    courseTitle: "Data Analytics with Gen AI",
    courseSlug: "data-analytics",
    issuedAt: new Date("2026-10-15T10:00:00Z"),
    score: "96/100 · Exemplar Capstone Dossier",
    issuer: SKYLENT_CREDENTIAL_ISSUER,
    credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
    evidenceSummary: "Northwind Sales & Revenue Leakage Audit: Identified 14.5% discount leakage in Apparel category across 166 validated order lines with SQL aggregation.",
  },
  {
    code: "SKL-2026-PM-EXEMPLAR",
    learnerName: "Priya Nair",
    courseTitle: "Product Management",
    courseSlug: "product-management",
    issuedAt: new Date("2026-10-18T14:30:00Z"),
    score: "95/100 · Exemplar Capstone Dossier",
    issuer: SKYLENT_CREDENTIAL_ISSUER,
    credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
    evidenceSummary: "Harbor Desk Operations Triage PRD: Scoped weekend exception ownership workflow for 12 stores under 2-engineer, 6-week resource constraint.",
  },
  {
    code: "SKL-2026-AI-EXEMPLAR",
    learnerName: "Rohan Verma",
    courseTitle: "Generative AI & LLM Systems",
    courseSlug: "generative-ai",
    issuedAt: new Date("2026-10-22T09:15:00Z"),
    score: "98/100 · Exemplar Capstone Dossier",
    issuer: SKYLENT_CREDENTIAL_ISSUER,
    credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
    evidenceSummary: "Enterprise Grounded RAG with Citation Policy: Evaluated hallucination bounds and prompt injection security with automated test harness.",
  },
] as const

export function resolveExemplarCertificate(code: string) {
  const norm = code.trim().toUpperCase()
  return EXEMPLAR_CERTIFICATES.find((item) => item.code === norm) ?? null
}

const verifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many verification attempts. Try again later." })
  },
})

export function buildProgrammeCertificateCode(programSlug: string, year = new Date().getFullYear(), randomHex?: string) {
  const suffix = (randomHex ?? randomBytes(4).toString("hex")).toUpperCase().slice(0, 8)
  return `SKL-${year}-PGM${courseCode(programSlug).slice(0, 3)}-${suffix}`
}

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

export function buildCertificateEvidenceSummary(cert: {
  code: string
  learnerName: string
  courseTitle: string
  issuedAt: Date
}) {
  return {
    code: cert.code,
    learnerName: publicLearnerName(cert.learnerName),
    courseTitle: cert.courseTitle,
    issuedAt: cert.issuedAt,
    issuer: SKYLENT_CREDENTIAL_ISSUER,
    credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
  }
}

function issuedView(cert: { code: string; learnerName: string; courseTitle: string; issuedAt: Date }) {
  return buildCertificateEvidenceSummary(cert)
}

function issuedLearnerView(cert: { code: string; learnerName: string; courseTitle: string; issuedAt: Date }, courseSlug: string | null) {
  return {
    ...issuedView(cert),
    courseSlug,
    verifyPath: `/verify/${cert.code}`,
  }
}

/** A direct course enrolment can be marked issued. A programme enrolment stays programme-scoped. */
async function markDirectCourseIssued(enrollment: { id: string; courseId: string | null; certificateStatus: string; certificateEligible: boolean }, courseId: string) {
  if (enrollment.courseId !== courseId) return
  if (enrollment.certificateStatus === "issued" && enrollment.certificateEligible) return
  await prisma.userEnrollment.update({
    where: { id: enrollment.id },
    data: { certificateStatus: "issued", certificateEligible: true },
  })
}

/** Learner claims a certificate. Eligibility is this course's lessons, not the whole programme. */
const CERTIFICATE_UNAVAILABLE = {
  error: "Certificate check is unavailable right now. Try again later.",
  code: "unavailable" as const,
}

async function certificatesReady() {
  return (await readSchemaCapabilities()).skylentCertificates
}

/** A failed probe is not a missing certificate. The client only sees the fixed unavailable sentence. */
function sendCertificateUnavailable(res: import("express").Response, error: unknown) {
  console.error("Certificate check unavailable:", error instanceof Error ? error.name : "schema check failed")
  res.status(503).json(CERTIFICATE_UNAVAILABLE)
}

skylentCertificatesRouter.post("/issue", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await certificatesReady())) return void res.status(503).json(CERTIFICATE_UNAVAILABLE)
  } catch (error) {
    return void sendCertificateUnavailable(res, error)
  }
  const body = z.object({ courseSlug: z.string().min(1).max(120) }).safeParse(req.body ?? {})
  if (!body.success) return void res.status(400).json({ error: "Invalid request" })
  const user = req.auth!.user
  const learnerName = certificateLearnerName(user)
  if (!learnerName) {
    return void res.status(400).json({ error: "Add your full name before a certificate can be issued." })
  }

  try {
    const course = await findCourseBySlug(body.data.courseSlug)
    if (!course) return void res.status(404).json({ error: "Course not found" })
    const enrollment = await resolveCourseEnrollment(user.id, course.id)
    if (!enrollment) return void res.status(403).json({ error: "Complete every lesson first." })
    const lessonStates = await loadLessonStates(enrollment, course)
    if (!computeProgress(course, lessonStates).allComplete) {
      return void res.status(403).json({ error: "Complete every lesson first." })
    }

    const existing = await prisma.skylentCertificate.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    })
    if (existing) {
      await markDirectCourseIssued(enrollment, course.id)
      return void res.json({ data: issuedLearnerView(existing, course.slug) })
    }

    let cert: Awaited<ReturnType<typeof prisma.skylentCertificate.create>> | null = null
    for (let attempt = 0; attempt < 2 && !cert; attempt += 1) {
      const code = `SKL-${new Date().getFullYear()}-${courseCode(course.slug)}-${randomBytes(4).toString("hex").toUpperCase()}`
      try {
        cert = await prisma.skylentCertificate.create({
          data: { code, userId: user.id, courseId: course.id, learnerName, courseTitle: course.title },
        })
      } catch (error) {
        const uniqueConflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
        if (!uniqueConflict || attempt === 1) throw error
      }
    }
    if (!cert) return void res.status(500).json({ error: "Certificate could not be issued." })
    await markDirectCourseIssued(enrollment, course.id)
    res.status(201).json({ data: issuedLearnerView(cert, course.slug) })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return void sendCertificateUnavailable(res, error)
    }
    console.error("Failed to issue certificate:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Certificate could not be issued." })
  }
})

skylentCertificatesRouter.get("/mine", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await certificatesReady())) return void res.status(503).json(CERTIFICATE_UNAVAILABLE)
  } catch (error) {
    return void sendCertificateUnavailable(res, error)
  }
  try {
    const rows = await prisma.skylentCertificate.findMany({
      where: { userId: req.auth!.user.id },
      orderBy: { issuedAt: "desc" },
    })
    const courses = rows.length
      ? await prisma.course.findMany({
          where: { id: { in: [...new Set(rows.map((row) => row.courseId))] } },
          select: { id: true, slug: true },
        })
      : []
    const slugById = new Map(courses.map((course) => [course.id, course.slug]))
    res.json({
      data: rows.map((row) => ({
        ...issuedLearnerView(row, slugById.get(row.courseId) ?? null),
        revoked: row.revoked,
      })),
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return void sendCertificateUnavailable(res, error)
    }
    console.error("Failed to load certificates:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Your certificates could not be loaded. Try again later." })
  }
})

/** Public check. Returns name, course, date, and credential issuer metadata. Supports public exemplars. */
skylentCertificatesRouter.get("/verify/:code", verifyLimit, async (req, res) => {
  const rawCode = req.params.code
  const normalized = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.toUpperCase()
  const code = z.string().regex(/^SKL-\d{4}-[A-Z0-9]{1,6}-[A-Z0-9]{4,8}$/).safeParse(normalized)
  if (!code.success) return void res.status(400).json({ error: "Invalid certificate ID" })

  const exemplar = resolveExemplarCertificate(normalized || "")
  if (exemplar) {
    return void res.json({
      data: {
        valid: true,
        code: exemplar.code,
        learnerName: exemplar.learnerName,
        courseTitle: exemplar.courseTitle,
        issuedAt: exemplar.issuedAt.toISOString(),
        issuer: exemplar.issuer,
        verificationStandard: exemplar.credentialStandard,
        evidenceSummary: exemplar.evidenceSummary,
        score: exemplar.score,
        isExemplar: true,
      },
    })
  }

  let cert: Awaited<ReturnType<typeof prisma.skylentCertificate.findUnique>>
  try {
    if (!(await certificatesReady())) return void res.status(503).json(CERTIFICATE_UNAVAILABLE)
    cert = await prisma.skylentCertificate.findUnique({ where: { code: code.data } })
  } catch (error) {
    return void sendCertificateUnavailable(res, error)
  }
  if (!cert || cert.revoked) return void res.status(404).json({ data: { valid: false } })
  res.json({
    data: {
      valid: true,
      ...issuedView(cert),
    },
  })
})

skylentCertificatesRouter.post("/issue-programme", requireAuth, requireCsrf, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await certificatesReady())) return void res.status(503).json(CERTIFICATE_UNAVAILABLE)
  } catch (error) {
    return void sendCertificateUnavailable(res, error)
  }
  const body = z.object({ programSlug: z.string().min(1).max(120) }).safeParse(req.body ?? {})
  if (!body.success) return void res.status(400).json({ error: "Invalid request" })
  const user = req.auth!.user
  const learnerName = certificateLearnerName(user)
  if (!learnerName) {
    return void res.status(400).json({ error: "Add your full name before a certificate can be issued." })
  }
  try {
    const program = await prisma.program.findUnique({
      where: { slug: body.data.programSlug },
      include: { programCourses: { include: { course: true }, orderBy: { sortOrder: "asc" } } },
    })
    if (!program || program.programCourses.length === 0) {
      return void res.status(404).json({ error: "Programme not found" })
    }
    for (const link of program.programCourses) {
      const fullCourse = await findCourseBySlug(link.course.slug)
      if (!fullCourse) return void res.status(403).json({ error: "Complete every linked course in the programme first." })
      const enrollment = await resolveCourseEnrollment(user.id, fullCourse.id)
      if (!enrollment) return void res.status(403).json({ error: "Complete every linked course in the programme first." })
      const lessonStates = await loadLessonStates(enrollment, fullCourse)
      if (!computeProgress(fullCourse, lessonStates).allComplete) {
        return void res.status(403).json({ error: "Complete every linked course in the programme first." })
      }
    }
    const primaryCourse = program.programCourses[0].course
    const code = buildProgrammeCertificateCode(program.slug)
    return void res.status(201).json({
      data: {
        code,
        learnerName: publicLearnerName(learnerName),
        programSlug: program.slug,
        programTitle: program.name,
        courseSlug: primaryCourse.slug,
        courseTitle: program.name,
        issuedAt: new Date(),
        issuer: SKYLENT_CREDENTIAL_ISSUER,
        credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
        verifyPath: `/verify/${code}`,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return void sendCertificateUnavailable(res, error)
    }
    console.error("Failed to issue programme certificate:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Programme certificate could not be issued." })
  }
})
