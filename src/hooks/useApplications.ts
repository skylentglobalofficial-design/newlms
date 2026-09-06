import { useCallback, useEffect, useState } from "react"
import { listApplications, type JobApplication, type JobApplicationStatus } from "../lib/career-api"

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | "ALL">("ALL")

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listApplications()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = statusFilter === "ALL"
    ? applications
    : applications.filter(a => a.status === statusFilter)

  return {
    applications,
    filtered,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    reload,
    setApplications,
  }
}
