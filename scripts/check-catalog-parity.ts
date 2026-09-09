import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { courses, programs, workshops } from "../src/data.js"

const prisma = new PrismaClient()

/** Slugs hard-linked from HomePage.tsx — must exist in static data and DB. */
const HOMEPAGE_PROGRAM_SLUGS = ["data-analytics-pro", "product-management", "full-stack"] as const

type Failure = string

function isLiveEnrollmentProgram(enrollmentStatus: string | null | undefined): boolean {
  return (enrollmentStatus ?? "OPEN").toUpperCase() === "OPEN"
}

async function main() {
  const failures: Failure[] = []
  const warnings: string[] = []

  const dbCourses = await prisma.course.findMany({
    select: { slug: true },
    orderBy: { slug: "asc" },
  })
  const dbPrograms = await prisma.program.findMany({
    select: {
      slug: true,
      enrollmentStatus: true,
      programCourses: { select: { course: { select: { slug: true } } } },
    },
    orderBy: { slug: "asc" },
  })

  const dbCourseSlugs = new Set(dbCourses.map((row) => row.slug))
  const dbProgramSlugs = new Set(dbPrograms.map((row) => row.slug))
  const staticCourseSlugs = courses.map((row) => row.slug)
  const staticProgramSlugs = programs.map((row) => row.slug)

  for (const slug of staticCourseSlugs) {
    if (!dbCourseSlugs.has(slug)) {
      failures.push(`Static course slug missing from DB: ${slug}`)
    }
  }

  for (const slug of staticProgramSlugs) {
    if (!dbProgramSlugs.has(slug)) {
      failures.push(`Static program slug missing from DB: ${slug}`)
    }
  }

  for (const slug of HOMEPAGE_PROGRAM_SLUGS) {
    if (!staticProgramSlugs.includes(slug)) {
      failures.push(`Homepage program slug missing from static catalog: ${slug}`)
    }
    if (!dbProgramSlugs.has(slug)) {
      failures.push(`Homepage program slug missing from DB: ${slug}`)
    }
  }

  const duplicateSlugs = staticCourseSlugs.filter((slug) => staticProgramSlugs.includes(slug))
  if (duplicateSlugs.length) {
    warnings.push(
      `Slug collision across course/program catalogs (resolved by enrollment kind, not global slug): ${duplicateSlugs.join(", ")}`,
    )
  }

  for (const program of dbPrograms) {
    const staticProgram = programs.find((row) => row.slug === program.slug)
    const status = staticProgram?.enrollmentStatus ?? "open"
    const liveStatic = status === "open"
    const liveDb = isLiveEnrollmentProgram(program.enrollmentStatus)
    const linked = program.programCourses.map((row) => row.course.slug)

    if (liveStatic || liveDb) {
      if (liveStatic && liveDb && linked.length === 0) {
        failures.push(
          `Program "${program.slug}" has a live enrollment CTA but no ProgramCourse linkage in DB`,
        )
      }
    }
  }

  const workshopSlugs = workshops.map((row) => row.slug)
  const workshopModel = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Workshop'
    ) AS exists
  `.catch(() => [{ exists: false }])

  if (workshopModel[0]?.exists) {
    failures.push("Unexpected Workshop table found — workshops should not have a backend model in this pass")
  } else {
    console.log(`Workshops (${workshopSlugs.length}) have no backend enrollment model: ${workshopSlugs.join(", ")}`)
  }

  const dbOnlyCourses = dbCourses.filter((row) => !staticCourseSlugs.includes(row.slug))
  const dbOnlyPrograms = dbPrograms.filter((row) => !staticProgramSlugs.includes(row.slug))
  if (dbOnlyCourses.length) {
    warnings.push(`DB-only courses (not in static marketing catalog): ${dbOnlyCourses.map((r) => r.slug).join(", ")}`)
  }
  if (dbOnlyPrograms.length) {
    warnings.push(`DB-only programs (not in static marketing catalog): ${dbOnlyPrograms.map((r) => r.slug).join(", ")}`)
  }

  if (warnings.length) {
    console.log("Warnings:")
    for (const warning of warnings) console.log(`  - ${warning}`)
  }

  if (failures.length) {
    console.error("Catalog parity check failed:")
    for (const failure of failures) console.error(`  ✗ ${failure}`)
    process.exitCode = 1
    return
  }

  console.log("Catalog parity check passed.")
  console.log(`  Static courses: ${staticCourseSlugs.length} (all present in DB)`)
  console.log(`  Static programs: ${staticProgramSlugs.length} (all present in DB)`)
  console.log(`  Homepage program slugs: ${HOMEPAGE_PROGRAM_SLUGS.join(", ")}`)
  console.log(`  Workshops: ${workshopSlugs.length} (no backend enrollment)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
