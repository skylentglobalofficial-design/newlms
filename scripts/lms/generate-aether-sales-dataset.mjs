/**
 * Generate synthetic curriculum dataset for data-analytics l13.
 * Phase 10 contract: skylent_aether_home_goods_sales_v1
 * Deterministic seeded PRNG — reproducible totals, no PII.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import * as XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, "../../content/lms/data-analytics/l13")
const OUT_FILE = path.join(OUT_DIR, "skylent_aether_home_goods_sales_v1.xlsx")
const REPORT_FILE = path.join(OUT_DIR, "dataset-validation.json")

/** Mulberry32 deterministic PRNG */
function mulberry32(seed) {
  let t = seed >>> 0
  return function next() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)]
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

function main() {
  const rand = mulberry32(0xa37e10 /* Aether */)

  const dim_region = [
    { region_id: "R-NORTH", region_name: "North", channel: "Retail" },
    { region_id: "R-SOUTH", region_name: "South", channel: "Retail" },
    { region_id: "R-EAST", region_name: "East", channel: "Online" },
    { region_id: "R-WEST", region_name: "West", channel: "Online" },
  ]

  const categories = ["Furniture", "Kitchen", "Decor", "Storage"]
  // Soft categories in H2: Decor + Storage get lower H2 volume multipliers
  const dim_product = []
  const productNames = {
    Furniture: ["Cedar Shelf Unit", "Oak Side Table", "Lounge Armchair", "Bedside Chest"],
    Kitchen: ["Stoneware Bowl Set", "Cast Iron Skillet", "Bamboo Cutting Board", "Glass Canister Trio"],
    Decor: ["Linen Cushion Cover", "Ceramic Vase", "Wall Mirror Round", "Woven Basket"],
    Storage: ["Underbed Bin", "Labelled Cube Set", "Utility Cart", "Closet Divider Pack"],
  }
  let p = 1
  for (const category of categories) {
    for (const name of productNames[category]) {
      const unit_cost = Math.round(400 + rand() * 4600)
      dim_product.push({
        product_id: `P-${String(p).padStart(3, "0")}`,
        product_name: name,
        category,
        unit_cost,
      })
      p += 1
    }
  }

  // Uneven region mix weights
  const regionWeights = [
    { id: "R-NORTH", w: 0.32 },
    { id: "R-SOUTH", w: 0.28 },
    { id: "R-EAST", w: 0.22 },
    { id: "R-WEST", w: 0.18 },
  ]

  function weightedRegion() {
    const x = rand()
    let acc = 0
    for (const r of regionWeights) {
      acc += r.w
      if (x <= acc) return r.id
    }
    return "R-WEST"
  }

  function monthVolumeMultiplier(month, category) {
    // Base seasonality: mild Q4 lift
    let m = 1
    if (month >= 10) m *= 1.18
    if (month <= 2) m *= 0.92
    // Softer H2 for Decor + Storage
    if (month >= 7 && (category === "Decor" || category === "Storage")) m *= 0.72
    return m
  }

  const TARGET_LINES = 3000
  const fact_orders = []
  let lineSeq = 1
  let orderSeq = 1

  // Generate ~TARGET_LINES across 12 months with status mix 5–12% non-completed
  while (fact_orders.length < TARGET_LINES) {
    const month = 1 + Math.floor(rand() * 12)
    const day = 1 + Math.floor(rand() * daysInMonth(2024, month))
    const product = pick(rand, dim_product)
    const volumeBump = monthVolumeMultiplier(month, product.category)
    // Skip some draws to shape volume by multiplier
    if (rand() > Math.min(0.98, 0.55 * volumeBump)) continue

    const region_id = weightedRegion()
    const linesInOrder = 1 + (rand() < 0.35 ? 1 : 0) + (rand() < 0.12 ? 1 : 0)
    const order_id = `O-2024-${String(orderSeq).padStart(5, "0")}`
    orderSeq += 1
    const order_date = isoDate(2024, month, day)

    // Status: ~8% cancelled/returned overall
    const statusRoll = rand()
    const order_status = statusRoll < 0.05 ? "Cancelled" : statusRoll < 0.09 ? "Returned" : "Completed"

    for (let i = 0; i < linesInOrder && fact_orders.length < TARGET_LINES; i++) {
      const prod = i === 0 ? product : pick(rand, dim_product)
      const markup = 1.35 + rand() * 0.9
      const unit_price = Math.round(prod.unit_cost * markup)
      const quantity = 1 + Math.floor(rand() * 4)
      const discount_pct = Number((rand() < 0.4 ? rand() * 0.25 : 0).toFixed(2))
      fact_orders.push({
        order_line_id: `OL-${String(lineSeq).padStart(6, "0")}`,
        order_id,
        order_date,
        region_id,
        product_id: prod.product_id,
        quantity,
        unit_price,
        discount_pct,
        order_status,
      })
      lineSeq += 1
    }
  }

  // Validation
  const regionIds = new Set(dim_region.map((r) => r.region_id))
  const productIds = new Set(dim_product.map((p) => p.product_id))
  const lineIds = new Set()
  let dupLines = 0
  let badFk = 0
  let nullish = 0
  let outOfRangeDate = 0
  let badDiscount = 0
  let badQty = 0
  let completed = 0
  let returned = 0
  let cancelled = 0
  let netRevenue = 0
  const monthRev = {}
  const regionRev = {}
  const categoryRev = {}

  for (const row of fact_orders) {
    if (lineIds.has(row.order_line_id)) dupLines += 1
    lineIds.add(row.order_line_id)
    if (!regionIds.has(row.region_id) || !productIds.has(row.product_id)) badFk += 1
    if (!row.order_line_id || !row.order_id || !row.order_date) nullish += 1
    if (row.order_date < "2024-01-01" || row.order_date > "2024-12-31") outOfRangeDate += 1
    if (row.discount_pct < 0 || row.discount_pct > 0.3) badDiscount += 1
    if (row.quantity < 1) badQty += 1
    if (row.order_status === "Completed") {
      completed += 1
      const rev = row.quantity * row.unit_price * (1 - row.discount_pct)
      netRevenue += rev
      const month = row.order_date.slice(0, 7)
      monthRev[month] = (monthRev[month] || 0) + rev
      regionRev[row.region_id] = (regionRev[row.region_id] || 0) + rev
      const cat = dim_product.find((p) => p.product_id === row.product_id)?.category
      if (cat) categoryRev[cat] = (categoryRev[cat] || 0) + rev
    } else if (row.order_status === "Returned") returned += 1
    else if (row.order_status === "Cancelled") cancelled += 1
  }

  const nonCompletedPct = ((returned + cancelled) / fact_orders.length) * 100
  const validation = {
    generatedAt: new Date().toISOString(),
    fileName: "skylent_aether_home_goods_sales_v1.xlsx",
    honesty: "Synthetic / fictional Skylent curriculum data",
    counts: {
      dim_region: dim_region.length,
      dim_product: dim_product.length,
      fact_orders: fact_orders.length,
    },
    integrity: {
      duplicatePrimaryKeys: dupLines,
      foreignKeyViolations: badFk,
      nullishKeys: nullish,
      outOfRangeDates: outOfRangeDate,
      badDiscounts: badDiscount,
      badQuantities: badQty,
    },
    statusDistribution: {
      Completed: completed,
      Returned: returned,
      Cancelled: cancelled,
      nonCompletedPct: Number(nonCompletedPct.toFixed(2)),
    },
    netRevenueCompletedInr: Math.round(netRevenue),
    monthRevenueSample: Object.fromEntries(Object.entries(monthRev).sort().map(([k, v]) => [k, Math.round(v)])),
    regionRevenue: Object.fromEntries(Object.entries(regionRev).map(([k, v]) => [k, Math.round(v)])),
    categoryRevenue: Object.fromEntries(Object.entries(categoryRev).map(([k, v]) => [k, Math.round(v)])),
    passed:
      dupLines === 0 &&
      badFk === 0 &&
      nullish === 0 &&
      outOfRangeDate === 0 &&
      badDiscount === 0 &&
      badQty === 0 &&
      fact_orders.length >= 2400 &&
      fact_orders.length <= 3600 &&
      nonCompletedPct >= 5 &&
      nonCompletedPct <= 12,
  }

  if (!validation.passed) {
    console.error("Dataset validation FAILED", validation)
    process.exit(1)
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dim_region), "dim_region")
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dim_product), "dim_product")
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fact_orders), "fact_orders")
  fs.mkdirSync(OUT_DIR, { recursive: true })
  XLSX.writeFile(wb, OUT_FILE)
  fs.writeFileSync(REPORT_FILE, JSON.stringify(validation, null, 2))
  console.log("Wrote", OUT_FILE)
  console.log("Validation", JSON.stringify(validation, null, 2))
}

main()
