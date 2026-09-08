import puppeteer from "puppeteer-core"
import { loginViaForm } from "./qa-auth.js"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`
const EMAIL = "learner@demo.skylent.dev"
const PASSWORD = process.env.DEMO_USER_PASSWORD
if (!PASSWORD) {
  throw new Error("DEMO_USER_PASSWORD must be set to run authenticated QA; no demo password is stored in source.")
}
const VIEWPORTS = [1440, 1024, 768, 375] as const

async function loginAsLearner(page: import("puppeteer-core").Page) {
  await loginViaForm(page, {
    email: EMAIL,
    password: PASSWORD,
    expectedPath: "/dashboard/student",
  })
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context = await browser.createBrowserContext()
  const loginPage = await context.newPage()
  await loginAsLearner(loginPage)
  await loginPage.close()

  const results: Array<Record<string, unknown>> = []

  for (const width of VIEWPORTS) {
    const page = await context.newPage()
    await page.setViewport({ width, height: 900 })

    await loginAsLearner(page)

    await page.waitForSelector(".student-learning-workspace", { timeout: 20000 })
    const dashboard = await page.evaluate(() => ({
      hasWorkspace: Boolean(document.querySelector(".student-learning-workspace")),
      hasEnrollments: Boolean(document.querySelector(".lms-enrolled-courses")),
      hasCurriculum: Boolean(document.querySelector(".student-curriculum-rail")),
      hasProgress: Boolean(document.querySelector("#student-progress")),
      hasCertificate: Boolean(document.querySelector("#student-certificates")),
      hasCertificatePanel: Boolean(document.querySelector(".lms-certificate-panel")),
      hasCertificateDownload: Boolean(document.querySelector(".lms-certificate-panel__download")),
      hasCareerLink: Boolean(document.querySelector(".lms-career-link-panel")),
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }))

    const resumeHref = await page.$eval(
      '.student-learning-workspace a[href*="/learn/"]',
      (el) => (el as HTMLAnchorElement).getAttribute("href"),
    ).catch(() => null)

    if (resumeHref) {
      await page.goto(`${BASE}${resumeHref}`, { waitUntil: "domcontentloaded", timeout: 30000 })
    } else {
      await page.goto(`${BASE}/learn/data-analytics`, { waitUntil: "domcontentloaded", timeout: 30000 })
    }

    await page.waitForSelector(".lms-curriculum-rail", { timeout: 20000 })
    const learn = await page.evaluate(() => ({
      hasCurriculumRail: Boolean(document.querySelector(".lms-curriculum-rail")),
      hasLessonPanel: Boolean(document.querySelector(".lms-lesson-panel")),
      hasProgressHeader: Boolean(document.querySelector(".lms-header-progress")),
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }))

    const clicked = await page.evaluate(() => {
      const btn = document.querySelector<HTMLButtonElement>(".lms-curriculum-lesson:not([disabled])")
      if (!btn) return false
      btn.click()
      return true
    })
    if (clicked) await new Promise((r) => setTimeout(r, 600))

    const lessonView = await page.evaluate(() => ({
      url: window.location.pathname,
      hasLessonContent: Boolean(document.querySelector(".lms-lesson-video, .lms-lesson-quiz, .lms-lesson-assignment, .lms-lesson-notes")),
    }))

    results.push({
      viewport: width,
      dashboard,
      learn,
      lessonView,
      overflow: (dashboard.overflowPx as number) > 1 || (learn.overflowPx as number) > 1,
    })
    await page.close()
  }

  await context.close()
  await browser.close()

  const failures = results.filter((r) => r.overflow || !(r.dashboard as { hasWorkspace: boolean }).hasWorkspace)
  console.log(JSON.stringify({
    passed: failures.length === 0,
    account: EMAIL,
    failureCount: failures.length,
    results,
  }, null, 2))

  if (failures.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}
