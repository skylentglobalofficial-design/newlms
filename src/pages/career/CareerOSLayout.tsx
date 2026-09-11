import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import CareerOSShell from "../../components/career/CareerOSShell"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (ready && !user) navigate("/login?returnTo=%2Fcareer-os")
  }, [ready, user, navigate])

  if (!ready || !user) return null

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
