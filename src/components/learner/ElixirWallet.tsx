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

  if (state === "loading") return <p style={{ color: "var(--skylent-color-slate, #5c6570)", fontSize: 13 }}>Loading Elixir…</p>
  if (state === "unavailable") return <p style={{ color: "var(--skylent-color-slate, #5c6570)", fontSize: 13 }}>Elixir is not available until the database update is applied.</p>
  if (state === "error" || !wallet) {
    return <button type="button" className="os-btn os-btn-ghost" onClick={() => void load()}>Elixir could not be loaded. Try again.</button>
  }

  return (
    <section aria-label="Elixir" style={{ display: "grid", gap: 12 }}>
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Elixir Coins &amp; Case Study Store</h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--skylent-color-slate, #5c6570)" }}>
          Balance: <strong>{wallet.balance} Elixir</strong>. Register for a ₹99 Workshop/Webinar on{" "}
          <Link to="/events">Events &amp; Webinars</Link> to earn <strong>99 Elixir Coins (100% Coin Back)</strong>, and redeem your coins below to unlock practical Case Studies and playbooks.
          {wallet.consistent ? "" : " The displayed balance does not match the ledger. Ask a super admin to reconcile it."}
        </p>
      </div>
      {message ? <p role="status" style={{ margin: 0, fontSize: 13 }}>{message}</p> : null}
      {resources.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
          {resources.map((resource) => (
            <li
              key={resource.slug}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                padding: "10px 12px",
                border: "1px solid var(--skylent-color-border, #e2e8f0)",
                borderRadius: 8,
              }}
            >
              <span>
                <strong>{resource.title}</strong>
                {resource.summary ? (
                  <span style={{ display: "block", fontSize: 12, color: "var(--skylent-color-slate, #5c6570)", marginTop: 2 }}>
                    {resource.summary}
                  </span>
                ) : null}
                <span style={{ display: "block", fontSize: 12, color: "var(--skylent-color-slate, #5c6570)", marginTop: 4 }}>
                  {resource.kind === "case_study" ? "Case study" : "Notes"} · <strong>{resource.elixirPrice} Elixir</strong>
                </span>
              </span>
              {resource.owned ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span>Unlocked</span>
                  {resource.courseSlug && resource.lessonKey ? (
                    <Link className="os-btn os-btn-ghost" to={`/learn/${resource.courseSlug}/${resource.lessonKey}`}>
                      Open case →
                    </Link>
                  ) : null}
                </span>
              ) : (
                <button
                  type="button"
                  className="os-btn os-btn-primary"
                  disabled={buying === resource.slug}
                  onClick={() => void buy(resource)}
                >
                  Unlock for {resource.elixirPrice} Elixir
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "var(--skylent-color-slate, #5c6570)" }}>No notes or case studies are priced in Elixir yet.</p>
      )}

      {wallet.rewardSchedule && wallet.rewardSchedule.length > 0 ? (
        <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--skylent-color-border, #e2e8f0)" }}>
          <strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>How to earn Elixir Coins (Verified Merit Schedule)</strong>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4, fontSize: 12, color: "var(--skylent-color-slate, #5c6570)" }}>
            {wallet.rewardSchedule.map((item) => (
              <li key={item.activity} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{item.label}</span>
                <strong>+{item.elixir} Elixir</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
