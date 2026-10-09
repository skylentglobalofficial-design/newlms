/**
 * "Ask about this degree": one compact enquiry form shared by the online and campus pages.
 * Posts to the real endpoint, POST /api/v1/enquiries, through `sendEnquiry` with
 * `kind: "degree"` and the degree slug as `programSlug`. No mock, no fallback: a failed
 * request shows the failure state. It promises no response time and no counsellor.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { ArrowRight, SectionIndex, SpecSheet } from "../../components/skylent/primitives"
import { degreeLevelName, deliveryModeLabel, type Degree } from "../../lib/degrees"
import { sendEnquiry } from "../../lib/skylent-api"
import { TermsConsent } from "../../components/legal/TermsConsent"

type Fields = { name: string; email: string; phone: string; message: string }
type FieldErrors = Partial<Record<keyof Fields, string>>
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; id: string } | { kind: "failed" }

const EMPTY: Fields = { name: "", email: "", phone: "", message: "" }
const SUPPORT_EMAIL = "support@skylent.live"

/** Mirrors the server schema in server/src/routes/skylent/enquiries.ts so most mistakes are caught before sending. */
function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  if (!name) errors.name = "Enter your name."
  else if (name.length > 120) errors.name = "Use 120 characters or fewer."
  if (!email) errors.email = "Enter your email address."
  else if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address, like name@example.com."
  if (fields.phone.trim().length > 20) errors.phone = "Use 20 characters or fewer."
  if (fields.message.length > 2000) errors.message = "Use 2,000 characters or fewer."
  return errors
}

export function DegreeEnquiry({ degree, index, ruled = false }: { degree: Degree; index: string; ruled?: boolean }) {
  const uid = useId()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)
  const sending = status.kind === "sending"
  const [accepted, setAccepted] = useState(false)
  const [triedWithoutTerms, setTriedWithoutTerms] = useState(false)

  useEffect(() => {
    if (status.kind === "sent") doneRef.current?.focus()
  }, [status.kind])

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const found = validate(fields)
    setErrors(found)
    const firstInvalid = (Object.keys(found) as (keyof Fields)[])[0]
    if (firstInvalid) {
      setStatus({ kind: "idle" })
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    if (!accepted) {
      setTriedWithoutTerms(true)
      return
    }
    setStatus({ kind: "sending" })
    try {
      const result = await sendEnquiry({
        kind: "degree",
        programSlug: degree.slug,
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        message: fields.message,
      })
      setFields(EMPTY)
      setStatus({ kind: "sent", id: result.id })
    } catch {
      setStatus({ kind: "failed" })
    }
  }

  const field = (key: keyof Fields) => ({
    id: `${uid}-${key}`,
    name: key,
    value: fields[key],
    readOnly: sending,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
  })
  const errorFor = (key: keyof Fields) =>
    errors[key] ? (
      <p className="sk-error" id={`${uid}-${key}-error`}>
        {errors[key]}
      </p>
    ) : null

  return (
    <section id="ask" className={`dg-ask${ruled ? " dg-ask--ruled" : ""}`} aria-labelledby={`${uid}-title`}>
      <div className="sky-container dg-ask__row">
        <div className="dg-ask__lead">
          <div className="dg-ask__index">
            <SectionIndex n={index} label="Ask" />
          </div>
          <h2 className="dg-h2 dg-h2--sm" id={`${uid}-title`}>
            Ask about this degree
          </h2>
          <p>
            Register your interest or ask a question. The Skylent admissions team replies by email
            {degree.institution ? "." : " and shares fees, dates and entry requirements as soon as admissions open."}
          </p>
          <SpecSheet
            rows={[
              { label: "Degree", value: degree.title },
              { label: "Mode", value: deliveryModeLabel(degree.deliveryMode) },
              { label: "Level", value: degreeLevelName(degree.level) },
            ]}
          />
        </div>

        {status.kind === "sent" ? (
          <div className="dg-done" role="status" tabIndex={-1} ref={doneRef}>
            <h3 className="dg-h3">We have your enquiry.</h3>
            <p>It is stored with this listing: {degree.title}.</p>
            <div className="dg-done__ref">
              <span className="sky-label">Reference</span>
              <code>{status.id}</code>
            </div>
            <button type="button" className="sk-btn sk-btn-secondary" onClick={() => setStatus({ kind: "idle" })}>
              Send another enquiry
            </button>
          </div>
        ) : (
          <form className="dg-form" ref={formRef} onSubmit={submit} noValidate aria-busy={sending}>
            <div className="dg-form__grid">
              <div className="dg-field">
                <label htmlFor={`${uid}-name`}>Name</label>
                <input className="sk-input" type="text" autoComplete="name" maxLength={120} required {...field("name")} onChange={(e) => update("name", e.target.value)} />
                {errorFor("name")}
              </div>
              <div className="dg-field">
                <label htmlFor={`${uid}-email`}>Email</label>
                <input className="sk-input" type="email" autoComplete="email" inputMode="email" maxLength={200} required {...field("email")} onChange={(e) => update("email", e.target.value)} />
                {errorFor("email")}
              </div>
              <div className="dg-field">
                <label htmlFor={`${uid}-phone`}>
                  Phone <span>Optional</span>
                </label>
                <input className="sk-input" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} {...field("phone")} onChange={(e) => update("phone", e.target.value)} />
                {errorFor("phone")}
              </div>
              <div className="dg-field dg-field--wide">
                <label htmlFor={`${uid}-message`}>
                  Message <span>Optional</span>
                </label>
                <textarea className="sk-input" rows={4} maxLength={2000} {...field("message")} onChange={(e) => update("message", e.target.value)} />
                {errorFor("message")}
              </div>
            </div>

            {status.kind === "failed" ? (
              <p className="dg-form__alert" role="alert">
                We could not send this. Try again, or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            ) : null}

            <TermsConsent checked={accepted} onChange={setAccepted} action="sending an enquiry" showError={triedWithoutTerms} />
            <div className="dg-form__foot">
              <button type="submit" className="sk-btn sk-btn-primary" disabled={sending}>
                {sending ? "Sending" : "Send enquiry"}
                {sending ? null : <ArrowRight />}
              </button>
              <p className="dg-note">Your details go to the Skylent team only.</p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
