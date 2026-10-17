/**
 * Practice environments stay attached to the programme that owns them.
 * Run: npx tsx scripts/test-practice-environments.ts
 */
import {
  PRACTICE_ENVIRONMENTS,
  UNBUILT_PRACTICE,
  lessonPracticeLink,
  practiceNoteForProgramme,
} from "../src/lib/practice-environments"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const da = PRACTICE_ENVIRONMENTS.find((row) => row.courseSlug === "data-analytics")
const pm = PRACTICE_ENVIRONMENTS.find((row) => row.courseSlug === "product-management")
assert(da?.status === "runs" && da.href.includes("/labs/data-analytics/northwind"), "Data Analytics lab must be the running Northwind workspace")
assert(pm?.status === "written" && pm.href.includes("harbor-desk-case"), "Product Management practice must be the Harbor Desk workspace")
assert(!pm?.href.includes("northwind"), "Harbor Desk must not point at Northwind")

for (const lessonId of ["l1", "l4", "l6", "l10", "l12", "l15"]) {
  assert(lessonPracticeLink("data-analytics", lessonId) === null, `Data Analytics ${lessonId} must not open the SQL lab`)
}
for (const lessonId of ["l7", "l8", "l9", "l13", "l14"]) {
  const link = lessonPracticeLink("data-analytics", lessonId)
  assert(link?.status === "runs" && link.href.includes("northwind") && link.href.includes(`lesson=${lessonId}`), `Data Analytics ${lessonId} must open Northwind SQL`)
}

assert(lessonPracticeLink("product-management", "l1") === null, "Product thinking lessons do not open the case workspace")
assert(lessonPracticeLink("product-management", "l3") === null, "Product quizzes do not open the case workspace")
const research = lessonPracticeLink("product-management", "l6")
assert(research?.status === "written" && research.href.includes("task=read_case"), "Research assignment opens the case at the read step")
const frame = lessonPracticeLink("product-management", "l7")
assert(frame?.href.includes("task=frame_problem") && !frame.href.includes("northwind"), "Framing lesson stays on Harbor Desk")
const bet = lessonPracticeLink("product-management", "l12")
assert(bet?.href.includes("task=one_bet"), "Priority memo opens the bet step")
assert(lessonPracticeLink("product-management", "l14")?.href.includes("task=recommendation"), "Capstone opens the recommendation step")

for (const row of UNBUILT_PRACTICE) {
  const note = practiceNoteForProgramme(row.slug)
  assert(!/northwind lab belongs/i.test(note) || row.slug === "sql-certificate", "Only the SQL certificate names Northwind, and only to refuse it")
  assert(!note.includes("/os/labs"), `${row.slug} must not link a lab`)
  assert(lessonPracticeLink(row.slug, "l1") === null, `${row.slug} has no lesson practice link`)
}
assert(practiceNoteForProgramme("sql-certificate").includes("Northwind Lab belongs to Data Analytics"), "SQL certificate must not claim the Data Analytics lab")
assert(practiceNoteForProgramme("full-stack").includes("No HTML"), "Full stack states that no playground exists")
assert(practiceNoteForProgramme("unknown-programme").includes("does not use another programme"), "Unknown programmes do not inherit a lab")

console.log("practice environments: ok")
