import { mkdir, writeFile } from "node:fs/promises"
import { setTimeout as sleep } from "node:timers/promises"

const OUT = process.env.OUT || "/tmp/skylent-audit"
const ROUTE = process.env.ROUTE || "/"
const W = Number(process.env.W || 1440)
const H = Number(process.env.H || 900)
const NAME = process.env.NAME || "scroll"
const STEPS = (process.env.STEPS || "0,1000,2000,3000,4000,5000").split(",").map(Number)

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

await mkdir(OUT, { recursive: true })
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
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W <= 768 })
await send("Page.navigate", { url: `http://127.0.0.1:8443${ROUTE}` })
await sleep(1800)

for (const y of STEPS) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` })
  await sleep(650)
  const shot = await send("Page.captureScreenshot", { format: "png" })
  await writeFile(`${OUT}/${NAME}-y${y}.png`, Buffer.from(shot.data, "base64"))
  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const vis = [...document.querySelectorAll('section, .hp-choose-stage, .hp-choose-chapter')]
        .filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2; })
        .map(el => (el.className || el.tagName).toString().slice(0, 48));
      return { y: Math.round(scrollY), vis: [...new Set(vis)].slice(0, 4) };
    })()`,
  })
  console.log(`y=${String(y).padEnd(5)} ${JSON.stringify(result.value.vis)}`)
}
ws.close()
