/**
 * Degree detail route.
 *
 *   /education/online/:slug   → <DegreeDetailPage mode="ONLINE" />
 *   /education/campus/:slug   → <DegreeDetailPage mode="CAMPUS" />
 *   /education/degrees/:slug  → <DegreeDetailPage />   (legacy address: redirects to the mode route)
 *
 * The delivery mode in the address is only a locator. The record decides which view renders:
 * a degree opened under the wrong mode is redirected to its own route, never re-skinned.
 * Each view brings the public shell with it (DegreeShell → PageShell).
 */
import { Navigate, useParams } from "react-router-dom"
import { useDegreeCatalogue } from "../../hooks/useDegreeCatalogue"
import { degreePath, type DeliveryMode } from "../../lib/degrees"
import CampusDegreeView from "./CampusDegreeView"
import { DegreeNotFound, DegreeShell } from "./DegreeParts"
import OnlineDegreeView from "./OnlineDegreeView"

export default function DegreeDetailPage({ mode }: { mode?: DeliveryMode }) {
  const { slug } = useParams()
  const { degrees, settled } = useDegreeCatalogue()
  const degree = degrees.find((item) => item.slug === slug) ?? null

  if (!degree && !settled) {
    return (
      <DegreeShell>
        <p role="status">Loading this degree.</p>
      </DegreeShell>
    )
  }
  if (!degree) return <DegreeNotFound />
  if (degree.deliveryMode !== mode) return <Navigate to={degreePath(degree)} replace />

  return degree.deliveryMode === "ONLINE" ? <OnlineDegreeView degree={degree} /> : <CampusDegreeView degree={degree} />
}
