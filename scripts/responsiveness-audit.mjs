/**
 * A–Z responsiveness audit.
 */
import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.env.APP_BASE || "http://127.0.0.1:8443"
const OUT = process.env.AUDIT_OUT || "/opt/cursor/artifacts/responsiveness-audit-after.json"

const PUBLIC = ["/", "/education", "/programs", "/skills", "/exams", "/junior", "/degrees", "/login"]
const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
]

async function installObservers(page) {
  await page.addInitScript(() => {
    window.__perf = { longTasks: [], loafs: [] }
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__perf.longTasks.push({ duration: Math.round(e.duration * 10) / 10, start: Math.round(e.startTime) })
        }
      }).observe({ type: "longtask", buffered: true })
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__perf.loafs.push({
            duration: Math.round(e.duration * 10) / 10,
            blocking: Math.round((e.blockingDuration || 0) * 10) / 10,
            start: Math.round(e.startTime),
          })
        }
      }).observe({ type: "long-animation-frame", buffered: true })
    } catch {}
  })
}

async function measureCold(context, path) {
  const page = await context.newPage()
  await installObservers(page)
  const t0 = Date.now()
  const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForTimeout(1000)
  const metrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType("navigation")[0]
    const resources = performance.getEntriesByType("resource")
    const js = resources.filter((r) => r.name.includes(".js") || r.initiatorType === "script")
    const api = resources.filter((r) => r.name.includes("/api/"))
    const apiUrls = api.map((r) => {
      try { return new URL(r.name).pathname } catch { return r.name }
    })
    const dupes = {}
    for (const u of apiUrls) dupes[u] = (dupes[u] || 0) + 1

    const blurNodes = [...document.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el)
      return (s.backdropFilter && s.backdropFilter !== "none") || (s.webkitBackdropFilter && s.webkitBackdropFilter !== "none")
    }).length

    window.__perf.longTasks = []
    window.__perf.loafs = []
    const before = performance.now()
    for (let i = 0; i < 8; i++) {
      window.scrollBy(0, 400)
      await new Promise((r) => requestAnimationFrame(r))
    }
    await new Promise((r) => setTimeout(r, 250))
    const loafs = (window.__perf.loafs || []).filter((t) => t.start >= before - 50)
    const longs = (window.__perf.longTasks || []).filter((t) => t.start >= before - 50)

    // verify scroll relief toggles
    document.documentElement.classList.add("is-scrolling")
    const blurWhileScroll = getComputedStyle(document.documentElement).getPropertyValue("--glass-01-blur").trim()
    document.documentElement.classList.remove("is-scrolling")
    const blurIdle = getComputedStyle(document.documentElement).getPropertyValue("--glass-01-blur").trim()

    return {
      path: location.pathname,
      finalUrl: location.href,
      statusOk: document.readyState,
      domNodes: document.querySelectorAll("*").length,
      blurNodes,
      jsTransferKb: Math.round(js.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      jsEncodedKb: Math.round(js.reduce((s, r) => s + (r.encodedBodySize || 0), 0) / 1024),
      jsCount: js.length,
      apiCount: api.length,
      apiDupes: Object.fromEntries(Object.entries(dupes).filter(([, n]) => n > 1)),
      apiUrls: [...new Set(apiUrls)],
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      maxLoafScroll: loafs.reduce((m, t) => Math.max(m, t.duration), 0),
      maxLoafBlocking: loafs.reduce((m, t) => Math.max(m, t.blocking || 0), 0),
      maxLongTaskScroll: longs.reduce((m, t) => Math.max(m, t.duration), 0),
      blurWhileScroll,
      blurIdle,
      indexChunk: [...js.map((r) => r.name)].find((n) => n.includes("/assets/index-")) || null,
    }
  })
  await page.close()
  return { ...metrics, httpStatus: res?.status() ?? null, wallMs: Date.now() - t0, cold: true }
}

async function measureWarmNav(context, from, to) {
  const page = await context.newPage()
  await installObservers(page)
  await page.goto(BASE + from, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(400)
  const t0 = Date.now()
  const clicked = await page.evaluate((p) => {
    const a = [...document.querySelectorAll("a")].find((el) => {
      try { return new URL(el.href).pathname === p } catch { return false }
    })
    if (!a) return false
    a.click()
    return true
  }, to)
  if (!clicked) await page.goto(BASE + to, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(800)
  const m = await page.evaluate(() => ({
    path: location.pathname,
    domNodes: document.querySelectorAll("*").length,
    blurNodes: [...document.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el)
      return (s.backdropFilter && s.backdropFilter !== "none") || (s.webkitBackdropFilter && s.webkitBackdropFilter !== "none")
    }).length,
  }))
  await page.close()
  return { ...m, wallMs: Date.now() - t0, clicked, cold: false, from }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const report = { base: BASE, at: new Date().toISOString(), viewports: {}, integrity: [] }

  for (const vp of VIEWPORTS) {
    report.viewports[vp.name] = { cold: [], warm: [] }
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    for (const route of PUBLIC) {
      try {
        report.viewports[vp.name].cold.push(await measureCold(context, route))
      } catch (e) {
        report.viewports[vp.name].cold.push({ path: route, error: String(e) })
      }
    }
    for (const [from, to] of [
      ["/", "/education"],
      ["/", "/programs"],
      ["/", "/skills"],
      ["/", "/exams"],
      ["/education", "/programs"],
    ]) {
      try {
        report.viewports[vp.name].warm.push(await measureWarmNav(context, from, to))
      } catch (e) {
        report.viewports[vp.name].warm.push({ from, to, error: String(e) })
      }
    }
    await context.close()
  }

  const page = await browser.newPage()
  for (const p of ["/jobs", "/career-os", "/programs/jee-crash", "/programs/cat-crash", "/programs/product-management", "/education"]) {
    await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null)
    report.integrity.push({ path: p, finalUrl: page.url() })
  }

  fs.mkdirSync("/opt/cursor/artifacts", { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log("Wrote", OUT)
  for (const m of report.viewports["1440"].cold) {
    if (m.error) console.log(m.path, "ERR", m.error)
    else console.log(`${m.path} nodes=${m.domNodes} blur=${m.blurNodes} jsKb=${m.jsEncodedKb} api=${m.apiCount} dcl=${m.dcl} loaf=${m.maxLoafScroll} long=${m.maxLongTaskScroll} scrollBlur=${m.blurWhileScroll} idleBlur=${m.blurIdle}`)
  }
  console.log("warm", report.viewports["1440"].warm.map((w) => `${w.from}->${w.path}:${w.wallMs}ms`).join(" | "))
  console.log("integrity", JSON.stringify(report.integrity))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
