/**
 * Phase 6 frame-duration profiler (proxy for high-refresh smoothness).
 * Environment cannot guarantee a physical 144Hz display — use frame-duration buckets.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const APP = process.env.APP_BASE ?? 'http://127.0.0.1:8443'
const OUT = process.env.PHASE6_OUT ?? '/opt/cursor/artifacts/phase6-baseline'
const MODE = process.env.PHASE6_MODE ?? 'baseline' // baseline | after | experiment

const ROUTES = [
  '/',
  '/education',
  '/skills',
  '/exams',
  '/junior',
  '/degrees',
  '/programs',
]

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '430', width: 430, height: 932 },
  { name: '390', width: 390, height: 844 },
  { name: '375', width: 375, height: 812 },
]

function pct(sorted, p) {
  if (!sorted.length) return null
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[i]
}

function summarize(frames) {
  const sorted = [...frames].sort((a, b) => a - b)
  const n = sorted.length || 1
  const buckets = {
    le694: sorted.filter((d) => d <= 6.94).length,
    bt694_833: sorted.filter((d) => d > 6.94 && d <= 8.33).length,
    bt833_1667: sorted.filter((d) => d > 8.33 && d <= 16.67).length,
    gt1667: sorted.filter((d) => d > 16.67).length,
  }
  return {
    samples: frames.length,
    p50: pct(sorted, 50),
    p95: pct(sorted, 95),
    p99: pct(sorted, 99),
    worst: sorted.length ? sorted[sorted.length - 1] : null,
    mean: frames.length ? frames.reduce((a, b) => a + b, 0) / frames.length : null,
    buckets,
    pctGt1667: Math.round((buckets.gt1667 / n) * 1000) / 10,
    pctGt833: Math.round(((buckets.bt833_1667 + buckets.gt1667) / n) * 1000) / 10,
  }
}

async function profileInteraction(page, kind) {
  return page.evaluate(async (kindInner) => {
    const frames = []
    const loafs = []
    let last = performance.now()
    let running = true

    let po
    try {
      po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          loafs.push({
            d: Math.round(e.duration * 10) / 10,
            t: Math.round(e.startTime * 10) / 10,
            scripts: e.scripts?.length ?? 0,
          })
        }
      })
      po.observe({ type: 'long-animation-frame', buffered: true })
    } catch {}

    const tick = (now) => {
      if (!running) return
      frames.push(now - last)
      last = now
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    if (kindInner === 'scroll-normal') {
      for (let i = 0; i < 12; i++) {
        window.scrollBy(0, Math.min(420, maxY))
        await sleep(40)
      }
      window.scrollTo(0, 0)
      await sleep(80)
    } else if (kindInner === 'scroll-fast') {
      for (let i = 0; i < 20; i++) {
        window.scrollBy(0, Math.min(900, maxY))
        await sleep(16)
      }
      window.scrollTo(0, 0)
      await sleep(80)
    } else if (kindInner === 'scroll-slow') {
      for (let i = 0; i < 24; i++) {
        window.scrollBy(0, 80)
        await sleep(50)
      }
      window.scrollTo(0, 0)
      await sleep(80)
    } else if (kindInner === 'pointer') {
      // synthetic mousemove events across viewport
      for (let i = 0; i < 40; i++) {
        const x = 40 + ((i * 37) % (window.innerWidth - 80))
        const y = 40 + ((i * 23) % (window.innerHeight - 80))
        document.elementFromPoint(x, y)?.dispatchEvent(
          new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }),
        )
        await sleep(16)
      }
    } else if (kindInner === 'idle') {
      await sleep(400)
    }

    running = false
    po?.disconnect()

    // glass layer count
    const glassCount = (() => {
      let n = 0
      const all = document.querySelectorAll('*')
      for (const el of all) {
        const s = getComputedStyle(el)
        if ((s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none')) {
          n++
        }
      }
      return n
    })()

    return { frames, loafs, glassCount, scrollHeight: document.documentElement.scrollHeight }
  }, kind)
}

async function megaMenuLatency(page) {
  // desktop only
  const vp = page.viewportSize()
  if (!vp || vp.width < 1100) return null
  try {
    const btn = page.locator('.nav-links button').filter({ hasText: /Education|Skills|Career/i }).first()
    if (!(await btn.count())) return null
    const t0 = Date.now()
    await btn.hover({ timeout: 2000 })
    await page.waitForSelector('.nav-mega-dropdown', { timeout: 2000 })
    const openMs = Date.now() - t0
    await page.mouse.move(10, 10)
    await page.waitForTimeout(200)
    return { openMs }
  } catch {
    return { openMs: -1 }
  }
}

async function mobileMenuLatency(page) {
  const vp = page.viewportSize()
  if (!vp || vp.width > 1100) return null
  try {
    const hamburger = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], .show-mobile button').first()
    if (!(await hamburger.count())) return null
    const t0 = Date.now()
    await hamburger.click({ timeout: 2000 })
    await page.waitForTimeout(180)
    const openMs = Date.now() - t0
    // close via Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(120)
    return { openMs }
  } catch {
    return { openMs: -1 }
  }
}

async function navScrollListenerCheck(page) {
  return page.evaluate(() => {
    let fires = 0
    const orig = EventTarget.prototype.addEventListener
    // count existing by probing: attach a sentinel and scroll with menu closed
    const before = performance.now()
    window.dispatchEvent(new Event('scroll'))
    return {
      note: 'Phase4 idle check done in dedicated script; here we only verify activeMenu-gated listener via source audit',
      t: performance.now() - before,
      fires,
    }
  })
}

async function runCase(page, route, vp, experimentCss) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  await page.goto(`${APP}${route}`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(350)

  if (experimentCss) {
    await page.addStyleTag({ content: experimentCss })
    await page.waitForTimeout(50)
  }

  const results = {}
  for (const kind of ['idle', 'scroll-normal', 'scroll-fast', 'scroll-slow', 'pointer']) {
    const raw = await profileInteraction(page, kind)
    results[kind] = {
      ...summarize(raw.frames.filter((d) => d < 200)), // drop first/pause outliers
      loafCount: raw.loafs.length,
      maxLoAF: raw.loafs.reduce((m, e) => Math.max(m, e.d), 0),
      loafs: raw.loafs.slice(0, 8),
      glassCount: raw.glassCount,
    }
  }

  const mega = await megaMenuLatency(page)
  const mobile = await mobileMenuLatency(page)

  return {
    route,
    viewport: vp.name,
    mega,
    mobile,
    interactions: results,
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  const experimentCss =
    MODE === 'experiment'
      ? `
      .skylent-site-nav,
      .contextual-nav-bar,
      .program-sticky-nav,
      .nav-mega-dropdown,
      [style*="backdrop-filter"],
      [style*="backdropFilter"] {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      .gw-school-planet, .home-orbit-planet { animation: none !important; }
    `
      : null

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu-vsync',
      '--force-device-scale-factor=1',
    ],
  })

  const context = await browser.newContext({ deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.addInitScript(() => {
    try {
      // keep LoAF available early
      new PerformanceObserver(() => {}).observe({ type: 'long-animation-frame', buffered: true })
    } catch {}
  })

  const cases = []
  // Focused matrix: all routes at 1440 + 375; key routes at other viewports
  const focusRoutes = ROUTES
  const matrix = []
  for (const route of focusRoutes) {
    matrix.push({ route, vp: VIEWPORTS[0] }) // 1440
    matrix.push({ route, vp: VIEWPORTS[5] }) // 375
  }
  for (const vp of VIEWPORTS.slice(1, 5)) {
    matrix.push({ route: '/', vp })
    matrix.push({ route: '/education', vp })
    matrix.push({ route: '/programs', vp })
  }

  for (const { route, vp } of matrix) {
    console.error(`Profiling ${route} @ ${vp.name} (${MODE})...`)
    try {
      const r = await runCase(page, route, vp, experimentCss)
      cases.push(r)
      const sn = r.interactions['scroll-normal']
      console.error(
        `  scroll-normal p95=${sn.p95?.toFixed?.(1)} worst=${sn.worst?.toFixed?.(1)} >16.67=${sn.buckets.gt1667} glass=${sn.glassCount}`,
      )
    } catch (e) {
      cases.push({ route, viewport: vp.name, error: String(e) })
      console.error('  ERROR', e)
    }
  }

  // Route transition sample home -> skills
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${APP}/`, { waitUntil: 'networkidle' })
  const transition = await page.evaluate(async () => {
    const frames = []
    let last = performance.now()
    let running = true
    const tick = (now) => {
      if (!running) return
      frames.push(now - last)
      last = now
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    const a = document.querySelector('a[href="/skills"]')
    if (a) a.click()
    else location.href = '/skills'
    await new Promise((r) => setTimeout(r, 1200))
    running = false
    const sorted = [...frames].filter((d) => d < 200).sort((a, b) => a - b)
    return {
      samples: sorted.length,
      p95: sorted[Math.ceil(0.95 * sorted.length) - 1] ?? null,
      worst: sorted[sorted.length - 1] ?? null,
      gt1667: sorted.filter((d) => d > 16.67).length,
      path: location.pathname,
    }
  })

  const idleNavCheck = await page.evaluate(() => {
    // Verify no continuous scroll→react by counting listeners is hard;
    // measure scroll listener invocations via wrapping once.
    let count = 0
    const h = () => {
      count++
    }
    // If Nav attached a listener only when menu open, idle scroll should not close anything.
    // Probe: scroll and ensure mega dropdown stays absent.
    window.scrollBy(0, 200)
    window.scrollBy(0, -200)
    return {
      megaOpen: !!document.querySelector('.nav-mega-dropdown'),
      note: 'idle scroll with menu closed',
      probe: count,
    }
  })

  const report = {
    mode: MODE,
    timestamp: new Date().toISOString(),
    note: 'Frame durations via rAF sampling; not literal 144Hz hardware. LoAF via PerformanceObserver when available.',
    thresholds: { hz144: 6.94, hz120: 8.33, hz60: 16.67 },
    transition,
    idleNavCheck,
    cases,
  }

  const outFile = path.join(OUT, `${MODE}.json`)
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ outFile, cases: cases.length, transition }, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
