import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell, EnrollmentModal } from '../components/shared'
import { Button, Eyebrow, Section, T } from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { courses } from '../data'
import { useCatalogCourse } from '../hooks/useCatalog'
import { coursePhoto } from '../media'

const accent = getDomainAccent('professional')

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = courses.find(c => c.slug === slug)
  const catalog = useCatalogCourse(slug)
  const [expandedModule, setExpandedModule] = useState<string | null>(course?.modules[0]?.id ?? null)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!course) {
    return (
      <PageShell auroraTheme="professional">
        <Section tone="canvas" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="skylent-display-md" style={{ color: C.ink }}>Course not found</h2>
            <Button variant="secondary" onClick={() => navigate('/courses')} style={{ marginTop: 16 }}>← Back to courses</Button>
          </div>
        </Section>
      </PageShell>
    )
  }

  const price = catalog.data?.price ?? course.price
  const originalPrice = catalog.data?.originalPrice ?? course.originalPrice
  const lessonCount = catalog.data?.lessonCount ?? course.lessons
  const projectCount = catalog.data?.projectCount ?? course.projects
  const enrollable = Boolean(catalog.data)
  const discount = Math.round((1 - price / originalPrice) * 100)
  const visual = coursePhoto(course.slug)

  return (
    <PageShell auroraTheme="professional">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} clamp(40px, 5vw, 64px)` }}>
        <Aurora themeId="professional" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => navigate('/courses')}
            style={{ background: 'none', border: 'none', color: C.slate, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 24, padding: 0 }}
          >
            ← Back to courses
          </button>
          <div className="two-col hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 56px)', alignItems: 'start' }}>
            <FadeIn>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 6, padding: '4px 12px', color: accent.text, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.category}</span>
                <span style={{ background: '$rgba(11,13,15,0.04)', border: `1px solid ${T.lineLight}`, borderRadius: 6, padding: '4px 12px', color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{course.level}</span>
              </div>
              <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 16px' }}>{course.title}</h1>
              <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 560, margin: '0 0 28px' }}>{course.longDesc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', String(lessonCount)], ['Projects', String(projectCount)]].map(([l, v]) => (
                  <div key={l}>
                    <div className="skylent-label" style={{ color: C.slate, marginBottom: 4 }}>{l}</div>
                    <div style={{ color: C.ink, fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
                <MediaImage src={visual} alt={course.title} className="skylent-hero-visual" style={{ minHeight: 280 }} />
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'clamp(28px, 4vw, 48px)', alignItems: 'start' }} className="edu-grid">
          <div>
            <FadeIn>
              <GlassSurface level={2} padding="24px 28px" style={{ marginBottom: 24 }}>
                <Eyebrow  accent>Outcomes</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.ink, margin: '12px 0 20px' }}>What you will learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {course.outcomes.map(o => (
                    <div key={o} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, marginTop: 7, flexShrink: 0 }} />
                      <span style={{ color: C.slate, fontSize: 13, lineHeight: 1.55 }}>{o}</span>
                    </div>
                  ))}
                </div>
              </GlassSurface>
            </FadeIn>

            <FadeIn delay={60}>
              <GlassSurface level={2} padding="24px 28px" style={{ marginBottom: 24 }}>
                <Eyebrow >Curriculum</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.ink, margin: '12px 0 20px' }}>Modules and lessons</h2>
                {course.modules.map((mod, mi) => (
                  <div key={mod.id} style={{ borderBottom: mi < course.modules.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                      style={{ width: '100%', background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)' }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left' }}>
                        <span style={{ color: accent.text, fontFamily: 'var(--font-mono)', fontSize: 12, width: 28 }}>0{mi + 1}</span>
                        <span style={{ color: C.ink, fontSize: 15, fontWeight: 600 }}>{mod.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: C.slate, fontSize: 12 }}>{mod.lessons.length} lessons</span>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="C.slate" style={{ transform: expandedModule === mod.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M0 0l6 8 6-8z"/></svg>
                      </div>
                    </button>
                    {expandedModule === mod.id && (
                      <div style={{ paddingBottom: 14, paddingLeft: 42 }}>
                        {mod.lessons.map(lesson => (
                          <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: `1px solid ${T.lineLight}`, flexWrap: 'wrap' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: lesson.completed ? accent.primary : 'transparent', border: `1.5px solid ${lesson.completed ? accent.primary : C.slate}`, flexShrink: 0 }} />
                            <span style={{ color: lesson.completed ? C.slate : C.slate, fontSize: 13, flex: '1 1 160px' }}>{lesson.title}</span>
                            <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', background: '$rgba(11,13,15,0.04)', borderRadius: 4, padding: '2px 8px' }}>{lesson.type.toUpperCase()}</span>
                            {lesson.duration && <span style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{lesson.duration}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </GlassSurface>
            </FadeIn>

            <FadeIn delay={100}>
              <GlassSurface level={2} padding="24px 28px">
                <Eyebrow >Audience</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.ink, margin: '12px 0 16px' }}>Who this is for</h2>
                {course.forWhom.map(fw => (
                  <div key={fw} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${T.lineLight}` }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent.primary, marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: C.slate, fontSize: 14 }}>{fw}</span>
                  </div>
                ))}
              </GlassSurface>
            </FadeIn>
          </div>

          <div style={{ position: 'sticky', top: T.navH + 16 }}>
            <FadeIn>
              <GlassSurface level={2} padding="24px 28px">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.ink }}>₹{price.toLocaleString('en-IN')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: C.slate, textDecoration: 'line-through' }}>₹{originalPrice.toLocaleString('en-IN')}</span>
                  <span style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: 11, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-mono)' }}>{discount}% off</span>
                </div>
                <div style={{ color: C.slate, fontSize: 12, marginBottom: 20 }}>Including GST · Lifetime access</div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => { if (enrollable || !catalog.loading) setEnrollOpen(true) }}
                  style={{ width: '100%', marginBottom: 16, opacity: !enrollable && !catalog.loading ? 0.55 : 1 }}
                >
                  {enrollable ? 'Enroll now' : catalog.loading ? 'Checking availability…' : 'Enrollment unavailable'}
                </Button>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[['Duration', course.duration], ['Mode', course.mode], ['Lessons', `${lessonCount} lessons`], ['Projects', `${projectCount} projects`], ['Certificate', 'Skylent certificate']].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.lineLight}` }}>
                      <span style={{ color: C.slate, fontSize: 13 }}>{l}</span>
                      <span style={{ color: C.ink, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </Section>

      {enrollOpen && (
        <EnrollmentModal
          item={{ kind: 'course', slug: course.slug, title: course.title, price, enrollable }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      )}
    </PageShell>
  )
}
