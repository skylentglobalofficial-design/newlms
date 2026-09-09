import "dotenv/config"
import bcrypt from "bcrypt"
import { RoleName, PrismaClient } from "@prisma/client"
import { BCRYPT_ROUNDS, normalizeEmail } from "../server/src/lib/auth.js"

const prisma = new PrismaClient()

/**
 * Provisions the first superadmin from environment variables.
 *
 * SUPERADMIN_EMAIL     required
 * SUPERADMIN_PASSWORD  required only when the account does not exist yet
 * SUPERADMIN_NAME      optional display name
 *
 * The script is idempotent: an existing account is elevated to ADMIN without
 * touching its password. Passwords are never logged.
 */
async function main() {
  const rawEmail = process.env.SUPERADMIN_EMAIL
  if (!rawEmail) {
    throw new Error("SUPERADMIN_EMAIL is required")
  }

  const email = normalizeEmail(rawEmail)
  const password = process.env.SUPERADMIN_PASSWORD
  const displayName = process.env.SUPERADMIN_NAME?.trim() || email.split("@")[0]

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
    if (!password) {
      throw new Error("SUPERADMIN_PASSWORD is required to create a new superadmin account")
    }
    if (password.length < 12) {
      throw new Error("SUPERADMIN_PASSWORD must be at least 12 characters")
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const created = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    })
    console.log(`Created superadmin ${created.email} (${created.id})`)
    return
  }

  const alreadyAdmin = existing.roles.some((entry) => entry.role.name === RoleName.ADMIN)
  if (alreadyAdmin) {
    console.log(`Superadmin already provisioned: ${existing.email} (${existing.id})`)
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId: existing.id, roleId: { not: adminRole.id } } })
    await tx.userRole.create({ data: { userId: existing.id, roleId: adminRole.id } })
  })

  console.log(`Elevated existing account to superadmin: ${existing.email} (${existing.id})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
