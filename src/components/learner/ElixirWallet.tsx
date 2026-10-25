import { useEffect, useState } from "react"
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
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Elixir</h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--skylent-color-slate, #5c6570)" }}>
          Balance {wallet.balance}. Elixir is learning credit inside Skylent. It cannot be withdrawn or sent to someone else.
          {wallet.consistent ? "" : " The displayed balance does not match the ledger. Ask a super admin to reconcile it."}
        </p>
      </div>
      {message ? <p role="status" style={{ margin: 0, fontSize: 13 }}>{message}</p> : null}
      {resources.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {resources.map((resource) => (
            <li key={resource.slug} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <span>
                <strong>{resource.title}</strong>
                <span style={{ display: "block", fontSize: 12, color: "var(--skylent-color-slate, #5c6570)" }}>
                  {resource.kind === "case_study" ? "Case study" : "Notes"} · {resource.elixirPrice} Elixir
                </span>
              </span>
              {resource.owned ? (
                <span style={{ fontSize: 12 }}>Unlocked</span>
              ) : (
                <button type="button" className="os-btn os-btn-primary" disabled={buying === resource.slug} onClick={() => void buy(resource)}>
                  Unlock for {resource.elixirPrice}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "var(--skylent-color-slate, #5c6570)" }}>No notes or case studies are priced in Elixir yet.</p>
      )}
    </section>
  )
}
