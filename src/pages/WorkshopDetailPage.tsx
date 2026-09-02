import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, EnrollmentModal } from '../components/shared'
import { workshops } from '../data'

export default function WorkshopDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const workshop = workshops.find(w => w.slug === slug)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!workshop) {
    return (
      <PageShell>
        <div style={{ padding: '120px 32px', textAlign: 'center', background: C.warmWhite, minHeight: '60vh' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: C.ink }}>Workshop not found</h2>
          <button onClick={() => navigate('/workshops')} style={{ color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>← Back to Workshops</button>
        </div>
      </PageShell>
    )
  }

  const pct = Math.round(((workshop.seats - workshop.seatsLeft) / workshop.seats) * 100)

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <button onClick={() => navigate('/workshops')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 28, padding: 0 }}>← Back to Workshops</button>
          <FadeIn>
            <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)', display: 'inline-block', marginBottom: 20 }}>{workshop.category}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px' }}>{workshop.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.75, maxWidth: 540, margin: '0 0 36px' }}>{workshop.desc}</p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['Duration', workshop.duration], ['Date', workshop.date], ['Instructor', workshop.instructor], ['Mode', workshop.mode]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>{(l as string).toUpperCase()}</div>
                  <div style={{ color: C.white, fontSize: 15, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section style={{ background: C.warmWhite, padding: '64px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }} className="edu-grid">
          <div>
            <FadeIn>
              <div style={{ background: C.white, borderRadius: 14, padding: 28, marginBottom: 24, border: '1px solid rgba(11,13,15,0.08)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 18px', letterSpacing: '-0.02em' }}>What you get</h2>
                {workshop.whatYouGet.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < workshop.whatYouGet.length - 1 ? '1px solid rgba(11,13,15,0.06)' : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                    </div>
                    <span style={{ color: C.ink, fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={60}>
              <div style={{ background: 'rgba(11,13,15,0.03)', border: '1px solid rgba(11,13,15,0.08)', borderRadius: 12, padding: 20 }}>
                <div style={{ color: C.slate, fontSize: 12 }}>This is a demo workshop listing. No real registration will be processed. Real Skylent workshops are conducted via the platform portal.</div>
              </div>
            </FadeIn>
          </div>

          {/* Registration card */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeIn>
              <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.1)', borderRadius: 16, padding: 26, boxShadow: '0 8px 40px rgba(11,13,15,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: C.ink }}>₹{workshop.price.toLocaleString('en-IN')}</span>
                  {workshop.originalPrice > workshop.price && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: C.slate, textDecoration: 'line-through' }}>₹{workshop.originalPrice.toLocaleString('en-IN')}</span>}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: C.slate, fontSize: 12 }}>{workshop.seatsLeft} seats left</span>
                    <span style={{ color: pct > 70 ? '#dc2626' : C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{pct}% filled</span>
                  </div>
                  <div style={{ height: 5, background: C.sand, borderRadius: 3 }}><div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#dc2626' : C.orange, borderRadius: 3, transition: 'width 0.6s ease' }} /></div>
                </div>
                <button onClick={() => setEnrollOpen(true)} style={{ width: '100%', background: C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 12, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Register Now →</button>
                <div style={{ display: 'grid', gap: 6, marginTop: 14 }}>
                  {[['Date', workshop.date], ['Duration', workshop.duration], ['Mode', workshop.mode], ['Instructor', workshop.instructor]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(11,13,15,0.06)' }}>
                      <span style={{ color: C.slate, fontSize: 13 }}>{l}</span>
                      <span style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {enrollOpen && (
        <EnrollmentModal item={{ id: workshop.slug, title: workshop.title, price: workshop.price, type: 'workshop' }} onClose={() => setEnrollOpen(false)} />
      )}
    </PageShell>
  )
}
