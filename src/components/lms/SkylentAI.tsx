import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { askSkylentAi, fetchSkylentAiStatus, type SkylentAiAction, type SkylentAiTurn } from "../../lib/skylent-ai-api"
import { workspaceErrorMessage } from "../../lib/http"
import "./SkylentAI.css"

type Props = {
  courseSlug: string
  lessonId: string
  lessonTitle: string
  compact: boolean
}

type UiState = "checking" | "unavailable" | "ready" | "loading" | "error"

const QUICK: Array<{ action: SkylentAiAction; label: string }> = [
  { action: "explain", label: "Explain simpler" },
  { action: "example", label: "Give an example" },
  { action: "quiz", label: "Quiz me" },
  { action: "practice", label: "Practice question" },
]

function friendlyError(err: unknown): { message: string; unavailable: boolean } {
  const raw = workspaceErrorMessage(err)
  if (raw.includes("isn't available")) {
    return { message: "Skylent AI isn't available yet.", unavailable: true }
  }
  return { message: "Skylent AI couldn't answer right now. Try again.", unavailable: false }
}

export default function SkylentAI({ courseSlug, lessonId, lessonTitle, compact }: Props) {
  const inputId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0)
  const [open, setOpen] = useState(!compact)
  const [draft, setDraft] = useState("")
  const [turns, setTurns] = useState<SkylentAiTurn[]>([])
  const [basedOn, setBasedOn] = useState(lessonTitle)
  const [ui, setUi] = useState<UiState>("checking")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    seqRef.current += 1
    setTurns([])
    setDraft("")
    setError(null)
    setBasedOn(lessonTitle)
  }, [lessonId, lessonTitle])

  useEffect(() => {
    setOpen(!compact)
  }, [compact])

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
        if (!cancelled) setUi("unavailable")
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [lessonId])

  useEffect(() => {
    const root = listRef.current
    if (!root) return
    root.scrollTop = root.scrollHeight
  }, [turns, ui])

  const busy = ui === "loading"
  const inputDisabled = ui === "unavailable" || ui === "checking" || busy

  async function submit(action: SkylentAiAction, extra?: string) {
    if (ui !== "ready" || busy) return
    const text = (extra ?? (action === "ask" ? draft : "")).trim()
    if (action === "ask" && !text) return

    const label = QUICK.find((item) => item.action === action)?.label
    const userTurn: SkylentAiTurn = {
      role: "user",
      content: action === "ask" ? text : label ?? text,
    }
    const history = turns.slice(-8)
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
      setTurns([...pending, { role: "assistant", content: result.answer }])
      setBasedOn(result.basedOn || lessonTitle)
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

  function askAnother() {
    setOpen(true)
    inputRef.current?.focus()
  }

  const body = (
    <>
      <header className="os-ai-head">
        <p className="os-eyebrow">Skylent AI</p>
        <h2>Learn with help from this lesson.</h2>
        <p className="os-ai-based">Based on: {basedOn}</p>
      </header>

      {ui === "unavailable" ? (
        <p className="os-ai-note">Skylent AI isn’t available yet. You can still study the lesson as written.</p>
      ) : null}

      {ui === "checking" ? (
        <p className="os-ai-note">Ask about this lesson.</p>
      ) : null}

      {turns.length > 0 ? (
        <div className="os-ai-thread" ref={listRef}>
          {turns.map((turn, index) => (
            <article key={`${turn.role}-${index}`} className={`os-ai-turn is-${turn.role}`}>
              <p className="os-ai-turn-label">{turn.role === "user" ? "Question" : "Answer"}</p>
              <p>{turn.content}</p>
            </article>
          ))}
        </div>
      ) : ui === "ready" || ui === "loading" || ui === "error" ? (
        <p className="os-ai-idle">Ask about this lesson.</p>
      ) : null}

      {ui === "loading" ? <p className="os-ai-note" aria-live="polite">Thinking about this lesson…</p> : null}
      {ui === "error" && error ? (
        <p className="os-error" role="alert">
          {error}
          {" "}
          <button type="button" className="os-link" onClick={() => setUi("ready")}>
            Try again
          </button>
        </p>
      ) : null}

      {turns.some((turn) => turn.role === "assistant") && ui === "ready" ? (
        <button type="button" className="os-link" onClick={askAnother}>
          Ask another question
        </button>
      ) : null}

      <form
        className="os-ai-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit("ask")
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          Ask about this lesson
        </label>
        <textarea
          ref={inputRef}
          id={inputId}
          className="os-ai-input"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about this lesson…"
          disabled={inputDisabled}
          maxLength={2000}
          autoComplete="off"
        />
        <button type="submit" className="os-btn os-btn-primary" disabled={inputDisabled || !draft.trim()}>
          Ask
        </button>
      </form>

      <div className="os-ai-quick">
        <p className="os-ai-quick-label">Quick help</p>
        <div className="os-ai-quick-row">
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
      </div>
    </>
  )

  if (compact) {
    return (
      <section className="os-ai is-compact" aria-label="Skylent AI">
        <button
          type="button"
          className="os-ai-toggle"
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => {
              const next = !value
              if (next) queueMicrotask(() => inputRef.current?.focus())
              return next
            })
          }}
        >
          <span>Skylent AI</span>
          <span>{open ? "Hide" : "Ask about this lesson"}</span>
        </button>
        {open ? body : null}
      </section>
    )
  }

  return (
    <aside className="os-ai" aria-label="Skylent AI">
      {body}
    </aside>
  )
}
