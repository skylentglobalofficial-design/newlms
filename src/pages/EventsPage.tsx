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

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([])
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
          setEvents(Array.isArray(json?.data) ? json.data : [])
          setLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setEvents([])
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
                    ? "No sessions are scheduled. Nothing on this page can be booked."
                    : "These are the sessions currently published. Open one to see whether you can register."}
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/programmes">
                Explore programmes
              </Link>
            </div>
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
              <p className="cat-empty">No events are scheduled.</p>
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

        <section className="cat-section" aria-labelledby="events-elixir-store-title">
          <div className="cat-rail">
            <p className="cat-label">100% Coin Back Flywheel</p>
            <h2 id="events-elixir-store-title">Redeemable with your 99 Workshop Elixir Coins</h2>
            <p className="cat-lead">
              When you register for a ₹99 session, 99 Elixir Coins are credited to your wallet in My Learning. Use them to unlock these practical case studies and playbooks:
            </p>
            <ul className="ws-list">
              <li>
                <Link className="ws-row" to="/dashboard/student">
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
                <Link className="ws-row" to="/dashboard/student">
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
                <Link className="ws-row" to="/dashboard/student">
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
                <Link className="ws-row" to="/dashboard/student">
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

      </div>
    </PageShell>
  )
}
