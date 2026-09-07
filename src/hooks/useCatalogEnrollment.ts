import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { fulfillCatalogEnrollment, learnPathForWorkspace, type CatalogEnrollTarget } from "../lib/catalog-enrollment"

export function useCatalogEnrollment() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const runEnrollment = useCallback(async (target: CatalogEnrollTarget) => {
    setEnrollError(null)
    setEnrolling(true)
    try {
      const workspace = await fulfillCatalogEnrollment(target)
      navigate(learnPathForWorkspace(workspace))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enrollment failed"
      setEnrollError(message)
      throw err
    } finally {
      setEnrolling(false)
    }
  }, [navigate])

  const startCourseEnrollment = useCallback((courseSlug: string) => {
    if (!ready) return

    const target: CatalogEnrollTarget = { kind: "course", slug: courseSlug }
    if (!user) {
      navigate("/login", { state: { enrollTarget: target } })
      return
    }

    void runEnrollment(target)
  }, [navigate, ready, runEnrollment, user])

  const startProgramEnrollment = useCallback((programSlug: string) => {
    if (!ready) return

    const target: CatalogEnrollTarget = { kind: "program", slug: programSlug }
    if (!user) {
      navigate("/login", { state: { enrollTarget: target } })
      return
    }

    void runEnrollment(target)
  }, [navigate, ready, runEnrollment, user])

  return {
    startCourseEnrollment,
    startProgramEnrollment,
    enrolling,
    enrollError,
    clearEnrollError: () => setEnrollError(null),
  }
}
