/**
 * Phase 6 refined profiler: LoAF + longtasks + main-thread proxy during scroll.
 * Uses PerformanceObserver + measure of forced layout probes.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const APP = process.env.APP_BASE ?? 'http://127.0.0.1:8443'
const OUT = process.env.PHASE6_OUT ?? '/opt/cursor/artifacts/phase6-baseline'
const MODE = process.env.PHASE6_MODE ?? 'baseline'

const CASES = [
  { route: '/', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/', vp: { name: '375', width: 375, height: 812 } },
  { route: '/education', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/education', vp: { name: '375', width: 375, height: 812 } },
  { route: '/skills', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/programs', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/programs', vp: { name: '375', width: 375, height: 812 } },
  { route: '/programs/product-management', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/exams', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/junior', vp: { name: '1440', width: 1440, height: 900 } },
  { route: '/degrees', vp: { name: '1440', width: 1440, height: 900 } },
]

function summarizeDeltas(frames) {
  const sorted = [...frames].filter((d) => d > 0 && d < 500).sort((a, b) => a - b)
  const n = sorted.length || 1
  const sum = sorted.reduce((a, b) => a + b, 0)
  return {
    samples: sorted.length,
    p50: sorted[Math.floor(0.5 * (n - 1))] ?? null,
    p95: sorted[Math.floor(0.95 * (n - 1))] ?? null,
    worst: sorted[sorted.length - 1] ?? null,
    mean: sorted.length ? sum / sorted.length : null,
    gt694: sorted.filter((d) => d > 6.94).length,
    gt833: sorted.filter((d) => d > 8.33).length,
    gt1667: sorted.filter((d) => d > 16.67).length,
    gt33: sorted.filter((d) => d > 33).length,
    gt50: sorted.filter((d) => d > 50).length,
  }
}

async function measureScroll(page, label) {
  return page.evaluate(async (labelInner) => {
    const loafs = []
    const longtasks = []
    const frameDeltas = []
    let layoutReads = 0

    let poLoaf, poLt
    try {
      poLoaf = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          loafs.push({
            d: e.duration,
            blocking: e.renderStart ? e.styleAndLayoutStart : undefined,
            scripts: (e.scripts || []).reduce((s, x) => s + (x.duration || 0), 0),
          })
        }
      })
      poLoaf.observe({ type: 'long-animation-frame', buffered: false })
    } catch {}
    try {
      poLt = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) longtasks.push(e.duration)
      })
      poLt.observe({ type: 'longtask', buffered: false })
    } catch {}

    let last = performance.now()
    let alive = true
    const onFrame = (t) => {
      if (!alive) return
      frameDeltas.push(t - last)
      last = t
      // forced layout probe — if thrashing, this gets expensive; we only count reads
      layoutReads++
      void document.body.offsetHeight
      requestAnimationFrame(onFrame)
    }
    requestAnimationFrame(onFrame)

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight)

    const t0 = performance.now()
    if (labelInner === 'fast') {
      for (let i = 0; i < 30; i++) {
        scrollBy(0, Math.min(1100, maxY))
        await sleep(8)
      }
    } else if (labelInner === 'normal') {
      for (let i = 0; i < 16; i++) {
        scrollBy(0, Math.min(480, maxY))
        await sleep(32)
      }
    } else {
      for (let i = 0; i < 30; i++) {
        scrollBy(0, 60)
        await sleep(40)
      }
    }
    scrollTo(0, 0)
    await sleep(100)
    const wall = performance.now() - t0
    alive = false
    poLoaf?.disconnect()
    poLt?.disconnect()

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

    const animating = [...document.getAnimations?.() ?? []].filter((a) => a.playState === 'running').length

    return {
      wall,
      loafs,
      longtasks,
      frameDeltas,
      layoutReads,
      glass,
      glassArea: Math.round(glassArea),
      runningAnimations: animating,
    }
  }, label)
}

async function measureHoverMenu(page) {
  const w = page.viewportSize()?.width ?? 0
  if (w < 1100) {
    // mobile menu
    try {
      const btn = page.locator('button[aria-label*="menu" i], .show-mobile button').first()
      if (!(await btn.count())) return null
      const frames = await page.evaluate(async () => {
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
        await new Promise((r) => setTimeout(r, 50))
        ;(window).__stop = () => {
          alive = false
        }
        return new Promise((resolve) => {
          ;(window).__resolveFrames = () => {
            alive = false
            resolve(deltas)
          }
        })
      })
      // Actually simpler timing:
    } catch {}
    const t0 = Date.now()
    await page.locator('button[aria-label*="menu" i], .show-mobile button').first().click({ timeout: 2000 }).catch(() => null)
    await page.waitForTimeout(200)
    const openMs = Date.now() - t0
    await page.keyboard.press('Escape')
    return { type: 'mobile', openMs }
  }
  const t0 = Date.now()
  await page.locator('.nav-links button').first().hover({ timeout: 2000 }).catch(() => null)
  await page.waitForSelector('.nav-mega-dropdown', { timeout: 1500 }).catch(() => null)
  const openMs = Date.now() - t0
  await page.mouse.move(5, 5)
  await page.waitForTimeout(150)
  return { type: 'mega', openMs }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const experimentCss =
    MODE === 'experiment'
      ? `
html.is-scrolling .skylent-site-nav,
html.is-scrolling .contextual-nav-bar,
html.is-scrolling .program-sticky-nav,
.skylent-site-nav,
.contextual-nav-bar,
.program-sticky-nav,
.nav-mega-dropdown {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.gw-school-planet, .home-orbit-planet { animation-play-state: paused !important; }
`
      : MODE === 'scroll-opt'
        ? `
html.is-scrolling .skylent-site-nav,
html.is-scrolling .contextual-nav-bar,
html.is-scrolling .program-sticky-nav,
html.is-scrolling .nav-mega-dropdown,
html.is-scrolling [data-skylent-glass] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
`
        : null

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  })
  const page = await browser.newPage()
  const results = []

  for (const c of CASES) {
    console.error(`>> ${c.route} @ ${c.vp.name}`)
    await page.setViewportSize({ width: c.vp.width, height: c.vp.height })
    await page.goto(`${APP}${c.route}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(async () => {
      await page.goto(`${APP}${c.route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    })
    await page.waitForTimeout(400)
    if (experimentCss) {
      await page.addStyleTag({ content: experimentCss })
      if (MODE === 'scroll-opt') {
        await page.evaluate(() => {
          let timer
          const onScroll = () => {
            document.documentElement.classList.add('is-scrolling')
            clearTimeout(timer)
            timer = setTimeout(() => document.documentElement.classList.remove('is-scrolling'), 120)
          }
          window.addEventListener('scroll', onScroll, { passive: true })
        })
      }
    }

    const normal = await measureScroll(page, 'normal')
    const fast = await measureScroll(page, 'fast')
    const menu = await measureHoverMenu(page)

    const row = {
      route: c.route,
      viewport: c.vp.name,
      glass: normal.glass,
      glassArea: normal.glassArea,
      runningAnimations: normal.runningAnimations,
      menu,
      normal: {
        ...summarizeDeltas(normal.frameDeltas),
        loafCount: normal.loafs.length,
        maxLoAF: normal.loafs.reduce((m, e) => Math.max(m, e.d), 0),
        loafSum: Math.round(normal.loafs.reduce((s, e) => s + e.d, 0)),
        longtaskCount: normal.longtasks.length,
        maxLT: normal.longtasks.reduce((m, d) => Math.max(m, d), 0),
        wall: Math.round(normal.wall),
      },
      fast: {
        ...summarizeDeltas(fast.frameDeltas),
        loafCount: fast.loafs.length,
        maxLoAF: fast.loafs.reduce((m, e) => Math.max(m, e.d), 0),
        loafSum: Math.round(fast.loafs.reduce((s, e) => s + e.d, 0)),
        longtaskCount: fast.longtasks.length,
        maxLT: fast.longtasks.reduce((m, d) => Math.max(m, d), 0),
        wall: Math.round(fast.wall),
      },
    }
    results.push(row)
    console.error(
      `  glass=${row.glass} area=${row.glassArea} anim=${row.runningAnimations} fast maxLoAF=${row.fast.maxLoAF.toFixed(1)} loafs=${row.fast.loafCount} gt33=${row.fast.gt33} menu=${row.menu?.openMs}`,
    )
  }

  // Nav idle scroll listener regression probe
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' })
  const idleScroll = await page.evaluate(() => {
    let scrollHandlersFired = 0
    const proto = EventTarget.prototype
    // Can't easily count existing; instead scroll with menu closed and ensure no mega menu flicker
    for (let i = 0; i < 20; i++) window.scrollBy(0, 100)
    return {
      megaOpen: !!document.querySelector('.nav-mega-dropdown'),
      scrollY: window.scrollY,
    }
  })

  const report = {
    mode: MODE,
    timestamp: new Date().toISOString(),
    environmentNote:
      'Headless Chrome is typically vsync-capped near 60Hz (~16.7ms). Frame deltas near 16.7ms are refresh cadence, not proof of jank. Prefer LoAF, longtasks, frames>33ms, and glass layer counts.',
    idleScroll,
    results,
  }
  const outFile = path.join(OUT, `refined-${MODE}.json`)
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ outFile, n: results.length }, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
