import type { Response, NextFunction } from "express"
import { toApiRole, type ApiRole, type AuthenticatedRequest } from "./auth.js"

export function requireRoles(...allowed: ApiRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const auth = req.auth
    if (!auth) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const hasRole = auth.roles.some((role) => allowed.includes(toApiRole(role)))
    if (!hasRole) {
      return res.status(403).json({ error: "Forbidden" })
    }
    next()
  }
}

export function hasApiRole(req: AuthenticatedRequest, role: ApiRole): boolean {
  return req.auth?.roles.some((entry) => toApiRole(entry) === role) ?? false
}
