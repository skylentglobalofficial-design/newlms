import { AdminCatalogLockStudio } from "./AdminCatalogLockStudio";
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

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 10px 28px -12px rgba(15, 23, 42, 0.08)",
} as const

const field = {
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13.5,
} as const

export default function AdminPlatform({
  sectionFilter = "all",
}: {
  sectionFilter?: "all" | "overview" | "payments" | "system"
}) {
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
      setReports(
        data.elixir
          ? `${data.users} users, ${data.enrolments} enrolments. Elixir issued ${data.elixir.issued}, spent ${data.elixir.spent}, unrecovered ${data.elixir.unrecovered}.`
          : `${data.users} users, ${data.enrolments} enrolments. Elixir ledger is not available yet.`,
      )
    } else {
      setReports("Reports could not be loaded.")
      setUnitEconomics(null)
    }
    if (aiResult.status === "fulfilled") {
      const data = aiResult.value.data
      setAi(
        `Provider ${data.provider}. Ready: ${data.configured ? "yes" : "no"} (${data.reason}). Key present: ${data.keyPresent ? "yes" : "no"}. Last failure: ${data.lastFailure ? `${data.lastFailure.code} at ${data.lastFailure.at}` : "none in this process"}.`,
      )
    } else setAi("Skylent AI status could not be loaded.")
    if (auditResult.status === "fulfilled") {
      setAudit(
        auditResult.value.data
          .slice(0, 12)
          .map((row) => `${row.createdAt} ${row.action}: ${row.summary}`)
          .join("\n") || "No audit rows yet.",
      )
    } else setAudit("Audit log is not available yet.")
    if (catalogueResult.status === "fulfilled") {
      const data = catalogueResult.value.data
      setCatalogue(`${data.enrolmentCount} enrolments. ${data.courses.length} courses, ${data.programs.length} programmes.`)
    } else setCatalogue("Catalogue could not be loaded.")
  }

  useEffect(() => {
    void refresh().catch(() => setMessage("Some admin reports could not be loaded."))
  }, [])

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
      setMessage(`${rule.activity} saved.`)
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
      setMessage(
        result.data.duplicate
          ? "That payment reference was already recorded."
          : `Recorded. Awarded ${result.data.elixirAwarded} Elixir.`,
      )
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
      setMessage(
        `Refund ${result.data.status}. Reversed ${result.data.reversed} Elixir. Unrecovered ${result.data.unrecovered}.`,
      )
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
      setMessage(`Balance is now ${result.data.balance} Elixir.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The adjustment could not be recorded.")
    }
  }

  async function onResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage(null)
    try {
      await createLearningResource({
        slug: String(form.get("slug")),
        title: String(form.get("title")),
        summary: String(form.get("summary")),
        body: String(form.get("body")),
        kind: String(form.get("kind")),
        elixirPrice: Number(form.get("elixirPrice")),
        active: true,
      })
      setMessage("Learning resource saved.")
      event.currentTarget.reset()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The resource could not be saved.")
    }
  }

  const showOverview = sectionFilter === "all" || sectionFilter === "overview"
  const showPayments = sectionFilter === "all" || sectionFilter === "payments"
  const showSystem = sectionFilter === "all" || sectionFilter === "system"

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {message ? (
        <p
          role="status"
          style={{
            margin: 0,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#f5f3ff",
            border: "1px solid #c4b8ff",
            color: "#5142b5",
            fontWeight: 700,
          }}
        >
          {message}
        </p>
      ) : null}

      {showOverview ? (
        <section id="admin-reports" style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
                C-SUITE UNIT ECONOMICS &amp; LIVE PLATFORM TELEMETRY
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>Reports and system checks</h2>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid #5142b5",
                background: "#f5f3ff",
                color: "#5142b5",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Refresh Telemetry ↻
            </button>
          </div>

          {unitEconomics ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
              aria-label="C-Suite unit economics"
            >
              <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd6fe", background: "#f6f4ff" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75, display: "block", color: "#5142b5", fontWeight: 700 }}>
                  Learner activation rate
                </span>
                <strong style={{ fontSize: 24, display: "block", marginTop: 4, color: "#0f172a" }}>
                  {unitEconomics.activationRatePercent}%
                </strong>
              </div>
              <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd6fe", background: "#f6f4ff" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75, display: "block", color: "#5142b5", fontWeight: 700 }}>
                  Elixir redemption velocity
                </span>
                <strong style={{ fontSize: 24, display: "block", marginTop: 4, color: "#0f172a" }}>
                  {unitEconomics.elixirRedemptionRatePercent}%
                </strong>
              </div>
              <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd6fe", background: "#f6f4ff" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75, display: "block", color: "#5142b5", fontWeight: 700 }}>
                  Net unredeemed Elixir liability
                </span>
                <strong style={{ fontSize: 24, display: "block", marginTop: 4, color: "#5142b5" }}>
                  {unitEconomics.netUnredeemedElixirLiability} Coins
                </strong>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <strong style={{ display: "block", fontSize: 12, color: "#5142b5", marginBottom: 4 }}>Platform &amp; Ledger Totals</strong>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{reports}</p>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <strong style={{ display: "block", fontSize: 12, color: "#5142b5", marginBottom: 4 }}>Catalogue Inventory</strong>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{catalogue}</p>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <strong style={{ display: "block", fontSize: 12, color: "#5142b5", marginBottom: 4 }}>Skylent AI Provider Readiness</strong>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{ai}</p>
            </div>
          </div>
        </section>
      ) : null}

      {showPayments ? (
        <div id="admin-payments" style={{ display: "grid", gap: 20 }}>
          <section style={cardStyle}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
              ELIXIR MERIT SCHEDULE &amp; REWARD RULES
            </span>
            <h2 style={{ margin: "2px 0 12px", fontSize: 18, color: "#0f172a" }}>Learning reward rules</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {rules.map((rule) => (
                <form
                  key={rule.activity}
                  onSubmit={(event) => void saveRule(event, rule)}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <strong style={{ minWidth: 160, fontSize: 13.5, color: "#0f172a" }}>{rule.activity}</strong>
                  <label style={{ fontSize: 12, color: "#475569" }}>
                    Elixir <input name="amount" type="number" min={0} max={1000} defaultValue={rule.amount} style={{ ...field, width: 82 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#475569" }}>
                    Min % <input name="quizScorePercent" type="number" min={0} max={100} defaultValue={rule.quizScorePercent ?? ""} style={{ ...field, width: 78 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#475569" }}>
                    Cooldown s <input name="cooldownSeconds" type="number" min={0} defaultValue={rule.cooldownSeconds} style={{ ...field, width: 96 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>
                    <input name="enabled" type="checkbox" defaultChecked={rule.enabled} /> Enabled
                  </label>
                  <button
                    className="os-btn os-btn-primary"
                    type="submit"
                    style={{
                      marginLeft: "auto",
                      background: "#5142b5",
                      color: "#ffffff",
                      borderColor: "#5142b5",
                      fontWeight: 700,
                      padding: "7px 14px",
                      borderRadius: 8,
                    }}
                  >
                    Save rule
                  </button>
                </form>
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <form onSubmit={(event) => void onPayment(event)} style={{ ...cardStyle, display: "grid", gap: 10 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                VERIFIED PAYMENT LEDGER
              </span>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Record verified payment</h3>
              <input name="userId" placeholder="User UUID" required style={field} />
              <input name="externalRef" placeholder="Gateway reference (e.g. pay_...)" required style={field} />
              <input name="eligibleNetRupees" type="number" min={0} placeholder="Eligible net rupees (INR)" required style={field} />
              <select name="status" defaultValue="captured" style={field}>
                <option value="captured">captured</option>
                <option value="settled">settled</option>
                <option value="pending">pending</option>
              </select>
              <button
                className="os-btn os-btn-primary"
                type="submit"
                style={{ background: "#5142b5", color: "#ffffff", borderColor: "#5142b5", fontWeight: 700 }}
              >
                Record payment
              </button>
            </form>

            <form onSubmit={(event) => void onRefund(event)} style={{ ...cardStyle, display: "grid", gap: 10 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                REVERSAL &amp; REFUND GUARD
              </span>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Refund or reverse payment</h3>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                Automatically clawbacks unspent Elixir Coins and tracks unrecovered liability.
              </p>
              <input name="paymentId" placeholder="Payment UUID" required style={field} />
              <button className="os-btn os-btn-ghost" type="submit" style={{ marginTop: "auto" }}>
                Record refund
              </button>
            </form>

            <form onSubmit={(event) => void onAdjust(event)} style={{ ...cardStyle, display: "grid", gap: 10 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
                MANUAL WALLET CREDIT / DEBIT
              </span>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Adjust learner Elixir</h3>
              <input name="userId" placeholder="User UUID" required style={field} />
              <input name="amount" type="number" placeholder="Signed amount, e.g. 50 or -20" required style={field} />
              <input name="reason" placeholder="Reason for audit log" required style={field} />
              <button
                className="os-btn os-btn-primary"
                type="submit"
                style={{ background: "#5142b5", color: "#ffffff", borderColor: "#5142b5", fontWeight: 700 }}
              >
                Apply adjustment
              </button>
            </form>
          </div>

          <form onSubmit={(event) => void onResource(event)} style={{ ...cardStyle, display: "grid", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
              ELIXIR CASE STUDY STORE PUBLISHER
            </span>
            <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Publish learning resource</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <input name="slug" placeholder="resource-slug" required style={field} />
              <input name="title" placeholder="Title" required style={field} />
              <select name="kind" defaultValue="case_study" style={field}>
                <option value="case_study">Case study</option>
                <option value="project_brief">Project brief</option>
                <option value="guided_material">Guided material</option>
              </select>
              <input name="elixirPrice" type="number" min={1} defaultValue={99} required style={field} />
            </div>
            <input name="summary" placeholder="Short summary" required style={field} />
            <textarea name="body" placeholder="Full resource text (Markdown supported)" rows={4} required style={field} />
            <button
              className="os-btn os-btn-primary"
              type="submit"
              style={{ background: "#5142b5", color: "#ffffff", borderColor: "#5142b5", fontWeight: 700, justifySelf: "start" }}
            >
              Publish resource
            </button>
          </form>
        </div>
      ) : null}

      {showSystem ? (
        <section id="admin-system" style={cardStyle}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5" }}>
            IMMUTABLE ADMIN AUDIT LOG &amp; SYSTEM DIAGNOSTICS
          </span>
          <h2 style={{ margin: "2px 0 12px", fontSize: 18, color: "#0f172a" }}>System &amp; Security Audit Trail</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 12.5,
              padding: 16,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {audit}
          </pre>
        </section>
      ) : null}
    </div>
  )
}
