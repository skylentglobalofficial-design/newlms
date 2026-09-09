import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import {
  getOrganisationScopedEnrollmentStats,
  requireOrganisationMembership,
} from "../lib/dashboard-scope.js"

export const organisationRouter = Router()

organisationRouter.get("/dashboard", requireAuth, requireRoles("organisation"), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    const membership = await requireOrganisationMembership(userId)

    if (!membership) {
      return res.status(403).json({ error: "No organisation membership found" })
    }

    const memberCount = await prisma.organisationMembership.count({
      where: { organisationId: membership.organisationId },
    })

    const scoped = await getOrganisationScopedEnrollmentStats(membership.organisationId)
    const programIds = scoped.programRows.map((row) => row.programId)

    const programs = programIds.length
      ? await prisma.program.findMany({
          where: { id: { in: programIds } },
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            duration: true,
            format: true,
            enrollmentStatus: true,
          },
        })
      : []

    const enrollmentCountByProgram = new Map(
      scoped.programRows.map((row) => [row.programId, row.enrollmentCount]),
    )

    const courses = scoped.courseIds.length
      ? await prisma.course.findMany({
          where: { id: { in: scoped.courseIds } },
          orderBy: { title: "asc" },
          select: { slug: true, title: true, category: true, level: true },
        })
      : []

    res.json({
      data: {
        organisation: {
          slug: membership.organisation.slug,
          name: membership.organisation.name,
        },
        programs: programs.map((program) => ({
          slug: program.slug,
          name: program.name,
          duration: program.duration,
          format: program.format,
          enrollmentStatus: program.enrollmentStatus,
          enrollmentCount: enrollmentCountByProgram.get(program.id) ?? 0,
        })),
        courses,
        totals: {
          programCount: programs.length,
          courseCount: courses.length,
          enrollmentCount: scoped.enrollmentCount,
          memberCount,
        },
        batches: [],
        batchModelRequired: "Batch/Cohort model not yet in schema — batch analytics unavailable",
        catalogScopeMessage:
          programs.length === 0 && courses.length === 0
            ? "No program or course ownership is modeled per organisation. Only enrollments by organisation members are included when present."
            : null,
        cohortAnalyticsAvailable: false,
      },
    })
  } catch (error) {
    console.error("Failed to load organisation dashboard:", error)
    res.status(500).json({ error: "Failed to load organisation dashboard" })
  }
})
