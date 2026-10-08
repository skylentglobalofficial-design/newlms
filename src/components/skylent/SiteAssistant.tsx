/**
 * Site-wide Skylent AI: a launcher and a docked panel (a sheet on small screens).
 * Mount once in the public shell: <SiteAssistant />. It takes no props; the server decides the
 * scope from the session cookie (visitor: public site and catalogue; signed in: also own enrolments).
 *
 * The thread is not a chat: each exchange is a ruled Question → Answer block, with an Action row
 * when the server suggested a page. Answers pass through displayAiText() so the product name is
 * always "Skylent AI".
 */
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { Link } from "react-router-dom"
import { AI_NAME, AiMark, ArrowRight, TruthChip, displayAiText } from "./primitives"
import { aiFeature } from "../../lib/product-manifest"
import type { SiteAiTurn } from "../../lib/skylent-api"
import "./SiteAssistant.css"
import { API_ROOT } from "../../lib/http"

type Failure = "unavailable" | "rate" | "failed"
type Exchange = {
  id: number
  question: string
  state: "sending" | "done" | "error"
  answer?: string
  action?: { to: string; label: string } | null
  failure?: Failure
}

const FAILURE_COPY: Record<Failure, string> = {
  unavailable: `${AI_NAME} isn't available yet.`,
  rate: `${AI_NAME} has had too many questions from this connection. Wait a few minutes, then ask again.`,
  failed: `${AI_NAME} couldn't answer right now. Try again.`,
}

/**
 * Questions the server's context (server/src/routes/skylent/reva.ts: the site's page list, the course
 * catalogue, support contacts and the fee policy) can really answer. Career OS and certificate
 * questions are not offered: that context does not describe them.
 */
const SUGGESTED = ["Which courses can I open today?", "How do I reach the Skylent team?", "Are fees published?"]

const SITE_AI = aiFeature("site-assistant")

const KNOWN_ROUTES: Record<string, string> = {
  "/": "Go to the home page",
  "/programmes": "Open programmes",
  "/path": "Open Find My Path",
  "/education": "Open degree routes",
  "/career-os": "Open Career OS",
  "/verify": "Check a certificate",
  "/about": "About Skylent",
  "/contact": "Contact Skylent",
  "/login": "Sign in",
}

/** The server speaks in its own paths. Map them to this app's routes; drop anything that is not a known route. */
export function mapAssistantPath(path: string | null): { to: string; label: string } | null {
  if (!path) return null
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/"
  let to = clean
  if (clean === "/programs") to = "/programmes"
  else if (clean === "/learn/sign-in") to = "/login"
  const course = clean.match(/^\/programs\/([a-z0-9][a-z0-9-]*)$/) // the server lists COURSE slugs under /programs/
  if (course) return { to: `/courses/${course[1]}`, label: "Open this course" }
  return KNOWN_ROUTES[to] ? { to, label: KNOWN_ROUTES[to] } : null
}

type AskResult = { ok: true; answer: string; goTo: string | null } | { ok: false; failure: Failure }

/**
 * Same request and parsing as askSiteAi() in src/lib/skylent-api.ts, but it keeps the HTTP status:
 * askSiteAi() throws a plain Error, so 503 (not configured) and 429 (rate limited) cannot be told apart from it.
 */
async function askWithStatus(messages: SiteAiTurn[], signal: AbortSignal): Promise<AskResult> {
  let response: Response
  try {
    response = await fetch(`${API_ROOT}/reva/chat`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.slice(-12) }),
    })
  } catch (error) {
    if (signal.aborted) throw error
    return { ok: false, failure: "failed" }
  }
  if (response.status === 503) return { ok: false, failure: "unavailable" }
  if (response.status === 429) return { ok: false, failure: "rate" }
  if (!response.ok) return { ok: false, failure: "failed" }
  try {
    const parsed = (await response.json()) as { data?: { answer?: string } }
    const raw = parsed.data?.answer ?? ""
    const match = raw.match(/\[\[go:(\/[^\]\s]*)\]\]/)
    const answer = raw.replace(/\s*\[\[go:[^\]]*\]\]/g, "").trim()
    if (!answer) return { ok: false, failure: "failed" }
    return { ok: true, answer, goTo: match ? match[1] : null }
  } catch {
    return { ok: false, failure: "failed" }
  }
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function SiteAssistant() {
  const [open, setOpen] = useState(false)
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [draft, setDraft] = useState("")
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const nextId = useRef(1)
  const titleId = useId()
  const sending = exchanges.some((exchange) => exchange.state === "sending")

  const close = useCallback(() => {
    setOpen(false)
    // Focus goes back to where the panel was opened from.
    requestAnimationFrame(() => launcherRef.current?.focus())
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [exchanges])

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== "Tab" || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function ask(question: string, retryId?: number) {
    const text = question.trim()
    if (!text || sending) return
    const id = retryId ?? nextId.current++
    const history: SiteAiTurn[] = exchanges
      .filter((exchange) => exchange.state === "done" && exchange.answer && exchange.id !== id)
      .flatMap((exchange) => [
        { role: "user" as const, content: exchange.question },
        { role: "assistant" as const, content: exchange.answer! },
      ])
    setExchanges((current) =>
      retryId
        ? current.map((exchange) => (exchange.id === id ? { id, question: text, state: "sending" } : exchange))
        : [...current, { id, question: text, state: "sending" }],
    )
    setDraft("")
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const result = await askWithStatus([...history, { role: "user", content: text.slice(0, 4000) }], controller.signal)
      setExchanges((current) =>
        current.map((exchange) =>
          exchange.id !== id
            ? exchange
            : result.ok
              ? { id, question: text, state: "done", answer: displayAiText(result.answer), action: mapAssistantPath(result.goTo) }
              : { id, question: text, state: "error", failure: result.failure },
        ),
      )
    } catch {
      // Aborted because the component went away: nothing to show.
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void ask(draft)
  }

  function onDraftKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void ask(draft)
    }
  }

  return (
    <div className="sia">
      <button
        ref={launcherRef}
        type="button"
        className={open ? "sia-launcher sia-launcher--hidden" : "sia-launcher"}
        aria-haspopup="dialog"
        aria-expanded={open}
        tabIndex={open ? -1 : undefined}
        onClick={() => setOpen(true)}
      >
        <span className="sia-launcher__dot" aria-hidden="true" />
        Ask {AI_NAME}
      </button>

      {open ? (
        <>
          <div className="sia-backdrop" onClick={close} aria-hidden="true" />
          <div ref={panelRef} className="sia-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onPanelKeyDown}>
            <div className="sky-ai-head sky-on-navy sia-head">
              <div className="sia-head__top">
                <span id={titleId} className="sia-head__title">
                  <AiMark />
                  <TruthChip state={SITE_AI.status} />
                </span>
                <button type="button" className="sia-close" onClick={close} aria-label={`Close ${AI_NAME}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="sky-label">Context in use</div>
              <ul className="sia-context">
                <li>The public site and catalogue</li>
                <li>Your enrolments (when signed in)</li>
                <li className="sia-context__off">Lessons, progress, evidence and career data · not connected</li>
              </ul>
            </div>

            <div className="sia-thread" ref={threadRef} aria-live="polite" aria-busy={sending}>
              {exchanges.length === 0 ? (
                <div className="sia-empty">
                  <div className="sky-label">Ask about Skylent</div>
                  <p>Questions it can answer from the context above:</p>
                  <ul>
                    {SUGGESTED.map((question) => (
                      <li key={question}>
                        <button type="button" onClick={() => void ask(question)}>
                          {question}
                          <ArrowRight />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                exchanges.map((exchange, index) => (
                  <article key={exchange.id} className="sia-exchange">
                    <div className="sia-row">
                      <div className="sky-label">
                        <b>{String(index + 1).padStart(2, "0")}</b> / Question
                      </div>
                      <h3 className="sia-question">{exchange.question}</h3>
                    </div>
                    <div className="sia-row">
                      <div className="sky-label sia-answer-label">
                        <span aria-hidden="true" />
                        Answer
                      </div>
                      {exchange.state === "sending" ? (
                        <div className="sia-sending">
                          <div className="sia-progress" aria-hidden="true" />
                          <span>Reading the context in use</span>
                        </div>
                      ) : exchange.state === "error" ? (
                        <div className="sia-failure" role="alert">
                          <p>{FAILURE_COPY[exchange.failure ?? "failed"]}</p>
                          {exchange.failure === "unavailable" ? null : (
                            <button type="button" onClick={() => void ask(exchange.question, exchange.id)} disabled={sending}>
                              Try again
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="sia-answer">{exchange.answer}</p>
                      )}
                    </div>
                    {exchange.state === "done" && exchange.action ? (
                      <div className="sia-row">
                        <div className="sky-label">Action</div>
                        <Link className="sk-btn sk-btn-secondary sia-action" to={exchange.action.to} onClick={close}>
                          {exchange.action.label}
                          <ArrowRight />
                        </Link>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>

            <form className="sia-form" onSubmit={onSubmit}>
              <label className="sky-label" htmlFor={`${titleId}-q`}>
                Ask about programmes, degrees or the platform
              </label>
              <div className="sia-form__row">
                <textarea
                  ref={inputRef}
                  id={`${titleId}-q`}
                  rows={1}
                  maxLength={2000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onDraftKeyDown}
                  placeholder="Type a question"
                />
                <button type="submit" className="sia-send" disabled={sending || draft.trim() === ""} aria-label="Send question">
                  <ArrowRight />
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  )
}
