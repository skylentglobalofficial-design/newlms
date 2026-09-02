import { useState } from 'react'
import { C, FadeIn, PageShell } from '../components/shared'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', iam: '', iwant: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [refNo] = useState(`SKY-ENQ-${Date.now().toString().slice(-8)}`)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>CONTACT SKYLENT</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Let us talk<br /><span style={{ color: C.orange }}>about your future.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: 0 }}>Whether you want to learn, teach, partner, or build — we would love to hear from you.</p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section style={{ background: C.warmWhite, padding: '72px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'start' }} className="edu-grid">
          {/* Form */}
          <div>
            {submitted ? (
              <FadeIn>
                <div style={{ background: C.white, borderRadius: 18, padding: 48, border: '1px solid rgba(11,13,15,0.08)', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #ff9a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 26, color: 'white', fontWeight: 700 }}>✓</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Enquiry received.</h2>
                  <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 28px' }}>Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                  <div style={{ background: C.sand, borderRadius: 10, padding: '16px 24px', display: 'inline-block', marginBottom: 28 }}>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>YOUR ENQUIRY REFERENCE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: C.ink, fontWeight: 700, letterSpacing: '0.05em' }}>{refNo}</div>
                  </div>
                  <div style={{ background: 'rgba(11,13,15,0.04)', borderRadius: 8, padding: 12, color: C.slate, fontSize: 12 }}>Demo submission — no real email was sent.</div>
                </div>
              </FadeIn>
            ) : (
              <FadeIn>
                <form onSubmit={handleSubmit} style={{ background: C.white, borderRadius: 18, padding: 40, border: '1px solid rgba(11,13,15,0.08)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: C.ink, margin: '0 0 28px', letterSpacing: '-0.02em' }}>Send an enquiry</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    {[['Full Name', 'name', 'text', 'Your full name'], ['Email', 'email', 'email', 'your@email.com']].map(([label, field, type, ph]) => (
                      <div key={field}>
                        <label style={{ display: 'block', color: C.slate, fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{(label as string).toUpperCase()}</label>
                        <input type={type as string} placeholder={ph as string} required value={(form as Record<string, string>)[field as string]} onChange={e => setForm(f => ({ ...f, [field as string]: e.target.value }))} style={{ width: '100%', background: C.sand, border: '1px solid transparent', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: C.ink, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = C.orange)}
                          onBlur={e => (e.target.style.borderColor = 'transparent')}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: C.slate, fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>PHONE</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ width: '100%', background: C.sand, border: '1px solid transparent', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: C.ink, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = C.orange)}
                      onBlur={e => (e.target.style.borderColor = 'transparent')}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', color: C.slate, fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>I AM A</label>
                      <select required value={form.iam} onChange={e => setForm(f => ({ ...f, iam: e.target.value }))} style={{ width: '100%', background: C.sand, border: '1px solid transparent', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: form.iam ? C.ink : C.slate, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                        <option value="">Select...</option>
                        {['Student', 'Parent', 'Institution', 'University', 'Industry', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: C.slate, fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>I WANT TO</label>
                      <select required value={form.iwant} onChange={e => setForm(f => ({ ...f, iwant: e.target.value }))} style={{ width: '100%', background: C.sand, border: '1px solid transparent', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: form.iwant ? C.ink : C.slate, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                        <option value="">Select...</option>
                        {['Explore Courses', 'Join a Program', 'Attend a Workshop', 'Partner With Skylent', 'Institutional LMS', 'Career Support', 'General Enquiry'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: C.slate, fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>MESSAGE</label>
                    <textarea rows={4} placeholder="Tell us a bit about what you are looking for..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ width: '100%', background: C.sand, border: '1px solid transparent', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: C.ink, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s', resize: 'vertical', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = C.orange)}
                      onBlur={e => (e.target.style.borderColor = 'transparent')}
                    />
                  </div>
                  <button type="submit" style={{ width: '100%', background: C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '15px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >Submit Enquiry →</button>
                </form>
              </FadeIn>
            )}
          </div>

          {/* Contact info */}
          <div>
            <FadeIn>
              <div style={{ marginBottom: 32 }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>GET IN TOUCH</div>
                {[['Email', 'hello@skylent.in'], ['Phone', '+91 88800 00000'], ['Office', 'Bengaluru, India']].map(([l, v]) => (
                  <div key={l} style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 10, padding: '16px 20px', marginBottom: 10 }}>
                    <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
                    <div style={{ color: C.ink, fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={60}>
              <div style={{ background: C.ink, borderRadius: 14, padding: 28 }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>SOCIAL</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['LinkedIn', 'Twitter', 'YouTube', 'Instagram'].map(s => (
                    <div key={s} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 16px', color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = C.white; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                    >{s}</div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
