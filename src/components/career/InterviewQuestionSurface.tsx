import type { CSSProperties } from "react"
import { useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { InterviewQuestion, InterviewQuestionDifficulty } from "../../lib/career-api"
import { formatDifficulty } from "./interview-utils"

const accent = getDomainAccent("career")

type Props = {
  questions: InterviewQuestion[]
  categories: string[]
  difficultyFilter: InterviewQuestionDifficulty | "ALL"
  categoryFilter: string
  onDifficultyChange: (value: InterviewQuestionDifficulty | "ALL") => void
  onCategoryChange: (value: string) => void
  selectedQuestionId: string | null
  onSelectQuestion: (id: string) => void
}

const DIFFICULTIES: InterviewQuestionDifficulty[] = ["EASY", "MEDIUM", "HARD"]

export default function InterviewQuestionSurface({
  questions,
  categories,
  difficultyFilter,
  categoryFilter,
  onDifficultyChange,
  onCategoryChange,
  selectedQuestionId,
  onSelectQuestion,
}: Props) {
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const selected = questions.find(q => q.id === selectedQuestionId) ?? null

  return (
    <section style={{ minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
          Practice questions
        </h2>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <select
          value={difficultyFilter}
          onChange={e => onDifficultyChange(e.target.value as InterviewQuestionDifficulty | "ALL")}
          style={filterStyle}
          aria-label="Filter by difficulty"
        >
          <option value="ALL">All difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{formatDifficulty(d)}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          style={filterStyle}
          aria-label="Filter by category"
        >
          <option value="ALL">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {questions.length === 0 ? (
        <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
          No interview questions are available yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "min(48vh, 420px)", overflowY: "auto" }}>
          {questions.map(q => {
            const active = q.id === selectedQuestionId
            const revealed = revealedId === q.id
            return (
              <div
                key={q.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: T.rControl,
                  border: `1px solid ${active ? accent.border : T.lineDark}`,
                  background: active ? accent.subtle : "rgba(255,255,255,0.02)",
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: accent.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {q.category} · {formatDifficulty(q.difficulty)}
                    {q.roleTag ? ` · ${q.roleTag}` : ""}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setRevealedId(revealed ? null : q.id)} style={chipButtonStyle}>
                      {revealed ? "Hide" : "View"}
                    </button>
                    <button type="button" onClick={() => onSelectQuestion(q.id)} style={{ ...chipButtonStyle, borderColor: active ? accent.border : T.lineDark }}>
                      {active ? "Selected" : "Practice"}
                    </button>
                  </div>
                </div>
                {revealed && (
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.7, wordBreak: "break-word" }}>
                    {q.question}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: T.rControl, border: `1px solid ${accent.border}`, background: accent.subtle }}>
          <div style={{ fontSize: 11, color: accent.text, marginBottom: 6 }}>Selected for practice</div>
          <p style={{ margin: 0, color: C.white, fontSize: 14, lineHeight: 1.7, wordBreak: "break-word" }}>{selected.question}</p>
        </div>
      )}
    </section>
  )
}

const filterStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: T.rControl,
  border: `1px solid ${T.lineDark}`,
  background: "rgba(255,255,255,0.04)",
  color: C.white,
  fontSize: 13,
  fontFamily: "var(--font-body)",
}

const chipButtonStyle: CSSProperties = {
  padding: "5px 10px",
  borderRadius: T.rControl,
  border: `1px solid ${T.lineDark}`,
  background: "transparent",
  color: "rgba(255,255,255,0.65)",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}
