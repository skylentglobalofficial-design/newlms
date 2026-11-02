import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export type ToolBadgeId =
  | "sql"
  | "python"
  | "react"
  | "node"
  | "postgres"
  | "genai"
  | "prd"
  | "sheets"
  | "cohort"
  | "pytest"
  | "rag"
  | "typescript"

const TOOL_META: Record<
  ToolBadgeId,
  { label: string; bg: string; border: string; text: string; dot: string; icon: ReactNode }
> = {
  sql: {
    label: "SQL & Joins",
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1d4ed8",
    dot: "#2563eb",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    ),
  },
  postgres: {
    label: "PostgreSQL",
    bg: "#eef2ff",
    border: "#c7d2fe",
    text: "#3730a3",
    dot: "#4f46e5",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  python: {
    label: "Python 3",
    bg: "#fefce8",
    border: "#fde047",
    text: "#854d0e",
    dot: "#ca8a04",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  pytest: {
    label: "ETL & Pytest",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    text: "#065f46",
    dot: "#10b981",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  react: {
    label: "React 19",
    bg: "#ecfeff",
    border: "#a5f3fc",
    text: "#155e75",
    dot: "#06b6d4",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="2.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-30 12 12)" />
      </svg>
    ),
  },
  typescript: {
    label: "TypeScript",
    bg: "#eff6ff",
    border: "#93c5fd",
    text: "#1e40af",
    dot: "#2563eb",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10h6M11 10v7" />
      </svg>
    ),
  },
  node: {
    label: "Node & Express",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#166534",
    dot: "#16a34a",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="7" rx="2" />
        <rect x="2" y="14" width="20" height="7" rx="2" />
        <circle cx="6" cy="6.5" r="1" />
        <circle cx="6" cy="17.5" r="1" />
      </svg>
    ),
  },
  genai: {
    label: "LLM Architecture",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    text: "#5b21b6",
    dot: "#7c3aed",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
      </svg>
    ),
  },
  rag: {
    label: "Grounded RAG",
    bg: "#faf5ff",
    border: "#e9d5ff",
    text: "#6b21a8",
    dot: "#9333ea",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  prd: {
    label: "PRD & Roadmaps",
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#92400e",
    dot: "#d97706",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
  sheets: {
    label: "Spreadsheets & BI",
    bg: "#f0fdfa",
    border: "#99f6e4",
    text: "#115e59",
    dot: "#0d9488",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  cohort: {
    label: "Cohort & Churn ML",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    text: "#9d174d",
    dot: "#db2777",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
}

export function ToolStackPills({ tools }: { tools: readonly ToolBadgeId[] }) {
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {tools.map((id) => {
        const meta = TOOL_META[id]
        if (!meta) return null
        return (
          <span
            key={id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              color: meta.text,
              lineHeight: 1.3,
            }}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </span>
        )
      })}
    </span>
  )
}

export const TRACK_ROLE_METADATA: Record<
  string,
  {
    roles: string
    pace: string
    tools: readonly ToolBadgeId[]
    accent: string
    workbenchTag: string
    codePreview: string
    metricBadge: string
  }
> = {
  "data-analytics": {
    roles: "Data Analyst · BI Analyst · Commercial Analyst",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["sql", "sheets", "postgres"],
    accent: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    workbenchTag: "SQL WORKBENCH · 166 VALID ROWS",
    codePreview: "SELECT category, ROUND(SUM(net_rev)) FROM northwind_sales GROUP BY 1;",
    metricBadge: "₹8,12,020 Net Revenue Audited",
  },
  "data-analytics-pro": {
    roles: "Data Analyst · BI Analyst · Commercial Analyst",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["sql", "sheets", "postgres"],
    accent: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    workbenchTag: "SQL WORKBENCH · 166 VALID ROWS",
    codePreview: "SELECT category, ROUND(SUM(net_rev)) FROM northwind_sales GROUP BY 1;",
    metricBadge: "₹8,12,020 Net Revenue Audited",
  },
  "product-management": {
    roles: "Product Manager · Associate PM · Growth PM",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["prd", "sheets", "cohort"],
    accent: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
    workbenchTag: "HARBOR DESK STUDIO · 18 INTERVIEWS",
    codePreview: "PRD Bet: 2 Engineers · 6 Weeks · Weekend Exception Triage Queue",
    metricBadge: "12 Retail Stores Scoped",
  },
  "python-programming": {
    roles: "Python Developer · Data Engineer · Automation Engineer",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["python", "pytest", "sql"],
    accent: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
    workbenchTag: "PYTHON 3 ETL · PYTEST HARNESS",
    codePreview: "def reconcile_settlements(rows: list[Tx]) -> AuditReport:",
    metricBadge: "100% Schema & Pytest Verified",
  },
  "data-science-ai": {
    roles: "Data Scientist · Decision Scientist · ML Analyst",
    pace: "6–8 Weeks · Dual Track (30 Lessons)",
    tools: ["python", "sql", "cohort"],
    accent: "linear-gradient(135deg, #311042 0%, #701a75 100%)",
    workbenchTag: "COHORT & CHURN LAB · OUT-OF-TIME SPLIT",
    codePreview: "split_out_of_time(df, cutoff='2026-04-01', zero_leakage=True)",
    metricBadge: "SQL + Python Dual Pathway",
  },
  "generative-ai": {
    roles: "AI Engineer · LLM Systems Developer · Applied AI Lead",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["genai", "rag", "python"],
    accent: "linear-gradient(135deg, #2e1065 0%, #5b21b6 100%)",
    workbenchTag: "GROUNDED RAG · CITATION GATE",
    codePreview: "enforce_citations(chunks, min_similarity=0.82, abstain_on_miss=True)",
    metricBadge: "0% Ungrounded Refund Claims",
  },
  "generative-ai-program": {
    roles: "AI Engineer · LLM Systems Developer · Applied AI Lead",
    pace: "4–6 Weeks · Self-Paced",
    tools: ["genai", "rag", "python"],
    accent: "linear-gradient(135deg, #2e1065 0%, #5b21b6 100%)",
    workbenchTag: "GROUNDED RAG · CITATION GATE",
    codePreview: "enforce_citations(chunks, min_similarity=0.82, abstain_on_miss=True)",
    metricBadge: "0% Ungrounded Refund Claims",
  },
  "full-stack": {
    roles: "Full-Stack Developer · Backend Engineer · Product Engineer",
    pace: "5–7 Weeks · Self-Paced",
    tools: ["react", "typescript", "node", "postgres"],
    accent: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
    workbenchTag: "IDEMPOTENT LEDGER · ACID API",
    codePreview: "SELECT * FROM ledger_tx WHERE idempotency_key = $1 FOR UPDATE;",
    metricBadge: "Zero Double-Spend Race Conditions",
  },
  "full-stack-web": {
    roles: "Full-Stack Developer · Backend Engineer · Product Engineer",
    pace: "5–7 Weeks · Self-Paced",
    tools: ["react", "typescript", "node", "postgres"],
    accent: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
    workbenchTag: "IDEMPOTENT LEDGER · ACID API",
    codePreview: "SELECT * FROM ledger_tx WHERE idempotency_key = $1 FOR UPDATE;",
    metricBadge: "Zero Double-Spend Race Conditions",
  },
}

/**
 * Distinct discipline visual banner rendered inside track cards so 6 cards never look like duplicate stock photos.
 */
export function TrackWorkbenchOverlay({ slug }: { slug: string }) {
  const meta = TRACK_ROLE_METADATA[slug] ?? TRACK_ROLE_METADATA["data-analytics"]
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 14px",
        background: "#0f172a",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        color: "#f8fafc",
      }}
    >
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#a5b4fc",
          textTransform: "uppercase",
        }}
      >
        <span>{meta.workbenchTag}</span>
        <span style={{ color: "#34d399" }}>● LIVE LAB</span>
      </span>
      <code
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono, monospace)",
          color: "#e2e8f0",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {meta.codePreview}
      </code>
    </span>
  )
}

export function TargetRolesBadge({ slug }: { slug: string }) {
  const meta = TRACK_ROLE_METADATA[slug]
  if (!meta) return null
  return (
    <span
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#334155",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        padding: "5px 9px",
        marginTop: 6,
      }}
    >
      <strong style={{ color: "#4f46e5" }}>Target Roles:</strong> {meta.roles}
    </span>
  )
}

/**
 * Shareable Cryptographic Diploma & Proof-of-Work Preview Card used on Programme and Course pages.
 */
export function ShareableCredentialPreviewCard({
  courseTitle,
  capstoneTitle,
  skills,
  codeExample = "SKL-2026-PGM-VERIFIED",
}: {
  courseTitle: string
  capstoneTitle: string
  skills: readonly string[]
  codeExample?: string
}) {
  return (
    <div
      style={{
        marginTop: 28,
        borderRadius: 16,
        border: "2px solid #fbbf24",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        color: "#f8fafc",
        padding: "24px 28px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
      }}
      aria-label="Verifiable Proof-of-Work Credential Preview"
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.14)", paddingBottom: 14 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#fbbf24", textTransform: "uppercase", display: "block" }}>
            SKYLENT GLOBAL PVT. LTD. · CRYPTOGRAPHIC CREDENTIAL
          </span>
          <strong style={{ fontSize: 18, color: "#ffffff" }}>
            {courseTitle} — Master Proof-of-Work Diploma
          </strong>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(16, 185, 129, 0.18)",
            border: "1px solid #34d399",
            color: "#6ee7b7",
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          ✓ PUBLICLY VERIFIABLE AT /VERIFY
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 18, alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Verified Capstone Attached to Credential
          </p>
          <p style={{ margin: "4px 0 10px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
            {capstoneTitle}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: 11.5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "#cbd5e1" }}>Credential ID</span>
            <code style={{ color: "#fbbf24", fontWeight: 700 }}>{codeExample}</code>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
            <span style={{ color: "#cbd5e1" }}>Rubric Evaluation</span>
            <strong style={{ color: "#34d399" }}>25% · 35% · 40% Passed</strong>
          </div>
          <Link
            to="/verify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#fbbf24",
              textDecoration: "none",
            }}
          >
            Inspect live exemplar dossiers at skylent.live/verify →
          </Link>
        </div>
      </div>
    </div>
  )
}
