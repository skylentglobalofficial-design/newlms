export default function LockedLessonState({
  lessonTitle,
  requiredLessonTitle,
  continueTitle,
  onContinue,
}: {
  lessonTitle: string
  requiredLessonTitle?: string | null
  continueTitle?: string | null
  onContinue?: () => void
  accent?: { primary: string; subtle: string; border: string; text: string }
}) {
  return (
    <div className="os-locked">
      <p className="os-eyebrow">Locked</p>
      <h2>{lessonTitle}</h2>
      <p className="os-lead">
        {requiredLessonTitle
          ? `Complete “${requiredLessonTitle}” to unlock this lesson.`
          : 'Complete the previous lesson to unlock this content.'}
      </p>
      {continueTitle && onContinue ? (
        <div className="os-actions">
          <button type="button" className="os-btn os-btn-primary" onClick={onContinue}>
            Go to {continueTitle}
          </button>
        </div>
      ) : null}
    </div>
  )
}
