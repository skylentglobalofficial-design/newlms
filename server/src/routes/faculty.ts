import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { isStorageError, readAssignmentArtifact } from "../lib/assignment-attachments.js"

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
          include: { nodes: { orderBy: { order: "asc" } } },
        },
      },
      take: 6,
    }),
    prisma.assignmentProgress.findMany({
      where: { status: "submitted" },
      orderBy: { submittedAt: "desc" },
      take: 20,
      include: {
        user: { select: { displayName: true, email: true } },
        node: { select: { title: true, sourceId: true } },
        enrollment: {
          include: {
            course: { select: { slug: true, title: true } },
            program: { select: { slug: true, name: true } },
          },
        },
        attachments: {
          select: { id: true, fileName: true, mimeType: true, byteSize: true },
        },
      },
    }),
  ])

  const teachingCourse = courses[0]
  const curriculumSummary = teachingCourse
    ? [
        {
          label: "Course",
          detail: teachingCourse.title,
          status: "current",
        },
        {
          label: "Published modules",
          detail: String(teachingCourse.curriculum.length),
          status: "upcoming",
        },
        {
          label: "Submitted assignments",
          detail: String(submissions.length),
          status: "current",
        },
      ]
    : []

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
      attachments: row.attachments.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        byteSize: file.byteSize,
      })),
    })),
    pendingReviewCount: submissions.length,
    curriculumSummary,
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

const attachmentIdSchema = z.string().uuid()

facultyRouter.get(
  "/attachments/:attachmentId",
  requireAuth,
  requireRoles("faculty", "superadmin"),
  async (req: AuthenticatedRequest, res) => {
    const raw = req.params.attachmentId
    const parsed = attachmentIdSchema.safeParse(Array.isArray(raw) ? raw[0] : raw)
    if (!parsed.success) return res.status(400).json({ error: "Invalid attachment id" })
    if (!hasApiRole(req, "superadmin")) {
      return res.status(403).json({ error: TEACHING_SCOPE_UNAVAILABLE })
    }

    try {
      const attachment = await prisma.assignmentAttachment.findUnique({
        where: { id: parsed.data },
        select: { id: true, fileName: true, mimeType: true, byteSize: true, storageKey: true },
      })
      if (!attachment?.storageKey) return res.status(404).json({ error: "Attachment not found" })

      const bytes = await readAssignmentArtifact(attachment.storageKey)
      res.setHeader("Content-Type", attachment.mimeType)
      res.setHeader("Content-Length", String(bytes.length))
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${attachment.fileName.replace(/"/g, "")}"`,
      )
      res.setHeader("X-Content-Type-Options", "nosniff")
      res.setHeader("Cache-Control", "private, no-store")
      res.send(bytes)
    } catch (error) {
      if (isStorageError(error)) return res.status(error.status).json({ error: error.message })
      console.error("Failed to download faculty attachment:", error)
      res.status(500).json({ error: "Failed to download attachment" })
    }
  },
)
