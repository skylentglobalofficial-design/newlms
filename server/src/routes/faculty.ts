import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"

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
          select: { id: true, fileName: true, mimeType: true, byteSize: true, storageProvider: true },
        },
      },
    }),
  ])

  const teachingCourse = courses[0]
  const curriculumSummary = teachingCourse
    ? [
        {
          label: "Module",
          detail: teachingCourse.curriculum[0]?.title ?? "—",
          status: "complete",
        },
        {
          label: "Lesson",
          detail: teachingCourse.curriculum[0]?.nodes[0]?.title ?? "—",
          status: "complete",
        },
        {
          label: "Assignments pending",
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
    })),
    pendingReviewCount: submissions.length,
    curriculumSummary,
    teachingScopeAvailable: true,
    teachingScopeMessage: null,
    cohortAnalyticsAvailable: false,
  }
}

function isDemoFacultyAccount(email: string | null | undefined) {
  return email?.endsWith("@demo.skylent.dev") ?? false
}

facultyRouter.get("/dashboard", requireAuth, requireRoles("faculty", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    const canLoadTeachingData =
      hasApiRole(req, "superadmin") ||
      (hasApiRole(req, "faculty") && isDemoFacultyAccount(req.auth?.user.email))

    const data = canLoadTeachingData ? await loadSuperadminFacultyDashboard() : emptyFacultyDashboard()
    res.json({ data })
  } catch (error) {
    console.error("Failed to load faculty dashboard:", error)
    res.status(500).json({ error: "Failed to load faculty dashboard" })
  }
})
