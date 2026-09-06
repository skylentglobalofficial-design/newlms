import { useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import {
  updateCareerProfile,
  createResume,
  deleteResume,
  type CareerProfile,
  type CareerWorkMode,
  type CareerProfileVisibility,
} from "../../lib/career-api"
import {
  SectionShell,
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

const WORK_MODES: CareerWorkMode[] = ["REMOTE", "HYBRID", "ONSITE", "FLEXIBLE"]
const VISIBILITY_OPTIONS: CareerProfileVisibility[] = ["PRIVATE", "NETWORK", "PUBLIC"]

type Props = {
  profile: CareerProfile
  onProfileUpdate: (profile: CareerProfile) => void
}

export default function ProfileOverview({ profile, onProfileUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const [form, setForm] = useState({
    headline: profile.headline ?? "",
    summary: profile.summary ?? "",
    location: profile.location ?? "",
    phone: profile.phone ?? "",
    preferredRole: profile.preferredRole ?? "",
    preferredWorkMode: profile.preferredWorkMode ?? "",
    visibility: profile.visibility,
  })

  const [resumeLabel, setResumeLabel] = useState("")
  const [resumePending, setResumePending] = useState(false)
  const [resumeFeedback, setResumeFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  async function handleSave() {
    setPending(true)
    setFeedback(null)
    try {
      const updated = await updateCareerProfile({
        headline: form.headline.trim() || null,
        summary: form.summary.trim() || null,
        location: form.location.trim() || null,
        phone: form.phone.trim() || null,
        preferredRole: form.preferredRole.trim() || null,
        preferredWorkMode: form.preferredWorkMode ? (form.preferredWorkMode as CareerWorkMode) : null,
        visibility: form.visibility,
      })
      onProfileUpdate(updated)
      setEditing(false)
      setFeedback({ tone: "success", message: "Profile updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to save profile" })
    } finally {
      setPending(false)
    }
  }

  async function handleAddResume() {
    if (!resumeLabel.trim()) return
    setResumePending(true)
    setResumeFeedback(null)
    try {
      const updated = await createResume({ label: resumeLabel.trim() })
      onProfileUpdate(updated)
      setResumeLabel("")
      setResumeFeedback({ tone: "success", message: "Resume version added." })
    } catch (err) {
      setResumeFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to add resume" })
    } finally {
      setResumePending(false)
    }
  }

  async function handleDeleteResume(id: string) {
    setResumePending(true)
    setResumeFeedback(null)
    try {
      const updated = await deleteResume(id)
      onProfileUpdate(updated)
      setResumeFeedback({ tone: "success", message: "Resume version removed." })
    } catch (err) {
      setResumeFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete resume" })
    } finally {
      setResumePending(false)
    }
  }

  const displayName = profile.displayName || "Your profile"

  return (
    <>
      <SectionShell
        id="profile-basics"
        title="Identity & basics"
        description="Headline, summary, and how employers can reach you."
        action={!editing ? (
          <button type="button" onClick={() => setEditing(true)} style={secondaryButtonStyle}>Edit</button>
        ) : undefined}
      >
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

        <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 4 }}>{displayName}</div>
              <div style={{ color: accent.text, fontSize: 14, marginBottom: 8 }}>{profile.headline || "Add a professional headline"}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                {[profile.preferredRole, profile.location].filter(Boolean).join(" · ") || "Set your target role and location"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.white, fontFamily: "var(--font-display)" }}>{profile.completeness.percent}%</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Profile complete</div>
            </div>
          </div>
        </GlassSurface>

        {editing ? (
          <div style={{ padding: "18px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.02)" }}>
            <FormGrid>
              <Field label="Headline">
                <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} style={fieldInputStyle} maxLength={160} />
              </Field>
              <Field label="Preferred role">
                <input value={form.preferredRole} onChange={e => setForm(f => ({ ...f, preferredRole: e.target.value }))} style={fieldInputStyle} />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={fieldInputStyle} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={fieldInputStyle} />
              </Field>
              <Field label="Work mode">
                <select
                  value={form.preferredWorkMode}
                  onChange={e => setForm(f => ({ ...f, preferredWorkMode: e.target.value }))}
                  style={fieldInputStyle}
                >
                  <option value="">Not set</option>
                  {WORK_MODES.map(mode => <option key={mode} value={mode}>{mode.replace("_", " ")}</option>)}
                </select>
              </Field>
              <Field label="Visibility">
                <select
                  value={form.visibility}
                  onChange={e => setForm(f => ({ ...f, visibility: e.target.value as CareerProfileVisibility }))}
                  style={fieldInputStyle}
                >
                  {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
            </FormGrid>
            <Field label="About">
              <textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                rows={5}
                style={{ ...fieldInputStyle, resize: "vertical", marginTop: 14 }}
                maxLength={4000}
              />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleSave()} disabled={pending} style={{ ...primaryButtonStyle, opacity: pending ? 0.7 : 1 }}>
                {pending ? "Saving…" : "Save changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} disabled={pending} style={secondaryButtonStyle}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            {profile.summary || "Write a short summary about your background and what you are looking for next."}
          </div>
        )}
      </SectionShell>

      <SectionShell
        id="profile-resumes"
        title="Resume versions"
        description="Track resume metadata. File upload is not available in this phase."
      >
        {resumeFeedback && <FeedbackBanner tone={resumeFeedback.tone} message={resumeFeedback.message} />}

        {profile.resumeVersions.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 14px" }}>No resume versions yet. Add a label to track versions.</p>
        ) : (
          profile.resumeVersions.map(resume => (
            <EntryCard
              key={resume.id}
              actions={(
                <button type="button" onClick={() => void handleDeleteResume(resume.id)} disabled={resumePending} style={dangerButtonStyle}>
                  Remove
                </button>
              )}
            >
              <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{resume.label}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginTop: 4 }}>
                v{resume.version}
                {resume.isPrimary ? " · Primary" : ""}
                {resume.fileName ? ` · ${resume.fileName}` : ""}
                {resume.status ? ` · ${resume.status}` : ""}
              </div>
            </EntryCard>
          ))
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <input
            value={resumeLabel}
            onChange={e => setResumeLabel(e.target.value)}
            placeholder="Resume label (e.g. Data Analyst — March 2026)"
            style={{ ...fieldInputStyle, flex: "1 1 220px" }}
            maxLength={120}
          />
          <button type="button" onClick={() => void handleAddResume()} disabled={resumePending || !resumeLabel.trim()} style={primaryButtonStyle}>
            {resumePending ? "Adding…" : "Add resume"}
          </button>
        </div>
      </SectionShell>

      {profile.completeness.nextRecommended && (
        <div style={{ padding: "14px 16px", borderRadius: T.rControl, border: `1px solid ${accent.border}`, background: accent.subtle }}>
          <div style={{ fontSize: 12, color: accent.text, marginBottom: 4 }}>Suggested next step</div>
          <div style={{ color: C.white, fontSize: 14 }}>{profile.completeness.nextRecommended}</div>
          <Link to="/career-os/profile" style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 13, textDecoration: "none" }}>
            Continue in profile →
          </Link>
        </div>
      )}
    </>
  )
}
