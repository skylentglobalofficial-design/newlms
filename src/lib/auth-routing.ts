import type { NavigateFunction } from "react-router-dom"
import type { UserRole } from "../context/AuthContext"
import { fulfillCatalogEnrollment, learnPathForWorkspace, type LoginRedirectState } from "./catalog-enrollment"
import { safeInternalPath } from "./safe-return"

export function roleRoute(role: UserRole): string {
  switch (role) {
    case "student":
      return "/dashboard/student"
    case "faculty":
      return "/dashboard/faculty"
    case "organisation":
      return "/dashboard/organisation"
    case "recruiter":
      return "/dashboard/recruiter"
    case "superadmin":
      return "/dashboard/admin"
  }
}

export async function finishAuthNavigation(
  navigate: NavigateFunction,
  role: UserRole,
  redirectState: LoginRedirectState | null,
): Promise<string | null> {
  if (redirectState?.enrollTarget) {
    try {
      const workspace = await fulfillCatalogEnrollment(redirectState.enrollTarget)
      navigate(learnPathForWorkspace(workspace))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : "Enrollment failed"
    }
  }
  const returnTo = safeInternalPath(redirectState?.returnTo)
  if (returnTo) {
    navigate(returnTo)
    return null
  }
  navigate(roleRoute(role))
  return null
}
