import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, SectionHeader, T, MarketingHero } from '../components/ui'
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
      <MarketingHero
        auroraTheme="webinar"
        eyebrow="Workshops"
        title={<>Focused sessions.<br /><span style={{ color: accent.text }}>Practical outcomes.</span></>}
        lead="Short live workshops on specific skills — register, attend, and leave with something you can apply the same week."
        visual={
          <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
            <MediaImage src={PHOTO.workshop} alt="Workshop session" style={{ minHeight: 240 }} aspect="21/9" />
          </GlassSurface>
        }
      />

      <Section tone="canvas" divider>
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Upcoming"
            title={`${filtered.length} workshop${filtered.length !== 1 ? 's' : ''}`}
            lead="Filter by topic or delivery mode. Seat counts are illustrative for this demo catalog."
          />
        </FadeIn>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28, marginBottom: 32 }}>
          {[['Category', categories, category, setCategory], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
            <div key={label as string} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)' }}>{label as string}</span>
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
                    color: (val as string) === o ? accent.text : 'rgba(255,255,255,0.5)',
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
            const pct = Math.round(((w.seats - w.seatsLeft) / w.seats) * 100)
            return (
              <FadeIn key={w.slug} delay={i * 50}>
                <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${T.lineDark}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                      <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 5, padding: '3px 10px', color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.category}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.duration}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0 }}>{w.title}</h3>
                  </div>
                  <div style={{ padding: '18px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.65, margin: '0 0 16px' }}>{w.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[['Date', w.date], ['Mode', w.mode], ['Host', w.instructor.split(' ').slice(0, 2).join(' ')], ['Duration', w.duration]].map(([l, v]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: '8px 10px' }}>
                          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 2 }}>{l}</div>
                          <div style={{ color: C.white, fontSize: 11, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{w.seatsLeft} seats left (demo)</span>
                        <span style={{ color: pct > 70 ? '#f87171' : 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{pct}% filled</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#f87171' : accent.primary, borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: C.white }}>₹{w.price.toLocaleString('en-IN')}</span>
                        {w.originalPrice > w.price && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', marginLeft: 7 }}>₹{w.originalPrice.toLocaleString('en-IN')}</span>
                        )}
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
