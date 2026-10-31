import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import { CURATED_UPCOMING_WORKSHOPS } from "../lib/curated-workshops"
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
          if (apiRows.length === 0 && filter !== "past") {
            setEvents(CURATED_UPCOMING_WORKSHOPS)
          } else {
            setEvents(apiRows)
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return
        if (filter !== "past") {
          setEvents(CURATED_UPCOMING_WORKSHOPS)
          setLoadError(null)
        } else {
          setEvents([])
        }
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
            <h1 className="cat-h1--display">Live Weekend Bootcamps &amp; Case Sprints</h1>
            <p className="cat-lead">
              {loading
                ? "Loading upcoming weekend workshops and live case sprints..."
                : events.length === 0
                  ? "No past sessions in this filter. Switch to Upcoming to view open weekend workshops."
                  : "Join a 90-minute weekend execution sprint for ₹99 and receive 99 Elixir Coins (100% 1:1 learning credit) to unlock real SQL and Product case studies."}
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/programmes">
                Explore programmes
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/dashboard/student">
                Open Case Study Store
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
                  : `${events.length} scheduled session${events.length === 1 ? "" : "s"}`}
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
              <p className="cat-empty">
                No past sessions recorded yet.{" "}
                <button type="button" className="cat-chip" onClick={() => setFilter("upcoming")}>
                  Show upcoming workshops
                </button>
              </p>
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
                        <em>{event.eventType.replace("_", " ")} · ₹99 Entry (100% Coin Back)</em>
                      </span>
                      <span className="ws-meta">
                        {formatTime(event.startTime)}
                      </span>
                      <span className="ws-meta">
                        {event.isOnline ? "Online" : event.location || "Online"}
                      </span>
                      <span className="ws-meta">+99 Elixir Coins</span>
                      <span className="ws-state">
                        {event.spotsRemaining === 0
                          ? "Full"
                          : event.spotsRemaining
                            ? `${event.spotsRemaining} spots left`
                            : "Open"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {events.length > 0 ? (
              <p className="cat-fine">
                Every ₹99 workshop registration credits 99 Elixir Coins directly to your learner wallet upon confirmation.
              </p>
            ) : null}
          </div>
        </section>

        <section className="cat-section" aria-labelledby="events-elixir-store-title">
          <div className="cat-rail">
            <p className="cat-label">Why Elixir Credits Exist · 1:1 Learning Credit</p>
            <h2 id="events-elixir-store-title">Redeemable with your 99 Workshop Elixir Coins</h2>
            <p className="cat-lead">
              Your ₹99 workshop fee returns 1:1 as 99 Elixir Coins in My Learning—so you can unlock and solve a real SQL or Product case study before committing to a full programme:
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
