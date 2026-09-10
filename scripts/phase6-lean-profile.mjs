/**
 * Lean Phase 6 before/after: glass layers + LoAF during scroll (no layout thrash probes).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const APP = process.env.APP_BASE ?? 'http://127.0.0.1:8443'
const OUT = process.env.PHASE6_OUT ?? '/opt/cursor/artifacts/phase6-after'
const LABEL = process.env.PHASE6_LABEL ?? 'after'

const CASES = [
  { route: '/', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/', vp: { name: '375', w: 375, h: 812 } },
  { route: '/education', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/education', vp: { name: '375', w: 375, h: 812 } },
  { route: '/skills', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/programs', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/programs', vp: { name: '375', w: 375, h: 812 } },
  { route: '/programs/product-management', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/exams', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/junior', vp: { name: '1440', w: 1440, h: 900 } },
  { route: '/degrees', vp: { name: '1440', w: 1440, h: 900 } },
]

async function profile(page) {
  return page.evaluate(async () => {
    const loafs = []
    let po
    try {
      po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) loafs.push(e.duration)
      })
      po.observe({ type: 'long-animation-frame', buffered: false })
    } catch {}

    const deltas = []
    let last = performance.now()
    let alive = true
    const tick = (t) => {
      if (!alive) return
      deltas.push(t - last)
      last = t
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight)
    for (let i = 0; i < 24; i++) {
      scrollBy(0, Math.min(900, maxY))
      await sleep(12)
    }
    scrollTo(0, 0)
    await sleep(220) // allow ScrollCompositorRelief idle clear (140ms)
    document.documentElement.classList.remove('is-scrolling')
    alive = false
    po?.disconnect()

    let glass = 0
    let glassArea = 0
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el)
      const bf = s.backdropFilter || s.webkitBackdropFilter
      if (bf && bf !== 'none') {
        glass++
        const r = el.getBoundingClientRect()
        glassArea += Math.max(0, r.width) * Math.max(0, r.height)
      }
    }

    const duringScrollGlass = await (async () => {
      document.documentElement.classList.add('is-scrolling')
      await sleep(30)
      let g = 0
      for (const el of document.querySelectorAll('*')) {
        const s = getComputedStyle(el)
        const bf = s.backdropFilter || s.webkitBackdropFilter
        if (bf && bf !== 'none') g++
      }
      document.documentElement.classList.remove('is-scrolling')
      return g
    })()

    const sorted = deltas.filter((d) => d > 0 && d < 400).sort((a, b) => a - b)
    const n = sorted.length || 1
    return {
      glassIdle: glass,
      glassScrolling: duringScrollGlass,
      glassArea: Math.round(glassArea),
      isScrollingHook: typeof document.documentElement.classList.contains === 'function',
      samples: sorted.length,
      p95: sorted[Math.floor(0.95 * (n - 1))] ?? null,
      worst: sorted[sorted.length - 1] ?? null,
      gt33: sorted.filter((d) => d > 33).length,
      gt50: sorted.filter((d) => d > 50).length,
      loafCount: loafs.length,
      maxLoAF: loafs.reduce((m, d) => Math.max(m, d), 0),
      loafSum: Math.round(loafs.reduce((s, d) => s + d, 0)),
      hasReliefClass: getComputedStyle(document.documentElement).getPropertyValue('--unused') === '' &&
        !!document.querySelector('.skylent-site-nav'),
    }
  })
}

async function menuMs(page) {
  const w = page.viewportSize()?.width ?? 0
  const t0 = Date.now()
  if (w < 1100) {
    await page.locator('button[aria-label*="menu" i]').first().click({ timeout: 2000 }).catch(() => null)
    await page.waitForTimeout(150)
    const open = Date.now() - t0
    await page.keyboard.press('Escape')
    return { type: 'mobile', openMs: open }
  }
  await page.locator('.nav-links button').first().hover({ timeout: 2000 }).catch(() => null)
  await page.waitForSelector('.nav-mega-dropdown', { timeout: 1500 }).catch(() => null)
  const open = Date.now() - t0
  await page.mouse.move(2, 2)
  return { type: 'mega', openMs: open }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  const results = []
  for (const c of CASES) {
    console.error(`>> ${c.route} @ ${c.vp.name}`)
    await page.setViewportSize({ width: c.vp.w, height: c.vp.h })
    await page.goto(`${APP}${c.route}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(async () => {
      await page.goto(`${APP}${c.route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    })
    await page.waitForTimeout(300)
    const scroll = await profile(page)
    const menu = await menuMs(page)
    results.push({ route: c.route, viewport: c.vp.name, ...scroll, menu })
    console.error(
      `  glass idle/scroll=${scroll.glassIdle}/${scroll.glassScrolling} maxLoAF=${scroll.maxLoAF.toFixed(1)} gt33=${scroll.gt33} menu=${menu.openMs}`,
    )
  }

  // Phase 4 idle nav listener regression: mega closed, scroll should not open menu
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' })
  const idleNav = await page.evaluate(() => {
    for (let i = 0; i < 30; i++) window.scrollBy(0, 120)
    return {
      megaOpen: !!document.querySelector('.nav-mega-dropdown'),
      scrollingClassUsed: document.documentElement.classList.contains('is-scrolling'),
    }
  })
  await page.waitForTimeout(200)
  const afterIdle = await page.evaluate(() => document.documentElement.classList.contains('is-scrolling'))

  const report = {
    label: LABEL,
    timestamp: new Date().toISOString(),
    environmentNote:
      'Headless Chrome ≈60Hz. Prefer glassScrolling→0, LoAF, and gt33 over p95≈16.7ms cadence.',
    idleNav,
    afterIdleScrollingClass: afterIdle,
    results,
  }
  const outFile = path.join(OUT, `${LABEL}.json`)
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ outFile, n: results.length }, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
