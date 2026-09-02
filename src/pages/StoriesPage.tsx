import { C, FadeIn, PageShell } from '../components/shared'
import { stories } from '../data'

export default function StoriesPage() {
  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '100px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>TRANSFORMATIONS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Real people.<br /><span style={{ color: C.orange }}>Real outcomes.</span>
            </h1>
            <div style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 9, padding: '12px 18px', display: 'inline-block' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>SAMPLE CONTENT</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>These are representative sample stories. Verified real stories will replace this section when available.</div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {stories.map((s, i) => (
            <FadeIn key={s.name} delay={i * 80}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginBottom: 2 }} className="three-col">
                <div style={{ background: C.sand, padding: 40 }}>
                  <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>BEFORE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, rgba(243,107,33,0.6), rgba(243,107,33,0.3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 18, fontWeight: 700 }}>{s.initials}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink }}>{s.name}</div>
                      <div style={{ color: C.slate, fontSize: 13, marginTop: 2 }}>{s.outcome}</div>
                    </div>
                  </div>
                  <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{s.before}</p>
                </div>
                <div style={{ background: C.ink, padding: 40 }}>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>SKYLENT PROVIDED</div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75, margin: '0 0 24px' }}>{s.provided}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Live Classes', 'Projects', 'Mentorship', 'Career Prep'].map(tag => (
                      <span key={tag} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.orange, padding: 40 }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>NOW</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: C.white, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 }}>{s.salary}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{s.outcome.split(' at ')[0]}</div>
                  {s.outcome.includes(' at ') && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{s.outcome.split(' at ')[1]}</div>}
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 14 }}>Completed in {s.duration}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
