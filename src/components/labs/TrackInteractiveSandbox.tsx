import { useState } from "react"

type SandboxPreset = {
  badge: string
  title: string
  subtitle: string
  sampleLabel: string
  defaultInput: string
  evaluate: (input: string) => {
    passed: boolean
    headline: string
    metrics: Array<{ label: string; value: string }>
    diagnostics: string[]
  }
}

const SANDBOX_PRESETS: Record<string, SandboxPreset> = {
  "python-pipeline-audit": {
    badge: "Interactive Python ETL & Quarantine Validator",
    title: "Settlement Feed Idempotency & Dead-Letter Simulator",
    subtitle: "Test JSONL settlement batches against composite deduplication keys (gateway_tx_id, settlement_epoch) and schema quarantine rules.",
    sampleLabel: "Sample JSONL settlement batch (with duplicate retry & negative fee)",
    defaultInput: [
      '{"gateway_tx_id":"gw_901","settlement_epoch":1730246400,"currency":"INR","amount_paise":14900,"fee_paise":298}',
      '{"gateway_tx_id":"gw_901","settlement_epoch":1730246400,"currency":"INR","amount_paise":14900,"fee_paise":298}',
      '{"gateway_tx_id":"gw_902","settlement_epoch":1730246400,"currency":"","amount_paise":9900,"fee_paise":-50}',
      '{"gateway_tx_id":"gw_903","settlement_epoch":1730246400,"currency":"USD","amount_paise":25000,"fee_paise":500}',
    ].join("\n"),
    evaluate(input: string) {
      const lines = input.split("\n").map((l) => l.trim()).filter(Boolean)
      const seen = new Set<string>()
      let accepted = 0
      let duplicates = 0
      let quarantined = 0
      const diagnostics: string[] = []

      lines.forEach((line, idx) => {
        try {
          const row = JSON.parse(line) as Record<string, unknown>
          const txId = String(row.gateway_tx_id ?? "").trim()
          const epoch = Number(row.settlement_epoch ?? 0)
          const currency = String(row.currency ?? "").trim()
          const amount = Number(row.amount_paise ?? NaN)
          const fee = Number(row.fee_paise ?? NaN)
          if (!txId || !epoch || !currency || Number.isNaN(amount) || Number.isNaN(fee) || amount <= 0 || fee < 0) {
            quarantined += 1
            diagnostics.push(`Line ${idx + 1} (${txId || "unknown"}): Quarantined → INVALID_SCHEMA_OR_NEGATIVE_FEE`)
            return
          }
          const key = `${txId}:${epoch}`
          if (seen.has(key)) {
            duplicates += 1
            diagnostics.push(`Line ${idx + 1} (${txId}): Deduplicated → DUPLICATE_COMPOSITE_KEY (${key})`)
            return
          }
          seen.add(key)
          accepted += 1
          diagnostics.push(`Line ${idx + 1} (${txId}): Accepted (${currency} ${amount} minor units)`)
        } catch {
          quarantined += 1
          diagnostics.push(`Line ${idx + 1}: Quarantined → MALFORMED_JSON_LINE`)
        }
      })

      return {
        passed: accepted > 0 && (duplicates > 0 || quarantined > 0),
        headline: `Processed ${lines.length} rows: ${accepted} committed, ${duplicates} duplicate retries suppressed, ${quarantined} quarantined.`,
        metrics: [
          { label: "Committed Ledger Rows", value: String(accepted) },
          { label: "Idempotent Retries Blocked", value: String(duplicates) },
          { label: "Dead-Letter Quarantined", value: String(quarantined) },
        ],
        diagnostics,
      }
    },
  },
  "churn-cohort-validation": {
    badge: "Interactive Out-of-Time Validation & Precision@K Simulator",
    title: "Temporal Split & Retention Capacity ROI Auditor",
    subtitle: "Check feature lists for post-cutoff target leakage and compute net monthly LTV retained at Top-500 weekly outreach capacity.",
    sampleLabel: "Candidate feature list & outreach parameters (JSON)",
    defaultInput: JSON.stringify(
      {
        cutoffDate: "2026-06-30",
        weeklyOutreachCapacity: 500,
        PrecisionAtTop500: 0.64,
        avgAnnualContractValueInr: 48000,
        saveRateOnTrueChurner: 0.35,
        features: [
          "rolling_30d_active_seats_ratio",
          "support_sla_breaches_last_14d",
          "invoice_payment_delay_days_pre_cutoff",
        ],
      },
      null,
      2,
    ),
    evaluate(input: string) {
      try {
        const cfg = JSON.parse(input) as {
          weeklyOutreachCapacity?: number
          PrecisionAtTop500?: number
          avgAnnualContractValueInr?: number
          saveRateOnTrueChurner?: number
          features?: string[]
        }
        const features = Array.isArray(cfg.features) ? cfg.features : []
        const leaky = features.filter((f) => /cancellation_request|post_cutoff|exit_survey|winback/i.test(f))
        const cap = Number(cfg.weeklyOutreachCapacity ?? 500)
        const prec = Number(cfg.PrecisionAtTop500 ?? 0.6)
        const acv = Number(cfg.avgAnnualContractValueInr ?? 48000)
        const saveRate = Number(cfg.saveRateOnTrueChurner ?? 0.35)
        const trueChurnersReached = Math.round(cap * prec)
        const expectedSaves = Math.round(trueChurnersReached * saveRate)
        const grossSavedInr = expectedSaves * acv

        const diagnostics = [
          leaky.length === 0
            ? "✓ Zero post-cancellation target leakage detected in feature list."
            : `✗ Target leakage detected: ${leaky.join(", ")} must be stripped before training.`,
          `Out-of-time Top-${cap} outreach reaches ${trueChurnersReached} true at-risk accounts (${Math.round(prec * 100)}% Precision@K).`,
          `At ${Math.round(saveRate * 100)}% intervention save rate, expected weekly ARR preserved: ₹${grossSavedInr.toLocaleString("en-IN")}.`,
        ]
        return {
          passed: leaky.length === 0 && prec >= 0.5,
          headline: leaky.length === 0 ? "Out-of-time feature pipeline is leakage-free." : "Pipeline blocked due to post-event target leakage.",
          metrics: [
            { label: "Leaky Features", value: String(leaky.length) },
            { label: "True Churners @ Top-K", value: String(trueChurnersReached) },
            { label: "Expected Weekly ARR Saved", value: `₹${grossSavedInr.toLocaleString("en-IN")}` },
          ],
          diagnostics,
        }
      } catch {
        return {
          passed: false,
          headline: "Invalid JSON configuration. Check syntax and try again.",
          metrics: [],
          diagnostics: ["Could not parse JSON input."],
        }
      }
    },
  },
  "enterprise-rag-evaluation": {
    badge: "Interactive RAG Grounding & Citation Verifier",
    title: "Policy Citation & Prompt-Injection Guardrail Harness",
    subtitle: "Verify that assistant responses cite retrieved [doc_id, section_id] clauses, abstain when context confidence is low, and block prompt injection.",
    sampleLabel: "Retrieved policy chunks & candidate response payload (JSON)",
    defaultInput: JSON.stringify(
      {
        query: "Can an enterprise customer claim a refund 45 days after invoice settlement?",
        minRelevanceThreshold: 0.72,
        retrievedChunks: [
          { doc_id: "SOP-REF-2026", section_id: "4.2", score: 0.86, text: "Enterprise annual invoices are eligible for credit-note review within 30 calendar days of settlement; requests after 30 days require VP Finance exception approval." },
        ],
        candidateAnswer: "Under [SOP-REF-2026, 4.2], standard credit-note review closes at 30 calendar days; a 45-day request requires VP Finance exception approval.",
      },
      null,
      2,
    ),
    evaluate(input: string) {
      try {
        const payload = JSON.parse(input) as {
          query?: string
          minRelevanceThreshold?: number
          retrievedChunks?: Array<{ doc_id: string; section_id: string; score: number; text: string }>
          candidateAnswer?: string
        }
        const chunks = Array.isArray(payload.retrievedChunks) ? payload.retrievedChunks : []
        const threshold = Number(payload.minRelevanceThreshold ?? 0.72)
        const answer = String(payload.candidateAnswer ?? "")
        const topScore = chunks.reduce((max, c) => Math.max(max, Number(c.score ?? 0)), 0)
        const hasInjection = /ignore previous instructions|system override|drop table/i.test(
          chunks.map((c) => c.text).join(" ") + " " + String(payload.query ?? ""),
        )
        const citedIds = chunks.filter((c) => answer.includes(c.doc_id) && answer.includes(c.section_id))

        const diagnostics = [
          hasInjection
            ? "✗ Adversarial prompt-injection pattern detected in retrieved context."
            : "✓ Retrieved context passed indirect prompt-injection filter.",
          topScore >= threshold
            ? `✓ Top chunk relevance (${topScore.toFixed(2)}) meets threshold (${threshold.toFixed(2)}).`
            : `⚠ Top chunk relevance (${topScore.toFixed(2)}) is below ${threshold.toFixed(2)} — assistant must abstain.`,
          citedIds.length > 0
            ? `✓ Grounded citation verified: [${citedIds.map((c) => `${c.doc_id}, ${c.section_id}`).join("; ")}].`
            : "✗ Candidate answer is missing explicit [doc_id, section_id] citation tags.",
        ]
        return {
          passed: !hasInjection && topScore >= threshold && citedIds.length > 0,
          headline:
            !hasInjection && citedIds.length > 0
              ? "Response passed citation grounding and injection guardrails."
              : "Response failed grounding or security verification.",
          metrics: [
            { label: "Top Chunk Score", value: topScore.toFixed(2) },
            { label: "Verified Citations", value: String(citedIds.length) },
            { label: "Injection Guard", value: hasInjection ? "Blocked" : "Clean" },
          ],
          diagnostics,
        }
      } catch {
        return {
          passed: false,
          headline: "Invalid JSON payload. Check syntax and try again.",
          metrics: [],
          diagnostics: ["Could not parse JSON input."],
        }
      }
    },
  },
  "idempotent-ledger-architecture": {
    badge: "Interactive Transactional Ledger & Webhook Replay Simulator",
    title: "Concurrent Webhook Idempotency & Atomic Balance Tester",
    subtitle: "Simulate parallel webhook deliveries and redemption requests against composite unique constraint @@unique([userId, idempotencyKey]).",
    sampleLabel: "Concurrent webhook & spend event stream (JSON)",
    defaultInput: JSON.stringify(
      {
        initialBalance: 0,
        events: [
          { type: "webhook_credit", userId: "usr_101", idempotencyKey: "workshop_reg:evt_99:usr_101", amount: 99 },
          { type: "webhook_credit", userId: "usr_101", idempotencyKey: "workshop_reg:evt_99:usr_101", amount: 99 },
          { type: "webhook_credit", userId: "usr_101", idempotencyKey: "workshop_reg:evt_99:usr_101", amount: 99 },
          { type: "resource_spend", userId: "usr_101", idempotencyKey: "spend:usr_101:case_blinkit", amount: -99 },
          { type: "resource_spend", userId: "usr_101", idempotencyKey: "spend:usr_101:case_swiggy", amount: -99 },
        ],
      },
      null,
      2,
    ),
    evaluate(input: string) {
      try {
        const data = JSON.parse(input) as {
          initialBalance?: number
          events?: Array<{ type: string; userId: string; idempotencyKey: string; amount: number }>
        }
        let balance = Number(data.initialBalance ?? 0)
        const keys = new Set<string>()
        let committed = 0
        let replays = 0
        let rejected = 0
        const diagnostics: string[] = []

        for (const ev of data.events ?? []) {
          const composite = `${ev.userId}:${ev.idempotencyKey}`
          if (keys.has(composite)) {
            replays += 1
            diagnostics.push(`P2002 Replay Caught (${ev.idempotencyKey}) → 200 OK idempotent no-op (balance stays ${balance})`)
            continue
          }
          if (ev.amount < 0 && balance + ev.amount < 0) {
            rejected += 1
            diagnostics.push(`InsufficientElixirError (${ev.idempotencyKey}) → 409 Rolled back (balance ${balance} < ${Math.abs(ev.amount)})`)
            continue
          }
          keys.add(composite)
          balance += ev.amount
          committed += 1
          diagnostics.push(`Committed (${ev.idempotencyKey}): ${ev.amount > 0 ? `+${ev.amount}` : ev.amount} Elixir → balance = ${balance}`)
        }

        return {
          passed: committed > 0 && replays > 0 && balance >= 0,
          headline: `Atomic ledger invariant held: final balance = ${balance} Elixir (${replays} duplicate webhooks neutralized, ${rejected} overdrafts rolled back).`,
          metrics: [
            { label: "Final Wallet Balance", value: `${balance} Elixir` },
            { label: "P2002 Replays Neutralized", value: String(replays) },
            { label: "Overdrafts Rolled Back", value: String(rejected) },
          ],
          diagnostics,
        }
      } catch {
        return {
          passed: false,
          headline: "Invalid JSON event stream. Check syntax and try again.",
          metrics: [],
          diagnostics: ["Could not parse JSON input."],
        }
      }
    },
  },
}

export default function TrackInteractiveSandbox({ projectType }: { projectType: string }) {
  const preset = SANDBOX_PRESETS[projectType]
  const [input, setInput] = useState(preset?.defaultInput ?? "")
  const [result, setResult] = useState<ReturnType<SandboxPreset["evaluate"]> | null>(() =>
    preset ? preset.evaluate(preset.defaultInput) : null,
  )

  if (!preset) return null

  return (
    <div
      className="track-interactive-sandbox"
      style={{
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        background: "rgba(15, 23, 42, 0.03)",
        border: "1px solid rgba(15, 23, 42, 0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="os-eyebrow" style={{ margin: 0 }}>{preset.badge}</span>
        <button
          type="button"
          className="os-btn os-btn-ghost"
          onClick={() => {
            setInput(preset.defaultInput)
            setResult(preset.evaluate(preset.defaultInput))
          }}
        >
          Reset test vector
        </button>
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{preset.title}</h3>
      <p className="lab-note" style={{ marginTop: 0, marginBottom: 10 }}>{preset.subtitle}</p>
      <label htmlFor={`sandbox-input-${projectType}`} style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {preset.sampleLabel}
      </label>
      <textarea
        id={`sandbox-input-${projectType}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 12.5,
          padding: 10,
          borderRadius: 8,
          border: "1px solid rgba(15, 23, 42, 0.16)",
          marginBottom: 10,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button type="button" className="os-btn os-btn-primary" onClick={() => setResult(preset.evaluate(input))}>
          Run verification check
        </button>
        {result ? (
          <span className={result.passed ? "os-status is-done" : "os-status"}>
            {result.passed ? "Checks Passed" : "Needs Attention"}
          </span>
        ) : null}
      </div>
      {result ? (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <strong style={{ display: "block", fontSize: 13, marginBottom: 8 }}>{result.headline}</strong>
          {result.metrics.length > 0 ? (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              {result.metrics.map((m) => (
                <div key={m.label} style={{ fontSize: 12 }}>
                  <span style={{ opacity: 0.75 }}>{m.label}: </span>
                  <strong>{m.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
            {result.diagnostics.map((d, idx) => (
              <li key={idx}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export { SANDBOX_PRESETS, TrackInteractiveSandbox }
