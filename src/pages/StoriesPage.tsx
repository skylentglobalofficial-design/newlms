import { C, FadeIn, PageShell } from '../components/shared'
import { stories } from '../data'
import { PHOTO } from '../media'
import { T } from '../components/ui'

const PHOTOS = [PHOTO.career, PHOTO.collab, PHOTO.professional]

export default function StoriesPage() {
  const featured = stories[0]
  const rest = stories.slice(1)

  return (
    <PageShell>
      <section style={{ background: C.ink, padding: '100px 32px 56px' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 18 }}>STORIES</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 68px)', fontWeight: 600, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 18px' }}>
              Journeys, told<br />editorially.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, maxWidth: 480, lineHeight: 1.7, margin: '0 0 20px' }}>
              Verified learner stories will live here. Until then, this page shows labelled sample narratives — not placement statistics.
            </p>
            <div style={{ display: 'inline-block', background: 'rgba(243,107,33,0.12)', border: '1px solid rgba(243,107,33,0.28)', borderRadius: 8, padding: '10px 14px', color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
              Sample content — not verified outcomes or salary claims
            </div>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '48px 32px 100px' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          {featured && (
            <FadeIn>
              <article style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0, marginBottom: 28, background: C.ink, borderRadius: T.rCard, overflow: 'hidden' }} className="two-col">
                <div style={{ minHeight: 360, position: 'relative' }}>
                  <img src={PHOTOS[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }} />
                </div>
                <div style={{ padding: 'clamp(28px,4vw,48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>FEATURED · SAMPLE</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: C.white, margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                    {featured.name}: {featured.outcome}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.75, margin: '0 0 18px' }}>{featured.before}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>{featured.provided}</p>
                  <div style={{ marginTop: 22, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{featured.program} · {featured.duration}</div>
                </div>
              </article>
            </FadeIn>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="two-col">
            {rest.map((s, i) => (
              <FadeIn key={s.name} delay={i * 70}>
                <article style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, overflow: 'hidden' }}>
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <img src={PHOTOS[i + 1] ?? PHOTO.lecture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '24px 24px 28px' }}>
                    <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>SAMPLE · {s.program.toUpperCase()}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: C.ink, margin: '0 0 10px' }}>{s.name}</h3>
                    <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.7, margin: '0 0 14px' }}>{s.before}</p>
                    <p style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{s.provided}</p>
                    <div style={{ marginTop: 16, color: C.slate, fontSize: 13 }}>{s.outcome}</div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
