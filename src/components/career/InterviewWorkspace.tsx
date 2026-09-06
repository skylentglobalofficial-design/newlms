import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import { useInterviews } from "../../hooks/useInterviews"
import InterviewRoundRail from "./InterviewRoundRail"
import InterviewQuestionSurface from "./InterviewQuestionSurface"
import InterviewPracticeSurface from "./InterviewPracticeSurface"
import { formatInterviewDateTime, formatRoundStatus, formatRoundType } from "./interview-utils"
import { EmptyBlock, FeedbackBanner, LoadingBlock } from "./section-ui"

const accent = getDomainAccent("career")

export default function InterviewWorkspace() {
  const board = useInterviews()
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  useEffect(() => {
    if (board.rounds.length && !selectedRoundId) {
      setSelectedRoundId(board.rounds[0].id)
    }
  }, [board.rounds, selectedRoundId])

  const selectedRound = board.rounds.find(r => r.id === selectedRoundId) ?? null

  return (
    <div className="interview-workspace" style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
          Interview prep
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
          See your interview rounds, practice questions, and track your preparation.
        </p>
      </div>

      {board.error && (
        <div style={{ marginBottom: 16 }}>
          <FeedbackBanner tone="error" message={board.error} />
          <button type="button" onClick={() => void board.reload()} style={{ marginTop: 10, padding: "9px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "transparent", color: accent.text, fontSize: 13, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {board.loading ? (
        <LoadingBlock label="Loading interview workspace…" />
      ) : (
        <div className="interview-workspace-layout" style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
          gap: "clamp(16px, 2vw, 24px)",
          alignItems: "start",
        }}>
          <aside style={{ minWidth: 0 }}>
            <InterviewRoundRail
              rounds={board.rounds}
              selectedId={selectedRoundId}
              onSelect={setSelectedRoundId}
            />
          </aside>

          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {selectedRound ? (
              <GlassSurface level={2} padding="18px 20px">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: C.white, wordBreak: "break-word" }}>
                      {selectedRound.title}
                    </h2>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13.5 }}>
                      {formatRoundType(selectedRound.type)} · {formatRoundStatus(selectedRound.status)}
                      {selectedRound.scheduledAt ? ` · ${formatInterviewDateTime(selectedRound.scheduledAt)}` : ""}
                    </p>
                    {selectedRound.applicationId && (
                      <Link
                        to={`/career-os/app/applications/${selectedRound.applicationId}`}
                        style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 12.5, textDecoration: "none" }}
                      >
                        View linked application →
                      </Link>
                    )}
                  </div>
                  <Link
                    to={`/career-os/app/interviews/${selectedRound.id}`}
                    style={{ color: accent.text, fontSize: 13, textDecoration: "none", fontWeight: 600, flexShrink: 0 }}
                  >
                    Open round →
                  </Link>
                </div>
                {selectedRound.notes && (
                  <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>
                    {selectedRound.notes}
                  </p>
                )}
              </GlassSurface>
            ) : board.rounds.length === 0 ? null : (
              <EmptyBlock message="Select an interview round to prepare." />
            )}

            <GlassSurface level={2} padding="18px 20px">
              <InterviewQuestionSurface
                questions={board.filteredQuestions}
                categories={board.categories}
                difficultyFilter={board.difficultyFilter}
                categoryFilter={board.categoryFilter}
                onDifficultyChange={board.setDifficultyFilter}
                onCategoryChange={board.setCategoryFilter}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
              />
            </GlassSurface>

            <GlassSurface level={2} padding="18px 20px">
              <InterviewPracticeSurface
                practice={board.practice}
                questions={board.questions}
                selectedQuestionId={selectedQuestionId}
                selectedRoundId={selectedRoundId}
                onPracticeAdded={record => board.setPractice(prev => [record, ...prev])}
              />
            </GlassSurface>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .interview-workspace-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
