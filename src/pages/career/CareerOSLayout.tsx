import { Outlet, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
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
        state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
