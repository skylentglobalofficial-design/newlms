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
import {
  fetchCatalogCourse,
  fetchCatalogCourses,
  fetchCatalogProgram,
  fetchCatalogPrograms,
  isProgramEnrollable,
  mapCatalogCourseDetail,
  mapCatalogProgramDetail,
  type CatalogProgramSummary,
} from "../src/lib/catalog-api.ts"
import { partitionCatalogPrograms } from "../src/lib/programme-catalogue.ts"
import { hasAuthoredProgrammePath } from "../src/lib/programme-discovery.ts"

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
assert(/useCatalogCourse/.test(courseDetail), "Course page loads public identity from the catalog API")
assert(!/from ["']\.\.\/data["']/.test(courseDetail), "Course page must not import the static catalogue as its existence gate")
assert(!/courses\.find/.test(courseDetail), "Course page must not 404 from static data.ts")
assert(/catalog\.loading/.test(courseDetail), "Course page distinguishes a loading state")
assert(/catalog\.error/.test(courseDetail), "Course page distinguishes a network\/API error")
assert(/This course could not be loaded/.test(courseDetail), "API failure renders an error state")
assert(/This is not a missing course/.test(courseDetail), "API failure must not look like a 404")
assert(/Course not found/.test(courseDetail), "Unknown API slug still has a not-found state")
assert(/isAuthoredCourse/.test(courseDetail), "Readiness stays on the authored-course registry")
assert(/ProductLanguage/.test(courseDetail), "Authored ProductLanguage remains mounted")
assert(/CourseProductVisual/.test(courseDetail), "Authored course visual remains on the detail page")
assert(/courseModuleCards/.test(courseDetail), "Course page must render the real module map")
assert(/coursePracticeGroups/.test(courseDetail), "Course page must distinguish learning, practice, assignment, and capstone")
assert(/showLiveCurriculum && practice/.test(courseDetail), "Practice editorial stays behind authored readiness, not lessonCount")
assert(/const showLiveCurriculum = authored/.test(courseDetail), "Live curriculum is gated on the authored registry")
assert(/const enrollable = authored/.test(courseDetail), "Enrolment is gated on the authored registry, not outline counts")
assert(!/lessonCount\s*>\s*0/.test(courseDetail), "lessonCount > 0 must not imply authored readiness")
assert(!/moduleCount\s*>\s*0/.test(courseDetail), "moduleCount > 0 must not imply authored readiness")
assert(/kind: "course"/.test(courseDetail), "Enrolment on /courses/:slug remains a COURSE")
assert(/slug: course.slug/.test(courseDetail), "Enrolment still uses the course slug")
assert(!/useCatalogProgram|fetchCatalogProgram/.test(courseDetail), "product-management on /courses stays a course record")
assert(!/listedPrice/.test(courseDetail), "Public course detail no longer displays a listed rupee price")
assert(!/toLocaleString\("en-IN"\)/.test(courseDetail), "Public course detail must not format a listed rupee price")
assert(!/aria-expanded/.test(courseDetail), "Course page must not dump every lesson into an accordion")
assert(/Payment is not collected/.test(courseDetail), "Course page must state that payment is not collected")
assert(/primaryCta/.test(courseDetail), "Course page CTA must come from the honest access helper")
assert(/thinner than Data Analytics/.test(courseDetail), "Non-authored listings keep the thinner-listing honesty copy")

const programDetail = readFileSync(new URL("../src/pages/ProgramPage.tsx", import.meta.url), "utf8")
assert(/useCatalogProgram/.test(programDetail), "Programme page loads public identity from the catalog API")
assert(/catalog\.loading/.test(programDetail), "Programme page distinguishes a loading state")
assert(/catalog\.error/.test(programDetail), "Programme page distinguishes a network\/API error")
assert(/This programme could not be loaded/.test(programDetail), "API failure renders an error state")
assert(/This is not a missing programme/.test(programDetail), "API failure must not look like a 404")
assert(/Programme not found/.test(programDetail), "Unknown API slug still has a not-found state")
assert(/programmeDiscoveryFor/.test(programDetail), "Authored programmes must resolve from real discovery data")
assert(/discovery.modules/.test(programDetail), "Programme page must show the taught module path")
assert(/ProgramWorkflowVisual/.test(programDetail), "Authored programmes keep ProgramWorkflowVisual")
assert(/PROGRAMME_WORK_SURFACES/.test(programDetail), "Authored programmes keep work-surface copy")
assert(/PROGRAMME_ENROLMENT_FACTS/.test(programDetail), "Authored programmes keep enrolment facts")
assert(/ProductLanguage/.test(programDetail), "Authored ProductLanguage remains mounted")
assert(/hasTaughtPath/.test(programDetail), "Taught-path enrolment stays on the authored programme path")
assert(/hasAuthoredProgrammePath\(program\.slug\)/.test(programDetail), "Programme enrolment uses the authored taught-path rule")
assert(!/linkedCourseSlugs\.some/.test(programDetail), "A linked authored course must not make a listing enrolable")
assert(/isAuthoredCourse/.test(programDetail), "Authored linked-course logic remains")
assert(
  /isProgramEnrollable\(program\) && hasTaughtPath/.test(programDetail),
  "A programme is not enrolable from API presence or moduleCount alone",
)
assert(!/moduleCount\s*>\s*0/.test(programDetail), "moduleCount > 0 must not make a programme ready")
assert(!/program\.curriculum|\.curriculum\b/.test(programDetail), "Program.curriculum is not treated as authored taught curriculum")
assert(/linkedCourseSlugs/.test(programDetail), "API linkedCourseSlugs control the programme-to-course relationship")
assert(/kind: "program"/.test(programDetail), "Enrolment on /programs/:slug remains a PROGRAM")
assert(/slug: program.slug/.test(programDetail), "Enrolment still uses the programme slug")
assert(!/kind: "course"/.test(programDetail), "product-management on /programs must not enrol as a course")
assert(!/fetchCatalogCourse|useCatalogCourse/.test(programDetail), "Programme detail must not load the course catalog by slug")
assert(!/PROGRAMME_INTENDED_STEPS/.test(programDetail), "Programme page must not present the generic intended-path board as live teaching")
assert(!/curriculumDetail|projectsDetail|whatYouWillLearn/.test(programDetail), "Programme page must not render brochure curriculum as live teaching")
assert(/Payment is not collected/.test(programDetail), "Programme page must state that payment is not collected")

const programsIndex = readFileSync(new URL("../src/pages/ProgramsPage.tsx", import.meta.url), "utf8")
assert(/useCatalogPrograms/.test(programsIndex), "Programmes index loads public identity from the catalog API")
assert(/fetchCatalogPrograms|useCatalogPrograms/.test(programsIndex), "Programmes index calls the live programmes catalogue")
assert(!/liveProgrammeCatalogue\(/.test(programsIndex), "Programmes index must not use liveProgrammeCatalogue as public identity")
assert(!/laterProgrammeCatalogue\(/.test(programsIndex), "Programmes index must not use laterProgrammeCatalogue as public identity")
assert(!/LIVE_PROGRAMME_SLUGS/.test(programsIndex), "Programmes index must not use the hardcoded live slug list as existence")
assert(!/from ["']\.\.\/data["']/.test(programsIndex), "Programmes index must not import static data.ts as its existence gate")
assert(/partitionCatalogPrograms/.test(programsIndex), "Programmes index classifies API rows through the authored overlay")
assert(/hasAuthoredProgrammePath/.test(programsIndex), "Index and detail share the authored taught-path helper")
assert(/catalog\.loading/.test(programsIndex), "Programmes index distinguishes a loading state")
assert(/catalog\.error/.test(programsIndex), "Programmes index distinguishes a network\/API error")
assert(/This is not an empty catalogue/.test(programsIndex), "API failure must not look like an empty catalogue")
assert(/The programme catalogue could not be loaded/.test(programsIndex), "API failure renders an error state")
assert(/The programme catalogue is empty/.test(programsIndex), "Successful empty [] has its own empty-catalogue state")
assert(!/No programmes found|No programmes match/.test(programsIndex), "Error and empty copy must not use a filter-miss phrase")
assert(!/moduleCount\s*>\s*0/.test(programsIndex), "moduleCount > 0 must not make a programme ready on the index")
assert(/hasAuthoredProgrammePath/.test(programDetail) && /hasAuthoredProgrammePath/.test(programsIndex), "ProgramPage and ProgramsPage use the same readiness helper")

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
assert(
  isAuthoredCourse("data-analytics") && isAuthoredCourse("product-management"),
  "Authored overlay still recognises the ready courses",
)
assert(
  !isAuthoredCourse("python-programming"),
  "lessonCount/moduleCount on a listing must not mark it authored",
)

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

const mappedDetail = mapCatalogCourseDetail({
  slug: "data-analytics",
  title: "Data Analytics",
  category: "Data",
  level: "Beginner",
  duration: "10 weeks",
  mode: "Self-paced",
  price: 4999,
  originalPrice: 9999,
  desc: "Learn spreadsheet analysis, SQL, data cleaning, dashboards, and business interpretation on a synthetic Northwind dataset.",
  longDesc: "A written, practice-first Data Analytics course.",
  outcomes: ["Build and analyse structured datasets in spreadsheets"],
  forWhom: ["People who need to analyse tables at work"],
  moduleCount: 1,
  lessonCount: 1,
  projectCount: 0,
  curriculum: [
    {
      sourceId: "mod-1",
      order: 0,
      title: "Spreadsheets",
      nodes: [
        {
          sourceId: "node-1",
          order: 0,
          title: "Read a table",
          nodeType: "NOTES",
          duration: "12 min",
        },
      ],
    },
  ],
})
assert(mappedDetail.slug === "data-analytics", "Course-detail mapper keeps slug")
assert(mappedDetail.desc.length > 0, "Course-detail mapper keeps desc")
assert(mappedDetail.outcomes.length === 1, "Course-detail mapper keeps outcomes")
assert(mappedDetail.curriculum[0]?.title === "Spreadsheets", "Course-detail mapper keeps module titles")
assert(mappedDetail.curriculum[0]?.nodes[0]?.title === "Read a table", "Course-detail mapper keeps node titles")
assert(mappedDetail.curriculum[0]?.nodes[0]?.nodeType === "NOTES", "Course-detail mapper keeps nodeType")
assert(mappedDetail.curriculum[0]?.nodes[0]?.duration === "12 min", "Course-detail mapper keeps node duration")

const mappedProgram = mapCatalogProgramDetail({
  slug: "product-management",
  name: "Product Management",
  enrollmentStatus: "OPEN",
  duration: "6 months",
  format: "Self-paced",
  level: "Beginner",
  desc: "A professional programme listing.",
  programType: "PROFESSIONAL",
  moduleCount: 40,
  projectCount: 8,
  linkedCourseSlugs: ["product-management"],
  pricing: [{ name: "Standard", price: 4999, originalPrice: 9999, features: [], highlight: false }],
  curriculum: [{ title: "Brochure module that must not become the taught path" }],
})
assert(mappedProgram.slug === "product-management", "Programme-detail mapper keeps slug")
assert(mappedProgram.name === "Product Management", "Programme-detail mapper keeps name")
assert(mappedProgram.enrollmentStatus === "open", "Programme-detail mapper keeps enrollmentStatus")
assert(mappedProgram.linkedCourseSlugs[0] === "product-management", "Programme-detail mapper keeps linkedCourseSlugs")
assert(mappedProgram.duration === "6 months", "Programme-detail mapper keeps duration")
assert(mappedProgram.format === "Self-paced", "Programme-detail mapper keeps format")
assert(mappedProgram.moduleCount === 40, "Programme-detail mapper preserves moduleCount without treating it as readiness")
assert(!("curriculum" in mappedProgram), "Programme-detail mapper must not keep brochure curriculum")
assert(
  !mappedProgram.linkedCourseSlugs.every((slug) => slug === "product-management") || isAuthoredCourse("product-management"),
  "product-management course authorship stays on the authored registry, not programme moduleCount",
)

const listingProgram = mapCatalogProgramDetail({
  slug: "full-stack",
  name: "Full Stack Software Development",
  enrollmentStatus: "OPEN",
  duration: "6 months",
  format: "Self-paced",
  level: "Beginner",
  desc: "A catalogue listing.",
  programType: "PROFESSIONAL",
  moduleCount: 99,
  projectCount: 4,
  linkedCourseSlugs: ["full-stack-web"],
  pricing: [],
})
assert(listingProgram.moduleCount === 99, "API moduleCount can be high on a listing")
assert(
  !listingProgram.linkedCourseSlugs.some((slug) => isAuthoredCourse(slug)),
  "A non-authored programme stays non-authored even with moduleCount and linkedCourseSlugs",
)

assert(hasAuthoredProgrammePath("product-management"), "product-management remains an authored programme")
assert(hasAuthoredProgrammePath("data-analytics-pro"), "data-analytics-pro remains an authored programme")
assert(!hasAuthoredProgrammePath("full-stack"), "full-stack remains a catalogue listing")
assert(
  !hasAuthoredProgrammePath("data-science-ai"),
  "data-science-ai has no authored taught programme path",
)

function catalogRow(partial: Partial<CatalogProgramSummary> & Pick<CatalogProgramSummary, "slug" | "name">): CatalogProgramSummary {
  return {
    enrollmentStatus: "open",
    duration: "6 months",
    format: "Self-paced",
    level: "Beginner",
    desc: partial.desc ?? `${partial.name} catalogue row`,
    programType: "PROFESSIONAL",
    moduleCount: 40,
    projectCount: 8,
    linkedCourseSlugs: [],
    pricing: [{ name: "Standard", price: 4999, originalPrice: 9999, features: [], highlight: false }],
    ...partial,
  }
}

const partitioned = partitionCatalogPrograms([
  catalogRow({
    slug: "product-management",
    name: "Product Management",
    linkedCourseSlugs: ["product-management"],
  }),
  catalogRow({
    slug: "data-analytics-pro",
    name: "Data Analytics with Gen AI",
    linkedCourseSlugs: ["data-analytics"],
  }),
  catalogRow({
    slug: "full-stack",
    name: "Full Stack Development",
    moduleCount: 99,
    projectCount: 5,
    linkedCourseSlugs: ["full-stack-web"],
  }),
  catalogRow({
    slug: "data-science-ai",
    name: "Data Science & AI",
    moduleCount: 18,
    projectCount: 6,
    linkedCourseSlugs: ["data-analytics", "python-programming"],
  }),
  catalogRow({
    slug: "jee-advanced-prep",
    name: "JEE Advanced Preparation",
    programType: "EXAM_PREP",
    enrollmentStatus: "coming_soon",
  }),
])

assert(
  partitioned.live.some((row) => row.slug === "product-management"),
  "product-management stays in the authored index",
)
assert(
  partitioned.live.some((row) => row.slug === "data-analytics-pro"),
  "data-analytics-pro stays in the authored index",
)
assert(
  partitioned.later.some((row) => row.slug === "full-stack"),
  "full-stack stays a later catalogue listing",
)
assert(
  partitioned.later.some((row) => row.slug === "data-science-ai"),
  "data-science-ai stays later even when OPEN and linked to an authored course",
)
assert(
  !partitioned.live.some((row) => row.slug === "data-science-ai"),
  "OPEN + linkedCourseSlugs must not promote data-science-ai to ready",
)
assert(
  !partitioned.live.some((row) => row.slug === "full-stack"),
  "moduleCount must not promote full-stack to ready",
)
assert(
  !partitioned.later.some((row) => row.slug === "jee-advanced-prep") &&
    !partitioned.live.some((row) => row.slug === "jee-advanced-prep"),
  "Exam-prep API rows stay off the professional programmes index",
)

const dsaiApi = catalogRow({
  slug: "data-science-ai",
  name: "Data Science & AI",
  linkedCourseSlugs: ["data-analytics"],
})
assert(isProgramEnrollable(dsaiApi), "data-science-ai can be OPEN with a linked course in the API")
assert(
  !(isProgramEnrollable(dsaiApi) && hasAuthoredProgrammePath(dsaiApi.slug)),
  "data-science-ai is not enrolable without an authored taught programme path",
)
assert(
  isProgramEnrollable(catalogRow({
    slug: "product-management",
    name: "Product Management",
    linkedCourseSlugs: ["product-management"],
  })) && hasAuthoredProgrammePath("product-management"),
  "product-management stays enrolable because it has an authored taught path",
)

const originalFetch = globalThis.fetch
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = String(input)
  if (url === "/api/v1/catalog/courses") {
    return new Response(
      JSON.stringify({
        data: [
          {
            slug: "data-analytics",
            title: "Data Analytics",
            category: "Data",
            level: "Beginner",
            duration: "10 weeks",
            mode: "Self-paced",
            price: 4999,
            originalPrice: 9999,
            moduleCount: 5,
            lessonCount: 15,
            projectCount: 4,
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  }
  if (url === "/api/v1/catalog/courses/data-analytics" || url === "/api/v1/catalog/courses/product-management") {
    const slug = url.endsWith("product-management") ? "product-management" : "data-analytics"
    const title = slug === "product-management" ? "Product Management" : "Data Analytics"
    return new Response(
      JSON.stringify({
        data: {
          slug,
          title,
          category: slug === "product-management" ? "Product" : "Data",
          level: "Beginner",
          duration: "10 weeks",
          mode: "Self-paced",
          price: 4999,
          originalPrice: 9999,
          desc: title,
          longDesc: title,
          outcomes: [],
          forWhom: [],
          moduleCount: 5,
          lessonCount: 15,
          projectCount: 4,
          curriculum: [
            {
              sourceId: "mod-1",
              order: 0,
              title: "Module one",
              nodes: [{ sourceId: "node-1", order: 0, title: "First node", nodeType: "NOTES", duration: null }],
            },
          ],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  }
  if (url === "/api/v1/catalog/courses/missing-course") {
    return new Response(JSON.stringify({ error: "Course not found" }), { status: 404 })
  }
  if (url === "/api/v1/catalog/courses/broken-course") {
    return new Response(JSON.stringify({ error: "Catalog unavailable" }), { status: 500 })
  }
  if (url === "/api/v1/catalog/courses/network-down") {
    throw new TypeError("Failed to fetch")
  }
  if (url === "/api/v1/catalog/programs") {
    return new Response(
      JSON.stringify({
        data: [
          {
            slug: "data-analytics-pro",
            name: "Data Analytics",
            enrollmentStatus: "OPEN",
            moduleCount: 5,
            projectCount: 4,
            linkedCourseSlugs: ["data-analytics"],
            pricing: [],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  }
  if (
    url === "/api/v1/catalog/programs/product-management" ||
    url === "/api/v1/catalog/programs/data-analytics-pro" ||
    url === "/api/v1/catalog/programs/full-stack"
  ) {
    const slug = url.split("/").at(-1) ?? ""
    const name =
      slug === "product-management"
        ? "Product Management"
        : slug === "data-analytics-pro"
          ? "Data Analytics"
          : "Full Stack Software Development"
    const linkedCourseSlugs =
      slug === "full-stack" ? ["full-stack-web"] : slug === "data-analytics-pro" ? ["data-analytics"] : ["product-management"]
    return new Response(
      JSON.stringify({
        data: {
          slug,
          name,
          enrollmentStatus: "OPEN",
          duration: "6 months",
          format: "Self-paced",
          level: "Beginner",
          desc: name,
          programType: "PROFESSIONAL",
          moduleCount: slug === "full-stack" ? 99 : 5,
          projectCount: 1,
          linkedCourseSlugs,
          pricing: [{ name: "Standard", price: 4999, originalPrice: 9999, features: [], highlight: false }],
          curriculum: [{ title: "Brochure module" }],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  }
  if (url === "/api/v1/catalog/programs/missing-program") {
    return new Response(JSON.stringify({ error: "Program not found" }), { status: 404 })
  }
  if (url === "/api/v1/catalog/programs/broken-program") {
    return new Response(JSON.stringify({ error: "Catalog unavailable" }), { status: 500 })
  }
  if (url === "/api/v1/catalog/programs/network-down") {
    throw new TypeError("Failed to fetch")
  }
  return new Response(JSON.stringify({ error: "unexpected mock url" }), { status: 500 })
}) as typeof fetch

try {
  const summary = await fetchCatalogCourses()
  assert(summary.length === 1 && summary[0]?.slug === "data-analytics", "fetchCatalogCourses summary behaviour stays intact")
  assert(!("curriculum" in summary[0]!), "Course index mapper must not require the detail payload")

  const existing = await fetchCatalogCourse("data-analytics")
  assert(existing?.slug === "data-analytics", "Existing API course slug loads")
  assert(existing?.curriculum.length === 1, "Existing API course keeps curriculum outline")

  const productCourse = await fetchCatalogCourse("product-management")
  assert(productCourse?.slug === "product-management", "product-management remains a COURSE in the courses catalog")

  const missing = await fetchCatalogCourse("missing-course")
  assert(missing === null, "Unknown API slug is a successful not-found")

  let failed = false
  try {
    await fetchCatalogCourse("broken-course")
  } catch {
    failed = true
  }
  assert(failed, "API failure must throw instead of returning a false 404")

  let networkFailed = false
  try {
    await fetchCatalogCourse("network-down")
  } catch {
    networkFailed = true
  }
  assert(networkFailed, "Network failure must throw instead of returning a false 404")

  const programIndex = await fetchCatalogPrograms()
  assert(programIndex.length === 1 && programIndex[0]?.slug === "data-analytics-pro", "fetchCatalogPrograms summary behaviour stays intact")
  assert(programIndex[0]?.duration === "", "Programme index mapper does not require a detail-only duration field")
  assert(programIndex[0]?.programType === "", "Programme index mapper does not require programType on a thin payload")
  assert(!("curriculum" in programIndex[0]!), "Programme index mapper must not keep brochure curriculum")

  const existingProgram = await fetchCatalogProgram("data-analytics-pro")
  assert(existingProgram?.slug === "data-analytics-pro", "Existing API programme slug loads")
  assert(existingProgram?.linkedCourseSlugs.includes("data-analytics"), "Data Analytics programme keeps the authored course link")
  assert(!("curriculum" in existingProgram!), "Fetched programme detail must not expose brochure curriculum")

  const productProgram = await fetchCatalogProgram("product-management")
  assert(productProgram?.slug === "product-management", "product-management remains a PROGRAMME in the programs catalog")
  assert(productProgram?.name === "Product Management", "product-management programme keeps its programme name")
  assert(productProgram?.linkedCourseSlugs.includes("product-management"), "product-management programme still links the course slug")

  const listing = await fetchCatalogProgram("full-stack")
  assert(listing?.moduleCount === 99, "Non-authored programme can have API moduleCount")
  assert(!listing?.linkedCourseSlugs.some((slug) => isAuthoredCourse(slug)), "Non-authored programme links are not authored courses")

  const missingProgram = await fetchCatalogProgram("missing-program")
  assert(missingProgram === null, "Unknown API programme slug is a successful not-found")

  let programFailed = false
  try {
    await fetchCatalogProgram("broken-program")
  } catch {
    programFailed = true
  }
  assert(programFailed, "Programme API failure must throw instead of returning a false 404")

  let programNetworkFailed = false
  try {
    await fetchCatalogProgram("network-down")
  } catch {
    programNetworkFailed = true
  }
  assert(programNetworkFailed, "Programme network failure must throw instead of returning a false 404")
} finally {
  globalThis.fetch = originalFetch
}

console.log("catalog-truth ok")
console.log({
  ready: courses.filter((course) => coursePublicView(course).maturity === "ready").map((course) => course.slug),
  openPrograms: programs.filter((program) => program.enrollmentStatus === "open").map((program) => program.slug),
  links: expectedLinks,
})
