/**
 * The dark "presentation" panel at the top of a written lesson (repolish, per the LMS reference:
 * a black video / slide area inside the white workspace). It shows the lesson's own authored
 * metadata (title, objective and key concepts from src/content/*). It is not a video and does
 * not pretend to be one; lessons that do have a video keep their player in the lesson body.
 */
import { getLessonMeta } from "../../content/course-lookups"

export default function LessonSlide({
  courseSlug,
  lessonId,
  title,
  kicker,
}: {
  courseSlug: string
  lessonId: string
  title: string
  kicker: string
}) {
  const meta = getLessonMeta(courseSlug, lessonId)
  // The objective is shown in the lesson's spec rows just below, so the slide carries title and concepts only.
  const concepts = meta?.concepts?.slice(0, 5) ?? []
  return (
    <section className="os-slide" aria-label="Lesson overview">
      {/* The lesson's h1 follows (visually hidden while this slide shows the title). */}
      <div className="os-slide__frame">
        <p className="os-slide__kicker">{kicker}</p>
        <p className="os-slide__title" aria-hidden="true">{title}</p>
        {concepts.length ? (
          <ul className="os-slide__concepts" aria-label="Key concepts">
            {concepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
        ) : null}
        <span className="os-slide__brand" aria-hidden="true">
          Skylent
        </span>
      </div>
    </section>
  )
}
