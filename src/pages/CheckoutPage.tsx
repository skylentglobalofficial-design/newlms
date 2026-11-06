import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { courses, programs } from "../data"
import {
  buildSkylentTiersForPrice,
  saveStoredCourseTier,
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

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const kind = (params.get("kind") === "program" ? "program" : params.get("kind") === "workshop" ? "workshop" : "course") as
    | "course"
    | "program"
    | "workshop"
  const slug = params.get("slug") || "data-analytics"
  const tierParam = (params.get("tier") || "flagship") as SkylentTierId

  const catalogItem = useMemo(() => {
    if (kind === "program") {
      const prog = programs.find((p) => p.slug === slug)
      const baseCourse = courses.find((c) => prog?.linkedCourseSlugs?.includes(c.slug))
      return {
        title: prog?.name || "Skylent Career Programme",
        basePrice: baseCourse?.price || 5499,
        linkedSlugs: prog?.linkedCourseSlugs ?? [],
      }
    }
    const c = courses.find((row) => row.slug === slug)
    return {
      title: c?.title || "Skylent Certification Course",
      basePrice: c?.price || 3499,
      linkedSlugs: [slug],
    }
  }, [kind, slug])

  const tiers = useMemo(() => buildSkylentTiersForPrice(catalogItem.basePrice), [catalogItem.basePrice])
  const selectedTier = useMemo(
    () => tiers.find((t) => t.id === tierParam) ?? tiers[2] ?? tiers[0],
    [tiers, tierParam],
  )

  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
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
  const discount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discount) : 0
  const totalPayable = Math.max(1, subtotal - discount)

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      setAppliedCoupon(null)
      setCouponMessage(null)
      return
    }
    if (code === "WELCOME10" || code === "SKYLENT10") {
      const disc = Math.round(subtotal * 0.1)
      setAppliedCoupon({ code, discount: disc })
      setCouponMessage({ text: `Coupon ${code} applied! You saved ₹${disc.toLocaleString("en-IN")}.`, ok: true })
      return
    }
    if (code === "SKYLENT20") {
      const disc = Math.round(subtotal * 0.2)
      setAppliedCoupon({ code, discount: disc })
      setCouponMessage({ text: `Coupon ${code} applied! You saved ₹${disc.toLocaleString("en-IN")}.`, ok: true })
      return
    }
    if (code === "PAYU1" || code === "TEST1") {
      const disc = Math.max(0, subtotal - 1)
      setAppliedCoupon({ code, discount: disc })
      setCouponMessage({ text: `Verification coupon ${code} applied (Payable: ₹1.00).`, ok: true })
      return
    }
    setAppliedCoupon(null)
    setCouponMessage({ text: "Invalid or expired coupon code.", ok: false })
  }

  async function handleProceedToCheckout() {
    setError(null)
    const finalEmail = (user?.email || guestEmail).trim()
    const finalName = (user?.name || guestName || "Learner").trim()
    const finalPhone = (guestPhone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210"

    if (!finalEmail || !finalEmail.includes("@")) {
      setError("Please enter your email address so we can send your payment receipt and activate your course.")
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

  const planShortLabel =
    selectedTier.id === "certificate"
      ? "Basic · Certificate Plan"
      : selectedTier.id === "professional"
        ? "Premium · Professional Plan"
        : "Pro · Job-Ready Plan"

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Secure Checkout Header */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "max(env(safe-area-inset-top, 0px), 14px) clamp(20px, 5vw, 64px) 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--skylent-font-heading, var(--font-display))",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#0f172a",
            textDecoration: "none",
          }}
        >
          SKYLENT
        </Link>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#15803d",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
          </svg>
          <span>100% Safe &amp; Secure</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: 1120,
          width: "100%",
          margin: "0 auto",
          padding: "24px clamp(16px, 4vw, 48px) 64px",
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
            background: "none",
            border: "none",
            padding: "6px 0",
            color: "#334155",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <section
            aria-labelledby="checkout-order-title"
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 50px -18px rgba(15, 23, 42, 0.1)",
              padding: "28px 26px",
              boxSizing: "border-box",
            }}
          >
            <h1
              id="checkout-order-title"
              style={{
                margin: "0 0 20px",
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "var(--font-display)",
              }}
            >
              Order Details
            </h1>

            {/* Course Thumbnail + Title Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                paddingBottom: 18,
                borderBottom: "1px solid #f1f5f9",
                marginBottom: 18,
              }}
            >
              <img
                src={resolveThumbnail(slug)}
                alt={catalogItem.title}
                style={{
                  width: 112,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <strong
                  style={{
                    display: "block",
                    fontSize: 15.5,
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.35,
                    marginBottom: 4,
                  }}
                >
                  {catalogItem.title}
                </strong>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: "#f5f3ff",
                    color: "#5142b5",
                  }}
                >
                  {kind === "workshop" ? "Live Workshop" : planShortLabel}
                </span>
              </div>
            </div>

            {/* Guest Learner Details (Only shown if not signed in) */}
            {!user ? (
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <div>
                  <label
                    htmlFor="chk-name"
                    style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}
                  >
                    Full Name
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 13.5,
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label
                      htmlFor="chk-email"
                      style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}
                    >
                      Email Address
                    </label>
                    <input
                      id="chk-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="chk-phone"
                      style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}
                    >
                      Mobile Number
                    </label>
                    <input
                      id="chk-phone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Discount Coupon Box */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="chk-coupon"
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#64748b",
                  marginBottom: 6,
                }}
              >
                Have a discount coupon
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="chk-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter Code Here"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: 13.5,
                    color: "#0f172a",
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: couponInput.trim() ? "#5142b5" : "#e2e8f0",
                    color: couponInput.trim() ? "#ffffff" : "#475569",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </div>
              {couponMessage ? (
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: couponMessage.ok ? "#15803d" : "#dc2626",
                  }}
                >
                  {couponMessage.text}
                </span>
              ) : null}
            </div>

            {/* Subtotal, Discount, Total Breakdown */}
            <div
              style={{
                display: "grid",
                gap: 10,
                fontSize: 14,
                color: "#475569",
                paddingTop: 14,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Subtotal</span>
                <strong style={{ color: "#0f172a", fontWeight: 600 }}>
                  ₹ {subtotal.toFixed(2)}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Discount</span>
                <span style={{ color: discount > 0 ? "#15803d" : "#64748b", fontWeight: 600 }}>
                  - ₹ {discount.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  marginTop: 4,
                  borderTop: "1px solid #e2e8f0",
                  fontSize: 16,
                  color: "#0f172a",
                }}
              >
                <strong style={{ fontWeight: 700 }}>Total</strong>
                <strong style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  ₹ {totalPayable.toFixed(2)}
                </strong>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                style={{
                  margin: "14px 0 0",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: 12.5,
                }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleProceedToCheckout()}
              style={{
                marginTop: 22,
                width: "100%",
                minHeight: 48,
                padding: "13px 20px",
                borderRadius: 10,
                border: "none",
                background: "#5142b5",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                cursor: submitting ? "wait" : "pointer",
                boxShadow: "0 10px 24px -8px rgba(81, 66, 181, 0.45)",
              }}
            >
              {submitting ? "Opening PayU Secure Checkout…" : "Proceed to Checkout"}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
