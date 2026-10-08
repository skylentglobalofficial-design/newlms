/**
 * Checks the product manifest against the app and truth.ts. No database, no network.
 *   tsx scripts/test-product-manifest.ts
 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  CAREER_OS_FEATURES,
  CAREER_OS_NAV,
  LESSON_AI,
  PRODUCT_AREAS,
  SKYLENT_AI_FEATURES,
  publicFeatures,
  type ProductFeature,
} from "../src/lib/product-manifest.ts"
import { TRUTH, truthOf } from "../src/lib/truth.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
let checks = 0
function check(condition: unknown, message: string): void {
  checks += 1
  assert.ok(condition, message)
}

/* ── Routes declared in src/App.tsx, with nested <Route> children joined to their parent ── */
function appRoutes(): Set<string> {
  const source = readFileSync(join(root, "src/App.tsx"), "utf8")
  const routes = new Set<string>()
  const stack: string[] = []
  let i = 0
  while (i < source.length) {
    if (source.startsWith("</Route>", i)) {
      stack.pop()
      i += 8
      continue
    }
    if (!/^<Route[\s/>]/.test(source.slice(i, i + 7))) {
      i += 1
      continue
    }
    // Read the opening tag, skipping JSX expressions in braces (element={<Page />}).
    let j = i + 6
    let depth = 0
    while (j < source.length) {
      const ch = source[j]
      if (ch === "{") depth += 1
      else if (ch === "}") depth -= 1
      else if (ch === ">" && depth === 0) break
      j += 1
    }
    const attrs = source.slice(i + 6, j)
    const selfClosing = attrs.trimEnd().endsWith("/")
    const outer = attrs.replace(/\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, "")
    const path = outer.match(/\bpath="([^"]+)"/)?.[1]
    const parent = stack[stack.length - 1] ?? ""
    let full = parent
    if (path) full = path.startsWith("/") ? path : `${parent.replace(/\/$/, "")}/${path}`
    if (path || /\bindex\b/.test(outer)) routes.add(full || "/")
    if (!selfClosing) stack.push(full)
    i = j + 1
  }
  return routes
}

const routes = appRoutes()
check(routes.has("/") && routes.has("/career-os") && routes.has("/career-os/profile"), "App.tsx route parser found the expected routes")

const areaFeatures: ProductFeature[] = PRODUCT_AREAS.flatMap((area) => [...area.features])

for (const area of PRODUCT_AREAS) {
  check(routes.has(area.route), `area ${area.id}: route ${area.route} is not in src/App.tsx`)
}
for (const item of areaFeatures) {
  if (item.route !== null) check(routes.has(item.route), `${item.id}: route ${item.route} is not in src/App.tsx`)
}
for (const item of CAREER_OS_NAV) {
  check(routes.has(item.route), `nav ${item.id}: route ${item.route} is not in src/App.tsx`)
}

/* ── Status comes from truth.ts and nothing else ── */
for (const item of areaFeatures) {
  check(item.capability in TRUTH, `${item.id}: capability ${item.capability} is not in truth.ts`)
  check(item.status === truthOf(item.capability), `${item.id}: status ${item.status} differs from truthOf(${item.capability})`)
  check(["live", "development", "soon", "sample"].includes(item.status), `${item.id}: status ${item.status} is not a product state`)
  if (item.publicSafe && item.status === "live") {
    check(TRUTH[item.capability].state === "live", `${item.id}: public and live, but truth.ts does not say live`)
  }
}

/* ── Ids unique within each area and across the manifest ── */
for (const area of PRODUCT_AREAS) {
  const ids = area.features.map((item) => item.id)
  check(new Set(ids).size === ids.length, `area ${area.id}: duplicate feature ids`)
}
check(new Set(PRODUCT_AREAS.map((area) => area.id)).size === PRODUCT_AREAS.length, "duplicate area ids")
check(new Set(CAREER_OS_NAV.map((item) => item.id)).size === CAREER_OS_NAV.length, "duplicate nav ids")
check(new Set(LESSON_AI.modes.map((mode) => mode.id)).size === LESSON_AI.modes.length, "duplicate Skylent AI modes")

/* ── Career OS architecture order ── */
const order = ["profile", "skills", "projects", "evidence", "certificates", "opportunities", "next-step"]
const positions = order.map((id) => CAREER_OS_FEATURES.findIndex((item) => item.id === id))
check(positions.every((pos) => pos >= 0), "Career OS is missing an architecture step")
check(positions.every((pos, i) => i === 0 || pos > positions[i - 1]), "Career OS order must be Profile → Skills → Projects → Evidence → Certificates → Opportunities → Next step")

/* ── Public specimens never carry learner data or invented numbers ── */
const FORBIDDEN = /\d+\s*%|\bscore\b|\bmatch(ed)?\b|salary|₹|\$\s*\d|\bLPA\b|ready to (apply|hire)/i
for (const item of publicFeatures(areaFeatures)) {
  const spec = item.specimen
  if (!spec) continue
  const text = [spec.example, spec.empty, spec.action].filter(Boolean).join(" ")
  check(!FORBIDDEN.test(text), `${item.id}: specimen contains a number, score, match or salary: "${text}"`)
  check(!/\d/.test(spec.example ?? ""), `${item.id}: specimen example must not contain a number`)
  if (spec.example) check(item.status === "live", `${item.id}: only a live feature may show an example value`)
}
for (const item of CAREER_OS_FEATURES) {
  if (item.id === "readiness") check(!item.publicSafe, "readiness must not be drawn on public pages")
}

/* ── Skylent AI: no feature claims more than truth.ts ── */
for (const item of SKYLENT_AI_FEATURES) check(!/\bReva\b/.test(`${item.label} ${item.summary}`), `${item.id}: user-facing text says Reva`)
check(LESSON_AI.modes.map((mode) => mode.id).join(",") === "ask,explain,example,quiz,practice", "Skylent AI modes must match AiAction on the server")
const types = readFileSync(join(root, "server/src/lib/skylent-ai/types.ts"), "utf8")
check(/export type AiAction = "ask" \| "explain" \| "example" \| "quiz" \| "practice"/.test(types), "server AiAction changed; update LESSON_AI.modes")
check(/basedOn: string[\s\S]*related: string \| null/.test(types), "server AiAskResult changed; update LESSON_AI.answerShape")

console.log(`test-product-manifest: ${checks} checks passed (${areaFeatures.length} features, ${routes.size} routes)`)
