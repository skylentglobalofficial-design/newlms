import { useState } from "react"
import { C } from "../../tokens"
import {
  createExperience,
  updateExperience,
  deleteExperience,
  type CareerExperience,
  type CareerEmploymentType,
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

const EMPLOYMENT_TYPES: CareerEmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "OTHER"]

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

type FormState = {
  company: string
  role: string
  employmentType: string
  location: string
  startDate: string
  endDate: string
  currentlyWorking: boolean
  description: string
}

const emptyForm = (): FormState => ({
  company: "",
  role: "",
  employmentType: "",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
})

function toForm(entry?: CareerExperience): FormState {
  if (!entry) return emptyForm()
  return {
    company: entry.company,
    role: entry.role,
    employmentType: entry.employmentType ?? "",
    location: entry.location ?? "",
    startDate: entry.startDate ? entry.startDate.slice(0, 10) : "",
    endDate: entry.endDate ? entry.endDate.slice(0, 10) : "",
    currentlyWorking: entry.currentlyWorking,
    description: entry.description ?? "",
  }
}

function formatDates(entry: CareerExperience) {
  const start = entry.startDate ? entry.startDate.slice(0, 7) : "—"
  const end = entry.currentlyWorking ? "Present" : entry.endDate ? entry.endDate.slice(0, 7) : "—"
  return `${start} – ${end}`
}

export default function ExperienceSection({ profile, onProfileUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  function startNew() {
    setEditingId("new")
    setForm(emptyForm())
    setFeedback(null)
  }

  function startEdit(entry: CareerExperience) {
    setEditingId(entry.id)
    setForm(toForm(entry))
    setFeedback(null)
  }

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        employmentType: form.employmentType ? (form.employmentType as CareerEmploymentType) : null,
        location: form.location.trim() || null,
        startDate: form.startDate || null,
        endDate: form.currentlyWorking ? null : form.endDate || null,
        currentlyWorking: form.currentlyWorking,
        description: form.description.trim() || null,
      }
      const updated = editingId === "new"
        ? await createExperience(payload)
        : await updateExperience(editingId!, payload)
      onProfileUpdate(updated)
      setEditingId(null)
      setFeedback({ tone: "success", message: editingId === "new" ? "Experience added." : "Experience updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save experience" })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id: string) {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await deleteExperience(id)
      onProfileUpdate(updated)
      if (editingId === id) setEditingId(null)
      setFeedback({ tone: "success", message: "Experience removed." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete experience" })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionShell
      id="profile-experience"
      title="Experience"
      description="Roles, internships, and contract work."
      action={editingId === null ? (
        <button type="button" onClick={startNew} style={secondaryButtonStyle}>Add experience</button>
      ) : undefined}
    >
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {profile.experience.length === 0 && editingId === null ? (
        <EmptyBlock message="Add your work experience" onAction={startNew} actionLabel="Add experience" />
      ) : (
        profile.experience.map(entry => (
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
              <div style={{ color: C.white, fontWeight: 600 }}>{entry.role}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, marginTop: 4 }}>
                {entry.company}
                {entry.location ? ` · ${entry.location}` : ""}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, marginTop: 4 }}>
                {formatDates(entry)}
                {entry.employmentType ? ` · ${entry.employmentType.replace("_", " ")}` : ""}
              </div>
              {entry.description && (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.6, margin: "10px 0 0" }}>{entry.description}</p>
              )}
            </EntryCard>
          )
        ))
      )}

      {editingId !== null && (
        <div style={{ marginTop: 12 }}>
          <FormGrid>
            <Field label="Role">
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Company">
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Employment type">
              <select value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))} style={fieldInputStyle}>
                <option value="">Not set</option>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Start date">
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="End date">
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} disabled={form.currentlyWorking} style={fieldInputStyle} />
            </Field>
          </FormGrid>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...fieldInputStyle, resize: "vertical", marginTop: 14 }} />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
            <input type="checkbox" checked={form.currentlyWorking} onChange={e => setForm(f => ({ ...f, currentlyWorking: e.target.checked }))} />
            I currently work here
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSave()} disabled={pending || !form.company.trim() || !form.role.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
