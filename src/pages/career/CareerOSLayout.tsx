import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function CareerOsStatus({ title, body }: { title: string; body: string }) {
  return (
    <main style={{ maxWidth: 640, margin: "64px auto", padding: 24 }}>
      <p className="os-eyebrow">Career OS</p>
      <h1>{title}</h1>
      <p>{body}</p>
      <p><Link to="/dashboard/student">Back to My Courses</Link></p>
    </main>
  )
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [access, setAccess] = useState<"loading" | "open" | "locked" | "unavailable">("loading")

  useEffect(() => {
    if (!user?.id) return
    const controller = new AbortController()
    setAccess("loading")
    void fetch(`${apiV1()}/career/access`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAccess("unavailable")
          return
        }
        const body = await response.json() as { data?: { entitled?: boolean } }
        setAccess(body.data?.entitled === true ? "open" : "locked")
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess("unavailable")
      })
    return () => controller.abort()
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

  if (access === "loading") {
    return (
      <CareerOsStatus
        title="Checking Career OS access"
        body="Career OS stays closed until the entitlement check for this account finishes."
      />
    )
  }

  if (access === "unavailable") {
    return (
      <CareerOsStatus
        title="Career OS cannot be checked"
        body="The entitlement check did not finish, so Career OS stays closed."
      />
    )
  }

  if (access !== "open") {
    return (
      <CareerOsStatus
        title="Career OS is locked"
        body="Signing in does not open Career OS. Finishing a course, reaching Career Rise eligibility, or holding a staff role does not open it either. Access needs a separate entitlement, and none is on this account."
      />
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
