import { readFileSync } from "node:fs"

const dashboard = readFileSync(
  new URL("../src/pages/DashboardStudentPage.tsx", import.meta.url),
  "utf8",
)
const navSource = readFileSync(
  new URL("../src/components/learner/learner-nav.tsx", import.meta.url),
  "utf8",
)
const careerShell = readFileSync(
  new URL("../src/components/career/CareerOSShell.tsx", import.meta.url),
  "utf8",
)

const navBlock = navSource.match(
  /export const LEARNER_NAV: AuthNavItem\[\] = \[(.*?)\n\]/s,
)
if (!navBlock) throw new Error("Learner navigation block not found")

const labels = [...navBlock[1].matchAll(/label: "([^"]+)"/g)].map(
  (match) => match[1],
)
const expected = [
  "Dashboard",
  "My Courses",
  "Projects",
  "Explore Courses",
  "Career OS",
]

if (JSON.stringify(labels) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected learner nav labels: ${labels.join(" | ")}`)
}

if (
  !dashboard.includes("LEARNER_NAV") ||
  !careerShell.includes("LEARNER_NAV")
) {
  throw new Error("Dashboard and Career OS must share LEARNER_NAV")
}

if (
  careerShell.includes('workspace="career"') ||
  careerShell.includes("workspace='career'")
) {
  throw new Error("Career OS must stay inside the learner shell")
}

if (!dashboard.includes('to="/courses"')) {
  throw new Error("Empty-state call to action should point to /courses")
}

const publicNav = readFileSync(new URL("../src/components/shared.tsx", import.meta.url), "utf8")
const pathCta = publicNav.slice(publicNav.indexOf("const pathCta"), publicNav.indexOf("const pathCta") + 500)
if (!pathCta.includes("label: 'Learning workspace'")) {
  throw new Error("The header action should name the learning workspace")
}
if (pathCta.includes("returnTo")) {
  throw new Error("The header sign-in action must not force the student dashboard")
}

console.log("dashboard-navigation ok")
