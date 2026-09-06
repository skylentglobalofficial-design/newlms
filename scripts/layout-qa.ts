import puppeteer from "puppeteer-core"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"

const APP_BASE = process.env.APP_BASE ?? "http://localhost:8443"
const CHROME = process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome"
const OUT = join(process.cwd(), "qa-screenshots-layout")

const ROUTES = [
  "/",
  "/programs",
  "/programs/data-science-ai",
  "/courses",
  "/courses/data-analytics",
  "/career-os",
  "/learn/data-analytics",
]

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "375", width: 375, height: 812 },
]

type Result = {
  route: string
  viewport: string
  overflow: boolean
  overflowPx: number
  contentWidth: number | null
  viewportWidth: number
  breathingRoomPct: number | null
  issues: string[]
  screenshot: string
}

async function inspect(page: puppeteer.Page, route: string, vp: typeof VIEWPORTS[0]): Promise<Result> {
  const issues: string[] = []
  await page.goto(`${APP_BASE}${route}`, { waitUntil: "networkidle2", timeout: 30000 })
  await new Promise(r => setTimeout(r, 500))

  const metrics = await page.evaluate(() => {
    const docOverflow = document.documentElement.scrollWidth > window.innerWidth + 2
    const overflowPx = document.documentElement.scrollWidth - window.innerWidth
    const hero = document.querySelector(".marketing-hero-inner, .skylent-content-standard")
    const heroRect = hero?.getBoundingClientRect()
    const contentWidth = heroRect ? heroRect.width : null
    return { docOverflow, overflowPx, contentWidth, viewportWidth: window.innerWidth }
  })

  if (metrics.docOverflow) issues.push(`horizontal overflow ${metrics.overflowPx}px`)
  const breathingRoomPct = metrics.contentWidth
    ? Math.round(((metrics.viewportWidth - metrics.contentWidth) / metrics.viewportWidth) * 100)
    : null
  if (vp.name === "1440" && breathingRoomPct !== null && breathingRoomPct < 8) {
    issues.push(`low breathing room (${breathingRoomPct}%)`)
  }

  if (route === "/programs/data-science-ai") {
    const heroPricing = await page.$(".marketing-hero-footer")
    if (heroPricing) issues.push("pricing panel still in hero footer")
  }

  if (route === "/") {
    const panelCount = await page.$$eval(".marketing-hero-visual .skylent-label", els => els.length)
    if (panelCount > 4) issues.push(`hero may have too many panels (${panelCount} labels)`)
  }

  if (route.startsWith("/courses/") && route !== "/courses") {
    const hasSidebar = await page.$(".edu-grid")
    if (hasSidebar) issues.push("course detail still uses two-column edu-grid")
  }

  const shotName = `${route.replace(/\//g, "_").replace(/^_/, "") || "home"}-${vp.name}.png`
  const shotPath = join(OUT, shotName)
  await page.screenshot({ path: shotPath, fullPage: false })

  return {
    route,
    viewport: vp.name,
    overflow: metrics.docOverflow,
    overflowPx: metrics.overflowPx,
    contentWidth: metrics.contentWidth,
    viewportWidth: metrics.viewportWidth,
    breathingRoomPct,
    issues,
    screenshot: shotPath,
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  const results: Result[] = []

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage()
    await page.setViewport({ width: vp.width, height: vp.height })
    for (const route of ROUTES) {
      try {
        results.push(await inspect(page, route, vp))
      } catch (err) {
        results.push({
          route,
          viewport: vp.name,
          overflow: true,
          overflowPx: -1,
          contentWidth: null,
          viewportWidth: vp.width,
          breathingRoomPct: null,
          issues: [`error: ${String(err)}`],
          screenshot: "",
        })
      }
    }
    await page.close()
  }

  await browser.close()
  const summary = {
    passed: results.filter(r => r.issues.length === 0 && !r.overflow).length,
    total: results.length,
    results,
  }
  writeFileSync(join(OUT, "results.json"), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
