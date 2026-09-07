import type { Page } from "puppeteer-core"

const PORT = process.env.PORT ?? "8443"
const BASE = `http://localhost:${PORT}`

export type QaLoginOptions = {
  email: string
  password: string
  expectedPath?: string
  loginPath?: string
}

/**
 * Sign in through the login form. Handles the case where an existing session
 * already redirected away from /login before the form appears.
 */
export async function loginViaForm(page: Page, options: QaLoginOptions) {
  const loginPath = options.loginPath ?? "/login"
  await page.goto(`${BASE}${loginPath}`, { waitUntil: "domcontentloaded", timeout: 30000 })

  await page.waitForFunction(
    (expectedPath) => {
      if (expectedPath && window.location.pathname === expectedPath) return true
      return Boolean(document.querySelector("#si-email"))
    },
    { timeout: 20000 },
    options.expectedPath ?? "",
  )

  if (options.expectedPath) {
    const alreadyThere = await page.evaluate(
      (path) => window.location.pathname === path,
      options.expectedPath,
    )
    if (alreadyThere) return
  }

  const emailField = await page.$("#si-email")
  if (!emailField) {
    if (options.expectedPath) {
      await page.goto(`${BASE}${options.expectedPath}`, { waitUntil: "domcontentloaded", timeout: 30000 })
      return
    }
    throw new Error("Login form not found (#si-email)")
  }

  await page.evaluate(() => {
    const email = document.querySelector<HTMLInputElement>("#si-email")
    const password = document.querySelector<HTMLInputElement>("#si-password")
    if (email) email.value = ""
    if (password) password.value = ""
  })

  await page.type("#si-email", options.email, { delay: 10 })
  await page.type("#si-password", options.password, { delay: 10 })
  await page.click('button[type="submit"]')

  if (options.expectedPath) {
    await page.waitForFunction(
      (path) => window.location.pathname === path,
      { timeout: 20000 },
      options.expectedPath,
    )
  }
}
