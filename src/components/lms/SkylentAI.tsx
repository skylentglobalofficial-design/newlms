import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { askSkylentAi, fetchSkylentAiStatus, type SkylentAiAction, type SkylentAiTurn } from "../../lib/skylent-ai-api"
import { workspaceErrorMessage } from "../../lib/http"
import { AiMark, AI_NAME, displayAiText } from "../skylent/primitives"
import "./SkylentAI.css"

type Props = {
  courseSlug: string
  lessonId: string
  lessonTitle: string
  /** 1-based position of the lesson in the course, for the context line. */
  lessonNumber?: number
  /** Lesson kind from the course workspace: notes, video, quiz or assignment. */
  lessonKind?: string | null
  /** True while this check or assignment is still open for the learner (server policy open_quiz / open_assignment). */
  assessmentOpen?: boolean
  compact: boolean
}

type UiState = "checking" | "unavailable" | "unreachable" | "ready" | "loading" | "error"

/** What the panel keeps per turn. Only `role` and `content` are ever sent back to the API. */
type UiTurn = SkylentAiTurn & { basedOn?: string; heldBack?: boolean }

/** The four real modes of POST /lms/ai/ask (plus the free question, mode "ask"). Nothing else exists. */
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

/** Courses whose lesson text, concepts and case facts the server loads (server/src/lib/skylent-ai/authored.ts). */
const AUTHORED_AI_COURSES = new Set([
  "data-analytics",
  "product-management",
  "python-programming",
  "data-science-ai",
  "generative-ai",
  "full-stack-web",
])

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

/** Case facts the server attaches to the lesson context (server/src/lib/skylent-ai/authored.ts). */
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

/**
 * Exactly what the server puts in the prompt. Authored courses: the lesson excerpt, its key concepts
 * and the course case facts (Northwind results are withheld while an assessment is open). Any other
 * course: only the course, module and lesson titles. Never progress, projects, evidence or career data.
 */
function contextChips(courseSlug: string, caseLabel: string | null, assessmentOpen: boolean): Array<{ label: string; off?: boolean }> {
  if (!AUTHORED_AI_COURSES.has(courseSlug)) {
    return [{ label: "Lesson title only" }]
  }
  const chips: Array<{ label: string; off?: boolean }> = [{ label: "Lesson text" }, { label: "Key concepts" }]
  if (caseLabel) {
    chips.push({ label: assessmentOpen && courseSlug === "data-analytics" ? `${caseLabel} · results withheld` : caseLabel })
  }
  return chips
}

/** Academic integrity notice, only while the assessment is open. The server enforces the rule; this states it. */
function integrityNotice(kind: string | null | undefined, open: boolean): string | null {
  if (!open) return null
  if (kind === "quiz") return `This check is still open. ${AI_NAME} explains concepts and gives similar practice. It does not answer the questions.`
  if (kind === "assignment") return `This assignment is still open. ${AI_NAME} gives hints and feedback. It does not write your submission.`
  return null
}

function friendlyError(err: unknown): { message: string; unavailable: boolean } {
  const raw = workspaceErrorMessage(err)
  if (/isn't available/i.test(raw)) return { message: UNAVAILABLE, unavailable: true }
  if (/couldn't answer right now/i.test(raw)) return { message: `${AI_NAME} couldn't answer. Try again.`, unavailable: false }
  if (/sign in to continue/i.test(raw)) return { message: "Your session has ended. Sign in again to ask.", unavailable: false }
  if (/Enrolment required|Lesson locked|do not have access/i.test(raw)) {
    return { message: `${AI_NAME} cannot open this lesson yet.`, unavailable: false }
  }
  return { message: `${AI_NAME} couldn't answer. Try again.`, unavailable: false }
}

/** The answer as returned, with fenced code shown on the workbench. No content is added. */
function AnswerText({ text }: { text: string }) {
  const parts = displayAiText(text).split(/```[a-zA-Z]*\n?/)
  return (
    <>
      {parts.map((part, index) => {
        const body = part.replace(/^\n+|\s+$/g, "")
        if (!body) return null
        return index % 2 === 1 ? (
          <pre key={index} className="os-ai-code">{body}</pre>
        ) : (
          <p key={index} className="os-ai-text">{body}</p>
        )
      })}
    </>
  )
}

export default function SkylentAI({ courseSlug, lessonId, lessonTitle, lessonNumber, lessonKind, assessmentOpen = false, compact }: Props) {
  const inputId = useId()
  const sheetId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0)
  const [open, setOpen] = useState(!compact)
  const [draft, setDraft] = useState("")
  const [turns, setTurns] = useState<UiTurn[]>([])
  const [caseLabel, setCaseLabel] = useState<string | null>(caseChipFor(courseSlug))
  const [ui, setUi] = useState<UiState>("checking")
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
    setCaseLabel(caseChipFor(courseSlug))
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
    setUi("checking")
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
        if (status.configured === false || status.available === false) {
          setUi("unavailable")
          return
        }
        setUi("ready")
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return
        setUi("unreachable")
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [courseSlug, lessonId])

  useEffect(() => {
    const root = listRef.current
    if (!root) return
    const last = root.querySelector(".os-ai-turn:last-of-type")
    if (!(last instanceof HTMLElement)) return
    const top = last.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
    root.scrollTop = Math.max(0, top - 8)
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
  const chips = contextChips(courseSlug, caseChipFor(courseSlug, caseLabel), assessmentOpen)
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
    // The request carries the lesson id, the mode, the learner's own words and the visible
    // conversation. Nothing about the lesson's questions or answers is ever added here.
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

    try {
      const result = await askSkylentAi({
        courseSlug,
        lessonId,
        action,
        question: text,
        messages: history,
        signal: controller.signal,
      })
      if (requestId !== seqRef.current) return
      setTurns([
        ...pending,
        {
          role: "assistant",
          content: result.answer,
          related: result.related,
          basedOn: result.basedOn || lessonTitle,
          // The server decides: `refused` is set when the academic-integrity policy held the answer back.
          heldBack: result.refused === true,
        },
      ])
      setCaseLabel(result.caseLabel ?? caseChipFor(courseSlug))
      setUi("ready")
    } catch (err) {
      if (requestId !== seqRef.current) return
      if (err instanceof DOMException && err.name === "AbortError") return
      const parsed = friendlyError(err)
      setError(parsed.message)
      setUi(parsed.unavailable ? "unavailable" : "error")
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submit("ask")
    }
  }

  // One exchange = the learner's question and, once it arrives, the answer to it.
  const exchanges: Array<{ question: UiTurn; answer: UiTurn | null }> = []
  turns.forEach((turn, index) => {
    if (turn.role !== "user") return
    const next = turns[index + 1]
    exchanges.push({ question: turn, answer: next && next.role === "assistant" ? next : null })
  })

  const head = (
    <header className="os-ai-head">
      {compact ? null : <AiMark />}
      <p className="os-ai-label">{off || ui === "checking" ? "Lesson context" : "Context in use"}</p>
      <p className="os-ai-context">
        {lessonNumber ? `Lesson ${lessonNumber} · ` : ""}
        {lessonTitle}
      </p>
      <ul className="os-ai-chips" aria-label={off ? `What ${AI_NAME} would use in this lesson when it is switched on` : `What ${AI_NAME} can see`}>
        {chips.map((chip) => (
          <li key={chip.label} className={chip.off ? "is-off" : undefined}>{chip.label}</li>
        ))}
        <li className="is-off">Does not see your progress, projects or career profile</li>
      </ul>
    </header>
  )

  const body = (
    <>
      <div className="os-ai-scroll" ref={listRef}>
        {notice ? <p className="os-ai-notice">{notice}</p> : null}

        {ui === "checking" ? (
          <div className="os-ai-skeleton" role="status" aria-label={`Checking whether ${AI_NAME} is available`}>
            <span className="os-skeleton" style={{ width: "40%" }} />
            <span className="os-skeleton" />
            <span className="os-skeleton" style={{ width: "70%" }} />
          </div>
        ) : null}

        {off ? (
          <div className="os-ai-off" role="status">
            <p>{ui === "unavailable" ? UNAVAILABLE : UNREACHABLE}</p>
            <p className="os-fine">
              {ui === "unavailable"
                ? "The server has no AI provider configured. You can still study this lesson as normal."
                : "The learning service did not answer. You can still study this lesson as normal."}
            </p>
          </div>
        ) : null}

        {exchanges.map((exchange, index) => (
          <article key={index} className="os-ai-turn">
            <p className="os-ai-label">Question</p>
            <p className="os-ai-question">{exchange.question.content}</p>
            {exchange.answer ? (
              <>
                {exchange.answer.basedOn ? (
                  <div className="os-ai-block is-inline">
                    <p className="os-ai-label">Context</p>
                    <p>{exchange.answer.basedOn}</p>
                  </div>
                ) : null}
                <div className={exchange.answer.heldBack ? "os-ai-block is-held" : "os-ai-block"}>
                  <p className="os-ai-label">
                    <span className="os-ai-dot" aria-hidden="true" />
                    {exchange.answer.heldBack ? "Held back while this assessment is open" : "Answer"}
                  </p>
                  <AnswerText text={exchange.answer.content} />
                </div>
                {exchange.answer.related ? (
                  <div className="os-ai-block is-inline">
                    <p className="os-ai-label">Related</p>
                    <p>{displayAiText(exchange.answer.related)}</p>
                  </div>
                ) : null}
              </>
            ) : null}
          </article>
        ))}

        {ui === "ready" && exchanges.length === 0 ? (
          <p className="os-ai-idle">Ask about this lesson, or start with one of the actions below. Follow-ups stay here.</p>
        ) : null}

        {ui === "loading" ? (
          <p className="os-ai-idle" aria-live="polite">Working from this lesson…</p>
        ) : null}

        {ui === "error" && error ? (
          <p className="os-error" role="alert">
            {error}{" "}
            <button type="button" className="os-link" onClick={() => setUi("ready")}>
              Dismiss
            </button>
          </p>
        ) : null}

        {turns.length > 0 && (ui === "ready" || ui === "error") ? (
          <button type="button" className="os-link os-ai-clear" onClick={clearConversation}>
            Clear conversation
          </button>
        ) : null}
      </div>

      <div className="os-ai-foot">
        <div className="os-ai-quick" role="group" aria-label="Quick help for this lesson">
          {socraticQuickPromptsFor(courseSlug, lessonKind, assessmentOpen).map((item) => (
            <button
              key={item.label}
              type="button"
              className="os-btn os-btn-ghost"
              disabled={inputDisabled}
              onClick={() => void submit(item.action, item.question)}
            >
              {item.label}
            </button>
          ))}
          {(() => {
            const hinglish = hinglishIntuitionPromptFor(courseSlug, lessonTitle)
            return (
              <button
                key={hinglish.label}
                type="button"
                className="os-btn os-btn-ghost"
                disabled={inputDisabled}
                onClick={() => void submit(hinglish.action, hinglish.question)}
              >
                {hinglish.label}
              </button>
            )
          })()}
        </div>
        <form
          className="os-ai-form"
          onSubmit={(event) => {
            event.preventDefault()
            void submit("ask")
          }}
        >
          <label className="os-ai-label" htmlFor={inputId}>
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
              placeholder="Type your question"
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
        <div className="os-ai-sla" style={{ marginTop: 8, fontSize: 12 }}>
          {doubtEscalated ? (
            <p role="status" style={{ margin: 0, color: "var(--skylent-color-slate, #5c6570)" }}>
              ✓ Flagged for Faculty TA review (target 20-min doubt SLA during cohort hours).
            </p>
          ) : (
            <button
              type="button"
              className="os-link"
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
              Stuck on this step? Flag for Faculty TA review (20-min SLA)
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
          <span>
            {open
              ? "Close"
              : ui === "checking"
                ? "Checking lesson help"
                : ui === "unavailable"
                  ? "Lesson help is off"
                  : ui === "unreachable"
                    ? "Lesson help unreachable"
                    : "Ask about this lesson"}
          </span>
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
