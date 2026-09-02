import { C, IMG, FadeIn, PageShell } from '../components/shared'

export default function AboutPage() {
  return (
    <PageShell>
      <section style={{ background: C.warmWhite, overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 500 }}>
          <img src={IMG.studentsLecture} alt="Students in a modern learning environment" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(248,246,242,0.3) 0%, rgba(248,246,242,0.98) 90%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 60px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 16 }}>WHY WE EXIST</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 700, color: C.ink, letterSpacing: '-0.035em', lineHeight: 0.98, margin: 0 }}>
              Education should not<br />end when the class ends.
            </h1>
          </div>
        </div>
      </section>

      <section style={{ background: C.warmWhite, padding: '80px 32px 120px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ width: 48, height: 3, background: C.orange, borderRadius: 2, marginBottom: 56 }} />
          </FadeIn>
          <FadeIn delay={60}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 72 }} className="two-col">
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: C.ink, lineHeight: 1.7, margin: '0 0 24px', fontWeight: 400 }}>The world of work is changing faster than traditional education can keep up.</p>
                <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.85, margin: 0 }}>Students need more than lectures. They need projects, tools, mentorship, and a path to employment that doesn't require luck or the right contacts.</p>
              </div>
              <div>
                <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.85, margin: '0 0 24px' }}>Institutions need more than classrooms. Industry needs more than degrees. They need graduates who can contribute from day one — not after another 12 months of on-the-job re-training.</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: C.ink, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>Skylent exists to connect all three.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 72 }} className="three-col">
              {[
                { label: 'Education', body: 'Structured, outcome-driven programs. Every module, project, and assessment designed around where the learner wants to go — not just what the syllabus requires.' },
                { label: 'Technology', body: 'Skylent OS — a full learning operating system that supports students, faculty, and administrators. Built to be replaced by real product as the platform grows.' },
                { label: 'Career', body: 'The job is the outcome. Every program traces a direct line from first lesson to first offer. Industry partnerships, portfolio support, and a hiring ecosystem built in from day one.' },
              ].map((col, i) => (
                <div key={col.label} style={{ background: i === 1 ? C.ink : C.sand, padding: 36, borderRadius: 4 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: i === 1 ? C.orange : C.ink, margin: '0 0 14px' }}>{col.label}</div>
                  <p style={{ color: i === 1 ? 'rgba(255,255,255,0.45)' : C.slate, fontSize: 14, lineHeight: 1.78, margin: 0 }}>{col.body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={140}>
            <div style={{ borderLeft: `3px solid ${C.orange}`, paddingLeft: 32 }}>
              <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 30px)', color: C.ink, fontWeight: 500, lineHeight: 1.55, margin: '0 0 20px', letterSpacing: '-0.015em' }}>
                "The next generation of education infrastructure doesn't start with technology. It starts with what a student needs to do the day after graduation."
              </blockquote>
              <div style={{ color: C.slate, fontSize: 13, fontFamily: 'var(--font-mono)' }}>— Skylent Global</div>
            </div>
          </FadeIn>
        </div>
      </section>
    </PageShell>
  )
}
