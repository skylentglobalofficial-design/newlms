import puppeteer from "puppeteer-core"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`

const PUBLIC_ROUTES = ["/", "/education", "/skills", "/career-os", "/institutions", "/login", "/signup"] as const
const VIEWPORTS = [1440, 1100, 1024, 768, 375] as const

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: Array<Record<string, unknown>> = []
  const consoleErrors: string[] = []

  for (const route of PUBLIC_ROUTES) {
    for (const width of VIEWPORTS) {
      const page = await browser.newPage()
      page.on("pageerror", (err) => consoleErrors.push(`${route}@${width}: ${String(err)}`))
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(`${route}@${width}: ${msg.text()}`)
      })

      await page.setViewport({ width, height: 900 })
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 30000 })

      const metrics = await page.evaluate(() => ({
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        hasMarketingHero: Boolean(document.querySelector(".skylent-marketing-hero")),
        hasSkillsExplorer: Boolean(document.querySelector(".skills-explorer")),
        hasPathwayExplorer: Boolean(document.querySelector(".education-pathway-explorer, .pathway-explorer")),
        hasCareerWorkflow: Boolean(document.querySelector(".career-workflow-hero")),
        hasEcosystemMap: Boolean(document.querySelector(".ecosystem-map-hero")),
        hasInstitutionExplorer: Boolean(document.querySelector("#institution-types")),
        hasLoginForm: Boolean(document.querySelector("#si-email, #su-name")),
        skipLink: Boolean(document.querySelector(".skylent-skip-link")),
      }))

      if (route === "/skills" && width > 1024) {
        const tab = await page.$('[data-domain-id="data-analytics"]')
        if (tab) {
          await tab.click()
          await sleep(150)
        }
      }

      if (route === "/skills" && width <= 1024) {
        await page.select("#skills-domain-select", "ui-ux-design")
        await sleep(150)
      }

      const emptyState = route === "/skills"
        ? await page.evaluate(() => Boolean(document.querySelector(".skills-explorer-empty-title")))
        : false

      results.push({
        route,
        viewport: width,
        overflow: metrics.overflowPx > 1,
        overflowPx: metrics.overflowPx,
        ...metrics,
        skillsEmptyState: emptyState,
      })

      await page.close()
    }
  }

  await browser.close()

  const overflowFailures = results.filter((r) => r.overflow)
  console.log(JSON.stringify({
    passed: overflowFailures.length === 0,
    overflowFailures: overflowFailures.length,
    consoleErrors: consoleErrors.slice(0, 20),
    results,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
