/**
 * Effective public catalogue copy, not the static record in isolation.
 * A stale API payload must not survive onto the course page, the programme
 * page, or the public catalogue response.
 *
 * Run: npx tsx scripts/test-public-catalogue-copy.ts
 */
import { readFileSync } from "node:fs"
import { courses, programs, workshops, blogPosts } from "../src/data.ts"
import { courseLessonStats } from "../src/lib/catalog-maturity.ts"
import {
  authoredCourseCurriculum,
  curriculumHeading,
  dataAnalyticsModuleSummary,
  effectiveAuthoredCourseCopy,
  effectiveProgrammePublicFacts,
  modulePhrase,
  productManagementModuleSummary,
} from "../src/lib/public-catalogue-copy.ts"
import {
  overlayPublicCourse,
  overlayPublicProgramme,
  PUBLIC_COURSE_COPY,
  PUBLIC_PROGRAMME_COPY,
} from "../server/src/lib/public-catalogue-copy.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const UNSUPPORTED = /python|power\s*bi|live classes|live \+/i
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

function poisonCourse(slug: string) {
  return {
    slug,
    desc: "Master SQL, Excel, Power BI and Python to analyse data and drive business decisions. Includes live classes.",
    longDesc: "Live classes cover Power BI and Python.",
    outcomes: [
      "Analyse business datasets with SQL and Python",
      "Build interactive Power BI dashboards",
    ],
    forWhom: ["People expecting a live classroom"],
    mode: "Live + Self-paced",
  }
}

for (const slug of ["data-analytics", "product-management"] as const) {
  const source = courses.find((course) => course.slug === slug)
  assert(source, `${slug} authored course missing`)
  const poisoned = poisonCourse(slug)
  const shown = effectiveAuthoredCourseCopy(poisoned)
  const served = overlayPublicCourse(poisoned)
  const surface = [shown.desc, shown.longDesc, shown.mode, ...shown.outcomes, ...shown.forWhom].join("\n")

  assert(shown.desc === source.desc, `${slug} page description must be the authored description`)
  assert(shown.longDesc === source.longDesc, `${slug} long description must be the authored description`)
  assert(shown.mode === source.mode, `${slug} mode must be the authored mode`)
  assert(JSON.stringify(shown.outcomes) === JSON.stringify(source.outcomes), `${slug} outcomes must be the authored outcomes`)
  assert(JSON.stringify(shown.forWhom) === JSON.stringify(source.forWhom), `${slug} audience must be the authored audience`)
  assert(!/power\s*bi/i.test(surface), `${slug} effective public copy still claims Power BI`)
  assert(!/live classes|live \+/i.test(surface), `${slug} effective public copy still claims live classes`)
  assert(!/with Python|and Python|Python to/i.test(surface), `${slug} effective public copy still claims Python is taught`)
  assert(shown.desc !== poisoned.desc && shown.outcomes[0] !== poisoned.outcomes[0], `${slug} still shows the stale API copy`)
  assert(served.desc === shown.desc, `${slug} API description must match the page`)
  assert(served.longDesc === shown.longDesc, `${slug} API long description must match the page`)
  assert(JSON.stringify(served.outcomes) === JSON.stringify(shown.outcomes), `${slug} API outcomes must match the page`)
  assert(served.mode === shown.mode, `${slug} API mode must match the page`)
  assert(JSON.stringify(PUBLIC_COURSE_COPY[slug].outcomes) === JSON.stringify(source.outcomes), `${slug} server snapshot drifted from src/data.ts`)
}

const untouched = effectiveAuthoredCourseCopy({
  ...poisonCourse("python-programming"),
  desc: "Python outline: variables, pandas, and visualisation. Catalogue listing — thinner than Data Analytics.",
})
assert(untouched.desc.startsWith("Python outline"), "Non-authored course descriptions stay on the catalogue row")

const daProgramme = programs.find((program) => program.slug === "data-analytics-pro")
const pmProgramme = programs.find((program) => program.slug === "product-management")
const sqlProgramme = programs.find((program) => program.slug === "sql-certificate")
assert(daProgramme && pmProgramme && sqlProgramme, "Programme records missing")

const pmShown = effectiveProgrammePublicFacts({
  slug: "product-management",
  desc: "Develop product thinking through live case studies and mentorship.",
  format: "Live Classes",
  moduleCount: 1,
  linkedCourseSlugs: ["product-management"],
})
const pmServed = overlayPublicProgramme({
  slug: "product-management",
  desc: "Develop product thinking through live case studies and mentorship.",
  format: "Live Classes",
  moduleCount: 1,
  linkedCourseSlugs: ["product-management"],
})
assert(pmShown.taughtModuleCount === 5, "Product Management taught modules are the five authored course modules")
assert(pmShown.format === pmProgramme.format, "Product Management format must be the authored format")
assert(pmShown.desc === pmProgramme.desc, "Product Management description must be the authored description")
assert(!UNSUPPORTED.test(`${pmShown.format}\n${pmShown.desc}`), "Product Management public facts still claim live classes")
assert(pmServed.moduleCount === 5, "Product Management API must not report one module")
assert(pmServed.format === pmShown.format && pmServed.desc === pmShown.desc, "Product Management API copy must match the page")
assert(PUBLIC_PROGRAMME_COPY["product-management"].taughtModuleCount === courseLessonStats(courses.find((course) => course.slug === "product-management")!).moduleCount, "PM snapshot module count drifted")

const daShown = effectiveProgrammePublicFacts({
  slug: "data-analytics-pro",
  desc: "Build expertise in SQL, Excel, Power BI, and Python — with a dedicated Gen AI module.",
  format: "Live + Self-paced",
  moduleCount: 14,
  linkedCourseSlugs: ["data-analytics"],
})
const daServed = overlayPublicProgramme({
  slug: "data-analytics-pro",
  desc: "Build expertise in SQL, Excel, Power BI, and Python — with a dedicated Gen AI module.",
  format: "Live + Self-paced",
  moduleCount: 14,
  linkedCourseSlugs: ["data-analytics"],
})
assert(daShown.taughtModuleCount === 5, "Data Analytics programme reports the five taught course modules")
assert(daShown.format === "Self-paced", "Data Analytics format must not stay Live + Self-paced")
assert(daShown.desc === daProgramme.desc, "Data Analytics programme description must be the authored description")
assert(!/power\s*bi|live classes|live \+/i.test(`${daShown.format}\n${daShown.desc}`), "Data Analytics programme facts must not claim Power BI or live classes")
assert(daServed.moduleCount === 5 && daServed.format === daShown.format && daServed.desc === daShown.desc, "Data Analytics API facts must match the page")

const sqlShown = effectiveProgrammePublicFacts({
  slug: "sql-certificate",
  desc: "A focused, practical SQL course for business analysts — from foundational queries to advanced window functions and business reporting.",
  format: "Self-paced",
  moduleCount: 5,
  linkedCourseSlugs: [],
})
const sqlServed = overlayPublicProgramme({
  slug: "sql-certificate",
  desc: "A focused, practical SQL course for business analysts — from foundational queries to advanced window functions and business reporting.",
  format: "Self-paced",
  moduleCount: 5,
  linkedCourseSlugs: [],
})
assert(sqlShown.taughtModuleCount === 0, "SQL with no linked course must not report brochure modules as taught")
assert(/not open yet/i.test(sqlShown.desc), "SQL keeps the coming-soon description")
assert(sqlShown.desc === sqlProgramme.desc, "SQL description must be the existing honest copy")
assert(!/\b5 modules\b/i.test(`${sqlShown.desc} ${sqlShown.taughtModuleCount}`), "SQL public facts must not present five taught modules")
assert(sqlServed.moduleCount === 0 && sqlServed.desc === sqlShown.desc, "SQL API must not present brochure modules or the brochure description")

const mixed = effectiveProgrammePublicFacts({
  slug: "data-science-ai",
  desc: "Listed as a data science direction.",
  format: "Self-paced",
  moduleCount: 7,
  linkedCourseSlugs: ["data-analytics", "python-programming"],
})
assert(mixed.taughtModuleCount === 7, "A mixed programme keeps the linked-course count from the API")
assert(mixed.desc === "Listed as a data science direction.", "Programmes outside the honest set keep their API description")

assert(modulePhrase(1) === "One module", "A count of one is singular")
assert(modulePhrase(5) === "Five modules", "A count of five stays plural")
assert(curriculumHeading(1, 1) === "One module, one lesson.", "Curriculum heading is singular for one")
assert(curriculumHeading(5, 15) === "Five modules, fifteen lessons.", "Curriculum heading matches the authored Data Analytics counts")

const programmeContent = read("src/components/programme/programme-content.ts")
assert(/summary: dataAnalyticsModuleSummary/.test(programmeContent), "Data Analytics hero must use the singular-aware summary")
assert(/summary: productManagementModuleSummary/.test(programmeContent), "Product Management hero must use the singular-aware summary")
assert(dataAnalyticsModuleSummary(1) === "One module takes you from a first question to a commercial review. Spreadsheets, SQL and dashboards, all on one dataset you get to know properly.", "Data Analytics one-module summary")
assert(!/modules/.test(dataAnalyticsModuleSummary(1)), "Data Analytics one-module summary must not say modules")
assert(dataAnalyticsModuleSummary(5).startsWith("Five modules take you"), "Data Analytics five-module summary")
assert(productManagementModuleSummary(1).startsWith("One module on one fictional"), "Product Management one-module summary")
assert(!/\bmodules\b/.test(productManagementModuleSummary(1)), "Product Management one-module summary must not say modules")
assert(productManagementModuleSummary(5).startsWith("Five modules on one fictional"), "Product Management five-module summary")

const pmCourse = courses.find((course) => course.slug === "product-management")
assert(pmCourse, "Product Management course missing")
assert(authoredCourseCurriculum(pmCourse).length === 5, "Programme curriculum list is the five authored modules")
assert(authoredCourseCurriculum(pmCourse).length === pmShown.taughtModuleCount, "Curriculum list and taught count must match")

const coursePage = read("src/pages/CourseDetailPage.tsx")
assert(/effectiveAuthoredCourseCopy/.test(coursePage), "Course page must use the effective public copy")
assert(!/course\.desc \|\| authoredRecord/.test(coursePage), "Course page must not prefer the API description over the authored record")
const template = read("src/components/programme/ProfessionalProgrammeTemplate.tsx")
assert(/authoredCourseCurriculum/.test(template), "Programme page curriculum must come from the authored course")
assert(/content\.hero\.summary\(moduleCount\)/.test(template), "Programme hero must receive the taught module count")
assert(/facts\.format/.test(template), "Programme format must be the effective public format")
const listing = read("src/components/programme/ProgrammeListing.tsx")
assert(/facts\.taughtModuleCount/.test(listing), "Listing module row must use the taught count")
assert(/facts\.desc/.test(listing), "Listing description must use the effective public description")
const catalogRoute = read("server/src/routes/catalog.ts")
assert(/overlayPublicCourse/.test(catalogRoute), "Course API must overlay honest public copy")
assert(/overlayPublicProgramme/.test(catalogRoute), "Programme API must overlay honest public copy")
assert(!/moduleCountFromCourses \|\| moduleCountFromProgram/.test(catalogRoute), "Programme API must not count brochure curriculum as taught modules")

const data = read("src/data.ts")
const workshopBlock = data.slice(data.indexOf("export const workshops"), data.indexOf("export type BlogPost"))
assert(!/date:/.test(workshopBlock), "Workshop records must not carry a date")
assert(!/\bprice:/.test(workshopBlock), "Workshop records must not carry a price")
assert(!/originalPrice:/.test(workshopBlock), "Workshop records must not carry an original price")
assert(!/August/.test(workshopBlock), "Workshop records must not carry a past calendar date")
for (const workshop of workshops) {
  assert(!("date" in workshop), `${workshop.slug} still has a date`)
  assert(!("price" in workshop), `${workshop.slug} still has a price`)
  assert(!("originalPrice" in workshop), `${workshop.slug} still has an original price`)
}
const workshopsPage = read("src/pages/WorkshopsPage.tsx")
const workshopDetail = read("src/pages/WorkshopDetailPage.tsx")
assert(/Date not set/.test(workshopsPage), "Workshop list says the date is not set")
assert(!/workshop\.date|workshop\.price|originalPrice/.test(workshopsPage + workshopDetail), "Workshop pages must not render date or price fields")
assert(blogPosts.some((post) => post.date.includes("August 2026")), "Blog publication dates stay in place")

const journey = read("src/pages/home/Repolish.tsx")
assert((journey.match(/Illustrative preview · Not connected/g) ?? []).length >= 2, "Career OS walkthrough must label the sample profile as not connected")
assert(/Illustrative preview, not connected/.test(journey), "The walkthrough must expose the disclosure to assistive technology")

console.log("public catalogue copy: ok")
