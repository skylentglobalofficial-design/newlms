import { useCallback, useEffect, useState } from "react"
import { apiV1 } from "../lib/api-base"
import { catalogueOrSamples, degreesFromPublicPayload } from "../lib/degree-catalogue"
import { listDegrees, type Degree } from "../lib/degrees"

export function useDegreeCatalogue(): {
  degrees: Degree[]
  settled: boolean
  unavailable: boolean
  reload: () => void
} {
  const [degrees, setDegrees] = useState<Degree[]>(() => listDegrees())
  const [settled, setSettled] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setSettled(false)
    setUnavailable(false)
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    void fetch(`${apiV1()}/degrees?limit=100`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Degree catalogue unavailable")
        return degreesFromPublicPayload(await response.json())
      })
      .then((published) => {
        if (cancelled) return
        setUnavailable(false)
        if (published.length) setDegrees(catalogueOrSamples(published))
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true)
      })
      .finally(() => {
        if (!cancelled) setSettled(true)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  return { degrees, settled, unavailable, reload }
}
