import { listFacultyDoubtTickets, resolveFacultyDoubtTicket, FACULTY_DOUBT_SLA_MINUTES } from "../lib/doubt-sla.js"
import crypto from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { AssignmentStatus, CurriculumNodeType } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { capabilityAvailable, isDatabaseUnavailableError, isMissingSchemaError, readSchemaCapabilities, UNAVAILABLE_MESSAGES, unavailableBody } from "../lib/schema-capabilities.js"
import { decodeUpload, LESSON_MATERIAL_TYPES, uploadBodySchema } from "../lib/upload-payload.js"
import { generateStorageKey, uploadFile, StorageServiceError } from "../lib/storage.js"

export const facultyRouter = Router()

const TEACHING_SCOPE_UNAVAILABLE =
  "Faculty-to-program/course assignment is not modeled in the database yet. Teaching data and learner submissions cannot be scoped safely for this account."

async function facultyAssignedCourseIds(userId: string): Promise<string[] | null> {
  try {
    const rows = await prisma.facultyCourseAssignment.findMany({
      where: { userId },
      select: { courseId: true },
    })
    return rows.map((row) => row.courseId)
  } catch {
    return null
  }
}

async function facultyMayReadCourse(req: AuthenticatedRequest, courseId: string | null): Promise<boolean> {
  if (hasApiRole(req, "superadmin")) return true
  if (!courseId) return false
  if (!hasApiRole(req, "faculty")) return false
  const assigned = await facultyAssignedCourseIds(req.auth!.user.id)
  return Boolean(assigned?.includes(courseId))
}

function emptyFacultyDashboard() {
  return {
    programs: [],
    courses: [],
    submissions: [],
    pendingReviewCount: 0,
    curriculumSummary: [],
    teachingScopeAvailable: false,
    teachingScopeMessage: TEACHING_SCOPE_UNAVAILABLE,
    cohortAnalyticsAvailable: false,
  }
}

async function loadSuperadminFacultyDashboard() {
  const [programs, courses, submissions] = await Promise.all([
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        duration: true,
        format: true,
        programType: true,
      },
      take: 8,
    }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
        curriculum: {
          orderBy: { order: "asc" },
          include: { nodes: { select: { id: true } } },
        },
      },
      take: 6,
    }),
    prisma.assignmentProgress.findMany({
      where: { status: "submitted" },
      orderBy: { submittedAt: "desc" },
      take: 20,
      select: {
        id: true,
        submittedAt: true,
        user: { select: { displayName: true, email: true } },
        node: { select: { title: true, sourceId: true } },
        enrollment: {
          select: {
            course: { select: { slug: true, title: true } },
            program: { select: { slug: true, name: true } },
          },
        },
        attachments: {
          select: { id: true },
        },
      },
    }),
  ])

  return {
    programs,
    courses: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      moduleCount: course.curriculum.length,
      lessonCount: course.curriculum.reduce((sum, mod) => sum + mod.nodes.length, 0),
    })),
    submissions: submissions.map((row) => ({
      id: row.id,
      studentName: row.user.displayName ?? row.user.email,
      studentEmail: row.user.email,
      lessonTitle: row.node.title,
      lessonKey: row.node.sourceId,
      courseSlug: row.enrollment.course?.slug ?? null,
      courseTitle: row.enrollment.course?.title ?? null,
      programName: row.enrollment.program?.name ?? null,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      attachmentCount: row.attachments.length,
    })),
    pendingReviewCount: submissions.length,
    curriculumSummary: [],
    teachingScopeAvailable: true,
    teachingScopeMessage: null,
    cohortAnalyticsAvailable: false,
  }
}

async function loadAssignedFacultyDashboard(userId: string) {
  const assigned = await facultyAssignedCourseIds(userId)
  if (!assigned || assigned.length === 0) return emptyFacultyDashboard()
  const courses = await prisma.course.findMany({
    where: { id: { in: assigned } },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      curriculum: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          nodes: { select: { id: true, title: true, moduleId: true } },
        },
      },
    },
  })
  const submissions = await prisma.assignmentProgress.findMany({
    where: {
      status: "submitted",
      node: { module: { courseId: { in: assigned } } },
    },
    orderBy: { submittedAt: "desc" },
    take: 20,
    select: {
      id: true,
      submittedAt: true,
      user: { select: { displayName: true, email: true } },
      node: { select: { title: true, sourceId: true } },
      enrollment: {
        select: {
          course: { select: { slug: true, title: true } },
          program: { select: { slug: true, name: true } },
        },
      },
      attachments: { select: { id: true } },
    },
  })
  return {
    programs: [],
    courses: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      moduleCount: course.curriculum.length,
      lessonCount: course.curriculum.reduce((sum, mod) => sum + mod.nodes.length, 0),
    })),
    submissions: submissions.map((row) => ({
      id: row.id,
      studentName: row.user.displayName ?? row.user.email,
      studentEmail: row.user.email,
      lessonTitle: row.node.title,
      lessonKey: row.node.sourceId,
      courseSlug: row.enrollment.course?.slug ?? null,
      courseTitle: row.enrollment.course?.title ?? null,
      programName: row.enrollment.program?.name ?? null,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      attachmentCount: row.attachments.length,
    })),
    pendingReviewCount: submissions.length,
    curriculumSummary: courses.flatMap((course) =>
      course.curriculum.map((module) => ({
        label: module.title,
        detail: `${course.title} · ${module.nodes.length} lectures`,
        status: "current",
      })),
    ),
    teachingScopeAvailable: true,
    teachingScopeMessage: null,
    cohortAnalyticsAvailable: false,
  }
}

facultyRouter.get("/dashboard", requireAuth, requireRoles("faculty", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    const data = hasApiRole(req, "superadmin")
      ? await loadSuperadminFacultyDashboard()
      : await loadAssignedFacultyDashboard(req.auth!.user.id)
    res.json({ data })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Faculty dashboard is not available right now.", code: "unavailable" })
    }
    console.error("Failed to load faculty dashboard:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load faculty dashboard" })
  }
})

const gradeSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(10000).optional(),
})

const submissionIdSchema = z.object({
  submissionId: z.string().uuid(),
})

facultyRouter.get(
  "/submissions/:submissionId",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const parsed = submissionIdSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid submission ID" })
    }

    try {
      const grading = (await readSchemaCapabilities()).assignmentGrading
      const submission = await prisma.assignmentProgress.findUnique({
        where: { id: parsed.data.submissionId },
        select: {
          id: true,
          status: true,
          responseText: true,
          submittedAt: true,
          ...(grading ? { grade: true, feedback: true, gradedAt: true } : {}),
          user: { select: { id: true, displayName: true, email: true } },
          node: {
            select: {
              id: true,
              title: true,
              sourceId: true,
              module: {
                select: {
                  title: true,
                  course: { select: { id: true, slug: true, title: true } },
                },
              },
            },
          },
          enrollment: {
            select: {
              course: { select: { slug: true, title: true } },
              program: { select: { slug: true, name: true } },
            },
          },
          attachments: {
            select: { id: true, fileName: true, mimeType: true, byteSize: true, storageProvider: true },
          },
        },
      })

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" })
      }
      const courseId = submission.node.module.course?.id ?? null
      if (!(await facultyMayReadCourse(req, courseId))) {
        return res.status(403).json({ error: "This submission is outside your teaching assignment" })
      }

      res.json({
        data: {
          id: submission.id,
          status: submission.status,
          responseText: submission.responseText,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
          grade: "grade" in submission ? submission.grade : null,
          feedback: "feedback" in submission ? submission.feedback : null,
          gradedAt: "gradedAt" in submission && submission.gradedAt ? submission.gradedAt.toISOString() : null,
          student: {
            id: submission.user.id,
            name: submission.user.displayName ?? submission.user.email,
            email: submission.user.email,
          },
          lesson: {
            id: submission.node.id,
            title: submission.node.title,
            key: submission.node.sourceId,
            moduleTitle: submission.node.module.title,
          },
          course: submission.enrollment.course
            ? { slug: submission.enrollment.course.slug, title: submission.enrollment.course.title }
            : null,
          program: submission.enrollment.program
            ? { slug: submission.enrollment.program.slug, name: submission.enrollment.program.name }
            : null,
          attachments: submission.attachments,
        },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json({ error: "Assignment grading is not available yet.", code: "unavailable" })
      }
      console.error("Failed to get submission:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to get submission" })
    }
  },
)

facultyRouter.post(
  "/submissions/:submissionId/grade",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const idParsed = submissionIdSchema.safeParse(req.params)
    const bodyParsed = gradeSchema.safeParse(req.body)
    if (!idParsed.success || !bodyParsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: bodyParsed.success ? undefined : bodyParsed.error.flatten().fieldErrors,
      })
    }

    try {
      const grading = (await readSchemaCapabilities()).assignmentGrading
      if (!grading) {
        return res.status(503).json({ error: "Assignment grading is not available yet.", code: "unavailable" })
      }

      const submission = await prisma.assignmentProgress.findUnique({
        where: { id: idParsed.data.submissionId },
        select: { id: true, status: true, node: { select: { module: { select: { courseId: true } } } } },
      })

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" })
      }
      if (!(await facultyMayReadCourse(req, submission.node.module.courseId))) {
        return res.status(403).json({ error: "This submission is outside your teaching assignment" })
      }

      if (submission.status !== AssignmentStatus.submitted && submission.status !== AssignmentStatus.graded) {
        return res.status(400).json({ error: "Only submitted assignments can be graded" })
      }

      const updated = await prisma.assignmentProgress.update({
        where: { id: submission.id },
        data: {
          status: AssignmentStatus.graded,
          grade: bodyParsed.data.grade,
          feedback: bodyParsed.data.feedback ?? null,
          gradedById: req.auth!.user.id,
          gradedAt: new Date(),
        },
        select: { id: true, status: true, grade: true, feedback: true, gradedAt: true },
      })

      res.json({
        data: {
          id: updated.id,
          status: updated.status,
          grade: updated.grade,
          feedback: updated.feedback,
          gradedAt: updated.gradedAt?.toISOString() ?? null,
        },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json({ error: "Assignment grading is not available yet.", code: "unavailable" })
      }
      console.error("Failed to grade submission:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to grade submission" })
    }
  },
)

facultyRouter.get(
  "/submissions",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const status = req.query.status as string | undefined
    const courseSlug = req.query.courseSlug as string | undefined
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0)

    const where: Record<string, unknown> = {}
    if (status === "submitted") {
      where.status = AssignmentStatus.submitted
    } else if (status === "graded") {
      where.status = AssignmentStatus.graded
    } else {
      where.status = { in: [AssignmentStatus.submitted, AssignmentStatus.graded] }
    }

    if (courseSlug) {
      where.enrollment = { course: { slug: courseSlug } }
    }
    try {
      if (!hasApiRole(req, "superadmin")) {
        const assigned = await facultyAssignedCourseIds(req.auth!.user.id)
        if (!assigned || assigned.length === 0) {
          return res.json({ data: [], meta: { total: 0, limit, offset } })
        }
        where.node = { module: { courseId: { in: assigned } } }
      }
      const grading = (await readSchemaCapabilities()).assignmentGrading
      if (!grading && status === "graded") {
        return res.status(503).json({ error: "Assignment grading is not available yet.", code: "unavailable" })
      }
      if (!grading) {
        where.status = AssignmentStatus.submitted
      }
      const [submissions, total] = await Promise.all([
        prisma.assignmentProgress.findMany({
          where,
          orderBy: { submittedAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            submittedAt: true,
            ...(grading ? { grade: true, gradedAt: true } : {}),
            user: { select: { displayName: true, email: true } },
            node: { select: { title: true, sourceId: true } },
            enrollment: {
              select: {
                course: { select: { slug: true, title: true } },
                program: { select: { slug: true, name: true } },
              },
            },
          },
        }),
        prisma.assignmentProgress.count({ where }),
      ])

      res.json({
        data: submissions.map((row) => ({
          id: row.id,
          status: row.status,
          studentName: row.user.displayName ?? row.user.email,
          studentEmail: row.user.email,
          lessonTitle: row.node.title,
          lessonKey: row.node.sourceId,
          courseSlug: row.enrollment.course?.slug ?? null,
          courseTitle: row.enrollment.course?.title ?? null,
          programName: row.enrollment.program?.name ?? null,
          submittedAt: row.submittedAt?.toISOString() ?? null,
          grade: "grade" in row ? row.grade : null,
          gradedAt: "gradedAt" in row && row.gradedAt ? row.gradedAt.toISOString() : null,
        })),
        meta: { total, limit, offset },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json({ error: "Assignment grading is not available yet.", code: "unavailable" })
      }
      console.error("Failed to list submissions:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to list submissions" })
    }
  },
)

const facultyLectureSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(8000).optional(),
  nodeType: z.nativeEnum(CurriculumNodeType).default(CurriculumNodeType.NOTES),
})

facultyRouter.post(
  "/courses/:courseId/lectures",
  requireAuth,
  requireRoles("faculty"),
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const params = z.object({ courseId: z.string().uuid() }).safeParse(req.params)
    const body = facultyLectureSchema.safeParse(req.body)
    if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
    try {
      if (!(await facultyMayReadCourse(req, params.data.courseId))) {
        return res.status(403).json({ error: "This course is outside your teaching assignment" })
      }
      const module = await prisma.curriculumModule.findFirst({
        where: { id: body.data.moduleId, courseId: params.data.courseId },
        include: { nodes: { select: { id: true } } },
      })
      if (!module) return res.status(404).json({ error: "Module not found on this course" })
      if (body.data.nodeType === CurriculumNodeType.QUIZ) {
        return res.status(403).json({ error: "Teachers cannot configure quizzes from this action" })
      }
      if (!(await capabilityAvailable("curriculumNodeNotes"))) {
        return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
      }
      const created = await prisma.curriculumNode.create({
        data: {
          moduleId: module.id,
          title: body.data.title,
          summary: body.data.summary ?? null,
          nodeType: body.data.nodeType,
          order: module.nodes.length,
          sourceId: `lec-${crypto.randomUUID()}`,
        },
      })
      res.status(201).json({
        data: { id: created.id, moduleId: module.id, title: created.title, nodeType: created.nodeType },
      })
    } catch (error) {
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
      }
      console.error("Failed to create faculty lecture:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to create lecture" })
    }
  },
)

facultyRouter.post(
  "/courses",
  requireAuth,
  requireRoles("faculty"),
  requireCsrf,
  async (_req, res) => {
    res.status(403).json({ error: "Teachers cannot create courses" })
  },
)

facultyRouter.delete(
  "/courses/:courseId/modules/:moduleId",
  requireAuth,
  requireRoles("faculty"),
  requireCsrf,
  async (_req, res) => {
    res.status(403).json({ error: "Teachers cannot delete modules" })
  },
)

facultyRouter.post(
  "/courses/:courseId/lectures/:lectureId/materials",
  requireAuth,
  requireRoles("faculty"),
  requireCsrf,
  async (req: AuthenticatedRequest, res) => {
    const params = z.object({ courseId: z.string().uuid(), lectureId: z.string().uuid() }).safeParse(req.params)
    const body = uploadBodySchema.safeParse(req.body)
    if (!params.success || !body.success) return res.status(400).json({ error: "Validation failed" })
    const decoded = decodeUpload(body.data, LESSON_MATERIAL_TYPES)
    if ("error" in decoded) return res.status(400).json({ error: decoded.error })
    try {
      if (!(await facultyMayReadCourse(req, params.data.courseId))) {
        return res.status(403).json({ error: "This course is outside your teaching assignment" })
      }
      const lecture = await prisma.curriculumNode.findFirst({
        where: { id: params.data.lectureId, module: { courseId: params.data.courseId } },
        select: { id: true },
      })
      if (!lecture) return res.status(404).json({ error: "Lecture not found on this course" })
      const key = generateStorageKey(`courses/${params.data.courseId}/materials`, body.data.fileName)
      const stored = await uploadFile(key, decoded.data, { contentType: body.data.contentType })
      const row = await prisma.lessonMaterial.create({
        data: {
          nodeId: lecture.id,
          fileName: body.data.fileName,
          mimeType: body.data.contentType,
          byteSize: decoded.data.length,
          storageProvider: stored.provider,
          storageKey: stored.key,
        },
      })
      res.status(201).json({ data: { id: row.id, fileName: row.fileName, byteSize: row.byteSize } })
    } catch (error) {
      if (error instanceof StorageServiceError) {
        return res.status(503).json({ error: "File storage is not configured. The file was not saved." })
      }
      if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
        return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.authoring))
      }
      console.error("Failed to store faculty lesson material:", error instanceof Error ? error.name : "unknown")
      res.status(500).json({ error: "Failed to store lesson material" })
    }
  },
)


facultyRouter.get("/doubts", requireAuth, requireRoles("faculty", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    let courseSlugs: string[] | null = null
    if (!hasApiRole(req, "superadmin")) {
      const assignedIds = await facultyAssignedCourseIds(req.auth!.user.id)
      if (!assignedIds || assignedIds.length === 0) {
        return res.json({ data: [], meta: { slaMinutes: FACULTY_DOUBT_SLA_MINUTES, openCount: 0 } })
      }
      const courses = await prisma.course.findMany({
        where: { id: { in: assignedIds } },
        select: { slug: true },
      })
      courseSlugs = courses.map((c) => c.slug)
    }
    const tickets = listFacultyDoubtTickets(courseSlugs)
    const openCount = tickets.filter((t) => t.status === "open").length
    res.json({ data: tickets, meta: { slaMinutes: FACULTY_DOUBT_SLA_MINUTES, openCount } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Faculty doubts queue is not available right now.", code: "unavailable" })
    }
    console.error("Failed to list faculty doubts:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to list faculty doubts" })
  }
})

facultyRouter.post("/doubts/:id/resolve", requireAuth, requireRoles("faculty", "superadmin"), requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = typeof req.params.id === "string" ? req.params.id.trim() : ""
  const body = z.object({ resolutionNote: z.string().trim().max(1000).optional() }).safeParse(req.body ?? {})
  if (!id || !body.success) return res.status(400).json({ error: "Invalid request" })
  try {
    const resolved = resolveFacultyDoubtTicket(id, req.auth!.user.id, body.data.resolutionNote)
    if (!resolved) return res.status(404).json({ error: "Doubt ticket not found" })
    res.json({ data: resolved })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Faculty doubts queue is not available right now.", code: "unavailable" })
    }
    console.error("Failed to resolve faculty doubt:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to resolve faculty doubt" })
  }
})
