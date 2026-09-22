/**
 * Authored programme teaching-path identity.
 *
 * Same enrolability truth as `hasAuthoredProgrammePath` /
 * `programmeDiscoveryFor` in src/lib/programme-discovery.ts: a programme is
 * not enrolable from OPEN status or linked courses alone. Only slugs that
 * resolve a discovery card may be enrolled.
 *
 * Lives here so POST /lms/enrollments can share that identity without
 * importing the frontend catalogue graph (static data, product profiles).
 * `src/lib/programme-discovery.ts` aliases DISCOVERY_PROGRAMME_SLUGS to this list.
 */
export const AUTHORED_PROGRAMME_PATH_SLUGS = ["data-analytics-pro", "product-management"] as const

export function hasAuthoredProgrammePath(slug: string | undefined): boolean {
  if (!slug) return false
  return (AUTHORED_PROGRAMME_PATH_SLUGS as readonly string[]).includes(slug)
}
