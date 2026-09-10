import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ApiLessonPractice } from '../../lib/lms-api'
import { getAdjacentLessons } from './lms-utils'
import type { CourseLesson } from '../../data'

type Accent = { primary: string; subtle: string; border: string; text: string }

export default function LessonPracticeSurface({
  practice,
  accent,
  lessonHref,
  nextLesson,
  nextHref,
}: {
  practice: ApiLessonPractice
  accent: Accent
  lessonHref: string
  nextLesson: CourseLesson | null
  nextHref: string | null
}) {
  const groupId = useId()
  const feedbackId = useId()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const selected = practice.options.find((option) => option.id === selectedId) ?? null
  const preferred = practice.options.find((option) => option.id === practice.preferredOptionKey) ?? null
  const showFeedback = revealed && selected

  function handleSelect(optionId: string) {
    if (revealed) return
    setSelectedId(optionId)
    setRevealed(true)
  }

  function handleRetry() {
    setSelectedId(null)
    setRevealed(false)
  }

  return (
    <article className="lms-practice-article">
      <header className="lms-practice-context">
        <p className="lms-lesson-crumb">
          <span>{practice.courseTitle}</span>
          <span aria-hidden="true"> → </span>
          <span>{practice.moduleTitle}</span>
          <span aria-hidden="true"> → </span>
          <span>{practice.lessonTitle}</span>
        </p>
        <p className="lms-practice-kicker">Practice</p>
        <p className="lms-practice-brief">{practice.context}</p>
        <h1 className="lms-practice-task" id={`${groupId}-task`}>
          {practice.task}
        </h1>
      </header>

      <div className="lms-practice-panel">
        <fieldset
          className="lms-practice-options"
          disabled={revealed}
          aria-describedby={showFeedback ? feedbackId : undefined}
        >
          <legend className="lms-practice-legend" id={`${groupId}-task-legend`}>
            Choose one response
          </legend>
          {practice.options.map((option) => {
            const isSelected = selectedId === option.id
            const isPreferred = revealed && option.id === practice.preferredOptionKey
            return (
              <label
                key={option.id}
                className={`lms-practice-option${isSelected ? ' is-selected' : ''}${isPreferred ? ' is-preferred' : ''}`}
              >
                <input
                  type="radio"
                  name={`${groupId}-practice`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelect(option.id)}
                  disabled={revealed}
                  aria-describedby={showFeedback && isSelected ? feedbackId : undefined}
                />
                <span className="lms-practice-option-mark" aria-hidden="true" />
                <span className="lms-practice-option-label">{option.label}</span>
                {isPreferred ? <span className="lms-practice-preferred-tag">Strongest first move</span> : null}
              </label>
            )
          })}
        </fieldset>

        {showFeedback ? (
          <div className="lms-practice-feedback" id={feedbackId} role="status" aria-live="polite">
            <p className="lms-practice-feedback-kicker">
              {selected.id === practice.preferredOptionKey ? 'Why this is strongest' : 'What this choice misses'}
            </p>
            <p className="lms-practice-feedback-body">{selected.teachingFeedback}</p>
            {preferred && selected.id !== preferred.id ? (
              <p className="lms-practice-feedback-alt">
                Strongest first move: <strong>{preferred.label}</strong>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="lms-practice-actions">
          {revealed ? (
            <button type="button" className="lms-practice-retry" onClick={handleRetry}>
              Try again
            </button>
          ) : null}
          <Link to={lessonHref} className="lms-practice-back">
            Back to lesson
          </Link>
          {revealed && nextLesson && nextHref ? (
            <Link
              to={nextHref}
              className="lms-practice-next"
              style={{ borderColor: accent.border, background: accent.subtle, color: accent.text }}
            >
              Next lesson
              <strong>{nextLesson.title}</strong>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function getPracticeNextLesson(
  lessons: CourseLesson[],
  currentLessonId: string,
): CourseLesson | null {
  const { next } = getAdjacentLessons(lessons, currentLessonId)
  return next
}
