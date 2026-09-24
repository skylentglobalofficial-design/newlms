import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { courses } from "../src/data.ts"
import { PM_ASSIGNMENTS } from "../src/content/product-management/assignments.ts"
import { PM_LESSON_META, PM_TEACHING_LESSON_IDS } from "../src/content/product-management/lessons.ts"
import { PM_QUIZZES } from "../src/content/product-management/quizzes.ts"
import { isAuthoredCourse } from "../src/lib/authored-courses.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const lessonTextDir = join(root, "src/content/product-management/lesson-text")
const seedSource = readFileSync(join(root, "prisma/seed.ts"), "utf8")
const learnSource = readFileSync(join(root, "src/pages/LearnPage.tsx"), "utf8")

const pm = courses.find((course) => course.slug === "product-management")
assert(pm, "Product Management course missing")
assert(pm.modules.length === 5, "Expected 5 modules")
assert(pm.modules.flatMap((module) => module.lessons).length === 15, "Expected 15 lessons")
assert(pm.modules.flatMap((module) => module.lessons).every((lesson) => lesson.type !== "video"), "PM lessons must not claim video")
assert(pm.projects === 3, "Expected 3 assignments/projects")
assert(pm.outcomes.every((row) => !/python|sql|power bi|machine learning|\bml\b|job-ready|hired|placement/i.test(row)), "Outcomes overclaim")
assert(/problem|priorit|spec/i.test(pm.outcomes.join(" ")), "Outcomes should name taught product capabilities")
assert(isAuthoredCourse("product-management"), "Product Management must be an authored course")
assert(isAuthoredCourse("data-analytics"), "Data Analytics must remain authored")

assert(PM_LESSON_META.length === 15, "Lesson meta must cover the spine")
assert(PM_TEACHING_LESSON_IDS.length === 9, "Expected 9 written teaching lessons")

for (const id of ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12", "l13", "l14", "l15"]) {
  const file = join(lessonTextDir, `${id}.md`)
  assert(existsSync(file), `Missing lesson text ${id}.md`)
  const body = readFileSync(file, "utf8")
  assert(body.length > 200, `${id}.md is too short to teach`)
  assert(!/coming soon|watch this video|practice here|learn the basics/i.test(body), `${id}.md has placeholder teaching`)
}

for (const id of PM_TEACHING_LESSON_IDS) {
  const body = readFileSync(join(lessonTextDir, `${id}.md`), "utf8")
  for (const heading of ["## Explain", "## Worked example", "## Practice", "## Expected result", "## Common mistakes", "## Knowledge check"]) {
    assert(body.includes(heading), `${id} missing ${heading}`)
  }
  assert(body.length > 1500, `${id} teaching body is still too thin`)
  assert(/Harbor/i.test(body), `${id} should use the Harbor Desk case`)
  assert(!/northwind_sales|SELECT net_revenue/i.test(body), `${id} must not copy Data Analytics SQL`)
}

for (const id of ["l6", "l12", "l14"]) {
  const brief = PM_ASSIGNMENTS[id]
  assert(brief, `Missing assignment ${id}`)
  assert(brief.scenario.length > 80, `${id} scenario too thin`)
  assert(brief.instructions.length >= 5, `${id} needs real instructions`)
  assert(brief.evaluationCriteria.length >= 3, `${id} needs a rubric`)
  assert(brief.caseHref?.startsWith("/content/product-management/"), `${id} case path`)
  assert(brief.careerEvidence.artifact.length > 10, `${id} must name an artifact`)
}

assert(Object.keys(PM_QUIZZES).join(",") === "l3,l9,l15", "Unexpected PM quiz banks")
let questionCount = 0
for (const bank of Object.values(PM_QUIZZES)) {
  assert(bank.questions.length === 5, `${bank.lessonId} should have 5 questions`)
  for (const question of bank.questions) {
    questionCount += 1
    assert(question.options.length >= 4, "MCQ needs four options")
    assert(question.correctIndex >= 0 && question.correctIndex < question.options.length, "correctIndex in range")
    assert(question.explanation.length > 20, "explanation required")
  }
}
assert(questionCount === 15, "Expected 15 PM quiz questions")

assert(seedSource.includes("pmQuizSeedKey('l3')") || seedSource.includes("product-management:l3"), "Seed must key PM quizzes by course slug")
assert(existsSync(join(root, "public/content/product-management/harbor-desk-case.md")), "Missing Harbor Desk case file")
assert(learnSource.includes("fetchQuizQuestions"), "LearnPage quizzes must load from the LMS API")
assert(!learnSource.includes("getCourseQuiz"), "LearnPage must not import client quiz banks")

const fake = ["instructor", "faculty spotlight", "4.8 stars", "learners enrolled", "get hired", "certificate issued"]
const allText = pm.outcomes.join(" ") + Object.values(PM_ASSIGNMENTS).map((row) => `${row.scenario} ${row.objective}`).join(" ")
for (const word of fake) {
  assert(!new RegExp(word, "i").test(allText), `Fake claim slipped in: ${word}`)
}
assert(!/placement guarantee|job-ready/i.test(pm.desc + pm.longDesc), "PM listing must not sell placement")

console.log("pm-content ok")
