import { useState, type CSSProperties } from 'react'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, T } from '../components/ui'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('general')
const CONTACT_EMAIL = 'hello@skylent.in'

function fieldStyle(focused: boolean): CSSProperties {
  return {
    width: '100%',
    background: C.cream,
    border: `1px solid ${focused ? accent.primary : T.lineDark}`,
    borderRadius: T.rControl,
    padding: '11px 14px',
    fontSize: 14,
    color: C.ink,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', iam: '', iwant: '', message: '' })
  const [focused, setFocused] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Skylent enquiry — ${form.iwant || 'General'}`)
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone || '—'}`,
        `I am a: ${form.iam}`,
        `I want to: ${form.iwant}`,
        '',
        form.message,
      ].join('\n'),
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  const contactItems = [
    { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { label: 'Office', value: 'Bengaluru, India', href: undefined },
  ]

  return (
    <PageShell auroraTheme="general">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 28}px ${T.gutter} clamp(40px, 5vw, 56px)` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <Eyebrow tone="light" accent>Contact Skylent</Eyebrow>
            <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '18px 0 14px', maxWidth: 560 }}>
              Reach the team directly.
            </h1>
            <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: 0 }}>
              Questions about programs, partnerships, or institutional delivery — email {CONTACT_EMAIL}. This page opens your mail client; it does not send a ticket on its own.
            </p>
          </FadeIn>
        </div>
      </section>

      <section style={{ position: 'relative', padding: `${T.sectionTight} ${T.gutter}` }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start' }} className="edu-grid">
          <div>
            <FadeIn>
              <GlassSurface level={2} padding="clamp(28px, 4vw, 40px)">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Compose an enquiry</h2>
                <p style={{ color: C.slate, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                  Required fields are marked. Submit opens a mailto draft to {CONTACT_EMAIL}. No enquiry is recorded until you send that email.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="two-col-sm">
                    {([['Full Name', 'name', 'text', 'Your full name'], ['Email', 'email', 'email', 'your@email.com']] as const).map(([label, field, type, ph]) => (
                      <div key={field}>
                        <label htmlFor={`contact-${field}`} style={{ display: 'block', color: C.slate, fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{label.toUpperCase()}</label>
                        <input
                          id={`contact-${field}`}
                          name={field}
                          type={type}
                          placeholder={ph}
                          required
                          autoComplete={field === 'email' ? 'email' : 'name'}
                          value={form[field]}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                          style={fieldStyle(focused === field)}
                          onFocus={() => setFocused(field)}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="contact-phone" style={{ display: 'block', color: C.slate, fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>PHONE (OPTIONAL)</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="Your number, if you want a callback"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      style={fieldStyle(focused === 'phone')}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="two-col-sm">
                    <div>
                      <label htmlFor="contact-iam" style={{ display: 'block', color: C.slate, fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>I AM A</label>
                      <select
                        id="contact-iam"
                        name="iam"
                        required
                        value={form.iam}
                        onChange={e => setForm(f => ({ ...f, iam: e.target.value }))}
                        style={{ ...fieldStyle(focused === 'iam'), cursor: 'pointer', color: form.iam ? C.ink : C.slate }}
                        onFocus={() => setFocused('iam')}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="">Select...</option>
                        {['Student', 'Parent', 'Institution', 'University', 'Industry', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-iwant" style={{ display: 'block', color: C.slate, fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>I WANT TO</label>
                      <select
                        id="contact-iwant"
                        name="iwant"
                        required
                        value={form.iwant}
                        onChange={e => setForm(f => ({ ...f, iwant: e.target.value }))}
                        style={{ ...fieldStyle(focused === 'iwant'), cursor: 'pointer', color: form.iwant ? C.ink : C.slate }}
                        onFocus={() => setFocused('iwant')}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="">Select...</option>
                        {['Explore Courses', 'Join a Program', 'Attend a Workshop', 'Partner With Skylent', 'Institutional LMS', 'Career Support', 'General Enquiry'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label htmlFor="contact-message" style={{ display: 'block', color: C.slate, fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>MESSAGE</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      placeholder="Tell us a bit about what you are looking for..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...fieldStyle(focused === 'message'), resize: 'vertical' }}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  <Button type="submit" variant="primary" style={{ width: '100%' }}>Open email draft →</Button>
                </form>
              </GlassSurface>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={60}>
              <div style={{ marginBottom: 20 }}>
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Get in touch</div>
                {contactItems.map(({ label, value, href }) => (
                  <GlassSurface key={label} level={1} padding="16px 18px" style={{ marginBottom: 10 }}>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>{label.toUpperCase()}</div>
                    {href ? (
                      <a href={href} style={{ color: C.ink, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>{value}</a>
                    ) : (
                      <div style={{ color: C.ink, fontSize: 15, fontWeight: 500 }}>{value}</div>
                    )}
                  </GlassSurface>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <GlassSurface level={1} padding="22px 24px">
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>Channels</div>
                <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                  Public social profiles are not published here yet. Use email until official channel links are available.
                </p>
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
