import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { useAuth } from "../context/AuthContext"
import { ensureCsrfToken } from "../lib/auth-api"
import "./Catalog.css"

type EventDetail = {
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
  meetingUrl: string | null
  isOnline: boolean
  location: string | null
  registrationCount: number
  spotsRemaining: number | null
  userRegistration: {
    status: string
    registeredAt: string
  } | null
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/events/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found")
        return res.json()
      })
      .then((json) => {
        setEvent(json.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  const handleRegister = async () => {
    if (!user || !event) return
    setRegistering(true)
    setError(null)

    try {
      const token = await ensureCsrfToken()
      const res = await fetch(`/api/v1/events/${slug}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
        },
        credentials: "include",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Registration failed")
      }

      const json = await res.json()
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              userRegistration: json.data,
              registrationCount: prev.registrationCount + 1,
              spotsRemaining: prev.spotsRemaining !== null ? prev.spotsRemaining - 1 : null,
            }
          : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setRegistering(false)
    }
  }

  const handleCancel = async () => {
    if (!user || !event) return
    setRegistering(true)
    setError(null)

    try {
      const token = await ensureCsrfToken()
      const res = await fetch(`/api/v1/events/${slug}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
        },
        credentials: "include",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Cancellation failed")
      }

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              userRegistration: null,
              registrationCount: prev.registrationCount - 1,
              spotsRemaining: prev.spotsRemaining !== null ? prev.spotsRemaining + 1 : null,
            }
          : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed")
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

  const isPast = event ? new Date(event.startTime) < new Date() : false
  const isRegistered = event?.userRegistration?.status === "REGISTERED"
  const isFull = event?.spotsRemaining === 0

  if (loading) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <p>Loading event...</p>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  if (error || !event) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <Link className="cat-back" to="/events">
                ← Back to events
              </Link>
              <h1>Event not found</h1>
              <p className="cat-lead">{error || "This event does not exist or has been removed."}</p>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <Link className="cat-back" to="/events">
              ← Back to events
            </Link>
            <div className="cat-intro">
              <div className="cat-intro-crumb">
                <span className="cat-mark">{event.eventType.replace("_", " ")}</span>
              </div>
              <div className="cat-intro-copy">
                <h1>{event.title}</h1>
                <p className="cat-lead">{event.description}</p>
                {event.hostName && (
                  <p className="cat-meta">
                    Hosted by <strong>{event.hostName}</strong>
                  </p>
                )}
              </div>
              <div className="cat-intro-meta">
                <div className="cat-facts">
                  <div className="cat-fact">
                    <span>Date</span>
                    <strong>{formatDate(event.startTime)}</strong>
                  </div>
                  <div className="cat-fact">
                    <span>Time</span>
                    <strong>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </strong>
                  </div>
                  <div className="cat-fact">
                    <span>Coin Cashback</span>
                    <strong>₹99 → 99 Elixir Coins (100%)</strong>
                  </div>
                  <div className="cat-fact">
                    <span>Location</span>
                    <strong>{event.isOnline ? "Online" : event.location || "TBD"}</strong>
                  </div>
                  {event.capacity && (
                    <div className="cat-fact">
                      <span>Capacity</span>
                      <strong>
                        {event.registrationCount} / {event.capacity}
                      </strong>
                    </div>
                  )}
                </div>
                <div className="cat-intro-actions">
                  {error && <p style={{ color: "var(--skylent-color-error)", marginBottom: 12 }}>{error}</p>}
                  {!user ? (
                    <Link className="cat-btn cat-btn-primary cat-btn-lg" to="/login">
                      Sign in to register
                    </Link>
                  ) : isPast ? (
                    <button className="cat-btn cat-btn-ghost cat-btn-lg" disabled>
                      Event ended
                    </button>
                  ) : isRegistered ? (
                    <>
                      <p className="cat-note" style={{ marginBottom: 12 }}>
                        ✓ You are registered! +99 Elixir Coins (100% Coin Cashback) credited to your wallet for Case Studies.
                      </p>
                      {event.meetingUrl && (
                        <a
                          className="cat-btn cat-btn-primary cat-btn-lg"
                          href={event.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join event
                        </a>
                      )}
                      <button
                        className="cat-btn cat-btn-ghost"
                        onClick={handleCancel}
                        disabled={registering}
                        style={{ marginTop: 8 }}
                      >
                        {registering ? "Cancelling..." : "Cancel registration"}
                      </button>
                    </>
                  ) : isFull ? (
                    <button className="cat-btn cat-btn-ghost cat-btn-lg" disabled>
                      Event is full
                    </button>
                  ) : (
                    <button
                      className="cat-btn cat-btn-primary cat-btn-lg"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? "Registering..." : "Register for event"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            <h2>About this event</h2>
            <p className="cat-lead" style={{ whiteSpace: "pre-wrap" }}>
              {event.description}
            </p>
            <p className="cat-fine">
              Timezone: {event.timezone}. Times shown are in your local timezone.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
