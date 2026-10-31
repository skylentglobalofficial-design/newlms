import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchElixirResources, fetchElixirWallet, purchaseElixirResource, type ElixirResource, type ElixirWallet as Wallet } from "../../lib/elixir-api"

export default function ElixirWalletPanel() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [resources, setResources] = useState<ElixirResource[]>([])
  const [state, setState] = useState<"loading" | "ready" | "unavailable" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [buying, setBuying] = useState<string | null>(null)

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
      title: "Course Purchase Rewards",
      rule: "10 Elixir per ₹100",
      detail: "Enrolling in or purchasing any verified course awards 10 Elixir Coins per ₹100 of net value.",
    },
    {
      icon: "02",
      title: "100% Workshop Cashback",
      rule: "99 Coins on ₹99 Entry",
      detail: "100% 1:1 instant cashback credited on every ₹99 live interactive workshop registration.",
    },
    {
      icon: "03",
      title: "Lesson & Lab Milestones",
      rule: "+5 to +25 Elixir",
      detail: "Earn +5 on lesson completion, +15 on assignment submission, and +25 on capstone completion.",
    },
    {
      icon: "04",
      title: "Academic Excellence",
      rule: "+10 Elixir per Quiz",
      detail: "Scoring 80% or higher on any module checkpoint quiz awards an instant +10 Elixir bonus.",
    },
  ]

  return (
    <section aria-label="Elixir Wallet & Rewards" style={{ display: "grid", gap: 20 }}>
      {/* Wallet Hero Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "linear-gradient(135deg, rgba(81, 66, 181, 0.08) 0%, rgba(30, 27, 75, 0.04) 100%)",
          border: "1px solid rgba(81, 66, 181, 0.2)",
          borderRadius: 12,
          padding: "20px 24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "#f1f5f9", color: "#0f172a" }}>ELX</span>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142B5" }}>
                Verified Elixir Balance
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
                {wallet.balance} Elixir Coins
              </h2>
            </div>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569" }}>
            Universal learning credit earned through course purchases, workshop cashbacks, and verified lesson milestones.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/events" className="sk-btn sk-btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
            Explore ₹99 Workshops (100% Coin Back)
          </Link>
          <a href="#case-study-store" className="sk-btn sk-btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
            Redeem Coins Below ↓
          </a>
        </div>
      </div>

      {message ? (
        <div role="status" style={{ padding: "10px 14px", borderRadius: 8, background: "#dcfce7", color: "#166534", fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      ) : null}

      {/* 4-Way Earning Breakdown */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
          How to earn Elixir Coins (Verified Merit Schedule)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {earningPillars.map((p) => (
            <div
              key={p.title}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "14px 16px",
                display: "grid",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#ede9fe", color: "#5142B5", padding: "2px 8px", borderRadius: 999 }}>
                  {p.rule}
                </span>
              </div>
              <strong style={{ fontSize: 13, color: "#0f172a", marginTop: 4 }}>{p.title}</strong>
              <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{p.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study Store Showcase */}
      <div id="case-study-store" style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Elixir Case Study &amp; Playbook Store
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
              Unlock executive Harvard &amp; IIM-style business teardowns and SQL playbooks with your coins.
            </p>
          </div>
          <span style={{ fontSize: 12, color: "#5142B5", fontWeight: 600 }}>
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
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 16px",
                  background: resource.owned ? "rgba(22, 101, 52, 0.03)" : "#ffffff",
                  border: resource.owned ? "1px solid rgba(22, 101, 52, 0.2)" : "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>{resource.title}</strong>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: resource.kind === "case_study" ? "#ede9fe" : "#f1f5f9",
                        color: resource.kind === "case_study" ? "#5142B5" : "#475569",
                      }}
                    >
                      {resource.kind === "case_study" ? "Case Study" : "Playbook"}
                    </span>
                  </div>
                  {resource.summary ? (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4, maxWidth: 640 }}>
                      {resource.summary}
                    </p>
                  ) : null}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5142B5", marginTop: 6 }}>
                    Price: {resource.elixirPrice} Elixir
                  </span>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {resource.owned ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#166534" }}>
                      <span>Unlocked</span>
                      {resource.courseSlug && resource.lessonKey ? (
                        <Link className="sk-btn sk-btn-secondary" to={`/learn/${resource.courseSlug}/${resource.lessonKey}`} style={{ padding: "6px 12px", fontSize: 12, marginLeft: 6 }}>
                          Launch Case →
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

      {/* Verified Transaction Ledger */}
      {wallet.transactions && wallet.transactions.length > 0 ? (
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
          <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginBottom: 8 }}>
            Recent Verified Ledger Activity
          </strong>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6, maxHeight: 160, overflowY: "auto" }}>
            {wallet.transactions.slice(0, 5).map((tx) => (
              <li
                key={tx.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: tx.amount >= 0 ? "#15803d" : "#334155", marginRight: 8 }}>
                    {tx.amount >= 0 ? `+${tx.amount} Elixir` : `${tx.amount} Elixir`}
                  </span>
                  <span style={{ color: "#475569" }}>
                    {tx.note || tx.activity || (tx.amount >= 0 ? "Reward credited" : "Redemption")}
                  </span>
                </div>
                <span style={{ color: "#94a3b8" }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
