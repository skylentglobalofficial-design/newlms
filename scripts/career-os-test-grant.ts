import type { PrismaClient } from "@prisma/client"

/** Test-only entitlement. Product signup, demos, and Career Rise do not call this. */
export async function grantCareerOsForTest(prisma: PrismaClient, userId: string) {
  await prisma.careerOsAccess.upsert({
    where: { userId },
    create: {
      userId,
      reason: "Automated test grant. Not created by signup, demo provisioning, or Career Rise.",
    },
    update: {},
  })
}
