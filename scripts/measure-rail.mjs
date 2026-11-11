import { createConnection } from "node:net"
import { setTimeout as sleep } from "node:timers/promises"

const ORIGIN = "http://127.0.0.1:8443"
const ROUTES = (process.env.ROUTES || "/,/programs,/courses,/os,/skills,/workshops,/education").split(",")
const W = Number(process.env.W || 1440)

async function waitPort(port, ms = 8000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    try {
      await new Promise((res, rej) => {
        const s = createConnection(port, "127.0.0.1", () => {
          s.end()
          res()
        })
        s.on("error", rej)
      })
      return
    } catch {
      await sleep(150)
    }
  }
  throw new Error("no cdp")
}

async function cdp(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const h = (e) => {
      const m = JSON.parse(e.data.toString())
      if (m.id === id) {
        ws.removeEventListener("message", h)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      }
    }
    ws.addEventListener("message", h)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

await waitPort(9333)
const t = await fetch(`http://127.0.0.1:9333/json/new?about:blank`, { method: "PUT" }).then((r) => r.json())
const ws = new WebSocket(t.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener("open", () => res(), { once: true })
  ws.addEventListener("error", rej, { once: true })
})
let id = 1
const send = (m, p) => cdp(ws, id++, m, p)
await send("Page.enable")
await send("Runtime.enable")

for (const route of ROUTES) {
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: false })
  await send("Page.navigate", { url: `${ORIGIN}${route}` })
  await sleep(1400)
  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const navInner = document.querySelector('.skylent-site-nav .skylent-rail, .skylent-site-nav .nav-inner, .skylent-site-nav > div');
      const brand = document.querySelector('.skylent-site-nav a[href="/"], .skylent-site-nav .skylent-mark');
      const rails = [...document.querySelectorAll('.cat-rail, .hp-rail, .skylent-rail, .sk-rail')];
      const firstMain = rails.find(r => !r.closest('.skylent-site-nav') && !r.closest('footer'));
      const r = (el) => el ? Math.round(el.getBoundingClientRect().left) : null;
      return {
        brandLeft: r(brand),
        navInnerLeft: r(navInner),
        firstRailLeft: r(firstMain),
        firstRailCls: firstMain ? firstMain.className : null,
        firstRailWidth: firstMain ? Math.round(firstMain.getBoundingClientRect().width) : null,
        railCount: rails.length,
        cssRail: getComputedStyle(document.documentElement).getPropertyValue('--rail').trim(),
      };
    })()`,
  })
  const v = result.value
  const delta = v.brandLeft !== null && v.firstRailLeft !== null ? v.firstRailLeft - v.brandLeft : "n/a"
  console.log(
    `${route.padEnd(14)} brand=${String(v.brandLeft).padEnd(5)} rail=${String(v.firstRailLeft).padEnd(5)} delta=${String(delta).padEnd(6)} w=${String(v.firstRailWidth).padEnd(6)} cls=${v.firstRailCls}`,
  )
}
ws.close()
