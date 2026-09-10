import { Navigate, useLocation } from "react-router-dom"
import type { UserRole } from "../../context/AuthContext"
import { useAuth } from "../../context/AuthContext"
import { loginReturnPath, roleRoute } from "../../lib/auth-routing"

export function RoleRouteGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div role="status" aria-live="polite" style={{ minHeight: "40vh", display: "grid", placeItems: "center", fontSize: 14, color: "#64748b" }}>
        Checking access…
      </div>
    )
  }
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: loginReturnPath(location.pathname, location.search, location.hash) }}
      />
    )
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleRoute(user.role)} replace />
  }

  return <>{children}</>
}
