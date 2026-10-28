import type { UserRole } from "../context/AuthContext"

export function loginReturnPath(pathname: string, search = "", hash = ""): string {
  return `${pathname}${search}${hash}`
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
    case "admin":
      return "/dashboard/curriculum"
    case "superadmin":
      return "/dashboard/admin"
  }
}
