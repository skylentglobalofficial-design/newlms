import { prisma } from "../prisma.js"

export async function employerIdsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.employerMembership.findMany({
    where: { userId },
    select: { employerId: true },
  })
  return rows.map((row) => row.employerId)
}

export async function membershipFor(userId: string, employerId: string) {
  return prisma.employerMembership.findUnique({
    where: { userId_employerId: { userId, employerId } },
  })
}
