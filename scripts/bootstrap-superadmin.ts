import "dotenv/config"
import bcrypt from "bcrypt"
import { RoleName, PrismaClient } from "@prisma/client"
import { BCRYPT_ROUNDS, normalizeEmail } from "../server/src/lib/auth.js"
import { classifyDatabaseTarget } from "../server/src/lib/database-target.js"

const prisma = new PrismaClient()

/**
 * Provisions the real Super Admin from environment variables.
 *
 * SUPERADMIN_EMAIL              required
 * SUPERADMIN_PASSWORD           required only when the account does not exist yet (min 12)
 * SUPERADMIN_NAME               optional display name
 * SUPERADMIN_ALLOW_ELEVATION    must be "yes" to add ADMIN to an existing non-admin account
 * SUPERADMIN_ALLOW_PRODUCTION   must be "yes" before this script will touch a non-local database
 *
 * An existing ADMIN account is left unchanged, including its password.
 * The script never prints the password or the password hash.
 */
export async function provisionSuperadmin(env: NodeJS.ProcessEnv = process.env) {
  const rawEmail = env.SUPERADMIN_EMAIL
  if (!rawEmail) throw new Error("SUPERADMIN_EMAIL is required")
  const email = normalizeEmail(rawEmail)
  const databaseUrl = env.DIRECT_URL || env.DATABASE_URL || ""
  const target = classifyDatabaseTarget(databaseUrl)
  if (target.class !== "local" && env.SUPERADMIN_ALLOW_PRODUCTION !== "yes") {
    throw new Error("Refusing to provision a superadmin outside a local database without SUPERADMIN_ALLOW_PRODUCTION=yes")
  }

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
  })

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  })

  if (!existing) {
    const password = env.SUPERADMIN_PASSWORD
    if (!password) throw new Error("SUPERADMIN_PASSWORD is required to create a new superadmin account")
    if (password.length < 12) throw new Error("SUPERADMIN_PASSWORD must be at least 12 characters")
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const created = await prisma.user.create({
      data: {
        email,
        displayName: env.SUPERADMIN_NAME?.trim() || email.split("@")[0],
        passwordHash,
        mustChangePassword: true,
        roles: { create: { roleId: adminRole.id } },
      },
    })
    await prisma.adminAuditLog.create({
      data: {
        actorId: created.id,
        action: "auth.superadmin.created",
        targetType: "User",
        targetId: created.id,
        summary: `Provisioned superadmin ${created.email}`,
      },
    }).catch(() => undefined)
    return { status: "created" as const, email: created.email, id: created.id, mustChangePassword: true }
  }

  const roleNames = existing.roles.map((entry) => entry.role.name)
  const alreadyAdmin = roleNames.includes(RoleName.ADMIN)
  if (alreadyAdmin) {
    await prisma.adminAuditLog.create({
      data: {
        actorId: existing.id,
        action: "auth.superadmin.already_present",
        targetType: "User",
        targetId: existing.id,
        summary: `Superadmin already provisioned for ${existing.email}`,
      },
    }).catch(() => undefined)
    return { status: "already_present" as const, email: existing.email, id: existing.id, mustChangePassword: existing.mustChangePassword }
  }

  if (env.SUPERADMIN_ALLOW_ELEVATION !== "yes") {
    throw new Error("An account with this email already exists and is not an admin. Refusing to change its roles. Set SUPERADMIN_ALLOW_ELEVATION=yes only after confirming the identity.")
  }

  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId: existing.id, roleId: { not: adminRole.id } } })
    await tx.userRole.create({ data: { userId: existing.id, roleId: adminRole.id } })
    await tx.adminAuditLog.create({
      data: {
        actorId: existing.id,
        action: "auth.superadmin.elevated",
        targetType: "User",
        targetId: existing.id,
        summary: `Elevated ${existing.email} after SUPERADMIN_ALLOW_ELEVATION=yes. Previous roles: ${roleNames.join(",") || "none"}`,
      },
    })
  })
  return { status: "elevated" as const, email: existing.email, id: existing.id, mustChangePassword: existing.mustChangePassword }
}

async function main() {
  const result = await provisionSuperadmin()
  console.log(`Superadmin ${result.status}: ${result.email} (${result.id})`)
}

const isDirectRun = process.argv[1] && process.argv[1].includes("bootstrap-superadmin")
if (isDirectRun) {
  main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (error) => {
      console.error(error instanceof Error ? error.message : error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
