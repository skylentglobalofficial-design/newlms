import { C, FadeIn, PageShell } from '../components/shared'

export default function UniversitiesPage() {
  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '100px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>UNIVERSITIES</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Degrees that<br /><span style={{ color: C.orange }}>deliver careers.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.44)', fontSize: 18, lineHeight: 1.75, maxWidth: 540, margin: 0 }}>Skylent partners with accredited universities to co-deliver programs that combine academic rigour with real-world outcomes.</p>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: C.ink, margin: '0 0 48px', letterSpacing: '-0.025em' }}>The university collaboration model.</h2>
          </FadeIn>
          <FadeIn delay={60}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }} className="three-col">
              {[
                { num: '01', title: 'Program Design', desc: 'University academic input + Skylent industry alignment = future-ready curriculum.' },
                { num: '02', title: 'Delivery', desc: 'University faculty + Skylent instructors + Skylent LMS infrastructure.' },
                { num: '03', title: 'Outcomes', desc: 'University certification + Skylent career support + industry placement pipeline.' },
              ].map((col, i) => (
                <div key={col.num} style={{ background: i === 1 ? C.ink : C.sand, padding: 36, borderRadius: 4 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: i === 1 ? 'rgba(255,255,255,0.07)' : 'rgba(11,13,15,0.07)', marginBottom: 24, lineHeight: 1 }}>{col.num}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: i === 1 ? C.white : C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{col.title}</h3>
                  <p style={{ color: i === 1 ? 'rgba(255,255,255,0.42)' : C.slate, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{col.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ marginTop: 64 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 32px', letterSpacing: '-0.02em' }}>University programs available.</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
                {[
                  { name: 'B.Sc. Data Science', univ: 'Partner University', dur: '3 years', outcome: 'Data Scientist' },
                  { name: 'PG Diploma in AI', univ: 'Partner University', dur: '1 year', outcome: 'AI Engineer' },
                  { name: 'MBA Tech', univ: 'Partner University', dur: '2 years', outcome: 'Product Manager' },
                ].map(p => (
                  <div key={p.name} style={{ background: C.sand, borderRadius: 12, padding: 24 }}>
                    <div style={{ background: C.white, display: 'inline-block', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{p.dur}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>{p.name}</h3>
                    <div style={{ color: C.slate, fontSize: 12, marginBottom: 14 }}>{p.univ}</div>
                    <div style={{ color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Career outcome: {p.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </PageShell>
  )
}
