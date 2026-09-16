import { ASSIGNMENT_REFUSAL } from "./prompts.js"
import type { AiAskInput, AiProvider } from "./types.js"

function section(excerpt: string, heading: string): string {
  const pattern = new RegExp(`## ${heading}\\s*([\\s\\S]*?)(?=\\n## |$)`, "i")
  const match = excerpt.match(pattern)
  return match?.[1]?.trim() ?? ""
}

function simplify(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function looksLikeAssignmentDump(question: string): boolean {
  return /exact answer|do (my|the) assignment|write (my|the) (memo|submission|capstone)|submit (it|this) for me/i.test(
    question,
  )
}

function keywordHits(excerpt: string, question: string): string {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9₹]+/i)
    .filter((term) => term.length > 3)
  const blocks = excerpt.split(/\n{2,}/)
  const scored = blocks
    .map((block) => {
      const lower = block.toLowerCase()
      const score = terms.reduce((sum, term) => (lower.includes(term) ? sum + 1 : sum), 0)
      return { block: block.trim(), score }
    })
    .filter((row) => row.score > 0 && row.block.length > 40)
    .sort((a, b) => b.score - a.score)
  if (scored[0]) return simplify(scored[0].block)
  return ""
}

export function groundedAnswer(input: AiAskInput): string {
  const { context, action, question, history } = input
  const excerpt = context.excerpt
  const lastUser = history.filter((turn) => turn.role === "user").at(-1)?.content ?? ""
  const lastAssistant = history.filter((turn) => turn.role === "assistant").at(-1)?.content ?? ""
  const combinedQuestion = `${question} ${lastUser}`.trim()
  const waitingForQuiz = /Reply in your own words|what is the valid-row rule/i.test(lastAssistant)
  const waitingForPractice = /Do not look up the expected result|Try the first item/i.test(lastAssistant)
  const resolvedAction =
    action === "ask" && question && waitingForQuiz
      ? "quiz"
      : action === "ask" && question && waitingForPractice
        ? "practice"
        : action

  if (looksLikeAssignmentDump(combinedQuestion) || (context.lessonKind === "assignment" && /give me the (full |exact )?answer/i.test(combinedQuestion))) {
    return ASSIGNMENT_REFUSAL
  }

  if (!context.authored) {
    return `This lesson is “${context.lessonTitle}” in ${context.courseTitle}. It is a thinner catalogue listing, not the authored Data Analytics path. I can only speak to the lesson title here — I will not invent extra modules, certificates, or live classes.`
  }

  if (resolvedAction === "explain") {
    const explain = section(excerpt, "Explain") || context.objective
    const facts = context.northwind
      ? `In this extract you should reach ${context.northwind.validRows} valid rows and ${context.northwind.netRevenueLabel} valid net revenue after the valid-row rule (positive units, positive price, returned = no).`
      : ""
    return [
      simplify(explain).slice(0, 1200),
      context.objective ? `In this lesson you are aiming to: ${context.objective}` : "",
      facts,
    ]
      .filter(Boolean)
      .join("\n\n")
  }

  if (resolvedAction === "example") {
    const example = section(excerpt, "Worked example — one order line") || section(excerpt, "Worked example")
    if (example) return simplify(example).slice(0, 1400)
    if (context.northwind) {
      return `Use ${context.northwind.filename}. Net revenue on a valid row is units × unit_price × (1 − discount_pct/100). NW-10001 in the lesson is 1 × 2199 × 1.00 = 2199. Do not invent extra rows.`
    }
    return `Use the worked example in “${context.lessonTitle}”. I will not invent a different dataset.`
  }

  if (resolvedAction === "quiz") {
    const check = section(excerpt, "Knowledge check")
    const answered = history.some((turn) => turn.role === "assistant" && /knowledge check|what do you do/i.test(turn.content))
    if (answered && question) {
      const official = check.match(/\*\*Answer:\*\*\s*([\s\S]+)$/i)?.[1]?.trim()
      if (official) {
        return `Your reasoning: check it against the lesson.\n\nThe lesson’s answer: ${simplify(official)}\n\nIf you summed list prices, that is the common mistake this lesson names.`
      }
    }
    const prompt = check.replace(/\*\*Answer:\*\*[\s\S]*$/i, "").trim()
    if (prompt) return `${simplify(prompt)}\n\nReply in your own words. I will not reveal the answer until you try.`
    return `From this lesson only: what is the valid-row rule, and why does it exist? Reply, then I will coach.`
  }

  if (resolvedAction === "practice") {
    const practice = section(excerpt, "Practice")
    const expected = section(excerpt, "Expected result")
    const attempted = history.some((turn) => turn.role === "assistant" && /practice|without building a pivot/i.test(turn.content))
    if (attempted && question && expected) {
      return `Compare your attempt with the lesson’s expected working. Here is that section so you can check yourself:\n\n${simplify(expected).slice(0, 1200)}`
    }
    if (practice) {
      return `${simplify(practice).slice(0, 1200)}\n\nDo not look up the expected result yet. Try the first item, then come back.`
    }
    return context.practicalOutput
      ? `Practice: produce this from the lesson — ${context.practicalOutput}. I will not do the graded write-up for you.`
      : `Try restating the lesson objective in one sentence, then apply it to ${context.northwind?.filename ?? "the lesson dataset"}.`
  }

  if (!context.excerpt) {
    return `I only have the title “${context.lessonTitle}” for this lesson. Ask about that, or open Data Analytics lesson 1 for the authored Northwind teaching.`
  }

  const hit = keywordHits(excerpt, question)
  if (hit) return hit.slice(0, 1400)

  if (/outside|certificate|live class|instructor|placement|job guarantee/i.test(question)) {
    return "That is not something this lesson (or this Skylent pilot) claims. This course does not issue a certificate, run live classes, or guarantee a job. Stay with the lesson: defensible totals from the extract you have."
  }

  return `That is not stated as a taught fact in “${context.lessonTitle}”. I can help with: ${context.concepts.join(", ") || context.objective || "the current lesson text"}. Ask about one of those, or use Explain simpler.`
}

export function createLessonGroundedProvider(): AiProvider {
  return {
    id: "lesson-grounded",
    async complete() {
      throw new Error("lesson-grounded uses groundedAnswer(), not complete()")
    },
  }
}
