/**
 * Site help: a small launcher and a docked panel (a sheet on small screens).
 * Mounted once in the public shell (<SiteAssistant />).
 *
 * Two separate tools share the panel:
 *  - A short questionnaire (goal, level or area, study mode). Suggestions are fixed rules over
 *    the catalogue in src/data.ts and the degree routes in src/data/education.ts. Nothing is
 *    generated. This is not Find My Path (/path) and it is not lesson help.
 *  - A site question box. Free text goes to POST /reva/chat. When the server has no AI
 *    configured (503), the box is switched off and the enquiry form is offered. A 429 or other
 *    failure is shown as a failure. Signed-in requests can include the learner's name and
 *    enrolled course names; lesson progress, projects, and the career profile are not sent.
 * After a suggestion the visitor can say it did not help; the panel then offers a short enquiry
 * (POST /enquiries, kind "counselling") with the terms-acceptance checkbox.
 *
 * A gentle invitation appears once per browser session, only after the visitor has spent time
 * and scrolled on a discovery page, and never covers content on small screens.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import { AI_NAME, ArrowRight, displayAiText } from "./primitives"
import { SKYLENT_AI_OPEN_EVENT, type SkylentAiMode } from "./ai-events"
import { TermsConsent } from "../legal/TermsConsent"
import { programs as catalogue } from "../../data"
import { DEGREE_ROUTES } from "../../data/education"
import { enquiryErrorMessage, sendEnquiry, type SiteAiTurn } from "../../lib/skylent-api"
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
  unavailable: "Free-text answers are switched off right now.",
  rate: "Too many questions from this connection. Wait a few minutes, then ask again.",
  failed: "That question could not be answered right now.",
}

const KNOWN_ROUTES: Record<string, string> = {
  "/": "Go to the home page",
  "/programmes": "Open programmes",
  "/courses": "Open programmes (redirects)",
  "/education": "Open degrees",
  "/career-os": "Open Career OS",
  "/verify": "Check a certificate",
  "/about": "About Skylent",
  "/contact": "Contact Skylent",
  "/login": "Sign in",
  "/signup": "Create an account",
  "/dashboard/student": "Open my learning",
  "/institutions": "For institutions",
}

const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*"

/**
 * The server speaks in its own paths (server/src/routes/skylent/reva.ts): /programs/<slug> is a programme,
 * /courses/<slug> a course, /career-os/<area> a Career OS area. Map them to this app's routes and drop
 * anything that is not a known route.
 */
export function mapAssistantPath(path: string | null): { to: string; label: string } | null {
  if (!path) return null
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/"
  let to = clean
  if (clean === "/programs") to = "/programmes"
  else if (clean === "/learn/sign-in") to = "/login"
  const programme = clean.match(new RegExp(`^/(?:programs|programmes)/(${SLUG})$`))
  if (programme) return { to: `/programmes/${programme[1]}`, label: "Open this programme" }
  const course = clean.match(new RegExp(`^/courses/(${SLUG})$`))
  if (course) return { to: `/courses/${course[1]}`, label: "Open this course" }
  const careerArea = clean.match(/^\/career-os\/(profile|projects|jobs|applications|interviews|support)$/)
  if (careerArea) return { to: clean, label: "Open Career OS" }
  return KNOWN_ROUTES[to] ? { to, label: KNOWN_ROUTES[to] } : null
}

type AskResult = { ok: true; answer: string; goTo: string | null; generated: boolean } | { ok: false; failure: Failure }

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
    const parsed = (await response.json()) as { data?: { answer?: string; source?: string } }
    const raw = parsed.data?.answer ?? ""
    const match = raw.match(/\[\[go:(\/[^\]\s]*)\]\]/)
    const answer = raw.replace(/\s*\[\[go:[^\]]*\]\]/g, "").trim()
    if (!answer) return { ok: false, failure: "failed" }
    // The server marks its own fixed replies (identity, "I cannot see your progress") as "rule".
    return { ok: true, answer, goTo: match ? match[1] : null, generated: parsed.data?.source !== "rule" }
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
    return [{ title: program.name, to: `/programmes/${slug}`, note: open ? `See this page for enrolment · ${program.duration}` : `Not open yet · ${program.duration}`, open }]
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
      note: `${route.studyMode === "offline" ? "On campus" : "Online"} · not open yet`,
      open: false,
    }))
    list.push({
      title: `All ${level === "PG" ? "postgraduate" : "undergraduate"} degrees`,
      to: `/education?level=${(level ?? "UG").toLowerCase()}&mode=${answers.mode ?? "online"}`,
      note: "Sample listings. Applications are not open.",
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
        { value: "skill", label: "Learn a skill" },
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
      question: answers.goal === "unsure" ? "Which subject sounds most interesting?" : "Which area do you want to study?",
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
  | { id: number; from: "bot"; kind: "answer"; text: string; generated: boolean; action: { to: string; label: string } | null }
  | { id: number; from: "bot"; kind: "failure"; failure: Failure; question: string }
  | { id: number; from: "user"; kind: "text"; text: string; typed?: boolean }

type NewMessage = Message extends infer M ? (M extends { id: number } ? Omit<M, "id"> : never) : never

const INVITE_KEY = "skylent-ai-invited"
const INVITE_PAGES = ["/", "/programmes", "/education", "/career-os"]
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
  const [siteOff, setSiteOff] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "failed">("idle")
  const [formError, setFormError] = useState("")
  const [formRef, setFormRef] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [triedWithoutTerms, setTriedWithoutTerms] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const enquirySendingRef = useRef(false)
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
  }, [])

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

  // While the footer is on screen the invitation steps aside, so it never covers footer links.
  // It is hidden, not dismissed: it comes back when the visitor scrolls up again.
  const [footerInView, setFooterInView] = useState(false)
  const [clearOfContent, setClearOfContent] = useState(true)
  useLayoutEffect(() => {
    const launcher = launcherRef.current
    if (!launcher) return
    let frame = 0
    const measure = () => {
      frame = 0
      const box = launcher.getBoundingClientRect()
      const keep = { left: box.left - 16, right: box.right + 8, top: box.top - 16, bottom: box.bottom + 8 }
      const zones = document.querySelectorAll([
        "[data-clear-launcher]",
        ".hx-page--home .hxw-goals",
        ".hx-page--home .hxw-goal",
        ".hx-page--home .hx-prog",
        ".hx-page--home .hx-door",
        ".hx-page--home .sk-btn",
        ".hx-page--home .hxw-offering",
        ".hx-focus__card",
        ".pgx-card__link",
        ".pgx-card__static",
        ".pgx-section__head",
        ".pa-lab__result",
        ".pa-case__log",
        ".pp-practice",
        ".cat-honesty",
        ".cat-fine",
        ".pl-fine",
        ".cpx-card",
        ".cpx-sources a",
        ".hx-head__aside",
      ].join(", "))
      let blocked = false
      for (const node of zones) {
        const rect = node.getBoundingClientRect()
        if (rect.width < 1 || rect.height < 1) continue
        if (rect.left < keep.right && rect.right > keep.left && rect.top < keep.bottom && rect.bottom > keep.top) {
          blocked = true
          break
        }
      }
      setClearOfContent(!blocked)
    }
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule)
    observer?.observe(document.documentElement)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer?.disconnect()
    }
  }, [location.pathname, open])
  useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    const thread = threadRef.current
    if (!thread) return
    const replies = thread.querySelectorAll<HTMLElement>(".sia-msg--bot")
    const latest = thread.querySelector<HTMLElement>(".sia-msg--failure, .sia-typing")
      ?? replies[replies.length - 1]
      ?? thread.querySelector<HTMLElement>(".sia-suggest, .sia-step")
    if (!latest) {
      thread.scrollTop = thread.scrollHeight
      return
    }
    const top = latest.getBoundingClientRect().top - thread.getBoundingClientRect().top + thread.scrollTop
    thread.scrollTop = Math.max(0, top - 8)
  }, [messages, feedback, formState])

  useEffect(() => {
    if (open) requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(".sia-option, .sia-input")?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      event.preventDefault()
      close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  useEffect(() => {
    if (!open || !siteOff) return
    const active = document.activeElement
    if (active instanceof HTMLElement && panelRef.current?.contains(active) && (active.matches(":disabled") || active.getAttribute("aria-disabled") === "true")) {
      panelRef.current.querySelector<HTMLElement>(".sia-close")?.focus()
    }
  }, [open, siteOff])

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
        text: next.goal === "degree"
          ? "These degree samples match your answers. Applications are not open."
          : "These programmes match your answers. Each page states whether enrolment is open.",
      })
      push({ from: "bot", kind: "suggestions", items })
      setFinderDone(true)
    }
  }

  async function ask(question: string) {
    const text = question.trim()
    if (!text || sending || siteOff) return
    setDraft("")
    push({ from: "user", kind: "text", text, typed: true })
    const history: SiteAiTurn[] = messages.flatMap((message): SiteAiTurn[] =>
      message.kind === "answer"
        ? [{ role: "assistant", content: message.text }]
        : message.from === "user" && message.kind === "text" && message.typed
          ? [{ role: "user", content: message.text }]
          : [],
    )
    setSending(true)
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const result = await askWithStatus([...history, { role: "user", content: text.slice(0, 4000) }], controller.signal)
      if (result.ok) push({ from: "bot", kind: "answer", text: displayAiText(result.answer), generated: result.generated, action: mapAssistantPath(result.goTo) })
      else {
        if (result.failure === "unavailable") setSiteOff(true)
        push({ from: "bot", kind: "failure", failure: result.failure, question: text })
      }
    } catch {
      /* aborted */
    } finally {
      setSending(false)
    }
  }

  async function submitEnquiry(event: FormEvent) {
    event.preventDefault()
    if (enquirySendingRef.current || formState === "sending") return
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormError("Check your name and email, then try again.")
      setFormState("failed")
      return
    }
    if (!accepted) {
      setTriedWithoutTerms(true)
      return
    }
    setFormState("sending")
    enquirySendingRef.current = true
    const summary = [
      answers.goal ? `Looking for: ${answers.goal}` : "",
      answers.level ? `Level: ${answers.level}` : "",
      answers.mode ? `Mode: ${answers.mode}` : "",
      answers.area ? `Area: ${answers.area}` : "",
    ].filter(Boolean).join(" · ")
    try {
      const result = await sendEnquiry({
        kind: "counselling",
        acceptedTerms: accepted,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: [form.message, summary ? `(From the programme questionnaire: ${summary})` : ""].filter(Boolean).join("\n"),
      })
      setFormRef(result.id)
      setFormState("sent")
    } catch (error) {
      setFormError(enquiryErrorMessage(error))
      setFormState("failed")
    } finally {
      enquirySendingRef.current = false
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
  const showForm = siteOff || feedback === "unhelpful" || messages.some((m) => m.kind === "failure" && m.failure === "unavailable")

  return (
    <div className="sia">
      {invite && !open && !footerInView && clearOfContent ? (
        <div className="sia-invite" role="status">
          <button type="button" className="sia-invite__close" onClick={dismissInvite} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="sia-invite__text">Not sure where to start? A short questionnaire can suggest a programme from the catalogue.</p>
          <button type="button" className="sia-invite__go" onClick={() => openPanel("finder")}>
            Start questionnaire
            <ArrowRight />
          </button>
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        className={open || !clearOfContent ? "sia-launcher sia-launcher--hidden" : "sia-launcher"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open the programme questionnaire"
        aria-hidden={open || !clearOfContent ? true : undefined}
        tabIndex={open || !clearOfContent ? -1 : undefined}
        onClick={() => openPanel("finder")}
      >
        <SkylentBot size={34} />
        <span className="sia-launcher__label">Find a programme</span>
      </button>

      {open ? (
        <>
          <div className="sia-backdrop" onClick={close} aria-hidden="true" />
          <div ref={panelRef} className="sia-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onPanelKeyDown}>
            <div className="sia-head">
              <SkylentBot size={36} className="sia-head__bot" />
              <div className="sia-head__text">
                <span id={titleId} className="sia-head__title">Find a programme</span>
                <span className="sia-head__sub">A questionnaire</span>
              </div>
              <button type="button" className="sia-restart" onClick={startFinder}>
                Start over
              </button>
              <button type="button" className="sia-close" onClick={close} aria-label="Close the programme questionnaire">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="sia-scope">
              <p>This questionnaire matches your choices to programmes and degree samples. The matches are fixed rules.</p>
              <p>Lesson help is inside an open lesson, and only when {AI_NAME} is switched on. During an open quiz it withholds the quiz answers. <Link to="/path" onClick={close}>Find My Path</Link> is a separate, longer questionnaire.</p>
            </div>

            <div className="sia-thread" ref={threadRef} aria-live="polite" aria-busy={sending}>
              {messages.map((message) =>
                message.from === "user" ? (
                  <p key={message.id} className="sia-msg sia-msg--user">
                    {message.text}
                  </p>
                ) : message.kind === "suggestions" ? (
                  <div key={message.id}>
                    <ul className="sia-suggest" aria-label="Suggestions">
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
                    {/* These are picked by fixed rules from the published catalogue. They are not AI output. */}
                    <p className="sia-source">Matched to your answers from the Skylent catalogue. Not AI-generated.</p>
                  </div>
                ) : message.kind === "answer" ? (
                  <div key={message.id} className="sia-msg sia-msg--bot">
                    <p>{message.text}</p>
                    {message.action ? (
                      <Link className="sia-msg__action" to={message.action.to} onClick={close}>
                        {message.action.label}
                        <ArrowRight />
                      </Link>
                    ) : null}
                    {message.generated ? (
                      <p className="sia-source">AI-generated answer. Check important details with the Skylent team.</p>
                    ) : (
                      <p className="sia-source">Fixed reply from the site assistant.</p>
                    )}
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
                  <p key={message.id} className="sia-note">
                    {message.text}
                  </p>
                ),
              )}

              {sending ? (
                <p className="sia-msg sia-msg--bot sia-typing" aria-label="Waiting for the site assistant">
                  <span />
                  <span />
                  <span />
                </p>
              ) : null}

              {step ? (
                <div className="sia-step">
                  <p className="sia-prompt">{step.question}</p>
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
              {feedback === "helpful" ? <p className="sia-note">The box below sends a question to the site assistant. If it is switched off, this panel says so.</p> : null}
              {feedback === "unhelpful" ? <p className="sia-note">Leave your details and the Skylent team will reply by email.</p> : null}

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
                    {formState === "failed" ? <p className="sia-enquiry__error" role="alert">{formError} You can also write to support@skylent.live.</p> : null}
                    <button type="submit" className="sk-btn sk-btn-primary" disabled={formState === "sending"}>
                      {formState === "sending" ? "Sending" : "Send to the Skylent team"}
                    </button>
                  </form>
                )
              ) : null}
            </div>

            <form
              className={siteOff ? "sia-form is-off" : "sia-form"}
              onSubmit={(event) => {
                event.preventDefault()
                void ask(draft)
              }}
            >
              <p className="sia-form__kicker">Site assistant</p>
              <label className="sia-sr" htmlFor={`${titleId}-q`}>
                Ask about the public site
              </label>
              <div className="sia-form__row">
                <textarea
                  ref={inputRef}
                  id={`${titleId}-q`}
                  className="sia-input"
                  rows={1}
                  maxLength={2000}
                  value={draft}
                  disabled={sending || siteOff}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      void ask(draft)
                    }
                  }}
                  placeholder={siteOff ? "Site assistant is switched off" : "Ask about the public site"}
                />
                <button type="submit" className="sia-send" disabled={sending || siteOff || draft.trim() === ""} aria-label="Send question">
                  <ArrowRight />
                </button>
              </div>
              <p className="sia-foot">
                {siteOff
                  ? "Free-text answers are switched off. The form above sends a message to the Skylent team."
                  : "This box may be switched off. When you are signed in, a question can include your name and the names of courses you are enrolled in. Lesson progress, projects, and your career profile stay out of the request. Generated answers can be wrong."}
              </p>
            </form>
          </div>
        </>
      ) : null}
    </div>
  )
}
