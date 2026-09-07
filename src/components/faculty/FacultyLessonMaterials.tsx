import { useEffect, useRef, useState } from "react"
import { C, T } from "../../tokens"
import {
  fetchFacultyLessonMaterials,
  publishLessonMaterial,
  requestLessonMaterialUpload,
  type LessonMaterial,
} from "../../lib/lesson-materials-api"

const ACCEPTED_TYPES = ".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"

type Accent = { primary: string; subtle: string; border: string; text: string }

function statusLabel(material: LessonMaterial): string {
  if (material.published) return "published"
  if (material.uploadStatus === "FAILED") return "failed"
  if (material.uploadStatus === "READY") return "ready"
  return "upload pending"
}

function statusColor(material: LessonMaterial, accent: Accent): string {
  if (material.published) return accent.text
  if (material.uploadStatus === "FAILED") return "rgba(255,120,120,0.85)"
  if (material.uploadStatus === "READY") return "rgba(140,220,160,0.85)"
  return "rgba(255,255,255,0.35)"
}

export default function FacultyLessonMaterials({
  courseSlug,
  lessonKey,
  lessonTitle,
  accent,
}: {
  courseSlug: string
  lessonKey: string
  lessonTitle: string
  accent: Accent
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function reloadMaterials() {
    setLoading(true)
    setError(null)
    try {
      const items = await fetchFacultyLessonMaterials(courseSlug, lessonKey)
      setMaterials(items)
    } catch (err) {
      setMaterials([])
      setError(err instanceof Error ? err.message : "Failed to load materials")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reloadMaterials()
  }, [courseSlug, lessonKey])

  async function handleFileSelected(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    setStatus(null)
    try {
      const uploaded = await requestLessonMaterialUpload({ courseSlug, lessonKey, file })
      setStatus(
        uploaded.uploadStatus === "READY"
          ? `Uploaded ${uploaded.fileName}. Publish it when ready for learners.`
          : `Upload for ${uploaded.fileName} is still pending verification.`,
      )
      await reloadMaterials()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handlePublish(materialId: string) {
    setPublishingId(materialId)
    setError(null)
    setStatus(null)
    try {
      const published = await publishLessonMaterial({ courseSlug, lessonKey, materialId })
      setStatus(`Published ${published.fileName} for learners.`)
      await reloadMaterials()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed")
    } finally {
      setPublishingId(null)
    }
  }

  return (
    <div style={{ ...{ padding: "22px 24px", border: `1px solid ${T.lineDark}`, borderRadius: T.rCard } }}>
      <div style={{ color: C.white, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        Lesson materials
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
        Upload PDF or PowerPoint files for <strong style={{ color: "rgba(255,255,255,0.72)" }}>{lessonTitle}</strong> in {courseSlug}.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          void handleFileSelected(file)
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        style={{
          background: accent.primary,
          border: "none",
          color: C.black,
          padding: "10px 16px",
          borderRadius: T.rControl,
          fontSize: 13,
          fontWeight: 600,
          cursor: uploading ? "wait" : "pointer",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? "Uploading…" : "Add material (PDF/PPT/PPTX)"}
      </button>

      {status && (
        <p style={{ color: accent.text, fontSize: 13, margin: "12px 0 0" }}>{status}</p>
      )}
      {error && (
        <p role="alert" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, margin: "12px 0 0" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <div className="skylent-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Lesson files</div>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>Loading…</p>
        ) : materials.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>No materials uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
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
                <span style={{ color: C.white, fontSize: 13 }}>{material.fileName}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: statusColor(material, accent), fontSize: 11, fontFamily: "var(--font-mono)" }}>
                    {statusLabel(material)}
                  </span>
                  {material.uploadStatus === "READY" && !material.published && (
                    <button
                      type="button"
                      disabled={publishingId === material.id}
                      onClick={() => { void handlePublish(material.id) }}
                      style={{
                        background: "transparent",
                        border: `1px solid ${accent.border}`,
                        color: accent.text,
                        padding: "4px 10px",
                        borderRadius: T.rPill,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: publishingId === material.id ? "wait" : "pointer",
                      }}
                    >
                      {publishingId === material.id ? "Publishing…" : "Publish"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
