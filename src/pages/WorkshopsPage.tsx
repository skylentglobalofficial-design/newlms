import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, EnrollmentModal } from '../components/shared'
import { workshops } from '../data'
import type { Workshop } from '../data'

export default function WorkshopsPage() {
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')
  const [enrollItem, setEnrollItem] = useState<Workshop | null>(null)
  const navigate = useNavigate()

  const categories = ['All', ...Array.from(new Set(workshops.map(w => w.category)))]
  const modes = ['All', 'Online', 'Offline', 'Hybrid']

  const filtered = workshops.filter(w => {
    const matchCat = category === 'All' || w.category === category
    const matchMode = mode === 'All' || w.mode.includes(mode)
    return matchCat && matchMode
  })

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '100px 32px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>SKYLENT WORKSHOPS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Intensive. Practical.<br /><span style={{ color: C.orange }}>Hands-on.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: 0 }}>Short-form, high-impact sessions led by industry practitioners. Learn a focused skill in hours, not months.</p>
          </FadeIn>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ background: C.warmWhite, padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            {[['Category', categories, category, setCategory], ['Mode', modes, mode, setMode]].map(([label, opts, val, setter]) => (
              <div key={label as string} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{label as string}:</span>
                {(opts as string[]).map(o => (
                  <button key={o} onClick={() => (setter as (v: string) => void)(o)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${(val as string) === o ? C.ink : 'rgba(11,13,15,0.15)'}`, background: (val as string) === o ? C.ink : 'transparent', color: (val as string) === o ? C.white : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>{o}</button>
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="three-col">
            {filtered.map((w, i) => {
              const pct = Math.round(((w.seats - w.seatsLeft) / w.seats) * 100)
              return (
                <FadeIn key={w.slug} delay={i * 50}>
                  <div style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(11,13,15,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                  >
                    <div style={{ background: 'linear-gradient(135deg, #1a1e22 0%, #0f1114 100%)', padding: '28px 24px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 5, padding: '3px 10px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.category}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{w.duration}</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>{w.title}</h3>
                    </div>
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.65, margin: '0 0 16px' }}>{w.desc}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                        {[['Date', w.date], ['Mode', w.mode], ['Instructor', w.instructor.split(' ').slice(0,2).join(' ')], ['Duration', w.duration]].map(([l, v]) => (
                          <div key={l} style={{ background: C.sand, borderRadius: 7, padding: '8px 12px' }}>
                            <div style={{ color: C.slate, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{(l as string).toUpperCase()}</div>
                            <div style={{ color: C.ink, fontSize: 11, fontWeight: 600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {/* Seat availability */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ color: C.slate, fontSize: 11 }}>{w.seatsLeft} seats left</span>
                          <span style={{ color: pct > 70 ? '#dc2626' : C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{pct}% filled</span>
                        </div>
                        <div style={{ height: 4, background: C.sand, borderRadius: 2 }}><div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#dc2626' : C.orange, borderRadius: 2 }} /></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: C.ink }}>₹{w.price.toLocaleString('en-IN')}</span>
                          {w.originalPrice > w.price && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate, textDecoration: 'line-through', marginLeft: 7 }}>₹{w.originalPrice.toLocaleString('en-IN')}</span>}
                        </div>
                        <button onClick={() => navigate(`/workshops/${w.slug}`)} style={{ background: C.orange, border: 'none', color: C.white, borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >Register Now</button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {enrollItem && (
        <EnrollmentModal item={{ id: enrollItem.slug, title: enrollItem.title, price: enrollItem.price, type: 'workshop' }} onClose={() => setEnrollItem(null)} />
      )}
    </PageShell>
  )
}
