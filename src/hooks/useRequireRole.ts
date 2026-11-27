import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth, type UserRole } from "../context/AuthContext"
import { loginReturnPath, roleRoute } from "../lib/auth-routing"

export function useRequireRole(expectedRole: UserRole | UserRole[]) {
  const expectedRoles = Array.isArray(expectedRole) ? expectedRole : [expectedRole]
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!ready) return
    if (!user) {
      navigate("/login", {
        state: { returnTo: loginReturnPath(location.pathname, location.search, location.hash) },
      })
      return
    }
    if (!expectedRoles.includes(user.role)) {
      navigate(roleRoute(user.role), { replace: true })
    }
  }, [ready, user, expectedRoles, navigate, location.pathname, location.search, location.hash])

  return { user, ready, authorized: ready && Boolean(user && expectedRoles.includes(user.role)) }
}
