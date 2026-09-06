import { useState } from "react"
import { C } from "../../tokens"
import {
  createSkill,
  updateSkill,
  deleteSkill,
  type CareerSkill,
  type CareerSkillProficiency,
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

const PROFICIENCY: CareerSkillProficiency[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

type FormState = {
  name: string
  category: string
  proficiency: string
}

const emptyForm = (): FormState => ({ name: "", category: "", proficiency: "" })

function toForm(entry?: CareerSkill): FormState {
  if (!entry) return emptyForm()
  return {
    name: entry.name,
    category: entry.category ?? "",
    proficiency: entry.proficiency ?? "",
  }
}

export default function SkillsSection({ profile, onProfileUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  function startNew() {
    setEditingId("new")
    setForm(emptyForm())
    setFeedback(null)
  }

  function startEdit(entry: CareerSkill) {
    setEditingId(entry.id)
    setForm(toForm(entry))
    setFeedback(null)
  }

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || null,
        proficiency: form.proficiency ? (form.proficiency as CareerSkillProficiency) : null,
      }
      const updated = editingId === "new"
        ? await createSkill(payload)
        : await updateSkill(editingId!, payload)
      onProfileUpdate(updated)
      setEditingId(null)
      setFeedback({ tone: "success", message: editingId === "new" ? "Skill added." : "Skill updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save skill" })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id: string) {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await deleteSkill(id)
      onProfileUpdate(updated)
      if (editingId === id) setEditingId(null)
      setFeedback({ tone: "success", message: "Skill removed." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete skill" })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionShell
      id="profile-skills"
      title="Skills"
      description="Technical and professional skills employers can search for."
      action={editingId === null ? (
        <button type="button" onClick={startNew} style={secondaryButtonStyle}>Add skill</button>
      ) : undefined}
    >
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {profile.skills.length === 0 && editingId === null ? (
        <EmptyBlock message="List the skills you want employers to find" onAction={startNew} actionLabel="Add skill" />
      ) : (
        profile.skills.map(skill => (
          editingId === skill.id ? null : (
            <EntryCard
              key={skill.id}
              actions={(
                <>
                  <button type="button" onClick={() => startEdit(skill)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>Edit</button>
                  <button type="button" onClick={() => void handleDelete(skill.id)} disabled={pending} style={dangerButtonStyle}>Delete</button>
                </>
              )}
            >
              <span style={{ color: C.white, fontWeight: 600 }}>{skill.name}</span>
              {(skill.category || skill.proficiency) && (
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginLeft: 8 }}>
                  {[skill.category, skill.proficiency].filter(Boolean).join(" · ")}
                </span>
              )}
            </EntryCard>
          )
        ))
      )}

      {editingId !== null && (
        <div style={{ marginTop: 4 }}>
          <FormGrid>
            <Field label="Skill name">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Category">
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Proficiency">
              <select value={form.proficiency} onChange={e => setForm(f => ({ ...f, proficiency: e.target.value }))} style={fieldInputStyle}>
                <option value="">Not set</option>
                {PROFICIENCY.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </FormGrid>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSave()} disabled={pending || !form.name.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save"}
            </button>
            {editingId !== "new" && (
              <button type="button" onClick={() => void handleDelete(editingId)} disabled={pending} style={dangerButtonStyle}>Delete</button>
            )}
            <button type="button" onClick={() => setEditingId(null)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
