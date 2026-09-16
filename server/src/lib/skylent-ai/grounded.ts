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
    .replace(/`/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function looksLikeAssignmentDump(question: string): boolean {
  return /exact answer|do (my|the) assignment|write (my|the) (memo|submission|capstone)|submit (it|this) for me|answer to (this|my|the) assignment|complete (my|the) (assignment|quiz|capstone)|i need the answer to (this|my|the) assignment/i.test(
    question,
  )
}

export function looksLikeJailbreak(question: string): boolean {
  return /ignore (previous|all|the) instructions|ignore previous|pretend (this|the) course|you are now|reveal (the )?system prompt|forget (the|this) lesson|act as if this lesson|override (the )?lesson/i.test(
    question,
  )
}

export function looksLikeOffTopic(question: string): boolean {
  return /capital of france|how do i (make|build) a website|write (html|css|javascript)|who won the|recipe for|weather in/i.test(
    question,
  )
}

const STOPWORDS = new Set([
  "what",
  "whats",
  "does",
  "this",
  "that",
  "have",
  "with",
  "from",
  "your",
  "about",
  "give",
  "another",
  "example",
  "explain",
  "into",
  "than",
  "then",
  "them",
  "they",
  "when",
  "where",
  "which",
  "will",
  "would",
  "could",
  "should",
  "just",
  "only",
  "also",
  "like",
])

function keywordHits(excerpt: string, question: string): string {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9₹]+/i)
    .filter((term) => term.length > 2 && !STOPWORDS.has(term))
  if (!terms.length) return ""
  const phrase = terms.join(" ")
  const blocks = excerpt.split(/\n{2,}/)
  const scored = blocks
    .map((block) => {
      const trimmed = block.trim()
      if (trimmed.startsWith("|")) return { block: trimmed, score: 0 }
      const lower = trimmed.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (lower.includes(term)) score += 1
      }
      if (phrase && lower.includes(phrase)) score += 3
      return { block: trimmed, score }
    })
    .filter((row) => row.score >= Math.min(2, terms.length) && row.block.length > 40)
    .sort((a, b) => b.score - a.score)
  if (scored[0]) return simplify(scored[0].block)
  return ""
}

function offTopicAnswer(question: string, lessonTitle: string): string {
  if (/capital of france/i.test(question)) {
    return `That is general knowledge, not something “${lessonTitle}” teaches. Paris is the capital of France. This lesson is about defensible totals from northwind_sales.csv.`
  }
  if (/website|html|css|javascript/i.test(question)) {
    return `That is outside this lesson. Building a website is not taught in “${lessonTitle}”. Here we are learning to compute defensible net revenue from a dirty sales extract.`
  }
  return `That is outside the current lesson context. “${lessonTitle}” does not teach it. I can help with the current lesson: net revenue, valid rows, and reading the Northwind extract.`
}

export function groundedAnswer(input: AiAskInput): string {
  const { context, action, question, history } = input
  const excerpt = context.excerpt
  const lastUser = history.filter((turn) => turn.role === "user").at(-1)?.content ?? ""
  const lastAssistant = history.filter((turn) => turn.role === "assistant").at(-1)?.content ?? ""
  const combinedQuestion = `${question} ${lastUser}`.trim()
  const followOn = `${question} ${lastAssistant}`.toLowerCase()
  const waitingForQuiz = /Reply in your own words|what is the valid-row rule/i.test(lastAssistant)
  const waitingForPractice = /Do not look up the expected result|Try the first item/i.test(lastAssistant)
  const beginnerAsk = action === "ask" && /beginner|simpler|in simple|like i am|eli5/i.test(question)
  const resolvedAction =
    action === "ask" && question && waitingForQuiz
      ? "quiz"
      : action === "ask" && question && waitingForPractice
        ? "practice"
        : beginnerAsk
          ? "explain"
          : action

  if (looksLikeJailbreak(combinedQuestion)) {
    return `I stay with the current lesson: “${context.lessonTitle}” in ${context.courseTitle}. I will not pretend this lesson teaches a different course or ignore the authored context.`
  }

  if (looksLikeAssignmentDump(combinedQuestion) || (context.lessonKind === "assignment" && /give me the (full |exact )?answer/i.test(combinedQuestion))) {
    return ASSIGNMENT_REFUSAL
  }

  if (!context.authored) {
    return `This lesson is “${context.lessonTitle}” in ${context.courseTitle}. It is a thinner catalogue listing, not the authored Data Analytics path. I can only speak to the lesson title here — I will not invent extra modules, certificates, or live classes.`
  }

  if (looksLikeOffTopic(question)) {
    return offTopicAnswer(question, context.lessonTitle)
  }

  if (/how many valid rows|valid rows (are there|in the extract|in this)/i.test(question)) {
    return context.northwind
      ? `The extract has ${context.northwind.rows} order lines. After the valid-row rule (units > 0, unit_price > 0, returned = no) you should count ${context.northwind.validRows} valid rows (${context.northwind.excludedRows} excluded).`
      : `Use the valid-row rule in “${context.lessonTitle}”.`
  }

  if (/total valid net revenue|valid net revenue|headline (total|net revenue)/i.test(question)) {
    return context.northwind
      ? `Valid net revenue in this extract is ${context.northwind.netRevenueLabel}, using only the ${context.northwind.validRows} valid rows in ${context.northwind.window}.`
      : `State the metric, the period, and the valid-row rule from this lesson.`
  }

  if (/why (are|do we|should we) (invalid rows )?(removed|remove)|why (can't|cannot) i include (negative|invalid)/i.test(question) || /why.*invalid rows/i.test(question)) {
    return `Invalid rows would poison a total. Negative units, zero price, and returned = yes are not valid sales in this course. The valid-row rule keeps units > 0, unit_price > 0, and returned = no so net revenue is defensible. In this extract that leaves ${context.northwind?.validRows ?? 166} of ${context.northwind?.rows ?? 180} rows and ${context.northwind?.netRevenueLabel ?? "₹812,020"}.`
  }

  if (/descriptive|diagnostic|predictive/i.test(question)) {
    const explain = section(excerpt, "Explain")
    const hit = explain.match(/Three levels of claim[\s\S]*?does not teach\./i)
    if (hit) return simplify(hit[0])
    return "In this lesson: descriptive says what the extract shows (allowed); diagnostic explains a movement with care (allowed, with a limitation); predictive/ML forecasts are out of scope — this course does not teach a model."
  }

  if (/0\.9|discount|multiply by/i.test(followOn) && /0\.9|discount|multiply/i.test(question)) {
    return "0.90 is (1 − discount_pct / 100) when discount_pct is 10. In the lesson, NW-10013 is 7 × 449 × 0.90 = 2828.7. A 0% discount (NW-10001) multiplies by 1.00."
  }

  if (/another (northwind )?example|give me another|show another/i.test(question)) {
    return "Another line from this lesson: NW-10013 (Grocery, Filter Coffee) is units 7, unit_price 449, discount_pct 10 → 7 × 449 × 0.90 = 2828.7. Same formula as NW-10001; only the discount factor changes. Do not invent extra rows."
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

  if (/certificate|live class|instructor|placement|job guarantee/i.test(question)) {
    return "That is not something this lesson (or this Skylent pilot) claims. This course does not issue a certificate, run live classes, or guarantee a job. Stay with the lesson: defensible totals from the extract you have."
  }

  if (/what is net revenue|net_revenue|net revenue formula/i.test(question)) {
    return "In this lesson, net revenue on a valid sales row is:\n\nnet_revenue = units × unit_price × (1 − discount_pct / 100)\n\nNW-10001 is 1 × 2199 × 1.00 = 2199. Do not sum unit_price down the column. The extract total after the valid-row rule is ₹812,020."
  }

  const hit = keywordHits(excerpt, question)
  if (hit) return hit.slice(0, 1400)

  return `That is not stated as a taught fact in “${context.lessonTitle}”. I can help with: ${context.concepts.join(", ") || context.objective || "the current lesson text"}. Ask about one of those, or use Explain simpler.`
}

export function createLessonGroundedProvider(): AiProvider {
  return {
    id: "lesson-grounded",
    async complete() {
      throw new Error("lesson-grounded uses answerLesson()")
    },
    async answerLesson(input) {
      return groundedAnswer(input)
    },
  }
}
