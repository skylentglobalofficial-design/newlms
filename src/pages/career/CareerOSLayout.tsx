import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import CareerOSShell from "../../components/career/CareerOSShell"
import { loginReturnPath } from "../../lib/auth-routing"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!ready || user) return
    const returnTo = loginReturnPath(location.pathname, location.search, location.hash)
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { state: { returnTo }, replace: true })
  }, [ready, user, navigate, location.pathname, location.search, location.hash])

  if (!ready || !user) return null

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
