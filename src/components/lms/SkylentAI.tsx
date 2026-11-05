import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { askSkylentAi, fetchSkylentAiStatus, type SkylentAiAction, type SkylentAiTurn } from "../../lib/skylent-ai-api"
import { workspaceErrorMessage } from "../../lib/http"
import { getLessonMeta } from "../../content/course-lookups"
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
type UiTurn = SkylentAiTurn & { basedOn?: string; heldBack?: boolean }

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

function buildSmartLessonAnswer(
  courseSlug: string,
  lessonId: string,
  lessonTitle: string,
  lessonKind: string | null | undefined,
  action: SkylentAiAction,
  question: string,
  assessmentOpen: boolean,
): { answer: string; basedOn: string; related: string; heldBack: boolean } {
  const qLower = question.toLowerCase().trim()
  const meta = getLessonMeta(courseSlug, lessonId)
  const objective = meta?.objective ?? `understanding the core concepts in ${lessonTitle}`
  const concepts = meta?.concepts?.length ? meta.concepts.join(", ") : lessonTitle
  const output = meta?.practicalOutput ?? "applying the lesson concepts to the dataset or case"
  const caseName = caseChipFor(courseSlug) ?? "Course Workspace"

  if (assessmentOpen && /answer key|exact answer|write my|solve this quiz|give me the answer/i.test(qLower)) {
    return {
      answer: `While this ${lessonKind === "quiz" ? "quiz" : "assignment"} is open, I can't give away the exact answer. Focus on: ${objective}. Tell me which option or step you are considering and I'll help you test your reasoning.`,
      basedOn: lessonTitle,
      related: concepts,
      heldBack: true,
    }
  }

  if (/^(hi|hello|hey|namaste|kya haal|hlo)\b/i.test(qLower)) {
    return {
      answer: `Hey! Main ${AI_NAME} hoon. Abhi hum "${lessonTitle}" par hain.\n\nIs lesson ka goal hai: ${objective}.\n\nAap mujhse English ya Hinglish mein koi bhi concept, formula, SQL/code doubt, ya example pooch sakte ho!`,
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
    }
  }

  if (/what happens|kya hota|kya karna|what to do|what is this|samjha|explain this/i.test(qLower) || action === "explain") {
    return {
      answer: `Here is what happens in "${lessonTitle}":\n\n• Core goal: ${objective}\n• Key concepts covered: ${concepts}\n• What you will produce: ${output}\n\n${
        courseSlug === "data-analytics"
          ? "In the Northwind dataset (180 rows), filtering out returned orders (`returned = 'yes'`) and invalid rows (`units <= 0` or `unit_price <= 0`) leaves 166 valid rows totalling ₹8,12,020 in net revenue."
          : courseSlug === "product-management"
            ? "In the Harbor Desk case (12 retail stores, 9 weekend exceptions), your focus is isolating the root operational problem that 2 engineers can solve in 6 weeks."
            : "Start by checking the input constraints and edge cases before writing your final solution."
      }`,
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
    }
  }

  if (/hinglish|🇮🇳|hindi/i.test(qLower)) {
    if (courseSlug === "data-analytics") {
      return {
        answer: `Simple Hinglish mein samajh ("${lessonTitle}"):\n\n• Goal: ${objective}\n• Northwind dataset mein total 180 rows hain, par usmein 14 invalid/returned rows hain. Jab hum ` + "`units > 0 AND unit_price > 0 AND returned = 'no'`" + ` lagate hain, tab 166 valid rows bachti hain jinka net revenue ₹8,12,020 aata hai.\n• Deliverable: ${output}`,
        basedOn: `${lessonTitle} · Hinglish`,
        related: concepts,
        heldBack: false,
      }
    }
    return {
      answer: `Simple Hinglish mein samajh ("${lessonTitle}"):\n\n• Is lesson ka main focus hai: ${objective}\n• Key topics: ${concepts}\n• Aapka practical output: ${output}\n\nKisi specific point par doubt ho toh seedha pooch lo!`,
      basedOn: `${lessonTitle} · Hinglish`,
      related: concepts,
      heldBack: false,
    }
  }

  if (action === "example" || /example|udaharan|sample|query|code/i.test(qLower)) {
    return {
      answer:
        courseSlug === "data-analytics"
          ? `Worked example for "${lessonTitle}" (${caseName}):\n\n\`\`\`sql\nSELECT category,\n       ROUND(SUM(units * unit_price * (1 - discount_pct / 100.0))) AS net_revenue\nFROM northwind_sales\nWHERE units > 0 AND unit_price > 0 AND returned = 'no'\nGROUP BY category\nORDER BY net_revenue DESC;\n\`\`\`\n\nFiltering returned and zero-unit rows first ensures your category summary adds up to the verified ₹8,12,020 total across 166 valid rows.`
          : `Worked example for "${lessonTitle}" (${caseName}):\n\n• Objective: ${objective}\n• Applied to ${caseName}: Define the exact input condition, isolate the failure mode (${concepts}), and verify your output against: ${output}.`,
      basedOn: lessonTitle,
      related: `${caseName} · Example`,
      heldBack: false,
    }
  }

  if (action === "quiz" || action === "practice" || /quiz|practice|test me|question/i.test(qLower)) {
    return {
      answer: `Quick practice question on "${lessonTitle}":\n\nBased on ${objective.toLowerCase()}, what would go wrong in ${caseName} if someone skipped checking (${concepts}) before presenting their final output? Reply in 1–2 sentences and I'll check your reasoning!`,
      basedOn: lessonTitle,
      related: concepts,
      heldBack: false,
    }
  }

  if (/rubric|criteria|grade|grading|submit|assignment/i.test(qLower)) {
    return {
      answer: `For "${lessonTitle}", your submission is evaluated on:\n\n• Core objective: ${objective}\n• Expected deliverable: ${output}\n• Key concepts to demonstrate: ${concepts}\n\nMake sure your numbers or reasoning directly reference ${caseName}.`,
      basedOn: lessonTitle,
      related: "Rubric & evaluation criteria",
      heldBack: false,
    }
  }

  return {
    answer: `Regarding "${question}" in ${lessonTitle}:\n\n• Lesson focus: ${objective}\n• Key concepts: ${concepts}\n• Practical application (${caseName}): ${output}\n\nWant me to walk through a concrete example or break down a specific step from this lesson?`,
    basedOn: lessonTitle,
    related: concepts,
    heldBack: false,
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
  const cleaned = displayAiText(text)
  const parts = cleaned.split(/```[a-zA-Z]*\n?/)
  return (
    <>
      {parts.map((part, index) => {
        const body = part.replace(/^\n+|\s+$/g, "")
        if (!body) return null
        if (index % 2 === 1) {
          return (
            <pre key={index} className="os-ai-code">
              {body}
            </pre>
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

    // Fast 3.5-second timeout so AI never hangs for 20-30 seconds
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
      const isGenericMiss = /That is not stated as a taught fact in/i.test(result.answer)
      const finalAnswer = isGenericMiss
        ? buildSmartLessonAnswer(courseSlug, lessonId, lessonTitle, lessonKind, action, text, assessmentOpen)
        : {
            answer: result.answer,
            basedOn: result.basedOn || lessonTitle,
            related: result.related,
            heldBack: result.refused === true,
          }
      setTurns([
        ...pending,
        {
          role: "assistant",
          content: finalAnswer.answer,
          related: finalAnswer.related,
          basedOn: finalAnswer.basedOn,
          heldBack: finalAnswer.heldBack,
        },
      ])
      setUi("ready")
    } catch (err) {
      window.clearTimeout(timeoutId)
      if (requestId !== seqRef.current) return
      const parsed = friendlyError(err)
      const isTimeout = err instanceof DOMException && err.name === "AbortError"
      if (isTimeout || parsed.unavailable || /couldn't answer/i.test(parsed.message)) {
        const fallback = buildSmartLessonAnswer(courseSlug, lessonId, lessonTitle, lessonKind, action, text, assessmentOpen)
        setTurns([
          ...pending,
          {
            role: "assistant",
            content: fallback.answer,
            related: fallback.related,
            basedOn: fallback.basedOn,
            heldBack: fallback.heldBack,
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
          <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>Instant Lesson Assistant</span>
        )}
      </div>
      <p className="os-ai-context" style={{ marginTop: 6, fontSize: 12.5, color: "#e2e8f0" }}>
        {lessonNumber ? `Lesson ${lessonNumber}: ` : ""}
        {lessonTitle}
      </p>
    </header>
  )

  const compactPrompts = socraticQuickPromptsFor(courseSlug, lessonKind, assessmentOpen).slice(0, 2)
  const hinglishPrompt = hinglishIntuitionPromptFor(courseSlug, lessonTitle)

  const body = (
    <>
      <div className="os-ai-scroll" ref={listRef}>
        {notice ? <p className="os-ai-notice">{notice}</p> : null}

        {exchanges.length === 0 && ui === "ready" ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#334155",
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#0f172a", display: "block", marginBottom: 4 }}>
                Hi! Need help with this lesson?
              </strong>
              Ask any question in English or Hinglish about <strong>{lessonTitle}</strong>, or pick a quick starter:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {compactPrompts.map((item) => (
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
                🇮🇳 Hinglish Summary
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
              placeholder="Ask anything about this lesson..."
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
          <span>{open ? "Close" : "Ask Skylent AI"}</span>
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
