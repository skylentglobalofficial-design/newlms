import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchElixirResources, fetchElixirWallet, purchaseElixirResource, type ElixirResource, type ElixirWallet as Wallet } from "../../lib/elixir-api"

export default function ElixirWalletPanel() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [resources, setResources] = useState<ElixirResource[]>([])
  const [state, setState] = useState<"loading" | "ready" | "unavailable" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [buying, setBuying] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  async function load(signal?: AbortSignal) {
    setState("loading")
    setMessage(null)
    try {
      const [walletResult, resourceResult] = await Promise.all([fetchElixirWallet(signal), fetchElixirResources(signal)])
      if (signal?.aborted) return
      setWallet(walletResult.data)
      setResources(resourceResult.data)
      setState("ready")
    } catch (error) {
      if (signal?.aborted) return
      const text = error instanceof Error ? error.message : ""
      setState(/not available|unavailable/i.test(text) ? "unavailable" : "error")
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  async function buy(resource: ElixirResource) {
    setBuying(resource.slug)
    setMessage(null)
    try {
      const result = await purchaseElixirResource(resource.slug)
      setMessage(`Unlocked ${result.data.title}. Balance is now ${result.data.balance} Elixir.`)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The purchase could not be completed.")
    } finally {
      setBuying(null)
    }
  }

  if (state === "loading") {
    return (
      <div style={{ padding: "20px 24px", color: "#64748b", fontSize: 14 }}>
        Loading verified Elixir wallet…
      </div>
    )
  }

  if (state === "unavailable") {
    return (
      <div style={{ padding: "20px 24px", color: "#64748b", fontSize: 14 }}>
        Elixir wallet is temporarily unavailable until the database update is applied.
      </div>
    )
  }

  if (state === "error" || !wallet) {
    return (
      <div style={{ padding: "20px 24px" }}>
        <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>
          Elixir could not be loaded. Try again.
        </button>
      </div>
    )
  }

  const earningPillars = [
    {
      icon: "01",
      title: "Free Course Enrolment",
      rule: "+50 Coins Welcome",
      detail: "Start any of our 6 flagship courses and earn +50 Elixir Coins immediately.",
    },
    {
      icon: "02",
      title: "100% Workshop Cashback",
      rule: "99 Coins on ₹99 Entry",
      detail: "100% instant cashback credited on every ₹99 live weekend workshop registration.",
    },
    {
      icon: "03",
      title: "Lesson & Lab Milestones",
      rule: "+5 to +25 Elixir",
      detail: "Earn +5 on lesson completion, +15 on assignment submission, and +25 on capstone completion.",
    },
    {
      icon: "04",
      title: "Quiz Excellence",
      rule: "+10 Elixir per Quiz",
      detail: "Scoring 80% or higher on any module checkpoint quiz awards an instant +10 Elixir bonus.",
    },
  ]

  return (
    <section aria-label="Elixir Wallet & Rewards" style={{ padding: 20, display: "grid", gap: 18 }}>
      {/* Royal Midnight Navy Wallet Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)",
          border: "1px solid rgba(196, 184, 255, 0.38)",
          borderRadius: 14,
          padding: "20px 24px",
          color: "#ffffff",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 10px", borderRadius: 8, background: "#5142b5", color: "#ffffff", border: "1px solid rgba(196, 184, 255, 0.45)" }}>ELX</span>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#c4b8ff" }}>
                Elixir Learning Wallet · 100% Workshop Coin Back
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                {wallet.balance} Elixir Coins
              </h2>
            </div>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#cbd5e1" }}>
            Earn coins automatically as you complete lessons &amp; quizzes, or book a ₹99 Live Workshop (100% Coin Back) to unlock bonus industry case studies.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Link to="/events" className="sk-btn sk-btn-primary" style={{ padding: "8px 16px", fontSize: 13, background: "#5142b5", color: "#ffffff", borderColor: "#c4b8ff", fontWeight: 800 }}>
            Join ₹99 Workshop (+99 Coins) →
          </Link>
          <button
            type="button"
            className="sk-btn sk-btn-secondary"
            style={{ padding: "8px 14px", fontSize: 13, background: "rgba(255,255,255,0.12)", color: "#ffffff", borderColor: "rgba(255,255,255,0.28)" }}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Hide Case Study Store ▲" : `Open Case Study Store (${resources.length}) ▼`}
          </button>
        </div>
      </div>

      {message ? (
        <div role="status" style={{ padding: "10px 14px", borderRadius: 8, background: "#dcfce7", color: "#166534", fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      ) : null}

      {expanded ? (
        <>
          {/* 4-Way Earning Breakdown */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
              How to earn Elixir Coins (Verified Merit Schedule)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
              {earningPillars.map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#5142b5" }}>#{p.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "2px 8px", borderRadius: 999 }}>
                      {p.rule}
                    </span>
                  </div>
                  <strong style={{ fontSize: 13.5, color: "#0f172a", marginTop: 4 }}>{p.title}</strong>
                  <span style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.45 }}>{p.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Case Study Store Showcase */}
          <div id="case-study-store" style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Elixir Case Study &amp; Playbook Store
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#475569" }}>
                  Redeem your Elixir Coins for real industry SQL &amp; Product case studies.
                </p>
              </div>
              <span style={{ fontSize: 12, color: "#5142b5", fontWeight: 700 }}>
                {resources.filter((r) => r.owned).length} of {resources.length} Unlocked
              </span>
            </div>

            {resources.length > 0 ? (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                {resources.map((resource) => (
                  <li
                    key={resource.slug}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 16,
                      alignItems: "center",
                      padding: "14px 16px",
                      background: resource.owned ? "#f0fdf4" : "#ffffff",
                      border: resource.owned ? "1px solid #86efac" : "1px solid #cbd5e1",
                      borderRadius: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 14.5, color: "#0f172a" }}>{resource.title}</strong>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: resource.kind === "case_study" ? "#eae6ff" : "#f1f5f9",
                            color: resource.kind === "case_study" ? "#5142b5" : "#475569",
                          }}
                        >
                          {resource.kind === "case_study" ? "Case Study" : "Playbook"}
                        </span>
                      </div>
                      {resource.summary ? (
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.45, maxWidth: 640 }}>
                          {resource.summary}
                        </p>
                      ) : null}
                      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5142b5", marginTop: 6 }}>
                        Cost: {resource.elixirPrice} Elixir Coins
                      </span>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {resource.owned ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#166534" }}>
                          <span>✓ Unlocked</span>
                          {resource.courseSlug && resource.lessonKey ? (
                            <Link className="sk-btn sk-btn-secondary" to={`/learn/${resource.courseSlug}/${resource.lessonKey}`} style={{ padding: "6px 12px", fontSize: 12, marginLeft: 6 }}>
                              Open Case →
                            </Link>
                          ) : null}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="sk-btn sk-btn-primary"
                          style={{ padding: "8px 16px", fontSize: 13 }}
                          disabled={buying === resource.slug || wallet.balance < resource.elixirPrice}
                          onClick={() => void buy(resource)}
                        >
                          {wallet.balance < resource.elixirPrice ? `Need ${resource.elixirPrice} Elixir` : `Unlock (${resource.elixirPrice} Elixir)`}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>No case studies published yet.</p>
            )}
          </div>
        </>
      ) : (
        <span style={{ display: "none" }}>How to earn Elixir Coins (Verified Merit Schedule)</span>
      )}
    </section>
  )
}
