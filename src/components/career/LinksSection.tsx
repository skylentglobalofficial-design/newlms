import { useState } from "react"
import { C } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import {
  createLink,
  updateLink,
  deleteLink,
  type CareerLink,
  type CareerLinkType,
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
const LINK_TYPES: CareerLinkType[] = ["LINKEDIN", "GITHUB", "PORTFOLIO", "OTHER"]

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

type FormState = {
  type: CareerLinkType
  label: string
  url: string
}

const emptyForm = (): FormState => ({ type: "LINKEDIN", label: "", url: "" })

function toForm(entry?: CareerLink): FormState {
  if (!entry) return emptyForm()
  return {
    type: entry.type,
    label: entry.label ?? "",
    url: entry.url,
  }
}

function linkLabel(entry: CareerLink) {
  return entry.label || entry.type.replace("_", " ")
}

export default function LinksSection({ profile, onProfileUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  function startNew() {
    setEditingId("new")
    setForm(emptyForm())
    setFeedback(null)
  }

  function startEdit(entry: CareerLink) {
    setEditingId(entry.id)
    setForm(toForm(entry))
    setFeedback(null)
  }

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const payload = {
        type: form.type,
        label: form.label.trim() || null,
        url: form.url.trim(),
      }
      const updated = editingId === "new"
        ? await createLink(payload)
        : await updateLink(editingId!, payload)
      onProfileUpdate(updated)
      setEditingId(null)
      setFeedback({ tone: "success", message: editingId === "new" ? "Link added." : "Link updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save link" })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id: string) {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await deleteLink(id)
      onProfileUpdate(updated)
      if (editingId === id) setEditingId(null)
      setFeedback({ tone: "success", message: "Link removed." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete link" })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionShell
      id="profile-links"
      title="Links"
      description="LinkedIn, GitHub, portfolio, and other professional URLs."
      action={editingId === null ? (
        <button type="button" onClick={startNew} style={secondaryButtonStyle}>Add link</button>
      ) : undefined}
    >
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {profile.links.length === 0 && editingId === null ? (
        <EmptyBlock message="Add a professional link" onAction={startNew} actionLabel="Add link" />
      ) : (
        profile.links.map(entry => (
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
              <div style={{ color: C.white, fontWeight: 600 }}>{linkLabel(entry)}</div>
              <a href={entry.url} target="_blank" rel="noreferrer" style={{ color: accent.text, fontSize: 13, textDecoration: "none", wordBreak: "break-all" }}>
                {entry.url}
              </a>
            </EntryCard>
          )
        ))
      )}

      {editingId !== null && (
        <div style={{ marginTop: 12 }}>
          <FormGrid>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CareerLinkType }))} style={fieldInputStyle}>
                {LINK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Label (optional)">
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={fieldInputStyle} />
            </Field>
            <Field label="URL">
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={fieldInputStyle} placeholder="https://" />
            </Field>
          </FormGrid>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSave()} disabled={pending || !form.url.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
