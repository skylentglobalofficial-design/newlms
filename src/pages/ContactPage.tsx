/**
 * Contact (/contact). The form records a real enquiry through POST /enquiries (sendEnquiry);
 * it no longer opens an email draft. Nothing on this page is a sample: the success state shows
 * the reference id the server returned, and a failed request says so.
 */
import { useId, useState, type FormEvent } from "react"
import { PageShell } from "../components/shared"
import { ArrowRight, TruthChip } from "../components/skylent/primitives"
import { sendEnquiry, type EnquiryKind } from "../lib/skylent-api"
import { truthOf } from "../lib/truth"
import "./ContactPage.css"

const CONTACT_EMAIL = "hello@skylent.in"
const SUPPORT_EMAIL = "support@skylent.live"

type ContactKind = Extract<EnquiryKind, "enquiry" | "counselling">
type Fields = { name: string; email: string; phone: string; kind: ContactKind; message: string }
type FieldErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>
type Submit = { status: "idle" } | { status: "sending" } | { status: "sent"; id: string; kind: ContactKind } | { status: "failed" }

const EMPTY: Fields = { name: "", email: "", phone: "", kind: "enquiry", message: "" }
const KINDS: Array<{ value: ContactKind; label: string; note: string }> = [
  { value: "enquiry", label: "General enquiry", note: "A question about programmes, degrees or the platform." },
  { value: "counselling", label: "Counselling call", note: "Ask the team to call you about choosing a path." },
]

/** Mirrors the server schema in server/src/routes/skylent/enquiries.ts so most errors are caught before sending. */
function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  if (!name) errors.name = "Enter your name."
  else if (name.length > 120) errors.name = "Use 120 characters or fewer."
  if (!email) errors.email = "Enter your email address."
  else if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address."
  if (fields.phone.trim().length > 20) errors.phone = "Use 20 characters or fewer."
  if (fields.message.length > 2000) errors.message = "Use 2,000 characters or fewer."
  return errors
}

export default function ContactPage() {
  const formId = useId()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submit, setSubmit] = useState<Submit>({ status: "idle" })
  const sending = submit.status === "sending"

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }))
    if (key !== "kind" && errors[key as keyof FieldErrors]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const found = validate(fields)
    setErrors(found)
    const firstInvalid = (["name", "email", "phone", "message"] as const).find((key) => found[key])
    if (firstInvalid) {
      setSubmit({ status: "idle" })
      document.getElementById(`${formId}-${firstInvalid}`)?.focus()
      return
    }
    setSubmit({ status: "sending" })
    try {
      const result = await sendEnquiry({
        kind: fields.kind,
        name: fields.name,
        email: fields.email,
        phone: fields.phone || undefined,
        message: fields.message || undefined,
      })
      setSubmit({ status: "sent", id: result.id, kind: fields.kind })
      setFields(EMPTY)
    } catch {
      setSubmit({ status: "failed" })
    }
  }

  const describe = (key: keyof FieldErrors) => (errors[key] ? `${formId}-${key}-error` : undefined)

  return (
    <PageShell aurora={false}>
      <div className="site-light ctc">
        <div className="sky-container ctc-wrap">
          <div className="ctc-main">
            <div className="ctc-kicker">
              <span className="sky-label">Contact Skylent</span>
              <TruthChip state={truthOf("enquiries")} />
            </div>
            <h1>Send the team an enquiry</h1>
            <p className="ctc-lead">
              Ask a question or request a counselling call. Your enquiry is recorded with a reference, and the team replies by email or
              phone.
            </p>

            {submit.status === "sent" ? (
              <section className="sky-panel-proof ctc-sent" aria-labelledby={`${formId}-sent`} role="status">
                <h2 id={`${formId}-sent`}>{submit.kind === "counselling" ? "Counselling call requested" : "Enquiry sent"}</h2>
                <dl className="sky-spec">
                  <div className="sky-spec__row">
                    <dt className="sky-spec__label">Reference</dt>
                    <dd className="sky-spec__value sky-mono">{submit.id}</dd>
                  </div>
                </dl>
                <p>Keep this reference. Quote it if you email {SUPPORT_EMAIL} about this enquiry.</p>
                <button type="button" className="sk-btn sk-btn-secondary" onClick={() => setSubmit({ status: "idle" })}>
                  Send another enquiry
                </button>
              </section>
            ) : (
              <form className="ctc-form" onSubmit={onSubmit} noValidate aria-busy={sending}>
                <fieldset className="ctc-kinds">
                  <legend className="sky-label">What do you need?</legend>
                  <div className="ctc-kinds__row">
                    {KINDS.map((kind) => (
                      <label key={kind.value} className={fields.kind === kind.value ? "ctc-kind ctc-kind--on" : "ctc-kind"}>
                        <input
                          type="radio"
                          name="kind"
                          value={kind.value}
                          checked={fields.kind === kind.value}
                          onChange={() => set("kind", kind.value)}
                          disabled={sending}
                        />
                        <span>
                          <strong>{kind.label}</strong>
                          <span>{kind.note}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="ctc-grid">
                  <div className="ctc-field">
                    <label className="sky-label" htmlFor={`${formId}-name`}>Name</label>
                    <input
                      id={`${formId}-name`}
                      className="sk-input"
                      name="name"
                      autoComplete="name"
                      maxLength={120}
                      value={fields.name}
                      onChange={(event) => set("name", event.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={describe("name")}
                      disabled={sending}
                      required
                    />
                    {errors.name ? <p className="sk-error" id={`${formId}-name-error`}>{errors.name}</p> : null}
                  </div>
                  <div className="ctc-field">
                    <label className="sky-label" htmlFor={`${formId}-email`}>Email</label>
                    <input
                      id={`${formId}-email`}
                      className="sk-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={200}
                      value={fields.email}
                      onChange={(event) => set("email", event.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={describe("email")}
                      disabled={sending}
                      required
                    />
                    {errors.email ? <p className="sk-error" id={`${formId}-email-error`}>{errors.email}</p> : null}
                  </div>
                </div>

                <div className="ctc-field">
                  <label className="sky-label" htmlFor={`${formId}-phone`}>
                    Phone (optional)
                  </label>
                  <input
                    id={`${formId}-phone`}
                    className="sk-input ctc-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    value={fields.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describe("phone")}
                    disabled={sending}
                  />
                  {errors.phone ? <p className="sk-error" id={`${formId}-phone-error`}>{errors.phone}</p> : null}
                </div>

                <div className="ctc-field">
                  <label className="sky-label" htmlFor={`${formId}-message`}>Message (optional)</label>
                  <textarea
                    id={`${formId}-message`}
                    className="sk-input"
                    name="message"
                    rows={5}
                    maxLength={2000}
                    value={fields.message}
                    onChange={(event) => set("message", event.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={describe("message")}
                    disabled={sending}
                  />
                  {errors.message ? <p className="sk-error" id={`${formId}-message-error`}>{errors.message}</p> : null}
                </div>

                {sending ? <div className="ctc-progress" aria-hidden="true" /> : null}
                {submit.status === "failed" ? (
                  <p className="ctc-failed" role="alert">
                    We could not send this. Try again, or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                  </p>
                ) : null}

                <div className="ctc-actions">
                  <button type="submit" className="sk-btn sk-btn-primary" disabled={sending}>
                    {sending ? "Sending" : fields.kind === "counselling" ? "Request a call" : "Send enquiry"}
                    {sending ? null : <ArrowRight />}
                  </button>
                  <span className="ctc-note">Name and email are required.</span>
                </div>
              </form>
            )}
          </div>

          <aside className="ctc-side" aria-label="Other ways to reach Skylent">
            <div className="sky-label">Reach the team directly</div>
            <dl className="sky-spec ctc-details">
              <div className="sky-spec__row">
                <dt className="sky-spec__label">Email</dt>
                <dd className="sky-spec__value"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd>
              </div>
              <div className="sky-spec__row">
                <dt className="sky-spec__label">Support</dt>
                <dd className="sky-spec__value"><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></dd>
              </div>
              <div className="sky-spec__row">
                <dt className="sky-spec__label">Office</dt>
                <dd className="sky-spec__value">Bengaluru, India</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
