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

function caseChipFor(courseSlug: string, caseLabel?: string | null): string | null {
  if (caseLabel) return caseLabel
  if (courseSlug === "data-analytics") return "Northwind dataset"
  if (courseSlug === "product-management") return "Harbor Desk case"
  return null
}

function tryThisFor(action: SkylentAiAction): string | null {
  if (action === "quiz") return "Reply in the box. I will check it against this lesson."
  if (action === "practice") return "Try the first item, then ask me to check your reasoning."
  return null
}

function friendlyError(err: unknown): { message: string; unavailable: boolean } {
  const raw = workspaceErrorMessage(err)
  if (/isn't available/i.test(raw)) {
    return {
      message: "Skylent AI isn't available right now. You can still study this lesson normally.",
      unavailable: true,
    }
  }
  if (/couldn't answer|try again|429/i.test(raw)) {
    return { message: "Skylent AI couldn't answer right now. Try again.", unavailable: false }
  }
  if (/Enrolment required|Lesson locked|do not have access/i.test(raw)) {
    return { message: "This lesson is not available for Skylent AI yet.", unavailable: false }
  }
  return { message: "Skylent AI couldn't answer right now. Try again.", unavailable: false }
}

export default function SkylentAI({ courseSlug, lessonId, lessonTitle, compact }: Props) {
  const inputId = useId()
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0)
  const [open, setOpen] = useState(!compact)
  const [draft, setDraft] = useState("")
  const [turns, setTurns] = useState<SkylentAiTurn[]>([])
  const [basedOn, setBasedOn] = useState(lessonTitle)
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
    setBasedOn(lessonTitle)
    setCaseLabel(caseChipFor(courseSlug))
  }, [courseSlug, lessonId, lessonTitle])

  useEffect(() => {
    setOpen(!compact)
  }, [compact])

  useEffect(() => {
    if (!compact) {
      setDockBottom(12)
      document.documentElement.style.removeProperty("--os-ai-dock-bottom")
      return
    }
    const viewport = window.visualViewport
    const update = () => {
      const inset = viewport
        ? Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
        : 0
      const next = 12 + inset
      setDockBottom(next)
      document.documentElement.style.setProperty("--os-ai-dock-bottom", `${next}px`)
    }
    update()
    viewport?.addEventListener("resize", update)
    viewport?.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    return () => {
      viewport?.removeEventListener("resize", update)
      viewport?.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      document.documentElement.style.removeProperty("--os-ai-dock-bottom")
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
  const inputDisabled = ui === "unavailable" || ui === "checking" || busy
  const chip = caseChipFor(courseSlug, caseLabel)

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
    if (busy || ui === "unavailable" || ui === "checking") return
    const text = (extra ?? (action === "ask" ? draft : "")).trim()
    if (action === "ask" && !text) return

    const label = QUICK.find((item) => item.action === action)?.label
    const userTurn: SkylentAiTurn = {
      role: "user",
      content: action === "ask" ? text : label ?? text,
    }
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
        },
      ])
      setBasedOn(result.basedOn || lessonTitle)
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

  const lastAssistant = [...turns].reverse().find((turn) => turn.role === "assistant")
  const lastUser = [...turns].reverse().find((turn) => turn.role === "user")
  const lastAction = QUICK.find((item) => item.label === lastUser?.content)?.action
  const tryThis = lastAction ? tryThisFor(lastAction) : null

  const contextLine = (
    <div className="os-ai-meta">
      <p className="os-ai-based">Learning from: {basedOn}</p>
      {chip ? <p className="os-ai-chip">{chip}</p> : null}
    </div>
  )

  const body = (
    <>
      {compact ? (
        contextLine
      ) : (
        <header className="os-ai-head">
          <p className="os-eyebrow" id={titleId}>
            Skylent AI
          </p>
          {contextLine}
        </header>
      )}

      {ui === "checking" ? (
        <p className="os-ai-note">Checking whether help is available for this lesson…</p>
      ) : null}

      {ui === "unavailable" ? (
        <p className="os-ai-note">Skylent AI isn't available right now. You can still study this lesson normally.</p>
      ) : null}

      {turns.length > 0 ? (
        <div className="os-ai-thread" ref={listRef}>
          {turns.map((turn, index) => (
            <article key={`${turn.role}-${index}`} className={`os-ai-turn is-${turn.role}`}>
              <p className="os-ai-turn-label">{turn.role === "user" ? "You" : "Skylent AI"}</p>
              <p>{turn.content}</p>
              {turn.role === "assistant" && turn.related ? (
                <p className="os-ai-related">Related to this lesson: {turn.related}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : ui === "ready" && !compact ? (
        <p className="os-ai-idle">Ask about this lesson. Follow-ups stay here.</p>
      ) : null}

      {ui === "ready" && tryThis && lastAssistant ? (
        <p className="os-ai-try">Try this: {tryThis}</p>
      ) : null}

      {ui === "loading" ? (
        <p className="os-ai-note" aria-live="polite">
          Working from this lesson…
        </p>
      ) : null}
      {ui === "error" && error ? (
        <p className="os-error" role="alert">
          {error}{" "}
          <button type="button" className="os-link" onClick={() => setUi("ready")}>
            Try again
          </button>
        </p>
      ) : null}

      {turns.length > 0 && (ui === "ready" || ui === "error") ? (
        <div className="os-ai-tools">
          <button type="button" className="os-link" onClick={clearConversation}>
            Clear conversation
          </button>
        </div>
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
          rows={compact ? 2 : 3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about this lesson..."
          disabled={inputDisabled}
          maxLength={2000}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className="os-btn os-btn-primary" disabled={inputDisabled || !draft.trim()}>
          Ask
        </button>
      </form>

      <div className="os-ai-quick">
        <p className="os-ai-quick-label">Quick help for this lesson</p>
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
      <section
        className={open ? "os-ai is-compact is-open" : "os-ai is-compact"}
        aria-label="Skylent AI"
        aria-busy={busy}
        style={{ bottom: dockBottom }}
      >
        <button
          ref={toggleRef}
          type="button"
          className="os-ai-toggle"
          aria-expanded={open}
          aria-controls={open ? titleId : undefined}
          onClick={() => {
            setOpen((value) => {
              const next = !value
              if (next) queueMicrotask(() => inputRef.current?.focus())
              return next
            })
          }}
        >
          <span>Skylent AI</span>
          <span>{open ? "Close" : "Ask about this lesson"}</span>
        </button>
        {open ? (
          <div className="os-ai-sheet" role="dialog" aria-modal="false" aria-label="Skylent AI">
            {body}
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <aside className="os-ai" aria-label="Skylent AI" aria-busy={busy}>
      {body}
    </aside>
  )
}
