import { useCallback, useEffect, useState } from "react"
import { fetchCareerProfile, type CareerProfile } from "../lib/career-api"
import { workspaceErrorMessage } from "../lib/http"

export function useCareerProfile() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCareerProfile()
      setProfile(data)
    } catch (err) {
      setError(workspaceErrorMessage(err))
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { profile, setProfile, loading, error, reload }
}
