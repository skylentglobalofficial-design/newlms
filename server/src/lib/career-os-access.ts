import type { NextFunction, Response } from "express"
import { prisma } from "./prisma.js"
import { requireAuth, type AuthenticatedRequest } from "./auth.js"
import { isDatabaseUnavailableError, isMissingSchemaError } from "./schema-capabilities.js"

export const CAREER_OS_LOCKED = {
  error: "Career OS is locked",
  code: "CAREER_OS_LOCKED",
} as const

export const CAREER_OS_UNAVAILABLE = {
  error: "Career OS cannot be checked right now.",
  code: "unavailable" as const,
}

export type CareerOsAccessState = "entitled" | "locked" | "unavailable"

/**
 * A missing row is locked. A missing table or a database the API cannot reach
 * is unavailable, so a failed check is not reported as an entitlement.
 */
export async function readCareerOsAccess(userId: string): Promise<CareerOsAccessState> {
  try {
    const row = await prisma.careerOsAccess.findUnique({
      where: { userId },
      select: { id: true },
    })
    return row ? "entitled" : "locked"
  } catch (error) {
    if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) return "unavailable"
    throw error
  }
}

/** Authenticated learners still need an explicit CareerOsAccess row. Roles do not grant it. */
export function requireCareerOsAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    void readCareerOsAccess(req.auth!.user.id)
      .then((state) => {
        if (res.headersSent) return
        if (state === "unavailable") return res.status(503).json(CAREER_OS_UNAVAILABLE)
        if (state !== "entitled") return res.status(403).json(CAREER_OS_LOCKED)
        next()
      })
      .catch((error) => {
        console.error("Career OS access check failed:", error instanceof Error ? error.name : "unknown")
        if (!res.headersSent) res.status(500).json(CAREER_OS_UNAVAILABLE)
      })
  })
}
