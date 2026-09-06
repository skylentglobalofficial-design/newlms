import { useCallback, useEffect, useState } from "react"
import { listSupportRequests, type CareerSupportRequest } from "../lib/career-api"

export function useCareerSupport() {
  const [requests, setRequests] = useState<CareerSupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSupportRequests()
      setRequests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load support requests")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    requests,
    setRequests,
    loading,
    error,
    reload,
  }
}
