import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, T } from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { workshops } from '../data'
import { PHOTO } from '../media'

const accent = getDomainAccent('webinar')

export default function WorkshopDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const workshop = workshops.find(w => w.slug === slug)

  if (!workshop) {
    return (
      <PageShell auroraTheme="webinar">
        <Section tone="canvas" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="skylent-display-md" style={{ color: C.ink }}>Workshop not found</h2>
            <Button variant="secondary" onClick={() => navigate('/workshops')} style={{ marginTop: 16 }}>← Back to workshops</Button>
          </div>
        </Section>
      </PageShell>
    )
  }

  const pct = Math.round(((workshop.seats - workshop.seatsLeft) / workshop.seats) * 100)

  return (
    <PageShell auroraTheme="webinar">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} clamp(36px, 5vw, 56px)` }}>
        <Aurora themeId="webinar" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => navigate('/workshops')}
            style={{ background: 'none', border: 'none', color: C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 24, padding: 0 }}
          >
            ← Back to workshops
          </button>

          <div className="workshop-event-hero two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'start' }}>
            <FadeIn>
              <Eyebrow  accent>Live workshop</Eyebrow>
              <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 6, padding: '4px 12px', color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)', display: 'inline-block', margin: '14px 0 18px' }}>{workshop.category}</span>
              <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 16px' }}>{workshop.title}</h1>
              <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 520, margin: '0 0 24px' }}>{workshop.desc}</p>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', maxWidth: 480 }}>
                <MediaImage src={PHOTO.workshop} alt="" style={{ minHeight: 200 }} />
              </GlassSurface>
            </FadeIn>

            <FadeIn delay={80}>
              <GlassSurface level={2} padding="24px 26px">
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Event details</div>
                <div style={{ display: 'grid', gap: 16, marginBottom: 22 }}>
                  {[
                    { label: 'Date', value: workshop.date, emphasis: true },
                    { label: 'Duration', value: workshop.duration },
                    { label: 'Format', value: workshop.mode },
                    { label: 'Host', value: workshop.instructor },
                  ].map(row => (
                    <div key={row.label} style={{ paddingBottom: 14, borderBottom: `1px solid ${T.lineLight}` }}>
                      <div className="skylent-label" style={{ color: C.slate, marginBottom: 6 }}>{row.label}</div>
                      <div style={{ color: C.ink, fontSize: row.emphasis ? 20 : 15, fontWeight: row.emphasis ? 600 : 500, fontFamily: row.emphasis ? 'var(--font-display)' : 'var(--font-body)' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: C.slate, fontSize: 12 }}>{workshop.seatsLeft} seats left (illustrative)</span>
                    <span style={{ color: pct > 70 ? '#f87171' : C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{pct}% filled</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(11,13,15,0.08)', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#f87171' : accent.primary, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.ink }}>₹{workshop.price.toLocaleString('en-IN')}</span>
                  {workshop.originalPrice > workshop.price && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: C.slate, textDecoration: 'line-through' }}>₹{workshop.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div style={{ background: '#FFFDFC', border: `1px solid ${T.lineLight}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                    Workshop registration is not live yet. This page is marketing information only until a workshop backend is added.
                  </p>
                </div>
                <Button variant="secondary" size="lg" onClick={() => navigate('/contact')} style={{ width: '100%' }}>
                  Contact us about workshops
                </Button>
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'clamp(28px, 4vw, 40px)', alignItems: 'start' }} className="edu-grid">
          <div>
            <FadeIn>
              <GlassSurface level={2} padding="24px 28px" style={{ marginBottom: 20 }}>
                <Eyebrow  accent>Session outline</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.ink, margin: '12px 0 20px' }}>What the session covers</h2>
                {workshop.whatYouGet.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < workshop.whatYouGet.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent.primary, marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: C.slate, fontSize: 14, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </GlassSurface>
            </FadeIn>
          </div>

          <div className="workshop-sticky-panel" style={{ position: 'sticky', top: T.navH + 16 }}>
            <FadeIn delay={40}>
              <GlassSurface level={2} padding="22px 24px">
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 14 }}>Registration status</div>
                <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 18px' }}>
                  Workshop registration is not live yet. Seat counts and pricing shown here are illustrative marketing data.
                </p>
                <Button variant="secondary" onClick={() => navigate('/contact')} style={{ width: '100%' }}>
                  Get notified
                </Button>
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </Section>
    </PageShell>
  )
}
