import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { downloadCourseCertificate, fetchCertificateState } from "../../lib/lms-api"
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
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
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

      {state.certificateEligible && (
        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <button
            type="button"
            className="lms-certificate-panel__download"
            disabled={downloading}
            onClick={() => {
              setDownloadError(null)
              setDownloading(true)
              void downloadCourseCertificate(courseSlug)
                .then((blob) => {
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `${courseSlug}-certificate.pdf`
                  link.click()
                  URL.revokeObjectURL(url)
                })
                .catch((err: unknown) => {
                  setDownloadError(err instanceof Error ? err.message : "Certificate download failed")
                })
                .finally(() => setDownloading(false))
            }}
            style={{
              background: accent.primary,
              border: "none",
              color: C.black,
              padding: "10px 18px",
              borderRadius: T.rControl,
              fontSize: 13,
              fontWeight: 600,
              cursor: downloading ? "wait" : "pointer",
            }}
          >
            {downloading ? "Preparing…" : "Download certificate"}
          </button>
          {downloadError && (
            <p role="alert" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, margin: "10px 0 0" }}>
              {downloadError}
            </p>
          )}
        </div>
      )}

      <Link to={`/learn/${courseSlug}/${lessonId}`} style={{ color: accent.text, fontSize: 13, textDecoration: "none" }}>
        Resume course →
      </Link>
    </div>
  )
}
