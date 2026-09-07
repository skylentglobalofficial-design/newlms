import type { NavigateFunction } from "react-router-dom"
import type { UserRole } from "../context/AuthContext"
import { fulfillCatalogEnrollment, learnPathForWorkspace, type LoginRedirectState } from "./catalog-enrollment"

export function loginReturnPath(pathname: string, search = "", hash = ""): string {
  return `${pathname}${search}${hash}`
}

export function careerOsWorkspaceNav(isAuthenticated: boolean) {
  if (isAuthenticated) {
    return { path: "/career-os/app", state: undefined }
  }
  return { path: "/login", state: { returnTo: "/career-os/app" } }
}

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
  if (redirectState?.returnTo) {
    navigate(redirectState.returnTo)
    return null
  }
  navigate(roleRoute(role))
  return null
}
