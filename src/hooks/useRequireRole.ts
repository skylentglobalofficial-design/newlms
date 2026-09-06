import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, type UserRole } from "../context/AuthContext"

function roleRoute(role: UserRole): string {
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

export function useRequireRole(expectedRole: UserRole) {
  const { user, ready } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!ready) return
    if (!user) {
      navigate("/login")
      return
    }
    if (user.role !== expectedRole) {
      navigate(roleRoute(user.role), { replace: true })
    }
  }, [ready, user, expectedRole, navigate])

  return { user, ready, authorized: ready && user?.role === expectedRole }
}
