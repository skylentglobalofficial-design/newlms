import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { classifyDatabaseTarget, redactConnectionSecrets } from "../server/src/lib/database-target.ts"

/**
 * Read-only count of the six programme-course pairs in
 * prisma/migrations/20261004180000_backfill_program_course_links.
 *
 * It does not insert, update, or delete. It does not approve the backfill.
 * Against this workspace it runs only when the database target is local,
 * unless --production is passed and the target is the session pooler.
 */
export const BACKFILL_PAIRS = [
  ["data-analytics-pro", "data-analytics"],
  ["data-science-ai", "data-analytics"],
  ["data-science-ai", "python-programming"],
  ["full-stack", "full-stack-web"],
  ["generative-ai-program", "generative-ai"],
  ["product-management", "product-management"],
] as const

const READ_ONLY_SQL = `
SELECT
  v.program_slug,
  v.course_slug,
  (p.id IS NOT NULL) AS programme_exists,
  (c.id IS NOT NULL) AS course_exists,
  (pc.id IS NOT NULL) AS link_exists,
  COALESCE(enrolments.total, 0)::int AS active_programme_enrolments,
  COALESCE(enrolments.without_direct, 0)::int AS would_gain_course_access
FROM (
  VALUES
    ('data-analytics-pro', 'data-analytics'),
    ('data-science-ai', 'data-analytics'),
    ('data-science-ai', 'python-programming'),
    ('full-stack', 'full-stack-web'),
    ('generative-ai-program', 'generative-ai'),
    ('product-management', 'product-management')
) AS v(program_slug, course_slug)
LEFT JOIN "Program" p ON p.slug = v.program_slug
LEFT JOIN "Course" c ON c.slug = v.course_slug
LEFT JOIN "ProgramCourse" pc ON pc."programId" = p.id AND pc."courseId" = c.id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (
        SELECT 1
        FROM "UserEnrollment" direct
        WHERE direct."userId" = e."userId"
          AND direct."courseId" = c.id
          AND direct.status IN ('active', 'completed')
      )
    )::int AS without_direct
  FROM "UserEnrollment" e
  WHERE p.id IS NOT NULL
    AND e."programId" = p.id
    AND e.status IN ('active', 'completed')
) enrolments ON true
ORDER BY v.program_slug, v.course_slug
`

function assertReadOnly(sql: string) {
  const executable = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
  if (/\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|GRANT|REVOKE|CREATE)\b/i.test(executable)) {
    throw new Error("Backfill preflight refused to run SQL that is not a single read")
  }
}

type PairRow = {
  program_slug: string
  course_slug: string
  programme_exists: boolean
  course_exists: boolean
  link_exists: boolean
  active_programme_enrolments: number
  would_gain_course_access: number
}

export function summariseBackfill(rows: PairRow[]) {
  const wouldInsert = rows.filter((row) => row.programme_exists && row.course_exists && !row.link_exists)
  return {
    pairs: rows.map((row) => ({
      programme: row.program_slug,
      course: row.course_slug,
      programmeExists: row.programme_exists,
      courseExists: row.course_exists,
      linkExists: row.link_exists,
      activeProgrammeEnrolments: row.active_programme_enrolments,
      learnersWhoWouldGainThisCourse: row.link_exists ? 0 : row.would_gain_course_access,
    })),
    pairsThatWouldInsert: wouldInsert.length,
    pairsAlreadyPresent: rows.filter((row) => row.link_exists).length,
    pairsMissingProgrammeOrCourse: rows.filter((row) => !row.programme_exists || !row.course_exists).length,
    learnersWhoWouldGainACourse: wouldInsert.reduce((sum, row) => sum + row.would_gain_course_access, 0),
  }
}

async function main() {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || ""
  const target = classifyDatabaseTarget(raw)
  const production = process.argv.includes("--production")
  if (production && !target.sessionPooler) {
    console.error(`DECISION BLOCKED target=${target.class} port=${target.port} database=${target.database}`)
    process.exit(1)
  }
  if (!production && target.class !== "local") {
    console.error(`DECISION BLOCKED refusing non-local target without --production class=${target.class}`)
    process.exit(1)
  }
  assertReadOnly(READ_ONLY_SQL)
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY")
      return tx.$queryRawUnsafe<PairRow[]>(READ_ONLY_SQL)
    })
    const summary = summariseBackfill(rows)
    console.log(JSON.stringify({
      decision: "READ_ONLY",
      productionQuery: production,
      targetClass: target.class,
      port: target.port,
      database: target.database,
      approved: false,
      ...summary,
    }, null, 2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(redactConnectionSecrets(message, raw))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const isDirectRun = process.argv[1]?.includes("preflight-program-course-backfill")
if (isDirectRun) {
  main()
}
