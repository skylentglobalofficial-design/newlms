import puppeteer from "puppeteer-core"
import { loginViaForm } from "./qa-auth.js"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`
const PASSWORD = process.env.DEMO_USER_PASSWORD
if (!PASSWORD) {
  throw new Error("DEMO_USER_PASSWORD must be set to run authenticated QA; no demo password is stored in source.")
}

const PUBLIC_ROUTES = [
  "/",
  "/education",
  "/skills",
  "/career-os",
  "/institutions",
  "/programs",
  "/programs/data-science-ai",
  "/courses",
  "/courses/data-analytics",
  "/workshops",
  "/workshops/prompt-engineering",
  "/stories",
  "/about",
  "/blog",
  "/blog/data-skills-2026",
  "/contact",
  "/login",
  "/signup",
] as const

const VIEWPORTS = [1440, 1100, 1024, 768, 375] as const

type Result = {
  route: string
  viewport: number
  overflowPx: number
  consoleErrors: string[]
  checks: {
    skipLink: boolean
    publicCanvas: boolean
    compactFrame: boolean
    hasHeading: boolean
    hasNav: boolean
  }
  passed: boolean
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: Result[] = []

  for (const width of VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      const page = await browser.newPage()
      const consoleErrors: string[] = []
      page.on("pageerror", (error) => consoleErrors.push(String(error)))
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text())
      })

      await page.setViewport({ width, height: 900 })
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 30000 })
        const checks = await page.evaluate(() => {
          const root = document.querySelector(".skylent-public-canvas")
          const frame = document.querySelector(".skylent-public-canvas main, .skylent-content-standard, .marketing-hero-inner") as HTMLElement | null
          return {
            overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
            skipLink: Boolean(document.querySelector(".skylent-skip-link")),
            publicCanvas: Boolean(root),
            compactFrame: Boolean(frame && frame.getBoundingClientRect().width <= Math.max(window.innerWidth - 24, 1)),
            hasHeading: Boolean(document.querySelector("h1, h2")),
            hasNav: Boolean(document.querySelector("nav")),
          }
        })
        results.push({
          route,
          viewport: width,
          overflowPx: checks.overflowPx,
          consoleErrors: consoleErrors.slice(0, 5),
          checks: {
            skipLink: checks.skipLink,
            publicCanvas: checks.publicCanvas,
            compactFrame: checks.compactFrame,
            hasHeading: checks.hasHeading,
            hasNav: checks.hasNav,
          },
          passed: checks.overflowPx <= 1 && checks.publicCanvas && checks.compactFrame && checks.hasHeading && checks.hasNav,
        })
      } catch (error) {
        results.push({
          route,
          viewport: width,
          overflowPx: -1,
          consoleErrors: [...consoleErrors, String(error)].slice(0, 5),
          checks: { skipLink: false, publicCanvas: false, compactFrame: false, hasHeading: false, hasNav: false },
          passed: false,
        })
      }
      await page.close()
    }
  }

  const context = await browser.createBrowserContext()
  const learnerPage = await context.newPage()
  await learnerPage.setViewport({ width: 1440, height: 900 })
  let roleIsolationPassed = false
  let roleIsolationRedirectedTo = ""
  try {
    await loginViaForm(learnerPage, {
      email: "learner@demo.skylent.dev",
      password: PASSWORD,
      expectedPath: "/dashboard/student",
    })
    await learnerPage.goto(`${BASE}/dashboard/faculty`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await learnerPage.waitForFunction(() => window.location.pathname === "/dashboard/student", { timeout: 15000 })
    roleIsolationRedirectedTo = await learnerPage.evaluate(() => window.location.pathname)
    roleIsolationPassed = roleIsolationRedirectedTo === "/dashboard/student"
  } catch {
    roleIsolationPassed = false
  }
  await context.close()
  await browser.close()

  const failures = results.filter((result) => !result.passed)
  const summary = {
    passed: failures.length === 0 && roleIsolationPassed,
    publicChecks: results.length,
    publicFailures: failures.length,
    roleIsolationPassed,
    roleIsolationRedirectedTo,
    failures: failures.slice(0, 30),
  }
  console.log(JSON.stringify(summary, null, 2))
  if (!summary.passed) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}
