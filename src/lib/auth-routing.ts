import type { UserRole } from "../context/AuthContext"

export function loginReturnPath(pathname: string, search = "", hash = ""): string {
  return `${pathname}${search}${hash}`
}

/** Same-origin path only. Rejects protocol-relative and absolute URLs. */
export function safeReturnTo(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.includes("\\")) {
    return undefined
  }
  return trimmed
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
