import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import "./CareerOS.css"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6168", fontSize: 14 }}>
        Loading Career OS…
      </div>
    )
  }

  if (!user) return <CareerOSPublicPage />

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
