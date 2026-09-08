import { useEffect, useState } from "react"
import { C, T } from "../../tokens"
import { fetchFacultyLessonNotes, updateFacultyLessonNotes } from "../../lib/faculty-api"

type Accent = { primary: string; subtle: string; border: string; text: string }

export default function FacultyLessonNotes({
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
  const [notesBody, setNotesBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setStatus(null)
    void fetchFacultyLessonNotes(courseSlug, lessonKey)
      .then((data) => {
        if (!cancelled) setNotesBody(data.notesBody)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setNotesBody("")
          setError(err instanceof Error ? err.message : "Failed to load notes")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courseSlug, lessonKey])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      await updateFacultyLessonNotes(courseSlug, lessonKey, notesBody)
      setStatus("Notes saved.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const muted = "var(--skylent-text-muted)"
  const secondary = "var(--skylent-text-secondary)"
  const foreground = "var(--skylent-text)"
  const surface = "var(--skylent-card-bg)"
  const border = "var(--skylent-border-subtle)"

  return (
    <div style={{ padding: "22px 24px", background: surface, border: `1px solid ${border}`, borderRadius: T.rCard, marginTop: 16 }}>
      <div style={{ color: foreground, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        Lesson notes
      </div>
      <p style={{ color: secondary, fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
        Edit reading content for <strong style={{ color: foreground }}>{lessonTitle}</strong>. Plain text or Markdown.
      </p>

      {loading ? (
        <p style={{ color: secondary, fontSize: 13 }}>Loading notes…</p>
      ) : (
        <textarea
          value={notesBody}
          onChange={(event) => setNotesBody(event.target.value)}
          rows={10}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--skylent-input-bg)",
            border: `1px solid ${border}`,
            borderRadius: T.rControl,
            color: foreground,
            fontSize: 13,
            lineHeight: 1.65,
            padding: "12px 14px",
            resize: "vertical",
            fontFamily: "var(--font-body)",
          }}
        />
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={loading || saving}
          onClick={() => { void handleSave() }}
          style={{
            background: accent.primary,
            border: "none",
            color: C.black,
            padding: "10px 16px",
            borderRadius: T.rControl,
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? "wait" : "pointer",
            opacity: loading || saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
        {status && <span style={{ color: accent.text, fontSize: 13 }}>{status}</span>}
      </div>
      {error && (
        <p role="alert" style={{ color: "#b42318", fontSize: 13, margin: "12px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  )
}
