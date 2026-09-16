import { readFileSync } from "node:fs"
import { courses } from "../src/data.ts"
import {
  AUTHORED_COURSE_SLUG,
  capabilitiesForIntent,
  isLearnIntentId,
  liveMatchesForIntent,
} from "../src/lib/live-intents.ts"

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
assert(
  software.every((row) => row.depth === "listing"),
  "Build software matches are catalogue listings, not the authored Data Analytics course",
)

const data = liveMatchesForIntent("data")
assert(data[0]?.slug === AUTHORED_COURSE_SLUG, "Work with data must lead with Data Analytics")
assert(data[0]?.kind === "course", "Data Analytics must be the course route, not a programme")
assert(data[0]?.to === "/courses/data-analytics", "Data Analytics must link to /courses/data-analytics")
assert(data[0]?.depth === "authored", "Data Analytics is the authored course for Work with data")
assert(data[0]?.actionLabel === "Start with this course", "Data Analytics CTA must be Start with this course")
assert(
  data.some((row) => /python for data/i.test(row.title)),
  "Work with data should include Python for Data Science",
)
assert(
  data.every((row) => !/full.?stack/i.test(row.title)),
  "Work with data must not list full-stack products",
)
assert(
  data.filter((row) => row.depth === "authored").every((row) => row.slug === AUTHORED_COURSE_SLUG),
  "Only Data Analytics may be marked authored under Work with data",
)

const python = data.find((row) => /python for data/i.test(row.title))
assert(python?.depth === "listing", "Python for Data Science must stay a thin catalogue listing")
assert(python?.to === "/courses/python-programming", "Python listing must use its real course route")

const product = liveMatchesForIntent("product")
assert(product.length > 0, "Shape products should have live matches")
assert(
  product.every((row) => /product/i.test(row.title)),
  "Shape products matches must be product catalogue rows",
)
assert(product[0]?.slug === "product-management", "Shape products must lead with Product Management")
assert(product[0]?.depth === "authored", "Product Management is the authored course for Shape products")
assert(product[0]?.actionLabel === "Start with this course", "Product Management CTA must be Start with this course")
assert(
  product.filter((row) => row.depth === "authored").every((row) => row.slug === "product-management"),
  "Only Product Management may be marked authored under Shape products",
)

const ai = liveMatchesForIntent("ai")
assert(
  ai.some((row) => /generative/i.test(row.title)),
  "Work with AI should include Generative AI",
)
assert(
  ai.every((row) => row.depth === "listing"),
  "Work with AI matches are catalogue listings, not authored Data Analytics",
)

const flagship = courses.find((course) => course.slug === AUTHORED_COURSE_SLUG)
assert(flagship, "Data Analytics must exist in the static catalogue")
const pm = courses.find((course) => course.slug === "product-management")
assert(pm, "Product Management must exist in the static catalogue")

for (const id of ["data", "software", "ai", "product"] as const) {
  const matches = liveMatchesForIntent(id)
  assert(matches.length <= 4, `${id} must not return more than four live matches`)
  for (const row of matches) {
    assert(row.duration.length > 0, `${id}:${row.slug} must include a catalogue duration`)
    assert(row.availability.length > 0, `${id}:${row.slug} must include availability`)
    assert(row.capability.length > 0, `${id}:${row.slug} must include a catalogue capability`)
    assert(row.capabilities.includes(row.capability), `${id}:${row.slug} capability must come from its curriculum list`)
    assert(row.summary.length > 0, `${id}:${row.slug} must include catalogue summary copy`)
    assert(row.to.startsWith(row.kind === "programme" ? "/programs/" : "/courses/"), `${id}:${row.slug} route must match kind`)
    if (row.kind === "programme") {
      assert(row.actionLabel === "View programme", `${id}:${row.slug} programme CTA must be View programme`)
      assert(row.depth === "listing", `${id}:${row.slug} programmes are not authored courses`)
    } else if (row.depth === "authored") {
      assert(row.actionLabel === "Start with this course", `${id}:${row.slug} authored CTA must be Start with this course`)
    } else {
      assert(row.actionLabel === "View course", `${id}:${row.slug} listing CTA must be View course`)
    }
    assert(!/%\s*match/i.test(`${row.title} ${row.summary} ${row.note}`), `${id}:${row.slug} must not invent a match score`)
    assert(!/recommended for you|best course for you/i.test(`${row.title} ${row.summary}`), `${id}:${row.slug} must not fake personalisation`)
    assert(!/placement|job guarantee|certificate/i.test(`${row.note} ${row.availability}`), `${id}:${row.slug} Skills labels must not claim placement or certificates`)
  }

  const allowed = new Set(matches.flatMap((row) => row.capabilities))
  const capabilities = capabilitiesForIntent(id)
  assert(capabilities.length > 0, `${id} should expose live capabilities`)
  assert(capabilities.length <= 4, `${id} capability list must stay concise`)
  for (const statement of capabilities) {
    assert(allowed.has(statement), `${id} capability is not from matched catalogue rows: ${statement}`)
  }
}

const dataCaps = capabilitiesForIntent("data")
assert(
  dataCaps.every((statement) => flagship!.outcomes.includes(statement)),
  "Work with data capabilities must come from Data Analytics outcomes, not programme marketing",
)
assert(
  dataCaps.every((statement) => !/generative ai|langchain|deep learning|neural network/i.test(statement)),
  "Work with data must not advertise untaught Gen AI or ML capabilities",
)

const softwareCaps = capabilitiesForIntent("software")
assert(
  softwareCaps.every((statement) => !/pandas|python for data|power bi/i.test(statement)),
  "Build software capabilities must not be taken from data-science catalogue rows",
)

const productCaps = capabilitiesForIntent("product")
assert(
  productCaps.every((statement) => pm!.outcomes.includes(statement)),
  "Shape products capabilities must come from Product Management outcomes",
)
assert(
  productCaps.every((statement) => !/sql|power bi|python|machine learning/i.test(statement)),
  "Shape products must not advertise untaught analytics or ML capabilities",
)
assert(isLearnIntentId("data") && isLearnIntentId("software") && isLearnIntentId("ai") && isLearnIntentId("product"), "supported intents must parse")
assert(!isLearnIntentId("design") && !isLearnIntentId("create"), "Skills must not invent unsupported intents")

const skillsSource = readFileSync(new URL("../src/pages/SkillsPage.tsx", import.meta.url), "utf8")
assert(
  !/Taken from the Data Analytics course outcomes/.test(skillsSource),
  "Skills must attribute authored outcomes to the matched course, not only Data Analytics",
)
assert(/ready\.map\(\(match\) => match\.title\)/.test(skillsSource), "Skills authored attribution must use match titles")

console.log("live-intents ok")
console.log({
  software: titles("software"),
  data: titles("data"),
  ai: titles("ai"),
  product: titles("product"),
  productCaps,
})
