import { readFileSync } from "node:fs"
import { courses, programs } from "../src/data.ts"
import {
  AUTHORED_COURSE_SLUG,
  PROGRAM_COURSE_LINKS,
  courseLessonStats,
  courseModuleCards,
  coursePracticeGroups,
  coursePrimaryCta,
  coursePublicView,
  isAuthoredCourse,
  linkedCourseSlugsForProgram,
  programmeAfterEnrolCopy,
  programmePublicView,
} from "../src/lib/catalog-maturity.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const da = courses.find((course) => course.slug === AUTHORED_COURSE_SLUG)
assert(da, "Data Analytics must exist")
const daStats = courseLessonStats(da!)
assert(daStats.moduleCount === 5, "Data Analytics must have 5 modules")
assert(daStats.lessonCount === 15, "Data Analytics must have 15 lessons")
assert(daStats.quizCount === 3, "Data Analytics must expose its quizzes")
assert(daStats.assignmentCount === 4, "Data Analytics must expose its assignments")

const daView = coursePublicView(da!)
assert(daView.maturity === "ready", "Data Analytics must be ready to start")
assert(daView.showLiveCurriculum, "Data Analytics curriculum is live")
assert(/written/i.test(daView.delivery), "Data Analytics delivery is written/practical")
assert(!/live/i.test(daView.delivery), "Data Analytics must not claim live classes")
assert(daView.honesty === null, "Data Analytics must not carry a thin-listing disclaimer")
assert(
  daView.outcomes.every((item) => !/machine learning|\bAI\b|predictive/i.test(item)),
  "Data Analytics outcomes must not claim ML or AI",
)

for (const course of courses) {
  assert(course.rating === 0 && course.reviews === 0, `${course.slug} must not carry fake ratings/reviews`)
  assert(!/live classes|live \+/i.test(course.mode), `${course.slug} public mode must not claim live classes`)
  const view = coursePublicView(course)
  assert(view.listedPrice > 0, `${course.slug} keeps a listed price`)
  if (isAuthoredCourse(course.slug)) {
    assert(view.maturity === "ready", `${course.slug} is an authored course and must be ready`)
  } else {
    assert(view.maturity === "listing", `${course.slug} must be a catalogue listing`)
    assert(view.honesty?.includes("thinner than Data Analytics"), `${course.slug} must be labelled thinner`)
    assert(!view.showLiveCurriculum, `${course.slug} must not present stub lessons as a finished course`)
  }
}

assert(
  courses.filter((course) => coursePublicView(course).maturity === "ready").length === 2,
  "Data Analytics and Product Management are ready to start",
)

for (const course of courses) {
  if (isAuthoredCourse(course.slug)) continue
  const view = coursePublicView(course)
  assert(/catalogue listing/i.test(view.summary), `${course.slug} public summary must read as a listing`)
  assert(!/live case|live class|real client/i.test(view.summary), `${course.slug} public summary must not claim live delivery`)
  assert(view.forWhom.length === 0, `${course.slug} must not present brochure audience copy as a live course`)
}

assert(
  programs.every((program) => programmePublicView(program).maturity !== "ready"),
  "No programme is a fully authored pathway",
)

const pageFiles = [
  "src/pages/CoursesPage.tsx",
  "src/pages/CourseDetailPage.tsx",
  "src/pages/ProgramsPage.tsx",
  "src/pages/ProgramPage.tsx",
]
for (const file of pageFiles) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
  assert(!/\brating\b|\breviews\b|50%\s*OFF|originalPrice|upcomingBatch|Live Classes|Live \+/i.test(source), `${file} must not expose unsupported social proof or live-class marketing`)
  assert(!/faculty:|Next Batch|seats remaining|Get hired|Industry certificate/i.test(source), `${file} must not sell faculty, batches, or certificates`)
}

const courseDetail = readFileSync(new URL("../src/pages/CourseDetailPage.tsx", import.meta.url), "utf8")
assert(/courseModuleCards/.test(courseDetail), "Course page must render the real module map")
assert(/coursePracticeGroups/.test(courseDetail), "Course page must distinguish learning, practice, assignment, and capstone")
assert(!/aria-expanded/.test(courseDetail), "Course page must not dump every lesson into an accordion")
assert(/Payment is not collected/.test(courseDetail), "Course page must state that payment is not collected")
assert(/primaryCta/.test(courseDetail), "Course page CTA must come from the honest access helper")

const programDetail = readFileSync(new URL("../src/pages/ProgramPage.tsx", import.meta.url), "utf8")
assert(/programmeDiscoveryFor/.test(programDetail), "Authored programmes must resolve from real discovery data")
assert(/discovery.modules/.test(programDetail), "Programme page must show the taught module path")
assert(!/PROGRAMME_INTENDED_STEPS/.test(programDetail), "Programme page must not present the generic intended-path board as live teaching")
assert(!/curriculumDetail|projectsDetail|whatYouWillLearn/.test(programDetail), "Programme page must not render brochure curriculum as live teaching")
assert(/Payment is not collected/.test(programDetail), "Programme page must state that payment is not collected")

const expectedLinks: Record<string, string[]> = {}
for (const link of PROGRAM_COURSE_LINKS) {
  expectedLinks[link.programSlug] ??= []
  expectedLinks[link.programSlug].push(link.courseSlug)
}

for (const program of programs) {
  const view = programmePublicView(program)
  assert(!/live classes|live \+/i.test(program.format), `${program.slug} format must not claim live classes`)
  const links = linkedCourseSlugsForProgram(program.slug)
  if (program.enrollmentStatus === "open") {
    assert(links.length > 0, `Open programme ${program.slug} must declare LMS course links`)
    assert(view.enrollOpen, `${program.slug} remains enrolable into its linked course`)
    assert(view.maturity === "listing", `Open programme ${program.slug} is not a fully authored pathway`)
    for (const slug of links) {
      assert(courses.some((course) => course.slug === slug), `${program.slug} linked course missing: ${slug}`)
    }
  } else {
    assert(view.maturity === "coming_later", `${program.slug} must be coming later when not open`)
    assert(!view.enrollOpen, `${program.slug} must not look enrolable`)
  }
  assert(!/guaranteed job|placement|get hired/i.test(view.honesty), `${program.slug} honesty must not sell placement`)
  assert(view.taughtOutcomes.every((item) => !/deep learning|neural network|huggingface/i.test(item)), `${program.slug} taught outcomes must not advertise untaught ML`)
}

const analyticsPro = programmePublicView(programs.find((row) => row.slug === "data-analytics-pro")!)
assert(analyticsPro.linked.some((item) => item.slug === "data-analytics" && item.authored), "Data Analytics pathway must link the authored course")
assert(/data analytics course/i.test(analyticsPro.honesty), "Data Analytics programme must say the live LMS is the course")
assert(
  analyticsPro.ctaLabel === "Start this programme",
  "Data Analytics programme CTA must start the programme",
)
assert(
  /enrolment opens the linked course in Skylent OS|opens .+ in Skylent OS/i.test(
    `${analyticsPro.honesty} ${programmeAfterEnrolCopy(analyticsPro)}`,
  ),
  "Data Analytics programme must still explain linked-course enrolment",
)

const daCards = courseModuleCards(da!, true)
assert(daCards.length === 5, "Data Analytics public structure is 5 modules")
assert(daCards.every((card) => card.workLine.length > 0), "Each Data Analytics module must say what the student works on")
assert(!daCards.some((card) => /outline titles only/i.test(card.workLine)), "Authored modules must not use the listing disclaimer")

const daPractice = coursePracticeGroups(da!)
assert(daPractice.learning.length === 8, "Data Analytics has 8 written lessons")
assert(daPractice.practice.length === 3, "Data Analytics has 3 practice checks")
assert(daPractice.assignments.length === 3, "Data Analytics has 3 assignments besides the capstone")
assert(daPractice.capstone.length === 1, "Data Analytics has one capstone")
assert(coursePrimaryCta(daView) === "Start this course", "Data Analytics CTA must start the course")
assert(daView.primaryCta === "Start this course", "Public view CTA matches authored access")

const dsai = programmePublicView(programs.find((row) => row.slug === "data-science-ai")!)
assert(dsai.linked.some((item) => item.slug === "data-analytics"), "Data Science & AI still enrols into Data Analytics")
assert(dsai.linked.some((item) => item.slug === "python-programming"), "Data Science & AI still lists the Python course")
assert(
  dsai.taughtOutcomes.every((item) => !/supervised learning|deep learning/i.test(item)),
  "Data Science & AI must not present brochure ML as what you learn now",
)

const pm = courses.find((course) => course.slug === "product-management")
assert(pm, "Product Management must exist")
const pmView = coursePublicView(pm!)
assert(pmView.maturity === "ready", "Product Management must be ready to start")
assert(pmView.showLiveCurriculum, "Product Management curriculum is live")
assert(courseLessonStats(pm!).lessonCount === 15, "Product Management must have 15 lessons")
assert(courseLessonStats(pm!).moduleCount === 5, "Product Management must have 5 modules")
assert(pmView.outcomes.every((item) => !/sql|power bi|machine learning|\bAI\b/i.test(item)), "Product Management outcomes must not claim untaught data/AI tools")
const pmPractice = coursePracticeGroups(pm!)
assert(pmPractice.learning.length === 9, "Product Management has 9 written lessons")
assert(pmPractice.practice.length === 3, "Product Management has 3 practice checks")
assert(pmPractice.assignments.length === 2, "Product Management has 2 assignments besides the capstone")
assert(pmPractice.capstone.length === 1, "Product Management has one capstone")

console.log("catalog-truth ok")
console.log({
  ready: courses.filter((course) => coursePublicView(course).maturity === "ready").map((course) => course.slug),
  openPrograms: programs.filter((program) => program.enrollmentStatus === "open").map((program) => program.slug),
  links: expectedLinks,
})
