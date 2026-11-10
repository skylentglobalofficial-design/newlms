/**
 * V74 Complete Surgical Patcher
 * 1. Fixes server/src/routes/payments.ts TypeScript errors (auth?.user?.role / UserRole) so `npm run backend:build` compiles with 0 errors.
 * 2. Stamps server/src/routes/health.ts with a fresh DEPLOYED_BUILD_ID so every `git push origin main` automatically triggers the In-App Update banner in installed APKs.
 * 3. Aligns src/pages/CheckoutPage.tsx and PayU backend routes with unified 3-Plan pricing (₹1,499 / ₹3,499 / ₹6,499), single-step tier lock, removal of public SKYLENT10 freebie pill, and in-dashboard PayU cancel return.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()

// 1. Stamp server/src/routes/health.ts with fresh DEPLOYED_BUILD_ID so installed APKs detect every git push!
const healthPath = resolve(root, "server/src/routes/health.ts")
if (existsSync(healthPath)) {
  const buildStamp = `v74-${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12)}`
  let hSrc = readFileSync(healthPath, "utf8")
  hSrc = hSrc.replace(
    /export const DEPLOYED_BUILD_ID = "[^"]*"/,
    `export const DEPLOYED_BUILD_ID = "${buildStamp}"`,
  )
  writeFileSync(healthPath, hSrc, "utf8")
  console.log(`[V74 Fix] ✓ Stamped server/src/routes/health.ts with live OTA buildId: ${buildStamp} (APK will auto-prompt Update Now on push!)`)
}

// 2. Patch src/pages/CheckoutPage.tsx if present
const checkoutPath = resolve(root, "src/pages/CheckoutPage.tsx")
if (existsSync(checkoutPath)) {
  let src = readFileSync(checkoutPath, "utf8")

  // Unify prices: 2099 -> 1499, 4999 -> 3499, 7999 -> 6499
  src = src
    .replace(/\b2099\b/g, "1499")
    .replace(/2,099/g, "1,499")
    .replace(/\b4198\b/g, "2998")
    .replace(/4,198/g, "2,998")
    .replace(/\b4999\b/g, "3499")
    .replace(/4,999/g, "3,499")
    .replace(/\b9998\b/g, "6998")
    .replace(/9,998/g, "6,998")
    .replace(/\b7999\b/g, "6499")
    .replace(/7,999/g, "6,499")
    .replace(/\b15998\b/g, "12998")
    .replace(/15,998/g, "12,998")

  // Remove public "Available Offers: SKYLENT10 (10% OFF)" freebie button/pill
  src = src.replace(/Available Offers:\s*/gi, "")
  src = src.replace(/<button[^>]*>[\s\S]*?SKYLENT10\s*\(10%\s*OFF\)[\s\S]*?<\/button>/gi, "")

  // Ensure initial tier state respects URL ?price=1499|3499|6499 and ?tier=basic|flagship|pro|professional
  src = src.replace(
    /const\s+\[selectedTier,\s*setSelectedTier\]\s*=\s*useState<[^>]+>\([^)]*\)/,
    `const [selectedTier, setSelectedTier] = useState<any>(() => {
    const p = Number(searchParams.get("price") || 0)
    const t = (searchParams.get("tier") || "").toLowerCase()
    if (p === 6499 || t === "pro" || t === "tier3") return "flagship"
    if (p === 3499 || t === "flagship" || t === "professional" || t === "tier2") return "professional"
    if (p === 1499 || t === "basic" || t === "tier1") return "basic"
    return "professional"
  })`,
  )

  writeFileSync(checkoutPath, src, "utf8")
  console.log("[V74 Fix] ✓ Patched src/pages/CheckoutPage.tsx (Unified ₹1,499 / ₹3,499 / ₹6,499 prices, removed public SKYLENT10 freebie pill, locked selected tier)")
}

// 3. Patch server/src/routes/*.ts for TypeScript build error in payments.ts + PayU cancel redirect & unified tier prices
const routesDir = resolve(root, "server/src/routes")
if (existsSync(routesDir)) {
  for (const name of readdirSync(routesDir)) {
    if (!name.endsWith(".ts")) continue
    const filePath = resolve(routesDir, name)
    let content = readFileSync(filePath, "utf8")
    let changed = false

    // Fix TS2339 (auth?.user?.role) and TS2304 (UserRole) in server/src/routes/payments.ts
    if (content.includes("UserRole.ADMIN") || content.includes("UserRole.SUPERADMIN") || content.includes("auth?.user?.role")) {
      const nextTs = content
        .replace(
          /auth\?\.user\?\.role\s*===\s*UserRole\.ADMIN/g,
          '(auth?.roles?.includes("ADMIN" as any) || (auth?.user as any)?.role === "ADMIN")',
        )
        .replace(
          /auth\?\.user\?\.role\s*===\s*UserRole\.SUPERADMIN/g,
          '(auth?.roles?.includes("SUPERADMIN" as any) || (auth?.user as any)?.role === "SUPERADMIN")',
        )
        .replace(/UserRole\.ADMIN/g, '"ADMIN"')
        .replace(/UserRole\.SUPERADMIN/g, '"SUPERADMIN"')
      if (nextTs !== content) {
        content = nextTs
        changed = true
      }
    }

    if (content.includes("payment=failed") || content.includes("secure.payu.in") || content.includes("payu")) {
      const next = content
        .replace(/\/courses\/\$\{[^}]+\}\?payment=failed/g, "/dashboard/student?payment=cancelled#explore-programmes")
        .replace(/\/programmes\/\$\{[^}]+\}\?payment=failed/g, "/dashboard/student?payment=cancelled#explore-programmes")
        .replace(/\b2099\b/g, "1499")
        .replace(/\b4999\b/g, "3499")
        .replace(/\b7999\b/g, "6499")
      if (next !== content) {
        content = next
        changed = true
      }
    }

    if (changed) {
      writeFileSync(filePath, content, "utf8")
      console.log(`[V74 Fix] ✓ Patched server/src/routes/${name} (Fixed TypeScript UserRole/auth.roles build error + PayU cancel return & tier prices)`)
    }
  }
}
