import { useState } from "react"
import { C } from "../../tokens"
import {
  createEducation,
  updateEducation,
  deleteEducation,
  type CareerEducation,
  type CareerProfile,
} from "../../lib/career-api"
import {
  SectionShell,
  EmptyBlock,
  Field,
  FormGrid,
  fieldInputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
  FeedbackBanner,
  EntryCard,
} from "./section-ui"

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

type FormState = {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  currentlyStudying: boolean
  grade: string
}

const emptyForm = (): FormState => ({
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  currentlyStudying: false,
  grade: "",
})

function toForm(entry?: CareerEducation): FormState {
  if (!entry) return emptyForm()
  return {
    institution: entry.institution,
    degree: entry.degree,
    fieldOfStudy: entry.fieldOfStudy ?? "",
    startDate: entry.startDate ? entry.startDate.slice(0, 10) : "",
    endDate: entry.endDate ? entry.endDate.slice(0, 10) : "",
    currentlyStudying: entry.currentlyStudying,
    grade: entry.grade ?? "",
  }
}

function formatDates(entry: CareerEducation) {
  const start = entry.startDate ? entry.startDate.slice(0, 7) : "—"
  const end = entry.currentlyStudying ? "Present" : entry.endDate ? entry.endDate.slice(0, 7) : "—"
  return `${start} – ${end}`
}

export default function EducationSection({ profile, onProfileUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  function startNew() {
    setEditingId("new")
    setForm(emptyForm())
    setFeedback(null)
  }

  function startEdit(entry: CareerEducation) {
    setEditingId(entry.id)
    setForm(toForm(entry))
    setFeedback(null)
  }

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const payload = {
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        fieldOfStudy: form.fieldOfStudy.trim() || null,
        startDate: form.startDate || null,
        endDate: form.currentlyStudying ? null : form.endDate || null,
        currentlyStudying: form.currentlyStudying,
        grade: form.grade.trim() || null,
      }
      const updated = editingId === "new"
        ? await createEducation(payload)
        : await updateEducation(editingId!, payload)
      onProfileUpdate(updated)
      setEditingId(null)
      setFeedback({ tone: "success", message: editingId === "new" ? "Education added." : "Education updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save education" })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id: string) {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await deleteEducation(id)
      onProfileUpdate(updated)
      if (editingId === id) setEditingId(null)
      setFeedback({ tone: "success", message: "Education removed." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete education" })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionShell
      id="profile-education"
      title="Education"
      description="Schools, degrees, and programs you want employers to see."
      action={editingId === null ? (
        <button type="button" onClick={startNew} style={secondaryButtonStyle}>Add education</button>
      ) : undefined}
    >
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {profile.education.length === 0 && editingId === null ? (
        <EmptyBlock message="Add your education" onAction={startNew} actionLabel="Add education" />
      ) : (
        profile.education.map(entry => (
          editingId === entry.id ? null : (
            <EntryCard
              key={entry.id}
              actions={(
                <>
                  <button type="button" onClick={() => startEdit(entry)} style={secondaryButtonStyle}>Edit</button>
                  <button type="button" onClick={() => void handleDelete(entry.id)} disabled={pending} style={dangerButtonStyle}>Delete</button>
                </>
              )}
            >
              <div style={{ color: C.white, fontWeight: 600 }}>{entry.degree}{entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ""}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, marginTop: 4 }}>{entry.institution}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, marginTop: 4 }}>{formatDates(entry)}{entry.grade ? ` · ${entry.grade}` : ""}</div>
            </EntryCard>
          )
        ))
      )}

      {editingId !== null && (
        <div style={{ marginTop: 12 }}>
          <FormGrid>
            <Field label="Institution">
              <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Degree">
              <input value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Field of study">
              <input value={form.fieldOfStudy} onChange={e => setForm(f => ({ ...f, fieldOfStudy: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Start date">
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="End date">
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} disabled={form.currentlyStudying} style={fieldInputStyle} />
            </Field>
            <Field label="Grade">
              <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} style={fieldInputStyle} />
            </Field>
          </FormGrid>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
            <input type="checkbox" checked={form.currentlyStudying} onChange={e => setForm(f => ({ ...f, currentlyStudying: e.target.checked }))} />
            Currently studying here
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSave()} disabled={pending || !form.institution.trim() || !form.degree.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
