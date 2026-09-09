import { Router } from "express"
import { z } from "zod"
import { RoleName } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import {
  ensureRole,
  requireAuth,
  requireCsrf,
  toApiRole,
  toSafeUser,
  primaryRole,
  type ApiRole,
  type AuthenticatedRequest,
} from "../lib/auth.js"
import { requireRoles } from "../lib/roles.js"

export const adminRouter = Router()

const API_ROLE_TO_NAME: Record<ApiRole, RoleName> = {
  student: RoleName.STUDENT,
  faculty: RoleName.FACULTY,
  organisation: RoleName.ORGANISATION_ADMIN,
  recruiter: RoleName.RECRUITER,
  superadmin: RoleName.ADMIN,
}

const apiRoleSchema = z.enum(["student", "faculty", "organisation", "recruiter", "superadmin"])

const listQuerySchema = z.object({
  query: z.string().trim().max(200).optional(),
  role: apiRoleSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

const userIdSchema = z.string().uuid("Expected a user id")

const assignRoleSchema = z.object({
  role: apiRoleSchema,
  organisationId: z.string().uuid().optional(),
})

const organisationSchema = z.object({
  name: z.string().trim().min(2, "Organisation name is required").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "Organisation slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with dashes"),
})

const userInclude = {
  roles: { include: { role: true } },
  memberships: { include: { organisation: true }, orderBy: { createdAt: "asc" } },
} as const

type AdminUser = Awaited<ReturnType<typeof loadUser>>

async function loadUser(id: string) {
  return prisma.user.findUnique({ where: { id }, include: userInclude })
}

function serializeUser(user: NonNullable<AdminUser>) {
  const roles = user.roles.map((entry) => entry.role)
  return {
    ...toSafeUser(user),
    createdAt: user.createdAt.toISOString(),
    roles: roles.map(toApiRole),
    role: primaryRole(roles),
    hasPassword: Boolean(user.passwordHash),
    organisations: user.memberships.map((membership) => ({
      id: membership.organisation.id,
      slug: membership.organisation.slug,
      name: membership.organisation.name,
    })),
  }
}

const guards = [requireAuth, requireRoles("superadmin")] as const

const ASSIGNABLE_ROLES: Array<{
  role: ApiRole
  roleName: RoleName
  requiresOrganisation: boolean
  unavailableCapability: string | null
}> = [
  { role: "student", roleName: RoleName.STUDENT, requiresOrganisation: false, unavailableCapability: null },
  {
    role: "faculty",
    roleName: RoleName.FACULTY,
    requiresOrganisation: false,
    unavailableCapability:
      "Faculty↔course/programme assignment is not modeled in the schema, so teaching assignments cannot be provisioned yet.",
  },
  {
    role: "organisation",
    roleName: RoleName.ORGANISATION_ADMIN,
    requiresOrganisation: true,
    unavailableCapability: null,
  },
  {
    role: "recruiter",
    roleName: RoleName.RECRUITER,
    requiresOrganisation: false,
    unavailableCapability:
      "Employer/job ownership is not linked to recruiter users yet, so only the role itself is provisioned.",
  },
  { role: "superadmin", roleName: RoleName.ADMIN, requiresOrganisation: false, unavailableCapability: null },
]

adminRouter.get("/roles", ...guards, (_req: AuthenticatedRequest, res) => {
  res.json({ data: ASSIGNABLE_ROLES })
})

adminRouter.get("/users", ...guards, async (req: AuthenticatedRequest, res) => {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const { query, role, limit, offset } = parsed.data

  try {
    const where = {
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" as const } },
              { displayName: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role ? { roles: { some: { role: { name: API_ROLE_TO_NAME[role] } } } } : {}),
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ])

    res.json({
      data: users.map(serializeUser),
      pagination: { total, limit, offset },
    })
  } catch (error) {
    console.error("Failed to list users:", error)
    res.status(500).json({ error: "Failed to list users" })
  }
})

adminRouter.get("/users/:id", ...guards, async (req: AuthenticatedRequest, res) => {
  const parsedId = userIdSchema.safeParse(req.params.id)
  if (!parsedId.success) {
    return res.status(400).json({ error: "Validation failed", details: { id: [parsedId.error.issues[0]?.message] } })
  }

  try {
    const user = await loadUser(parsedId.data)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({ data: serializeUser(user) })
  } catch (error) {
    console.error("Failed to load user:", error)
    res.status(500).json({ error: "Failed to load user" })
  }
})

async function countSuperadmins(excludeUserId?: string) {
  return prisma.user.count({
    where: {
      roles: { some: { role: { name: RoleName.ADMIN } } },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  })
}

/**
 * Replaces the target user's role set with a single role.
 *
 * Safety rules:
 * - Only ADMIN (API role `superadmin`) may call this route.
 * - A superadmin may never mutate their own roles, which blocks both
 *   self-promotion and accidental self-demotion/lockout.
 * - The ADMIN role may never be removed from the last remaining superadmin.
 * - Assigning `organisation` requires an existing Organisation; no organisation
 *   records are fabricated here.
 */
adminRouter.patch("/users/:id/role", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsedId = userIdSchema.safeParse(req.params.id)
  if (!parsedId.success) {
    return res.status(400).json({ error: "Validation failed", details: { id: [parsedId.error.issues[0]?.message] } })
  }

  const parsed = assignRoleSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const actor = req.auth!.user
  const targetId = parsedId.data

  if (targetId === actor.id) {
    return res.status(403).json({ error: "You cannot change your own role" })
  }

  try {
    const target = await loadUser(targetId)
    if (!target) {
      return res.status(404).json({ error: "User not found" })
    }

    const nextRoleName = API_ROLE_TO_NAME[parsed.data.role]
    const heldRoleNames = target.roles.map((entry) => entry.role.name)

    if (heldRoleNames.includes(RoleName.ADMIN) && nextRoleName !== RoleName.ADMIN) {
      const remaining = await countSuperadmins(target.id)
      if (remaining === 0) {
        return res.status(409).json({ error: "Cannot demote the last remaining superadmin" })
      }
    }

    let organisationId = parsed.data.organisationId ?? null

    if (nextRoleName === RoleName.ORGANISATION_ADMIN) {
      if (!organisationId) {
        organisationId = target.memberships[0]?.organisationId ?? null
      }
      if (!organisationId) {
        return res.status(422).json({
          error:
            "An organisation is required for the organisation role. Create the organisation first, then pass organisationId.",
        })
      }
      const organisation = await prisma.organisation.findUnique({ where: { id: organisationId } })
      if (!organisation) {
        return res.status(404).json({ error: "Organisation not found" })
      }
    } else if (organisationId) {
      return res.status(400).json({ error: "organisationId is only accepted for the organisation role" })
    }

    const role = await ensureRole(nextRoleName)

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: target.id, roleId: { not: role.id } } })
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: target.id, roleId: role.id } },
        update: {},
        create: { userId: target.id, roleId: role.id },
      })
      if (organisationId) {
        await tx.organisationMembership.upsert({
          where: { organisationId_userId: { organisationId, userId: target.id } },
          update: {},
          create: { organisationId, userId: target.id },
        })
      }
    })

    console.log(
      `[role-change] actor=${actor.id} target=${target.id} from=${heldRoleNames.join(",") || "none"} to=${nextRoleName}`,
    )

    const updated = await loadUser(target.id)
    res.json({ data: serializeUser(updated!) })
  } catch (error) {
    console.error("Failed to assign role:", error)
    res.status(500).json({ error: "Failed to assign role" })
  }
})

/**
 * Revokes every elevated role from the target user and leaves them as a STUDENT.
 * The same self-mutation and last-superadmin rules as the assign route apply.
 */
adminRouter.delete("/users/:id/role", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsedId = userIdSchema.safeParse(req.params.id)
  if (!parsedId.success) {
    return res.status(400).json({ error: "Validation failed", details: { id: [parsedId.error.issues[0]?.message] } })
  }

  const actor = req.auth!.user
  const targetId = parsedId.data

  if (targetId === actor.id) {
    return res.status(403).json({ error: "You cannot change your own role" })
  }

  try {
    const target = await loadUser(targetId)
    if (!target) {
      return res.status(404).json({ error: "User not found" })
    }

    const heldRoleNames = target.roles.map((entry) => entry.role.name)
    if (heldRoleNames.includes(RoleName.ADMIN)) {
      const remaining = await countSuperadmins(target.id)
      if (remaining === 0) {
        return res.status(409).json({ error: "Cannot demote the last remaining superadmin" })
      }
    }

    const studentRole = await ensureRole(RoleName.STUDENT)

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: target.id, roleId: { not: studentRole.id } } })
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: target.id, roleId: studentRole.id } },
        update: {},
        create: { userId: target.id, roleId: studentRole.id },
      })
    })

    console.log(
      `[role-change] actor=${actor.id} target=${target.id} from=${heldRoleNames.join(",") || "none"} to=${RoleName.STUDENT}`,
    )

    const updated = await loadUser(target.id)
    res.json({ data: serializeUser(updated!) })
  } catch (error) {
    console.error("Failed to revoke role:", error)
    res.status(500).json({ error: "Failed to revoke role" })
  }
})

adminRouter.get("/organisations", ...guards, async (_req: AuthenticatedRequest, res) => {
  try {
    const organisations = await prisma.organisation.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { memberships: true } },
      },
    })

    res.json({
      data: organisations.map((organisation) => ({
        id: organisation.id,
        slug: organisation.slug,
        name: organisation.name,
        memberCount: organisation._count.memberships,
      })),
    })
  } catch (error) {
    console.error("Failed to list organisations:", error)
    res.status(500).json({ error: "Failed to list organisations" })
  }
})

adminRouter.post("/organisations", ...guards, requireCsrf, async (req: AuthenticatedRequest, res) => {
  const parsed = organisationSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const existing = await prisma.organisation.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return res.status(409).json({ error: "An organisation with this slug already exists" })
    }

    const organisation = await prisma.organisation.create({
      data: { name: parsed.data.name, slug: parsed.data.slug },
    })

    res.status(201).json({
      data: {
        id: organisation.id,
        slug: organisation.slug,
        name: organisation.name,
        memberCount: 0,
      },
    })
  } catch (error) {
    console.error("Failed to create organisation:", error)
    res.status(500).json({ error: "Failed to create organisation" })
  }
})
