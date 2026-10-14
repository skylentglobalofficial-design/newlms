/**
 * Offline catalogue fallback: the published records must match what the seeded API returns, and every
 * page that can draw on them must say the status is not confirmed and keep enrolment closed.
 * Run: npx tsx scripts/test-catalogue-fallback.ts (no database needed).
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { courses } from "../src/data.ts"
import {
  publishedCourseDetail,
  publishedCourseSummaries,
  publishedProgrammeDetail,
  publishedProgrammeSummaries,
} from "../src/lib/catalogue-fallback.ts"
import { PROGRAM_COURSE_LINKS, programmeAfterEnrolCopy } from "../src/lib/catalog-maturity.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
let checks = 0
const check = (condition: unknown, message: string) => {
  assert(condition, message)
  checks++
}

// 1. Programme module counts follow withProgramFacts() in server/src/routes/catalog.ts.
const catalogRoute = read("server/src/routes/catalog.ts")
check(/moduleCount: moduleCountFromCourses,/.test(catalogRoute), "API module count must be the linked-course total, not brochure curriculum")
check(!/moduleCountFromCourses \|\| moduleCountFromProgram/.test(catalogRoute), "Brochure curriculum must not fill moduleCount when no course is linked")
const programDetailRoute = catalogRoute.slice(
  catalogRoute.indexOf("router.get('/programs/:slug'"),
  catalogRoute.indexOf("router.get('/courses/:slug'"),
)
check(!programDetailRoute.includes("curriculumInclude"), "Programme detail must not load unused brochure curriculum")
check(programDetailRoute.includes("programCourseInclude"), "Programme detail still loads linked courses for module counts")
const linkInclude = catalogRoute.slice(catalogRoute.indexOf("const programCourseInclude"), catalogRoute.indexOf("function countLearnableNodes"))
check(!/nodes:/.test(linkInclude), "Programme link query must not load lesson nodes just to count modules")
for (const program of publishedProgrammeSummaries()) {
  const fromCourses = PROGRAM_COURSE_LINKS.filter((link) => link.programSlug === program.slug).reduce(
    (sum, link) => sum + (courses.find((course) => course.slug === link.courseSlug)?.modules.length ?? 0),
    0,
  )
  const expected = fromCourses
  check(program.moduleCount === expected, `${program.slug}: fallback moduleCount ${program.moduleCount}, linked courses total ${expected}`)
  check(
    JSON.stringify(program.linkedCourseSlugs) ===
      JSON.stringify(PROGRAM_COURSE_LINKS.filter((link) => link.programSlug === program.slug).map((link) => link.courseSlug)),
    `${program.slug}: linked courses differ from the seed links`,
  )
}

// 2. Course counts follow GET /catalog/courses (learnable nodes = everything except TOPIC).
for (const course of publishedCourseSummaries()) {
  const source = courses.find((item) => item.slug === course.slug)!
  const learnable = source.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.type.toUpperCase() !== "TOPIC").length
  check(course.moduleCount === source.modules.length, `${course.slug}: module count`)
  check(course.lessonCount === learnable, `${course.slug}: lesson count`)
}
check(publishedProgrammeDetail("not-a-real-slug") === null, "Unknown programme slug must stay not found")
check(publishedCourseDetail("not-a-real-slug") === null, "Unknown course slug must stay not found")

// 3. Fallback is used only when a request failed; a 404 keeps the not-found state.
const hook = read("src/hooks/useCatalog.ts")
check(/const offline = !state\.loading && Boolean\(state\.error\) && fallback !== null/.test(hook), "Detail fallback only on a failed request")
const catalogApi = read("src/lib/catalog-api.ts")
check((catalogApi.match(/if \(response\.status === 404\) return null/g) ?? []).length >= 2, "404 must resolve to not found, not to the fallback")

// 4. Wording and gating wherever availability cannot be verified.
const files = {
  programPage: read("src/pages/ProgramPage.tsx"),
  template: read("src/components/programme/ProfessionalProgrammeTemplate.tsx"),
  listing: read("src/components/programme/ProgrammeListing.tsx"),
  courseDetail: read("src/pages/CourseDetailPage.tsx"),
  courses: read("src/pages/CoursesPage.tsx"),
  programsIndex: read("src/pages/ProgramsPage.tsx"),
  home: read("src/pages/home/Repolish.tsx"),
}
for (const [name, source] of Object.entries(files)) {
  check(!/Listed as open/.test(source), `${name}: "Listed as open" must be "Status not confirmed"`)
  check(/STATUS_NOT_CONFIRMED/.test(source), `${name}: uses the shared "Status not confirmed" label`)
}
check(/if \(!confirmed \|\| comingLater \|\| !enrollable\) return/.test(files.programPage), "Programme enrol handler refuses when unconfirmed")
check(/const verified = confirmed && !courseUnconfirmed/.test(files.template), "Template also needs the linked course confirmed")
check(/const canEnrol = verified && truth\.enrollable/.test(files.template), "Template enrol gated on verified")
check(/useCatalogCourse\(content\.courseSlug\)/.test(files.template), "Linked course is still requested for enrolment confirmation")
check(!/const startsWith = course\.loading/.test(files.template), "The first lesson must not wait on the linked-course request when the authored outline is known")
check(/authoredOutlineReady/.test(files.template), "Authored outline paints without a lesson skeleton while the course request is in flight")
check(/confirmed && courseUnconfirmed \? \(\s*<CatalogueNotice/.test(files.template), "Linked-course failure shows a catalogue warning")
check(/const canEnrol = confirmed && truth\.enrollable/.test(files.listing), "Listing enrol gated on confirmed")
check(/const enrollable = authored && confirmed/.test(files.courseDetail), "Course enrol gated on confirmed")

// 5. Restored disclaimers, description and sub-navigation.
check(/A certificate for this course is issued when every lesson in it is complete\./.test(files.courseDetail), "Course page keeps the certificate disclaimer")
check(/Payment is not collected/.test(files.courseDetail), "Course page keeps the payment disclaimer")
for (const authored of [true, false]) {
  const linked = [{ slug: "sample", title: "Sample", to: "/courses/sample", authored, maturityLabel: "Sample" }]
  const copy = programmeAfterEnrolCopy({ maturity: "listing", linked })
  check(/Payment is not collected/.test(copy), "After-enrolment copy keeps the payment disclaimer")
  if (authored) check(/It does not create a separate taught programme\./.test(copy), "After-enrolment copy keeps the taught-programme disclaimer")
}
check(/<p className="pp-lede">\{description\}<\/p>/.test(files.listing), "Listing shows the public description")
check(
  /data-science-ai/.test(files.listing) && /Machine learning teaching is not in the pathway yet/.test(files.listing),
  "Data Science listing must not repeat a stale claim that unauthored teaching is already live",
)
check(/<LearnPillarSubnav current="courses" \/>/.test(files.courses), "/courses keeps its sub-navigation")
const appSource = read("src/App.tsx")
check(/https:\/\/skylent\.live/.test(appSource) && /rel="canonical"|link\.rel = "canonical"/.test(appSource), "Public pages set a canonical URL on skylent.live")

// 6. Homepage photographs are sized variants, not the original multi-megapixel JPEGs.
check(!/\.jpg/.test(files.home), "Homepage must not import the original JPEG photographs")
check(/srcSet=\{`\$\{heroStudent720\} 720w, \$\{heroStudent1024\} 1024w`\}/.test(files.home), "Hero uses a responsive srcset")
check(/fetchPriority="high"/.test(files.home), "The hero photograph stays eligible for LCP")
check(/loading="lazy"/.test(files.home), "Below-the-fold homepage photographs stay lazy")
check(/width=\{96\}/.test(files.home), "Avatar images declare intrinsic dimensions")
const homeImages = readdirSync(new URL("../src/assets/site/home", import.meta.url))
const homeBytes = homeImages.reduce((sum, name) => sum + statSync(new URL(`../src/assets/site/home/${name}`, import.meta.url)).size, 0)
check(homeImages.every((name) => name.endsWith(".webp")), "Homepage variants are WebP")
check(homeBytes < 700 * 1024, `Homepage image variants are ${homeBytes} bytes, above 700 KB`)

// 6. Course page overflow: clip with a fallback for browsers without it.
const css = read("src/pages/Catalog.css")
check(/overflow-x: hidden;\s*\/\*[\s\S]*?\*\/\s*overflow-x: clip;/.test(css), "cat-page declares hidden then clip")
check(/@supports not \(overflow-x: clip\)[\s\S]*?\.cat-page \.cat-enrol-bar \{\s*top: 0;/.test(css), "Fallback resets the enrol bar offset")

console.log(`catalogue-fallback: ${checks} checks passed`)
