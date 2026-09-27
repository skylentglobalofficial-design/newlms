import type { PathRecommendationContext } from "./classifyTrack"
import type { PathTrack } from "./classifyTrack"
import type { RoadmapPhase } from "./types"
import { nonProgrammeExecutionSteps, suggestProgrammeSlugs } from "./programmeMatch"

function phase(title: string, summary: string, actions: string[]): RoadmapPhase {
  return { title, summary, actions }
}

function gapNote(ctx: PathRecommendationContext): string {
  return ctx.diagnosis.gapDetail.trim()
    ? `Your note: ${ctx.diagnosis.gapDetail.trim()}`
    : `Prioritise gaps: ${ctx.gaps.join(", ")}.`
}

function schoolOrWorking(ctx: PathRecommendationContext): "school" | "working" | "other" {
  if (ctx.diagnosis.academicBackground === "school") return "school"
  if (ctx.diagnosis.academicBackground === "working" || ctx.diagnosis.academicBackground === "career_change") {
    return "working"
  }
  return "other"
}

function foundationFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, focus, track } = ctx
  const school = schoolOrWorking(ctx)

  switch (track) {
    case "data_analytics":
      return phase(
        "Foundation",
        `Ground ${focus} in questions data can answer — not tools for their own sake.`,
        [
          school === "school"
            ? "Confirm maths/statistics comfort for your target level (school exam vs analyst role)."
            : "Write the decision a stakeholder would make from data (one sentence).",
          diagnosis.existingSkills === "starting"
            ? "List: metric, dimension, grain, and source — define each in plain language."
            : "Audit one dataset you can access (public or sample) and list its limits.",
          diagnosis.strengths.trim() ? `Build on: ${diagnosis.strengths.trim()}.` : "Name one question you could answer with a table or chart.",
          ctx.gaps.includes("Core foundations") ? "Close SQL/spreadsheet vocabulary before dashboards." : "Pick one business context (sales, ops, product) to anchor examples.",
        ],
      )
    case "product_business":
      return phase(
        "Foundation",
        `Clarify the problem, user, and constraint for ${focus} before solutions.`,
        [
          "Write a one-paragraph problem statement a user would agree with.",
          diagnosis.careerDirection === "build_company"
            ? "State the riskiest assumption for the idea — what must be true?"
            : "Name the primary user and the job they are hiring the product to do.",
          diagnosis.strengths.trim() ? `Leverage: ${diagnosis.strengths.trim()}.` : "List three non-goals (what you will not build yet).",
          ctx.gaps.includes("Direction clarity") ? "Compare two possible bets; pick one to test first." : "Identify one metric that would prove progress in 30 days.",
        ],
      )
    case "competitive_exams":
      return phase(
        "Foundation",
        `Align ${focus} to the exam's syllabus structure — not generic study habits.`,
        [
          "Download or outline the official syllabus; mark topics already comfortable vs unknown.",
          diagnosis.targetOutcome === "pass_exam"
            ? "Set a target attempt window; work backwards to weekly topic coverage."
            : "Define pass criteria: score band, sectional cut-offs, or rank goal.",
          school === "school"
            ? "Balance board/school workload with exam blocks — put both on one calendar."
            : "Block daily depth time vs revision time; exams fail on skew, not laziness.",
          ctx.gaps.includes("Time & consistency") ? "Start with 45-minute daily blocks before marathon sessions." : "Identify the highest-weight sections first (from past papers if available).",
        ],
      )
    case "design_creative":
      return phase(
        "Foundation",
        `Define audience, scenario, and success for ${focus} before pixels.`,
        [
          "Write a brief: who, context, constraint, and what good looks like.",
          diagnosis.existingSkills === "starting"
            ? "Collect 5 reference interfaces; note patterns, not copies."
            : "Critique one existing product flow — where does it confuse or delight?",
          diagnosis.strengths.trim() ? `Use strength: ${diagnosis.strengths.trim()}.` : "Choose one medium (UI, research, content) for the next 4 weeks.",
          ctx.gaps.includes("Communication") ? "Practice explaining one design decision in writing." : "Define accessibility or content constraints upfront.",
        ],
      )
    case "technology_professional":
      return phase(
        "Foundation",
        `Map ${focus} to deliverables a team would recognize — not tutorial completion.`,
        [
          diagnosis.careerDirection === "research_academic"
            ? "Name the research question and what evidence would convince a reviewer."
            : "List skills the role advertises vs what you can demonstrate today.",
          diagnosis.existingSkills === "work_ready"
            ? "Pick one production-adjacent skill to deepen (testing, debugging, systems)."
            : "Choose a stack boundary: language, framework, or domain — not all three at once.",
          diagnosis.strengths.trim() ? `Highlight: ${diagnosis.strengths.trim()}.` : "Write a README-style summary of what you can build solo today.",
          ctx.gaps.includes("Core foundations") ? "Close one fundamentals gap (CS, networking, or tooling)." : "Confirm how your target role evaluates code (tests, review, deploy).",
        ],
      )
    default:
      return phase(
        "Foundation",
        `Reduce uncertainty about ${focus} before committing time or money.`,
        [
          "List three plausible directions; note what would falsify each.",
          diagnosis.targetOutcome === "decide_next_step"
            ? "Define what evidence would let you choose between directions."
            : "Name the outcome you want in 90 days — be specific enough to test.",
          diagnosis.strengths.trim() ? `Start from: ${diagnosis.strengths.trim()}.` : "Interview one person in a role you might want — ask what they actually do weekly.",
          gapNote(ctx),
        ],
      )
  }
}

function skillsFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, focus, track, timelineLabel } = ctx
  const programmes = suggestProgrammeSlugs(diagnosis, track)

  switch (track) {
    case "data_analytics":
      return phase(
        "Skills",
        "Sequence: data handling → analysis → narrative. Skip modules that do not serve your question.",
        [
          diagnosis.existingSkills === "starting"
            ? "Spreadsheets: clean, join, aggregate on a small table."
            : "SQL: filter, group, join on a realistic schema.",
          programmes.includes("data-analytics-pro")
            ? "If enrolling, use Data Analytics Pro only for gaps the syllabus maps to — skip what you know."
            : "Use free datasets + docs; no programme required until a gap is specific.",
          ctx.gaps.includes("Applied practice") ? "One lesson per gap; immediately apply to your chosen dataset." : "Learn one visual form that fits your audience (table, chart, memo).",
          `Pace for ${timelineLabel.toLowerCase()}: finish one skill unit before opening the next.`,
        ],
      )
    case "product_business":
      return phase(
        "Skills",
        "Learn discovery, prioritisation, and specification — in that order.",
        [
          "User evidence: write interview or survey questions that avoid leading answers.",
          programmes.includes("product-management")
            ? "Use Product Management programme modules for spec and trade-off practice on the Harbor Desk case."
            : "Study one public product teardown; document decisions you disagree with.",
          ctx.gaps.includes("Communication") ? "Practice one-page briefs: context, decision, rationale." : "Estimate impact vs effort for three ideas; kill two.",
          gapNote(ctx),
        ],
      )
    case "competitive_exams":
      return phase(
        "Skills",
        "Topic mastery before tricks — exams reward breadth and speed under rules.",
        [
          "For each syllabus section: concept sheet + 10 representative items.",
          ctx.gaps.includes("Core foundations") ? "Rebuild weak topics from first principles; do not skip to mocks." : "Alternate learning days and mixed revision days.",
          "Track error types (concept, careless, time) separately in a log.",
          `Timeline ${timelineLabel.toLowerCase()}: weight time to highest-yield sections first.`,
        ],
      )
    case "design_creative":
      return phase(
        "Skills",
        "Build craft and critique loops — tools change; judgment persists.",
        [
          diagnosis.existingSkills === "starting"
            ? "Typography, spacing, and hierarchy on one screen — repeat with constraints."
            : "Run one usability check on a flow you did not design.",
          "Learn the vocabulary for your medium (components, flows, content design).",
          ctx.gaps.includes("Visible evidence") ? "Redesign one screen with before/after rationale." : "Pair with a written critique of your own work.",
          gapNote(ctx),
        ],
      )
    case "technology_professional":
      return phase(
        "Skills",
        `Close stack gaps for ${focus} — depth beats certificates.`,
        [
          diagnosis.existingSkills === "project_ready"
            ? "Implement one feature end-to-end with tests or checks you would show in review."
            : "Complete one guided project; then change one requirement and refactor.",
          programmes.length
            ? `Enrol only if a catalogue programme maps to a named gap (${programmes.join(", ")}).`
            : "Use documentation + small repos; avoid tutorial hopping without shipping.",
          ctx.gaps.includes("Applied practice") ? "Code or build daily in short sessions; commit to a public or local log." : "Read one production codebase area (issue → PR → deploy story).",
          gapNote(ctx),
        ],
      )
    default:
      return phase(
        "Skills",
        "Sample skills in two directions before specialising.",
        [
          "Spend one week on direction A (course, lab, or book chapter) — produce a note.",
          "Spend one week on direction B — same output format for comparison.",
          "Drop the direction that felt harder to explain to someone else.",
          nonProgrammeExecutionSteps(track, diagnosis)[0] ?? gapNote(ctx),
        ],
      )
  }
}

function practiceFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, focus, track, weeklyCadence, timelineLabel } = ctx

  switch (track) {
    case "data_analytics":
      return phase(
        "Practice",
        "Timed analysis on messy data — mirrors analyst work more than lectures.",
        [
          "Pick one dataset; answer three questions with tables and one chart each.",
          "Write a 200-word summary a non-analyst could act on.",
          ctx.gaps.includes("Communication") ? "Present findings without jargon; define terms once." : "Check numbers twice; document assumptions.",
          `${weeklyCadence} for ${timelineLabel.toLowerCase()}.`,
        ],
      )
    case "product_business":
      return phase(
        "Practice",
        "Practice decisions under constraint — not feature brainstorming.",
        [
          "Given a fixed engineering budget, choose one bet and write the spec.",
          "Run a prioritisation exercise with explicit trade-offs (scope, time, risk).",
          "Review with a peer: what would they challenge?",
          `${weeklyCadence}; keep each exercise under 3 hours.`,
        ],
      )
    case "competitive_exams":
      return phase(
        "Practice",
        "Item practice and timed sections before full mocks.",
        [
          "Daily mixed set: new items + spaced revision from error log.",
          "Weekly timed section; record pace and accuracy by topic.",
          ctx.gaps.includes("Applied practice") ? "Simulate exam conditions (no notes) once per fortnight." : "Analyse every wrong answer — concept tag required.",
          `${weeklyCadence}; protect sleep before intensive blocks.`,
        ],
      )
    case "design_creative":
      return phase(
        "Practice",
        "Iterate on one flow with explicit feedback rounds.",
        [
          "Wireframe → test with one user → revise once — document changes.",
          "Run a constraint exercise (mobile-only, one font, 10-minute task).",
          ctx.gaps.includes("Visible evidence") ? "Save iterations; show progression, not just final pixels." : "Write alt text and empty states — not just happy path.",
          weeklyCadence,
        ],
      )
    case "technology_professional":
      return phase(
        "Practice",
        "Practice like production: bugs, reviews, and small shipping cycles.",
        [
          diagnosis.careerDirection === "research_academic"
            ? "Reproduce one paper result or benchmark on a small scale."
            : "Fix a bug or add a test in an existing project.",
          "Time-box implementation; write what you would cut if deadline moved up.",
          "Practice explaining your approach aloud in 3 minutes.",
          weeklyCadence,
        ],
      )
    default:
      return phase(
        "Practice",
        "Small real tasks beat abstract planning.",
        [
          `Complete one bounded task related to ${focus} with a written retrospective.`,
          "Note energy, difficulty, and whether you would repeat the direction.",
          "Share the output with one person for a specific question.",
          weeklyCadence,
        ],
      )
  }
}

function buildFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, focus, track } = ctx

  switch (track) {
    case "data_analytics":
      return phase(
        "Build",
        "One analysis artifact tied to a decision — your Northwind-style proof.",
        [
          "Dashboard or memo answering one business question with defensible numbers.",
          "Include data lineage: source, transforms, caveats.",
          "Make it reproducible (saved queries or documented steps).",
        ],
      )
    case "product_business":
      return phase(
        "Build",
        "A spec or strategy memo someone could implement.",
        [
          diagnosis.careerDirection === "build_company"
            ? "MVP scope doc: user, problem, v1 features, non-goals."
            : "PRD-style doc with user stories and acceptance criteria.",
          "Include one metric and how you would measure it.",
          "Attach mockups or flows only where they reduce ambiguity.",
        ],
      )
    case "competitive_exams":
      return phase(
        "Build",
        "A revision system you will actually use until exam day.",
        [
          "Personal error book with tags and spaced revisit dates.",
          "One full mock under timed rules; score and section breakdown saved.",
          focus.trim() ? `Align mocks to: ${focus}.` : "Align mocks to official paper format.",
        ],
      )
    case "design_creative":
      return phase(
        "Build",
        "One case study project with process visible.",
        [
          "End-to-end case: problem, exploration, solution, validation.",
          "Include constraints you worked under and what you would do next.",
          "Export assets suitable for portfolio (PDF or link).",
        ],
      )
    case "technology_professional":
      return phase(
        "Build",
        "Ship a repo or deployable slice that demonstrates ${focus}.",
        [
          "README: setup, scope, trade-offs, and how to verify it works.",
          diagnosis.targetOutcome === "credible_portfolio" ? "Choose work that matches roles you are targeting." : "Keep scope small enough to finish in your timeline.",
          "Include tests, lint, or checks appropriate to the stack.",
        ].map((line) => line.replace("${focus}", focus)),
      )
    default:
      return phase(
        "Build",
        "One artifact that helps you choose the next direction.",
        [
          "Comparison write-up: two directions, same rubric (interest, evidence, opportunity).",
          "Pick a winner with one next experiment defined.",
          "Store raw notes — future you will need them.",
        ],
      )
  }
}

function proofFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, track } = ctx

  switch (track) {
    case "data_analytics":
      return phase(
        "Proof",
        "Evidence = reproducible analysis + clear recommendation.",
        [
          "Publish case note: question, method, findings, recommendation, limits.",
          "Add to Career OS or portfolio; link datasets and queries where allowed.",
          "Request review on whether the recommendation follows from the data.",
        ],
      )
    case "product_business":
      return phase(
        "Proof",
        "Evidence = decision record, not slide deck volume.",
        [
          "Share spec with rationale for trade-offs and rejected options.",
          "If user research exists, tie claims to quotes or data.",
          "Add to Career OS as a work sample for product roles.",
        ],
      )
    case "competitive_exams":
      return phase(
        "Proof",
        "Evidence = mock scores and topic mastery trends.",
        [
          "Chart mock scores over time; annotate what changed each attempt.",
          "List topics still below target; link to revision plan.",
          "Do not claim readiness without timed mock proof.",
        ],
      )
    case "design_creative":
      return phase(
        "Proof",
        "Evidence = case study with critique and iteration.",
        [
          "Portfolio page: problem, role, process, outcome, learnings.",
          "Include before/after or iteration screenshots.",
          "Ask for critique on one specific dimension (clarity, accessibility, flow).",
        ],
      )
    case "technology_professional":
      return phase(
        "Proof",
        "Evidence = code, deploy link, or demo others can run.",
        [
          "Public repo or recorded demo with setup instructions.",
          "Write a post-mortem: what broke, what you fixed.",
          "Map project bullets to skills employers list for your target.",
        ],
      )
    default:
      return phase(
        "Proof",
        "Evidence that you can explain your direction choice.",
        [
          "One-page decision memo: options, criteria, choice, next step.",
          "Store in Career OS or personal notes.",
          "Revisit in 30 days — update or pivot with reason.",
        ],
      )
  }
}

function opportunityFor(ctx: PathRecommendationContext): RoadmapPhase {
  const { diagnosis, track } = ctx
  const programmes = suggestProgrammeSlugs(diagnosis, track)
  const extras = nonProgrammeExecutionSteps(track, diagnosis)

  const actions: string[] = []

  if (programmes.length) {
    actions.push(
      `Optional execution: Skylent programme${programmes.length > 1 ? "s" : ""} ${programmes.join(", ")} — enrol only if gaps match taught modules.`,
    )
  }

  for (const step of extras) {
    actions.push(step)
  }

  switch (track) {
    case "competitive_exams":
      actions.push("Register for the exam only when mocks meet your target band consistently.")
      actions.push("Adjust study plan after each mock — do not repeat the same weak sections blindly.")
      break
    case "design_creative":
      actions.push("Apply to roles or freelance briefs only when case study reflects the work you want.")
      actions.push("Continue critique loops; design hiring is portfolio-led.")
      break
    case "data_analytics":
      actions.push("Target analyst or data-adjacent roles when your memo answers a real question.")
      actions.push("Use Career OS (/career-os) to carry evidence — not as a placement promise.")
      break
    case "product_business":
      actions.push("Share spec work with PM communities or mentors for feedback.")
      actions.push("Apply when you can walk through trade-offs in an interview.")
      break
    case "technology_professional":
      actions.push(
        diagnosis.targetOutcome === "land_first_role"
          ? "Shortlist roles that match your repo stack; tailor README bullets to each."
          : "Seek stretch projects internally or in open source aligned to your stack.",
      )
      actions.push("Career OS organises applications — it does not guarantee interviews.")
      break
    default:
      actions.push("Re-run Skylent Path after your next experiment if direction shifts.")
      actions.push("Enrol in catalogue offerings only when a gap maps to a specific module.")
  }

  actions.push("Revisit gaps monthly; drop completed items and add new ones honestly.")

  return phase(
    "Opportunity",
    programmes.length
      ? "Choose programmes, practice surfaces, or roles based on evidence — not urgency."
      : "No catalogue programme is required for this track; use practice and proof first.",
    actions,
  )
}

export function buildPhasesForTrack(ctx: PathRecommendationContext): {
  foundation: RoadmapPhase
  skills: RoadmapPhase
  practice: RoadmapPhase
  build: RoadmapPhase
  proof: RoadmapPhase
  opportunity: RoadmapPhase
} {
  return {
    foundation: foundationFor(ctx),
    skills: skillsFor(ctx),
    practice: practiceFor(ctx),
    build: buildFor(ctx),
    proof: proofFor(ctx),
    opportunity: opportunityFor(ctx),
  }
}

export type { PathTrack }
