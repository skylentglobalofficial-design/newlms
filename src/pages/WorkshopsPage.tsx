import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, SectionHeader, T } from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { workshops } from '../data'
import { PHOTO } from '../media'

const accent = getDomainAccent('webinar')

export default function WorkshopsPage() {
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')
  const navigate = useNavigate()

  const categories = ['All', ...Array.from(new Set(workshops.map(w => w.category)))]
  const modes = ['All', 'Online', 'Offline', 'Hybrid']

  const filtered = workshops.filter(w => {
    const matchCat = category === 'All' || w.category === category
    const matchMode = mode === 'All' || w.mode.includes(mode)
    return matchCat && matchMode
  })

  return (
    <PageShell auroraTheme="webinar">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 32}px ${T.gutter} clamp(40px, 5vw, 56px)` }}>
        <Aurora themeId="webinar" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'center' }}>
            <FadeIn>
              <Eyebrow tone="light" accent>Workshops · coming soon</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '18px 0 14px' }}>
                Focused sessions.<br />
                <span style={{ color: accent.text }}>Practical outcomes.</span>
              </h1>
              <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: 0 }}>
                Short skill sessions are the intended workshop product. Registration, attendance, and payment are not built — these pages are listings only.
              </p>
            </FadeIn>
            <FadeIn delay={80}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
                <MediaImage src={PHOTO.workshop} alt="Workshop session" style={{ minHeight: 240 }} />
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider>
        <FadeIn>
          <SectionHeader
            tone="light"
            eyebrow="Listings"
            title={`${filtered.length} workshop${filtered.length !== 1 ? 's' : ''}`}
            lead="Filter by topic or delivery mode. Workshop registration is not live yet — these listings are marketing information only."
          />
        </FadeIn>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28, marginBottom: 32 }}>
          {[['Category', categories, category, setCategory], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
            <div key={label as string} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="skylent-label" style={{ color: C.slate }}>{label as string}</span>
              {(opts as string[]).map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => (setter as (v: string) => void)(o)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: `1px solid ${(val as string) === o ? accent.border : T.lineDark}`,
                    background: (val as string) === o ? accent.subtle : 'transparent',
                    color: (val as string) === o ? accent.text : C.slate,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
          {filtered.map((w, i) => {
            return (
              <FadeIn key={w.slug} delay={i * 50}>
                <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${T.lineDark}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                      <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 5, padding: '3px 10px', color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.category}</span>
                      <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.duration}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0 }}>{w.title}</h3>
                  </div>
                  <div style={{ padding: '18px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 16px' }}>{w.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[['Planned date', w.date], ['Mode', w.mode], ['Duration', w.duration], ['Registration', 'Not open']].map(([l, v]) => (
                        <div key={l} style={{ background: C.cream, border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: '8px 10px' }}>
                          <div className="skylent-label" style={{ color: C.slate, marginBottom: 2 }}>{l}</div>
                          <div style={{ color: C.ink, fontSize: 11, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="skylent-label" style={{ color: C.slate, marginBottom: 2 }}>Indicative price</div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: C.ink }}>₹{w.price.toLocaleString('en-IN')}</span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/workshops/${w.slug}`)}>View details</Button>
                    </div>
                  </div>
                </GlassSurface>
              </FadeIn>
            )
          })}
        </div>
      </Section>

    </PageShell>
  )
}
