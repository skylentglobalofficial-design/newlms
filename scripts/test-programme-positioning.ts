/**
 * Programme page practice links and public availability wording.
 * Run: npx tsx scripts/test-programme-positioning.ts
 */
import { readFileSync } from "node:fs"
import { programmeTruth } from "../src/components/programme/programme-truth"
import { parseProgramAccess } from "../src/lib/lms-api"
import {
  AVAILABILITY_UNKNOWN,
  CATALOGUE_CHECKING,
  homeCataloguePhase,
  homepageProgrammeLead,
  programmesIndexIntro,
  publicCatalogueState,
  publicCatalogueStatus,
} from "../src/lib/catalogue-availability"
import { LIVE_PROGRAMME_SLUGS, catalogueProgrammeIsOpen } from "../src/lib/programme-catalogue"
import {
  DATA_ANALYTICS_SQL_LAB,
  HARBOR_DESK_WORKSPACE,
  practiceWorkspaceHref,
  programmeAccessAllowsWorkspace,
  programmeEnrollmentAllowsWorkspace,
} from "../src/lib/practice-workspace-access"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const template = readFileSync(new URL("../src/components/programme/ProfessionalProgrammeTemplate.tsx", import.meta.url), "utf8")
const home = readFileSync(new URL("../src/pages/home/Repolish.tsx", import.meta.url), "utf8")
const homePage = readFileSync(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8")
const programmes = readFileSync(new URL("../src/pages/ProgramsPage.tsx", import.meta.url), "utf8")
const accessClient = readFileSync(new URL("../src/lib/lms-api.ts", import.meta.url), "utf8")
const enrolment = readFileSync(new URL("../server/src/lib/lms.ts", import.meta.url), "utf8")
const labs = readFileSync(new URL("../server/src/lib/skylent-labs/service.ts", import.meta.url), "utf8")

assert(practiceWorkspaceHref("northwind") === "/os/labs/data-analytics/northwind", "Data Analytics practice must open the SQL lab")
assert(practiceWorkspaceHref("northwind") === DATA_ANALYTICS_SQL_LAB, "SQL lab href must stay on the lab path helper")
assert(!practiceWorkspaceHref("northwind").includes("l6"), "SQL lab link must not target lesson l6")
assert(!practiceWorkspaceHref("northwind").includes("lesson="), "SQL lab link must not attach a lesson")
assert(practiceWorkspaceHref("harbor-desk") === "/os/projects/product-management/harbor-desk-case", "Product Management practice must open the Harbor Desk workspace")
assert(practiceWorkspaceHref("harbor-desk") === HARBOR_DESK_WORKSPACE, "Harbor Desk href must stay on the project path helper")
assert(!practiceWorkspaceHref("harbor-desk").includes("l6"), "Harbor Desk link must not target lesson l6")
assert(!/lessons\/l6|practiceLessonPath|includes\("northwind"\)|includes\("harbor desk"\)/.test(template), "Programme page must not choose a practice lesson by title")
assert(/practiceWorkspaceHref\(/.test(template), "Programme page must use the workspace href")
assert(/programmeAccessAllowsWorkspace\(/.test(template) && /programmeEnrollmentAllowsWorkspace\(/.test(template), "Programme page must require this programme's enrolment")
assert(!/linkedCourses/.test(template), "Programme page must not authorize a workspace from another programme's linked courses")
assert(/Open the SQL lab/.test(template) && /Open the case workspace/.test(template), "Workspace links must name the SQL lab and the case workspace")
assert(/A new learner starts at Not started/.test(template), "A new learner still starts at Not started")
assert(
  /workspaceAccess === "allowed" \? \(\s*<Link className="pp-practice__link" to=\{practiceHref\}>/.test(template),
  "The workspace link is inside the allowed branch",
)

const dataScienceOnly = [{
  status: "active",
  programSlug: "data-science-ai",
  linkedCourseSlugs: ["data-analytics", "python-programming"],
}]
assert(!programmeEnrollmentAllowsWorkspace(dataScienceOnly, "data-analytics-pro"), "Data Science enrolment must not open the Data Analytics workspace")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", {
  enrolled: false,
  canAccess: false,
  programSlug: "data-analytics-pro",
}), "A programme access denial must hide the workspace link")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", {
  enrolled: true,
  canAccess: true,
  programSlug: "data-science-ai",
}), "Access for a different programme must not open this workspace")
assert(programmeEnrollmentAllowsWorkspace([{
  status: "active",
  programSlug: "data-analytics-pro",
  linkedCourseSlugs: ["data-analytics"],
}], "data-analytics-pro"), "An active Data Analytics programme enrolment may open its workspace")
assert(programmeAccessAllowsWorkspace("product-management", {
  enrolled: true,
  canAccess: true,
  programSlug: "product-management",
}), "Product Management access may open Harbor Desk")
assert(!programmeEnrollmentAllowsWorkspace([{
  status: "withdrawn",
  programSlug: "product-management",
}], "product-management"), "A closed enrolment must not open the workspace")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", null), "Missing access must not open a workspace")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", {
  enrolled: true,
  canAccess: false,
  programSlug: "data-analytics-pro",
}), "enrolled without canAccess must not open the workspace")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", {
  enrolled: false,
  canAccess: true,
  programSlug: "data-analytics-pro",
}), "canAccess without enrolled must not open the workspace")
assert(programmeEnrollmentAllowsWorkspace([{
  status: "completed",
  programSlug: "data-analytics-pro",
}], "data-analytics-pro"), "A completed programme enrolment may open its workspace")

function throwsIncomplete(body: unknown): boolean {
  try {
    parseProgramAccess(body)
    return false
  } catch (error) {
    return error instanceof Error && error.message === "Programme access response was incomplete."
  }
}
assert(throwsIncomplete({}), "A 200 body with no data object is incomplete")
assert(throwsIncomplete({ data: null }), "A 200 body with null data is incomplete")
assert(throwsIncomplete({ data: { enrolled: false } }), "A 200 body missing the boolean flags is incomplete")
assert(
  JSON.stringify(parseProgramAccess({
    data: { authenticated: false, enrolled: false, canAccess: false, reason: "login_required" },
  })) === JSON.stringify({ authenticated: false, enrolled: false, canAccess: false, reason: "login_required" }),
  "A signed-out access body remains valid without a programme slug",
)
assert(
  parseProgramAccess({
    data: {
      authenticated: true,
      enrolled: false,
      canAccess: false,
      reason: "not_enrolled",
      programSlug: "data-analytics-pro",
      programName: "Data Analytics",
    },
  }).programSlug === "data-analytics-pro",
  "A real not-enrolled access body is accepted",
)
const contradictory = parseProgramAccess({
  data: { authenticated: true, enrolled: true, canAccess: false, programSlug: "data-analytics-pro" },
})
assert(contradictory.enrolled === true && contradictory.canAccess === false, "Contradictory booleans are a real payload, not a missing body")
assert(!programmeAccessAllowsWorkspace("data-analytics-pro", contradictory), "That payload still does not open the workspace")
assert(/return parseProgramAccess\(result\)/.test(accessClient), "fetchProgramAccess validates the body before returning it")

assert(publicCatalogueState(true, true) === "open", "Confirmed open stays open")
assert(publicCatalogueStatus("open") === "Open for enrolment", "Confirmed open is labelled open")
assert(publicCatalogueState(true, false) === "closed", "Confirmed closed stays closed")
assert(publicCatalogueStatus("closed") === "Not open yet", "Confirmed closed is labelled not open")
assert(publicCatalogueState(false, true) === "unknown" && publicCatalogueState(false, false) === "unknown", "An unconfirmed catalogue is unknown for open and closed rows")
assert(publicCatalogueStatus("unknown") === AVAILABILITY_UNKNOWN, "Unknown availability uses the neutral sentence")
assert(!/not open|enrolment is unavailable|open for enrolment/i.test(publicCatalogueStatus("unknown")), "Unknown availability must not say the programme is open or closed")

const unknownIntro = programmesIndexIntro(false, ["Data Analytics", "Product Management"])
assert(unknownIntro.startsWith(AVAILABILITY_UNKNOWN), "The programmes introduction follows the catalogue")
assert(!/open to start/.test(unknownIntro), "An unconfirmed catalogue must not name programmes as open")
assert(/Data Analytics and Product Management are open to start/.test(programmesIndexIntro(true, ["Data Analytics", "Product Management"])), "Confirmed open programmes are named")
assert(/No programme is open for enrolment/.test(programmesIndexIntro(true, [])), "A confirmed catalogue with nothing open says so")

assert(/title="Not open yet"[\s\S]{0,180}rows=\{confirmed \? ordered\.filter\(\(row\) => !row\.open\) : \[\]\}/.test(home), "Homepage closed rows appear only after the catalogue is confirmed")
assert(/title="Programmes"[\s\S]{0,120}rows=\{confirmed \? \[\] : ordered\}/.test(home), "Homepage unconfirmed rows stay out of the closed group")
assert(home.includes("AVAILABILITY_UNKNOWN"), "Homepage shows the unconfirmed sentence")
assert(/dataAnalyticsOpen && productManagementOpen/.test(home) && /Two programmes are open to start/.test(home), "The homepage names both programmes only when the catalogue confirms both are open")
assert(homeCataloguePhase(true, false) === "loading", "A catalogue request still in flight is loading")
assert(homeCataloguePhase(true, true) === "loading", "Loading stays ahead of an offline flag")
assert(homeCataloguePhase(false, true) === "unknown", "A finished catalogue failure is unknown")
assert(homeCataloguePhase(false, false) === "confirmed", "A finished catalogue success is confirmed")
assert(homepageProgrammeLead(true, true) === CATALOGUE_CHECKING, "Loading copy stays neutral even if confirmed was passed as true")
assert(!/Open programmes can be started|Not open yet|Open for enrolment/.test(homepageProgrammeLead(true, true)), "Loading copy does not claim the open/closed split")
assert(homepageProgrammeLead(true, false) === CATALOGUE_CHECKING, "Loading without confirmation stays on the checking sentence")
assert(homepageProgrammeLead(false, false) === AVAILABILITY_UNKNOWN, "A failed catalogue uses the unknown sentence")
assert(/Open programmes can be started/.test(homepageProgrammeLead(false, true)), "Confirmed catalogue copy may describe the open/closed split")
assert(/homepageProgrammeLead\(loading, confirmed\)/.test(home), "The programmes introduction uses the loading-aware lead")
assert(/homeCataloguePhase\(catalog\.loading, catalog\.offline\)/.test(homePage), "The homepage derives confirmation from loading and offline together")
assert(!/confirmed=\{!catalog\.offline\}/.test(homePage), "The homepage must not treat a loading catalogue as confirmed")
assert(/Availability could not be confirmed/.test(programmes) && programmes.includes("programmesIndexIntro"), "Programmes index introduction depends on catalogue status")
assert(/confirmed \? "Open for enrolment" : STATUS_NOT_CONFIRMED/.test(programmes), "An unconfirmed catalogue must not be labelled open for enrolment")

assert(
  JSON.stringify(LIVE_PROGRAMME_SLUGS) === JSON.stringify(["product-management", "data-analytics-pro"]),
  "The public allow-list is still the two live programmes",
)
assert(!catalogueProgrammeIsOpen({
  slug: "data-science-ai",
  enrollmentStatus: "open",
  linkedCourseSlugs: ["data-analytics", "python-programming"],
}), "Data Science stays closed even when the API links a course")
assert(catalogueProgrammeIsOpen({
  slug: "data-analytics-pro",
  enrollmentStatus: "open",
  linkedCourseSlugs: ["data-analytics"],
}), "Data Analytics stays open when the API is open and linked")
assert(!catalogueProgrammeIsOpen({
  slug: "data-analytics-pro",
  enrollmentStatus: "coming_soon",
  linkedCourseSlugs: ["data-analytics"],
}), "A coming-soon programme is not presented as open")
assert(!catalogueProgrammeIsOpen({
  slug: "product-management",
  enrollmentStatus: "open",
  linkedCourseSlugs: [],
}), "An open programme with no linked course is not presented as open")
assert(programmeTruth({
  slug: "data-science-ai",
  enrollmentStatus: "open",
  linkedCourseSlugs: ["data-analytics"],
}).state !== "live", "Data Science enrolment truth stays short of a live taught path")
assert(/programId: program\.id/.test(enrolment), "Programme workspace access still requires enrolment in that programme")
assert(/resolveCourseEnrollment\(userId, course\.id\)/.test(labs), "The SQL lab still uses the existing server enrolment check")

console.log("programme-positioning ok")
