import { useState } from "react"
import { C } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import {
  createProject,
  updateProject,
  deleteProject,
  type CareerProject,
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

const accent = getDomainAccent("career")

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

type FormState = {
  title: string
  description: string
  technologies: string
  projectUrl: string
  repositoryUrl: string
  outcome: string
}

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  technologies: "",
  projectUrl: "",
  repositoryUrl: "",
  outcome: "",
})

function toForm(entry?: CareerProject): FormState {
  if (!entry) return emptyForm()
  return {
    title: entry.title,
    description: entry.description ?? "",
    technologies: entry.technologies.join(", "),
    projectUrl: entry.projectUrl ?? "",
    repositoryUrl: entry.repositoryUrl ?? "",
    outcome: entry.outcome ?? "",
  }
}

export default function ProjectsSection({ profile, onProfileUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  function startNew() {
    setEditingId("new")
    setForm(emptyForm())
    setFeedback(null)
  }

  function startEdit(entry: CareerProject) {
    setEditingId(entry.id)
    setForm(toForm(entry))
    setFeedback(null)
  }

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        technologies: form.technologies.split(",").map(t => t.trim()).filter(Boolean),
        projectUrl: form.projectUrl.trim() || null,
        repositoryUrl: form.repositoryUrl.trim() || null,
        outcome: form.outcome.trim() || null,
      }
      const updated = editingId === "new"
        ? await createProject(payload)
        : await updateProject(editingId!, payload)
      onProfileUpdate(updated)
      setEditingId(null)
      setFeedback({ tone: "success", message: editingId === "new" ? "Project added." : "Project updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save project" })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id: string) {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await deleteProject(id)
      onProfileUpdate(updated)
      if (editingId === id) setEditingId(null)
      setFeedback({ tone: "success", message: "Project removed." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete project" })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionShell
      id="profile-projects"
      title="Projects"
      description="Portfolio work that demonstrates what you can build."
      action={editingId === null ? (
        <button type="button" onClick={startNew} style={secondaryButtonStyle}>Add project</button>
      ) : undefined}
    >
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {profile.projects.length === 0 && editingId === null ? (
        <EmptyBlock message="Add your first project" onAction={startNew} actionLabel="Add project" />
      ) : (
        profile.projects.map(entry => (
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
              <div style={{ color: C.white, fontWeight: 600 }}>{entry.title}</div>
              {entry.description && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.6, margin: "8px 0 0" }}>{entry.description}</p>
              )}
              {entry.technologies.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {entry.technologies.map(tech => (
                    <span key={tech} style={{ fontSize: 11.5, padding: "4px 8px", borderRadius: 100, border: `1px solid ${accent.border}`, color: accent.text }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 12.5 }}>
                {entry.projectUrl && <a href={entry.projectUrl} target="_blank" rel="noreferrer" style={{ color: accent.text, textDecoration: "none" }}>Project link</a>}
                {entry.repositoryUrl && <a href={entry.repositoryUrl} target="_blank" rel="noreferrer" style={{ color: accent.text, textDecoration: "none" }}>Repository</a>}
              </div>
              {entry.outcome && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, margin: "10px 0 0" }}>Outcome: {entry.outcome}</p>}
            </EntryCard>
          )
        ))
      )}

      {editingId !== null && (
        <div style={{ marginTop: 12 }}>
          <FormGrid>
            <Field label="Title">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Technologies (comma-separated)">
              <input value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="Project URL">
              <input value={form.projectUrl} onChange={e => setForm(f => ({ ...f, projectUrl: e.target.value }))} style={fieldInputStyle} placeholder="https://" />
            </Field>
            <Field label="Repository URL">
              <input value={form.repositoryUrl} onChange={e => setForm(f => ({ ...f, repositoryUrl: e.target.value }))} style={fieldInputStyle} placeholder="https://" />
            </Field>
          </FormGrid>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...fieldInputStyle, resize: "vertical", marginTop: 14 }} />
          </Field>
          <Field label="Outcome">
            <textarea value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} rows={2} style={{ ...fieldInputStyle, resize: "vertical", marginTop: 14 }} />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSave()} disabled={pending || !form.title.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
