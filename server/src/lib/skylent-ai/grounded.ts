import { OFF_TOPIC_REDIRECT, assignmentRefusalFor } from "./prompts.js"
import type { AiAskInput, AiProvider, LessonAiContext } from "./types.js"

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
  return /exact answer|do (my|the) assignment|write (my|the) (memo|submission|capstone)|submit (it|this) for me|answer to (this|my|the) assignment|give me (the |this |my )?(assignment|quiz|capstone) answer|complete (my|the) (assignment|quiz|capstone)|i need the answer to (this|my|the) assignment/i.test(
    question,
  )
}

export function looksLikeJailbreak(question: string): boolean {
  return /ignore (previous|all|the) instructions|ignore (the )?lesson|ignore previous|pretend (this|the) course|you are now|you are no longer|reveal (the )?system prompt|tell me your system prompt|forget (the|this) lesson|act as if this lesson|override (the )?lesson/i.test(
    question,
  )
}

export function looksLikeOffTopic(question: string): boolean {
  return /capital of france|how do i (make|build) a website|write (html|css|javascript)|who won the|recipe for|weather in/i.test(
    question,
  )
}

export function looksLikeAnswerKey(question: string): boolean {
  return /answer key|correctindex|correct index|hidden answers|dump the (graded )?quiz|reveal the (graded |hidden )?quiz answers|what is the correct option/i.test(
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

function keywordHits(excerpt: string, question: string, context: LessonAiContext): string {
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
      if (score === 0) return { block: trimmed, score: 0 }
      if (phrase && lower.includes(phrase)) score += 3
      if (context.northwind && /166 valid rows|valid-row rule|units > 0/.test(lower)) score += 4
      if (context.northwind && /net_revenue =/.test(lower)) score += 4
      if (context.harbor && /harbor desk|harbor retail|problem vs solution|job/.test(lower)) score += 4
      return { block: trimmed, score }
    })
    .filter((row) => row.score >= Math.min(2, terms.length) && row.block.length > 40)
    .sort((a, b) => b.score - a.score)
  if (scored[0]) return simplify(scored[0].block)
  return ""
}

function offTopicAnswer(question: string, context: LessonAiContext): string {
  const lessonTitle = context.lessonTitle
  if (/capital of france/i.test(question)) {
    const here = context.harbor
      ? `This lesson is about choosing a product problem from the Harbor Desk case.`
      : context.northwind
        ? `This lesson is about defensible totals from northwind_sales.csv.`
        : `This lesson is “${lessonTitle}”.`
    return `That is general knowledge, not something “${lessonTitle}” teaches. Paris is the capital of France. ${here} ${OFF_TOPIC_REDIRECT}`
  }
  if (/website|html|css|javascript/i.test(question)) {
    const here = context.harbor
      ? `Here we are learning to frame a Harbor Desk product problem.`
      : context.northwind
        ? `Here we are learning to compute defensible net revenue from a dirty sales extract.`
        : `Stay with “${lessonTitle}”.`
    return `That is outside this lesson. Building a website is not taught in “${lessonTitle}”. ${here} ${OFF_TOPIC_REDIRECT}`
  }
  return `That is outside the current lesson context. “${lessonTitle}” does not teach it. ${OFF_TOPIC_REDIRECT}`
}

function knowledgeCheck(excerpt: string): { prompt: string; official: string } {
  const check = section(excerpt, "Knowledge check")
  const official = check.match(/\*\*(?:Answer:|A\.)\*\*\s*([\s\S]+)$/i)?.[1]?.trim() ?? ""
  const prompt = check.replace(/\*\*(?:Answer:|A\.)\*\*[\s\S]*$/i, "").trim()
  return { prompt, official }
}

function waitingQuiz(lastAssistant: string): boolean {
  return /Reply in your own words|what is the valid-row rule|I will not reveal the answer until you try|whose problem is this course asking/i.test(
    lastAssistant,
  )
}

function waitingPractice(lastAssistant: string): boolean {
  return /Do not look up the expected result|Try the first item|Try the first sentence/i.test(lastAssistant)
}

function daFacts(context: LessonAiContext): string {
  if (!context.northwind) return ""
  return `In this extract you should reach ${context.northwind.validRows} valid rows and ${context.northwind.netRevenueLabel} valid net revenue after the valid-row rule (positive units, positive price, returned = no).`
}

function pmFacts(context: LessonAiContext): string {
  if (!context.harbor) return ""
  return `Harbor Desk is a proposed shared inbox for ${context.harbor.company} (${context.harbor.stores} stores). The case notes ${context.harbor.interviews} interviews and ${context.harbor.weekendExceptions} weekend exceptions. Constraint: ${context.harbor.constraint}.`
}

export function groundedAnswer(input: AiAskInput): string {
  const { context, action, question, history } = input
  const excerpt = context.excerpt
  const lastUser = history.filter((turn) => turn.role === "user").at(-1)?.content ?? ""
  const lastAssistant = history.filter((turn) => turn.role === "assistant").at(-1)?.content ?? ""
  const combinedQuestion = `${question} ${lastUser}`.trim()
  const followOn = `${question} ${lastAssistant}`.toLowerCase()
  const quizPending = waitingQuiz(lastAssistant)
  const practicePending = waitingPractice(lastAssistant)
  const beginnerAsk = action === "ask" && /beginner|simpler|in simple|like i am|eli5/i.test(question)
  const resolvedAction =
    action === "ask" && question && quizPending
      ? "quiz"
      : action === "ask" && question && practicePending
        ? "practice"
        : beginnerAsk
          ? "explain"
          : action

  if (looksLikeJailbreak(combinedQuestion)) {
    return `I stay with the current lesson: “${context.lessonTitle}” in ${context.courseTitle}. I will not pretend this lesson teaches a different course or ignore the authored context.`
  }

  if (looksLikeAnswerKey(combinedQuestion)) {
    return "I will not reveal graded answer keys. Use Quiz me for one practice question from this lesson, or try the knowledge check in the reading."
  }

  if (looksLikeAssignmentDump(combinedQuestion) || (context.lessonKind === "assignment" && /give me the (full |exact )?answer/i.test(combinedQuestion))) {
    return assignmentRefusalFor(context)
  }

  if (!context.authored) {
    return `This lesson is “${context.lessonTitle}” in ${context.courseTitle}. It is a thinner catalogue listing, not an authored Skylent flagship path. I can only speak to the lesson title here — I will not invent extra modules, certificates, or live classes.`
  }

  if (looksLikeOffTopic(question)) {
    return offTopicAnswer(question, context)
  }

  if (!quizPending && !practicePending && context.northwind) {
    if (/why (are|do we|should we) (invalid rows )?(removed|remove)|why (can't|cannot) i include (negative|invalid)/i.test(question) || /why.*invalid rows/i.test(question)) {
      return `Invalid rows would poison a total. Negative units, zero price, and returned = yes are not valid sales in this course. The valid-row rule keeps units > 0, unit_price > 0, and returned = no so net revenue is defensible. In this extract that leaves ${context.northwind.validRows} of ${context.northwind.rows} rows and ${context.northwind.netRevenueLabel}.`
    }

    if (/why (are|do) returned rows|returned rows (matter|excluded)|why.*returned/i.test(question)) {
      return `Returned rows are excluded because they are not completed sales in this course. The valid-row rule keeps units > 0, unit_price > 0, and returned = no. In this extract that leaves ${context.northwind.validRows} of ${context.northwind.rows} rows and ${context.northwind.netRevenueLabel}.`
    }

    if (/how many valid rows|(?:^|[^a-z])valid[- ]rows?|valid-row rule/i.test(question) && !/invalid|net revenue|descriptive|diagnostic/i.test(question)) {
      return `The extract has ${context.northwind.rows} order lines. After the valid-row rule (units > 0, unit_price > 0, returned = no) you should count ${context.northwind.validRows} valid rows (${context.northwind.excludedRows} excluded).`
    }

    if (/total valid net revenue|valid net revenue|headline (total|net revenue)/i.test(question)) {
      return `Valid net revenue in this extract is ${context.northwind.netRevenueLabel}, using only the ${context.northwind.validRows} valid rows in ${context.northwind.window}.`
    }

    if (/dataset|northwind_sales|what does this (file|extract|csv)/i.test(question)) {
      return `This lesson uses ${context.northwind.filename}: ${context.northwind.rows} order lines for Northwind Retail, ${context.northwind.window}. After the valid-row rule you should count ${context.northwind.validRows} valid rows and ${context.northwind.netRevenueLabel} valid net revenue.`
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
  }

  if (!quizPending && !practicePending && context.harbor) {
    if (/what is a product problem|product problem/i.test(question)) {
      return "In this lesson, a product problem names who is struggling, in what situation, and what “better” would look like — without naming the UI. “Gmail for stores” is a solution. The Harbor Desk case starts earlier: whose weekend exception still has no owner."
    }

    if (/outcome vs output|output and outcome|difference between (an )?outcome|what is an outcome|what is a product (outcome|output)/i.test(question)) {
      return "Output is what the team shipped. Outcome is the change in the user’s world. Shipping Harbor Desk v1 is output. “Weekend failures have a written owner before Monday 10:00” is an outcome."
    }

    if (/harbor desk example|explain this harbor|what is harbor desk|harbor retail/i.test(question)) {
      const example = section(excerpt, "Worked example")
      if (example) return simplify(example).slice(0, 1400)
      return `Harbor Desk is a proposed shared inbox for ${context.harbor.company}, not a live product and not a sales file. HQ asked for “Gmail for stores.” That sentence is a solution. Your job starts with who is failing at what.${pmFacts(context)}`
    }

    if (/another (example|harbor)|give me another|show another/i.test(question)) {
      return "Another Harbor Desk rewrite from this lesson: Meena (cashier, Anna Nagar) needs a place to put a failed delivery so the customer is not her personal WhatsApp. That is a job. “Build an inbox” is still a solution. Do not invent extra interviews."
    }

    if (/gmail for stores|shared inbox/i.test(question)) {
      return "“Gmail for stores” is a solution. This lesson asks you to name the user, the job, and an outcome first. Priya wants the late truck to be someone’s job before the fridge is empty — that is closer to a product problem than an inbox."
    }
  }

  if (resolvedAction === "explain") {
    const explain = section(excerpt, "Explain") || context.objective
    const facts = context.northwind ? daFacts(context) : context.harbor ? pmFacts(context) : ""
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
    if (context.harbor) {
      return `Use the Harbor Desk case. Arun asked for “Gmail for stores.” A product rewrite names Priya at T. Nagar, 06:30, inbound trucks: make a late milk truck someone’s job before the fridge is empty. Constraint: ${context.harbor.constraint}. Do not invent extra interviews.`
    }
    return `Use the worked example in “${context.lessonTitle}”. I will not invent a different dataset.`
  }

  if (resolvedAction === "quiz") {
    const { prompt, official } = knowledgeCheck(excerpt)
    const answered = history.some((turn) => turn.role === "assistant" && /knowledge check|what do you do|Reply in your own words|whose problem is this course asking/i.test(turn.content))
    if (answered && question) {
      if (official) {
        return `Your reasoning: check it against the lesson.\n\nThe lesson’s answer: ${simplify(official)}\n\nIf you named a solution (an inbox, a dashboard, or a list-price total) without the user and the job, that is the common mistake this lesson names.`
      }
      return `Check your reply against “${context.lessonTitle}”. I can tell you whether it is supported by the lesson, but I will not dump a graded quiz key.`
    }
    if (prompt) return `${simplify(prompt)}\n\nReply in your own words. I will not reveal the answer until you try.`
    if (context.harbor) {
      return "From this lesson only: whose problem is this course asking you to choose, and why is “Gmail for stores” not that problem yet? Reply, then I will coach."
    }
    return `From this lesson only: what is the valid-row rule, and why does it exist? Reply, then I will coach.`
  }

  if (resolvedAction === "practice") {
    const practice = section(excerpt, "Practice")
    const expected = section(excerpt, "Expected result")
    const attempted = history.some((turn) => turn.role === "assistant" && /practice|without building a pivot|Write four sentences|Try the first/i.test(turn.content))
    if (attempted && question && expected) {
      return `Compare your attempt with the lesson’s expected working. Here is that section so you can check yourself:\n\n${simplify(expected).slice(0, 1200)}`
    }
    if (practice) {
      return `${simplify(practice).slice(0, 1200)}\n\nDo not look up the expected result yet. Try the first item, then come back.`
    }
    if (context.harbor) {
      return `Practice: from the Harbor Desk case, write one problem statement that identifies the affected user and the outcome. Constraint: ${context.harbor.constraint}. I will not write the graded case for you.\n\nDo not look up the expected result yet. Try the first sentence, then come back.`
    }
    return context.practicalOutput
      ? `Practice: produce this from the lesson — ${context.practicalOutput}. I will not do the graded write-up for you.\n\nDo not look up the expected result yet. Try the first item, then come back.`
      : `Try restating the lesson objective in one sentence, then apply it to ${context.northwind?.filename ?? "the lesson context"}.`
  }

  if (!context.excerpt) {
    return `I only have the title “${context.lessonTitle}” for this lesson. Ask about that.`
  }

  if (/certificate|live class|instructor|placement|job guarantee/i.test(question)) {
    return context.harbor
      ? "That is not something this lesson (or this Skylent pilot) claims. This course does not issue a certificate, run live classes, or guarantee a job. Stay with the lesson: choosing a problem from the Harbor Desk case."
      : "That is not something this lesson (or this Skylent pilot) claims. This course does not issue a certificate, run live classes, or guarantee a job. Stay with the lesson: defensible totals from the extract you have."
  }

  if (context.northwind && /what is net revenue|net_revenue|net revenue formula/i.test(question)) {
    return "In this lesson, net revenue on a valid sales row is:\n\nnet_revenue = units × unit_price × (1 − discount_pct / 100)\n\nNW-10001 is 1 × 2199 × 1.00 = 2199. Do not sum unit_price down the column. The extract total after the valid-row rule is ₹812,020."
  }

  const hit = keywordHits(excerpt, question, context)
  if (hit) return hit.slice(0, 1400)

  return `That is not stated as a taught fact in “${context.lessonTitle}”. I can help with: ${context.concepts.join(", ") || context.objective || "the current lesson text"}. ${OFF_TOPIC_REDIRECT}`
}

export function createLessonGroundedProvider(): AiProvider {
  return {
    id: "lesson-grounded",
    async complete() {
      throw new Error("lesson-grounded uses answerLesson()")
    },
    async answerLesson(input) {
      return { answer: groundedAnswer(input) }
    },
  }
}
