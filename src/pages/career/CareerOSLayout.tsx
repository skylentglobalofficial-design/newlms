import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import { readStoredCourseTiers } from "../../lib/enrolment-tiers"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSOverviewPage from "./CareerOSOverviewPage"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function hasLocalCareerOsEnrolment(): boolean {
  const map = readStoredCourseTiers()
  return Object.values(map).some((r) => Boolean(r.careerOsEnrolled))
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [checked, setChecked] = useState(false)
  const [entitled, setEntitled] = useState<boolean>(() => hasLocalCareerOsEnrolment())

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const checkAccess = async () => {
      if (hasLocalCareerOsEnrolment()) {
        if (!cancelled) {
          setEntitled(true)
          setChecked(true)
        }
        return
      }
      try {
        const res = await fetch(`${apiV1()}/career/access`, { credentials: "include" })
        if (res.ok) {
          const body = (await res.json().catch(() => ({}))) as { data?: { entitled?: boolean } }
          if (!cancelled) {
            setEntitled(Boolean(body.data?.entitled))
          }
        }
      } catch {
        // Fallback to local state
      } finally {
        if (!cancelled) setChecked(true)
      }
    }
    void checkAccess()
    const onUpdate = () => setEntitled(hasLocalCareerOsEnrolment())
    window.addEventListener("skylent:career-os-enrolled", onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener("skylent:career-os-enrolled", onUpdate)
    }
  }, [user?.id, pathname])

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

  if (!checked) {
    return (
      <CareerOSShell showSubNav={false}>
        <div style={{ padding: "24px", color: "#475569", fontSize: 14 }}>
          Loading Career OS…
        </div>
      </CareerOSShell>
    )
  }

  // Strict Pre-Enrolment Gate: Until the learner completes >=60% + quizzes + project and clicks "Enroll Now",
  // only show the Eligibility & Progress Gate screen (hide Profile, Jobs, and sub-routes).
  if (!entitled) {
    return (
      <CareerOSShell showSubNav={false}>
        <CareerOSOverviewPage onEnrolled={() => setEntitled(true)} />
      </CareerOSShell>
    )
  }

  return (
    <CareerOSShell showSubNav={true}>
      <Outlet />
    </CareerOSShell>
  )
}
