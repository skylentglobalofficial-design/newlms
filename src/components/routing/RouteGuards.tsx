import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { roleRoute } from "../../lib/auth-routing"
import type { UserRole } from "../../context/AuthContext"

export function LegacyCareerOsRedirect() {
  const location = useLocation()
  const target = location.pathname.replace(/^\/career-os\//, "/career-os/app/") + location.search + location.hash
  return <Navigate to={target} replace />
}

export function DashboardIndexRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={roleRoute(user.role)} replace />
}

export function RoleRouteGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null
  if (!user) {
    return <Navigate to="/login" replace state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }} />
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleRoute(user.role)} replace />
  }

  return <>{children}</>
}
