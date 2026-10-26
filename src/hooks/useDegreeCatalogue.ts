import { useEffect, useState } from "react"
import { apiV1 } from "../lib/api-base"
import { catalogueOrSamples, degreesFromPublicPayload } from "../lib/degree-catalogue"
import { listDegrees, type Degree } from "../lib/degrees"

export function useDegreeCatalogue(): { degrees: Degree[]; settled: boolean } {
  const [degrees, setDegrees] = useState<Degree[]>(() => listDegrees())
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetch(`${apiV1()}/degrees?limit=100`)
      .then(async (response) => {
        if (!response.ok) return []
        return degreesFromPublicPayload(await response.json())
      })
      .then((published) => {
        if (cancelled) return
        if (published.length) setDegrees(catalogueOrSamples(published))
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setSettled(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { degrees, settled }
}
