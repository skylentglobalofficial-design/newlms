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
  const tierParam = (params.get("tier") || "professional") as SkylentTierId
  const paymentStatus = params.get("payment")

  const [priceOverrides, setPriceOverrides] = useState<Record<string, LocalPriceOverride>>({})
  const [publicCoupons, setPublicCoupons] = useState<PublicCouponChip[]>([])

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
        basePrice: override?.basePrice ?? baseCourse?.price ?? 5499,
        linkedSlugs: prog?.linkedCourseSlugs ?? [],
      }
    }
    const c = courses.find((row) => row.slug === slug)
    return {
      title: c?.title || "Skylent Certification Course",
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
    () => tiers.find((t) => t.id === tierParam) ?? tiers[1] ?? tiers[0],
    [tiers, tierParam],
  )

  const planBadgeLabel =
    kind === "workshop"
      ? "Live Workshop · 100% Coin Cashback"
      : selectedTier.id === "certificate"
        ? "Basic Plan · Self-Paced Certificate"
        : selectedTier.id === "professional"
          ? "Premium Plan · Professional + Career OS"
          : "Pro Plan · Flagship Live + Career OS Pro"

  const [couponInput, setCouponInput] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
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
          text: payload?.error || "Invalid or expired discount code.",
          ok: false,
        })
        return
      }
      const d = payload.data
      setAppliedCoupon({
        code: d.code,
        discountAmount: d.discountAmount,
      })
      setCouponMessage({
        text: `✓ Discount code ${d.code} applied! You saved ₹${Number(d.discountAmount).toLocaleString("en-IN")}.`,
        ok: true,
      })
    } catch {
      setCouponMessage({ text: "Could not verify discount code right now.", ok: false })
    } finally {
      setValidatingCoupon(false)
    }
  }

  async function handleProceedToCheckout() {
    if (submitting) return
    setError(null)
    const finalEmail = (user?.email || guestEmail).trim()
    const finalName = (user?.name || guestName || "Learner").trim()
    const finalPhone = (guestPhone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210"

    if (!finalEmail || !finalEmail.includes("@")) {
      setError("Please enter your email address to proceed to payment.")
      return
    }

    saveStoredCourseTier(slug, selectedTier.id)
    for (const linked of catalogItem.linkedSlugs) {
      saveStoredCourseTier(linked, selectedTier.id)
    }

    const returnPath = `/checkout?kind=${encodeURIComponent(kind)}&slug=${encodeURIComponent(slug)}&tier=${encodeURIComponent(selectedTier.id)}`

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
          returnPath,
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

  const backHref =
    kind === "workshop"
      ? `/events/${slug}`
      : user
        ? `/dashboard/student?tab=explore`
        : kind === "program"
          ? `/programmes/${slug}`
          : `/courses/${slug}`

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
      {/* Clean Skylent Top Bar */}
      <header
        style={{
          background: "#1e1b4b",
          color: "#ffffff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link
          to={user ? "/dashboard/student" : "/"}
          style={{
            fontFamily: "var(--skylent-font-heading, var(--font-display))",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          SKYLENT
        </Link>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#6ee7b7",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
          </svg>
          <span>100% Safe &amp; Secure</span>
        </div>
      </header>

      {/* Main Centered Single-Card Order Details */}
      <main
        style={{
          flex: 1,
          maxWidth: 520,
          width: "100%",
          margin: "0 auto",
          padding: "20px 16px 48px",
          boxSizing: "border-box",
        }}
      >
        <Link
          to={backHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#334155",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: 14,
          }}
        >
          ← Back
        </Link>

        {paymentStatus === "cancelled" || paymentStatus === "failed" ? (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Payment was not completed. Your selected course &amp; plan are saved below — click Proceed to Checkout whenever you are ready.
          </div>
        ) : null}

        <section
          aria-labelledby="checkout-order-title"
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            borderTop: "4px solid #5142b5",
            boxShadow: "0 18px 42px -16px rgba(15, 23, 42, 0.12)",
            padding: "24px 22px",
            boxSizing: "border-box",
            display: "grid",
            gap: 18,
          }}
        >
          <h1
            id="checkout-order-title"
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: 21,
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "var(--font-display)",
            }}
          >
            Order Details
          </h1>

          {/* Selected Course + Selected Plan Summary Row (No duplicate 3-tier list!) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingBottom: 16,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <img
              src={resolveThumbnail(slug)}
              alt={catalogItem.title}
              style={{
                width: 96,
                height: 64,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong
                style={{
                  display: "block",
                  fontSize: 15.5,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.3,
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
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "#f5f3ff",
                  color: "#5142b5",
                  marginBottom: 4,
                }}
              >
                {planBadgeLabel}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <strong style={{ fontSize: 16, color: "#0f172a" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </strong>
                {kind !== "workshop" ? (
                  <span style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through" }}>
                    ₹{selectedTier.mrp.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Discount Code Input */}
          <div>
            <label
              htmlFor="checkout-coupon-input"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Discount Code
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="checkout-coupon-input"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter Code Here"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  color: "#0f172a",
                  background: "#ffffff",
                  fontWeight: 700,
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
                {validatingCoupon ? "…" : "Apply"}
              </button>
            </div>

            {publicCoupons.length > 0 ? (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
                  margin: "6px 0 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: couponMessage.ok ? "#15803d" : "#dc2626",
                }}
              >
                {couponMessage.text}
              </p>
            ) : null}
          </div>

          {/* Guest Contact Inputs if not signed in */}
          {!user ? (
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: "12px 14px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <strong style={{ fontSize: 12.5, color: "#0f172a" }}>Your Details</strong>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full Name"
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                }}
              />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email Address *"
                required
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                }}
              />
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="10-Digit Mobile Number"
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                }}
              />
            </div>
          ) : null}

          {/* Subtotal / Discount / Total Breakdown */}
          <div
            style={{
              borderTop: "1px solid #f1f5f9",
              paddingTop: 14,
              display: "grid",
              gap: 8,
              fontSize: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>Subtotal</span>
              <strong style={{ color: "#0f172a" }}>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
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
                <strong style={{ fontSize: 16, color: "#0f172a", display: "block" }}>Total</strong>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>Inclusive of taxes</span>
              </div>
              <strong style={{ fontSize: 24, fontWeight: 800, color: "#5142b5" }}>
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

          <button
            type="button"
            onClick={() => void handleProceedToCheckout()}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: "none",
              background: "#5142b5",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 800,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? "Opening PayU Payment Gateway…" : "Proceed to Checkout"}
          </button>

          {/* EdTech Trust, Certificate Preview & Cohort Guarantee Strip */}
          <div
            style={{
              marginTop: 4,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "grid",
              gap: 8,
              fontSize: 12.5,
              color: "#334155",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <strong style={{ color: "#0f172a", fontSize: 13 }}>What You Unlock Immediately After Checkout</strong>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#047857", background: "#ecfdf5", padding: "2px 8px", borderRadius: 999 }}>
                ✓ Instant Activation · 7-Day Refund Protection
              </span>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <span>🎓 <strong>Verifiable Credential:</strong> Issued by Skylent Assessment Board (Public ID at <code>skylent.live/verify</code>)</span>
              <span>⚡ <strong>Full 15-Lesson Workspace:</strong> In-browser SQL/Python/PRD/AI sandboxes + downloadable Revision Cheat-Sheets</span>
              <span>👨‍🏫 <strong>20-Min Doubt SLA:</strong> 24/7 English + Hinglish AI Mentor &amp; human Faculty TA capstone review</span>
              <span>🚀 <strong>Career OS Bonus:</strong> Complete 60% + quizzes + project to unlock Career OS &amp; +3 Months Extra Practice</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
