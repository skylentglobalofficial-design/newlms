import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import CareerOSShell from "../../components/career/CareerOSShell"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (ready && !user) {
      navigate("/login", {
        state: {
          returnTo: `${location.pathname}${location.search}${location.hash}`,
        },
      })
    }
  }, [ready, user, navigate, location.pathname, location.search, location.hash])

  if (!ready || !user) return null

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
