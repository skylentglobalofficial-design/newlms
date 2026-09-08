import puppeteer from "puppeteer-core"
import { loginViaForm } from "./qa-auth.js"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`
const PASSWORD = process.env.DEMO_USER_PASSWORD ?? "DemoSkylent2026!"

type RoleSpec = {
  role: string
  email: string
  homePath: string
  shellMarker: string
  foreignPaths: string[]
}

const ROLES: RoleSpec[] = [
  {
    role: "student",
    email: "learner@demo.skylent.dev",
    homePath: "/dashboard/student",
    shellMarker: "#student-overview",
    foreignPaths: ["/dashboard/faculty", "/dashboard/organisation", "/dashboard/recruiter", "/dashboard/admin"],
  },
  {
    role: "faculty",
    email: "mentor@demo.skylent.dev",
    homePath: "/dashboard/faculty",
    shellMarker: "#faculty-overview",
    foreignPaths: ["/dashboard/student", "/dashboard/organisation", "/dashboard/recruiter", "/dashboard/admin"],
  },
  {
    role: "organisation",
    email: "institution@demo.skylent.dev",
    homePath: "/dashboard/organisation",
    shellMarker: "#org-overview",
    foreignPaths: ["/dashboard/student", "/dashboard/faculty", "/dashboard/recruiter", "/dashboard/admin"],
  },
  {
    role: "recruiter",
    email: "recruiter@demo.skylent.dev",
    homePath: "/dashboard/recruiter",
    shellMarker: "#rec-review",
    foreignPaths: ["/dashboard/student", "/dashboard/faculty", "/dashboard/organisation", "/dashboard/admin"],
  },
  {
    role: "superadmin",
    email: "admin@demo.skylent.dev",
    homePath: "/dashboard/admin",
    shellMarker: "#admin-overview",
    foreignPaths: ["/dashboard/student", "/dashboard/faculty", "/dashboard/organisation", "/dashboard/recruiter"],
  },
]

async function login(page: import("puppeteer-core").Page, email: string, expectedPath: string) {
  await loginViaForm(page, { email, password: PASSWORD, expectedPath })
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: Array<Record<string, unknown>> = []

  for (const spec of ROLES) {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    try {
      await login(page, spec.email, spec.homePath)
      await page.waitForSelector(spec.shellMarker, { timeout: 20000 }).catch(() => null)
      await page.waitForSelector(".role-workspace-banner", { timeout: 20000 }).catch(() => null)

      const home = await page.evaluate((marker) => ({
        path: window.location.pathname,
        hasShell: Boolean(document.querySelector(marker)),
        hasBanner: Boolean(document.querySelector(".role-workspace-banner")),
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      }), spec.shellMarker)

      const isolation: Array<{ path: string; redirectedTo: string; blocked: boolean }> = []
      for (const foreign of spec.foreignPaths) {
        await page.goto(`${BASE}${foreign}`, { waitUntil: "domcontentloaded", timeout: 20000 })
        await page.waitForFunction(
          (homePath) => window.location.pathname === homePath,
          { timeout: 15000 },
          spec.homePath,
        ).catch(() => null)
        const redirectedTo = await page.evaluate(() => window.location.pathname)
        isolation.push({ path: foreign, redirectedTo, blocked: redirectedTo === spec.homePath })
      }

      results.push({
        role: spec.role,
        email: spec.email,
        home,
        isolation,
        passed: home.path === spec.homePath && home.hasShell && home.hasBanner && home.overflowPx <= 1 && isolation.every((i) => i.blocked),
      })
    } catch (error) {
      results.push({ role: spec.role, email: spec.email, passed: false, error: error instanceof Error ? error.message : String(error) })
    }

    await context.close()
  }

  await browser.close()

  const failures = results.filter((r) => !r.passed)
  console.log(JSON.stringify({
    passed: failures.length === 0,
    failureCount: failures.length,
    results,
  }, null, 2))

  if (failures.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
