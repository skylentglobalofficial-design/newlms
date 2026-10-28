/**
 * Public programme pages link to the real practice workspace only when this
 * programme's own enrolment allows it. Another programme's linked course does
 * not. The server still decides whether the workspace itself opens.
 */
import { canOpenEnrollment } from "./lms-api"
import { northwindLabPath } from "./labs-api"
import { harborDeskProjectPath } from "./projects-api"

export const DATA_ANALYTICS_SQL_LAB = northwindLabPath()
export const HARBOR_DESK_WORKSPACE = harborDeskProjectPath()

export function practiceWorkspaceHref(artefact: "northwind" | "harbor-desk"): string {
  return artefact === "northwind" ? DATA_ANALYTICS_SQL_LAB : HARBOR_DESK_WORKSPACE
}

export type ProgrammeWorkspaceAccess = {
  enrolled: boolean
  canAccess: boolean
  programSlug?: string
}

/** True only when GET /lms/programs/:slug/access confirms this programme. */
export function programmeAccessAllowsWorkspace(
  programSlug: string,
  access: ProgrammeWorkspaceAccess | null,
): boolean {
  if (!access?.enrolled || !access.canAccess) return false
  return access.programSlug === programSlug
}

export type ProgrammeEnrollmentRecord = {
  status: string
  programSlug: string | null
  linkedCourseSlugs?: readonly string[]
}

/** Programme slug on the enrolment record. Linked course slugs are ignored. */
export function programmeEnrollmentAllowsWorkspace(
  enrollments: readonly ProgrammeEnrollmentRecord[],
  programSlug: string,
): boolean {
  return enrollments.some((row) => canOpenEnrollment(row.status) && row.programSlug === programSlug)
}
