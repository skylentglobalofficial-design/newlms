import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { courses } from "../src/data.ts"
import { DA_ASSIGNMENTS } from "../src/content/data-analytics/assignments.ts"
import { DATA_ANALYTICS_DATASETS } from "../src/content/data-analytics/datasets.ts"
import { DA_LESSON_META, DA_TEACHING_LESSON_IDS } from "../src/content/data-analytics/lessons.ts"
import { DA_QUIZZES } from "../src/content/data-analytics/quizzes.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const lessonTextDir = join(root, "src/content/data-analytics/lesson-text")
const publicDir = join(root, "public/content/data-analytics")
const seedSource = readFileSync(join(root, "prisma/seed.ts"), "utf8")

const da = courses.find((course) => course.slug === "data-analytics")
assert(da, "Data Analytics course missing")
assert(da.modules.length === 5, "Expected 5 modules")
assert(da.modules.flatMap((module) => module.lessons).length === 15, "Expected 15 lessons")
assert(da.modules.flatMap((module) => module.lessons).every((lesson) => lesson.type !== "video"), "Flagship lessons must not claim video")
assert(da.projects === 4, "Expected 4 assignments/projects")
assert(da.outcomes.every((row) => !/python|machine learning|\bml\b|job-ready|hired|placement/i.test(row)), "Outcomes overclaim")
assert(/spreadsheet|sql|dashboard/i.test(da.outcomes.join(" ")), "Outcomes should name taught capabilities")

const l6 = da.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === "l6")
assert(l6?.type === "assignment", "l6 must remain an assignment for LMS tests")

assert(DA_LESSON_META.length === 15, "Lesson meta must cover the spine")
assert(DA_TEACHING_LESSON_IDS.length === 8, "Expected 8 written teaching lessons")

for (const id of ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12", "l13", "l14", "l15"]) {
  const file = join(lessonTextDir, `${id}.md`)
  assert(existsSync(file), `Missing lesson text ${id}.md`)
  const body = readFileSync(file, "utf8")
  assert(body.length > 200, `${id}.md is too short to teach`)
  assert(!new RegExp(`^# ${id}$`, "i").test(body.trim()), `${id}.md looks like a title stub`)
}

for (const id of DA_TEACHING_LESSON_IDS) {
  const body = readFileSync(join(lessonTextDir, `${id}.md`), "utf8")
  for (const heading of ["## Explain", "## Worked example", "## Practice", "## Expected result", "## Common mistakes", "## Knowledge check"]) {
    assert(body.includes(heading), `${id} missing ${heading}`)
  }
  assert(body.length > 1500, `${id} teaching body is still too thin`)
}

for (const id of ["l6", "l12", "l13", "l14"]) {
  const brief = DA_ASSIGNMENTS[id]
  assert(brief, `Missing assignment ${id}`)
  assert(brief.scenario.length > 80, `${id} scenario too thin`)
  assert(brief.instructions.length >= 5, `${id} needs real instructions`)
  assert(brief.evaluationCriteria.length >= 3, `${id} needs a rubric`)
  assert(brief.datasetHref.startsWith("/content/data-analytics/"), `${id} dataset path`)
  assert(brief.careerEvidence.artifact.length > 10, `${id} must name an artifact`)
}

assert(Object.keys(DA_QUIZZES).join(",") === "l3,l9,l15", "Unexpected quiz banks")
let questionCount = 0
for (const bank of Object.values(DA_QUIZZES)) {
  assert(bank.questions.length === 5, `${bank.lessonId} should have 5 questions`)
  for (const question of bank.questions) {
    questionCount += 1
    assert(question.options.length >= 4, "MCQ needs four options")
    assert(question.correctIndex >= 0 && question.correctIndex < question.options.length, "correctIndex in range")
    assert(question.explanation.length > 20, "explanation required")
    assert(!/what does sql stand for/i.test(question.prompt), "trivia SQL acronym question slipped in")
  }
}
assert(questionCount === 15, "Expected 15 DA quiz questions")

assert(seedSource.includes("daQuizSeedKey('l3')") || seedSource.includes("data-analytics:l3"), "Seed must key DA quizzes by course slug")
assert(!/^\s*l3: \[/m.test(seedSource), "Seed must not use a bare l3 quiz key")
assert(seedSource.includes("'python-programming:l3'") || seedSource.includes("python-programming:l3"), "Python quiz must stay course-scoped")

for (const dataset of DATA_ANALYTICS_DATASETS) {
  const file = join(root, "public", dataset.href.replace(/^\//, ""))
  assert(existsSync(file), `Missing dataset file ${dataset.filename}`)
  const rows = readFileSync(file, "utf8").trim().split("\n")
  assert(rows.length - 1 === dataset.rows, `${dataset.filename} row count ${rows.length - 1} != ${dataset.rows}`)
}

const sales = readFileSync(join(publicDir, "northwind_sales.csv"), "utf8")
assert(sales.includes("channel"), "sales csv needs channel")
assert(sales.includes("NW-10013"), "duplicate order should exist")
assert(sales.includes("Elec."), "category alias should exist")

console.log("da-content ok")
console.log({
  modules: da.modules.map((module) => module.title),
  teachingLessons: DA_TEACHING_LESSON_IDS.length,
  assignments: Object.keys(DA_ASSIGNMENTS),
  quizQuestions: questionCount,
  datasets: DATA_ANALYTICS_DATASETS.map((row) => row.filename),
})
