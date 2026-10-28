import type { NextFunction, Response } from "express"
import { prisma } from "./prisma.js"
import { requireAuth, type AuthenticatedRequest } from "./auth.js"

export const CAREER_OS_LOCKED = {
  error: "Career OS is locked",
  code: "CAREER_OS_LOCKED",
} as const

export async function hasCareerOsAccess(userId: string): Promise<boolean> {
  try {
    const row = await prisma.careerOsAccess.findUnique({
      where: { userId },
      select: { id: true },
    })
    return Boolean(row)
  } catch {
    return false
  }
}

/** Authenticated learners still need an explicit CareerOsAccess row. Roles do not grant it. */
export function requireCareerOsAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    void hasCareerOsAccess(req.auth!.user.id)
      .then((allowed) => {
        if (!allowed) return res.status(403).json(CAREER_OS_LOCKED)
        next()
      })
      .catch(() => res.status(403).json(CAREER_OS_LOCKED))
  })
}
