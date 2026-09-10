/**
 * Phase 7 — route payload audit (cold cache).
 * Records transfer / JS / CSS / image / request counts per route.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const APP = process.env.APP_BASE ?? 'http://127.0.0.1:8443'
const OUT = process.env.PHASE7_OUT ?? '/opt/cursor/artifacts/phase7-baseline'

const ROUTES = [
  '/',
  '/education',
  '/programs',
  '/skills',
  '/exams',
  '/junior',
  '/degrees',
  '/programs/product-management',
  '/learn/data-analytics/l1',
  '/career-os',
  '/career-os/jobs',
]

function classify(url) {
  const u = url.split('?')[0]
  if (/\.(js)$/i.test(u) || u.includes('/assets/') && u.endsWith('.js')) return 'js'
  if (/\.css$/i.test(u)) return 'css'
  if (/\.(png|jpe?g|webp|gif|svg|avif|woff2?)$/i.test(u)) return 'media'
  if (u.includes('fonts.googleapis') || u.includes('fonts.gstatic')) return 'font'
  if (u.includes('/api/')) return 'api'
  return 'other'
}

async function measureRoute(context, route) {
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

  const resources = []
  page.on('response', async (res) => {
    try {
      const req = res.request()
      if (req.resourceType() === 'websocket') return
      const url = res.url()
      const headers = res.headers()
      let transfer = Number(headers['content-length'] || 0)
      // Prefer encoded body from timing when available after finish
      resources.push({
        url,
        type: req.resourceType(),
        status: res.status(),
        mime: headers['content-type'] || '',
        transferHint: transfer,
      })
    } catch {}
  })

  const t0 = Date.now()
  let status = 0
  try {
    const resp = await page.goto(`${APP}${route}`, { waitUntil: 'networkidle', timeout: 60000 })
    status = resp?.status() ?? 0
  } catch {
    try {
      const resp = await page.goto(`${APP}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      status = resp?.status() ?? 0
      await page.waitForTimeout(1500)
    } catch (e) {
      await page.close()
      return { route, error: String(e) }
    }
  }
  const wallMs = Date.now() - t0
  await page.waitForTimeout(400)

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paints = performance.getEntriesByType('paint')
    const resources = performance.getEntriesByType('resource')
    const by = { js: 0, css: 0, media: 0, font: 0, api: 0, other: 0, total: 0 }
    const counts = { js: 0, css: 0, media: 0, font: 0, api: 0, other: 0 }
    const largest = []
    for (const r of resources) {
      const name = r.name
      let kind = 'other'
      if (name.includes('.js') || (name.includes('/assets/') && name.endsWith('.js'))) kind = 'js'
      else if (name.includes('.css')) kind = 'css'
      else if (/\.(png|jpe?g|webp|gif|svg|avif|woff2?)/i.test(name) || name.includes('fonts.gstatic'))
        kind = name.includes('fonts.gstatic') || /\.woff2?$/i.test(name) ? 'font' : 'media'
      else if (name.includes('fonts.googleapis')) kind = 'font'
      else if (name.includes('/api/')) kind = 'api'
      const transfer = r.transferSize || 0
      const encoded = r.encodedBodySize || 0
      const decoded = r.decodedBodySize || 0
      by[kind] += transfer
      by.total += transfer
      counts[kind]++
      largest.push({
        name: name.split('/').pop()?.slice(0, 80),
        full: name.replace(location.origin, ''),
        kind,
        transfer,
        encoded,
        decoded,
      })
    }
    largest.sort((a, b) => b.transfer - a.transfer)
    const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null
    const imgs = [...document.images].map((img) => ({
      src: (img.currentSrc || img.src || '').slice(0, 120),
      w: img.naturalWidth,
      h: img.naturalHeight,
      dw: img.clientWidth,
      dh: img.clientHeight,
      complete: img.complete,
      loading: img.getAttribute('loading'),
      inView:
        img.getBoundingClientRect().top < innerHeight && img.getBoundingClientRect().bottom > 0,
    }))
    return {
      dcl: nav?.domContentLoadedEventEnd ?? null,
      load: nav?.loadEventEnd ?? null,
      fcp,
      transfer: by,
      counts,
      largest: largest.slice(0, 12),
      jsChunks: largest.filter((x) => x.kind === 'js').map((x) => ({ name: x.name, enc: x.encoded, transfer: x.transfer })),
      cssChunks: largest.filter((x) => x.kind === 'css').map((x) => ({ name: x.name, enc: x.encoded, transfer: x.transfer })),
      imgs,
      path: location.pathname,
      textLen: document.body?.innerText?.trim().length ?? 0,
    }
  })

  await page.close()
  return { route, status, wallMs, ...metrics }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    viewport: { width: 1440, height: 900 },
  })

  const results = []
  for (const route of ROUTES) {
    console.error(`Measuring ${route}...`)
    const r = await measureRoute(context, route)
    results.push(r)
    if (r.error) console.error('  ERR', r.error)
    else
      console.error(
        `  total=${r.transfer.total} js=${r.transfer.js} css=${r.transfer.css} media=${r.transfer.media} fcp=${r.fcp?.toFixed?.(0)} chunks=${r.counts.js}`,
      )
  }

  // Bundle inventory from dist
  const distDir = path.join(process.cwd(), 'dist/assets')
  const files = fs.readdirSync(distDir)
  const inventory = files
    .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
    .map((f) => ({
      name: f,
      bytes: fs.statSync(path.join(distDir, f)).size,
      kind: f.endsWith('.css') ? 'css' : 'js',
    }))
    .sort((a, b) => b.bytes - a.bytes)

  const report = {
    timestamp: new Date().toISOString(),
    note: 'Cold-cache route payload audit at 1440. Transfer sizes from Resource Timing.',
    results,
    inventoryTop: inventory.slice(0, 40),
  }
  const outFile = path.join(OUT, 'baseline.json')
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ outFile, n: results.length }, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
