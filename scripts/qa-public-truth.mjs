/**
 * Renders every public route and asserts the product-truth and QA rules that
 * cannot be checked from source alone: fabricated social proof in visible text,
 * dead in-page anchors, broken images, horizontal overflow, console errors,
 * heading order, and rail alignment against the navbar.
 */
import { createConnection } from "node:net"
import { setTimeout as sleep } from "node:timers/promises"

const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8443"
const WIDTHS = (process.env.WIDTHS || "1440,768,390").split(",").map(Number)
const ROUTES = [
  "/",
  "/programs",
  "/programs/data-analytics-pro",
  "/programs/product-management",
  "/courses",
  "/courses/data-analytics",
  "/courses/product-management",
  "/skills",
  "/education",
  "/education/schooling",
  "/education/undergraduate",
  "/education/postgraduate",
  "/education/exams",
  "/workshops",
  "/workshops/ai-for-business",
  "/workshops/prompt-engineering",
  "/os",
  "/labs",
  "/login",
  "/career-os",
  "/about",
  "/institutions",
]

/** Claims the product cannot support. Matched against visible page text. */
const BANNED = [
  { label: "rating", re: /\b\d(?:\.\d)?\s*(?:\/\s*5|stars?\b|out of 5)/i },
  // Plural and not zero-padded, so numbered steps like "05 Review" do not match.
  { label: "review count", re: /\b(?!0)\d[\d,]*\s+(?:reviews|ratings)\b/i },
  { label: "learner count", re: /\b[\d,]{3,}\+?\s+(?:learners?|students?|alumni|enrolled)\b/i },
  { label: "placement claim", re: /\b\d{1,3}\s*%\s*(?:placement|placed|hired|hiring|job\s*guarantee)/i },
  { label: "salary claim", re: /(?:average|avg\.?|median|starting)\s+(?:salary|package|ctc)/i },
  { label: "salary hike", re: /\b\d{1,3}\s*%\s*(?:salary\s*)?(?:hike|increase in salary)/i },
  { label: "job guarantee", re: /\bjob\s*(?:guarantee|guaranteed)\b/i },
  { label: "placement guarantee", re: /\bplacement\s*(?:guarantee|guaranteed|assurance)\b/i },
  { label: "scarcity", re: /\b\d+\s+(?:seats?|spots?|slots?)\s*(?:left|remaining|available)/i },
  { label: "fill bar", re: /\b\d{1,3}\s*%\s*(?:filled|full|booked|sold)/i },
  { label: "struck-through discount", re: /₹[\d,]+\s*₹[\d,]+/ },
  { label: "cohort start", re: /\b(?:cohort|batch)\s+starts?\s+(?:on\s+)?(?:\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|tonight|tomorrow)/i },
  { label: "accreditation", re: /\b(?:accredited|accreditation)\s+by\b/i },
  { label: "certificate issued", re: /\bcertificate\s+(?:is\s+)?(?:issued|awarded)\b/i },
  { label: "internal placeholder", re: /\b(?:lorem ipsum|TODO|FIXME|undefined|NaN|\[object Object\])\b/ },
]

/**
 * The pages deliberately name these claims in order to deny them ("not a job
 * guarantee", "Is a certificate issued?" answered "Not in this pilot"). A hit is
 * only a violation when the phrase is asserted rather than negated or asked.
 */
const NEGATION = /\b(?:not|no|never|without|isn't|aren't|doesn't|don't|unavailable|unless|nor)\b[^.?!]{0,60}$/i
const QUESTION = /[?]\s*$/

function isAsserted(text, match) {
  const at = text.toLowerCase().indexOf(match.toLowerCase())
  if (at < 0) return true
  const before = text.slice(Math.max(0, at - 90), at)
  const after = text.slice(at + match.length, at + match.length + 40)
  if (NEGATION.test(before)) return false
  if (QUESTION.test(after.split(/(?<=[?.!])/)[0] ?? "")) return false
  return true
}

/** Requests that cannot succeed without a database in this environment. */
const IGNORED_REQUEST = /\/api\/v1\//

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
  throw new Error("CDP not reachable on 9333")
}

function rpc(ws) {
  let id = 1
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mine = id++
      const h = (e) => {
        const m = JSON.parse(e.data.toString())
        if (m.id === mine) {
          ws.removeEventListener("message", h)
          m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
        }
      }
      ws.addEventListener("message", h)
      ws.send(JSON.stringify({ id: mine, method, params }))
    })
}

const PROBE = `(() => {
  const de = document.documentElement;
  const text = (document.body.innerText || '').replace(/\\s+/g, ' ');
  const anchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href'));
  const dead = [...new Set(anchors.filter(h => h && h.length > 1 && !document.getElementById(h.slice(1))))];
  const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(n => Number(n.tagName[1]));
  let skips = [];
  for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skips.push(heads[i - 1] + '->' + heads[i]);
  const brand = document.querySelector('.skylent-site-nav a[href="/"], .skylent-site-nav .skylent-mark');
  const rail = [...document.querySelectorAll('.cat-rail,.hp-rail,.skylent-rail,.sk-rail,.arch-academic-inner')]
    .find(r => !r.closest('.skylent-site-nav') && !r.closest('footer'));
  const small = [...document.querySelectorAll('a,button')].filter(el => {
    if (!el.offsetParent) return false;
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.height < 24 && r.width < 24;
  }).length;
  return {
    text,
    dead,
    skips,
    h1: [...document.querySelectorAll('h1')].length,
    overflowX: de.scrollWidth > de.clientWidth + 1,
    scrollW: de.scrollWidth,
    clientW: de.clientWidth,
    imgBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
    brandLeft: brand ? Math.round(brand.getBoundingClientRect().left) : null,
    railLeft: rail ? Math.round(rail.getBoundingClientRect().left) : null,
    tinyTargets: small,
  };
})()`

await waitPort(9333)
const target = await fetch(`http://127.0.0.1:9333/json/new?about:blank`, { method: "PUT" }).then((r) => r.json())
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener("open", () => res(), { once: true })
  ws.addEventListener("error", rej, { once: true })
})
const send = rpc(ws)
await send("Page.enable")
await send("Runtime.enable")
await send("Log.enable")

const failures = []
let consoleErrors = []
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data.toString())
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
    const entry = m.params.entry
    if (!IGNORED_REQUEST.test(entry.url || "") && !IGNORED_REQUEST.test(entry.text || "")) {
      consoleErrors.push(entry.text.slice(0, 160))
    }
  }
  if (m.method === "Runtime.exceptionThrown") {
    consoleErrors.push(String(m.params.exceptionDetails.text).slice(0, 160))
  }
})

for (const width of WIDTHS) {
  console.log(`\n──── ${width}px ────`)
  for (const route of ROUTES) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: width <= 430 ? 844 : 900,
      deviceScaleFactor: 1,
      mobile: width <= 768,
    })
    consoleErrors = []
    await send("Page.navigate", { url: `${ORIGIN}${route}` })
    await sleep(1300)
    const { result } = await send("Runtime.evaluate", { expression: PROBE, returnByValue: true })
    const v = result.value

    const hits = BANNED.flatMap((rule) => {
      const m = v.text.match(rule.re)
      if (!m || !isAsserted(v.text, m[0])) return []
      return [`${rule.label}:"${m[0].trim().slice(0, 48)}"`]
    })
    const railDelta = v.brandLeft !== null && v.railLeft !== null ? v.railLeft - v.brandLeft : null

    const problems = []
    if (hits.length) problems.push(`BANNED ${hits.join(", ")}`)
    if (v.dead.length) problems.push(`DEAD_ANCHOR ${v.dead.join(",")}`)
    if (v.overflowX) problems.push(`OVERFLOW ${v.scrollW}>${v.clientW}`)
    if (v.imgBroken.length) problems.push(`IMG ${v.imgBroken.join(",")}`)
    if (v.h1 !== 1) problems.push(`H1_COUNT ${v.h1}`)
    if (v.skips.length) problems.push(`HEADING_SKIP ${v.skips.join(",")}`)
    if (railDelta !== null && railDelta !== 0) problems.push(`RAIL_DELTA ${railDelta}`)
    if (consoleErrors.length) problems.push(`CONSOLE ${consoleErrors.slice(0, 2).join(" | ")}`)

    if (problems.length) {
      failures.push({ width, route, problems })
      console.log(`FAIL ${route}`)
      for (const p of problems) console.log(`      ${p}`)
    } else {
      console.log(`ok   ${route}`)
    }
  }
}

ws.close()
console.log(`\n${failures.length ? `${failures.length} failing route/width combinations` : "ALL PUBLIC ROUTES PASS"}`)
process.exit(failures.length ? 1 : 0)
