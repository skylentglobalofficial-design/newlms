import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { T } from "../../tokens"
import { fetchCertificateState } from "../../lib/lms-api"
import { LmsInlineEmpty } from "./LmsEmptyState"

type Accent = { primary: string; text: string; border: string; subtle: string }

export default function CertificatePanel({
  courseSlug,
  lessonId,
  accent,
}: {
  courseSlug: string
  lessonId: string
  accent: Accent
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<Awaited<ReturnType<typeof fetchCertificateState>> | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchCertificateState(courseSlug)
      .then((data) => {
        if (!cancelled) setState(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState(null)
          setError(err instanceof Error ? err.message : "Failed to load certificate status")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [courseSlug])

  if (loading) {
    return <LmsInlineEmpty>Loading certificate status…</LmsInlineEmpty>
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        {error}
      </p>
    )
  }

  if (!state) return null

  const incomplete = state.requirements.filter((item) => !item.complete)

  return (
    <div className="lms-certificate-panel">
      {state.certificateEligible ? (
        <p className="lms-certificate-panel__status">
          You are eligible for a certificate. Status: <strong>{state.certificateStatus}</strong>.
        </p>
      ) : state.allComplete ? (
        <p className="lms-certificate-panel__status">
          Course complete — certificate eligibility is being finalized.
        </p>
      ) : (
        <p className="lms-certificate-panel__status">
          Complete all lessons to unlock certificate eligibility.
        </p>
      )}

      {incomplete.length > 0 && (
        <ul className="lms-certificate-panel__requirements">
          {incomplete.slice(0, 4).map((item) => (
            <li key={item.lessonKey}>{item.title}</li>
          ))}
          {incomplete.length > 4 && (
            <li>+ {incomplete.length - 4} more lessons</li>
          )}
        </ul>
      )}

      <p className="lms-certificate-panel__soon">
        Certificate download and verification are not available yet. This panel reflects real completion requirements from your enrollment.
      </p>

      <Link to={`/learn/${courseSlug}/${lessonId}`} style={{ color: accent.text, fontSize: 13, textDecoration: "none" }}>
        Resume course →
      </Link>
    </div>
  )
}
