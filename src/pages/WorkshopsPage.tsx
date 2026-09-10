import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Button, Eyebrow, Section, SectionHeader, T,
  FilterChip, publicHeroTitle, publicHeroLead,
  catalogMetaBoxStyle, catalogCardTitle, catalogCardBody,
} from '../components/ui'
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

  const filterGroups = [
    { label: 'Category', options: categories, value: category, set: setCategory },
    { label: 'Mode', options: modes, value: mode, set: setMode },
  ]

  return (
    <PageShell auroraTheme="webinar">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 32}px ${T.gutter} clamp(40px, 5vw, 56px)` }}>
        <Aurora themeId="webinar" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'center' }}>
            <FadeIn>
              <Eyebrow accent>Workshops</Eyebrow>
              <h1 className="skylent-display-lg" style={publicHeroTitle}>
                Focused sessions.<br />
                <span style={{ color: accent.text }}>Practical outcomes.</span>
              </h1>
              <p className="skylent-body-lg" style={{ ...publicHeroLead, maxWidth: 480, margin: 0 }}>
                Short live workshops on specific skills — register, attend, and leave with something you can apply the same week.
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
            eyebrow="Upcoming"
            title={`${filtered.length} workshop${filtered.length !== 1 ? 's' : ''}`}
            lead="Filter by topic or delivery mode. Registration is not live yet — these listings are informational only."
          />
        </FadeIn>

        <div
          style={{
            marginTop: 24,
            marginBottom: 28,
            padding: '14px 18px',
            borderRadius: T.rControl,
            border: `1px solid ${T.lineLight}`,
            background: '#FFFDFC',
            color: C.slate,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Workshop registration opens soon. You can review topics and schedules now; booking will be enabled when sessions go live.
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          {filterGroups.map(({ label, options, value, set }) => (
            <div key={label} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="skylent-label" style={{ color: C.slate, marginRight: 4 }}>{label}</span>
              {options.map(o => (
                <FilterChip
                  key={o}
                  label={o}
                  active={value === o}
                  onClick={() => set(o)}
                  themeId="webinar"
                />
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
          {filtered.map((w, i) => (
            <FadeIn key={w.slug} delay={i * 50}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${T.lineLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                    <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 5, padding: '3px 10px', color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.category}</span>
                    <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.duration}</span>
                  </div>
                  <h3 style={catalogCardTitle}>{w.title}</h3>
                </div>
                <div style={{ padding: '18px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ ...catalogCardBody, margin: '0 0 16px' }}>{w.desc}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[['Date', w.date], ['Mode', w.mode], ['Host', w.instructor.split(' ').slice(0, 2).join(' ')], ['Duration', w.duration]].map(([l, v]) => (
                      <div key={l} style={catalogMetaBoxStyle}>
                        <div className="skylent-label" style={{ color: C.slate, marginBottom: 2, opacity: 0.7 }}>{l}</div>
                        <div style={{ color: C.ink, fontSize: 11, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginBottom: 16,
                      padding: '10px 12px',
                      borderRadius: T.rControl,
                      border: `1px solid ${T.lineLight}`,
                      background: 'rgba(11,13,15,0.02)',
                      fontSize: 12,
                      color: C.slate,
                    }}
                  >
                    Registration not open · {w.seatsLeft} of {w.seats} seats planned
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: C.ink }}>₹{w.price.toLocaleString('en-IN')}</span>
                      {w.originalPrice > w.price && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate, textDecoration: 'line-through', marginLeft: 7 }}>₹{w.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/workshops/${w.slug}`)}>View details</Button>
                  </div>
                </div>
              </GlassSurface>
            </FadeIn>
          ))}
        </div>
      </Section>
    </PageShell>
  )
}
