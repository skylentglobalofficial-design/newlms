import { catalogueOrSamples, degreesFromPublicPayload, mergeDegreeCatalogues } from "../src/lib/degree-catalogue.ts"
import { listDegrees, type Degree } from "../src/lib/degrees.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const published = degreesFromPublicPayload({
  data: [
    {
      slug: "confirmed-computing",
      title: "BSc Computing",
      level: "UNDERGRADUATE",
      deliveryMode: "ONLINE",
      discipline: "Computing",
      status: "PUBLISHED",
      sample: false,
      duration: "3 years",
      intake: null,
      skills: ["SQL", ""],
      careerRoles: [],
      institution: { slug: "harbor", name: "Harbor Institute", verified: true, logoUrl: null },
    },
    {
      slug: "draft-hidden",
      title: "Hidden",
      level: "UNDERGRADUATE",
      deliveryMode: "CAMPUS",
      discipline: "Business",
      status: "DRAFT",
      sample: false,
    },
    { slug: "broken" },
  ],
})

assert(published.length === 1, "Only a complete published row is listed")
assert(published[0].sample === false, "A published degree keeps its sample flag")
assert(published[0].institution?.name === "Harbor Institute", "Institution name comes from the API")
assert(published[0].status === "open", "A published degree is open in the page model")
assert(published[0].skills?.join() === "SQL", "Blank skills are dropped")
assert(published[0].duration === "3 years", "Duration is kept when the API sends it")

assert(degreesFromPublicPayload({ data: [] }).length === 0, "An empty catalogue adds nothing")
assert(degreesFromPublicPayload(null).length === 0, "An unreadable payload adds nothing")
assert(degreesFromPublicPayload({ error: "unavailable" }).length === 0, "An error body adds nothing")

const samples = listDegrees()
assert(catalogueOrSamples([]).length === samples.length, "No published rows leaves the sample listings")
const merged = mergeDegreeCatalogues(samples, published)
assert(merged.length === samples.length + 1, "A new published degree is added beside the samples")
assert(merged.some((degree) => degree.slug === "confirmed-computing"), "The published degree is present")
assert(merged.some((degree) => degree.sample), "Sample listings remain")

const replacement: Degree = { ...published[0], slug: samples[0].slug, title: "Published title" }
const replaced = mergeDegreeCatalogues(samples, [replacement])
assert(replaced.length === samples.length, "The same slug does not create a second listing")
assert(replaced[0].title === "Published title", "A published row replaces the sample with the same slug")

console.log("Degree catalogue checks passed.")
