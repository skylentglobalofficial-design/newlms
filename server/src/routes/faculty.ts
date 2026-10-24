import { Router } from "express"
import { z } from "zod"
import { AssignmentStatus } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { readSchemaCapabilities } from "../lib/schema-capabilities.js"

export const facultyRouter = Router()

const TEACHING_SCOPE_UNAVAILABLE =
  "Faculty-to-program/course assignment is not modeled in the database yet. Teaching data and learner submissions cannot be scoped safely for this account."

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
      include: {
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

facultyRouter.get("/dashboard", requireAuth, requireRoles("faculty", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    const data = hasApiRole(req, "superadmin") ? await loadSuperadminFacultyDashboard() : emptyFacultyDashboard()
    res.json({ data })
  } catch (error) {
    console.error("Failed to load faculty dashboard:", error)
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
                  course: { select: { slug: true, title: true } },
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
      console.error("Failed to get submission:", error)
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
        select: { id: true, status: true },
      })

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" })
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
      console.error("Failed to grade submission:", error)
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
      console.error("Failed to list submissions:", error)
      res.status(500).json({ error: "Failed to list submissions" })
    }
  },
)
