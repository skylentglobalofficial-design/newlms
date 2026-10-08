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

const UNAVAILABLE = `${AI_NAME} isn't switched on yet.`
const UNREACHABLE = `${AI_NAME} could not be reached.`

/** Courses whose lesson text, concepts and case facts the server loads (server/src/lib/skylent-ai/authored.ts). */
const AUTHORED_AI_COURSES = new Set(["data-analytics", "product-management"])

/** Case facts the server attaches to the lesson context (server/src/lib/skylent-ai/authored.ts). */
function caseChipFor(courseSlug: string, caseLabel?: string | null): string | null {
  if (caseLabel) return caseLabel
  if (courseSlug === "data-analytics") return "Northwind dataset"
  if (courseSlug === "product-management") return "Harbor Desk case"
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

/**
 * The server answers a request it will not fulfil with its own refusal sentence
 * (server/src/lib/skylent-ai/integrity.ts and prompts.ts). These are their opening words.
 */
const REFUSAL_OPENINGS = [
  /^This quiz is still open, so I will not/i,
  /^This assignment is still open, so I will not/i,
  /^I will not give the current quiz answer/i,
  /^I will not complete the assessed assignment/i,
  /^I will not reveal graded answer keys/i,
]

function isHeldBack(answer: string): boolean {
  const text = answer.trim()
  return REFUSAL_OPENINGS.some((pattern) => pattern.test(text))
}

function friendlyError(err: unknown): { message: string; unavailable: boolean } {
  const raw = workspaceErrorMessage(err)
  if (/isn't available/i.test(raw)) return { message: UNAVAILABLE, unavailable: true }
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

  useEffect(() => {
    abortRef.current?.abort()
    seqRef.current += 1
    setTurns([])
    setDraft("")
    setError(null)
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
    void fetchSkylentAiStatus(controller.signal)
      .then((status) => {
        if (cancelled) return
        setUi(status.available ? "ready" : "unavailable")
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return
        setUi("unreachable")
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [lessonId])

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
          heldBack: result.refused ?? isHeldBack(result.answer),
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
      <p className="os-ai-label">Context in use</p>
      <p className="os-ai-context">
        {lessonNumber ? `Lesson ${lessonNumber} · ` : ""}
        {lessonTitle}
      </p>
      <ul className="os-ai-chips" aria-label={`What ${AI_NAME} can see`}>
        {chips.map((chip) => (
          <li key={chip.label} className={chip.off ? "is-off" : undefined}>{chip.label}</li>
        ))}
        <li className="is-off">Progress, projects, career · not connected</li>
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
          {QUICK.map((item) => (
            <button
              key={item.action}
              type="button"
              className="os-btn os-btn-ghost"
              disabled={inputDisabled}
              onClick={() => void submit(item.action)}
            >
              {item.label}
            </button>
          ))}
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
          <span>{open ? "Close" : "Ask about this lesson"}</span>
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
