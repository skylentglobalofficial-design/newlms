import { spawn } from "node:child_process"
import { createConnection } from "node:net"
import { mkdir, writeFile } from "node:fs/promises"
import { setTimeout as sleep } from "node:timers/promises"

const OUT = "/opt/cursor/artifacts"
const BASE = process.env.PROGRAMS_URL || "http://127.0.0.1:8443/programs"
const VIEWPORTS = [
  { name: "programs-scroll01-desktop-1440", width: 1440, height: 900 },
  { name: "programs-scroll01-mobile-390", width: 390, height: 844 },
  { name: "programs-scroll01-1280", width: 1280, height: 800 },
  { name: "programs-scroll01-1024", width: 1024, height: 768 },
  { name: "programs-scroll01-768", width: 768, height: 1024 },
  { name: "programs-scroll01-320", width: 320, height: 700 },
]

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

function chromeArgs(port) {
  return [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--window-size=1440,900",
    `--remote-debugging-port=${port}`,
    "--user-data-dir=/tmp/chrome-programs-capture",
    "about:blank",
  ]
}

async function cdpSend(ws, id, method, params = {}) {
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
    await waitPort(port, 500)
  } catch {
    const chrome = spawn("google-chrome", chromeArgs(port), {
      stdio: "ignore",
      detached: true,
    })
    chrome.unref()
    await waitPort(port)
  }

  const newTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(BASE)}`, {
    method: "PUT",
  }).then((r) => r.json())
  const wsUrl = newTarget.webSocketDebuggerUrl
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    ws.addEventListener("open", () => res(), { once: true })
    ws.addEventListener("error", (e) => rej(e), { once: true })
  })

  let id = 1
  const send = (method, params) => cdpSend(ws, id++, method, params)

  await send("Page.enable")
  await send("Runtime.enable")
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  const overflow = []
  for (const vp of VIEWPORTS) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width <= 768,
    })
    await send("Page.navigate", { url: BASE })
    await sleep(1200)
    await send("Runtime.evaluate", { expression: "document.fonts.ready" })
    const { result } = await send("Runtime.evaluate", {
      expression: `({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      })`,
      returnByValue: true,
    })
    if (result.value.overflow) overflow.push(`${vp.width}px`)
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    })
    await writeFile(`${OUT}/${vp.name}.png`, Buffer.from(shot.data, "base64"))
    console.log(`saved ${vp.name}.png overflow=${result.value.overflow}`)
  }

  ws.close()
  if (overflow.length) {
    console.error("OVERFLOW at:", overflow.join(", "))
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
