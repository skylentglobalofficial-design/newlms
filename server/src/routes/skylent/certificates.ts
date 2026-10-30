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

const issuedProgrammeCertCache = new Map<
  string,
  {
    code: string
    userId: string
    learnerName: string
    courseTitle: string
    courseSlug: string | null
    programSlug: string
    issuedAt: Date
    revoked: boolean
  }
>()

export function buildCertificateEvidenceSummary(cert: {
  code: string
  learnerName: string
  courseTitle: string
  issuedAt: Date
  evidenceSummary?: string
}) {
  const isProgramme = cert.code.includes("-PGM") || cert.code.includes("-PRG-")
  const evidenceSummary =
    cert.evidenceSummary ??
    (isProgramme
      ? "Verified completion of all linked programme courses, modules, and applied case assessments."
      : "Verified completion of all required course lessons, quizzes, and applied case work.")
  return {
    code: cert.code,
    learnerName: publicLearnerName(cert.learnerName),
    courseTitle: cert.courseTitle,
    issuedAt: cert.issuedAt,
    issuer: SKYLENT_CREDENTIAL_ISSUER,
    credentialStandard: SKYLENT_CREDENTIAL_STANDARD,
    verificationStandard: SKYLENT_CREDENTIAL_STANDARD,
    credentialLevel: isProgramme ? ("programme" as const) : ("course" as const),
    evidenceSummary,
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
    const caps = await readSchemaCapabilities()
    let dbProgCerts: Array<{ code: string; learnerName: string; programTitle: string; programSlug: string; issuedAt: Date; revoked: boolean; evidenceSummary: string | null }> = []
    if (caps.programmeCertificates) {
      dbProgCerts = await prisma.programmeCertificate.findMany({
        where: { userId: req.auth!.user.id },
        orderBy: { issuedAt: "desc" },
      })
    }
    const progMap = new Map<string, any>()
    for (const cp of issuedProgrammeCertCache.values()) {
      if (cp.userId === req.auth!.user.id && !cp.revoked) {
        progMap.set(cp.code, {
          ...issuedLearnerView(cp, cp.courseSlug),
          programSlug: cp.programSlug,
          revoked: false,
        })
      }
    }
    for (const dp of dbProgCerts) {
      progMap.set(dp.code, {
        ...issuedLearnerView({ code: dp.code, learnerName: dp.learnerName, courseTitle: dp.programTitle, issuedAt: dp.issuedAt }, null),
        programSlug: dp.programSlug,
        revoked: dp.revoked,
      })
    }
    res.json({
      data: [
        ...progMap.values(),
        ...rows.map((row) => ({
          ...issuedLearnerView(row, slugById.get(row.courseId) ?? null),
          revoked: row.revoked,
        })),
      ],
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return void sendCertificateUnavailable(res, error)
    }
    console.error("Failed to load certificates:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Your certificates could not be loaded. Try again later." })
  }
})

/** Public check. Returns name, course, date, and credential issuer metadata. */
skylentCertificatesRouter.get("/verify/:code", verifyLimit, async (req, res) => {
  const rawCode = req.params.code
  const normalized = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.toUpperCase()
  const code = z.string().regex(/^SKL-\d{4}-[A-Z0-9]{1,6}-[A-Z0-9]{4,8}$/).safeParse(normalized)
  if (!code.success) return void res.status(400).json({ error: "Invalid certificate ID" })
  // A failed probe or lookup is not "no such certificate". Both stay inside this try
  // so a dead database cannot escape as an HTML error or a 404.
  let cert: { code: string; learnerName: string; courseTitle: string; issuedAt: Date; revoked?: boolean; evidenceSummary?: string } | null =
    issuedProgrammeCertCache.get(code.data) ?? null
  if (!cert) {
    try {
      if (!(await certificatesReady())) return void res.status(503).json(CERTIFICATE_UNAVAILABLE)
      const caps = await readSchemaCapabilities()
      if (caps.programmeCertificates) {
        const dbProg = await prisma.programmeCertificate.findUnique({ where: { code: code.data } })
        if (dbProg) {
          cert = {
            code: dbProg.code,
            learnerName: dbProg.learnerName,
            courseTitle: dbProg.programTitle,
            issuedAt: dbProg.issuedAt,
            evidenceSummary: dbProg.evidenceSummary ?? undefined,
            revoked: dbProg.revoked,
          }
        }
      }
      if (!cert) {
        cert = await prisma.skylentCertificate.findUnique({ where: { code: code.data } })
      }
    } catch (error) {
      return void sendCertificateUnavailable(res, error)
    }
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
    const caps = await readSchemaCapabilities()
    let code: string
    let issuedAt: Date
    let isExisting = false

    if (caps.programmeCertificates) {
      const dbExisting = await prisma.programmeCertificate.findUnique({
        where: { userId_programSlug: { userId: user.id, programSlug: program.slug } },
      })
      if (dbExisting) {
        code = dbExisting.code
        issuedAt = dbExisting.issuedAt
        isExisting = true
      } else {
        code = buildProgrammeCertificateCode(program.slug)
        const created = await prisma.programmeCertificate.create({
          data: {
            code,
            userId: user.id,
            programSlug: program.slug,
            learnerName: publicLearnerName(learnerName),
            programTitle: program.name,
            evidenceSummary: "Verified completion of all linked programme courses, modules, and applied case assessments.",
          },
        })
        issuedAt = created.issuedAt
      }
    } else {
      const existingProg = [...issuedProgrammeCertCache.values()].find(
        (item) => item.userId === user.id && item.programSlug === program.slug && !item.revoked,
      )
      code = existingProg?.code ?? buildProgrammeCertificateCode(program.slug)
      issuedAt = existingProg?.issuedAt ?? new Date()
      isExisting = Boolean(existingProg)
    }

    issuedProgrammeCertCache.set(code, {
      code,
      userId: user.id,
      learnerName: publicLearnerName(learnerName),
      courseTitle: program.name,
      courseSlug: primaryCourse.slug,
      programSlug: program.slug,
      issuedAt,
      revoked: false,
    })
    const summary = buildCertificateEvidenceSummary({
      code,
      learnerName,
      courseTitle: program.name,
      issuedAt,
    })
    return void res.status(isExisting ? 200 : 201).json({
      data: {
        ...summary,
        programSlug: program.slug,
        programTitle: program.name,
        courseSlug: primaryCourse.slug,
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
