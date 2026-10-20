/**
 * Practice platform provisioning.
 * Run: npx tsx scripts/test-practice-platform.ts
 */
import type { CourseSyllabus, WorkspaceAdapter } from "../src/lib/practice-platform"
import {
  CATALOGUE_SYLLABI,
  provisionCatalogue,
  provisionCourse,
  validateManifest,
  defaultWorkspaceAdapters,
  WORKSPACE_MANIFEST_VERSION,
} from "../src/lib/practice-platform"
import { lessonPracticeLink } from "../src/lib/practice-environments"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const catalogue = provisionCatalogue()
const bySlug = (slug: string) => catalogue.find((row) => row.courseSlug === slug)

const analytics = bySlug("data-analytics")
assert(analytics?.status === "published" && analytics.adapterId === "sql-lab", "Data Analytics publishes the SQL lab")
assert(analytics?.href === "/os/labs/data-analytics/northwind", "Data Analytics keeps the Northwind route")
assert(analytics?.lessonIds.includes("l7") && !analytics.lessonIds.includes("l4"), "Spreadsheet lessons stay off the SQL lab")
assert(validateManifest(analytics!).length === 0, "Published Data Analytics manifest is valid")

const product = bySlug("product-management")
assert(product?.status === "published" && product.adapterId === "case-studio", "Product Management publishes the case studio")
assert(product?.href?.includes("harbor-desk-case"), "Harbor Desk route is preserved")
assert(!product?.href?.includes("northwind"), "Product Management does not inherit Northwind")

const science = bySlug("data-science-ai")
assert(science?.adapterId === "python-notebook" && science.status === "pending_infrastructure", "Data science selects a notebook and stays unpublished")
assert(science?.href === null, "Data science has no fake notebook route")
assert(science.missing.length > 0, "Data science names the missing runtime")

const stack = bySlug("full-stack")
assert(stack?.adapterId === "frontend-playground" && stack.status === "pending_infrastructure", "Full stack selects a playground and waits for a runner")
assert(stack?.learnerNote.includes("No isolated JavaScript runner"), "Full stack names the missing runner")

const generative = bySlug("generative-ai-program")
assert(generative?.adapterId === "prompt-lab" && generative.status === "pending_infrastructure", "Generative AI waits for a model provider")

const certificate = bySlug("sql-certificate")
assert(certificate?.adapterId === "sql-lab" && certificate.status === "needs_review", "SQL certificate is reviewed rather than pointed at Northwind")
assert(certificate?.href === null, "SQL certificate has no lab route")
assert(certificate?.learnerNote.includes("Northwind Lab belongs to Data Analytics"), "SQL certificate refuses the Data Analytics lab")

const empty = provisionCourse({ courseSlug: "empty-course", title: "Empty", outcomes: [], tools: [], lessons: [] })
assert(empty.status === "not_configured" && empty.href === null, "An empty syllabus is not configured")

const ambiguous = provisionCourse({
  courseSlug: "mixed-signals",
  title: "Mixed",
  outcomes: [],
  tools: [],
  lessons: [
    { id: "l1", title: "Query", type: "assignment", exercise: "sql" },
    { id: "l2", title: "Notebook", type: "assignment", exercise: "notebook" },
  ],
})
assert(ambiguous.status === "needs_review" && ambiguous.href === null, "Equal matches wait for review")
assert(ambiguous.adapterId === null, "A tie does not pick an adapter")

const unboundSql: CourseSyllabus = {
  courseSlug: "retail-sql-practice",
  programmeSlug: "retail-sql-practice",
  title: "Retail SQL practice",
  outcomes: ["Write SELECT queries"],
  tools: ["SQL"],
  datasets: [],
  lessons: [
    { id: "l1", title: "SELECT and WHERE", type: "notes", exercise: "sql" },
    { id: "l2", title: "Category revenue", type: "assignment", exercise: "sql" },
  ],
}
const retail = provisionCourse(unboundSql)
assert(retail.adapterId === "sql-lab" && retail.status === "needs_review", "A new SQL course is classified and held for review")
assert(retail.href === null && !retail.learnerNote.toLowerCase().includes("northwind lab"), "A new SQL course is not given Northwind")
assert(validateManifest(retail).length === 0, "Review manifest is valid")

const brokenPublished = validateManifest({ ...analytics!, version: 2 as 1, href: "/os/labs/data-analytics/northwind" })
assert(brokenPublished.some((error) => error.includes("version")), "A different manifest version is rejected")
const stolen = validateManifest({ ...analytics!, courseSlug: "sql-certificate" })
assert(stolen.some((error) => error.includes("Northwind")), "Validation rejects attaching Northwind to another course")

const sheetAdapter: WorkspaceAdapter = {
  id: "spreadsheet-lab",
  label: "Spreadsheet lab",
  requiredCapabilities: ["runtime.javascript"],
  score(syllabus) {
    return syllabus.lessons.filter((lesson) => lesson.exercise === "spreadsheet").length * 5
  },
}
const sheetCourse: CourseSyllabus = {
  courseSlug: "sheet-course",
  title: "Sheets",
  outcomes: [],
  tools: [],
  lessons: [{ id: "l1", title: "Filters", type: "assignment", exercise: "spreadsheet" }],
}
const withAdapter = provisionCourse(sheetCourse, [...defaultWorkspaceAdapters(), sheetAdapter])
assert(withAdapter.adapterId === "spreadsheet-lab", "A new adapter is selected without changing the core")
assert(withAdapter.status === "pending_infrastructure", "The new adapter still waits on its capability")
const withoutAdapter = provisionCourse(sheetCourse)
assert(withoutAdapter.adapterId === null && withoutAdapter.status === "not_configured", "Without the adapter, a spreadsheet lesson is not forced into SQL")

assert(lessonPracticeLink("data-analytics", "l7")?.href.includes("lesson=l7"), "Published SQL routing still opens Northwind for lesson 7")
assert(lessonPracticeLink("data-analytics", "l4") === null, "Lesson routing still hides the SQL editor on spreadsheet lessons")
assert(lessonPracticeLink("product-management", "l6")?.href.includes("task=read_case"), "Harbor Desk routing is unchanged")
assert(CATALOGUE_SYLLABI.length >= 6, "Catalogue provisioning covers the current subjects")
assert(WORKSPACE_MANIFEST_VERSION === 1, "Manifest contract is version 1")

console.log("practice platform: ok")
