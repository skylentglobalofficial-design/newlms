import { liveMatchesForIntent } from "../src/lib/live-intents.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function titles(id: Parameters<typeof liveMatchesForIntent>[0]) {
  return liveMatchesForIntent(id).map((row) => `${row.kind}:${row.slug}:${row.title}`)
}

const software = liveMatchesForIntent("software")
assert(
  software.some((row) => /full.?stack/i.test(row.title)),
  "Build software should include a live full-stack course or programme",
)
assert(
  software.every((row) => !/python for data/i.test(row.title)),
  "Build software must not list Python for Data Science",
)
assert(
  software.every((row) => row.kind !== "programme" || row.note === "Open programme"),
  "Programme matches must be open",
)

const data = liveMatchesForIntent("data")
assert(
  data.some((row) => row.slug === "data-analytics" || row.slug === "data-analytics-pro"),
  "Work with data should include Data Analytics",
)
assert(
  data.some((row) => /python for data/i.test(row.title)),
  "Work with data should include Python for Data Science",
)
assert(
  data.every((row) => !/full.?stack/i.test(row.title)),
  "Work with data must not list full-stack products",
)

const product = liveMatchesForIntent("product")
assert(product.length > 0, "Shape products should have live matches")
assert(
  product.every((row) => /product/i.test(row.title)),
  "Shape products matches must be product catalogue rows",
)

const ai = liveMatchesForIntent("ai")
assert(
  ai.some((row) => /generative/i.test(row.title)),
  "Work with AI should include Generative AI",
)

console.log("live-intents ok")
console.log({ software: titles("software"), data: titles("data"), ai: titles("ai"), product: titles("product") })
