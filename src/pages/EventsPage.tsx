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
    title: "Northwind SQL & Margin Leakage Live Workshop",
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

const LAUNCH_TRACKS = [
  {
    badge: "TRACK 01 · DATA ANALYTICS",
    fee: "₹99 Entry → +99 Elixir Coins",
    title: "Northwind SQL Margin & Cohort Live Workshop",
    desc: "Query 166 validated Northwind retail rows in your browser, isolate category discount leakage, and write a 3-point commercial recommendation.",
    lab: "Northwind SQL Lab · Zero Setup",
    to: "/courses/data-analytics",
  },
  {
    badge: "TRACK 02 · PRODUCT MANAGEMENT",
    fee: "₹99 Entry → +99 Elixir Coins",
    title: "Harbor Desk Product Scoping & PRD Triage Workshop",
    desc: "Synthesise 18 store-manager interviews, frame the weekend exception bottleneck, and scope a 6-week bet for a 2-engineer squad.",
    lab: "Harbor Desk PRD Studio",
    to: "/courses/product-management",
  },
  {
    badge: "TRACK 03 · PYTHON & GENAI",
    fee: "₹99 Entry → +99 Elixir Coins",
    title: "Applied Python & GenAI Workflow Automation Workshop",
    desc: "Quarantine duplicate webhook retries, enforce schema contracts, and evaluate citation-grounded LLM outputs inside the browser sandbox.",
    lab: "Python & RAG Evaluator",
    to: "/courses/python-programming",
  },
]

const CASE_STORE_ITEMS = [
  {
    coins: "49 Elixir",
    kind: "Case study · Data Analytics",
    title: "Northwind Margin & Discount Leakage Case Study",
    desc: "Full SQL solution queries, cohort margin breakdown tables, and exemplar executive memo.",
    to: "/dashboard/student",
  },
  {
    coins: "49 Elixir",
    kind: "Case study · Product Management",
    title: "Harbor Desk Weekend Exception Queue PRD Case",
    desc: "Complete 18-interview synthesis matrix, trade-off rubric, and 6-week engineering PRD.",
    to: "/dashboard/student",
  },
  {
    coins: "99 Elixir",
    kind: "Flagship case · SaaS Retention",
    title: "Enterprise B2B SaaS Onboarding & Churn Case Study",
    desc: "End-to-end 90-day activation bottleneck teardown — redeemable with a single ₹99 workshop cashback.",
    to: "/dashboard/student",
  },
  {
    coins: "39 Elixir",
    kind: "Playbook notes · SQL",
    title: "E-Commerce SQL Cohort & Retention Playbook",
    desc: "Reusable window-function patterns, repeat-purchase SQL templates, and grain-fanout checks.",
    to: "/dashboard/student",
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
        <LearnPillarSubnav current="events" />

        {/* 2-Column Royal Purple + Soft Lavender Masterclass & Workshop Hub Hero */}
        <section
          className="cat-hero"
          style={{
            background: "linear-gradient(180deg, #F6F4FF 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #E2DCFF",
            paddingBlock: "clamp(36px, 5vw, 60px)",
          }}
        >
          <div
            className="cat-rail"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 28,
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "#DCFCE7",
                  border: "1px solid #86EFAC",
                  color: "#15803D",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                WEEKEND MASTERCLASSES · ₹99 ENTRY = 99 ELIXIR COINS (100% COIN BACK)
              </span>
              <h1 className="cat-h1--display" style={{ marginTop: 0 }}>
                Live Execution Sprints &amp; Case Study Store
              </h1>
              <p className="cat-lead" style={{ maxWidth: "46ch" }}>
                {loading
                  ? "Checking which live weekend sprints are open for registration."
                  : loadError
                    ? "Showing our curated weekend execution sprints while the live schedule refreshes."
                    : "Join a 90-minute hands-on weekend workshop in the browser lab for ₹99 and get 99 Elixir Coins (100% cashback) instantly."}
              </p>
              <div className="cat-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
                <a className="cat-btn cat-btn-primary" href="#events-launch-tracks-title">
                  Browse upcoming sprints ↓
                </a>
                <Link className="cat-btn" to="/programmes" style={{ background: "#FFFFFF", border: "1.5px solid #DDD7FF", color: "#5142B5", fontWeight: 700 }}>
                  Explore all 6 programmes →
                </Link>
              </div>
            </div>

            {/* Right-Hand Featured Next Session & Flywheel Summary Card */}
            <aside
              style={{
                padding: "24px 26px",
                borderRadius: 20,
                background: "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)",
                border: "1.5px solid rgba(196, 184, 255, 0.45)",
                color: "#FFFFFF",
                boxShadow: "0 20px 44px -18px rgba(59, 45, 150, 0.4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#E9D5FF", letterSpacing: "0.08em" }}>
                  HOW ₹99 WORKSHOPS WORK
                </span>
                <span style={{ padding: "3px 10px", borderRadius: 999, background: "#DCFCE7", color: "#15803D", fontSize: 11, fontWeight: 600 }}>
                  100% Coin Back
                </span>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 600, color: "#FFFFFF" }}>
                Pay ₹99 → Attend Live Lab → Unlock ₹99 Case Studies Free
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.55, color: "#E2E8F0" }}>
                Every rupee you spend on a weekend sprint is returned 1:1 as Elixir Coins in your learner wallet so you can unlock solved industry teardowns and SQL playbooks.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  ["STEP 01", "Register for ₹99", "90-min weekend sprint"],
                  ["STEP 02", "Get +99 Elixir", "Instant wallet credit"],
                  ["STEP 03", "Unlock Cases", "Redeem in dashboard"],
                ].map(([step, head, sub]) => (
                  <div key={step} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255, 255, 255, 0.14)", border: "1px solid rgba(255, 255, 255, 0.22)" }}>
                    <span style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "#C4B8FF", fontWeight: 700 }}>{step}</span>
                    <strong style={{ display: "block", fontSize: 13, color: "#FFFFFF", marginTop: 2 }}>{head}</strong>
                    <span style={{ display: "block", fontSize: 11, color: "#E2E8F0", marginTop: 2 }}>{sub}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Section 1: 3 Flagship ₹99 Live Workshop Tracks (3-Card Grid) */}
        <section className="cat-section" aria-labelledby="events-launch-tracks-title">
          <div className="cat-rail">
            <p className="cat-label">Launch Workshop Tracks · ₹99 Entry = 99 Elixir Coins</p>
            <h2 id="events-launch-tracks-title">3 Flagship ₹99 Live Workshop Tracks</h2>
            <p className="cat-lead">
              Every scheduled ₹99 workshop grants 100% coin cashback (99 Elixir Coins) in your Skylent wallet immediately upon registration.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginTop: 22 }}>
              {LAUNCH_TRACKS.map((track) => (
                <Link
                  key={track.title}
                  to={track.to}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "22px 24px",
                    borderRadius: 18,
                    background: "#FFFFFF",
                    border: "1.5px solid #DDD7FF",
                    boxShadow: "0 12px 28px -16px rgba(81, 66, 181, 0.18)",
                    textDecoration: "none",
                    color: "#0F172A",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142B5" }}>
                      {track.badge}
                    </span>
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", fontSize: 11, fontWeight: 700 }}>
                      {track.fee}
                    </span>
                  </div>
                  <strong style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", lineHeight: 1.3 }}>
                    {track.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#475569", flex: 1 }}>
                    {track.desc}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #F1F5F9", fontSize: 12.5, fontWeight: 700, color: "#5142B5" }}>
                    <span>{track.lab}</span>
                    <span>Inspect Track →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Redeemable Case Study Store (4-Card Grid) */}
        <section
          className="cat-section"
          aria-labelledby="events-elixir-store-title"
          style={{ background: "linear-gradient(180deg, #F6F4FF 0%, #FFFFFF 100%)", borderBlock: "1px solid #E2DCFF" }}
        >
          <div className="cat-rail">
            <p className="cat-label">100% Coin Back Rewards</p>
            <h2 id="events-elixir-store-title">Redeemable with your 99 Workshop Elixir Coins</h2>
            <p className="cat-lead">
              When you register for a ₹99 session, 99 Elixir Coins are credited to your wallet in My Learning. Use them to unlock these practical case studies and playbooks:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 22 }}>
              {CASE_STORE_ITEMS.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "20px",
                    borderRadius: 16,
                    background: "#FFFFFF",
                    border: "1.5px solid #DDD7FF",
                    textDecoration: "none",
                    color: "#0F172A",
                    boxShadow: "0 8px 22px -14px rgba(81, 66, 181, 0.14)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "#F5F3FF", border: "1px solid #DDD7FF", color: "#5142B5", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>
                      {item.coins}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>{item.kind}</span>
                  </div>
                  <strong style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", lineHeight: 1.35 }}>
                    {item.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#475569", flex: 1 }}>
                    {item.desc}
                  </p>
                  <span style={{ paddingTop: 8, fontSize: 12.5, fontWeight: 700, color: "#5142B5" }}>
                    Unlock in Dashboard →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Scheduled Weekend Sessions */}
        <section className="cat-section" aria-labelledby="events-list-title">
          <div className="cat-rail">
            <h2 id="events-list-title">
              {loading
                ? "Loading events..."
                : loadError
                  ? "Upcoming Live Sprints"
                  : `${events.length} scheduled live sprint${events.length === 1 ? "" : "s"}`}
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
            ) : events.length === 0 ? (
              <p className="cat-empty">Live calendar dates are being updated. Review the 3 Flagship ₹99 Workshop Tracks and 4 Redeemable Case Studies above.</p>
            ) : (
              <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, auto) 1fr auto",
                      alignItems: "center",
                      gap: 18,
                      padding: "20px 24px",
                      borderRadius: 16,
                      background: "#FFFFFF",
                      border: "1.5px solid #DDD7FF",
                      borderLeft: "5px solid #5142B5",
                      textDecoration: "none",
                      color: "#0F172A",
                      boxShadow: "0 8px 22px -14px rgba(81, 66, 181, 0.12)",
                    }}
                  >
                    <div>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5142B5" }}>
                        {formatDate(event.startTime)}
                      </span>
                      <span style={{ display: "block", fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        {formatTime(event.startTime)} IST
                      </span>
                    </div>
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 999, background: "#F5F3FF", border: "1px solid #DDD7FF", color: "#5142B5", fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {event.eventType}
                        </span>
                        <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                          {event.location || "Online · Skylent OS"}
                        </span>
                      </div>
                      <strong style={{ display: "block", fontSize: 17.5, fontWeight: 600, color: "#0F172A" }}>
                        {event.title}
                      </strong>
                      <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
                        {event.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, background: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", fontSize: 11.5, fontWeight: 600 }}>
                        ₹99 → +99 Elixir
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#5142B5" }}>
                        {event.spotsRemaining === 0
                          ? "Session Full"
                          : event.spotsRemaining
                            ? `${event.spotsRemaining} spots left · Register →`
                            : "Register →"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
