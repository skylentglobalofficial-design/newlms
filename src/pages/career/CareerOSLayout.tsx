import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function CareerOsLocked() {
  return (
    <main style={{ maxWidth: 640, margin: "64px auto", padding: 24 }}>
      <p className="os-eyebrow">Career OS</p>
      <h1>Career OS is locked</h1>
      <p>
        Signing in does not open Career OS. Finishing a course, reaching Career Rise eligibility, or holding a staff role does not open it either.
        Access needs a separate entitlement, and none is on this account.
      </p>
      <p><Link to="/dashboard/student">Back to My Courses</Link></p>
    </main>
  )
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [access, setAccess] = useState<"loading" | "open" | "locked">("loading")

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    void fetch(`${apiV1()}/career/access`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAccess("locked")
          return
        }
        const body = await response.json() as { data?: { entitled?: boolean } }
        setAccess(body.data?.entitled ? "open" : "locked")
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess("locked")
      })
    return () => controller.abort()
  }, [user])

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

  if (access !== "open") return <CareerOsLocked />

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
