import { prisma } from "../prisma.js"
import { capabilityAvailable, isMissingSchemaError, UNAVAILABLE_MESSAGES } from "../schema-capabilities.js"

export class EmployerMembershipUnavailableError extends Error {
  constructor() {
    super(UNAVAILABLE_MESSAGES.employerMembership)
    this.name = "EmployerMembershipUnavailableError"
  }
}

export async function employerIdsForUser(userId: string): Promise<string[]> {
  if (!(await capabilityAvailable("employerMembership"))) throw new EmployerMembershipUnavailableError()
  try {
    const rows = await prisma.employerMembership.findMany({
      where: { userId },
      select: { employerId: true },
    })
    return rows.map((row) => row.employerId)
  } catch (error) {
    if (isMissingSchemaError(error)) throw new EmployerMembershipUnavailableError()
    throw error
  }
}

export async function membershipFor(userId: string, employerId: string) {
  if (!(await capabilityAvailable("employerMembership"))) throw new EmployerMembershipUnavailableError()
  try {
    return await prisma.employerMembership.findUnique({
      where: { userId_employerId: { userId, employerId } },
    })
  } catch (error) {
    if (isMissingSchemaError(error)) throw new EmployerMembershipUnavailableError()
    throw error
  }
}
