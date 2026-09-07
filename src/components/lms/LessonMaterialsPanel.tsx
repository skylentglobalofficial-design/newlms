import { useEffect, useState } from "react"
import { C, T } from "../../tokens"
import { downloadLessonMaterial, fetchLessonMaterials, type LessonMaterial } from "../../lib/lesson-materials-api"

type Accent = { primary: string; subtle: string; border: string; text: string }

function formatFileSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`
  if (byteSize < 1024 * 1024) return `${Math.round(byteSize / 1024)} KB`
  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`
}

function unavailableLabel(material: LessonMaterial): string {
  if (material.uploadStatus === "FAILED") return "Unavailable (upload failed)"
  if (material.uploadStatus === "PENDING") return "Unavailable (storage pending)"
  return "Unavailable (file not in storage)"
}

export default function LessonMaterialsPanel({
  courseSlug,
  lessonKey,
  accent,
}: {
  courseSlug: string
  lessonKey: string
  accent: Accent
}) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchLessonMaterials(courseSlug, lessonKey)
      .then((items) => {
        if (!cancelled) setMaterials(items)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMaterials([])
          setError(err instanceof Error ? err.message : "Failed to load materials")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [courseSlug, lessonKey])

  async function handleDownload(material: LessonMaterial) {
    setDownloadingId(material.id)
    setDownloadError(null)
    try {
      await downloadLessonMaterial(material)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rCard, padding: 16 }}>
      <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Materials</div>
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>Loading materials…</p>
      ) : error ? (
        <p role="alert" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
          {error}
        </p>
      ) : materials.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
          No materials have been published for this lesson yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {materials.map((material) => (
            <div
              key={material.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: T.rControl,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${T.lineDark}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.white, fontSize: 13, fontWeight: 600, wordBreak: "break-word" }}>{material.fileName}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "var(--font-mono)", marginTop: 4 }}>
                  {formatFileSize(material.byteSize)}
                </div>
              </div>
              {material.downloadUrl ? (
                <button
                  type="button"
                  disabled={downloadingId === material.id}
                  onClick={() => { void handleDownload(material) }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${accent.border}`,
                    color: accent.text,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: T.rControl,
                    cursor: downloadingId === material.id ? "wait" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {downloadingId === material.id ? "Downloading…" : "Download"}
                </button>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                  {unavailableLabel(material)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {downloadError && (
        <p role="alert" style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, margin: "10px 0 0" }}>
          {downloadError}
        </p>
      )}
    </div>
  )
}
