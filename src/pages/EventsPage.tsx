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
            <p className="cat-label">Events &amp; Webinars</p>
            <h1 className="cat-h1--display">Events &amp; Webinars</h1>
            <p className="cat-lead">
              Register for upcoming sessions or browse past events. Filter by
              date to find what you need.
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
            <p className="cat-fine">
              Events are subject to change. Registration is required for all
              sessions.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
