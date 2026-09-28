import { buildRoadmap, classifyPathTrack } from "../src/lib/path/buildRoadmap.ts"
import type { PathDiagnosis } from "../src/lib/path/types.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function baseDiagnosis(overrides: Partial<PathDiagnosis>): PathDiagnosis {
  return {
    academicBackground: "college",
    currentEducation: "undergraduate",
    interests: [],
    existingSkills: "some_exposure",
    careerDirection: "professional_role",
    strengths: "",
    gaps: [],
    gapDetail: "",
    directionDetail: "",
    targetOutcome: "land_first_role",
    timeline: "six_months",
    completedAt: new Date(0).toISOString(),
    ...overrides,
  }
}

const dataDiag = baseDiagnosis({
  interests: ["data_analytics"],
  directionDetail: "junior data analyst",
  careerDirection: "technical_specialist",
})

const productDiag = baseDiagnosis({
  interests: ["product"],
  directionDetail: "product manager",
  careerDirection: "build_company",
})

const examDiag = baseDiagnosis({
  interests: ["competitive_exams"],
  directionDetail: "CAT 2027",
  careerDirection: "exam_path",
  targetOutcome: "pass_exam",
})

const designDiag = baseDiagnosis({
  interests: ["design"],
  directionDetail: "UI/UX portfolio",
  targetOutcome: "credible_portfolio",
})

const techDiag = baseDiagnosis({
  interests: ["technology", "engineering"],
  directionDetail: "backend developer",
  careerDirection: "professional_role",
})

const undecidedDiag = baseDiagnosis({
  interests: ["still_exploring"],
  careerDirection: "clarify_direction",
  targetOutcome: "decide_next_step",
})

assert(classifyPathTrack(dataDiag) === "data_analytics", "data interest → data_analytics track")
assert(classifyPathTrack(examDiag) === "competitive_exams", "exam signals → competitive_exams track")
assert(classifyPathTrack(designDiag) === "design_creative", "design interest → design_creative track")
assert(classifyPathTrack(productDiag) === "product_business", "product interest → product_business track")
assert(classifyPathTrack(techDiag) === "technology_professional", "tech/engineering → technology_professional track")
assert(classifyPathTrack(undecidedDiag) === "general_undecided", "exploring → general_undecided track")

const dataRoadmap = buildRoadmap(dataDiag)
assert(
  dataRoadmap.suggestedProgrammeSlugs.includes("data-analytics-pro"),
  "data track suggests data-analytics-pro",
)
assert(
  !dataRoadmap.suggestedProgrammeSlugs.includes("product-management"),
  "data-only diagnosis must not default to product-management",
)

const productRoadmap = buildRoadmap(productDiag)
assert(
  productRoadmap.suggestedProgrammeSlugs.includes("product-management"),
  "product track suggests product-management",
)

const examRoadmap = buildRoadmap(examDiag)
assert(examRoadmap.suggestedProgrammeSlugs.length === 0, "exam track suggests no catalogue programmes")
assert(
  examRoadmap.foundation.summary.toLowerCase().includes("syllabus") ||
    examRoadmap.foundation.actions.some((a) => /syllabus|exam/i.test(a)),
  "exam foundation references syllabus/exam",
)

const designRoadmap = buildRoadmap(designDiag)
assert(designRoadmap.suggestedProgrammeSlugs.length === 0, "design track suggests no invented programmes")
assert(
  designRoadmap.build.summary.toLowerCase().includes("case") ||
    designRoadmap.proof.actions.some((a) => /portfolio/i.test(a)),
  "design phases mention case/portfolio",
)

const generalRoadmap = buildRoadmap(undecidedDiag)
assert(
  !generalRoadmap.suggestedProgrammeSlugs.includes("product-management"),
  "undecided track must not default to product-management",
)
assert(
  generalRoadmap.skills.actions.some((a) => /direction A|direction B|two directions/i.test(a)),
  "general track skills phase compares directions",
)

assert(
  dataRoadmap.foundation.summary !== productRoadmap.foundation.summary,
  "data vs product foundation summaries differ",
)
assert(
  dataRoadmap.practice.summary !== examRoadmap.practice.summary,
  "data vs exam practice summaries differ",
)

const dataAgain = buildRoadmap({ ...dataDiag, completedAt: new Date(1).toISOString() })
assert(
  dataRoadmap.foundation.actions.join("|") === dataAgain.foundation.actions.join("|"),
  "roadmap phases are deterministic (ignore completedAt)",
)

console.log("test-path-roadmap: all assertions passed")
