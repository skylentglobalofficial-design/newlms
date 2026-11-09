import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { z } from "zod"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import {
  getOrganisationScopedEnrollmentStats,
  requireOrganisationMembership,
} from "../lib/dashboard-scope.js"
import { isDatabaseUnavailableError, isMissingSchemaError } from "../lib/schema-capabilities.js"

export const organisationRouter = Router()


const onboardOrgSchema = z.object({
  name: z.string().trim().min(2).max(120),
})

organisationRouter.post("/onboarding", requireAuth, requireRoles("organisation", "superadmin"), requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = onboardOrgSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "Validation failed" })
  try {
    const userId = req.auth!.user.id
    const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "enterprise-org"
    const slug = `${baseSlug}-${Date.now().toString(36)}`
    const org = await prisma.organisation.create({
      data: { name: parsed.data.name, slug },
    })
    await prisma.organisationMembership.upsert({
      where: { organisationId_userId: { organisationId: org.id, userId } },
      update: {},
      create: { organisationId: org.id, userId },
    })
    res.status(201).json({ data: { id: org.id, slug: org.slug, name: org.name } })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Organisation dashboard is not available right now.", code: "unavailable" })
    }
    console.error("Failed to onboard organisation:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to onboard organisation" })
  }
})

organisationRouter.get("/dashboard", requireAuth, requireRoles("organisation", "superadmin"), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.user.id
    let membership = await requireOrganisationMembership(userId)

    if (!membership && hasApiRole(req, "superadmin")) {
      let fallbackOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: "asc" } })
      if (!fallbackOrg) {
        fallbackOrg = await prisma.organisation.create({
          data: { slug: "skylent-enterprise-partner", name: "Skylent Enterprise L&D Partner" },
        })
      }
      membership = {
        id: "superadmin-preview",
        userId,
        organisationId: fallbackOrg.id,
        createdAt: new Date(),
        organisation: fallbackOrg,
      }
    }

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
        batchModelRequired: "Enterprise L&D Cohort Telemetry Active — Member enrollments, 60-hr NCrF workload, and Proof-of-Work completion tracked per tenant.",
        catalogScopeMessage:
          programs.length === 0 && courses.length === 0
            ? "No program or course ownership is modeled per organisation. Only enrollments by organisation members are included when present."
            : null,
        cohortAnalyticsAvailable: false,
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: "Organisation dashboard is not available right now.", code: "unavailable" })
    }
    console.error("Failed to load organisation dashboard:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load organisation dashboard" })
  }
})
