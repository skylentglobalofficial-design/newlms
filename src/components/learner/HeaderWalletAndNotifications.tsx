import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { fetchElixirWallet, type ElixirWallet } from "../../lib/elixir-api"
import { fetchMyCertificates, type SkylentCertificate } from "../../lib/skylent-api"
import { apiV1 } from "../../lib/api-base"
import { parseApiJson } from "../../lib/http"
import {
  buildNotificationItems,
  formatElixirReason,
  type LearnerDoubtRecord,
  type SkylentNotificationItem,
} from "../../lib/learner-notifications"

export {
  buildNotificationItems,
  formatElixirReason,
  type LearnerDoubtRecord,
  type SkylentNotificationItem,
}

async function fetchLearnerDoubts(signal?: AbortSignal): Promise<LearnerDoubtRecord[]> {
  const response = await fetch(`${apiV1()}/lms/doubts/mine`, {
    credentials: "include",
    signal,
  })
  const body = await parseApiJson<{ data: LearnerDoubtRecord[] }>(response)
  return body.data ?? []
}

function readSeenIds(userId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(`skylent:notifications:read:${userId}`)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === "string")) : new Set()
  } catch {
    return new Set()
  }
}

function writeSeenIds(userId: string, ids: Set<string>): void {
  try {
    window.localStorage.setItem(`skylent:notifications:read:${userId}`, JSON.stringify([...ids]))
  } catch {
    // ignore storage quota errors
  }
}

export function HeaderWalletAndNotifications({ variant = "public" }: { variant?: "public" | "dashboard" }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  const [wallet, setWallet] = useState<ElixirWallet | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletUnavailable, setWalletUnavailable] = useState(false)
  const [doubts, setDoubts] = useState<LearnerDoubtRecord[]>([])
  const [certificates, setCertificates] = useState<SkylentCertificate[]>([])

  const [openMenu, setOpenMenu] = useState<"wallet" | "notifications" | null>(null)
  const [seenIds, setSeenIds] = useState<Set<string>>(() => (user ? readSeenIds(user.id) : new Set()))

  useEffect(() => {
    if (!user) return
    setSeenIds(readSeenIds(user.id))
  }, [user])

  const refreshData = useCallback(async (signal?: AbortSignal) => {
    if (!user) return
    setWalletLoading(true)
    const [walletRes, doubtsRes, certsRes] = await Promise.allSettled([
      fetchElixirWallet(signal),
      fetchLearnerDoubts(signal),
      fetchMyCertificates(signal),
    ])
    if (signal?.aborted) return

    if (walletRes.status === "fulfilled") {
      setWallet(walletRes.value.data)
      setWalletUnavailable(false)
    } else {
      setWalletUnavailable(true)
    }

    if (doubtsRes.status === "fulfilled") {
      setDoubts(doubtsRes.value)
    }

    if (certsRes.status === "fulfilled") {
      setCertificates(certsRes.value)
    }
    setWalletLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    void refreshData(controller.signal)
    return () => controller.abort()
  }, [user, refreshData])

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null)
    }
    document.addEventListener("mousedown", handleOutside)
    window.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      window.removeEventListener("keydown", handleKey)
    }
  }, [])

  if (!user) return null

  const notifications = buildNotificationItems({
    transactions: wallet?.transactions ?? [],
    doubts,
    certificates,
  })

  const unreadCount = notifications.filter((item) => !seenIds.has(item.id)).length
  const balanceLabel = walletUnavailable
    ? "—"
    : wallet !== null
      ? String(wallet.balance)
      : walletLoading
        ? "…"
        : "0"

  function markAllRead() {
    if (!user) return
    const next = new Set(seenIds)
    for (const item of notifications) next.add(item.id)
    setSeenIds(next)
    writeSeenIds(user.id, next)
  }

  function handleNotificationClick(item: SkylentNotificationItem) {
    if (user) {
      const next = new Set(seenIds)
      next.add(item.id)
      setSeenIds(next)
      writeSeenIds(user.id, next)
    }
    setOpenMenu(null)
    navigate(item.href)
  }

  return (
    <div
      ref={rootRef}
      className={`skn-UtilityCluster skn-UtilityCluster--${variant}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, position: "relative" }}
    >
      {/* Elixir Wallet Chip */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          className="skn__elixir-chip"
          aria-expanded={openMenu === "wallet"}
          aria-haspopup="dialog"
          aria-label={`Elixir wallet balance: ${balanceLabel} Elixir`}
          onClick={() => {
            const next = openMenu === "wallet" ? null : "wallet"
            setOpenMenu(next)
            if (next === "wallet") void refreshData()
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid rgba(81, 66, 181, 0.28)",
            background: "rgba(81, 66, 181, 0.08)",
            color: variant === "dashboard" ? "#1e1b4b" : "inherit",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          
          <span>Elixir · {balanceLabel}</span>
        </button>

        {openMenu === "wallet" ? (
          <div
            className="skn-popover skn-popover--wallet"
            role="dialog"
            aria-label="Elixir Wallet & Verified Transactions"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 340,
              maxWidth: "92vw",
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
              padding: 16,
              zIndex: 1200,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5142B5" }}>
                  Verified Elixir Wallet
                </span>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
                  {wallet ? `${wallet.balance} Elixir` : walletUnavailable ? "Unavailable" : "Loading…"}
                </div>
              </div>
              {wallet?.consistent ? (
                <span style={{ fontSize: 11, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                  Ledger verified
                </span>
              ) : null}
            </div>

            {walletUnavailable ? (
              <p style={{ fontSize: 13, color: "#475569", margin: "8px 0 12px" }}>
                Elixir wallet is temporarily unavailable until the database update is applied.
              </p>
            ) : (
              <>
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, marginTop: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", margin: "0 0 8px" }}>
                    Recent verified transactions &amp; earning reasons
                  </p>
                  {wallet && wallet.transactions.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, maxHeight: 210, overflowY: "auto" }}>
                      {wallet.transactions.slice(0, 6).map((tx) => (
                        <li
                          key={tx.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                            <span style={{ color: tx.amount >= 0 ? "#15803d" : "#334155" }}>
                              {tx.amount >= 0 ? `+${tx.amount} Elixir` : `${tx.amount} Elixir`}
                            </span>
                            <span style={{ color: "#64748b", fontWeight: 400 }}>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ color: "#334155", marginTop: 3 }}>
                            {formatElixirReason(tx)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>
                      No Elixir transactions recorded yet. Complete lessons, score 80%+ on module checks, or register for a workshop to earn Elixir.
                    </p>
                  )}
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, marginTop: 10, display: "grid", gap: 6 }}>
                  <Link
                    to="/dashboard/student"
                    onClick={() => setOpenMenu(null)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#5142B5",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Open Case Study Store</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    to="/events"
                    onClick={() => setOpenMenu(null)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 12px",
                      borderRadius: 8,
                      background: "#f1f5f9",
                      color: "#1e293b",
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Explore Workshops (100% Elixir Cashback)</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Notification Bell */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          className="skn__notif-btn"
          aria-expanded={openMenu === "notifications"}
          aria-haspopup="dialog"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          onClick={() => {
            const next = openMenu === "notifications" ? null : "notifications"
            setOpenMenu(next)
            if (next === "notifications") void refreshData()
          }}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: 999,
                background: "#dc2626",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        {openMenu === "notifications" ? (
          <div
            role="dialog"
            aria-label="Notifications"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 350,
              maxWidth: "92vw",
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
              padding: 16,
              zIndex: 1200,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={{ fontSize: 14 }}>Notifications</strong>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5142B5",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            {notifications.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {notifications.slice(0, 10).map((item) => {
                  const isUnread = !seenIds.has(item.id)
                  const badgeIcon =
                    item.kind === "elixir"
                      ? "ELX"
                      : item.kind === "faculty_reply"
                        ? "TA"
                        : item.kind === "certificate"
                          ? "CERT"
                          : "⏱️"
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "9px 10px",
                          borderRadius: 8,
                          border: isUnread ? "1px solid rgba(81, 66, 181, 0.35)" : "1px solid #e2e8f0",
                          background: isUnread ? "rgba(81, 66, 181, 0.05)" : "#f8fafc",
                          cursor: "pointer",
                          display: "grid",
                          gap: 3,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                            {badgeIcon} {item.title}
                          </span>
                          {isUnread ? (
                            <span style={{ width: 7, height: 7, borderRadius: 999, background: "#5142B5", flexShrink: 0 }} />
                          ) : null}
                        </div>
                        <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.4 }}>{item.detail}</span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                No notifications yet. Real Elixir credits, faculty doubt replies, and certificate unlocks appear here automatically.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
