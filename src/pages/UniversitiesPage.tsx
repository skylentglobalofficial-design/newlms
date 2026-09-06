import { C, FadeIn, PageShell } from '../components/shared'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('institution')

export default function UniversitiesPage() {
  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '100px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20 }}>UNIVERSITIES</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 20px' }}>
              Degree pathways<br /><span style={{ color: accent.text }}>for institutions.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.44)', fontSize: 18, lineHeight: 1.75, maxWidth: 540, margin: '0 0 16px' }}>
              How Skylent supports university-grade program delivery — curriculum design, LMS infrastructure, and career readiness workflows.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
              Example program listings below are illustrative. We do not publish partner university names or placement outcomes we cannot verify.
            </p>
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
                { num: '01', title: 'Program Design', desc: 'University academic input aligned with industry-ready curriculum structure on Skylent.' },
                { num: '02', title: 'Delivery', desc: 'Faculty workflows, learner management, and LMS infrastructure on one platform.' },
                { num: '03', title: 'Outcomes', desc: 'Certification tracking and Career OS support — documented when programs go live.' },
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Example university programs.</h2>
              <p style={{ color: C.slate, fontSize: 13, margin: '0 0 32px' }}>Sample listings for product exploration — not verified partnerships or live enrollments.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
                {[
                  { name: 'B.Sc. Data Science', dur: '3 years', focus: 'Data & analytics pathway' },
                  { name: 'PG Diploma in AI', dur: '1 year', focus: 'Applied AI & ML' },
                  { name: 'MBA Tech', dur: '2 years', focus: 'Product & technology management' },
                ].map(p => (
                  <div key={p.name} style={{ background: C.sand, borderRadius: 12, padding: 24 }}>
                    <div style={{ background: C.white, display: 'inline-block', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{p.dur}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>{p.name}</h3>
                    <div style={{ color: C.slate, fontSize: 12, marginBottom: 14 }}>Example program</div>
                    <div style={{ color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Focus: {p.focus}</div>
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
