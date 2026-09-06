import "dotenv/config"
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
import path from "node:path"

const API_BASE = "http://localhost:3001/api/v1"
const APP_BASE = process.env.APP_BASE ?? "http://localhost:8443"
const OUT_DIR = "/opt/cursor/artifacts/screenshots"

type CookieJar = Map<string, string>

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}

async function apiRequest(jar: CookieJar, apiPath: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  if (jar.size) headers.Cookie = Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join("; ")
  if (options.body) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""

  const response = await fetch(`${API_BASE}${apiPath}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
}

async function setupSession(jar: CookieJar) {
  const email = `phase6-qa-${Date.now()}@example.com`
  await apiRequest(jar, "/auth/csrf")
  await apiRequest(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: "Phase 6 QA", email, password: "test-password-123" },
  })
  await apiRequest(jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: "data-analytics" },
  })
}

async function capture(browser: puppeteer.Browser, jar: CookieJar, viewport: { width: number; height: number }, url: string, filename: string) {
  const page = await browser.newPage()
  await page.setViewport(viewport)

  await page.setCookie(
    ...Array.from(jar.entries()).map(([name, value]) => ({
      name,
      value,
      domain: "localhost",
      path: "/",
    })),
  )

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
  await new Promise((resolve) => setTimeout(resolve, 3500))
  const outPath = path.join(OUT_DIR, filename)
  await page.screenshot({ path: outPath, fullPage: true })
  await page.close()
  console.log("Saved", outPath)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const jar: CookieJar = new Map()
  await setupSession(jar)

  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const pages = [
    { url: `${APP_BASE}/dashboard/student`, prefix: "phase6_student_dashboard" },
    { url: `${APP_BASE}/learn/data-analytics/l1`, prefix: "phase6_learn_video" },
    { url: `${APP_BASE}/learn/data-analytics/l4`, prefix: "phase6_learn_locked" },
    { url: `${APP_BASE}/learn/data-analytics/l3`, prefix: "phase6_learn_quiz" },
    { url: `${APP_BASE}/learn/data-analytics/l6`, prefix: "phase6_learn_assignment" },
  ]

  for (const width of [1440, 768, 375]) {
    for (const page of pages) {
      await capture(
        browser,
        jar,
        { width, height: width === 375 ? 812 : 900 },
        page.url,
        `${page.prefix}_${width}.png`,
      )
    }
  }

  await browser.close()
  console.log("Phase 6 QA screenshots complete")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
