import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { courses, programs } from "../data"
import {
  buildSkylentTiersForPrice,
  saveAdminPriceOverridesLocal,
  saveStoredCourseTier,
  type LocalPriceOverride,
  type SkylentTierId,
} from "../lib/enrolment-tiers"
import analyticsVisual from "@/assets/site/home/program-analytics-800.webp"
import productVisual from "@/assets/site/home/program-product-800.webp"
import scienceVisual from "@/assets/site/degree-computing.jpg"
import webVisual from "@/assets/site/home/program-web-800.webp"
import aiVisual from "@/assets/site/program-ai.jpg"
import sqlVisual from "@/assets/site/program-library.jpg"

function resolveThumbnail(slug: string): string {
  if (slug.includes("product")) return productVisual
  if (slug.includes("python") || slug.includes("sql")) return sqlVisual
  if (slug.includes("science")) return scienceVisual
  if (slug.includes("full-stack") || slug.includes("web")) return webVisual
  if (slug.includes("generative") || slug.includes("ai")) return aiVisual
  return analyticsVisual
}

type PublicCouponChip = {
  code: string
  discountType: "FLAT" | "PERCENT"
  discountValue: number
  counselorName: string
  applicableSlug: string
}

type GatewaySettings = {
  payuEnabled: boolean
  upiEnabled: boolean
  cardsEnabled: boolean
  netbankingEnabled: boolean
  emiEnabled: boolean
  mode: string
}

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const kind = (
    params.get("kind") === "program"
      ? "program"
      : params.get("kind") === "workshop"
        ? "workshop"
        : "course"
  ) as "course" | "program" | "workshop"
  const slug = params.get("slug") || "data-analytics"
  const initialTierParam = (params.get("tier") || "professional") as SkylentTierId
  const [activeTierId, setActiveTierId] = useState<SkylentTierId>(initialTierParam)

  const [priceOverrides, setPriceOverrides] = useState<Record<string, LocalPriceOverride>>({})
  const [publicCoupons, setPublicCoupons] = useState<PublicCouponChip[]>([])
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>({
    payuEnabled: true,
    upiEnabled: true,
    cardsEnabled: true,
    netbankingEnabled: true,
    emiEnabled: true,
    mode: "production",
  })

  useEffect(() => {
    let cancelled = false
    fetch("/api/v1/payments/catalog-config", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.data) return
        if (payload.data.priceOverrides) {
          setPriceOverrides(payload.data.priceOverrides)
          saveAdminPriceOverridesLocal(payload.data.priceOverrides)
        }
        if (Array.isArray(payload.data.publicCoupons)) {
          setPublicCoupons(payload.data.publicCoupons)
        }
        if (payload.data.gatewaySettings) {
          setGatewaySettings((prev) => ({ ...prev, ...payload.data.gatewaySettings }))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const catalogItem = useMemo(() => {
    const override = priceOverrides[slug]
    if (kind === "program") {
      const prog = programs.find((p) => p.slug === slug)
      const baseCourse = courses.find((c) => prog?.linkedCourseSlugs?.includes(c.slug))
      return {
        title: prog?.name || "Skylent Career Programme",
        subtitle: prog?.tagline || "Structured modules, browser lab & graded capstone studio inside Skylent OS",
        basePrice: override?.basePrice ?? baseCourse?.price ?? 5499,
        linkedSlugs: prog?.linkedCourseSlugs ?? [],
      }
    }
    const c = courses.find((row) => row.slug === slug)
    return {
      title: c?.title || "Skylent Certification Course",
      subtitle: c?.desc || "15 authored lessons, in-browser practice workbench & verifiable SKL certificate",
      basePrice: override?.basePrice ?? c?.price ?? 3499,
      linkedSlugs: [slug],
    }
  }, [kind, slug, priceOverrides])

  const tiers = useMemo(() => {
    const base = buildSkylentTiersForPrice(catalogItem.basePrice, slug)
    const override = priceOverrides[slug]
    if (!override) return base
    return base.map((t) => {
      if (t.id === "certificate") return { ...t, price: override.certPrice, mrp: override.certPrice * 2 }
      if (t.id === "flagship") return { ...t, price: override.flagshipPrice, mrp: override.flagshipPrice * 2 }
      return { ...t, price: override.proPrice, mrp: override.mrp || override.proPrice * 2 }
    })
  }, [catalogItem.basePrice, slug, priceOverrides])

  const selectedTier = useMemo(
    () => tiers.find((t) => t.id === activeTierId) ?? tiers[1] ?? tiers[0],
    [tiers, activeTierId],
  )

  const [couponInput, setCouponInput] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    counselorName: string
  } | null>(null)
  const [couponMessage, setCouponMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [guestName, setGuestName] = useState(user?.name || "")
  const [guestEmail, setGuestEmail] = useState(user?.email || "")
  const [guestPhone, setGuestPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.name && !guestName) setGuestName(user.name)
    if (user?.email && !guestEmail) setGuestEmail(user.email)
  }, [user, guestName, guestEmail])

  const subtotal = kind === "workshop" ? 99 : selectedTier.price
  const discount = appliedCoupon ? Math.min(subtotal - 1, appliedCoupon.discountAmount) : 0
  const totalPayable = Math.max(1, subtotal - discount)

  async function applyCouponCode(rawCode: string) {
    const code = rawCode.trim().toUpperCase()
    setCouponInput(code)
    if (!code) {
      setAppliedCoupon(null)
      setCouponMessage(null)
      return
    }
    setValidatingCoupon(true)
    setCouponMessage(null)
    try {
      const res = await fetch("/api/v1/payments/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          slug,
          subtotal,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.data?.valid) {
        setAppliedCoupon(null)
        setCouponMessage({
          text: payload?.error || "Invalid or expired Admin / Counselor coupon code.",
          ok: false,
        })
        return
      }
      const d = payload.data
      setAppliedCoupon({
        code: d.code,
        discountAmount: d.discountAmount,
        counselorName: d.counselorName || "Skylent Counselor",
      })
      setCouponMessage({
        text: `✓ ${d.code} applied (Issued by ${d.counselorName || "Admin"}) — ₹${Number(d.discountAmount).toLocaleString("en-IN")} saved!`,
        ok: true,
      })
    } catch {
      setCouponMessage({ text: "Could not verify coupon right now. Please try again.", ok: false })
    } finally {
      setValidatingCoupon(false)
    }
  }

  // Re-validate coupon if learner switches plan tier
  useEffect(() => {
    if (appliedCoupon?.code) {
      void applyCouponCode(appliedCoupon.code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal])

  async function handleProceedToCheckout() {
    setError(null)
    const finalEmail = (user?.email || guestEmail).trim()
    const finalName = (user?.name || guestName || "Learner").trim()
    const finalPhone = (guestPhone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210"

    if (!finalEmail || !finalEmail.includes("@")) {
      setError("Please enter your email address so we can send your receipt and unlock your Skylent OS workspace.")
      return
    }

    saveStoredCourseTier(slug, selectedTier.id)
    for (const linked of catalogItem.linkedSlugs) {
      saveStoredCourseTier(linked, selectedTier.id)
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/payments/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetKind: kind,
          targetSlug: slug,
          tier: selectedTier.id,
          amount: totalPayable,
          couponCode: appliedCoupon?.code || undefined,
          firstname: finalName,
          email: finalEmail,
          phone: finalPhone,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload.error || "Unable to initiate checkout right now.")
      }

      const form = document.createElement("form")
      form.method = "POST"
      form.action = payload.actionUrl
      for (const [k, v] of Object.entries(payload.params)) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = k
        input.value = String(v ?? "")
        form.appendChild(input)
      }
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to payment gateway.")
      setSubmitting(false)
    }
  }

  const enabledMethodPills = [
    gatewaySettings.upiEnabled ? "UPI / QR (GPay · PhonePe · Paytm)" : null,
    gatewaySettings.cardsEnabled ? "Debit & Credit Cards" : null,
    gatewaySettings.netbankingEnabled ? "NetBanking (All Indian Banks)" : null,
    gatewaySettings.emiEnabled ? "No-Cost & Standard EMI" : null,
  ].filter(Boolean) as string[]

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f3fa",
        color: "#0f172a",
        fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Skylent OS Branded Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #110e2e 0%, #261c6a 55%, #3b2d96 100%)",
          color: "#ffffff",
          borderBottom: "1px solid rgba(196, 184, 255, 0.22)",
          padding: "max(env(safe-area-inset-top, 0px), 16px) clamp(20px, 5vw, 56px) 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            to="/"
            style={{
              fontFamily: "var(--skylent-font-heading, var(--font-display))",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            SKYLENT
          </Link>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              color: "#e9d5ff",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            SKYLENT OS · ENROLMENT PORTAL
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(16, 185, 129, 0.16)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            padding: "6px 14px",
            borderRadius: 999,
            color: "#ecfdf5",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#34d399" aria-hidden="true">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
          </svg>
          <span>256-Bit Encrypted · Verified PayU India Gateway</span>
        </div>
      </header>

      {/* Main 2-Column Skylent OS Checkout Workspace */}
      <main
        style={{
          flex: 1,
          maxWidth: 1160,
          width: "100%",
          margin: "0 auto",
          padding: "24px clamp(16px, 4vw, 44px) 64px",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 999,
            padding: "7px 14px",
            color: "#334155",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          ← Back to Course
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: Skylent Track Summary & Live Plan Switcher */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              borderTop: "4px solid #5142b5",
              padding: "26px 26px",
              boxShadow: "0 16px 40px -18px rgba(15, 23, 42, 0.08)",
              display: "grid",
              gap: 20,
            }}
          >
            {/* Course Identity Banner */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <img
                src={resolveThumbnail(slug)}
                alt={catalogItem.title}
                style={{
                  width: 120,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    color: "#5142b5",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  SKYLENT AUTHORED TRACK · INSTANT OS ACTIVATION
                </span>
                <h1
                  style={{
                    margin: "4px 0 4px",
                    fontSize: "clamp(19px, 2.2vw, 24px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {catalogItem.title}
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.45 }}>
                  {catalogItem.subtitle}
                </p>
              </div>
            </div>

            {/* Interactive 3-Tier Plan Switcher (Switch directly on Checkout) */}
            {kind !== "workshop" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 13, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    1. Select Your Skylent Enrolment Tier
                  </strong>
                  <span style={{ fontSize: 11.5, color: "#047857", fontWeight: 700 }}>
                    ✓ Career OS included in Tier 2 &amp; Tier 3
                  </span>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {tiers.map((tier) => {
                    const active = tier.id === selectedTier.id
                    const label =
                      tier.id === "certificate"
                        ? "Tier 1 · Basic Certificate Track"
                        : tier.id === "professional"
                          ? "Tier 2 · Professional + Career OS"
                          : "Tier 3 · Flagship Live + Career OS Pro"
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setActiveTierId(tier.id)}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: active ? "2px solid #5142b5" : "1px solid #cbd5e1",
                          background: active ? "#f5f3ff" : "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <strong style={{ fontSize: 14.5, color: active ? "#3b0764" : "#0f172a" }}>
                              {label}
                            </strong>
                            {tier.id === "flagship" ? (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: "#5142b5",
                                  color: "#ffffff",
                                }}
                              >
                                Recommended
                              </span>
                            ) : null}
                          </div>
                          <span style={{ fontSize: 12, color: "#475569" }}>{tier.tagline}</span>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <strong style={{ fontSize: 18, color: active ? "#5142b5" : "#0f172a", display: "block" }}>
                            ₹{tier.price.toLocaleString("en-IN")}
                          </strong>
                          <span style={{ fontSize: 11.5, color: "#94a3b8", textDecoration: "line-through" }}>
                            ₹{tier.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* What Unlocks in Skylent OS */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Included in Your Skylent OS Enrolment
              </strong>
              <div style={{ display: "grid", gap: 8 }}>
                {selectedTier.features.map((feat) => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155" }}>
                    <span style={{ color: "#15803d", fontWeight: 800 }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enabled Payment Methods from Admin Gateway Settings */}
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Supported Payment Modes on Next Step (PayU Gateway)
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {enabledMethodPills.map((pill) => (
                  <span
                    key={pill}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "5px 10px",
                      borderRadius: 8,
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Counselor/Admin Coupon + Order Summary + Learner Details */}
          <section
            aria-labelledby="checkout-order-title"
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              borderTop: "4px solid #059669",
              boxShadow: "0 20px 50px -18px rgba(15, 23, 42, 0.12)",
              padding: "26px 26px",
              boxSizing: "border-box",
              display: "grid",
              gap: 18,
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                STEP 2 · VERIFIED ORDER &amp; SCHOLARSHIP SUMMARY
              </span>
              <h2
                id="checkout-order-title"
                style={{
                  margin: "4px 0 0",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "var(--font-display)",
                }}
              >
                Skylent Enrolment Summary
              </h2>
            </div>

            {/* Admin / Counselor Coupon Code Box */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <label
                htmlFor="checkout-coupon-input"
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                Have an Admin-Approved Coupon Code?
              </label>
              <span style={{ display: "block", fontSize: 11.5, color: "#64748b", marginBottom: 10 }}>
                Discounts are strictly authorized by Skylent Admin. If your Admissions Counselor discussed a fee concession, enter the approved code provided after Admin authorization.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="checkout-coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Admin-Approved Code (e.g. ADM-...)"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    color: "#0f172a",
                    background: "#ffffff",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                />
                <button
                  type="button"
                  disabled={validatingCoupon}
                  onClick={() => void applyCouponCode(couponInput)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#5142b5",
                    color: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: validatingCoupon ? "wait" : "pointer",
                  }}
                >
                  {validatingCoupon ? "Checking…" : "Apply"}
                </button>
              </div>

              {publicCoupons.length > 0 ? (
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Available Offers:</span>
                  {publicCoupons
                    .filter((c) => c.applicableSlug === "ALL" || c.applicableSlug === slug)
                    .map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => void applyCouponCode(c.code)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: appliedCoupon?.code === c.code ? "1.5px solid #059669" : "1px dashed #5142b5",
                          background: appliedCoupon?.code === c.code ? "#ecfdf5" : "#f5f3ff",
                          color: appliedCoupon?.code === c.code ? "#047857" : "#5142b5",
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {c.code} ({c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                      </button>
                    ))}
                </div>
              ) : null}

              {couponMessage ? (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: couponMessage.ok ? "#15803d" : "#dc2626",
                  }}
                >
                  {couponMessage.text}
                </p>
              ) : null}
            </div>

            {/* Guest / Learner Contact Inputs */}
            {!user ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 12.5, color: "#0f172a" }}>Learner Details for Course Activation</strong>
                  <Link to="/login" style={{ fontSize: 12, fontWeight: 700, color: "#5142b5" }}>
                    Already have an account? Sign in →
                  </Link>
                </div>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full Name"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                  }}
                />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Email Address (Required for Skylent OS login)"
                  required
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                  }}
                />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="10-Digit Mobile / WhatsApp Number"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  fontSize: 12.5,
                  color: "#3b0764",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span>
                  Enrolling as <strong>{user.name}</strong> ({user.email})
                </span>
                <span style={{ fontWeight: 700, color: "#059669" }}>✓ Authenticated</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 14,
                display: "grid",
                gap: 10,
                fontSize: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Selected Tier ({selectedTier.name.replace(/^[0-9]+\.\s*/, "")})</span>
                <strong style={{ color: "#0f172a" }}>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Counselor / Admin Scholarship {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                <strong style={{ color: discount > 0 ? "#15803d" : "#64748b" }}>
                  - ₹{discount.toLocaleString("en-IN")}
                </strong>
              </div>

              <div
                style={{
                  borderTop: "1.5px dashed #cbd5e1",
                  paddingTop: 12,
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <strong style={{ fontSize: 16.5, color: "#0f172a", display: "block" }}>Total Payable</strong>
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>Inclusive of all taxes · Instant access</span>
                </div>
                <strong style={{ fontSize: 26, fontWeight: 800, color: "#5142b5" }}>
                  ₹{totalPayable.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            ) : null}

            {/* Proceed to PayU Checkout Button */}
            <button
              type="button"
              onClick={() => void handleProceedToCheckout()}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
                color: "#ffffff",
                fontSize: 15.5,
                fontWeight: 800,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.75 : 1,
                boxShadow: "0 12px 28px -8px rgba(81, 66, 181, 0.55)",
              }}
            >
              {submitting
                ? "Connecting to PayU Secure Gateway…"
                : `Proceed to PayU Checkout (₹${totalPayable.toLocaleString("en-IN")}) →`}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
