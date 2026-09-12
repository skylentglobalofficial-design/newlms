import { useState, type FormEvent } from 'react'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, Button, Note, SectionHeading } from '../design/primitives'
import { S, TY, R } from '../design/tokens'

const EMAIL = 'hello@skylent.in'

const IAM = ['Learner', 'Parent', 'Faculty', 'Institution', 'Employer', 'Other']
const WANT = [
  'Explore a programme',
  'Start a course',
  'Partnership enquiry',
  'Career OS',
  'Press or editorial',
  'Something else',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', iam: '', want: '', message: '' })
  const [openedMail, setOpenedMail] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const subject = form.want ? `Skylent enquiry — ${form.want}` : 'Skylent enquiry'
    const body = [
      form.name && `Name: ${form.name}`,
      form.email && `Email: ${form.email}`,
      form.iam && `I am: ${form.iam}`,
      form.want && `I want: ${form.want}`,
      '',
      form.message,
    ].filter(Boolean).join('\n')

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpenedMail(true)
  }

  const field = {
    width: '100%',
    background: S.surface,
    border: `1px solid ${S.lineStrong}`,
    borderRadius: R.control,
    padding: '11px 14px',
    fontSize: 14,
    color: S.ink,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Contact"
          title="Write to the team."
          lead="There is no enquiry desk behind this form yet. Submitting opens your email client addressed to us — nothing is stored on the site until that message is sent."
        />

        <div className="sk-grid sk-grid-2" style={{ paddingBottom: 72, alignItems: 'start' }}>
          <Card padding={24}>
            <SectionHeading size="sm" title="Send a message" />
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ ...TY.meta, color: S.inkMuted }}>Name</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={field} autoComplete="name" />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ ...TY.meta, color: S.inkMuted }}>Email</span>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={field} autoComplete="email" />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ ...TY.meta, color: S.inkMuted }}>I am</span>
                <select value={form.iam} onChange={e => setForm(f => ({ ...f, iam: e.target.value }))} style={field}>
                  <option value="">Select</option>
                  {IAM.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ ...TY.meta, color: S.inkMuted }}>I want to</span>
                <select value={form.want} onChange={e => setForm(f => ({ ...f, want: e.target.value }))} style={field}>
                  <option value="">Select</option>
                  {WANT.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ ...TY.meta, color: S.inkMuted }}>Message</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...field, resize: 'vertical' }}
                />
              </label>
              <Button type="submit" size="lg" full>Open email to {EMAIL}</Button>
            </form>
            {openedMail && (
              <div style={{ marginTop: 14 }}>
                <Note>
                  If your mail app did not open, write to{' '}
                  <a href={`mailto:${EMAIL}`} style={{ color: S.ink, fontWeight: 600 }}>{EMAIL}</a>
                  {' '}directly.
                </Note>
              </div>
            )}
          </Card>

          <div style={{ display: 'grid', gap: 14 }}>
            <Card padding={22}>
              <div style={{ ...TY.label, color: S.inkMuted, marginBottom: 8 }}>Email</div>
              <a href={`mailto:${EMAIL}`} style={{ ...TY.h3, color: S.ink, textDecoration: 'none' }}>{EMAIL}</a>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>
                That is the address this page uses. A phone number and social profiles are not published here because we
                do not have ones we are ready to stand behind.
              </p>
            </Card>
            <Card padding={22}>
              <div style={{ ...TY.label, color: S.inkMuted, marginBottom: 8 }}>Where we work</div>
              <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>India</div>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>
                Skylent is built in India. A public office address will appear here when there is one visitors can
                actually arrive at.
              </p>
            </Card>
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
