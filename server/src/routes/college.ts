import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"
import { capabilityAvailable, isDatabaseUnavailableError, isMissingSchemaError, UNAVAILABLE_MESSAGES, unavailableBody } from "../lib/schema-capabilities.js"

export const collegeRouter = Router()


export function formatCollegeCohortCsv(
  collegeName: string,
  members: ReadonlyArray<{ id: string; name: string }>,
  enrolments: ReadonlyArray<{ userId: string; status?: string | null; courseTitle?: string | null; programName?: string | null }>,
): string {
  const esc = (val: string) => `"${val.replace(/"/g, '""')}"`
  const header = "College,Member ID,Learner Name,Programme or Course,Status"
  const byUser = new Map<string, Array<{ status?: string | null; courseTitle?: string | null; programName?: string | null }>>()
  for (const e of enrolments) {
    const list = byUser.get(e.userId) ?? []
    list.push(e)
    byUser.set(e.userId, list)
  }
  const rows: string[] = [header]
  for (const m of members) {
    const userEnrols = byUser.get(m.id) ?? []
    if (userEnrols.length === 0) {
      rows.push([esc(collegeName), esc(m.id), esc(m.name), esc("None"), esc("not_enrolled")].join(","))
    } else {
      for (const e of userEnrols) {
        rows.push([esc(collegeName), esc(m.id), esc(m.name), esc(e.courseTitle ?? e.programName ?? "Enrolment"), esc(e.status ?? "active")].join(","))
      }
    }
  }
  return rows.join("\n")
}

export function computeCollegeCohortSummary(
  totalMembers: number,
  enrolments: ReadonlyArray<{ status?: string | null }>,
) {
  const totalEnrolments = enrolments.length
  const completedEnrolments = enrolments.filter((e) => e.status === "completed").length
  const activeEnrolments = enrolments.filter((e) => e.status === "active").length
  const completionRatePercent = totalEnrolments > 0 ? Math.round((completedEnrolments / totalEnrolments) * 100) : 0
  return {
    totalMembers,
    totalEnrolments,
    activeEnrolments,
    completedEnrolments,
    completionRatePercent,
  }
}


collegeRouter.use(requireAuth, requireRoles("college", "superadmin"), async (_req, res, next) => {
  if (!(await capabilityAvailable("collegeMembership"))) {
    res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.college))
    return
  }
  next()
})

async function membershipFor(userId: string) {
  return prisma.collegeMembership.findFirst({
    where: { userId },
    include: { college: true },
    orderBy: { createdAt: "asc" },
  })
}

collegeRouter.get("/dashboard", requireAuth, requireRoles("college", "superadmin"), async (req: AuthenticatedRequest, res) => {
  const requested = z.string().uuid().optional().safeParse(typeof req.query.collegeId === "string" ? req.query.collegeId : undefined)
  if (!requested.success) return res.status(400).json({ error: "Invalid college" })

  try {
    const own = await membershipFor(req.auth!.user.id)
    const superadmin = hasApiRole(req, "superadmin")
    const collegeId = superadmin && requested.data ? requested.data : own?.collegeId
    if (!collegeId) {
      return res.status(403).json({ error: "No college membership found" })
    }
    if (!superadmin && requested.data && requested.data !== own?.collegeId) {
      return res.status(403).json({ error: "That college is outside your membership" })
    }

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        memberships: {
          select: { user: { select: { id: true, displayName: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    if (!college) return res.status(404).json({ error: "College not found" })

    const memberIds = college.memberships.map((row) => row.user.id)
    const enrolments = memberIds.length
      ? await prisma.userEnrollment.findMany({
          where: { userId: { in: memberIds }, status: { in: ["active", "completed"] } },
          select: {
            id: true,
            userId: true,
            status: true,
            course: { select: { slug: true, title: true } },
            program: { select: { slug: true, name: true } },
          },
        })
      : []

    res.json({
      data: {
        college: { id: college.id, slug: college.slug, name: college.name, sample: college.slug.startsWith("demo-") },
        members: college.memberships.map((row) => ({
          id: row.user.id,
          name: row.user.displayName ?? row.user.email,
        })),
        enrolments: enrolments.map((row) => ({
          id: row.id,
          userId: row.userId,
          courseSlug: row.course?.slug ?? null,
          courseTitle: row.course?.title ?? null,
          programSlug: row.program?.slug ?? null,
          programName: row.program?.name ?? null,
        })),
        cohortSummary: computeCollegeCohortSummary(college.memberships.length, enrolments),
        note: "This view includes only people who belong to this college. It is not a platform directory.",
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.college))
    }
    console.error("Failed to load college dashboard:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to load college dashboard" })
  }
})


collegeRouter.get("/dashboard/export.csv", requireAuth, requireRoles("college", "superadmin"), async (req: AuthenticatedRequest, res) => {
  const requested = z.string().uuid().optional().safeParse(typeof req.query.collegeId === "string" ? req.query.collegeId : undefined)
  if (!requested.success) return res.status(400).json({ error: "Invalid college" })
  try {
    const own = await membershipFor(req.auth!.user.id)
    const superadmin = hasApiRole(req, "superadmin")
    const collegeId = superadmin && requested.data ? requested.data : own?.collegeId
    if (!collegeId) return res.status(403).json({ error: "No college membership found" })
    if (!superadmin && requested.data && requested.data !== own?.collegeId) {
      return res.status(403).json({ error: "That college is outside your membership" })
    }
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        memberships: {
          select: { user: { select: { id: true, displayName: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    if (!college) return res.status(404).json({ error: "College not found" })
    const memberIds = college.memberships.map((row) => row.user.id)
    const enrolments = memberIds.length
      ? await prisma.userEnrollment.findMany({
          where: { userId: { in: memberIds }, status: { in: ["active", "completed"] } },
          select: {
            id: true,
            userId: true,
            status: true,
            course: { select: { slug: true, title: true } },
            program: { select: { slug: true, name: true } },
          },
        })
      : []
    const csv = formatCollegeCohortCsv(
      college.name,
      college.memberships.map((r) => ({ id: r.user.id, name: r.user.displayName ?? r.user.email })),
      enrolments.map((r) => ({ userId: r.userId, status: r.status, courseTitle: r.course?.title ?? null, programName: r.program?.name ?? null })),
    )
    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${college.slug}-cohort-report.csv"`)
    res.send(csv)
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
      return res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.college))
    }
    console.error("Failed to export college cohort CSV:", error instanceof Error ? error.name : "unknown")
    res.status(500).json({ error: "Failed to export college cohort CSV" })
  }
})
