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
import { degreePath, getDegree, type DeliveryMode } from "../../lib/degrees"
import CampusDegreeView from "./CampusDegreeView"
import { DegreeNotFound } from "./DegreeParts"
import OnlineDegreeView from "./OnlineDegreeView"

export default function DegreeDetailPage({ mode }: { mode?: DeliveryMode }) {
  const { slug } = useParams()
  const degree = getDegree(slug)

  if (!degree) return <DegreeNotFound />
  if (degree.deliveryMode !== mode) return <Navigate to={degreePath(degree)} replace />

  return degree.deliveryMode === "ONLINE" ? <OnlineDegreeView degree={degree} /> : <CampusDegreeView degree={degree} />
}
