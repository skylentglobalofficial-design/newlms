import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import { ensureCsrfToken } from "../../lib/auth-api"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const activateAndOpen = async () => {
      try {
        const res = await fetch(`${apiV1()}/career/access`, { credentials: "include" })
        if (res.ok) {
          const body = (await res.json().catch(() => ({}))) as { data?: { entitled?: boolean } }
          if (body.data?.entitled === true) {
            if (!cancelled) setActivated(true)
            return
          }
        }
        const token = await ensureCsrfToken()
        await fetch(`${apiV1()}/career/activate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
          body: JSON.stringify({}),
        })
      } catch {
        // Ignore network/schema fallback; overview handles graceful fallback
      } finally {
        if (!cancelled) setActivated(true)
      }
    }
    void activateAndOpen()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (!ready) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--site-dim))", fontSize: 14 }}>
        Loading Career OS…
      </div>
    )
  }

  if (!user) {
    const isOverview = pathname === "/career-os" || pathname === "/career-os/"
    if (isOverview) return <CareerOSPublicPage />
    return <CareerOSPublicAreaPage />
  }

  if (!activated) {
    return (
      <CareerOSShell>
        <div style={{ padding: "32px 24px", color: "#475569", fontSize: 14 }}>
          Opening your Career Services workspace…
        </div>
      </CareerOSShell>
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
