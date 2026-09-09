import puppeteer from "puppeteer-core"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`
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

type RouteResult = {
  route: string
  viewport: number
  overflowPx: number
  consoleErrors: string[]
  hasPublicCanvas: boolean
  hasHeading: boolean
  hasNav: boolean
  passed: boolean
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: RouteResult[] = []
  for (const viewport of VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      const page = await browser.newPage()
      const consoleErrors: string[] = []
      page.on("pageerror", (error) => consoleErrors.push(String(error)))
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text())
      })
      await page.setViewport({ width: viewport, height: 900 })
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 30000 })
        const metrics = await page.evaluate(() => ({
          overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
          hasPublicCanvas: Boolean(document.querySelector(".skylent-public-canvas")),
          hasHeading: Boolean(document.querySelector("h1, h2")),
          hasNav: Boolean(document.querySelector("nav")),
        }))
        results.push({
          route,
          viewport,
          ...metrics,
          consoleErrors: consoleErrors.slice(0, 5),
          passed: metrics.overflowPx <= 1 && metrics.hasPublicCanvas && metrics.hasHeading && metrics.hasNav,
        })
      } catch (error) {
        results.push({
          route,
          viewport,
          overflowPx: -1,
          consoleErrors: [...consoleErrors, String(error)].slice(0, 5),
          hasPublicCanvas: false,
          hasHeading: false,
          hasNav: false,
          passed: false,
        })
      }
      await page.close()
    }
  }

  await browser.close()
  const failures = results.filter((result) => !result.passed)
  console.log(JSON.stringify({
    passed: failures.length === 0,
    totalChecks: results.length,
    failureCount: failures.length,
    failures: failures.slice(0, 30),
  }, null, 2))
  if (failures.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
