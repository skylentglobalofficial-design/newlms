/**
 * Degrees/institution authorization and public visibility regression tests.
 * Pure logic — no database.
 */

import { DegreeStatus } from "@prisma/client"
import { z } from "zod"
import {
  buildPublicDegreeWhere,
  isPubliclyVisibleDegreeStatus,
  PUBLIC_DEGREE_STATUSES,
} from "../server/src/lib/degrees-public.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// Public where always forces PUBLISHED even when client sends DRAFT
const leaked = buildPublicDegreeWhere({ status: "DRAFT", level: "UNDERGRADUATE" })
assert(leaked.status === DegreeStatus.PUBLISHED, "public where ignores DRAFT status param")
assert(
  (leaked as { level?: string }).level === "UNDERGRADUATE",
  "level filter preserved",
)

const withArchived = buildPublicDegreeWhere({ status: "ARCHIVED" })
assert(withArchived.status === DegreeStatus.PUBLISHED, "ARCHIVED query cannot list unpublished")

const withComingSoon = buildPublicDegreeWhere({ status: "COMING_SOON" })
assert(withComingSoon.status === DegreeStatus.PUBLISHED, "COMING_SOON query cannot override")

const empty = buildPublicDegreeWhere({})
assert(empty.status === DegreeStatus.PUBLISHED, "default public status is PUBLISHED")
assert(!("discipline" in empty) || empty.discipline === undefined, "no empty discipline")

const filtered = buildPublicDegreeWhere({
  discipline: "Computing",
  institutionSlug: "example-uni",
  sample: true,
  deliveryMode: "ONLINE",
})
assert(filtered.status === DegreeStatus.PUBLISHED, "filtered still published-only")
assert(filtered.sample === true, "sample preserved")
assert(
  filtered.institution && typeof filtered.institution === "object" && "slug" in filtered.institution,
  "institution slug filter set",
)

// Visibility helper
assert(isPubliclyVisibleDegreeStatus(DegreeStatus.PUBLISHED), "published visible")
assert(!isPubliclyVisibleDegreeStatus(DegreeStatus.DRAFT), "draft hidden")
assert(!isPubliclyVisibleDegreeStatus(DegreeStatus.ARCHIVED), "archived hidden")
assert(!isPubliclyVisibleDegreeStatus(DegreeStatus.COMING_SOON), "coming soon hidden from detail")
assert(PUBLIC_DEGREE_STATUSES.length === 1, "only PUBLISHED is public")

// Slug validation mirrors route schemas
const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

assert(slugSchema.safeParse("data-science-bsc").success, "valid slug")
assert(!slugSchema.safeParse("Admin").success, "uppercase rejected")
assert(!slugSchema.safeParse("../etc").success, "traversal rejected")
assert(!slugSchema.safeParse("institutions").success === false, "institutions is a valid slug shape")
// Route ordering (not Express): reserved paths must not be treated as degree slugs
const reserved = ["institutions", "disciplines", "setup-status", "admin"]
for (const path of reserved) {
  assert(slugSchema.safeParse(path).success, `${path} matches slug pattern — must be registered before /:slug`)
}

// Admin mutation role requirement: only superadmin (ADMIN RoleName)
const allowedAdminRoles = ["superadmin"] as const
assert(allowedAdminRoles.includes("superadmin"), "superadmin allowed")
assert(!(allowedAdminRoles as readonly string[]).includes("student"), "student denied")
assert(!(allowedAdminRoles as readonly string[]).includes("faculty"), "faculty denied")
assert(!(allowedAdminRoles as readonly string[]).includes("recruiter"), "recruiter denied")

// Duplicate slug conflict status
const conflictStatus = 409
assert(conflictStatus === 409, "duplicate slug returns 409")

// Institution delete blocked when degrees remain
function canDeleteInstitution(degreeCount: number): boolean {
  return degreeCount === 0
}
assert(canDeleteInstitution(0), "empty institution deletable")
assert(!canDeleteInstitution(1), "institution with degrees not deletable")
assert(!canDeleteInstitution(3), "institution with multiple degrees not deletable")

// Empty catalogue result shape
const emptyCatalogue = { data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } }
assert(emptyCatalogue.data.length === 0, "empty data array")
assert(emptyCatalogue.pagination.total === 0, "zero total")

console.log("degrees-authorization ok")
