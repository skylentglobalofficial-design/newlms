import fs from "node:fs"
import path from "node:path"
import puppeteer from "puppeteer-core"

const APP_BASE = process.env.APP_BASE ?? "http://127.0.0.1:8443"
const OUT_DIR = process.env.PERF_QA_DIR ?? "perf-qa-screenshots"

const KEY_ROUTES = [
  "/",
  "/programs",
  "/courses",
  "/courses/data-analytics",
  "/education",
  "/login",
  "/career-os",
  "/dashboard/student",
]

const VIEWPORTS = [
  { name: "375x812", width: 375, height: 812 },
  { name: "390x844", width: 390, height: 844 },
  { name: "414x896", width: 414, height: 896 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1536x864", width: 1536, height: 864 },
  { name: "1920x1080", width: 1920, height: 1080 },
]

type RouteResult = {
  route: string
  ok: boolean
  status: number | null
  title: string
  loadMs: number
  hasContent: boolean
  error?: string
}

type ViewportResult = {
  viewport: string
  route: string
  overflow: boolean
  overflowPx: number
  screenshot: string
}

async function checkRoute(page: puppeteer.Page, route: string): Promise<RouteResult> {
  const start = Date.now()
  try {
    const response = await page.goto(`${APP_BASE}${route}`, { waitUntil: "networkidle2", timeout: 30000 })
    await page.waitForFunction(
      () => document.body.innerText.trim().length > 20,
      { timeout: 10000 },
    ).catch(() => null)
    const title = await page.title()
    const hasContent = await page.evaluate(() => document.body.innerText.trim().length > 20)
    return {
      route,
      ok: (response?.ok() ?? false) && hasContent,
      status: response?.status() ?? null,
      title,
      loadMs: Date.now() - start,
      hasContent,
    }
  } catch (error) {
    return {
      route,
      ok: false,
      status: null,
      title: "",
      loadMs: Date.now() - start,
      hasContent: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function checkViewport(page: puppeteer.Page, route: string, vp: typeof VIEWPORTS[0]): Promise<ViewportResult> {
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 })
  await page.goto(`${APP_BASE}${route}`, { waitUntil: "networkidle2", timeout: 30000 })
  await page.waitForFunction(() => document.body.innerText.trim().length > 20, { timeout: 10000 }).catch(() => null)

  const { overflow, overflowPx } = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
  }))

  const screenshot = path.join(OUT_DIR, `resp-${vp.name}-${route.replace(/\//g, "_") || "home"}.webp`)
  await page.screenshot({ path: screenshot, type: "webp", fullPage: false })

  return { viewport: vp.name, route, overflow, overflowPx, screenshot }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" })

  const routeResults: RouteResult[] = []
  for (const route of KEY_ROUTES) {
    routeResults.push(await checkRoute(page, route))
  }

  const viewportResults: ViewportResult[] = []
  for (const vp of VIEWPORTS) {
    viewportResults.push(await checkViewport(page, "/", vp))
  }

  await browser.close()

  const report = {
    timestamp: new Date().toISOString(),
    appBase: APP_BASE,
    routes: routeResults,
    responsive: viewportResults,
    summary: {
      routesPassed: routeResults.filter(r => r.ok).length,
      routesTotal: routeResults.length,
      responsiveOverflows: viewportResults.filter(v => v.overflow).length,
      responsiveTotal: viewportResults.length,
    },
  }

  fs.writeFileSync("perf-qa-results.json", JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.summary, null, 2))
  console.log(`Full report: perf-qa-results.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
