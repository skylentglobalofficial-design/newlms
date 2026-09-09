import { C, T } from "../../tokens"

export default function LockedLessonState({
  lessonTitle,
  requiredLessonTitle,
  accent,
}: {
  lessonTitle: string
  requiredLessonTitle?: string | null
  accent: { primary: string; subtle: string; border: string; text: string }
}) {
  return (
    <div
      className="lms-lesson-locked lms-activity-surface"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: accent.subtle,
        border: `1px solid ${accent.border}`,
        borderRadius: T.rCard,
      }}
    >
      <div style={{ color: accent.text, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 12 }}>
        LESSON LOCKED
      </div>
      <div style={{ color: C.white, fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{lessonTitle}</div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 420, marginInline: "auto" }}>
        {requiredLessonTitle
          ? `Complete "${requiredLessonTitle}" to unlock this lesson.`
          : "Complete the previous lesson to unlock this content."}
      </p>
    </div>
  )
}
