import puppeteer from "puppeteer-core"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`
const PASSWORD = process.env.DEMO_USER_PASSWORD ?? "DemoSkylent2026!"

async function waitForPath(page: import("puppeteer-core").Page, path: string, timeout = 15000) {
  await page.waitForFunction(
    (expected) => window.location.pathname === expected,
    { timeout },
    path,
  )
}

async function loginAsLearner(page: import("puppeteer-core").Page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("#si-email", { timeout: 15000 })
  await page.type("#si-email", "learner@demo.skylent.dev", { delay: 10 })
  await page.type("#si-password", PASSWORD, { delay: 10 })
  await page.click('button[type="submit"]')
  await waitForPath(page, "/dashboard/student")
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: Array<Record<string, unknown>> = []

  async function check(name: string, fn: (page: import("puppeteer-core").Page) => Promise<Record<string, unknown>>) {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    try {
      const detail = await fn(page)
      results.push({ name, passed: detail.passed !== false, ...detail })
    } catch (error) {
      results.push({ name, passed: false, error: error instanceof Error ? error.message : String(error) })
    } finally {
      await context.close()
    }
  }

  await check("career-os-legacy-application-id", async (page) => {
    await loginAsLearner(page)
    await page.goto(`${BASE}/career-os/applications/demo-app-1`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await waitForPath(page, "/career-os/app/applications/demo-app-1")
    const path = await page.evaluate(() => window.location.pathname)
    return { passed: path === "/career-os/app/applications/demo-app-1", path }
  })

  await check("dashboard-index-redirects-to-login", async (page) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await waitForPath(page, "/login")
    const path = await page.evaluate(() => window.location.pathname)
    return { passed: path === "/login", path }
  })

  await check("universities-redirects-to-institutions", async (page) => {
    await page.goto(`${BASE}/universities`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await waitForPath(page, "/institutions")
    const path = await page.evaluate(() => window.location.pathname)
    return { passed: path === "/institutions", path }
  })

  await check("login-redirects-when-authenticated", async (page) => {
    await loginAsLearner(page)
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.waitForFunction(
      () => !window.location.pathname.includes("/login"),
      { timeout: 15000 },
    )
    const path = await page.evaluate(() => window.location.pathname)
    return { passed: path.includes("/dashboard/student"), path }
  })

  await check("wrong-role-dashboard-redirect", async (page) => {
    await loginAsLearner(page)
    await page.goto(`${BASE}/dashboard/faculty`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await waitForPath(page, "/dashboard/student")
    const path = await page.evaluate(() => window.location.pathname)
    return { passed: path === "/dashboard/student", path }
  })

  await check("mobile-nav-dashboard-link", async (page) => {
    await page.setViewport({ width: 375, height: 812 })
    await loginAsLearner(page)
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.click(".show-mobile")
    await page.waitForSelector('a[href="/dashboard/student"]', { timeout: 10000 })
    const hasDashboard = await page.evaluate(() =>
      Boolean(document.querySelector('a[href="/dashboard/student"]')),
    )
    return { passed: hasDashboard, hasDashboard }
  })

  await check("homepage-without-duplicate-coverage", async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 })
    const metrics = await page.evaluate(() => ({
      hasEcosystemMap: Boolean(document.querySelector(".ecosystem-map-hero")),
      hasDuplicateCoverage: document.body.textContent?.includes("What Skylent covers") ?? false,
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }))
    return {
      passed: metrics.hasEcosystemMap && !metrics.hasDuplicateCoverage && metrics.overflowPx <= 1,
      ...metrics,
    }
  })

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
