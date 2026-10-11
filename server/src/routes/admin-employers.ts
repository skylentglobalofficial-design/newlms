import { Router } from "express"
import { z } from "zod"
import { Prisma, RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireCsrf, type AuthenticatedRequest } from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"
import { validationError } from "../lib/career/shared.js"
import { serializeEmployer } from "../lib/career/serializers.js"

export const adminEmployersRouter = Router()

const guards = [requireAuth, requireRoles("superadmin")] as const

const employerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(4000).optional(),
  website: z.string().trim().url().max(300).optional(),
  location: z.string().trim().max(120).optional(),
})

adminEmployersRouter.get("/employers", ...guards, async (_req: AuthenticatedRequest, res) => {
  try {
    const employers = await prisma.employer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { members: true, jobs: true } } },
    })
    res.json({
      data: employers.map((employer) => ({
        ...serializeEmployer(employer),
        memberCount: employer._count.members,
        jobCount: employer._count.jobs,
      })),
    })
  } catch (error) {
    console.error("Failed to list employers:", error)
    res.status(500).json({ error: "Failed to list employers" })
  }
})

adminEmployersRouter.post("/employers", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = employerSchema.safeParse(req.body)
  if (!parsed.success) return validationError(res, parsed.error)
  try {
    const employer = await prisma.employer.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        website: parsed.data.website,
        location: parsed.data.location,
      },
    })
    res.status(201).json({ data: serializeEmployer(employer) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "An employer with that slug already exists" })
    }
    console.error("Failed to create employer:", error)
    res.status(500).json({ error: "Failed to create employer" })
  }
})

adminEmployersRouter.get("/employers/:id/members", ...guards, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) return res.status(400).json({ error: "Invalid employer id" })
  try {
    const employer = await prisma.employer.findUnique({ where: { id: id.data }, select: { id: true } })
    if (!employer) return res.status(404).json({ error: "Employer not found" })
    const members = await prisma.employerMembership.findMany({
      where: { employerId: employer.id },
      include: { user: { select: { id: true, email: true, displayName: true } } },
      orderBy: { createdAt: "asc" },
    })
    res.json({
      data: members.map((member) => ({
        userId: member.user.id,
        email: member.user.email,
        displayName: member.user.displayName,
        linkedAt: member.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Failed to list employer members:", error)
    res.status(500).json({ error: "Failed to list employer members" })
  }
})

adminEmployersRouter.delete("/employers/:id/members/:userId", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  const userId = z.string().uuid().safeParse(req.params.userId)
  if (!id.success || !userId.success) return res.status(400).json({ error: "Invalid employer or user id" })
  try {
    const removed = await prisma.employerMembership.deleteMany({
      where: { employerId: id.data, userId: userId.data },
    })
    if (removed.count === 0) return res.status(404).json({ error: "Membership not found" })
    res.json({ data: { removed: true } })
  } catch (error) {
    console.error("Failed to remove employer member:", error)
    res.status(500).json({ error: "Failed to remove employer member" })
  }
})

adminEmployersRouter.post("/employers/:id/members", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id)
  const body = z.object({ userId: z.string().uuid() }).safeParse(req.body)
  if (!id.success) return res.status(400).json({ error: "Invalid employer id" })
  if (!body.success) return validationError(res, body.error)

  try {
    const employer = await prisma.employer.findUnique({ where: { id: id.data } })
    if (!employer) return res.status(404).json({ error: "Employer not found" })
    const user = await prisma.user.findUnique({
      where: { id: body.data.userId },
      include: { roles: { include: { role: true } } },
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    const allowed = user.roles.some((entry) => entry.role.name === RoleName.RECRUITER || entry.role.name === RoleName.ADMIN)
    if (!allowed) {
      return res.status(400).json({ error: "The user needs the recruiter role before they can be linked to an employer" })
    }
    const membership = await prisma.employerMembership.upsert({
      where: { userId_employerId: { userId: user.id, employerId: employer.id } },
      update: {},
      create: { userId: user.id, employerId: employer.id },
    })
    res.status(201).json({ data: { id: membership.id, userId: user.id, employerId: employer.id } })
  } catch (error) {
    console.error("Failed to link employer member:", error)
    res.status(500).json({ error: "Failed to link employer member" })
  }
})
