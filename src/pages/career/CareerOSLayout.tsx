import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { loginReturnPath } from "../../lib/auth-routing"
import CareerOSShell from "../../components/career/CareerOSShell"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: loginReturnPath(location.pathname, location.search, location.hash) }}
      />
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
