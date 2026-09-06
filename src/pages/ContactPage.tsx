import { useState, type CSSProperties } from 'react'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, T } from '../components/ui'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('general')

function fieldStyle(focused: boolean): CSSProperties {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? accent.primary : T.lineDark}`,
    borderRadius: T.rControl,
    padding: '11px 14px',
    fontSize: 14,
    color: C.white,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', iam: '', iwant: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [refNo] = useState(`SKY-ENQ-${Date.now().toString().slice(-8)}`)
  const [focused, setFocused] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const contactItems = [
    { label: 'Email', value: 'hello@skylent.in', href: 'mailto:hello@skylent.in' },
    { label: 'Phone', value: '+91 88800 00000', href: 'tel:+918880000000' },
    { label: 'Office', value: 'Bengaluru, India', href: undefined },
  ]

  return (
    <PageShell auroraTheme="general">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 28}px ${T.gutter} clamp(40px, 5vw, 56px)` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <Eyebrow tone="dark" accent>Contact Skylent</Eyebrow>
            <h1 className="skylent-display-lg" style={{ color: C.white, margin: '18px 0 14px', maxWidth: 560 }}>
              Reach the team directly.
            </h1>
            <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: 0 }}>
              Questions about programs, partnerships, or institutional delivery — send an enquiry and we will respond within one business day.
            </p>
          </FadeIn>
        </div>
      </section>

      <section style={{ position: 'relative', padding: `${T.sectionTight} ${T.gutter}` }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start' }} className="edu-grid">
          <div>
            {submitted ? (
              <FadeIn>
                <GlassSurface level={2} padding="clamp(32px, 5vw, 48px)" style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: C.white, fontWeight: 700 }}>✓</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: C.white, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Enquiry received</h2>
                  <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px' }}>Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '14px 20px', display: 'inline-block', marginBottom: 20 }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>YOUR ENQUIRY REFERENCE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: C.white, fontWeight: 700, letterSpacing: '0.05em' }}>{refNo}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>Demo submission — no real email was sent.</div>
                </GlassSurface>
              </FadeIn>
            ) : (
              <FadeIn>
                <GlassSurface level={2} padding="clamp(28px, 4vw, 40px)">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.white, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Send an enquiry</h2>
                  <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>Tell us who you are and what you need. Required fields are marked.</p>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="two-col-sm">
                      {[['Full Name', 'name', 'text', 'Your full name'], ['Email', 'email', 'email', 'your@email.com']].map(([label, field, type, ph]) => (
                        <div key={field}>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{(label as string).toUpperCase()}</label>
                          <input
                            type={type as string}
                            placeholder={ph as string}
                            required
                            value={(form as Record<string, string>)[field as string]}
                            onChange={e => setForm(f => ({ ...f, [field as string]: e.target.value }))}
                            style={fieldStyle(focused === field)}
                            onFocus={() => setFocused(field as string)}
                            onBlur={() => setFocused(null)}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>PHONE</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        style={fieldStyle(focused === 'phone')}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="two-col-sm">
                      <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>I AM A</label>
                        <select
                          required
                          value={form.iam}
                          onChange={e => setForm(f => ({ ...f, iam: e.target.value }))}
                          style={{ ...fieldStyle(focused === 'iam'), cursor: 'pointer', color: form.iam ? C.white : 'rgba(255,255,255,0.35)' }}
                          onFocus={() => setFocused('iam')}
                          onBlur={() => setFocused(null)}
                        >
                          <option value="">Select...</option>
                          {['Student', 'Parent', 'Institution', 'University', 'Industry', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>I WANT TO</label>
                        <select
                          required
                          value={form.iwant}
                          onChange={e => setForm(f => ({ ...f, iwant: e.target.value }))}
                          style={{ ...fieldStyle(focused === 'iwant'), cursor: 'pointer', color: form.iwant ? C.white : 'rgba(255,255,255,0.35)' }}
                          onFocus={() => setFocused('iwant')}
                          onBlur={() => setFocused(null)}
                        >
                          <option value="">Select...</option>
                          {['Explore Courses', 'Join a Program', 'Attend a Workshop', 'Partner With Skylent', 'Institutional LMS', 'Career Support', 'General Enquiry'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>MESSAGE</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us a bit about what you are looking for..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        style={{ ...fieldStyle(focused === 'message'), resize: 'vertical' }}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                    <Button type="submit" variant="primary" style={{ width: '100%' }}>Submit Enquiry →</Button>
                  </form>
                </GlassSurface>
              </FadeIn>
            )}
          </div>

          <div>
            <FadeIn delay={60}>
              <div style={{ marginBottom: 20 }}>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 16 }}>Get in touch</div>
                {contactItems.map(({ label, value, href }) => (
                  <GlassSurface key={label} level={1} padding="16px 18px" style={{ marginBottom: 10 }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>{label.toUpperCase()}</div>
                    {href ? (
                      <a href={href} style={{ color: C.white, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>{value}</a>
                    ) : (
                      <div style={{ color: C.white, fontSize: 15, fontWeight: 500 }}>{value}</div>
                    )}
                  </GlassSurface>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <GlassSurface level={1} padding="22px 24px">
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 12 }}>Social</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['LinkedIn', 'Twitter', 'YouTube', 'Instagram'].map(s => (
                    <span
                      key={s}
                      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: '8px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
