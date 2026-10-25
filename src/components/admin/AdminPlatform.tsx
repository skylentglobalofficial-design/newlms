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
  type ElixirRule,
} from "../../lib/admin-api"

const field = { padding: "8px 10px", borderRadius: 8, border: "1px solid var(--skylent-line, #e4e4e7)", background: "transparent" } as const

export default function AdminPlatform() {
  const [message, setMessage] = useState<string | null>(null)
  const [rules, setRules] = useState<ElixirRule[]>([])
  const [reports, setReports] = useState<string>("Loading reports…")
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
      setReports(data.elixir
        ? `${data.users} users, ${data.enrolments} enrolments. Elixir issued ${data.elixir.issued}, spent ${data.elixir.spent}, unrecovered ${data.elixir.unrecovered}.`
        : `${data.users} users, ${data.enrolments} enrolments. Elixir ledger is not available yet.`)
    } else setReports("Reports could not be loaded.")
    if (aiResult.status === "fulfilled") {
      const data = aiResult.value.data
      setAi(`Provider ${data.provider}. Ready: ${data.configured ? "yes" : "no"} (${data.reason}). Key present: ${data.keyPresent ? "yes" : "no"}. Last failure: ${data.lastFailure ? `${data.lastFailure.code} at ${data.lastFailure.at}` : "none in this process"}.`)
    } else setAi("Skylent AI status could not be loaded.")
    if (auditResult.status === "fulfilled") {
      setAudit(auditResult.value.data.slice(0, 8).map((row) => `${row.createdAt} ${row.action}: ${row.summary}`).join("\n") || "No audit rows yet.")
    } else setAudit("Audit log is not available yet.")
    if (catalogueResult.status === "fulfilled") {
      const data = catalogueResult.value.data
      setCatalogue(`${data.enrolmentCount} enrolments. ${data.courses.length} courses, ${data.programs.length} programmes.`)
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

  return (
    <div id="admin-payments" style={{ padding: "22px 0", display: "grid", gap: 22 }}>
      <div>
        <div style={{ fontSize: 11, marginBottom: 8 }}>Elixir, payments, and reports</div>
        <p style={{ margin: 0, fontSize: 13, maxWidth: 680 }}>
          Elixir is internal learning credit. Purchase rewards use a verified net amount in whole rupees: floor(rupees / 10).
          This site does not take card or UPI payments. A super admin records a payment only after it is verified outside Skylent.
          Learning rewards stay off until you set an amount here.
        </p>
      </div>
      {message ? <p role="status">{message}</p> : null}
      <p style={{ margin: 0, fontSize: 13 }}>{reports}</p>
      <p style={{ margin: 0, fontSize: 13 }}>{catalogue}</p>
      <section id="admin-system">
        <h2 style={{ fontSize: 16 }}>Skylent AI</h2>
        <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{ai}</p>
      </section>
      <section>
        <h2 style={{ fontSize: 16 }}>Learning reward rules</h2>
        {rules.map((rule) => (
          <form key={rule.activity} onSubmit={(event) => void saveRule(event, rule)} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ minWidth: 160 }}>{rule.activity}</strong>
            <input name="amount" type="number" min={0} defaultValue={rule.amount} aria-label={`${rule.activity} amount`} style={field} />
            <input name="cooldownSeconds" type="number" min={0} defaultValue={rule.cooldownSeconds} aria-label={`${rule.activity} cooldown seconds`} style={field} />
            {rule.activity === "quiz_score" ? <input name="quizScorePercent" type="number" min={0} max={100} defaultValue={rule.quizScorePercent ?? ""} aria-label="Quiz score percent" style={field} placeholder="Score %" /> : null}
            <label><input name="enabled" type="checkbox" defaultChecked={rule.enabled} /> Enabled</label>
            <button type="submit" className="os-btn os-btn-primary">Save</button>
          </form>
        ))}
      </section>
      <form onSubmit={(event) => void onPayment(event)} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Record a verified payment</h2>
        <input name="userId" required placeholder="Learner user id" aria-label="Learner user id" style={field} />
        <input name="externalRef" required minLength={4} placeholder="External reference" aria-label="External payment reference" style={field} />
        <input name="eligibleNetRupees" required type="number" min={0} placeholder="Eligible net rupees" aria-label="Eligible net rupees" style={field} />
        <select name="status" aria-label="Payment status" style={field} defaultValue="succeeded">
          <option value="succeeded">succeeded</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <button type="submit" className="os-btn os-btn-primary">Record payment</button>
      </form>
      <form onSubmit={(event) => void onRefund(event)} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input name="paymentId" required placeholder="Payment id to refund" aria-label="Payment id" style={field} />
        <button type="submit" className="os-btn os-btn-ghost">Refund</button>
      </form>
      <form onSubmit={(event) => void onAdjust(event)} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Adjust a balance</h2>
        <input name="userId" required placeholder="Learner user id" aria-label="Adjustment user id" style={field} />
        <input name="amount" required type="number" placeholder="Elixir amount, negative to remove" aria-label="Elixir amount" style={field} />
        <input name="reason" required minLength={8} placeholder="Reason" aria-label="Adjustment reason" style={field} />
        <button type="submit" className="os-btn os-btn-primary">Apply adjustment</button>
      </form>
      <form onSubmit={(event) => void onResource(event)} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Notes or case study</h2>
        <input name="slug" required placeholder="slug" aria-label="Resource slug" style={field} />
        <input name="title" required placeholder="Title" aria-label="Resource title" style={field} />
        <select name="kind" aria-label="Resource kind" style={field}><option value="notes">notes</option><option value="case_study">case_study</option></select>
        <input name="elixirPrice" required type="number" min={0} placeholder="Elixir price" aria-label="Elixir price" style={field} />
        <input name="courseSlug" placeholder="Course slug for a case-study reward" aria-label="Course slug" style={field} />
        <input name="lessonKey" placeholder="Lesson key" aria-label="Lesson key" style={field} />
        <label><input name="published" type="checkbox" /> Published</label>
        <button type="submit" className="os-btn os-btn-primary">Save resource</button>
      </form>
      <section>
        <h2 style={{ fontSize: 16 }}>Audit</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{audit}</pre>
      </section>
    </div>
  )
}
