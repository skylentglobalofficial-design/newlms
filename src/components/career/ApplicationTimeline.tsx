import { useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { ApplicationEvent } from "../../lib/career-api"
import { createApplicationEvent } from "../../lib/career-api"
import { formatApplicationDateTime } from "./application-utils"
import { FeedbackBanner, Field, fieldInputStyle, primaryButtonStyle, secondaryButtonStyle } from "./section-ui"

const accent = getDomainAccent("career")

type Props = {
  applicationId: string
  events: ApplicationEvent[]
  onEventAdded: (event: ApplicationEvent) => void
}

export default function ApplicationTimeline({ applicationId, events, onEventAdded }: Props) {
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const [form, setForm] = useState({
    type: "note",
    title: "",
    description: "",
    occurredAt: new Date().toISOString().slice(0, 16),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setPending(true)
    setFeedback(null)
    try {
      const event = await createApplicationEvent(applicationId, {
        type: form.type.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        occurredAt: new Date(form.occurredAt).toISOString(),
      })
      onEventAdded(event)
      setForm({
        type: "note",
        title: "",
        description: "",
        occurredAt: new Date().toISOString().slice(0, 16),
      })
      setAdding(false)
      setFeedback({ tone: "success", message: "Event added to timeline." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to add event" })
    } finally {
      setPending(false)
    }
  }

  return (
    <section style={{ minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
          Timeline
        </h2>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
            Add event
          </button>
        )}
      </div>

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      {adding && (
        <form
          onSubmit={e => void handleSubmit(e)}
          style={{
            marginBottom: 18,
            padding: "16px",
            borderRadius: T.rControl,
            border: `1px solid ${T.lineDark}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Field label="Event type">
            <input
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={fieldInputStyle}
              placeholder="e.g. interview, note, follow-up"
              maxLength={80}
            />
          </Field>
          <Field label="Title">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ ...fieldInputStyle, marginTop: 12 }}
              placeholder="Phone screen completed"
              maxLength={200}
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ ...fieldInputStyle, marginTop: 12, resize: "vertical" }}
              maxLength={4000}
            />
          </Field>
          <Field label="When">
            <input
              type="datetime-local"
              value={form.occurredAt}
              onChange={e => setForm(f => ({ ...f, occurredAt: e.target.value }))}
              style={{ ...fieldInputStyle, marginTop: 12 }}
            />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="submit" disabled={pending || !form.title.trim()} style={primaryButtonStyle}>
              {pending ? "Saving…" : "Save event"}
            </button>
            <button type="button" onClick={() => setAdding(false)} disabled={pending} style={secondaryButtonStyle}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {events.length === 0 ? (
        <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
          No timeline events yet. Add notes as your application progresses.
        </p>
      ) : (
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {events.map((event, index) => (
            <li
              key={event.id}
              style={{
                position: "relative",
                paddingLeft: 20,
                paddingBottom: index === events.length - 1 ? 0 : 18,
                borderLeft: index === events.length - 1 ? "none" : `1px solid ${T.lineDark}`,
                marginLeft: 6,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: -5,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: accent.primary,
                  border: `2px solid ${C.canvas}`,
                }}
              />
              <div style={{ fontSize: 11, color: accent.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {event.type}
              </div>
              <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>
                {event.title}
              </div>
              {event.description && (
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.6, wordBreak: "break-word" }}>
                  {event.description}
                </p>
              )}
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                {formatApplicationDateTime(event.occurredAt)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
