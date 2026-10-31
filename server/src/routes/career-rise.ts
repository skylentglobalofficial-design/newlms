import { Prisma } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { recordAdminAudit } from "../lib/admin-audit.js"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"
import {
  careerRiseScopeKey,
  findCareerRiseEnrolment,
  measureCareerRise,
} from "../lib/career-rise.js"

export const careerRiseRouter = Router()

export function buildCareerRiseMockDefenseHref(slug: string): string {
  return `/career-os/interviews?track=${encodeURIComponent(slug)}`
}

const CAREER_RISE_UNAVAILABLE = {
  error: "Career Rise cannot be checked right now.",
  code: "unavailable" as const,
}

function sendCareerRiseFailure(res: import("express").Response, error: unknown, fallback: string) {
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    return res.status(503).json(CAREER_RISE_UNAVAILABLE)
  }
  console.error(fallback, error instanceof Error ? error.name : "unknown")
  return res.status(500).json({ error: fallback })
}

const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const enrolSchema = z.object({
  courseSlug: slugSchema.optional(),
  programSlug: slugSchema.optional(),
}).refine((value) => Boolean(value.courseSlug) !== Boolean(value.programSlug), {
  message: "Send either a course or a programme",
})

careerRiseRouter.use(requireAuth)

careerRiseRouter.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const enrollments = await prisma.userEnrollment.findMany({
      where: { userId, status: { in: ["active", "completed"] } },
      include: {
        course: { select: { id: true, slug: true, title: true } },
        program: {
          select: {
            id: true,
            slug: true,
            name: true,
            programCourses: { select: { course: { select: { id: true, slug: true, title: true } } } },
          },
        },
      },
    })

    const scopes: Array<{ courseId?: string; programId?: string; slug: string; title: string; kind: "course" | "program" }> = []
    const seen = new Set<string>()
    for (const entry of enrollments) {
      if (entry.course) {
        const key = careerRiseScopeKey({ courseId: entry.course.id })
        if (!seen.has(key)) {
          seen.add(key)
          scopes.push({ courseId: entry.course.id, slug: entry.course.slug, title: entry.course.title, kind: "course" })
        }
      }
      if (entry.program) {
        const key = careerRiseScopeKey({ programId: entry.program.id })
        if (!seen.has(key)) {
          seen.add(key)
          scopes.push({ programId: entry.program.id, slug: entry.program.slug, title: entry.program.name, kind: "program" })
        }
        for (const link of entry.program.programCourses) {
          const courseKey = careerRiseScopeKey({ courseId: link.course.id })
          if (seen.has(courseKey)) continue
          seen.add(courseKey)
          scopes.push({ courseId: link.course.id, slug: link.course.slug, title: link.course.title, kind: "course" })
        }
      }
    }

    const data = []
    for (const scope of scopes) {
      const completion = await measureCareerRise(userId, scope)
      const enrolment = await findCareerRiseEnrolment(userId, scope)
      data.push({
        kind: scope.kind,
        slug: scope.slug,
        title: scope.title,
        totalModules: completion.totalModules,
        completedModules: completion.completedModules,
        percent: completion.percent,
        thresholdPercent: completion.thresholdPercent,
        eligible: completion.eligible,
        enrolled: Boolean(enrolment),
        mockDefenseHref: buildCareerRiseMockDefenseHref(scope.slug),
        milestones: {
          curriculumGatePassed: completion.eligible,
          caseEvidenceRequired: true,
          mockDefenseHref: buildCareerRiseMockDefenseHref(scope.slug),
        },
      })
    }
    res.json({ data })
  } catch (error) {
    sendCareerRiseFailure(res, error, "Failed to read Career Rise eligibility")
  }
})

careerRiseRouter.post("/enrolments", requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = enrolSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Send either a course or a programme" })
  }
  try {
    const userId = req.auth!.user.id
    const course = parsed.data.courseSlug
      ? await prisma.course.findUnique({ where: { slug: parsed.data.courseSlug }, select: { id: true, slug: true, title: true } })
      : null
    const program = parsed.data.programSlug
      ? await prisma.program.findUnique({ where: { slug: parsed.data.programSlug }, select: { id: true, slug: true, name: true } })
      : null
    if (parsed.data.courseSlug && !course) return res.status(404).json({ error: "Course not found" })
    if (parsed.data.programSlug && !program) return res.status(404).json({ error: "Programme not found" })

    const scope = course ? { courseId: course.id } : { programId: program!.id }
    const learning = await prisma.userEnrollment.findFirst({
      where: course
        ? {
            userId,
            status: { in: ["active", "completed"] },
            OR: [
              { courseId: course.id },
              { program: { programCourses: { some: { courseId: course.id } } } },
            ],
          }
        : { userId, programId: program!.id, status: { in: ["active", "completed"] } },
      select: { id: true },
    })
    if (!learning) {
      return res.status(403).json({ error: "Career Rise stays closed until you are enrolled in that curriculum" })
    }

    const completion = await measureCareerRise(userId, scope)
    if (!completion.eligible) {
      return res.status(403).json({
        error: "Career Rise stays closed until 60% of the curriculum is complete",
        percent: completion.percent,
        completedModules: completion.completedModules,
        totalModules: completion.totalModules,
      })
    }

    const existing = await findCareerRiseEnrolment(userId, scope)
    if (existing) {
      return res.json({
        data: {
          id: existing.id,
          enrolled: true,
          createdAt: existing.createdAt.toISOString(),
          duplicate: true,
        },
      })
    }

    let created: Awaited<ReturnType<typeof prisma.careerRiseEnrolment.create>>
    try {
      created = await prisma.careerRiseEnrolment.create({
        data: {
          userId,
          scopeKey: careerRiseScopeKey(scope),
          courseId: course?.id ?? null,
          programId: program?.id ?? null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const raced = await findCareerRiseEnrolment(userId, scope)
        if (raced) {
          return res.json({
            data: {
              id: raced.id,
              enrolled: true,
              createdAt: raced.createdAt.toISOString(),
              duplicate: true,
            },
          })
        }
      }
      throw error
    }
    await recordAdminAudit({
      actorId: userId,
      action: "career_rise.enrol",
      targetType: "CareerRiseEnrolment",
      targetId: created.id,
      summary: `Learner enrolled in Career Rise for ${course?.slug ?? program?.slug}`,
    })
    return res.status(201).json({
      data: { id: created.id, enrolled: true, createdAt: created.createdAt.toISOString(), duplicate: false },
    })
  } catch (error) {
    sendCareerRiseFailure(res, error, "Failed to enrol in Career Rise")
  }
})

careerRiseRouter.get("/workspace", async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({
    courseSlug: slugSchema.optional(),
    programSlug: slugSchema.optional(),
  }).refine((value) => Boolean(value.courseSlug) !== Boolean(value.programSlug), {
    message: "Send either a course or a programme",
  }).safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: "Send either a course or a programme" })

  try {
    const userId = req.auth!.user.id
    const course = parsed.data.courseSlug
      ? await prisma.course.findUnique({ where: { slug: parsed.data.courseSlug }, select: { id: true, slug: true, title: true } })
      : null
    const program = parsed.data.programSlug
      ? await prisma.program.findUnique({ where: { slug: parsed.data.programSlug }, select: { id: true, slug: true, name: true } })
      : null
    if (!course && !program) return res.status(404).json({ error: "Curriculum not found" })
    const scope = course ? { courseId: course.id } : { programId: program!.id }
    const enrolment = await findCareerRiseEnrolment(userId, scope)
    if (!enrolment) {
      return res.status(403).json({ error: "Career Rise is not open for this curriculum", code: "CAREER_RISE_LOCKED" })
    }
    const targetSlug = course?.slug ?? program?.slug ?? "data-analytics"
    res.json({
      data: {
        enrolled: true,
        title: course?.title ?? program?.name,
        slug: targetSlug,
        mockDefenseHref: buildCareerRiseMockDefenseHref(targetSlug),
        coaching: null,
        placements: null,
        mentorship: null,
        note: "Enrolment is recorded. Career coaching, placements, and mentorship are not provided by this product yet.",
      },
    })
  } catch (error) {
    sendCareerRiseFailure(res, error, "Failed to open Career Rise")
  }
})
