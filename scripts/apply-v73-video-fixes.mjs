/**
 * V73 Surgical Video Audit Patcher
 * Runs automatically before build to align v71's CheckoutPage.tsx and PayU backend routes
 * with the unified 3-Plan pricing (₹1,499 / ₹3,499 / ₹6,499), single-step plan lock,
 * removal of public SKYLENT10 freebie pill, and in-dashboard PayU cancel return.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()

// 1. Patch src/pages/CheckoutPage.tsx if present
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
  console.log("[V73 Fix] ✓ Patched src/pages/CheckoutPage.tsx (Unified ₹1,499 / ₹3,499 / ₹6,499 prices, removed public SKYLENT10 freebie pill, locked selected tier)")
}

// 2. Patch server/src/routes/*.ts for PayU cancel redirect & unified tier prices
const routesDir = resolve(root, "server/src/routes")
if (existsSync(routesDir)) {
  for (const name of readdirSync(routesDir)) {
    if (!name.endsWith(".ts")) continue
    const filePath = resolve(routesDir, name)
    let content = readFileSync(filePath, "utf8")
    let changed = false

    if (content.includes("payment=failed") || content.includes("secure.payu.in") || content.includes("payu")) {
      const next = content
        // Redirect PayU cancel/failure back into the Student Dashboard Explore Programmes view instead of public /courses/:slug?payment=failed
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
      console.log(`[V73 Fix] ✓ Patched server/src/routes/${name} (PayU cancel returns to /dashboard/student#explore-programmes & unified tier prices)`)
    }
  }
}
