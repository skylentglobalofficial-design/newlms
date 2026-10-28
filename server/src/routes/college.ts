import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { hasApiRole, requireRoles } from "../lib/roles.js"

export const collegeRouter = Router()

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
      note: "This view includes only people who belong to this college. It is not a platform directory.",
    },
  })
})
