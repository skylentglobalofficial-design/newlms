import { useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { InterviewPractice, InterviewQuestion } from "../../lib/career-api"
import { createPracticeRecord } from "../../lib/career-api"
import { formatInterviewDateTime } from "./interview-utils"
import { FeedbackBanner, Field, fieldInputStyle, primaryButtonStyle } from "./section-ui"

const accent = getDomainAccent("career")

type Props = {
  practice: InterviewPractice[]
  questions: InterviewQuestion[]
  selectedQuestionId: string | null
  selectedRoundId: string | null
  onPracticeAdded: (record: InterviewPractice) => void
}

export default function InterviewPracticeSurface({
  practice,
  questions,
  selectedQuestionId,
  selectedRoundId,
  onPracticeAdded,
}: Props) {
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState("")
  const [pending, setPending] = useState(false)
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const questionMap = new Map(questions.map(q => [q.id, q]))
  const filteredHistory = selectedRoundId
    ? practice.filter(p => p.interviewRoundId === selectedRoundId)
    : practice

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedQuestionId && !answer.trim()) return
    setPending(true)
    setBanner(null)
    try {
      const parsedScore = score.trim() ? Number(score) : null
      if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
        throw new Error("Score must be between 0 and 100")
      }
      const record = await createPracticeRecord({
        questionId: selectedQuestionId,
        interviewRoundId: selectedRoundId,
        answer: answer.trim() || null,
        score: parsedScore,
        feedback: feedback.trim() || null,
      })
      onPracticeAdded(record)
      setAnswer("")
      setFeedback("")
      setScore("")
      setBanner({ tone: "success", message: "Practice attempt saved." })
    } catch (err) {
      setBanner({ tone: "error", message: err instanceof Error ? err.message : "Failed to save practice" })
    } finally {
      setPending(false)
    }
  }

  return (
    <section style={{ minWidth: 0 }}>
      <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
        Practice
      </h2>

      {banner && <FeedbackBanner tone={banner.tone} message={banner.message} />}

      <form
        onSubmit={e => void handleSubmit(e)}
        style={{
          marginBottom: 20,
          padding: "16px",
          borderRadius: T.rControl,
          border: `1px solid ${T.lineDark}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {!selectedQuestionId && (
          <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
            Select a question above to link this practice attempt, or write a free-form response.
          </p>
        )}
        <Field label="Your response">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={5}
            style={{ ...fieldInputStyle, resize: "vertical" }}
            placeholder="Write your practice answer here"
            maxLength={8000}
          />
        </Field>
        <Field label="Self-assessed score (0–100, optional)">
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={e => setScore(e.target.value)}
            style={{ ...fieldInputStyle, marginTop: 12, maxWidth: 120 }}
          />
        </Field>
        <Field label="Notes / feedback (optional)">
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={2}
            style={{ ...fieldInputStyle, marginTop: 12, resize: "vertical" }}
            maxLength={4000}
          />
        </Field>
        <button
          type="submit"
          disabled={pending || (!answer.trim() && !selectedQuestionId)}
          style={{ ...primaryButtonStyle, marginTop: 14 }}
        >
          {pending ? "Saving…" : "Save practice attempt"}
        </button>
      </form>

      <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>
        {selectedRoundId ? "Practice for this round" : "Practice history"}
      </h3>

      {filteredHistory.length === 0 ? (
        <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
          No practice attempts yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredHistory.map(record => {
            const question = record.questionId ? questionMap.get(record.questionId) : null
            return (
              <div
                key={record.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: T.rControl,
                  border: `1px solid ${T.lineDark}`,
                  background: "rgba(255,255,255,0.02)",
                  minWidth: 0,
                }}
              >
                <div style={{ fontSize: 12, color: accent.text, marginBottom: 6 }}>
                  {formatInterviewDateTime(record.practicedAt)}
                  {record.score !== null ? ` · Score ${record.score}` : ""}
                </div>
                {question && (
                  <div style={{ color: C.white, fontWeight: 600, fontSize: 13.5, marginBottom: 6, wordBreak: "break-word" }}>
                    {question.question}
                  </div>
                )}
                {record.answer && (
                  <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.58)", fontSize: 13.5, lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                    {record.answer}
                  </p>
                )}
                {record.feedback && (
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.42)", fontSize: 12.5, lineHeight: 1.5, wordBreak: "break-word" }}>
                    Notes: {record.feedback}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
