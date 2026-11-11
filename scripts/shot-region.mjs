import { createConnection } from "node:net"
import { mkdir, writeFile } from "node:fs/promises"
import { setTimeout as sleep } from "node:timers/promises"

const OUT = process.env.OUT || "/tmp/skylent-audit"
const ORIGIN = "http://127.0.0.1:8443"
const ROUTE = process.env.ROUTE || "/programs"
const SEL = process.env.SEL || ""
const W = Number(process.env.W || 1440)
const H = Number(process.env.H || 900)
const NAME = process.env.NAME || "region"
const PAD = Number(process.env.PAD || 12)

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

await mkdir(OUT, { recursive: true })
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
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W <= 768 })
await send("Page.navigate", { url: `${ORIGIN}${ROUTE}` })
await sleep(1600)

let clip
if (SEL) {
  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(SEL)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
    })()`,
  })
  if (!result.value) throw new Error(`selector not found: ${SEL}`)
  const r = result.value
  clip = {
    x: Math.max(0, r.x - PAD),
    y: Math.max(0, r.y - PAD),
    width: Math.min(W, r.width + PAD * 2),
    height: r.height + PAD * 2,
    scale: 1,
  }
}

const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  ...(clip ? { clip } : {}),
})
await writeFile(`${OUT}/${NAME}.png`, Buffer.from(shot.data, "base64"))
console.log(`${OUT}/${NAME}.png`, clip ? `clip=${Math.round(clip.width)}x${Math.round(clip.height)}` : "full")
ws.close()
