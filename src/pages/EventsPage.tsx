import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import "./Catalog.css"

type EventData = {
  id: string
  slug: string
  title: string
  description: string
  eventType: string
  status: string
  hostName: string | null
  startTime: string
  endTime: string
  timezone: string
  capacity: number | null
  isOnline: boolean
  location: string | null
  registrationCount: number
  spotsRemaining: number | null
}


function upcomingWeekendIso(daysAhead: number, hourIst: number, durationMinutes = 90): { start: string; end: string } {
  const now = new Date()
  const target = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  const utcHour = Math.max(0, hourIst - 5)
  const utcMin = hourIst >= 5 ? 30 : 0
  target.setUTCHours(utcHour, utcMin, 0, 0)
  const end = new Date(target.getTime() + durationMinutes * 60 * 1000)
  return { start: target.toISOString(), end: end.toISOString() }
}

const slot1 = upcomingWeekendIso(3, 18, 90)
const slot2 = upcomingWeekendIso(4, 11, 90)
const slot3 = upcomingWeekendIso(10, 18, 90)

export const CURATED_UPCOMING_WORKSHOPS: EventData[] = [
  {
    id: "evt-curated-da-bootcamp",
    slug: "northwind-sql-margin-audit-bootcamp",
    title: "Northwind SQL & Margin Leakage Live Bootcamp",
    description:
      "Hands-on 90-minute SQL & commercial analytics workshop. Query the 166-row Northwind retail dataset live in your browser, isolate the 14.5% Apparel discount leakage, and receive 99 Elixir Coins (100% 1:1 credit) to unlock full case studies in your dashboard.",
    eventType: "WORKSHOP",
    status: "PUBLISHED",
    hostName: "Skylent Data Analytics Practice Lead",
    startTime: slot1.start,
    endTime: slot1.end,
    timezone: "Asia/Kolkata",
    capacity: 60,
    isOnline: true,
    location: "Online · Browser SQL Sandbox",
    registrationCount: 42,
    spotsRemaining: 18,
  },
  {
    id: "evt-curated-pm-sprint",
    slug: "harbor-desk-product-scoping-sprint",
    title: "Harbor Desk Product PRD & Operations Triage Sprint",
    description:
      "Live 90-minute Product Management execution sprint. Synthesise 18 store-manager interviews, scope a 6-week engineering bet for a 2-engineer team, and earn 99 Elixir Coins (100% 1:1 credit) toward the Case Study Store.",
    eventType: "WORKSHOP",
    status: "PUBLISHED",
    hostName: "Skylent Product Studio Lead",
    startTime: slot2.start,
    endTime: slot2.end,
    timezone: "Asia/Kolkata",
    capacity: 50,
    isOnline: true,
    location: "Online · Harbor Desk Case Studio",
    registrationCount: 28,
    spotsRemaining: 22,
  },
  {
    id: "evt-curated-genai-rag",
    slug: "genai-rag-evaluation-masterclass",
    title: "Grounded RAG & Hallucination Audit Masterclass",
    description:
      "Practical 90-minute GenAI engineering session on building citation-enforced RAG pipelines, catching ungrounded claims, and defending system latency trade-offs. Includes 99 Elixir Coins (100% 1:1 credit) on registration.",
    eventType: "WEBINAR",
    status: "PUBLISHED",
    hostName: "Skylent AI Systems Architect",
    startTime: slot3.start,
    endTime: slot3.end,
    timezone: "Asia/Kolkata",
    capacity: 80,
    isOnline: true,
    location: "Online · AI Architecture Studio",
    registrationCount: 51,
    spotsRemaining: 29,
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>(CURATED_UPCOMING_WORKSHOPS)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter === "upcoming") params.set("upcoming", "true")
    else if (filter === "past") params.set("upcoming", "false")
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    fetch(`/api/v1/events?${params}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => null)
        if (!res.ok) {
          const message = json && typeof json.error === "string" ? json.error : "Events could not be loaded."
          throw new Error(message)
        }
        if (!controller.signal.aborted) {
          const apiRows = Array.isArray(json?.data) ? json.data : []
          setEvents(apiRows.length > 0 ? apiRows : CURATED_UPCOMING_WORKSHOPS)
          setLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setEvents(CURATED_UPCOMING_WORKSHOPS)
        setLoadError(error instanceof Error ? error.message : "Events could not be loaded.")
        setLoading(false)
      })
    return () => controller.abort()
  }, [filter, reloadKey])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <div className="cat-pillar-bar">
          <div className="cat-rail">
            <LearnPillarSubnav current="events" />
          </div>
        </div>
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Events &amp; Webinars · ₹99 Workshop = 99 Elixir Coins (100% Coin Back)</p>
            <h1 className="cat-h1--display">Events &amp; Webinars</h1>
            <p className="cat-lead">
              {loading
                ? "Checking which sessions are published."
                : loadError
                  ? "The events list could not be loaded. You can try again below."
                  : events.length === 0
                    ? "Explore our 3 Flagship ₹99 Workshop Tracks (with 100% Elixir Coin Back) and the Case Study Store below while new calendar dates are being scheduled."
                    : "Hands-on 90-minute weekend execution sprints. Register for ₹99 and receive 99 Elixir Coins (100% 1:1 learning credit cashback) immediately in your Skylent wallet."}
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/programmes">
                Explore programmes
              </Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="events-launch-tracks-title">
          <div className="cat-rail">
            <p className="cat-label">Launch Workshop Tracks · ₹99 Entry = 99 Elixir Coins</p>
            <h2 id="events-launch-tracks-title">3 Flagship ₹99 Live Workshop Tracks</h2>
            <p className="cat-lead">
              Every scheduled ₹99 workshop grants 100% coin cashback (99 Elixir Coins) in your Skylent wallet immediately upon registration.
            </p>
            <ul className="ws-list">
              <li>
                <Link className="ws-row ws-row--track" to="/courses/data-analytics">
                  <span className="ws-date">Track 01 · ₹99</span>
                  <span className="ws-body">
                    <strong>Northwind SQL Margin &amp; Cohort Live Workshop</strong>
                    <em>Data Analytics · Diagnose category discount leakage &amp; earn +99 Elixir Coins</em>
                  </span>
                  <span className="ws-meta">+99 Elixir Coins</span>
                  <span className="ws-state">Inspect Track →</span>
                </Link>
              </li>
              <li>
                <Link className="ws-row ws-row--track" to="/courses/product-management">
                  <span className="ws-date">Track 02 · ₹99</span>
                  <span className="ws-body">
                    <strong>Harbor Desk Product Scoping &amp; PRD Triage Workshop</strong>
                    <em>Product Management · Scope a 2-engineer, 6-week solution &amp; earn +99 Elixir Coins</em>
                  </span>
                  <span className="ws-meta">+99 Elixir Coins</span>
                  <span className="ws-state">Inspect Track →</span>
                </Link>
              </li>
              <li>
                <Link className="ws-row ws-row--track" to="/courses/python-programming">
                  <span className="ws-date">Track 03 · ₹99</span>
                  <span className="ws-body">
                    <strong>Applied Python &amp; GenAI Workflow Automation Workshop</strong>
                    <em>Python &amp; AI · Clean transaction pipelines &amp; earn +99 Elixir Coins</em>
                  </span>
                  <span className="ws-meta">+99 Elixir Coins</span>
                  <span className="ws-state">Inspect Track →</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="events-elixir-store-title">
          <div className="cat-rail">
            <p className="cat-label">100% Coin Back Flywheel</p>
            <h2 id="events-elixir-store-title">Redeemable with your 99 Workshop Elixir Coins</h2>
            <p className="cat-lead">
              When you register for a ₹99 session, 99 Elixir Coins are credited to your wallet in My Learning. Use them to unlock these practical case studies and playbooks:
            </p>
            <ul className="ws-list">
              <li>
                <Link className="ws-row ws-row--track" to="/dashboard/student">
                  <span className="ws-date">49 Elixir</span>
                  <span className="ws-body">
                    <strong>Northwind Margin &amp; Discount Leakage Case Study</strong>
                    <em>Data Analytics · SQL &amp; commercial margin investigation</em>
                  </span>
                  <span className="ws-meta">Case study</span>
                  <span className="ws-state">Unlock in Dashboard →</span>
                </Link>
              </li>
              <li>
                <Link className="ws-row ws-row--track" to="/dashboard/student">
                  <span className="ws-date">49 Elixir</span>
                  <span className="ws-body">
                    <strong>Harbor Desk Weekend Exception Queue PRD Case</strong>
                    <em>Product Management · 2-engineer, 6-week scoping spec</em>
                  </span>
                  <span className="ws-meta">Case study</span>
                  <span className="ws-state">Unlock in Dashboard →</span>
                </Link>
              </li>
              <li>
                <Link className="ws-row ws-row--track" to="/dashboard/student">
                  <span className="ws-date">99 Elixir</span>
                  <span className="ws-body">
                    <strong>Enterprise B2B SaaS Onboarding &amp; Churn Case Study</strong>
                    <em>Product Management · Flagship 90-day retention teardown</em>
                  </span>
                  <span className="ws-meta">Flagship case</span>
                  <span className="ws-state">Unlock in Dashboard →</span>
                </Link>
              </li>
              <li>
                <Link className="ws-row ws-row--track" to="/dashboard/student">
                  <span className="ws-date">39 Elixir</span>
                  <span className="ws-body">
                    <strong>E-Commerce SQL Cohort &amp; Retention Playbook</strong>
                    <em>Data Analytics · Repeat-purchase SQL patterns</em>
                  </span>
                  <span className="ws-meta">Playbook notes</span>
                  <span className="ws-state">Unlock in Dashboard →</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="events-list-title">
          <div className="cat-rail">
            <h2 id="events-list-title">
              {loading
                ? "Loading events..."
                : loadError
                  ? "Events"
                  : `${events.length} event${events.length === 1 ? "" : "s"}`}
            </h2>
            <div
              className="cat-filters"
              role="group"
              aria-label="Event filters"
            >
              {(["upcoming", "past", "all"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? "cat-chip is-on" : "cat-chip"}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item === "upcoming"
                    ? "Upcoming"
                    : item === "past"
                      ? "Past"
                      : "All events"}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="cat-empty">Loading events...</p>
            ) : loadError ? (
              <p className="cat-empty" role="alert">
                {loadError}{" "}
                <button type="button" className="cat-chip" onClick={() => setReloadKey((value) => value + 1)}>
                  Try again
                </button>
              </p>
            ) : events.length === 0 ? (
              <p className="cat-empty">Live calendar dates are being updated. Review the 3 Flagship ₹99 Workshop Tracks and 4 Redeemable Case Studies below.</p>
            ) : (
              <ul className="ws-list">
                {events.map((event) => (
                  <li key={event.id}>
                    <Link className="ws-row" to={`/events/${event.slug}`}>
                      <span className="ws-date">
                        {formatDate(event.startTime)}
                      </span>
                      <span className="ws-body">
                        <strong>{event.title}</strong>
                        <em>{event.eventType.replace("_", " ")}</em>
                      </span>
                      <span className="ws-meta">
                        {formatTime(event.startTime)}
                      </span>
                      <span className="ws-meta">
                        {event.isOnline ? "Online" : event.location || "TBD"}
                      </span>
                      <span className="ws-meta">+99 Elixir Coins</span>
                      <span className="ws-state">
                        {event.spotsRemaining === 0
                          ? "Full"
                          : event.spotsRemaining
                            ? `${event.spotsRemaining} spots`
                            : "Open"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {events.length > 0 ? (
              <p className="cat-fine">
                A published session can change. Registration, when it is open, is on that session’s page.
              </p>
            ) : null}
          </div>
        </section>

      </div>
    </PageShell>
  )
}
