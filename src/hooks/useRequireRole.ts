import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, type UserRole } from "../context/AuthContext"
import { roleRoute } from "../lib/auth-routing"

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
