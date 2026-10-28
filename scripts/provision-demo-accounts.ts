import "dotenv/config"
import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import bcrypt from "bcrypt"
import { RoleName, PrismaClient } from "@prisma/client"
import { BCRYPT_ROUNDS, normalizeEmail } from "../server/src/lib/auth.js"
import { classifyDatabaseTarget } from "../server/src/lib/database-target.js"

const prisma = new PrismaClient()

/**
 * Local demo identities. These are not real learners or partners.
 * The script refuses a non-local database.
 * It never creates CareerOsAccess or CareerRiseEnrolment rows.
 * Passwords are written to the path in DEMO_CREDENTIALS_FILE (default /tmp/skylent-demo-credentials.txt)
 * and are not printed.
 */
const ACCOUNTS = [
  {
    key: "admin",
    email: "demo-admin@skylent.invalid",
    name: "Demo Admin (not a real operator)",
    role: RoleName.PLATFORM_ADMIN,
  },
  {
    key: "organisation",
    email: "demo-organisation@skylent.invalid",
    name: "Demo Organisation (not a real partner)",
    role: RoleName.ORGANISATION_ADMIN,
  },
  {
    key: "student",
    email: "demo-student@skylent.invalid",
    name: "Demo Student (not a real learner)",
    role: RoleName.STUDENT,
  },
  {
    key: "college",
    email: "demo-college@skylent.invalid",
    name: "Demo College (not a real institution)",
    role: RoleName.COLLEGE_ADMIN,
  },
  {
    key: "teacher",
    email: "demo-teacher@skylent.invalid",
    name: "Demo Teacher (not a real instructor)",
    role: RoleName.FACULTY,
  },
] as const

async function ensureUser(email: string, displayName: string, role: RoleName | null, password: string) {
  const normalized = normalizeEmail(email)
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
    include: { roles: true },
  })
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, displayName },
    })
    return { id: existing.id, email: existing.email, created: false }
  }
  const roleRow = role
    ? await prisma.role.upsert({ where: { name: role }, update: {}, create: { name: role } })
    : null
  const created = await prisma.user.create({
    data: {
      email: normalized,
      displayName,
      passwordHash,
      mustChangePassword: false,
      roles: roleRow ? { create: { roleId: roleRow.id } } : undefined,
    },
  })
  await prisma.adminAuditLog.create({
    data: {
      actorId: created.id,
      action: "auth.demo.provisioned",
      targetType: "User",
      targetId: created.id,
      summary: `Provisioned local demo account ${created.email}`,
    },
  }).catch(() => undefined)
  return { id: created.id, email: created.email, created: true }
}

export async function provisionDemoAccounts(env: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = env.DIRECT_URL || env.DATABASE_URL || ""
  const target = classifyDatabaseTarget(databaseUrl)
  if (target.class !== "local") {
    throw new Error("Refusing to provision demo accounts outside a local database")
  }
  const password = env.DEMO_ACCOUNTS_PASSWORD && env.DEMO_ACCOUNTS_PASSWORD.length >= 12
    ? env.DEMO_ACCOUNTS_PASSWORD
    : crypto.randomBytes(18).toString("base64url")
  const lines = ["Skylent local demo credentials. Not production. Delete this file when finished.", ""]
  const results = []
  for (const account of ACCOUNTS) {
    const user = await ensureUser(account.email, account.name, account.role, password)
    results.push({ ...account, ...user, role: account.role })
    lines.push(`${account.key} ${user.email} role=${account.role ?? "none"} created=${user.created}`)
  }

  const orgAdmin = results.find((row) => row.key === "organisation")
  if (orgAdmin) {
    const org = await prisma.organisation.upsert({
      where: { slug: "demo-organisation" },
      update: {},
      create: { slug: "demo-organisation", name: "Demo Organisation (not a real partner)" },
    })
    await prisma.organisationMembership.upsert({
      where: { organisationId_userId: { organisationId: org.id, userId: orgAdmin.id } },
      update: {},
      create: { organisationId: org.id, userId: orgAdmin.id },
    })
  }

  const collegeUser = results.find((row) => row.key === "college")
  if (collegeUser) {
    const collegeRole = await prisma.role.upsert({
      where: { name: RoleName.COLLEGE_ADMIN },
      update: {},
      create: { name: RoleName.COLLEGE_ADMIN },
    })
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: collegeUser.id, roleId: collegeRole.id } },
      update: {},
      create: { userId: collegeUser.id, roleId: collegeRole.id },
    })
    const college = await prisma.college.upsert({
      where: { slug: "demo-college" },
      update: {},
      create: { slug: "demo-college", name: "Demo College (not a real institution)" },
    })
    await prisma.collegeMembership.upsert({
      where: { collegeId_userId: { collegeId: college.id, userId: collegeUser.id } },
      update: {},
      create: { collegeId: college.id, userId: collegeUser.id },
    })
  }

  const teacher = results.find((row) => row.key === "teacher")
  if (teacher) {
    const course = await prisma.course.upsert({
      where: { slug: "demo-teaching-course" },
      update: {},
      create: {
        slug: "demo-teaching-course",
        title: "Demo teaching course (not a real programme)",
        category: "Demo",
        level: "Demo",
        duration: "Demo",
        mode: "Demo",
        lessonCount: 0,
        projectCount: 0,
        rating: 0,
        reviews: 0,
        price: 0,
        originalPrice: 0,
        desc: "Local demo course for the teacher account. Not a published programme.",
        longDesc: "Local demo course for the teacher account. Not a published programme.",
        outcomes: [],
        forWhom: [],
        publicationStatus: "DRAFT",
        authoredInApp: true,
      },
    })
    await prisma.facultyCourseAssignment.upsert({
      where: { userId_courseId: { userId: teacher.id, courseId: course.id } },
      update: {},
      create: { userId: teacher.id, courseId: course.id },
    })
    const module = await prisma.curriculumModule.findFirst({ where: { courseId: course.id } })
    if (!module) {
      await prisma.curriculumModule.create({
        data: {
          courseId: course.id,
          title: "Demo module",
          description: "A module the demo teacher may add a lecture to.",
          order: 0,
          sourceId: "demo-module",
          topics: [],
        },
      })
    }
  }

  const file = env.DEMO_CREDENTIALS_FILE || "/tmp/skylent-demo-credentials.txt"
  lines.push("", `password=${password}`)
  await fs.writeFile(file, `${lines.join("\n")}\n`, { mode: 0o600 })
  return {
    file,
    accounts: results.map((row) => ({
      key: row.key,
      email: row.email,
      role: row.role,
      created: row.created,
      id: row.id,
    })),
  }
}

export async function disconnectDemoProvisioning() {
  await prisma.$disconnect()
}

async function main() {
  const result = await provisionDemoAccounts()
  console.log(`Demo accounts ready. Credentials file: ${result.file}`)
  for (const account of result.accounts) {
    console.log(`${account.key} ${account.email} role=${account.role ?? "none"} created=${account.created}`)
  }
}

const isDirectRun = process.argv[1] && process.argv[1].includes("provision-demo-accounts")
if (isDirectRun) {
  main()
    .then(async () => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error instanceof Error ? error.message : error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
