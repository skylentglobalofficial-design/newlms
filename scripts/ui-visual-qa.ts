import puppeteer from "puppeteer-core"

const APP_BASE = process.env.APP_BASE ?? "http://localhost:8443"

const ROUTES = [
  "/",
  "/courses",
  "/courses/data-analytics",
  "/skills",
  "/labs",
  "/blog",
  "/blog/data-skills-2026",
  "/workshops",
  "/universities",
  "/career",
  "/career-os",
  "/programs",
  "/education",
  "/about",
  "/contact",
  "/os",
]

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "375", width: 375, height: 812 },
]

const WARM_WHITE = "#F8F6F2"

type CheckResult = {
  route: string
  viewport: string
  overflow: boolean
  overflowPx: number
  warmWhiteHits: number
  clippedControls: string[]
}

async function inspectPage(page: puppeteer.Page, route: string, viewport: string): Promise<CheckResult> {
  const result = await page.evaluate((warmWhite) => {
    const docOverflow = document.documentElement.scrollWidth > window.innerWidth + 2
    const overflowPx = document.documentElement.scrollWidth - window.innerWidth

    let warmWhiteHits = 0
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundColor
      if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return
      const hex = `#${Number(m[1]).toString(16).padStart(2, "0")}${Number(m[2]).toString(16).padStart(2, "0")}${Number(m[3]).toString(16).padStart(2, "0")}`
      if (hex.toUpperCase() === warmWhite.toUpperCase()) warmWhiteHits++
    })

    const clippedControls: string[] = []
    document.querySelectorAll<HTMLElement>(".scroll-control-strip-scroll, .contextual-nav-bar-scroll").forEach((strip) => {
      if (strip.scrollWidth <= strip.clientWidth + 2) return
      const parent = strip.closest(".scroll-control-strip") ?? strip.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      const buttons = Array.from(strip.querySelectorAll<HTMLElement>("button, a"))
      if (!buttons.length) return

      // Awkward clip: first control cut off at rest, or last control stuck partially visible at scroll end
      const first = buttons[0].getBoundingClientRect()
      if (strip.scrollLeft < 2 && first.left < parentRect.left - 1) {
        clippedControls.push(`start:${(buttons[0].textContent?.trim() || "first").slice(0, 30)}`)
      }

      strip.scrollLeft = strip.scrollWidth
      const last = buttons[buttons.length - 1].getBoundingClientRect()
      const visibleWidth = Math.min(last.right, parentRect.right) - Math.max(last.left, parentRect.left)
      if (visibleWidth < last.width * 0.6) {
        clippedControls.push(`end:${(buttons[buttons.length - 1].textContent?.trim() || "last").slice(0, 30)}`)
      }
      strip.scrollLeft = 0
    })

    return { docOverflow, overflowPx, warmWhiteHits, clippedControls }
  }, WARM_WHITE)

  return {
    route,
    viewport,
    overflow: result.docOverflow,
    overflowPx: result.overflowPx,
    warmWhiteHits: result.warmWhiteHits,
    clippedControls: result.clippedControls,
  }
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const results: CheckResult[] = []

  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      const page = await browser.newPage()
      await page.setViewport({ width: vp.width, height: vp.height })
      try {
        await page.goto(`${APP_BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 })
        await new Promise((r) => setTimeout(r, 2000))
        results.push(await inspectPage(page, route, vp.name))
      } catch (err) {
        results.push({
          route,
          viewport: vp.name,
          overflow: true,
          overflowPx: -1,
          warmWhiteHits: -1,
          clippedControls: [`ERROR: ${String(err)}`],
        })
      }
      await page.close()
    }
  }

  await browser.close()

  const total = results.length
  const overflows = results.filter((r) => r.overflow)
  const warmWhite = results.filter((r) => r.warmWhiteHits > 0)
  const clipped = results.filter((r) => r.clippedControls.length > 0)

  const summary = {
    totalChecks: total,
    routes: ROUTES.length,
    viewports: VIEWPORTS.length,
    overflowCount: overflows.length,
    warmWhiteCount: warmWhite.length,
    clippedCount: clipped.length,
    overflows: overflows.map((r) => `${r.viewport}:${r.route}(+${r.overflowPx}px)`),
    warmWhite: warmWhite.map((r) => `${r.viewport}:${r.route}(${r.warmWhiteHits})`),
    clipped: clipped.map((r) => `${r.viewport}:${r.route} [${r.clippedControls.join(", ")}]`),
    byViewport: VIEWPORTS.map((vp) => ({
      viewport: vp.name,
      checks: results.filter((r) => r.viewport === vp.name).length,
      overflow: results.filter((r) => r.viewport === vp.name && r.overflow).length,
      warmWhite: results.filter((r) => r.viewport === vp.name && r.warmWhiteHits > 0).length,
      clipped: results.filter((r) => r.viewport === vp.name && r.clippedControls.length > 0).length,
    })),
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
