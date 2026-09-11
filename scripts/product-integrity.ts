import { courses, programs, workshops, jobs } from "../src/data.js"
import { expectedCourseSlugsForProgram, LIVE_PROGRAM_COURSE_LINKS } from "../src/lib/program-lms-map.js"

type Failure = string

const EXAM_LEAK = [
  { term: /\bJEE\b/i, allowed: (slug: string, type: string) => type === "EXAM_PREP" && slug.includes("jee") },
  { term: /\bNEET\b/i, allowed: (slug: string, type: string) => type === "EXAM_PREP" && slug.includes("neet") },
  { term: /\bCAT\b/, allowed: (slug: string, type: string) => type === "EXAM_PREP" && slug.includes("cat") },
]

const FAKE_CLAIM = [
  /placement support/i,
  /verifiable credential ID/i,
  /job assistance/i,
  /₹\d+(\.\d+)?\s*LPA/i,
]

function textBlob(value: unknown): string {
  return JSON.stringify(value)
}

function main() {
  const failures: Failure[] = []
  const warnings: string[] = []

  for (const course of courses) {
    const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    const projectCount = course.modules.reduce(
      (sum, module) => sum + module.lessons.filter((lesson) => lesson.type === "assignment").length,
      0,
    )
    if (course.lessons !== lessonCount) {
      failures.push(`Course ${course.slug}: lessons ${course.lessons} != ${lessonCount}`)
    }
    if (course.projects !== projectCount) {
      failures.push(`Course ${course.slug}: projects ${course.projects} != ${projectCount}`)
    }
    if (course.rating !== 0 || course.reviews !== 0) {
      failures.push(`Course ${course.slug}: rating/reviews must be 0 until a real review store exists`)
    }
  }

  for (const program of programs) {
    const blob = textBlob(program)
    for (const rule of EXAM_LEAK) {
      if (rule.term.test(blob) && !rule.allowed(program.slug, program.programType)) {
        failures.push(`Program ${program.slug}: exam terminology leaked (${rule.term})`)
      }
    }
    for (const claim of FAKE_CLAIM) {
      if (claim.test(blob)) {
        failures.push(`Program ${program.slug}: disallowed claim (${claim})`)
      }
    }
    if (program.enrollmentStatus === "open") {
      const expected = expectedCourseSlugsForProgram(program.slug)
      if (expected.length === 0) {
        failures.push(`Open program ${program.slug} has no documented LMS mapping`)
      }
    } else if ((program.enrollmentStatus ?? "open") === "coming_soon") {
      const expected = expectedCourseSlugsForProgram(program.slug)
      if (expected.length > 0) {
        failures.push(`Coming-soon program ${program.slug} must not advertise a live LMS mapping`)
      }
    }
    if (program.upcomingBatch !== "To be announced") {
      failures.push(`Program ${program.slug}: upcomingBatch must stay TBA until a real schedule exists`)
    }
  }

  const openWithoutDocumentedLms = programs.filter((program) => program.enrollmentStatus === "open" && program.slug === "sql-certificate")
  if (openWithoutDocumentedLms.length) {
    failures.push("sql-certificate is open without a live LMS course")
  }

  if (programs.find((program) => program.slug === "sql-certificate")?.enrollmentStatus !== "coming_soon") {
    failures.push("sql-certificate must stay coming_soon until a dedicated LMS course exists")
  }

  if (workshops.length > 0) {
    failures.push("Workshops must stay unpublished until dated sessions and registration exist")
  }

  if (jobs.length > 0) {
    failures.push("Static job listings must stay empty until a real employer feed exists")
  }

  const mappedPrograms = new Set(LIVE_PROGRAM_COURSE_LINKS.map((link) => link.programSlug))
  for (const slug of mappedPrograms) {
    const program = programs.find((row) => row.slug === slug)
    if (!program || program.enrollmentStatus !== "open") {
      failures.push(`Mapped program ${slug} must be open in the static catalogue`)
    }
  }

  if (warnings.length) {
    console.log("Warnings:")
    for (const warning of warnings) console.log(`  - ${warning}`)
  }

  if (failures.length) {
    console.error("Product integrity check failed:")
    for (const failure of failures) console.error(`  ✗ ${failure}`)
    process.exitCode = 1
    return
  }

  console.log("Product integrity check passed.")
  console.log(`  Courses: ${courses.length}`)
  console.log(`  Programs: ${programs.length}`)
}

main()
