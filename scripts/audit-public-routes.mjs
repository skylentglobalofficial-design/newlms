import { spawn } from "node:child_process"
import { createConnection } from "node:net"
import { mkdir, writeFile } from "node:fs/promises"
import { setTimeout as sleep } from "node:timers/promises"

const OUT = process.env.AUDIT_OUT || "/tmp/skylent-audit"
const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8443"
const WIDTH = Number(process.env.W || 1440)
const HEIGHT = Number(process.env.H || 900)
const ROUTES = (process.env.ROUTES || [
  "/",
  "/programs",
  "/programs/data-analytics-pro",
  "/courses",
  "/courses/data-analytics",
  "/skills",
  "/education",
  "/education/schooling",
  "/education/exams",
  "/workshops",
  "/os",
  "/career-os",
].join(",")).split(",")

async function waitPort(port, ms = 15000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    try {
      await new Promise((resolve, reject) => {
        const s = createConnection(port, "127.0.0.1", () => {
          s.end()
          resolve()
        })
        s.on("error", reject)
      })
      return
    } catch {
      await sleep(200)
    }
  }
  throw new Error(`CDP port ${port} not ready`)
}

async function cdp(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const msg = JSON.parse(event.data.toString())
      if (msg.id === id) {
        ws.removeEventListener("message", handler)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      }
    }
    ws.addEventListener("message", handler)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const port = 9333
  try {
    await waitPort(port, 400)
  } catch {
    const chrome = spawn(
      "google-chrome",
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        `--remote-debugging-port=${port}`,
        "--user-data-dir=/tmp/chrome-skylent-audit",
        "about:blank",
      ],
      { stdio: "ignore", detached: true },
    )
    chrome.unref()
    await waitPort(port)
  }

  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json())
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener("open", () => res(), { once: true })
    ws.addEventListener("error", rej, { once: true })
  })

  let id = 1
  const send = (m, p) => cdp(ws, id++, m, p)
  await send("Page.enable")
  await send("Runtime.enable")
  await send("Log.enable")

  const report = []
  for (const route of ROUTES) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: WIDTH <= 768,
    })
    await send("Page.navigate", { url: `${ORIGIN}${route}` })
    await sleep(1500)
    const { result } = await send("Runtime.evaluate", {
      expression: `(() => {
        const de = document.documentElement;
        const sections = [...document.querySelectorAll('section')].length;
        const h1 = [...document.querySelectorAll('h1')].map(n => n.textContent.trim()).slice(0,3);
        const h2 = [...document.querySelectorAll('h2')].map(n => n.textContent.trim()).slice(0,14);
        const deadHash = [...document.querySelectorAll('a[href^="#"]')]
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.length > 1 && !document.querySelector(h.replace('#','#')) && !document.getElementById(h.slice(1)));
        return {
          scrollH: de.scrollHeight,
          overflowX: de.scrollWidth > de.clientWidth + 1,
          sections, h1, h2,
          deadHash: [...new Set(deadHash)],
          imgBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
        };
      })()`,
      returnByValue: true,
    })
    const safe = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_")
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true })
    await writeFile(`${OUT}/${WIDTH}-${safe}.png`, Buffer.from(shot.data, "base64"))
    report.push({ route, ...result.value })
    console.log(
      `${route.padEnd(32)} h=${String(result.value.scrollH).padEnd(6)} sec=${String(result.value.sections).padEnd(3)} ovf=${result.value.overflowX} dead=${JSON.stringify(result.value.deadHash)} imgBroken=${result.value.imgBroken.length}`,
    )
  }
  await writeFile(`${OUT}/report-${WIDTH}.json`, JSON.stringify(report, null, 2))
  ws.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
