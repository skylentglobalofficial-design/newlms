/**
 * Site-wide Skylent AI: a small robot-dot launcher and a docked panel (a sheet on small screens).
 * Mounted once in the public shell (<SiteAssistant />).
 *
 * Two ways to use it:
 *  - "Find a programme": a short guided conversation (goal, level or area, study mode). The
 *    suggestions are fixed rules over the real catalogue (src/data.ts, the records the catalogue
 *    is seeded from) and the degree routes in src/data/education.ts. Nothing is generated.
 *  - "Ask a question": free text sent to the real site assistant, POST /reva/chat. When the
 *    server has no AI configured (503) or fails, the panel says so and offers the enquiry form.
 * After a suggestion the visitor can say it did not help; the panel then offers a short enquiry
 * (POST /enquiries, kind "counselling") with the terms-acceptance checkbox.
 *
 * A gentle invitation appears once per browser session, only after the visitor has spent time
 * and scrolled on a discovery page, and never covers content on small screens.
 */
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import { AI_NAME, ArrowRight, displayAiText } from "./primitives"
import { SKYLENT_AI_OPEN_EVENT, type SkylentAiMode } from "./ai-events"
import { TermsConsent } from "../legal/TermsConsent"
import { programs as catalogue } from "../../data"
import { DEGREE_ROUTES } from "../../data/education"
import { sendEnquiry, type SiteAiTurn } from "../../lib/skylent-api"
import { API_ROOT } from "../../lib/http"
import { LIVE_PROGRAMME_SLUGS } from "../../lib/programme-catalogue"
import "./SiteAssistant.css"

/* ── Robot-dot mark ──────────────────────────────────────────────────────── */

export function SkylentBot({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg className={`sia-bot${className ? ` ${className}` : ""}`} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle className="sia-bot__halo" cx="20" cy="21" r="18" />
      <line x1="20" y1="4.5" x2="20" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle className="sia-bot__antenna" cx="20" cy="4" r="2.2" />
      <rect className="sia-bot__head" x="7" y="9" width="26" height="22" rx="11" />
      <g className="sia-bot__eyes">
        <ellipse cx="15.5" cy="20" rx="2.1" ry="2.6" />
        <ellipse cx="24.5" cy="20" rx="2.1" ry="2.6" />
      </g>
      <path className="sia-bot__smile" d="M16.5 25.2c1.9 1.5 5.1 1.5 7 0" fill="none" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ── Free-text questions (real endpoint) ─────────────────────────────────── */

type Failure = "unavailable" | "rate" | "failed"
const FAILURE_COPY: Record<Failure, string> = {
  unavailable: "I can't answer free-text questions right now.",
  rate: "Too many questions from this connection. Wait a few minutes, then ask again.",
  failed: "I couldn't answer that right now.",
}

const KNOWN_ROUTES: Record<string, string> = {
  "/": "Go to the home page",
  "/programmes": "Open programmes",
  "/education": "Open degrees",
  "/career-os": "Open Career OS",
  "/verify": "Check a certificate",
  "/about": "About Skylent",
  "/contact": "Contact Skylent",
  "/login": "Sign in",
  "/institutions": "For institutions",
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

/* ── Guided finder (fixed rules over the real catalogue) ─────────────────── */

type Goal = "degree" | "skill" | "unsure"
type Area = "data" | "product" | "software" | "unsure"
type Level = "UG" | "PG"
type Mode = "online" | "campus"
type Answers = { goal?: Goal; level?: Level; mode?: Mode; area?: Area }
type Suggestion = { title: string; to: string; note: string; open: boolean }

const AREA_SLUGS: Record<Exclude<Area, "unsure">, string[]> = {
  data: ["data-analytics-pro", "sql-certificate", "data-science-ai"],
  product: ["product-management"],
  software: ["full-stack", "generative-ai-program"],
}

function programmeIsOpen(slug: string): boolean {
  const program = catalogue.find((item) => item.slug === slug)
  // Open = the catalogue says open AND the programme has an authored, taught course (programme-catalogue.ts).
  return Boolean(program && program.enrollmentStatus === "open" && (LIVE_PROGRAMME_SLUGS as readonly string[]).includes(slug))
}

function programmeSuggestions(slugs: string[]): Suggestion[] {
  return slugs.flatMap((slug) => {
    const program = catalogue.find((item) => item.slug === slug)
    if (!program) return []
    const open = programmeIsOpen(slug)
    return [{ title: program.name, to: `/programmes/${slug}`, note: open ? `Open for enrolment · ${program.duration}` : `Opening soon · ${program.duration}`, open }]
  }).sort((a, b) => Number(b.open) - Number(a.open))
}

function suggestionsFor(answers: Answers): Suggestion[] {
  if (answers.goal === "degree") {
    const level = answers.level
    const mode = answers.mode === "campus" ? "offline" : "online"
    const routes = DEGREE_ROUTES.filter((route) => (!level || route.level === level) && route.studyMode === mode)
    const list: Suggestion[] = routes.map((route) => ({
      title: route.title,
      to: `/education/${route.studyMode === "offline" ? "campus" : "online"}/${route.slug}`,
      note: `${route.studyMode === "offline" ? "On campus" : "Online"} · admissions opening soon`,
      open: false,
    }))
    list.push({
      title: `All ${level === "PG" ? "postgraduate" : "undergraduate"} degrees`,
      to: `/education?level=${(level ?? "UG").toLowerCase()}&mode=${answers.mode ?? "online"}`,
      note: "Compare online and campus options",
      open: false,
    })
    return list
  }
  const area = answers.area ?? "unsure"
  if (area === "unsure") return programmeSuggestions(["data-analytics-pro", "product-management"])
  return programmeSuggestions(AREA_SLUGS[area])
}

type Step = { key: keyof Answers; question: string; options: { value: string; label: string }[] }

function nextStep(answers: Answers): Step | null {
  if (!answers.goal) {
    return {
      key: "goal",
      question: "What are you looking for?",
      options: [
        { value: "skill", label: "Learn a job skill" },
        { value: "degree", label: "Study for a degree" },
        { value: "unsure", label: "I'm not sure yet" },
      ],
    }
  }
  if (answers.goal === "degree") {
    if (!answers.level) return { key: "level", question: "Which level of degree?", options: [{ value: "UG", label: "Undergraduate (UG)" }, { value: "PG", label: "Postgraduate (PG)" }] }
    if (!answers.mode) return { key: "mode", question: "How would you like to study?", options: [{ value: "online", label: "Online" }, { value: "campus", label: "On campus" }] }
    return null
  }
  if (!answers.area) {
    return {
      key: "area",
      question: answers.goal === "unsure" ? "Which kind of work sounds most interesting?" : "Which area do you want to work in?",
      options: [
        { value: "data", label: "Data and analysis" },
        { value: "product", label: "Product and business" },
        { value: "software", label: "Software and AI" },
        { value: "unsure", label: "Show me what's open now" },
      ],
    }
  }
  return null
}

function answerLabel(step: Step, value: string): string {
  return step.options.find((option) => option.value === value)?.label ?? value
}

/* ── Conversation model ──────────────────────────────────────────────────── */

type Message =
  | { id: number; from: "bot"; kind: "text"; text: string }
  | { id: number; from: "bot"; kind: "suggestions"; items: Suggestion[] }
  | { id: number; from: "bot"; kind: "answer"; text: string; action: { to: string; label: string } | null }
  | { id: number; from: "bot"; kind: "failure"; failure: Failure; question: string }
  | { id: number; from: "user"; kind: "text"; text: string }

type NewMessage = Message extends infer M ? (M extends { id: number } ? Omit<M, "id"> : never) : never

const INVITE_KEY = "skylent-ai-invited"
const INVITE_PAGES = ["/", "/programmes", "/education", "/courses", "/career-os"]
const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

function readFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1"
  } catch {
    return false
  }
}
function writeFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "1")
  } catch {
    /* storage unavailable: the invitation may show again, which is harmless */
  }
}

export default function SiteAssistant() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [invite, setInvite] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [answers, setAnswers] = useState<Answers>({})
  const [finderDone, setFinderDone] = useState(false)
  const [feedback, setFeedback] = useState<"none" | "helpful" | "unhelpful">("none")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "failed">("idle")
  const [formRef, setFormRef] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [triedWithoutTerms, setTriedWithoutTerms] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const nextId = useRef(1)
  const titleId = useId()

  const push = useCallback((message: NewMessage) => {
    setMessages((current) => [...current, { ...message, id: nextId.current++ } as Message])
  }, [])

  const startFinder = useCallback(() => {
    setAnswers({})
    setFinderDone(false)
    setFeedback("none")
    setMessages([])
    nextId.current = 1
    push({ from: "bot", kind: "text", text: "Hi, I'm Skylent AI. Answer two or three quick questions and I'll suggest where to start." })
  }, [push])

  const openPanel = useCallback(
    (mode: SkylentAiMode = "chat") => {
      setInvite(false)
      writeFlag(INVITE_KEY)
      setOpen(true)
      if (mode === "finder" || messages.length === 0) startFinder()
    },
    [messages.length, startFinder],
  )

  const close = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => launcherRef.current?.focus())
  }, [])

  // Open from anywhere: openSkylentAi() in ai-events.ts.
  useEffect(() => {
    function onOpen(event: Event) {
      openPanel((event as CustomEvent<SkylentAiMode>).detail ?? "chat")
    }
    window.addEventListener(SKYLENT_AI_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(SKYLENT_AI_OPEN_EVENT, onOpen)
  }, [openPanel])

  // Gentle invitation: once per session, after 25s and a real scroll on a discovery page.
  useEffect(() => {
    setInvite(false)
    if (!INVITE_PAGES.includes(location.pathname) || readFlag(INVITE_KEY)) return
    let timeReached = false
    let scrolled = false
    const maybeShow = () => {
      if (timeReached && scrolled && !readFlag(INVITE_KEY)) setInvite(true)
    }
    const timer = window.setTimeout(() => {
      timeReached = true
      maybeShow()
    }, 25000)
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / Math.max(document.documentElement.scrollHeight, 1)
      if (depth > 0.4) {
        scrolled = true
        maybeShow()
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [location.pathname])

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [messages, feedback, formState])

  useEffect(() => {
    if (open) requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(".sia-option, .sia-input")?.focus())
  }, [open])

  function dismissInvite() {
    setInvite(false)
    writeFlag(INVITE_KEY)
  }

  function choose(step: Step, value: string) {
    const next = { ...answers, [step.key]: value } as Answers
    setAnswers(next)
    push({ from: "user", kind: "text", text: answerLabel(step, value) })
    if (!nextStep(next)) {
      const items = suggestionsFor(next)
      push({
        from: "bot",
        kind: "text",
        text: next.goal === "degree" ? "These degree routes match what you told me:" : "Based on your answers, these programmes fit best:",
      })
      push({ from: "bot", kind: "suggestions", items })
      setFinderDone(true)
    }
  }

  async function ask(question: string) {
    const text = question.trim()
    if (!text || sending) return
    setDraft("")
    push({ from: "user", kind: "text", text })
    const history: SiteAiTurn[] = messages.flatMap((message): SiteAiTurn[] =>
      message.kind === "answer" ? [{ role: "assistant", content: message.text }] : message.from === "user" && message.kind === "text" ? [{ role: "user", content: message.text }] : [],
    )
    setSending(true)
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const result = await askWithStatus([...history, { role: "user", content: text.slice(0, 4000) }], controller.signal)
      if (result.ok) push({ from: "bot", kind: "answer", text: displayAiText(result.answer), action: mapAssistantPath(result.goTo) })
      else push({ from: "bot", kind: "failure", failure: result.failure, question: text })
    } catch {
      /* aborted */
    } finally {
      setSending(false)
    }
  }

  async function submitEnquiry(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormState("failed")
      return
    }
    if (!accepted) {
      setTriedWithoutTerms(true)
      return
    }
    setFormState("sending")
    const summary = [
      answers.goal ? `Looking for: ${answers.goal}` : "",
      answers.level ? `Level: ${answers.level}` : "",
      answers.mode ? `Mode: ${answers.mode}` : "",
      answers.area ? `Area: ${answers.area}` : "",
    ].filter(Boolean).join(" · ")
    try {
      const result = await sendEnquiry({
        kind: "counselling",
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: [form.message, summary ? `(From Skylent AI: ${summary})` : ""].filter(Boolean).join("\n"),
      })
      setFormRef(result.id)
      setFormState("sent")
    } catch {
      setFormState("failed")
    }
  }

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

  const step = finderDone ? null : nextStep(answers)
  const showForm = feedback === "unhelpful" || messages.some((m) => m.kind === "failure" && m.failure === "unavailable")

  return (
    <div className="sia">
      {invite && !open ? (
        <div className="sia-invite" role="status">
          <button type="button" className="sia-invite__close" onClick={dismissInvite} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="sia-invite__text">Not sure where to start? I can help you find a programme that fits.</p>
          <button type="button" className="sia-invite__go" onClick={() => openPanel("finder")}>
            Help me choose
            <ArrowRight />
          </button>
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        className={open ? "sia-launcher sia-launcher--hidden" : "sia-launcher"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Ask ${AI_NAME}`}
        tabIndex={open ? -1 : undefined}
        onClick={() => openPanel("chat")}
      >
        <SkylentBot size={34} />
        <span className="sia-launcher__label">Ask {AI_NAME}</span>
      </button>

      {open ? (
        <>
          <div className="sia-backdrop" onClick={close} aria-hidden="true" />
          <div ref={panelRef} className="sia-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onPanelKeyDown}>
            <div className="sia-head">
              <SkylentBot size={36} className="sia-head__bot" />
              <div className="sia-head__text">
                <span id={titleId} className="sia-head__title">{AI_NAME}</span>
                <span className="sia-head__sub">Helps you choose a programme or degree</span>
              </div>
              <button type="button" className="sia-restart" onClick={startFinder}>
                Start over
              </button>
              <button type="button" className="sia-close" onClick={close} aria-label={`Close ${AI_NAME}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="sia-thread" ref={threadRef} aria-live="polite" aria-busy={sending}>
              {messages.map((message) =>
                message.from === "user" ? (
                  <p key={message.id} className="sia-msg sia-msg--user">
                    {message.text}
                  </p>
                ) : message.kind === "suggestions" ? (
                  <ul key={message.id} className="sia-suggest" aria-label="Suggestions">
                    {message.items.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} onClick={close} className="sia-suggest__card">
                          <span className="sia-suggest__title">{item.title}</span>
                          <span className={item.open ? "sia-suggest__note sia-suggest__note--open" : "sia-suggest__note"}>{item.note}</span>
                          <ArrowRight />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : message.kind === "answer" ? (
                  <div key={message.id} className="sia-msg sia-msg--bot">
                    <p>{message.text}</p>
                    {message.action ? (
                      <Link className="sia-msg__action" to={message.action.to} onClick={close}>
                        {message.action.label}
                        <ArrowRight />
                      </Link>
                    ) : null}
                  </div>
                ) : message.kind === "failure" ? (
                  <div key={message.id} className="sia-msg sia-msg--bot sia-msg--failure" role="alert">
                    <p>
                      {FAILURE_COPY[message.failure]}{" "}
                      {message.failure === "unavailable" ? "Leave your details below and the Skylent team will reply." : null}
                    </p>
                    {message.failure !== "unavailable" ? (
                      <button type="button" onClick={() => void ask(message.question)} disabled={sending}>
                        Try again
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p key={message.id} className="sia-msg sia-msg--bot">
                    {message.text}
                  </p>
                ),
              )}

              {sending ? (
                <p className="sia-msg sia-msg--bot sia-typing" aria-label="Skylent AI is answering">
                  <span />
                  <span />
                  <span />
                </p>
              ) : null}

              {step ? (
                <div className="sia-step">
                  <p className="sia-msg sia-msg--bot">{step.question}</p>
                  <div className="sia-options" role="group" aria-label={step.question}>
                    {step.options.map((option) => (
                      <button key={option.value} type="button" className="sia-option" onClick={() => choose(step, option.value)}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {finderDone && feedback === "none" ? (
                <div className="sia-feedback" role="group" aria-label="Was this helpful?">
                  <span>Was this helpful?</span>
                  <button type="button" onClick={() => setFeedback("helpful")}>
                    <span aria-hidden="true">🙂</span> Yes
                  </button>
                  <button type="button" onClick={() => setFeedback("unhelpful")}>
                    <span aria-hidden="true">🙁</span> Not really
                  </button>
                </div>
              ) : null}
              {feedback === "helpful" ? <p className="sia-msg sia-msg--bot">Great. Ask me anything else about a programme below.</p> : null}
              {feedback === "unhelpful" ? <p className="sia-msg sia-msg--bot">Sorry about that. Leave your details and a Skylent counsellor will get back to you.</p> : null}

              {showForm ? (
                formState === "sent" ? (
                  <div className="sia-sent" role="status">
                    <p className="sia-sent__title">Thanks, we've got it.</p>
                    <p>The Skylent team will reply by email. Reference: <span className="sia-mono">{formRef}</span></p>
                  </div>
                ) : (
                  <form className="sia-enquiry" onSubmit={submitEnquiry} noValidate>
                    <div className="sia-enquiry__row">
                      <label>
                        <span>Name</span>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
                      </label>
                      <label>
                        <span>Email</span>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
                      </label>
                    </div>
                    <label>
                      <span>Phone (optional)</span>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                    </label>
                    <label>
                      <span>What would you like help with? (optional)</span>
                      <textarea rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    </label>
                    <TermsConsent checked={accepted} onChange={setAccepted} action="sending your details" showError={triedWithoutTerms} />
                    {formState === "failed" ? <p className="sia-enquiry__error" role="alert">Check your name and email, then try again. You can also write to support@skylent.live.</p> : null}
                    <button type="submit" className="sk-btn sk-btn-primary" disabled={formState === "sending"}>
                      {formState === "sending" ? "Sending" : "Send to the Skylent team"}
                    </button>
                  </form>
                )
              ) : null}
            </div>

            <form
              className="sia-form"
              onSubmit={(event) => {
                event.preventDefault()
                void ask(draft)
              }}
            >
              <label className="sia-sr" htmlFor={`${titleId}-q`}>
                Ask about programmes, degrees or the platform
              </label>
              <div className="sia-form__row">
                <textarea
                  ref={inputRef}
                  id={`${titleId}-q`}
                  className="sia-input"
                  rows={1}
                  maxLength={2000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      void ask(draft)
                    }
                  }}
                  placeholder="Ask a question about Skylent"
                />
                <button type="submit" className="sia-send" disabled={sending || draft.trim() === ""} aria-label="Send question">
                  <ArrowRight />
                </button>
              </div>
              <p className="sia-foot">Answers come from the Skylent website and catalogue and can be wrong.</p>
            </form>
          </div>
        </>
      ) : null}
    </div>
  )
}
