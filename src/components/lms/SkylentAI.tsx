import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { askSkylentAi, fetchSkylentAiStatus, type SkylentAiAction, type SkylentAiTurn } from "../../lib/skylent-ai-api"
import { workspaceErrorMessage } from "../../lib/http"
import { getLessonMeta } from "../../content/course-lookups"
import { getCourseLessonContent } from "../../content/course-material"
import { AiMark, AI_NAME, displayAiText } from "../skylent/primitives"
import "./SkylentAI.css"

type Props = {
  courseSlug: string
  lessonId: string
  lessonTitle: string
  lessonNumber?: number
  lessonKind?: string | null
  assessmentOpen?: boolean
  compact: boolean
}

type UiState = "checking" | "unavailable" | "unreachable" | "ready" | "loading" | "error"
type UiTurn = SkylentAiTurn & { basedOn?: string; heldBack?: boolean; followUps?: string[] }

const QUICK: Array<{ action: SkylentAiAction; label: string }> = [
  { action: "explain", label: "Explain simpler" },
  { action: "example", label: "Give an example" },
  { action: "quiz", label: "Quiz me" },
  { action: "practice", label: "Practice question" },
]

const TRACK_SOCRATIC_PROMPTS: Record<string, { label: string; question: string }> = {
  "data-analytics": {
    label: "Debug my SQL logic",
    question: "How should I verify my SQL join and aggregation logic on this lesson without giving me the final query?",
  },
  "product-management": {
    label: "Pressure-test my PRD scope",
    question: "What trade-offs or edge cases should I check in my product scope for this lesson without writing the memo for me?",
  },
  "python-programming": {
    label: "Check my Python edge cases",
    question: "What data-type or boundary edge cases should I test in my Python logic for this lesson without giving me the code?",
  },
  "data-science-ai": {
    label: "Check for data leakage",
    question: "How do I verify my feature engineering and validation split on this lesson to avoid data leakage?",
  },
  "generative-ai": {
    label: "Verify RAG grounding",
    question: "How should I evaluate retrieval grounding and citation accuracy for this lesson step?",
  },
  "full-stack-web": {
    label: "Audit API idempotency",
    question: "What request validation and idempotency checks should I verify for this backend/frontend step?",
  },
}

export function socraticQuickPromptsFor(
  courseSlug: string,
  lessonKind?: string | null,
  assessmentOpen = false,
): Array<{ action: SkylentAiAction; label: string; question?: string }> {
  const base: Array<{ action: SkylentAiAction; label: string; question?: string }> = QUICK.filter(
    (item) => !(assessmentOpen && item.action === "quiz"),
  )
  if (lessonKind === "assignment") {
    return [
      ...base,
      {
        action: "ask",
        label: "Check rubric criteria",
        question: "What are the key criteria my response should cover for this lesson, without writing the answer for me?",
      },
    ]
  }
  const trackPrompt = TRACK_SOCRATIC_PROMPTS[courseSlug]
  if (trackPrompt) {
    return [
      ...base,
      {
        action: "ask",
        label: trackPrompt.label,
        question: trackPrompt.question,
      },
    ]
  }
  return base
}

const UNAVAILABLE = `${AI_NAME} isn't switched on yet.`
const UNREACHABLE = `${AI_NAME} could not be reached.`

export function hinglishIntuitionPromptFor(courseSlug: string, lessonTitle?: string): {
  action: SkylentAiAction
  label: string
  question: string
} {
  return {
    action: "ask",
    label: "🇮🇳 Explain in Simple Hinglish",
    question: `Explain the core first-principles intuition of "${lessonTitle ?? courseSlug}" in simple Hinglish with a practical Indian real-world analogy, without giving away any quiz or assignment answers.`,
  }
}

function caseChipFor(courseSlug: string, caseLabel?: string | null): string | null {
  if (caseLabel) return caseLabel
  if (courseSlug === "data-analytics") return "Northwind dataset"
  if (courseSlug === "product-management") return "Harbor Desk case"
  if (courseSlug === "python-programming") return "Python ETL audit log"
  if (courseSlug === "data-science-ai") return "Churn cohort dataset"
  if (courseSlug === "generative-ai") return "Enterprise RAG corpus"
  if (courseSlug === "full-stack-web") return "Idempotent ledger API"
  return null
}

function integrityNotice(kind: string | null | undefined, open: boolean): string | null {
  if (!open) return null
  if (kind === "quiz") return `This check is open — ${AI_NAME} explains concepts and gives practice without revealing quiz answers.`
  if (kind === "assignment") return `This assignment is open — ${AI_NAME} helps you structure and verify your work without writing your submission.`
  return null
}

function friendlyError(err: unknown): { message: string; unavailable: boolean } {
  const raw = workspaceErrorMessage(err)
  if (/isn't available|not_configured|not switched on/i.test(raw)) return { message: UNAVAILABLE, unavailable: true }
  if (/couldn't answer right now/i.test(raw)) return { message: `${AI_NAME} couldn't answer. Try again.`, unavailable: false }
  if (/sign in to continue/i.test(raw)) return { message: "Your session has ended. Sign in again to ask.", unavailable: false }
  if (/Enrolment required|Lesson locked|do not have access/i.test(raw)) {
    return { message: `${AI_NAME} cannot open this lesson yet.`, unavailable: false }
  }
  return { message: `${AI_NAME} couldn't answer. Try again.`, unavailable: false }
}

function extractSection(body: string, headingKeyword: string): string {
  if (!body) return ""
  const re = new RegExp(`##\\s+[^\\n]*${headingKeyword}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i")
  const match = body.match(re)
  return match?.[1]?.trim() ?? ""
}

function cleanExcerpt(raw: string, maxLen = 680): string {
  return raw
    .replace(/^\|.*\|$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLen)
}

function buildSmartLessonAnswer(
  courseSlug: string,
  lessonId: string,
  lessonTitle: string,
  lessonKind: string | null | undefined,
  action: SkylentAiAction,
  question: string,
  assessmentOpen: boolean,
): { answer: string; basedOn: string; related: string; heldBack: boolean; followUps: string[] } {
  const qLower = question.toLowerCase().trim()
  const meta = getLessonMeta(courseSlug, lessonId)
  const fullContent = getCourseLessonContent(courseSlug, lessonId)
  const rawBody = fullContent?.body ?? ""
  const explainSec = extractSection(rawBody, "Explain")
  const workedSec = extractSection(rawBody, "Worked example")
  const practiceSec = extractSection(rawBody, "Practice")
  const expectedSec = extractSection(rawBody, "Expected")
  const knowledgeSec = extractSection(rawBody, "Knowledge check")

  const objective = meta?.objective ?? lessonTitle
  const whyItMatters = meta?.whyItMatters ?? "Builds verifiable decision-making and execution proof."
  const concepts = meta?.concepts?.slice(0, 4).join(", ") || lessonTitle
  const output = meta?.practicalOutput ?? "Complete lesson check"
  const caseName = caseChipFor(courseSlug) ?? "Workspace"

  if (assessmentOpen && /answer key|exact answer|write my|solve this quiz|give me the answer/i.test(qLower)) {
    return {
      answer: `• **Open Assessment Guardrail:** I cannot reveal the graded answer key while your check is open.\n\n• **How to Solve It Yourself:** Focus on **${concepts}** and verify your logic against **${caseName}**.\n\n• **Goal:** ${objective}`,
      basedOn: lessonTitle,
      related: concepts,
      heldBack: true,
      followUps: ["Explain the core concept simpler", "Give me a worked example", "🇮🇳 Explain in Simple Hinglish"],
    }
  }

  // 1. Hinglish mode
  if (/hinglish|🇮🇳|hindi|samjhao|desi/i.test(qLower)) {
    const excerpt = cleanExcerpt(explainSec || workedSec, 380)
    return {
      answer: [
        `🇮🇳 **Hinglish Intuition — ${lessonTitle}:**`,
        `• **Asli Goal:** ${objective}`,
        `• **Simple Desi Analogy:** Socho aap Swiggy, Flipkart, ya Razorpay ke live dataset/product par kaam kar रहे ho (${caseName}). Agar aap bina **${concepts}** verify kiye seedha output nikaloge, toh returned orders ya galat assumption pura decision kharab kar dega.`,
        excerpt ? `• **Lesson Summary:** ${excerpt}` : `• **Why It Matters:** ${whyItMatters}`,
        `• **Next Step:** Neeche **${output}** try karo, ya apna SQL/Python code ya doubt yahan paste karo!`,
      ].join("\n\n"),
      basedOn: `${lessonTitle} · Hinglish`,
      related: concepts,
      heldBack: false,
      followUps: ["Give me a runnable example", "Quiz me on this lesson", "How do I complete the assignment?"],
    }
  }

  // 2. Worked Example / SQL / Python / Code Debugging
  if (action === "example" || /example|udaharan|sample|query|code|sql|python|debug|select |def |error|syntax/i.test(qLower)) {
    const codeSnippet =
      courseSlug === "data-analytics"
        ? "```sql\nSELECT\n  category,\n  COUNT(*) AS valid_orders,\n  ROUND(SUM(units * unit_price * (1.0 - discount_pct / 100.0)), 2) AS net_revenue\nFROM northwind_sales\nWHERE units > 0\n  AND unit_price > 0\n  AND LOWER(returned) = 'no'\nGROUP BY category\nORDER BY net_revenue DESC;\n```"
        : courseSlug === "python-programming" || courseSlug === "data-science-ai" || courseSlug === "generative-ai"
          ? "```python\ndef filter_valid_rows(rows: list[dict]) -> list[dict]:\n    return [\n        r for r in rows\n        if float(r.get('units', 0)) > 0\n        and float(r.get('unit_price', 0)) > 0\n        and str(r.get('returned', 'no')).lower() == 'no'\n    ]\n```"
          : ""
    const workedText = cleanExcerpt(workedSec || explainSec, 520)
    return {
      answer: [
        `**Worked Example & Debugging Guide (${caseName}):**`,
        workedText || `• **Scenario:** Apply **${concepts}** directly to **${caseName}**.`,
        codeSnippet,
        `• **Key Verification Rule:** Before finalizing **${output}**, confirm you checked boundary conditions and excluded invalid/returned records.`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      basedOn: lessonTitle,
      related: `${caseName} · Example`,
      heldBack: false,
      followUps: ["🇮🇳 Explain in Simple Hinglish", "What edge cases break this?", "Quiz me on this lesson"],
    }
  }

  // 3. Quiz Me / Concept Check
  if (action === "quiz" || /quiz|test me/i.test(qLower)) {
    const kc = cleanExcerpt(knowledgeSec, 480)
    return {
      answer: [
        `**Interactive Concept Check — ${lessonTitle}:**`,
        kc || `**Question:** In **${caseName}**, what happens to your final output (**${output}**) if you skip **${concepts}**? Why does that break decision-making?`,
        `💡 *Reply in 1–2 sentences below and I will coach your answer!*`,
      ].join("\n\n"),
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
      followUps: ["Give me a hint", "Show the worked example first", "🇮🇳 Explain in Simple Hinglish"],
    }
  }

  // 4. Practice / Rubric / How to Complete
  if (action === "practice" || /practice|rubric|criteria|how to|complete|assignment|submission|step/i.test(qLower)) {
    const pracText = cleanExcerpt(practiceSec || expectedSec, 520)
    const rubricItems = fullContent?.assignment?.rubric ?? []
    return {
      answer: [
        `**Step-by-Step Execution & Rubric Checklist — ${lessonTitle}:**`,
        `• **1. Objective:** ${objective}`,
        `• **2. Core Concepts Required:** ${concepts}`,
        pracText ? `• **3. Lesson Practice Task:**\n${pracText}` : `• **3. Required Output:** ${output}`,
        rubricItems.length > 0 ? `• **4. Grading Rubric:** ${rubricItems.join(" · ")}` : `• **4. Why It Matters:** ${whyItMatters}`,
      ].join("\n\n"),
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
      followUps: ["Give an example", "🇮🇳 Explain in Simple Hinglish", "Quiz me"],
    }
  }

  // 5. Interview Questions
  if (/interview|hiring|recruiter/i.test(qLower)) {
    return {
      answer: [
        `**Top Interview Questions from "${lessonTitle}":**`,
        `• **Q1 (First Principles):** How do you apply **${concepts}** when working on **${caseName}**?`,
        `• **Q2 (Trade-offs & Edge Cases):** ${whyItMatters} What breaks if a team skips this check?`,
        `• **Q3 (Proof of Work):** Walk me through how you produced **${output}** and verified its accuracy.`,
      ].join("\n\n"),
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
      followUps: ["How should I answer Q1?", "Give an example", "🇮🇳 Explain in Simple Hinglish"],
    }
  }

  // 6. Keyword search inside the actual lesson markdown body for any custom user question!
  if (rawBody && qLower.length > 2 && action === "ask") {
    const terms = qLower
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !["what", "when", "where", "which", "this", "that", "with", "from", "explain", "lesson", "tell", "about", "simpler"].includes(w))
    const blocks = rawBody
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 40 && !b.startsWith("#") && !b.startsWith("|"))
    let bestBlock = ""
    let bestScore = 0
    for (const b of blocks) {
      const lowerB = b.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (lowerB.includes(t)) score += 2
      }
      if (score > bestScore) {
        bestScore = score
        bestBlock = b
      }
    }
    if (bestBlock && bestScore >= 2) {
      return {
        answer: [
          `**From "${lessonTitle}" (${caseName}):**`,
          cleanExcerpt(bestBlock, 600),
          `• **Key Takeaway:** Connect **${concepts}** directly to **${output}**.`,
        ].join("\n\n"),
        basedOn: lessonTitle,
        related: concepts,
        heldBack: false,
        followUps: ["🇮🇳 Explain in Simple Hinglish", "Give an example", "Quiz me"],
      }
    }
  }

  // 7. Default Explain Simpler / Full Grounded Breakdown
  const explainBody = cleanExcerpt(explainSec || workedSec || rawBody, 520)
  return {
    answer: [
      `**${lessonTitle} — Step-by-Step Breakdown:**`,
      explainBody || `• **Goal:** ${objective}`,
      `• **Key Concepts:** ${concepts}`,
      `• **Why It Matters:** ${whyItMatters}`,
      `• **Practical Output:** ${output}`,
    ].join("\n\n"),
    basedOn: lessonTitle,
    related: concepts,
    heldBack: false,
    followUps: ["🇮🇳 Explain in Simple Hinglish", "Give an example", "Quiz me"],
  }
}

function renderInlineMarkdown(line: string): ReactNode[] {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
      return <strong key={i}>{tok.slice(2, -2)}</strong>
    }
    if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
      return (
        <code
          key={i}
          style={{
            background: "#f1f5f9",
            padding: "1px 5px",
            borderRadius: 4,
            fontFamily: "var(--font-mono)",
            fontSize: "0.9em",
          }}
        >
          {tok.slice(1, -1)}
        </code>
      )
    }
    return tok
  })
}

function AnswerText({ text }: { text: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const cleaned = displayAiText(text)
  const parts = cleaned.split(/```[a-zA-Z]*\n?/)
  return (
    <>
      {parts.map((part, index) => {
        const body = part.replace(/^\n+|\s+$/g, "")
        if (!body) return null
        if (index % 2 === 1) {
          return (
            <div key={index} style={{ position: "relative", marginTop: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => {
                  try {
                    void navigator.clipboard.writeText(body)
                    setCopiedIndex(index)
                    setTimeout(() => setCopiedIndex(null), 1800)
                  } catch {}
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  padding: "2px 8px",
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "#f8fafc",
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copiedIndex === index ? "✓ Copied" : "Copy"}
              </button>
              <pre className="os-ai-code" style={{ paddingTop: 26 }}>
                {body}
              </pre>
            </div>
          )
        }
        return (
          <div key={index} className="os-ai-text">
            {body.split("\n\n").map((para, pIdx) => (
              <p key={pIdx} style={{ margin: pIdx === 0 ? 0 : "8px 0 0" }}>
                {renderInlineMarkdown(para)}
              </p>
            ))}
          </div>
        )
      })}
    </>
  )
}

export default function SkylentAI({
  courseSlug,
  lessonId,
  lessonTitle,
  lessonNumber,
  lessonKind,
  assessmentOpen = false,
  compact,
}: Props) {
  const inputId = useId()
  const sheetId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef(null as AbortController | null)
  const seqRef = useRef(0)
  const [open, setOpen] = useState(!compact)
  const [draft, setDraft] = useState("")
  const [turns, setTurns] = useState<UiTurn[]>([])
  const [ui, setUi] = useState<UiState>("ready")
  const [error, setError] = useState<string | null>(null)
  const [dockBottom, setDockBottom] = useState(12)
  const [doubtEscalated, setDoubtEscalated] = useState(false)

  useEffect(() => {
    abortRef.current?.abort()
    seqRef.current += 1
    setTurns([])
    setDraft("")
    setError(null)
    setDoubtEscalated(false)
  }, [courseSlug, lessonId, lessonTitle])

  useEffect(() => {
    setOpen(!compact)
  }, [compact])

  useEffect(() => {
    if (!compact) {
      setDockBottom(12)
      return
    }
    const viewport = window.visualViewport
    const update = () => {
      const inset = viewport
        ? Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
        : 0
      setDockBottom(12 + inset)
    }
    update()
    viewport?.addEventListener("resize", update)
    viewport?.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    return () => {
      viewport?.removeEventListener("resize", update)
      viewport?.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [compact, open])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    void fetchSkylentAiStatus({ courseSlug, lessonId, signal: controller.signal })
      .then((status) => {
        if (cancelled) return
        if (status.access === "enrolment_required" || status.access === "not_found") {
          setError(`${AI_NAME} cannot open this lesson yet.`)
          setUi("error")
          return
        }
        if (status.access === "locked") {
          setError("Finish the previous lesson before asking about this one.")
          setUi("error")
          return
        }
        setUi("ready")
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return
        setUi("ready")
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [courseSlug, lessonId])

  useEffect(() => {
    const root = listRef.current
    if (!root) return
    root.scrollTop = root.scrollHeight
  }, [turns, ui])

  useEffect(() => {
    if (!compact || !open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
      queueMicrotask(() => toggleRef.current?.focus())
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [compact, open])

  const busy = ui === "loading"
  const off = ui === "unavailable" || ui === "unreachable"
  const inputDisabled = off || ui === "checking" || busy
  const notice = integrityNotice(lessonKind, assessmentOpen)

  function clearConversation() {
    abortRef.current?.abort()
    seqRef.current += 1
    setTurns([])
    setDraft("")
    setError(null)
    if (ui === "error" || ui === "loading") setUi("ready")
    inputRef.current?.focus()
  }

  async function submit(action: SkylentAiAction, extra?: string) {
    if (busy || off || ui === "checking") return
    const text = (extra ?? (action === "ask" ? draft : "")).trim()
    if (action === "ask" && !text) return

    const label = QUICK.find((item) => item.action === action)?.label
    const userTurn: UiTurn = { role: "user", content: action === "ask" ? text : label ?? text }
    const history = turns.slice(-8).map((turn) => ({ role: turn.role, content: turn.content }))
    const pending = [...turns, userTurn]
    const requestId = ++seqRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setTurns(pending)
    setDraft("")
    setUi("loading")
    setError(null)

    const smart = buildSmartLessonAnswer(courseSlug, lessonId, lessonTitle, lessonKind, action, text, assessmentOpen)
    const timeoutId = window.setTimeout(() => controller.abort(), 3500)

    try {
      const result = await askSkylentAi({
        courseSlug,
        lessonId,
        action,
        question: text,
        messages: history,
        signal: controller.signal,
      })
      window.clearTimeout(timeoutId)
      if (requestId !== seqRef.current) return
      const isGenericMiss =
        /That is not stated as a taught fact in|I only have the title|not an authored Skylent flagship/i.test(result.answer)
      const finalAnswer = isGenericMiss
        ? smart
        : {
            answer: result.answer,
            basedOn: result.basedOn || lessonTitle,
            related: result.related,
            heldBack: result.refused === true,
            followUps: smart.followUps,
          }
      setTurns([
        ...pending,
        {
          role: "assistant",
          content: finalAnswer.answer,
          related: finalAnswer.related,
          basedOn: finalAnswer.basedOn,
          heldBack: finalAnswer.heldBack,
          followUps: finalAnswer.followUps,
        },
      ])
      setUi("ready")
    } catch (err) {
      window.clearTimeout(timeoutId)
      if (requestId !== seqRef.current) return
      const parsed = friendlyError(err)
      const isTimeout = err instanceof DOMException && err.name === "AbortError"
      if (isTimeout || parsed.unavailable || /couldn't answer/i.test(parsed.message)) {
        setTurns([
          ...pending,
          {
            role: "assistant",
            content: smart.answer,
            related: smart.related,
            basedOn: smart.basedOn,
            heldBack: smart.heldBack,
            followUps: smart.followUps,
          },
        ])
        setUi("ready")
        return
      }
      setError(parsed.message)
      setUi("error")
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submit("ask")
    }
  }

  const exchanges: Array<{ question: UiTurn; answer: UiTurn | null }> = []
  turns.forEach((turn, index) => {
    if (turn.role !== "user") return
    const next = turns[index + 1]
    exchanges.push({ question: turn, answer: next && next.role === "assistant" ? next : null })
  })

  const head = (
    <header className="os-ai-head">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <AiMark />
        {turns.length > 0 ? (
          <button
            type="button"
            onClick={clearConversation}
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.24)",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Reset Chat
          </button>
        ) : (
          <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>Interactive Lesson Tutor</span>
        )}
      </div>
      <p className="os-ai-context" style={{ marginTop: 6, fontSize: 12.5, color: "#e2e8f0" }}>
        {lessonNumber ? `Lesson ${lessonNumber}: ` : ""}
        {lessonTitle}
      </p>
    </header>
  )

  const allQuickPrompts = socraticQuickPromptsFor(courseSlug, lessonKind, assessmentOpen)
  const hinglishPrompt = hinglishIntuitionPromptFor(courseSlug, lessonTitle)

  const body = (
    <>
      <div className="os-ai-scroll" ref={listRef}>
        {notice ? <p className="os-ai-notice">{notice}</p> : null}

        {exchanges.length === 0 && ui === "ready" ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                padding: "11px 13px",
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: 12.5,
                color: "#334155",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#0f172a", display: "block", marginBottom: 3 }}>
                Ask anything about “{lessonTitle}”
              </strong>
              Paste SQL/Python code to debug, ask for a step-by-step example, or tap a starter below:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allQuickPrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={inputDisabled}
                  onClick={() => void submit(item.action, item.question)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 999,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                disabled={inputDisabled}
                onClick={() => void submit(hinglishPrompt.action, hinglishPrompt.question)}
                style={{
                  padding: "6px 11px",
                  borderRadius: 999,
                  border: "1px solid #ddd6fe",
                  background: "#f5f3ff",
                  color: "#5142b5",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🇮🇳 Explain in Simple Hinglish
              </button>
            </div>
          </div>
        ) : null}

        {exchanges.map((exchange, index) => (
          <article key={index} className="os-ai-turn">
            <div
              style={{
                background: "#f1f5f9",
                padding: "8px 12px",
                borderRadius: "12px 12px 2px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 10,
              }}
            >
              {exchange.question.content}
            </div>
            {exchange.answer ? (
              <div
                className={exchange.answer.heldBack ? "os-ai-block is-held" : "os-ai-block"}
                style={{
                  marginTop: 0,
                  padding: "10px 12px",
                  borderRadius: "2px 12px 12px 12px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <AnswerText text={exchange.answer.content} />
                {exchange.answer.followUps && exchange.answer.followUps.length > 0 && index === exchanges.length - 1 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                    {exchange.answer.followUps.map((f) => (
                      <button
                        key={f}
                        type="button"
                        disabled={inputDisabled}
                        onClick={() => void submit("ask", f)}
                        style={{
                          padding: "4px 9px",
                          borderRadius: 999,
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          color: "#5142b5",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ↳ {f}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}

        {ui === "loading" ? (
          <p className="os-ai-idle" aria-live="polite" style={{ fontSize: 12.5, color: "#64748b" }}>
            Thinking…
          </p>
        ) : null}

        {ui === "error" && error ? (
          <p className="os-error" role="alert">
            {error}{" "}
            <button type="button" className="os-link" onClick={() => setUi("ready")}>
              Dismiss
            </button>
          </p>
        ) : null}
      </div>

      <div className="os-ai-foot">
        <form
          className="os-ai-form"
          style={{ marginTop: 0 }}
          onSubmit={(event) => {
            event.preventDefault()
            void submit("ask")
          }}
        >
          <label className="sr-only" htmlFor={inputId}>
            Ask about this lesson
          </label>
          <div className="os-ai-form-row">
            <textarea
              ref={inputRef}
              id={inputId}
              className="os-ai-input"
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a doubt, paste SQL/Python code, or type 'Hinglish'..."
              disabled={inputDisabled}
              maxLength={2000}
              autoComplete="off"
              enterKeyHint="send"
            />
            <button type="submit" className="os-ai-send" aria-label="Send question" disabled={inputDisabled || !draft.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
        <div className="os-ai-sla" style={{ marginTop: 8, fontSize: 11.5 }}>
          {doubtEscalated ? (
            <p role="status" style={{ margin: 0, color: "#047857", fontWeight: 600 }}>
              ✓ Flagged for Faculty TA review (20-min SLA).
            </p>
          ) : (
            <button
              type="button"
              className="os-link"
              style={{ fontSize: 11.5, color: "#64748b" }}
              onClick={() => {
                setDoubtEscalated(true)
                void fetch(`/api/v1/lms/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/doubt`, {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ lessonTitle, question: draft.trim() || undefined }),
                }).catch(() => undefined)
              }}
            >
              Need human help? Flag for Faculty TA review (20-min SLA)
            </button>
          )}
        </div>
      </div>
    </>
  )

  if (compact) {
    return (
      <section
        className={open ? "os-ai is-compact is-open" : "os-ai is-compact"}
        aria-label={AI_NAME}
        aria-busy={busy}
        style={{ bottom: dockBottom }}
      >
        <button
          ref={toggleRef}
          type="button"
          className="os-ai-toggle"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => {
            setOpen((value) => {
              const next = !value
              if (next) queueMicrotask(() => inputRef.current?.focus())
              return next
            })
          }}
        >
          <AiMark />
          <span>{open ? "Close" : "Study Help & Doubt Desk"}</span>
        </button>
        {open ? (
          <div className="os-ai-sheet" id={sheetId}>
            {head}
            {body}
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <aside className="os-ai" aria-label={AI_NAME} aria-busy={busy}>
      {head}
      {body}
    </aside>
  )
}
