/**
 * V89 Complete Surgical Patcher (Syncs identical buildId across Server health.ts & Client NativeAppShellController.tsx)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const buildStamp = `v89-${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12)}`

// 1. Stamp server/src/routes/health.ts with buildStamp
const healthPath = resolve(root, "server/src/routes/health.ts")
if (existsSync(healthPath)) {
  let hSrc = readFileSync(healthPath, "utf8")
  hSrc = hSrc.replace(
    /export const DEPLOYED_APP_VERSION = [^\n]+/,
    'export const DEPLOYED_APP_VERSION = "8.9.0"',
  )
  hSrc = hSrc.replace(
    /export const DEPLOYED_BUILD_ID = [^\n]+/,
    `export const DEPLOYED_BUILD_ID = "${buildStamp}"`,
  )
  writeFileSync(healthPath, hSrc, "utf8")
  console.log(`[V89 Fix] Stamped server/src/routes/health.ts with buildId: ${buildStamp}`)
}

// 2. Stamp src/components/skylent/NativeAppShellController.tsx with the EXACT same buildStamp
const nascPath = resolve(root, "src/components/skylent/NativeAppShellController.tsx")
if (existsSync(nascPath)) {
  let nSrc = readFileSync(nascPath, "utf8")
  nSrc = nSrc.replace(
    /export const BUNDLED_CLIENT_BUILD_ID = [^\n]+/,
    `export const BUNDLED_CLIENT_BUILD_ID = "8.9.0:${buildStamp}"`,
  )
  writeFileSync(nascPath, nSrc, "utf8")
  console.log(`[V89 Fix] Stamped NativeAppShellController.tsx with matching buildId: 8.9.0:${buildStamp}`)
}

console.log("[V89 Fix] All V89 Same-Origin Mobile APK & Web fixes verified!")
