import { useEffect, useState, type FormEvent } from "react"
import {
  adjustLearnerElixir,
  createLearningResource,
  fetchAdminAi,
  fetchAdminAudit,
  fetchAdminCatalogue,
  fetchAdminReports,
  listElixirRules,
  recordVerifiedPayment,
  refundVerifiedPayment,
  updateElixirRule,
  type AdminUnitEconomics,
  type ElixirRule,
} from "../../lib/admin-api"

const field = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "9px 12px",
  borderRadius: 10,
  border: "1.5px solid #CBD5E1",
  background: "#F8FAFC",
  color: "#0F172A",
  fontSize: 13.5,
} as const

const cardBox = {
  padding: "22px 24px",
  borderRadius: 18,
  background: "#FFFFFF",
  border: "1.5px solid #DDD7FF",
  borderTop: "4px solid #5142B5",
  boxShadow: "0 10px 26px -14px rgba(81, 66, 181, 0.14)",
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
} as const

const primaryBtn = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid #5142B5",
  background: "#5142B5",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
} as const

export default function AdminPlatform() {
  const [message, setMessage] = useState<string | null>(null)
  const [rules, setRules] = useState<ElixirRule[]>([])
  const [reports, setReports] = useState<string>("Loading reports…")
  const [unitEconomics, setUnitEconomics] = useState<AdminUnitEconomics | null>(null)
  const [ai, setAi] = useState<string>("Loading Skylent AI status…")
  const [audit, setAudit] = useState<string>("Loading audit log…")
  const [catalogue, setCatalogue] = useState<string>("Loading catalogue…")

  async function refresh() {
    const [ruleResult, reportResult, aiResult, auditResult, catalogueResult] = await Promise.allSettled([
      listElixirRules(),
      fetchAdminReports(),
      fetchAdminAi(),
      fetchAdminAudit(),
      fetchAdminCatalogue(),
    ])
    if (ruleResult.status === "fulfilled") setRules(ruleResult.value.data)
    if (reportResult.status === "fulfilled") {
      const data = reportResult.value.data
      setUnitEconomics(data.unitEconomics ?? null)
      setReports(data.elixir
        ? `${data.users} users · ${data.enrolments} enrolments · Elixir issued: ${data.elixir.issued} · Spent: ${data.elixir.spent} · Unrecovered: ${data.elixir.unrecovered}`
        : `${data.users} users · ${data.enrolments} enrolments`)
    } else {
      setReports("Reports could not be loaded.")
      setUnitEconomics(null)
    }
    if (aiResult.status === "fulfilled") {
      const data = aiResult.value.data
      setAi(`Provider: ${data.provider} · Ready: ${data.configured ? "Yes" : "Fallback Socratic Mode"} (${data.reason}) · Key present: ${data.keyPresent ? "Yes" : "No"}`)
    } else setAi("Skylent AI status could not be loaded.")
    if (auditResult.status === "fulfilled") {
      setAudit(auditResult.value.data.slice(0, 8).map((row) => `${row.createdAt} · ${row.action}: ${row.summary}`).join("\n") || "No audit rows recorded in this session yet.")
    } else setAudit("Audit log is not available yet.")
    if (catalogueResult.status === "fulfilled") {
      const data = catalogueResult.value.data
      setCatalogue(`${data.enrolmentCount} active enrolments across ${data.courses.length} authored courses & ${data.programs.length} programmes.`)
    } else setCatalogue("Catalogue could not be loaded.")
  }

  useEffect(() => { void refresh().catch(() => setMessage("Some admin reports could not be loaded.")) }, [])

  async function saveRule(event: FormEvent<HTMLFormElement>, rule: ElixirRule) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      await updateElixirRule(rule.activity, {
        amount: Number(form.get("amount")),
        enabled: form.get("enabled") === "on",
        quizScorePercent: form.get("quizScorePercent") ? Number(form.get("quizScorePercent")) : null,
        cooldownSeconds: Number(form.get("cooldownSeconds") || 0),
      })
      setMessage(`${rule.activity} rule updated.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The rule could not be saved.")
    }
  }

  async function onPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      const result = await recordVerifiedPayment({
        userId: String(form.get("userId")),
        externalRef: String(form.get("externalRef")),
        eligibleNetRupees: Number(form.get("eligibleNetRupees")),
        status: String(form.get("status")),
      })
      setMessage(result.data.duplicate ? "That payment reference was already recorded." : `Recorded. Awarded ${result.data.elixirAwarded} Elixir.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The payment could not be recorded.")
    }
  }

  async function onRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      const result = await refundVerifiedPayment(String(form.get("paymentId")))
      setMessage(`Refund ${result.data.status}. Reversed ${result.data.reversed} Elixir. Unrecovered ${result.data.unrecovered}.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The refund could not be recorded.")
    }
  }

  async function onAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      const result = await adjustLearnerElixir({
        userId: String(form.get("userId")),
        amount: Number(form.get("amount")),
        reason: String(form.get("reason")),
        idempotencyKey: crypto.randomUUID(),
      })
      setMessage(result.data.duplicate ? "That adjustment was already applied." : `Adjusted by ${result.data.amount} Elixir.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The adjustment could not be saved.")
    }
  }

  async function onResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      const courseSlug = String(form.get("courseSlug") || "")
      const lessonKey = String(form.get("lessonKey") || "")
      await createLearningResource({
        slug: String(form.get("slug")),
        kind: String(form.get("kind")) === "case_study" ? "case_study" : "notes",
        title: String(form.get("title")),
        elixirPrice: Number(form.get("elixirPrice")),
        published: form.get("published") === "on",
        ...(courseSlug ? { courseSlug } : {}),
        ...(lessonKey ? { lessonKey } : {}),
      })
      setMessage("Resource saved.")
      event.currentTarget.reset()
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The resource could not be saved.")
    }
  }

  const econ = unitEconomics ?? {
    activationRatePercent: 60,
    elixirRedemptionRatePercent: 50,
    netUnredeemedElixirLiability: 0,
  }

  return (
    <div id="admin-payments" style={{ display: "grid", gap: 20 }}>
      {/* C-Suite Unit Economics & Live Telemetry Strip */}
      <section aria-label="C-Suite unit economics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ padding: "18px 20px", borderRadius: 16, background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "4px solid #5142B5", boxShadow: "0 8px 22px -14px rgba(81, 66, 181, 0.14)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5" }}>Learner activation rate</div>
          <strong style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", display: "block", marginTop: 4 }}>{econ.activationRatePercent}%</strong>
          <span style={{ fontSize: 12.5, color: "#475569" }}>Enrolments per registered user</span>
        </div>
        <div style={{ padding: "18px 20px", borderRadius: 16, background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "4px solid #5142B5", boxShadow: "0 8px 22px -14px rgba(81, 66, 181, 0.14)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5" }}>Elixir redemption velocity</div>
          <strong style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", display: "block", marginTop: 4 }}>{econ.elixirRedemptionRatePercent}%</strong>
          <span style={{ fontSize: 12.5, color: "#475569" }}>Share of issued Elixir redeemed on case studies</span>
        </div>
        <div style={{ padding: "18px 20px", borderRadius: 16, background: "#FFFFFF", border: "1.5px solid #DDD7FF", borderTop: "4px solid #5142B5", boxShadow: "0 8px 22px -14px rgba(81, 66, 181, 0.14)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5" }}>Net unredeemed Elixir liability</div>
          <strong style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", display: "block", marginTop: 4 }}>{econ.netUnredeemedElixirLiability} Elixir</strong>
          <span style={{ fontSize: 12.5, color: "#475569" }}>Outstanding coin balance available for unlocks</span>
        </div>
      </section>

      {/* Platform Telemetry Summary Bar */}
      <section id="admin-system" style={{ ...cardBox, background: "linear-gradient(180deg, #F6F4FF 0%, #FFFFFF 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              LIVE SYSTEM, CATALOGUE &amp; SKYLENT AI HEALTH
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 800, color: "#0F172A" }}>
              Real-Time Platform &amp; AI Telemetry
            </h2>
          </div>
          <button type="button" onClick={() => void refresh()} style={{ ...primaryBtn, background: "#F5F3FF", color: "#5142B5", borderColor: "#DDD7FF" }}>
            Refresh Telemetry ↻
          </button>
        </div>
        {message ? <p role="status" style={{ margin: 0, padding: "8px 12px", borderRadius: 8, background: "#DCFCE7", color: "#15803D", fontSize: 13, fontWeight: 700 }}>{message}</p> : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <strong style={{ display: "block", fontSize: 12, color: "#5142B5", fontFamily: "var(--font-mono)", marginBottom: 4 }}>USERS &amp; ELIXIR LEDGER</strong>
            <span style={{ fontSize: 13, color: "#1E293B" }}>{reports}</span>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <strong style={{ display: "block", fontSize: 12, color: "#5142B5", fontFamily: "var(--font-mono)", marginBottom: 4 }}>CATALOGUE &amp; ENROLMENTS</strong>
            <span style={{ fontSize: 13, color: "#1E293B" }}>{catalogue}</span>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <strong style={{ display: "block", fontSize: 12, color: "#5142B5", fontFamily: "var(--font-mono)", marginBottom: 4 }}>SKYLENT AI ENGINE</strong>
            <span style={{ fontSize: 13, color: "#1E293B" }}>{ai}</span>
          </div>
        </div>
      </section>

      {/* Learning Reward Rules Card */}
      {rules.length > 0 ? (
        <section style={cardBox}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              AUTOMATED MERIT REWARDS
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 800, color: "#0F172A" }}>
              Elixir Learning Reward Rules
            </h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {rules.map((rule) => (
              <form key={rule.activity} onSubmit={(event) => void saveRule(event, rule)} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <strong style={{ minWidth: 160, color: "#0F172A", fontSize: 13.5 }}>{rule.activity}</strong>
                <input name="amount" type="number" min={0} defaultValue={rule.amount} aria-label={`${rule.activity} amount`} style={{ ...field, width: 100 }} />
                <input name="cooldownSeconds" type="number" min={0} defaultValue={rule.cooldownSeconds} aria-label={`${rule.activity} cooldown seconds`} style={{ ...field, width: 120 }} />
                {rule.activity === "quiz_score" ? <input name="quizScorePercent" type="number" min={0} max={100} defaultValue={rule.quizScorePercent ?? ""} aria-label="Quiz score percent" style={{ ...field, width: 100 }} placeholder="Score %" /> : null}
                <label style={{ fontSize: 13, color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <input name="enabled" type="checkbox" defaultChecked={rule.enabled} /> Enabled
                </label>
                <button type="submit" style={primaryBtn}>Save</button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {/* 2x2 Grid for Payments, Wallet Adjustments, Case Store Publishing & Audit Log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, alignItems: "start" }}>
        <form onSubmit={(event) => void onPayment(event)} style={cardBox}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              TREASURY &amp; FEE VERIFICATION
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "2px 0 0" }}>Record a verified payment</h2>
          </div>
          <input name="userId" required placeholder="Learner user ID" aria-label="Learner user id" style={field} />
          <input name="externalRef" required minLength={4} placeholder="External bank / UPI reference" aria-label="External payment reference" style={field} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input name="eligibleNetRupees" required type="number" min={0} placeholder="Net rupees (₹)" aria-label="Eligible net rupees" style={field} />
            <select name="status" aria-label="Payment status" style={field} defaultValue="succeeded">
              <option value="succeeded">succeeded</option>
              <option value="pending">pending</option>
              <option value="failed">failed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <button type="submit" style={{ ...primaryBtn, alignSelf: "flex-start" }}>Record payment</button>
        </form>

        <form onSubmit={(event) => void onAdjust(event)} style={cardBox}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              ELIXIR WALLET GRANT / DEBIT
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "2px 0 0" }}>Adjust a balance</h2>
          </div>
          <input name="userId" required placeholder="Learner user ID" aria-label="Adjustment user id" style={field} />
          <input name="amount" required type="number" placeholder="Elixir amount (+ to grant, - to debit)" aria-label="Elixir amount" style={field} />
          <input name="reason" required minLength={8} placeholder="Audit reason (min 8 chars)" aria-label="Adjustment reason" style={field} />
          <button type="submit" style={{ ...primaryBtn, alignSelf: "flex-start" }}>Apply adjustment</button>
        </form>

        <form onSubmit={(event) => void onResource(event)} style={cardBox}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              ELIXIR CASE STUDY STORE
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "2px 0 0" }}>Notes or case study</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input name="slug" required placeholder="resource-slug" aria-label="Resource slug" style={field} />
            <select name="kind" aria-label="Resource kind" style={field}><option value="case_study">case_study</option><option value="notes">notes</option></select>
          </div>
          <input name="title" required placeholder="Case study / playbook title" aria-label="Resource title" style={field} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <input name="elixirPrice" required type="number" min={0} placeholder="Elixir price" aria-label="Elixir price" style={field} />
            <input name="courseSlug" placeholder="Course slug" aria-label="Course slug" style={field} />
            <input name="lessonKey" placeholder="Lesson key" aria-label="Lesson key" style={field} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: 13, color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input name="published" type="checkbox" defaultChecked /> Published in store
            </label>
            <button type="submit" style={primaryBtn}>Save resource</button>
          </div>
        </form>

        <div style={cardBox}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 800, color: "#5142B5", letterSpacing: "0.08em" }}>
              REVERSALS &amp; IMMUTABLE LEDGER
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "2px 0 0" }}>Refund &amp; Security Audit Log</h2>
          </div>
          <form onSubmit={(event) => void onRefund(event)} style={{ display: "flex", gap: 8 }}>
            <input name="paymentId" required placeholder="Payment ID to refund" aria-label="Payment id" style={field} />
            <button type="submit" style={{ ...primaryBtn, background: "#F5F3FF", color: "#5142B5", borderColor: "#DDD7FF", whiteSpace: "nowrap" }}>Refund</button>
          </form>
          <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155", whiteSpace: "pre-wrap", fontSize: 11.5, maxHeight: 150, overflowY: "auto" }}>
            {audit}
          </pre>
        </div>
      </div>
    </div>
  )
}
