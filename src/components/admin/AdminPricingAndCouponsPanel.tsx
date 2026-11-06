import { useEffect, useState, type FormEvent } from "react"
import { courses as staticCourses } from "../../data"
import { ensureCsrfToken } from "../../lib/auth-api"
import {
  readAdminPriceOverrides,
  saveAdminPriceOverridesLocal,
  type LocalPriceOverride,
} from "../../lib/enrolment-tiers"

type AdminCoupon = {
  code: string
  discountType: "FLAT" | "PERCENT"
  discountValue: number
  counselorName: string
  approvedBy?: string
  applicableSlug: string
  showOnCheckout: boolean
  active: boolean
  createdAt: string
}

type CounselorCouponRequest = {
  id: string
  counselorName: string
  counselorEmail: string
  studentEmail: string
  targetSlug: string
  requestedDiscountType: "FLAT" | "PERCENT"
  requestedDiscountValue: number
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approvedCode?: string
  createdAt: string
  reviewedAt?: string
}

type GatewayConfig = {
  payuEnabled: boolean
  upiEnabled: boolean
  cardsEnabled: boolean
  netbankingEnabled: boolean
  emiEnabled: boolean
  mode: "production" | "test"
  merchantKey: string
  mid: string
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderTop: "4px solid #5142b5",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 10px 28px -12px rgba(15, 23, 42, 0.08)",
} as const

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13.5,
  fontFamily: "var(--font-body)",
} as const

export default function AdminPricingAndCouponsPanel() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [requests, setRequests] = useState<CounselorCouponRequest[]>([])
  const [overrides, setOverrides] = useState<Record<string, LocalPriceOverride>>(() =>
    readAdminPriceOverrides(),
  )
  const [gateway, setGateway] = useState<GatewayConfig>({
    payuEnabled: true,
    upiEnabled: true,
    cardsEnabled: true,
    netbankingEnabled: true,
    emiEnabled: true,
    mode: "production",
    merchantKey: "jUkwLy",
    mid: "13843036",
  })
  const [merchantSaltInput, setMerchantSaltInput] = useState("")
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Editable course price rows state
  const [priceDrafts, setPriceDrafts] = useState<
    Record<string, { certPrice: string; proPrice: string; flagshipPrice: string; mrp: string }>
  >({})

  // Direct Admin Master Coupon Creation
  const [adminCouponCode, setAdminCouponCode] = useState("")
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT")
  const [discountValue, setDiscountValue] = useState("1000")
  const [counselorAttribution, setCounselorAttribution] = useState("Admissions Team")
  const [applicableSlug, setApplicableSlug] = useState("ALL")
  const [showOnCheckout, setShowOnCheckout] = useState(false)

  // Counselor Request Submission form state (Counselor requesting Admin approval)
  const [reqCounselorName, setReqCounselorName] = useState("Counselor Rohit")
  const [reqStudentEmail, setReqStudentEmail] = useState("")
  const [reqTargetCourse, setReqTargetCourse] = useState("data-analytics")
  const [reqDiscountType, setReqDiscountType] = useState<"FLAT" | "PERCENT">("FLAT")
  const [reqDiscountValue, setReqDiscountValue] = useState("1500")
  const [reqReason, setReqReason] = useState("Learner ready to enroll today if ₹1,500 concession is authorized.")
  const [showCounselorRequestForm, setShowCounselorRequestForm] = useState(false)
  const [appUpdateVersion, setAppUpdateVersion] = useState("1.5.0")
  const [appUpdateNotes, setAppUpdateNotes] = useState("Zero-delay dashboard, PayU in-app checkout, Career OS strict lock & static mobile text sizing.")
  const [appForceUpdate, setAppForceUpdate] = useState(false)

  async function handlePushAppUpdate(e: FormEvent) {
    e.preventDefault()
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch("/api/v1/payments/admin/app-update", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
        },
        body: JSON.stringify({
          appVersion: appUpdateVersion.trim() || "1.5.0",
          releaseNotes: appUpdateNotes.trim(),
          forceUpdate: appForceUpdate,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to push app update")
      setStatusMsg(`✓ Pushed In-App Update v${payload.data?.appVersion || appUpdateVersion} to all Mobile APK & Web users!`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not broadcast app update")
    }
  }

  async function loadConfig() {
    try {
      const res = await fetch("/api/v1/payments/admin/coupons", { credentials: "include" })
      if (!res.ok) return
      const payload = await res.json().catch(() => ({}))
      if (payload?.data) {
        if (Array.isArray(payload.data.coupons)) setCoupons(payload.data.coupons)
        if (Array.isArray(payload.data.couponRequests)) setRequests(payload.data.couponRequests)
        if (payload.data.priceOverrides) {
          setOverrides(payload.data.priceOverrides)
          saveAdminPriceOverridesLocal(payload.data.priceOverrides)
        }
        if (payload.data.gatewaySettings) {
          setGateway((prev) => ({ ...prev, ...payload.data.gatewaySettings }))
        }
      }
    } catch {
      // non-fatal
    }
  }

  useEffect(() => {
    void loadConfig()
  }, [])

  function getRowPrices(slug: string, defaultBase: number) {
    const draft = priceDrafts[slug]
    if (draft) return draft
    const ov = overrides[slug]
    const pro = ov?.proPrice ?? defaultBase
    const cert = ov?.certPrice ?? Math.max(999, Math.round((pro * 0.43) / 100) * 100 - 1)
    const flag = ov?.flagshipPrice ?? pro + 3000
    const mrp = ov?.mrp ?? pro * 2
    return {
      certPrice: String(cert),
      proPrice: String(pro),
      flagshipPrice: String(flag),
      mrp: String(mrp),
    }
  }

  function updateDraft(
    slug: string,
    defaultBase: number,
    field: "certPrice" | "proPrice" | "flagshipPrice" | "mrp",
    value: string,
  ) {
    const current = getRowPrices(slug, defaultBase)
    const next = { ...current, [field]: value }
    if (field === "proPrice") {
      const num = Number(value) || 0
      if (num > 0) {
        next.certPrice = String(Math.max(499, Math.round((num * 0.45) / 100) * 100 - 1))
        next.flagshipPrice = String(num + 2500)
        next.mrp = String(num * 2)
      }
    }
    setPriceDrafts((prev) => ({ ...prev, [slug]: next }))
  }

  async function saveCoursePrice(slug: string, title: string, defaultBase: number) {
    setStatusMsg(null)
    setErrorMsg(null)
    const row = getRowPrices(slug, defaultBase)
    const proPrice = Math.max(1, Number(row.proPrice) || defaultBase)
    const certPrice = Math.max(1, Number(row.certPrice) || Math.round(proPrice * 0.45))
    const flagshipPrice = Math.max(1, Number(row.flagshipPrice) || proPrice + 2500)
    const mrp = Math.max(proPrice, Number(row.mrp) || proPrice * 2)

    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch("/api/v1/payments/admin/price-override", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
        },
        body: JSON.stringify({
          slug,
          basePrice: proPrice,
          certPrice,
          proPrice,
          flagshipPrice,
          mrp,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to update course price")
      const nextOverrides = payload.priceOverrides || {
        ...overrides,
        [slug]: { slug, basePrice: proPrice, certPrice, proPrice, flagshipPrice, mrp },
      }
      setOverrides(nextOverrides)
      saveAdminPriceOverridesLocal(nextOverrides)
      setStatusMsg(
        `✓ Updated live pricing for "${title}" — Basic: ₹${certPrice.toLocaleString("en-IN")} | Professional: ₹${proPrice.toLocaleString("en-IN")} | Pro Flagship: ₹${flagshipPrice.toLocaleString("en-IN")}`,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save course price")
    }
  }

  // Admin approves counselor request with 1-click
  async function handleApproveCounselorRequest(id: string) {
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch(`/api/v1/payments/admin/coupon-requests/${encodeURIComponent(id)}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": csrf },
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to approve coupon request")
      if (Array.isArray(payload.data?.couponRequests)) setRequests(payload.data.couponRequests)
      if (Array.isArray(payload.data?.coupons)) setCoupons(payload.data.coupons)
      setStatusMsg(
        `✓ Approved! Generated active coupon code "${payload.data?.coupon?.code}" for ${payload.data?.coupon?.counselorName}. Student can now apply it on /checkout.`,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not approve request")
    }
  }

  // Admin rejects counselor request
  async function handleRejectCounselorRequest(id: string) {
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch(`/api/v1/payments/admin/coupon-requests/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": csrf },
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to reject coupon request")
      if (Array.isArray(payload.data?.couponRequests)) setRequests(payload.data.couponRequests)
      setStatusMsg("Marked counselor request as Rejected.")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not reject request")
    }
  }

  // Counselor submits a request to Admin
  async function handleSubmitCounselorRequest(e: FormEvent) {
    e.preventDefault()
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/v1/payments/counselor/request-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          counselorName: reqCounselorName,
          studentEmail: reqStudentEmail,
          targetSlug: reqTargetCourse,
          requestedDiscountType: reqDiscountType,
          requestedDiscountValue: Number(reqDiscountValue) || 1000,
          reason: reqReason,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to submit request")
      setStatusMsg(`✓ Request submitted to Admin! Admin will review and authorize the code.`)
      setReqStudentEmail("")
      setShowCounselorRequestForm(false)
      await loadConfig()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not submit counselor request")
    }
  }

  // Direct Admin Master Coupon Generation
  async function handleCreateAdminCoupon(e: FormEvent) {
    e.preventDefault()
    setStatusMsg(null)
    setErrorMsg(null)
    const clean = adminCouponCode.trim().toUpperCase()
    if (!clean) {
      setErrorMsg("Please enter a coupon code.")
      return
    }
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch("/api/v1/payments/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
        },
        body: JSON.stringify({
          code: clean,
          discountType,
          discountValue: Number(discountValue) || 500,
          counselorName: counselorAttribution.trim() || "Admin Master",
          applicableSlug,
          showOnCheckout,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to create coupon")
      if (Array.isArray(payload.coupons)) setCoupons(payload.coupons)
      setAdminCouponCode("")
      setStatusMsg(`✓ Admin-authorized coupon "${clean}" is now live and valid on Checkout!`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create coupon")
    }
  }

  async function handleDeleteCoupon(code: string) {
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch(`/api/v1/payments/admin/coupons/${encodeURIComponent(code)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRF-Token": csrf },
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to delete coupon")
      if (Array.isArray(payload.data?.coupons)) setCoupons(payload.data.coupons)
      else setCoupons((prev) => prev.filter((c) => c.code !== code))
      setStatusMsg(`Deleted coupon ${code}.`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not delete coupon")
    }
  }

  async function handleSaveGateway(e: FormEvent) {
    e.preventDefault()
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const csrf = await ensureCsrfToken()
      const res = await fetch("/api/v1/payments/admin/gateway-settings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
        },
        body: JSON.stringify({
          ...gateway,
          ...(merchantSaltInput.trim() ? { merchantSalt: merchantSaltInput.trim() } : {}),
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || "Failed to save payment gateway settings")
      if (payload.data) setGateway((prev) => ({ ...prev, ...payload.data }))
      setMerchantSaltInput("")
      setStatusMsg("✓ Saved Payment Gateway & Active Payment Methods!")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save gateway settings")
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING")

  return (
    <div style={{ display: "grid", gap: 22 }}>
      {statusMsg ? (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          {statusMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      {/* SECTION 1: LIVE COURSE FEE & 3-TIER PRICING CONTROLLER */}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
              LIVE COURSE FEE &amp; TIER PRICING ENGINE
            </span>
            <h2 style={{ margin: "4px 0 4px", fontSize: 19, color: "#0f172a" }}>
              Change Course &amp; Plan Prices (e.g. ₹9,000 → ₹5,000)
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              Edit the fee for any course below and click <strong>Save Price</strong>. The updated price immediately reflects across all Course pages, Programme pages, Student Dashboard, and PayU Checkout.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {staticCourses.slice(0, 8).map((c) => {
            const row = getRowPrices(c.slug, c.price)
            return (
              <div
                key={c.slug}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 1.5fr) repeat(4, minmax(110px, 1fr)) auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <div>
                  <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{c.title}</strong>
                  <span style={{ fontSize: 11.5, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    Slug: {c.slug}
                  </span>
                </div>

                <label style={{ display: "grid", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                  <span>Main / Premium (₹)</span>
                  <input
                    type="number"
                    min="1"
                    value={row.proPrice}
                    onChange={(e) => updateDraft(c.slug, c.price, "proPrice", e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                  <span>Basic Plan (₹)</span>
                  <input
                    type="number"
                    min="1"
                    value={row.certPrice}
                    onChange={(e) => updateDraft(c.slug, c.price, "certPrice", e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                  <span>Pro Flagship (₹)</span>
                  <input
                    type="number"
                    min="1"
                    value={row.flagshipPrice}
                    onChange={(e) => updateDraft(c.slug, c.price, "flagshipPrice", e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                  <span>Strikethrough MRP (₹)</span>
                  <input
                    type="number"
                    min="1"
                    value={row.mrp}
                    onChange={(e) => updateDraft(c.slug, c.price, "mrp", e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void saveCoursePrice(c.slug, c.title, c.price)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "#5142b5",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Save Price
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 2: COUNSELOR REQUEST QUEUE & ADMIN-ONLY COUPON APPROVAL */}
      <section style={cardStyle}>
        {/* Strict Authority Warning Banner */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            color: "#92400e",
            marginBottom: 18,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>🔒</span>
          <div>
            <strong style={{ fontSize: 14, display: "block", marginBottom: 2 }}>
              Strict Rule: Counselors Cannot Generate Coupons Without Admin Approval
            </strong>
            <span style={{ fontSize: 12.5, lineHeight: 1.45, opacity: 0.95 }}>
              Admissions Counselors cannot create or distribute discount codes directly. If a counselor needs to offer a fee concession to a prospective learner, they must submit a formal request to the Admin. Only the Admin can review the justification, approve the discount, and issue an authorized code.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
              STEP 1: REVIEW &amp; APPROVE COUNSELOR REQUESTS
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 19, color: "#0f172a" }}>
              Pending Counselor Discount Requests ({pendingRequests.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCounselorRequestForm((v) => !v)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid #5142b5",
              background: showCounselorRequestForm ? "#5142b5" : "#ffffff",
              color: showCounselorRequestForm ? "#ffffff" : "#5142b5",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {showCounselorRequestForm ? "✕ Close Form" : "+ Submit New Counselor Request to Admin"}
          </button>
        </div>

        {/* Counselor Request Form */}
        {showCounselorRequestForm ? (
          <form
            onSubmit={(e) => void handleSubmitCounselorRequest(e)}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              padding: 16,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1.5px solid #cbd5e1",
              marginBottom: 18,
            }}
          >
            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Counselor Name *</span>
              <input
                type="text"
                value={reqCounselorName}
                onChange={(e) => setReqCounselorName(e.target.value)}
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Student / Lead Email *</span>
              <input
                type="email"
                value={reqStudentEmail}
                onChange={(e) => setReqStudentEmail(e.target.value)}
                placeholder="learner@gmail.com"
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Course / Programme</span>
              <select
                value={reqTargetCourse}
                onChange={(e) => setReqTargetCourse(e.target.value)}
                style={inputStyle}
              >
                <option value="ALL">All Courses</option>
                {staticCourses.slice(0, 8).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Requested Concession</span>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={reqDiscountType}
                  onChange={(e) => setReqDiscountType(e.target.value as "FLAT" | "PERCENT")}
                  style={{ ...inputStyle, width: "auto" }}
                >
                  <option value="FLAT">₹ Flat</option>
                  <option value="PERCENT">% Off</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={reqDiscountValue}
                  onChange={(e) => setReqDiscountValue(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </label>

            <div style={{ gridColumn: "1 / -1", display: "grid", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                <span>Justification for Admin Approval *</span>
                <input
                  type="text"
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Merit background; closing enrollment today if fee concession approved."
                  required
                  style={inputStyle}
                />
              </label>
            </div>

            <div>
              <button
                type="submit"
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#5142b5",
                  color: "#ffffff",
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Submit Request to Admin →
              </button>
            </div>
          </form>
        ) : null}

        {/* Pending Requests List */}
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                border: "1.5px solid #fde68a",
                background: "#fffdf5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "#fef3c7", color: "#92400e", textTransform: "uppercase" }}>
                    Pending Admin Approval
                  </span>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>
                    {req.counselorName} requested {req.requestedDiscountType === "PERCENT" ? `${req.requestedDiscountValue}% OFF` : `₹${req.requestedDiscountValue.toLocaleString("en-IN")} OFF`}
                  </strong>
                </div>
                <div style={{ fontSize: 12.5, color: "#475569" }}>
                  Learner: <strong>{req.studentEmail}</strong> · Target: <strong>{req.targetSlug}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#78350f", marginTop: 4 }}>
                  <em>&ldquo;{req.reason}&rdquo;</em>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => void handleApproveCounselorRequest(req.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#059669",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve &amp; Generate Code
                </button>
                <button
                  type="button"
                  onClick={() => void handleRejectCounselorRequest(req.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#64748b",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pendingRequests.length === 0 ? (
            <div style={{ padding: "14px 16px", borderRadius: 10, background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 13 }}>
              No pending counselor requests right now. Counselors must submit requests before discount codes are issued.
            </div>
          ) : null}
        </div>

        {/* STEP 2: DIRECT ADMIN MASTER COUPON CREATION */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
            STEP 2: DIRECT ADMIN MASTER COUPON GENERATOR
          </span>
          <h3 style={{ margin: "4px 0 4px", fontSize: 17, color: "#0f172a" }}>
            Create Official Admin Coupon Code
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#475569" }}>
            As Superadmin, you can directly authorize and publish an official platform discount or counselor-attributed coupon.
          </p>

          <form
            onSubmit={(e) => void handleCreateAdminCoupon(e)}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
              padding: 16,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: 18,
            }}
          >
            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Coupon Code *</span>
              <input
                type="text"
                value={adminCouponCode}
                onChange={(e) => setAdminCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. ADM-CHANDAN-2000"
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Discount Type</span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "FLAT" | "PERCENT")}
                style={inputStyle}
              >
                <option value="FLAT">Flat Rupees Off (₹)</option>
                <option value="PERCENT">Percentage Off (%)</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>{discountType === "FLAT" ? "Discount Amount (₹)" : "Discount Percent (%)"}</span>
              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Attributed To (Counselor / Policy)</span>
              <input
                type="text"
                value={counselorAttribution}
                onChange={(e) => setCounselorAttribution(e.target.value)}
                placeholder="e.g. Counselor Priya / Superadmin"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Applicable Course</span>
              <select
                value={applicableSlug}
                onChange={(e) => setApplicableSlug(e.target.value)}
                style={inputStyle}
              >
                <option value="ALL">All Courses &amp; Programmes</option>
                {staticCourses.slice(0, 8).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#334155", marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={showOnCheckout}
                  onChange={(e) => setShowOnCheckout(e.target.checked)}
                />
                <span>Show as public chip on Checkout</span>
              </label>
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#5142b5",
                  color: "#ffffff",
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                + Authorize &amp; Save Code
              </button>
            </div>
          </form>
        </div>

        {/* ACTIVE ADMIN-APPROVED COUPONS TABLE */}
        <div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
            ACTIVE ADMIN-APPROVED COUPONS ({coupons.length})
          </span>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {coupons.map((c) => (
              <div
                key={c.code}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <strong
                    style={{
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      color: "#5142b5",
                    }}
                  >
                    {c.code}
                  </strong>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                    {c.discountType === "PERCENT"
                      ? `${c.discountValue}% OFF`
                      : `₹${Number(c.discountValue).toLocaleString("en-IN")} OFF`}
                  </span>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>
                    Attributed: <strong>{c.counselorName}</strong> · Approved: <strong style={{ color: "#047857" }}>{c.approvedBy || "Superadmin"}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: c.showOnCheckout ? "#ecfdf5" : "#f1f5f9",
                      color: c.showOnCheckout ? "#047857" : "#475569",
                    }}
                  >
                    {c.showOnCheckout ? "Public Chip on Checkout" : "Private Authorized Code"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(c.code)
                      setStatusMsg(`Copied coupon code "${c.code}" to clipboard!`)
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Copy Code
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteCoupon(c.code)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#991b1b",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Revoke Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PAYMENT GATEWAY & PAYMENT METHODS CONTROL */}
      <section style={cardStyle}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
          PAYMENT METHODS &amp; GATEWAY CONFIGURATION
        </span>
        <h2 style={{ margin: "4px 0 4px", fontSize: 19, color: "#0f172a" }}>
          Configure Payment Methods &amp; PayU Merchant Credentials
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#475569" }}>
          Enable or disable payment modes shown to learners and manage your live PayU India merchant configuration.
        </p>

        <form onSubmit={(e) => void handleSaveGateway(e)} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              { key: "upiEnabled" as const, label: "UPI & QR (GPay / PhonePe / Paytm)" },
              { key: "cardsEnabled" as const, label: "Debit & Credit Cards (Visa / Mastercard / RuPay)" },
              { key: "netbankingEnabled" as const, label: "NetBanking (All Banks)" },
              { key: "emiEnabled" as const, label: "No-Cost & Standard EMI" },
            ].map((item) => (
              <label
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: gateway[item.key] ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                  background: gateway[item.key] ? "#f5f3ff" : "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={gateway[item.key]}
                  onChange={(e) => setGateway((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Gateway Environment</span>
              <select
                value={gateway.mode}
                onChange={(e) => setGateway((prev) => ({ ...prev, mode: e.target.value as "production" | "test" }))}
                style={inputStyle}
              >
                <option value="production">Production Live (secure.payu.in)</option>
                <option value="test">Sandbox Test (test.payu.in)</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>PayU Merchant Key</span>
              <input
                type="text"
                value={gateway.merchantKey}
                onChange={(e) => setGateway((prev) => ({ ...prev, merchantKey: e.target.value }))}
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>PayU Merchant ID (MID)</span>
              <input
                type="text"
                value={gateway.mid}
                onChange={(e) => setGateway((prev) => ({ ...prev, mid: e.target.value }))}
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>Update PayU Salt (Optional)</span>
              <input
                type="password"
                value={merchantSaltInput}
                onChange={(e) => setMerchantSaltInput(e.target.value)}
                placeholder="Leave blank to keep verified salt"
                style={inputStyle}
              />
            </label>
          </div>

          <div>
            <button
              type="submit"
              style={{
                padding: "11px 20px",
                borderRadius: 10,
                border: "none",
                background: "#5142b5",
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Save Payment Methods &amp; Gateway Settings
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 4: 1-CLICK IN-APP UPDATE BROADCASTER (MOBILE APK & WEB) */}
      <section style={cardStyle}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>
          MOBILE APK &amp; WEB IN-APP UPDATE ENGINE
        </span>
        <h2 style={{ margin: "4px 0 4px", fontSize: 19, color: "#0f172a" }}>
          Push 1-Click In-App Update Notification to All Users
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#475569" }}>
          Whenever you deploy an update, broadcast a new version number here. Every Mobile APK and Web user will immediately see an <strong>&ldquo;Update Now&rdquo;</strong> prompt inside the app without hunting for manual downloads.
        </p>

        <form onSubmit={(e) => void handlePushAppUpdate(e)} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(160px, 220px) 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>New App Version (e.g. 1.5.0, 1.5.1)</span>
              <input
                type="text"
                value={appUpdateVersion}
                onChange={(e) => setAppUpdateVersion(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>
              <span>What&apos;s New (Shown on In-App Update Banner)</span>
              <input
                type="text"
                value={appUpdateNotes}
                onChange={(e) => setAppUpdateNotes(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={appForceUpdate}
                onChange={(e) => setAppForceUpdate(e.target.checked)}
              />
              <span>Mandatory Force Update Modal (Requires immediate update before continuing)</span>
            </label>

            <button
              type="submit"
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: "#059669",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Broadcast In-App Update Now
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
