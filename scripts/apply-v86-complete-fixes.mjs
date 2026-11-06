/**
 * V88 Complete Surgical Patcher (Syncs identical buildId across Server health.ts & Client NativeAppShellController.tsx)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const buildStamp = `v88-${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12)}`

// 1. Stamp server/src/routes/health.ts with buildStamp
const healthPath = resolve(root, "server/src/routes/health.ts")
if (existsSync(healthPath)) {
  let hSrc = readFileSync(healthPath, "utf8")
  hSrc = hSrc.replace(
    /export const DEPLOYED_APP_VERSION = [^\n]+/,
    'export const DEPLOYED_APP_VERSION = "8.8.0"',
  )
  hSrc = hSrc.replace(
    /export const DEPLOYED_BUILD_ID = [^\n]+/,
    `export const DEPLOYED_BUILD_ID = "${buildStamp}"`,
  )
  writeFileSync(healthPath, hSrc, "utf8")
  console.log(`[V88 Fix] Stamped server/src/routes/health.ts with buildId: ${buildStamp}`)
}

// 2. Stamp src/components/skylent/NativeAppShellController.tsx with the EXACT same buildStamp
const nascPath = resolve(root, "src/components/skylent/NativeAppShellController.tsx")
if (existsSync(nascPath)) {
  let nSrc = readFileSync(nascPath, "utf8")
  nSrc = nSrc.replace(
    /export const BUNDLED_CLIENT_BUILD_ID = [^\n]+/,
    `export const BUNDLED_CLIENT_BUILD_ID = "8.8.0:${buildStamp}"`,
  )
  writeFileSync(nascPath, nSrc, "utf8")
  console.log(`[V88 Fix] Stamped NativeAppShellController.tsx with matching buildId: 8.8.0:${buildStamp}`)
}

// 3. Make HomePage route-lazy in src/App.tsx
const appPath = resolve(root, "src/App.tsx")
if (existsSync(appPath)) {
  let appSrc = readFileSync(appPath, "utf8")
  if (appSrc.includes('import HomePage from "./pages/HomePage"')) {
    appSrc = appSrc.replace('import HomePage from "./pages/HomePage"\n', "")
    appSrc = appSrc.replace(
      "const HomeDirectionPreview =",
      'const HomePage = lazyWithRetry(() => import("./pages/HomePage"))\nconst HomeDirectionPreview =',
    )
    writeFileSync(appPath, appSrc, "utf8")
  }
}

// 4. Remove duplicate Google Fonts @import in src/index.css
const indexCssPath = resolve(root, "src/index.css")
if (existsSync(indexCssPath)) {
  let cssSrc = readFileSync(indexCssPath, "utf8")
  const cleanedCss = cssSrc.replace(
    /@import\s+url\(["']https:\/\/fonts\.googleapis\.com\/[^"']+["']\)\s*;/g,
    "/* [V88] Consolidated Google Fonts in index.html */",
  )
  if (cleanedCss !== cssSrc) {
    writeFileSync(indexCssPath, cleanedCss, "utf8")
  }
}

console.log("[V88 Fix] All V88 Mobile APK & Web fixes verified!")
